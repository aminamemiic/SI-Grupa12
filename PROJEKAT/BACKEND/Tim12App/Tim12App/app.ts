const dotenv = require("dotenv");
dotenv.config();

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");
const { Client } = require("pg");

const DB_INITIALIZED_FLAG = path.resolve(__dirname, ".database-initialized");

function startDockerDatabase() {
  if (process.env.USE_DOCKER_DB !== "true") {
    console.log("Docker baza nije uključena. Koristim DATABASE_URL iz .env.");
    return;
  }

  try {
    const projectRoot = path.resolve(__dirname);
    console.log("Pokrećem PostgreSQL Docker container...");

    execSync("docker compose up -d postgres", {
      cwd: projectRoot,
      stdio: "inherit",
    });

    console.log("PostgreSQL container je pokrenut.");
    console.log("Čekam da se baza pokrene (3 sekunde)...");
    
    // Jednostavniji sleep - koristi setInterval
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    // Sinkroni: čekaj 3 sekunde
    execSync(process.platform === "win32" ? "ping -n 4 127.0.0.1 >nul" : "sleep 3");

  } catch (error) {
    console.error("Greška pri pokretanju Docker containera:");
    throw error;
  }
}

async function runMigrations() {
  if (fs.existsSync(DB_INITIALIZED_FLAG)) {
    console.log("Baza je već inicijalizovana. Skačem inicijalizaciju.");
    return;
  }

  const client = new Client(process.env.DATABASE_URL);
  
  try {
    console.log("Povezujem se na bazu podataka...");
    await client.connect();
    
    console.log("Izvršavam SQL migracije...");
    const sqlFile = path.resolve(__dirname, "migrations/001_initial_create.sql");
    const sql = fs.readFileSync(sqlFile, "utf-8");
    
    await client.query(sql);
    
    console.log("✅ SQL migracije su uspješno izvršene!");
    
    fs.writeFileSync(DB_INITIALIZED_FLAG, "");
    console.log("✅ Baza je inicijalizovana!");

  } catch (error) {
    console.error("❌ Greška pri izvršavanju migracija:");
    throw error;
  } finally {
    await client.end();
  }
}

async function main() {
  try {
    startDockerDatabase();
    await runMigrations();
    console.log("✅ Backend aplikacija se pokreće...");
  } catch (error) {
    console.error("❌ Ne mogu pokrenuti aplikaciju:");
    process.exit(1);
  }
}

main();