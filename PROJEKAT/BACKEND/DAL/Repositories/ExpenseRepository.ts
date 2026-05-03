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

  async create(expense: any, authUser?: any) {
    const kreiraoKorisnikId =
      (authUser ? await this.findOrCreateUserFromAuth(authUser) : null) ||
      expense.kreiraoKorisnikId ||
      (await this.getDefaultCreatorId());

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

  private normalizeRole(role: string): string {
    return role
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_");
  }

  private getAuthRoles(authUser: any): string[] {
    const roleSet = new Set<string>();
    const addRole = (role: unknown) => {
      if (typeof role === "string" && role.trim()) {
        roleSet.add(this.normalizeRole(role));
      }
    };
    const addRoles = (roles: unknown) => {
      if (Array.isArray(roles)) {
        roles.forEach(addRole);
        return;
      }

      addRole(roles);
    };

    addRoles(authUser?.roles);
    addRoles(authUser?.role);
    addRoles(authUser?.realm_access?.roles);

    if (authUser?.resource_access && typeof authUser.resource_access === "object") {
      Object.values(authUser.resource_access).forEach((resource: any) => addRoles(resource?.roles));
    }

    return Array.from(roleSet);
  }

  private mapAuthRoleToDatabaseRole(authUser: any): string {
    const roles = this.getAuthRoles(authUser);

    if (roles.some((role) => role === "admin" || role === "administrator")) {
      return "ADMINISTRATOR";
    }

    if (roles.includes("glavni_racunovodja")) {
      return "GLAVNI_RACUNOVODJA";
    }

    if (roles.includes("finansijski_direktor")) {
      return "FINANSIJSKI_DIREKTOR";
    }

    return "ADMINISTRATIVNI_ZAPOSLENIK";
  }

  private async findOrCreateUserFromAuth(authUser: any) {
    const subject = typeof authUser?.sub === "string" ? authUser.sub : "";
    const username = typeof authUser?.preferred_username === "string" ? authUser.preferred_username : "";
    const emailClaim = typeof authUser?.email === "string" ? authUser.email : "";
    const fallbackId = username || subject;

    if (!emailClaim && !fallbackId) {
      return null;
    }

    const email = emailClaim || `${fallbackId}@keycloak.local`;
    const fullName = typeof authUser?.name === "string" ? authUser.name.trim() : "";
    const givenName = typeof authUser?.given_name === "string" ? authUser.given_name.trim() : "";
    const familyName = typeof authUser?.family_name === "string" ? authUser.family_name.trim() : "";
    const nameParts = fullName.split(/\s+/).filter(Boolean);
    const ime = givenName || nameParts[0] || username || "Keycloak";
    const prezime = familyName || nameParts.slice(1).join(" ") || "-";
    const databaseRoleName = this.mapAuthRoleToDatabaseRole(authUser);

    const result = await db.query(
      `
      WITH selected_role AS (
        SELECT id
        FROM uloge
        WHERE naziv = $4
        LIMIT 1
      )
      INSERT INTO korisnici (ime, prezime, email, password_hash, uloga_id, status_naloga)
      SELECT $1, $2, $3, 'KEYCLOAK_AUTH', selected_role.id, 'AKTIVAN'
      FROM selected_role
      ON CONFLICT (email) DO UPDATE
      SET
        ime = EXCLUDED.ime,
        prezime = EXCLUDED.prezime,
        uloga_id = EXCLUDED.uloga_id,
        status_naloga = 'AKTIVAN'
      RETURNING id;
      `,
      [ime, prezime, email, databaseRoleName]
    );

    return result.rows[0]?.id || null;
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

  async update(id: string, expense: any) {
    await db.query(
      `
      UPDATE troskovi
      SET 
        naziv = $1,
        iznos = $2,
        datum = $3,
        opis = $4,
        kategorija_id = $5,
        odjel_id = $6,
        projekat_id = $7,
        dobavljac_id = $8,
        valuta_id = $9
      WHERE id = $10;
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
        id,
      ]
    );

    return this.getById(id);
  }

  async delete(id: string) {
    await db.query("DELETE FROM troskovi WHERE id = $1;", [id]);
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
