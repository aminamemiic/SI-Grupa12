const { db } = require("../ApDbContext/AppDB");

class IngestionRepository {
  async ensureImportHistoryTable() {
    await db.query(`
      CREATE TABLE IF NOT EXISTS uvoz_troskova (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        naziv_fajla VARCHAR(255),
        status VARCHAR(30) NOT NULL,
        ukupno_redova INTEGER NOT NULL DEFAULT 0,
        validnih_redova INTEGER NOT NULL DEFAULT 0,
        nevalidnih_redova INTEGER NOT NULL DEFAULT 0,
        upisanih_redova INTEGER NOT NULL DEFAULT 0,
        greske JSONB NOT NULL DEFAULT '[]'::jsonb,
        uvezeni_zapisi JSONB NOT NULL DEFAULT '[]'::jsonb,
        kreirao_email VARCHAR(255),
        vrijeme_uvoza TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT chk_uvoz_troskova_status
          CHECK (status IN ('USPJESAN', 'DJELIMICAN', 'NEUSPJESAN'))
      );
    `);

    await db.query(`
      ALTER TABLE uvoz_troskova
      ADD COLUMN IF NOT EXISTS uvezeni_zapisi JSONB NOT NULL DEFAULT '[]'::jsonb;
    `);
  }

  async createHistoryEntry(entry: any) {
    await this.ensureImportHistoryTable();

    const result = await db.query(
      `
      INSERT INTO uvoz_troskova (
        naziv_fajla,
        status,
        ukupno_redova,
        validnih_redova,
        nevalidnih_redova,
        upisanih_redova,
        greske,
        uvezeni_zapisi,
        kreirao_email
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, $9)
      RETURNING id;
      `,
      [
        entry.fileName || null,
        entry.status,
        entry.totalRows || 0,
        entry.validRows || 0,
        entry.invalidRows || 0,
        entry.insertedCount || 0,
        JSON.stringify(entry.errors || []),
        JSON.stringify(entry.importedRows || []),
        entry.createdByEmail || null,
      ]
    );

    return result.rows[0]?.id || null;
  }

  async getHistory() {
    await this.ensureImportHistoryTable();

    const result = await db.query(`
      SELECT
        id,
        naziv_fajla AS "fileName",
        status,
        ukupno_redova AS "totalRows",
        validnih_redova AS "validRows",
        nevalidnih_redova AS "invalidRows",
        upisanih_redova AS "insertedCount",
        greske AS errors,
        uvezeni_zapisi AS "importedRows",
        kreirao_email AS "createdByEmail",
        vrijeme_uvoza AS "createdAt"
      FROM uvoz_troskova
      ORDER BY vrijeme_uvoza DESC;
    `);

    return result.rows;
  }
}

module.exports = { IngestionRepository };
