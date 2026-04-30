const { db } = require("../ApDbContext/AppDB");

class ExpenseRepository {
  private mapExpense(row: any) {
    if (!row) {
      return row;
    }

    return {
      ...row,
      iznos: Number(row.iznos),
    };
  }

  async getAll() {
    const result = await db.query(`
      SELECT 
        t.id,
        t.naziv,
        t.iznos,
        t.datum,
        t.opis,
        t.status_validacije AS "statusValidacije",

        t.kategorija_id AS "kategorijaId",
        k.naziv AS kategorija,

        t.odjel_id AS "odjelId",
        o.naziv AS odjel,

        t.projekat_id AS "projekatId",
        p.naziv_projekta AS projekat,

        t.dobavljac_id AS "dobavljacId",
        d.naziv_firme AS dobavljac,

        t.valuta_id AS "valutaId",
        v.kod AS valuta,

        t.kreirao_korisnik_id AS "kreiraoKorisnikId"
      FROM troskovi t
      JOIN kategorije k ON k.id = t.kategorija_id
      JOIN odjeli o ON o.id = t.odjel_id
      JOIN valute v ON v.id = t.valuta_id
      LEFT JOIN projekti p ON p.id = t.projekat_id
      LEFT JOIN dobavljaci d ON d.id = t.dobavljac_id
      ORDER BY t.datum DESC, t.naziv ASC;
    `);

    return result.rows.map((row: any) => this.mapExpense(row));
  }

  async getReferenceData() {
    const result = await db.query(`
      SELECT
        COALESCE((SELECT json_agg(row_to_json(k)) FROM (SELECT id, naziv FROM kategorije ORDER BY naziv ASC) k), '[]'::json) AS kategorije,
        COALESCE((SELECT json_agg(row_to_json(o)) FROM (SELECT id, naziv FROM odjeli ORDER BY naziv ASC) o), '[]'::json) AS odjeli,
        COALESCE((SELECT json_agg(row_to_json(v)) FROM (SELECT id, kod FROM valute ORDER BY kod ASC) v), '[]'::json) AS valute,
        COALESCE((SELECT json_agg(row_to_json(p)) FROM (SELECT id, naziv_projekta FROM projekti ORDER BY naziv_projekta ASC) p), '[]'::json) AS projekti,
        COALESCE((SELECT json_agg(row_to_json(d)) FROM (SELECT id, naziv_firme FROM dobavljaci ORDER BY naziv_firme ASC) d), '[]'::json) AS dobavljaci;
    `);

    return result.rows[0];
  }

  async create(expense: any) {
    const kreiraoKorisnikId =
      expense.kreiraoKorisnikId || (await this.getDefaultCreatorId());

    if (!kreiraoKorisnikId) {
      throw new Error("Nije moguce kreirati trosak jer u bazi ne postoji korisnik.");
    }

    const result = await db.query(
      `
      INSERT INTO troskovi (
        naziv,
        iznos,
        datum,
        opis,
        kategorija_id,
        odjel_id,
        projekat_id,
        dobavljac_id,
        valuta_id,
        kreirao_korisnik_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING id;
      `,
      [
        expense.naziv,
        expense.iznos,
        expense.datum,
        expense.opis || null,
        expense.kategorijaId,
        expense.odjelId,
        expense.projekatId || null,
        expense.dobavljacId || null,
        expense.valutaId,
        kreiraoKorisnikId,
      ]
    );

    return this.getById(result.rows[0].id);
  }

  async getDefaultCreatorId() {
    const result = await db.query(`
      SELECT id
      FROM korisnici
      ORDER BY email ASC
      LIMIT 1;
    `);

    return result.rows[0]?.id || null;
  }

  async getById(id: string) {
    const result = await db.query(
      `
      SELECT 
        t.id,
        t.naziv,
        t.iznos,
        t.datum,
        t.opis,
        t.status_validacije AS "statusValidacije",

        t.kategorija_id AS "kategorijaId",
        k.naziv AS kategorija,

        t.odjel_id AS "odjelId",
        o.naziv AS odjel,

        t.projekat_id AS "projekatId",
        p.naziv_projekta AS projekat,

        t.dobavljac_id AS "dobavljacId",
        d.naziv_firme AS dobavljac,

        t.valuta_id AS "valutaId",
        v.kod AS valuta,

        t.kreirao_korisnik_id AS "kreiraoKorisnikId"
      FROM troskovi t
      JOIN kategorije k ON k.id = t.kategorija_id
      JOIN odjeli o ON o.id = t.odjel_id
      JOIN valute v ON v.id = t.valuta_id
      LEFT JOIN projekti p ON p.id = t.projekat_id
      LEFT JOIN dobavljaci d ON d.id = t.dobavljac_id
      WHERE t.id = $1;
      `,
      [id]
    );

    return this.mapExpense(result.rows[0]);
  }
}

module.exports = { ExpenseRepository };
