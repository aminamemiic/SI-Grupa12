export {};

const { db } = require("../ApDbContext/AppDB");

class CommentRepository {
  async getByExpenseId(expenseId: string) {
    const result = await db.query(
      `
      SELECT
        k.id,
        k.tekst,
        k.vrijeme_unosa AS "vrijemeUnosa",
        k.autor_id AS "autorId",
        kor.ime AS "autorIme",
        kor.prezime AS "autorPrezime"
      FROM komentari k
      JOIN korisnici kor ON kor.id = k.autor_id
      WHERE k.trosak_id = $1
      ORDER BY k.vrijeme_unosa ASC
      `,
      [expenseId]
    );

    return result.rows;
  }

  async create(expenseId: string, tekst: string, autorId: string) {
    const result = await db.query(
      `
      INSERT INTO komentari (tekst, autor_id, trosak_id)
      VALUES ($1, $2, $3)
      RETURNING
        id,
        tekst,
        vrijeme_unosa AS "vrijemeUnosa",
        autor_id AS "autorId"
      `,
      [tekst, autorId, expenseId]
    );

    const comment = result.rows[0];

    const autorResult = await db.query(
      "SELECT ime, prezime FROM korisnici WHERE id = $1",
      [autorId]
    );

    if (autorResult.rows[0]) {
      comment.autorIme = autorResult.rows[0].ime;
      comment.autorPrezime = autorResult.rows[0].prezime;
    }

    return comment;
  }

  async findOrCreateUserFromAuth(authUser: any) {
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

    const roles = this.getAuthRoles(authUser);
    let databaseRoleName = "ADMINISTRATIVNI_ZAPOSLENIK";
    if (roles.some((role: string) => role === "admin" || role === "administrator")) {
      databaseRoleName = "ADMINISTRATOR";
    } else if (roles.includes("glavni_racunovodja")) {
      databaseRoleName = "GLAVNI_RACUNOVODJA";
    } else if (roles.includes("finansijski_direktor")) {
      databaseRoleName = "FINANSIJSKI_DIREKTOR";
    }

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
      RETURNING id
      `,
      [ime, prezime, email, databaseRoleName]
    );

    return result.rows[0]?.id || null;
  }

  private getAuthRoles(authUser: any): string[] {
    const roleSet = new Set<string>();
    const addRole = (role: unknown) => {
      if (typeof role === "string" && role.trim()) {
        roleSet.add(
          role
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .trim()
            .replace(/[\s-]+/g, "_")
        );
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
}

module.exports = { CommentRepository };
