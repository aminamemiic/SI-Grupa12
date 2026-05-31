const { db } = require("../ApDbContext/AppDB");

class BudgetRepository {
  private mapBudget(row: any) {
    if (!row) return row;

    return {
      ...row,
      planiraniIznos: Number(row.planiraniIznos),
      verzijaBudzeta: Number(row.verzijaBudzeta),
      kategorije: row.kategorije || [],
      kategorijaIds: row.kategorijaIds || [],
    };
  }

  private mapComment(row: any) {
    if (!row) {
      return row;
    }

    return {
      ...row,
      budzetId: row.budzetId || row.budzet_id,
      autorId: row.autorId || row.autor_id,
      autorIme: row.autorIme || row.autor_ime,
      komentar: row.komentar,
      tip: row.tip,
      kreiranoAt: row.kreiranoAt || row.kreirano_at,
    };
  }

  async getAll() {
    const result = await db.query(`
      SELECT
        b.id,
        b.naziv,
        b.planirani_iznos AS "planiraniIznos",
        b.datum_pocetka AS "datumPocetka",
        b.datum_zavrsetka AS "datumZavrsetka",
        b.odjel_id AS "odjelId",
        o.naziv AS odjel,
        b.projekat_id AS "projekatId",
        p.naziv_projekta AS projekat,
        b.verzija_budzeta AS "verzijaBudzeta",
        b.status_odobrenja AS "statusOdobrenja",
        b.odobrio_korisnik_id AS "odobrioKorisnikId",
        b.kreirao_korisnik_id AS "kreiraoKorisnikId",
        COALESCE(json_agg(k.naziv ORDER BY k.naziv) FILTER (WHERE k.id IS NOT NULL), '[]'::json) AS kategorije,
        COALESCE(json_agg(k.id ORDER BY k.naziv) FILTER (WHERE k.id IS NOT NULL), '[]'::json) AS "kategorijaIds"
      FROM budzeti b
      JOIN odjeli o ON o.id = b.odjel_id
      LEFT JOIN projekti p ON p.id = b.projekat_id
      LEFT JOIN budzet_kategorije bk ON bk.budzet_id = b.id
      LEFT JOIN kategorije k ON k.id = bk.kategorija_id
      GROUP BY b.id, o.naziv, p.naziv_projekta
      ORDER BY b.datum_pocetka DESC, b.naziv ASC;
    `);

    return result.rows.map((row: any) => this.mapBudget(row));
  }

  async getById(id: string) {
    const result = await db.query(
      `
      SELECT
        b.id,
        b.naziv,
        b.planirani_iznos AS "planiraniIznos",
        b.datum_pocetka AS "datumPocetka",
        b.datum_zavrsetka AS "datumZavrsetka",
        b.odjel_id AS "odjelId",
        o.naziv AS odjel,
        b.projekat_id AS "projekatId",
        p.naziv_projekta AS projekat,
        b.verzija_budzeta AS "verzijaBudzeta",
        b.status_odobrenja AS "statusOdobrenja",
        b.odobrio_korisnik_id AS "odobrioKorisnikId",
        b.kreirao_korisnik_id AS "kreiraoKorisnikId",
        COALESCE(json_agg(k.naziv ORDER BY k.naziv) FILTER (WHERE k.id IS NOT NULL), '[]'::json) AS kategorije,
        COALESCE(json_agg(k.id ORDER BY k.naziv) FILTER (WHERE k.id IS NOT NULL), '[]'::json) AS "kategorijaIds"
      FROM budzeti b
      JOIN odjeli o ON o.id = b.odjel_id
      LEFT JOIN projekti p ON p.id = b.projekat_id
      LEFT JOIN budzet_kategorije bk ON bk.budzet_id = b.id
      LEFT JOIN kategorije k ON k.id = bk.kategorija_id
      WHERE b.id = $1
      GROUP BY b.id, o.naziv, p.naziv_projekta;
      `,
      [id]
    );

    return this.mapBudget(result.rows[0]);
  }

