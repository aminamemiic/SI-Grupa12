const { db } = require("../DAL/ApDbContext/AppDB");

async function testConnection() {
  try {
    const result = await db.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);

    console.log("Baza je uspješno spojena!");
    console.log("Tabele u Supabase bazi:");
    console.table(result.rows);
  } catch (error) {
    console.error("Greška pri spajanju na bazu:");
    console.error(error);
  } finally {
    await db.end();
  }
}

testConnection();