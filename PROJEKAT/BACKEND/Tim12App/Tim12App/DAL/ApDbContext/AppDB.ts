const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL nije definisan u .env fajlu.");
}

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

module.exports = { db };