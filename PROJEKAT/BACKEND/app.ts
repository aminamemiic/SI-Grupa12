require("dotenv").config();

const express = require("express");
const { Client } = require("pg");
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const { AuthService } = require("./BLL/Services/AuthService");
const { registerSessionEndpoints } = require("./PRESENTATION API/Endpoints/SessionEndpoints");
const { registerUserEndpoints } = require("./PRESENTATION API/Endpoints/UserEndpoints");
const { registerExpenseEndpoints } = require("./PRESENTATION API/Endpoints/ExpenseEndpoints");
const { registerIngestionEndpoints } = require("./PRESENTATION API/Endpoints/IngestionEndpoints");
const { registerBudgetEndpoints } = require("./PRESENTATION API/Endpoints/BudgetEndpoints");
const { registerDataOverviewEndpoints } = require("./PRESENTATION API/Endpoints/DataOverviewEndpoints");
const { registerReportEndpoints } = require("./PRESENTATION API/Endpoints/ReportEndpoints");
const { registerNotificationEndpoints } = require("./PRESENTATION API/Endpoints/NotificationEndpoints");
const { registerAIAnalysisEndpoints } = require("./PRESENTATION API/Endpoints/AIAnalysisEndpoints");


const PORT = Number(process.env.PORT) || 3000;
const KEYCLOAK_URL = process.env.KEYCLOAK_URL;
const KEYCLOAK_REALM = process.env.KEYCLOAK_REALM;
const KEYCLOAK_CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID || "public";
const KEYCLOAK_CLIENT_SECRET = process.env.KEYCLOAK_CLIENT_SECRET;
const JWT_ISSUER = process.env.JWT_ISSUER;
const JWT_AUDIENCE = process.env.JWT_AUDIENCE ;
const JWKS_URI = process.env.JWKS_URI;
const SESSION_SECRET = process.env.SESSION_SECRET;
const SESSION_COOKIE_NAME = "tim12.sid";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:4200";
const IS_PROD = process.env.NODE_ENV === "production";
const dbClientConfig = () => ({
  connectionString: process.env.DATABASE_URL,
  ssl: IS_PROD ? { rejectUnauthorized: false } : false,
});


const logsDir = path.resolve(__dirname, "logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logStream = fs.createWriteStream(path.join(logsDir, "app.log"), {
  flags: "a",
});

const writeLog = (level: string, message: string, error?: unknown) => {
  const timestamp = new Date().toISOString();
  const errorMessage = error instanceof Error ? ` | ${error.stack || error.message}` : "";
  logStream.write(`[${timestamp}] [${level}] ${message}${errorMessage}\n`);
};

async function ensureDockerServices() {
  if (IS_PROD || process.env.USE_DOCKER_DB !== "true") {
    return;
  }

  const composeFile = path.resolve(__dirname, "docker-compose.yml");

  try {
    execSync(`docker compose -f "${composeFile}" up -d`, {
      stdio: "inherit",
    });
  } catch (error) {
    writeLog("ERROR", "Ne mogu pokrenuti Docker Compose", error);
    throw error;                
  }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry(client: any, retries = 10, delayMs = 1000) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      await client.connect();
      return;
    } catch (error) {
      lastError = error;
      writeLog("WARN", `Baza nije spremna (pokušaj ${attempt}/${retries})...`);
      await delay(delayMs);
    }
  }

  throw lastError;
}

async function runMigrations() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nije definisan.");
  }

  const client = new Client(dbClientConfig());
  
  try {
    writeLog("INFO", "Povezujem se na bazu podataka...");
    await connectWithRetry(client);
    writeLog("INFO", "Konekcija na bazu uspješna.");

    const result = await client.query(
      "SELECT to_regclass('public.uloge') AS table_name"
    );

    if (result.rows[0]?.table_name) {
      writeLog("INFO", "Baza je već inicijalizovana. Skačem migracije.");
      return;
    }

    writeLog("INFO", "Izvršavam SQL migracije...");
    const sql = fs.readFileSync(
      path.resolve(__dirname, "migrations/001_initial_create.sql"), 
      "utf-8"
    );
    await client.query(sql);
    writeLog("INFO", "Migracije uspješno izvršene.");

  } catch (error) {
    writeLog("ERROR", "Greška pri migracijama", error);
    throw error;
  } finally {
    await client.end();
  }
}