  async getReferenceData() {
    const result = await db.query(`
      SELECT
        COALESCE((SELECT json_agg(row_to_json(k)) FROM (SELECT id, naziv FROM kategorije ORDER BY naziv ASC) k), '[]'::json) AS kategorije,
        COALESCE((SELECT json_agg(row_to_json(o)) FROM (SELECT id, naziv FROM odjeli ORDER BY naziv ASC) o), '[]'::json) AS odjeli,
        COALESCE((SELECT json_agg(row_to_json(p)) FROM (SELECT id, naziv_projekta FROM projekti ORDER BY naziv_projekta ASC) p), '[]'::json) AS projekti;
    `);

    return result.rows[0];
  }

  async existsDuplicate(budget: any, excludeId?: string) {
    const result = await db.query(
      `
      SELECT b.id
      FROM budzeti b
      JOIN budzet_kategorije bk ON bk.budzet_id = b.id
      WHERE b.odjel_id = $1
        AND b.datum_pocetka = $2
        AND b.datum_zavrsetka = $3
        AND bk.kategorija_id = ANY($4::uuid[])
        AND ($5::uuid IS NULL OR b.id <> $5::uuid)
      LIMIT 1;
      `,
      [
        budget.odjelId,
        budget.datumPocetka,
        budget.datumZavrsetka,
        budget.kategorijaIds,
        excludeId || null,
      ]
    );

    return result.rowCount > 0;
  }

