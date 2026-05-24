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
      WHERE t.status_validacije <> 'POTENCIJALNI_DUPLIKAT'
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

  async updateValidationStatus(id: string, statusValidacije: string) {
    await db.query(
      "UPDATE troskovi SET status_validacije = $1 WHERE id = $2;",
      [statusValidacije, id]
    );

    return this.getById(id);
  }

  async getBudgetContextForExpense(expense: any) {
    const budgetResult = await db.query(
      `
      SELECT
        b.id,
        b.naziv,
        b.planirani_iznos AS "planiraniIznos",
        COALESCE(SUM(t.iznos) FILTER (WHERE t.id <> $1), 0) AS "potrosenoPrijeTroska"
      FROM budzeti b
      JOIN budzet_kategorije bk ON bk.budzet_id = b.id
      LEFT JOIN troskovi t
        ON t.odjel_id = b.odjel_id
       AND t.kategorija_id = bk.kategorija_id
       AND t.datum BETWEEN b.datum_pocetka AND b.datum_zavrsetka
       AND t.status_validacije IN ('VALIDAN', 'ZAKLJUCAN')
      WHERE b.odjel_id = $2
        AND bk.kategorija_id = $3
        AND $4::date BETWEEN b.datum_pocetka AND b.datum_zavrsetka
        AND b.status_odobrenja = 'ODOBREN'
      GROUP BY b.id
      ORDER BY b.datum_pocetka DESC
      LIMIT 1;
      `,
      [expense.id, expense.odjelId, expense.kategorijaId, expense.datum]
    );

    return budgetResult.rows[0]
      ? {
          ...budgetResult.rows[0],
          planiraniIznos: Number(budgetResult.rows[0].planiraniIznos),
          potrosenoPrijeTroska: Number(budgetResult.rows[0].potrosenoPrijeTroska),
        }
      : null;
  }

  async createAnomaly(trosakId: string, analysis: any) {
    const primaryFinding = Array.isArray(analysis?.findings) && analysis.findings.length > 0
      ? analysis.findings[0]
      : null;
    const anomalyType = primaryFinding?.type || "AI_ANOMALY";
    const description = analysis?.explanation || primaryFinding?.message || "AI analiza je oznacila trosak kao anomaliju.";

    const result = await db.query(
      `
      INSERT INTO anomalije (tip_anomalije, opis_detekcije, trosak_id, status_potvrde)
      VALUES ($1, $2, $3, 'OTVORENA')
      RETURNING
        id,
        tip_anomalije AS "tipAnomalije",
        opis_detekcije AS "opisDetekcije",
        trosak_id AS "trosakId",
        status_potvrde AS "statusPotvrde";
      `,
      [anomalyType, description, trosakId]
    );

    return result.rows[0];
  }

  async getAiAnalysisContext(expense: any) {
    const historicalResult = await db.query(
      `
      SELECT
        id,
        naziv,
        iznos,
        datum,
        kategorija_id AS "kategorijaId",
        odjel_id AS "odjelId",
        dobavljac_id AS "dobavljacId"
      FROM troskovi
      WHERE id <> $1
        AND kategorija_id = $2
        AND odjel_id = $3
        AND datum >= ($4::date - INTERVAL '12 months')
      ORDER BY datum DESC
      LIMIT 100;
      `,
      [expense.id, expense.kategorijaId, expense.odjelId, expense.datum]
    );

    const duplicateResult = await db.query(
      `
      SELECT id, naziv, iznos, datum
      FROM troskovi
      WHERE id <> $1
        AND LOWER(TRIM(naziv)) = LOWER(TRIM($2))
        AND iznos = $3
        AND datum = $4
      LIMIT 10;
      `,
      [expense.id, expense.naziv, expense.iznos, expense.datum]
    );

    const budgetResult = await db.query(
      `
      SELECT
        b.id,
        b.naziv,
        b.planirani_iznos AS "planiraniIznos",
        COALESCE(SUM(t.iznos) FILTER (WHERE t.id <> $1), 0) AS "potrosenoPrijeTroska"
      FROM budzeti b
      JOIN budzet_kategorije bk ON bk.budzet_id = b.id
      LEFT JOIN troskovi t
        ON t.odjel_id = b.odjel_id
       AND t.kategorija_id = bk.kategorija_id
       AND t.datum BETWEEN b.datum_pocetka AND b.datum_zavrsetka
       AND t.status_validacije IN ('VALIDAN', 'ZAKLJUCAN')
      WHERE b.odjel_id = $2
        AND bk.kategorija_id = $3
        AND $4::date BETWEEN b.datum_pocetka AND b.datum_zavrsetka
        AND b.status_odobrenja = 'ODOBREN'
      GROUP BY b.id
      ORDER BY b.datum_pocetka DESC
      LIMIT 1;
      `,
      [expense.id, expense.odjelId, expense.kategorijaId, expense.datum]
    );

    const budget = budgetResult.rows[0]
      ? {
          ...budgetResult.rows[0],
          planiraniIznos: Number(budgetResult.rows[0].planiraniIznos),
          potrosenoPrijeTroska: Number(budgetResult.rows[0].potrosenoPrijeTroska),
        }
      : null;

    return {
      historicalExpenses: historicalResult.rows.map((row: any) => ({ ...row, iznos: Number(row.iznos) })),
      duplicateCandidates: duplicateResult.rows.map((row: any) => ({ ...row, iznos: Number(row.iznos) })),
      budget,
    };
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