async function ensureBaseData() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL nije definisan.");
  }

  const client = new Client(dbClientConfig());

  try {
    writeLog("INFO", "Provjeravam osnovne podatke za sifarnike...");
    await connectWithRetry(client);

    await client.query(`
      ALTER TABLE troskovi
      DROP CONSTRAINT IF EXISTS chk_status_validacije;

      ALTER TABLE troskovi
      ADD CONSTRAINT chk_status_validacije
      CHECK (status_validacije IN ('NA_CEKANJU', 'VALIDAN', 'POTENCIJALNI_DUPLIKAT', 'ANOMALIJA', 'ODBIJEN', 'ZAKLJUCAN'));

      CREATE TABLE IF NOT EXISTS uvoz_troskova (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        naziv_fajla VARCHAR(255),
        status VARCHAR(30) NOT NULL,
        ukupno_redova INTEGER NOT NULL DEFAULT 0,
        validnih_redova INTEGER NOT NULL DEFAULT 0,
        nevalidnih_redova INTEGER NOT NULL DEFAULT 0,
        upisanih_redova INTEGER NOT NULL DEFAULT 0,
        greske JSONB NOT NULL DEFAULT '[]'::jsonb,
        kreirao_email VARCHAR(255),
        vrijeme_uvoza TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT chk_uvoz_troskova_status
          CHECK (status IN ('USPJESAN', 'DJELIMICAN', 'NEUSPJESAN'))
      );

      CREATE TABLE IF NOT EXISTS ai_analize (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tip VARCHAR(50) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
        parametri JSONB NOT NULL DEFAULT '{}'::jsonb,
        rezultat JSONB,
        error_message TEXT,
        pokrenuto TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        zavrseno TIMESTAMP,

        CONSTRAINT chk_ai_analize_status
          CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'))
      );

      ALTER TABLE notifikacije
      ADD COLUMN IF NOT EXISTS tip_notifikacije VARCHAR(50) NOT NULL DEFAULT 'AI_ANOMALIJA',
      ADD COLUMN IF NOT EXISTS povezani_trosak_id UUID NULL,
      ADD COLUMN IF NOT EXISTS akcija_status VARCHAR(30) NULL;

      ALTER TABLE notifikacije
      DROP CONSTRAINT IF EXISTS fk_notifikacije_troskovi;

      ALTER TABLE notifikacije
      ADD CONSTRAINT fk_notifikacije_troskovi
      FOREIGN KEY (povezani_trosak_id) REFERENCES troskovi(id) ON DELETE SET NULL;

      ALTER TABLE notifikacije
      DROP CONSTRAINT IF EXISTS chk_notifikacije_akcija_status;

      ALTER TABLE notifikacije
      ADD CONSTRAINT chk_notifikacije_akcija_status
      CHECK (akcija_status IS NULL OR akcija_status IN ('SACUVAN', 'OBRISAN'));

      INSERT INTO uloge (naziv, opis) VALUES
      ('ADMINISTRATOR', 'Administrator sistema'),
      ('GLAVNI_RACUNOVODJA', 'Glavni racunovodja'),
      ('FINANSIJSKI_DIREKTOR', 'Finansijski direktor'),
      ('ADMINISTRATIVNI_ZAPOSLENIK', 'Administrativni zaposlenik')
      ON CONFLICT (naziv) DO NOTHING;

      INSERT INTO valute (kod, naziv) VALUES
      ('BAM', 'Konvertibilna marka'),
      ('EUR', 'Euro'),
      ('USD', 'Americki dolar')
      ON CONFLICT (kod) DO NOTHING;

      INSERT INTO kategorije (naziv, opis)
      SELECT naziv, opis
      FROM (
        VALUES
        ('Plate', 'Troskovi plata zaposlenih'),
        ('Oprema', 'Kupovina opreme'),
        ('Marketing', 'Marketing troskovi'),
        ('Putni troskovi', 'Troskovi sluzbenih putovanja'),
        ('Zakup', 'Troskovi zakupa prostora')
      ) AS seed(naziv, opis)
      WHERE NOT EXISTS (SELECT 1 FROM kategorije);

      INSERT INTO odjeli (naziv, sifra_odjela) VALUES
      ('Administracija', 'ADM'),
      ('Finansije', 'FIN'),
      ('IT', 'IT'),
      ('Marketing', 'MKT'),
      ('Nabavka', 'NAB'),
      ('Prodaja', 'PRO')
      ON CONFLICT (sifra_odjela) DO UPDATE
      SET naziv = EXCLUDED.naziv;
    `);

    writeLog("INFO", "Osnovni sifarnici su spremni.");
  } catch (error) {
    writeLog("ERROR", "Greska pri provjeri osnovnih podataka", error);
    throw error;
  } finally {
    await client.end();
  }
}