  async create(budget: any, createdById?: string | null) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO budzeti (
          naziv,
          planirani_iznos,
          datum_pocetka,
          datum_zavrsetka,
          odjel_id,
          projekat_id,
          kreirao_korisnik_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id;
        `,
        [
          budget.naziv,
          budget.planiraniIznos,
          budget.datumPocetka,
          budget.datumZavrsetka,
          budget.odjelId,
          budget.projekatId || null,
          createdById || null,
        ]
      );

      const budgetId = result.rows[0].id;
      await this.replaceCategories(client, budgetId, budget.kategorijaIds);
      await client.query("COMMIT");

      return this.getById(budgetId);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async update(id: string, budget: any) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const updateResult = await client.query(
        `
        UPDATE budzeti
        SET
          naziv = $1,
          planirani_iznos = $2,
          datum_pocetka = $3,
          datum_zavrsetka = $4,
          odjel_id = $5,
          projekat_id = $6,
          verzija_budzeta = verzija_budzeta + 1
        WHERE id = $7;
        `,
        [
          budget.naziv,
          budget.planiraniIznos,
          budget.datumPocetka,
          budget.datumZavrsetka,
          budget.odjelId,
          budget.projekatId || null,
          id,
        ]
      );

      if (updateResult.rowCount === 0) {
        throw new Error("Budzet ne postoji.");
      }

      await this.replaceCategories(client, id, budget.kategorijaIds);
      await client.query("COMMIT");

      return this.getById(id);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async updateStatus(id: string, statusOdobrenja: string, odobrioKorisnikId: string | null) {
    const result = await db.query(
      `
      UPDATE budzeti
      SET
        status_odobrenja = $1,
        odobrio_korisnik_id = $2
      WHERE id = $3
      RETURNING id;
      `,
      [statusOdobrenja, odobrioKorisnikId, id]
    );

    if (result.rowCount === 0) {
      throw new Error("Budzet ne postoji.");
    }

    return this.getById(id);
  }

  async vratiNaDoradu(budzetId: number | string, autorId: string, autorIme: string, komentar: string) {
    const client = await db.connect();

    try {
      await client.query("BEGIN");

      const updateResult = await client.query(
        `
        UPDATE budzeti
        SET
          status_odobrenja = $1,
          odobrio_korisnik_id = $2
        WHERE id = $3
        RETURNING id;
        `,
        ["na_doradi", autorId, budzetId]
      );

      if (updateResult.rowCount === 0) {
        throw new Error("Budzet ne postoji.");
      }

      await client.query(
        `
        INSERT INTO budzet_komentari (
          budzet_id,
          autor_id,
          autor_ime,
          komentar,
          tip
        )
        VALUES ($1, $2, $3, $4, $5);
        `,
        [budzetId, autorId, autorIme, komentar, "povrat_na_doradu"]
      );

      await client.query("COMMIT");

      return this.getById(String(budzetId));
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  async getKomentari(budzetId: number | string) {
    const result = await db.query(
      `
      SELECT
        id,
        budzet_id AS "budzetId",
        autor_id AS "autorId",
        autor_ime AS "autorIme",
        komentar,
        tip,
        kreirano_at AS "kreiranoAt"
      FROM budzet_komentari
      WHERE budzet_id = $1
      ORDER BY kreirano_at DESC, id DESC;
      `,
      [budzetId]
    );

    return result.rows.map((row: any) => this.mapComment(row));
  }

  async dodajKomentar(
    budzetId: number | string,
    autorId: string,
    autorIme: string,
    komentar: string,
    tip: string
  ) {
    const result = await db.query(
      `
      INSERT INTO budzet_komentari (
        budzet_id,
        autor_id,
        autor_ime,
        komentar,
        tip
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING
        id,
        budzet_id AS "budzetId",
        autor_id AS "autorId",
        autor_ime AS "autorIme",
        komentar,
        tip,
        kreirano_at AS "kreiranoAt";
      `,
      [budzetId, autorId, autorIme, komentar, tip]
    );

    return this.mapComment(result.rows[0]);
  }

  private async replaceCategories(client: any, budgetId: string, categoryIds: string[]) {
    await client.query("DELETE FROM budzet_kategorije WHERE budzet_id = $1;", [budgetId]);

    for (const categoryId of categoryIds) {
      await client.query(
        "INSERT INTO budzet_kategorije (budzet_id, kategorija_id) VALUES ($1, $2);",
        [budgetId, categoryId]
      );
    }
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
      Object.values(authUser.resource_access).forEach((resource: any) =>
        addRoles(resource?.roles)
      );
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
    const username =
      typeof authUser?.preferred_username === "string"
        ? authUser.preferred_username
        : "";
    const emailClaim = typeof authUser?.email === "string" ? authUser.email : "";
    const fallbackId = username || subject;

    if (!emailClaim && !fallbackId) {
      return null;
    }

    const email = emailClaim || `${fallbackId}@keycloak.local`;
    const fullName = typeof authUser?.name === "string" ? authUser.name.trim() : "";
    const givenName =
      typeof authUser?.given_name === "string" ? authUser.given_name.trim() : "";
    const familyName =
      typeof authUser?.family_name === "string" ? authUser.family_name.trim() : "";

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

  async getUserIdFromAuth(authUser: any) {
    return this.findOrCreateUserFromAuth(authUser);
  }

  async getBudgetSpentStats(budgetId: string) {
    const result = await db.query(
      `
      SELECT
        b.id,
        b.planirani_iznos AS "planiraniIznos",
        COALESCE(SUM(t.iznos) FILTER (
          WHERE t.datum < date_trunc('month', CURRENT_DATE)
        ), 0) AS "potrosenoPrijeOvogMjeseca",
        COALESCE(SUM(t.iznos) FILTER (
          WHERE t.datum >= date_trunc('month', CURRENT_DATE)
            AND t.datum <= CURRENT_DATE
        ), 0) AS "potrosenoUovomMjesecu"
      FROM budzeti b
      LEFT JOIN budzet_kategorije bk ON bk.budzet_id = b.id
      LEFT JOIN troskovi t
        ON t.odjel_id = b.odjel_id
       AND t.kategorija_id = bk.kategorija_id
       AND t.datum >= b.datum_pocetka
       AND t.datum <= b.datum_zavrsetka
       AND t.status_validacije != 'ODBIJEN'
      WHERE b.id = $1
      GROUP BY b.id;
      `,
      [budgetId]
    );

    if (result.rowCount === 0) {
      throw new Error("Budzet ne postoji.");
    }

    const row = result.rows[0];
    return {
      planiraniIznos: Number(row.planiraniIznos),
      potrosenoPrijeOvogMjeseca: Number(row.potrosenoPrijeOvogMjeseca),
      potrosenoUovomMjesecu: Number(row.potrosenoUovomMjesecu),
    };
  }
}

module.exports = { BudgetRepository };
