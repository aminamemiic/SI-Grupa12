const { Pool } = require("pg");

let _db: any = null;

function getDb() {
  if (!_db) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL nije definisan.");
    }
    const isProduction = process.env.NODE_ENV === "production";
    _db = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: isProduction ? { rejectUnauthorized: false } : false,
    });
  }
  return _db;
}

module.exports = { get db() { return getDb(); } };