function startServer() {
  const app = express();
  const authService = new AuthService(
    {
      jwtIssuer: JWT_ISSUER,
      jwtAudience: JWT_AUDIENCE,
      jwksUri: JWKS_URI,
      keycloakUrl: KEYCLOAK_URL,
      keycloakRealm: KEYCLOAK_REALM,
      keycloakClientId: KEYCLOAK_CLIENT_ID,
      keycloakClientSecret: KEYCLOAK_CLIENT_SECRET,
    },
    writeLog
  );
  
  app.use(express.json());
  // CORS middleware — set headers on every response
  app.use((req: any, res: any, next: any) => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin === FRONTEND_ORIGIN) {
      res.setHeader("Access-Control-Allow-Origin", requestOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    }

    res.setHeader("Vary", "Origin");

    if (req.method === "OPTIONS") {
      return res.sendStatus(204);
    }

    next();
  });

  app.options(/.*/, (req: any, res: any) => {
    res.sendStatus(204);
  });
  app.use(cookieParser());
  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      secret: SESSION_SECRET || "default_local_secret_please_change_in_prod",
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? "none" : "lax",
        maxAge: 60 * 60 * 1000,
      },
    })
  );

  app.use((req: any, res: any, next: any) => {
    const startedAt = Date.now();

    res.on("finish", () => {
      writeLog("INFO", `${req.method} ${req.originalUrl} -> ${res.statusCode} (${Date.now() - startedAt}ms)`);
    });

    next();
  });

  app.get("/health", (_req: any, res: any) => {
    res.status(200).json({ status: "ok" });
  });

  registerSessionEndpoints(app, authService, writeLog, SESSION_COOKIE_NAME);
  registerExpenseEndpoints(app, authService, writeLog);
  registerBudgetEndpoints(app, authService, writeLog);
  registerDataOverviewEndpoints(app, authService, writeLog);
  registerReportEndpoints(app, authService, writeLog);
  registerIngestionEndpoints(app, authService, writeLog);
  registerNotificationEndpoints(app, authService, writeLog);
  registerUserEndpoints(app, authService);
  registerAIAnalysisEndpoints(app, authService, writeLog);

  app.listen(PORT, "0.0.0.0", () => {
    writeLog("INFO", `Backend aplikacija sluša na portu ${PORT}.`);
  });
}

async function main() {
  try {
    await ensureDockerServices();
    await runMigrations();
    await ensureBaseData();
    startServer();
  } catch (error) {
    writeLog("ERROR", "Ne mogu pokrenuti aplikaciju", error);
    process.exit(1);
  }
}

main();
