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

const PORT = Number(process.env.PORT);
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
  if (process.env.USE_DOCKER_DB !== "true") {
    return;
  }

  const composeFile = path.resolve(__dirname, "..", "docker-compose.yml");

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

  const client = new Client({ connectionString: process.env.DATABASE_URL });
  
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
  app.use((req: any, res: any, next: any) => {
    const requestOrigin = req.headers.origin;

    if (requestOrigin === FRONTEND_ORIGIN) {
      res.header("Access-Control-Allow-Origin", requestOrigin);
      res.header("Access-Control-Allow-Credentials", "true");
      res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
      res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
    }

    res.header("Vary", "Origin");

    if (req.method === "OPTIONS") {
      res.sendStatus(204);
      return;
    }

    next();
  });
  app.use(cookieParser());
  app.use(
    session({
      name: SESSION_COOKIE_NAME,
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 1000,
      },
    })
  );

  app.get("/health", (_req: any, res: any) => {
    res.status(200).json({ status: "ok" });
  });

  registerSessionEndpoints(app, authService, writeLog, SESSION_COOKIE_NAME);
  registerExpenseEndpoints(app, writeLog);
  registerUserEndpoints(app, authService);

  app.listen(PORT, "0.0.0.0", () => {
    writeLog("INFO", `Backend aplikacija sluša na portu ${PORT}.`);
  });
}

async function main() {
  try {
    await ensureDockerServices();
    await runMigrations();
    startServer();
  } catch (error) {
    writeLog("ERROR", "Ne mogu pokrenuti aplikaciju", error);
    process.exit(1);
  }
}

main();
