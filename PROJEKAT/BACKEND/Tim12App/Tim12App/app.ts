const dotenv = require("dotenv");
dotenv.config();

const { execSync } = require("child_process");
const path = require("path");

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
  } catch (error) {
    console.error("Greška pri pokretanju Docker containera.");
    console.error("Provjeri da li je Docker Desktop pokrenut.");
    throw error;
  }
}

startDockerDatabase();

console.log("Backend aplikacija se pokreće...");