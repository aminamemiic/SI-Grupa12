export {};

const AppDB = require("../ApDbContext/AppDB");

class NotificationRepository {
  private mapNotification(row: any) {
    if (!row) {
      return row;
    }

    return {
      ...row,
      procitano: Boolean(row.procitano),
    };
  }

  async getRecipientsForAnomalyNotifications() {
    const result = await AppDB.db.query(`
      SELECT k.id, k.email, k.ime, k.prezime
      FROM korisnici k
      JOIN uloge u ON u.id = k.uloga_id
      WHERE k.status_naloga = 'AKTIVAN'
        AND u.naziv IN ('ADMINISTRATOR', 'GLAVNI_RACUNOVODJA')
      ORDER BY k.email ASC;
    `);

    return result.rows;
  }

  async createForUsers(userIds: string[], notification: any) {
    if (!userIds.length) {
      return [];
    }

    const values: any[] = [];
    const placeholders = userIds.map((userId, index) => {
      const offset = index * 7;
      values.push(
        notification.naslov,
        notification.poruka,
        notification.prioritet,
        userId,
        notification.tipNotifikacije || "AI_ANOMALIJA",
        notification.povezaniTrosakId || null,
        notification.akcijaStatus || null
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
    });

    const result = await AppDB.db.query(
      `
      INSERT INTO notifikacije (
        naslov,
        poruka,
        prioritet,
        korisnik_id,
        tip_notifikacije,
        povezani_trosak_id,
        akcija_status
      )
      VALUES ${placeholders.join(", ")}
      RETURNING
        id,
        naslov,
        poruka,
        prioritet,
        korisnik_id AS "korisnikId",
        tip_notifikacije AS "tipNotifikacije",
        povezani_trosak_id AS "povezaniTrosakId",
        akcija_status AS "akcijaStatus",
        procitano,
        vrijeme_kreiranja AS "vrijemeKreiranja";
      `,
      values
    );

    return result.rows.map((row: any) => this.mapNotification(row));
  }

  async createForUsersIfAbsent(userIds: string[], notification: any) {
    if (!userIds.length) {
      return [];
    }

    const notificationType = notification.tipNotifikacije || "AI_ANOMALIJA";
    const result = await AppDB.db.query(
      `
      SELECT korisnik_id::text AS "korisnikId"
      FROM notifikacije
      WHERE korisnik_id = ANY($1::uuid[])
        AND tip_notifikacije = $2
        AND naslov = $3;
      `,
      [userIds, notificationType, notification.naslov]
    );
    const existingUserIds = new Set(result.rows.map((row: any) => String(row.korisnikId)));
    const missingUserIds = userIds.filter((userId) => !existingUserIds.has(String(userId)));

    return this.createForUsers(missingUserIds, notification);
  }

  async getByUserId(userId: string) {
    const result = await AppDB.db.query(
      `
      SELECT
        id,
        naslov,
        poruka,
        prioritet,
        korisnik_id AS "korisnikId",
        tip_notifikacije AS "tipNotifikacije",
        povezani_trosak_id AS "povezaniTrosakId",
        akcija_status AS "akcijaStatus",
        procitano,
        vrijeme_kreiranja AS "vrijemeKreiranja"
      FROM notifikacije
      WHERE korisnik_id = $1
      ORDER BY vrijeme_kreiranja DESC;
      `,
      [userId]
    );

    return result.rows.map((row: any) => this.mapNotification(row));
  }

  async getAllNotifications() {
    const result = await AppDB.db.query(
      `
      SELECT
        id,
        naslov,
        poruka,
        prioritet,
        korisnik_id AS "korisnikId",
        tip_notifikacije AS "tipNotifikacije",
        povezani_trosak_id AS "povezaniTrosakId",
        akcija_status AS "akcijaStatus",
        procitano,
        vrijeme_kreiranja AS "vrijemeKreiranja"
      FROM notifikacije
      ORDER BY vrijeme_kreiranja DESC;
      `
    );

    return result.rows.map((row: any) => this.mapNotification(row));
  }

  async getUnreadCountByUserId(userId: string) {
    const result = await AppDB.db.query(
      "SELECT COUNT(*)::int AS count FROM notifikacije WHERE korisnik_id = $1 AND procitano = FALSE;",
      [userId]
    );

    return Number(result.rows[0]?.count || 0);
  }

  async getUnreadCount() {
    const result = await AppDB.db.query(
      "SELECT COUNT(*)::int AS count FROM notifikacije WHERE procitano = FALSE;"
    );

    return Number(result.rows[0]?.count || 0);
  }

  async markAsRead(id: string, userId: string) {
    const result = await AppDB.db.query(
      `
      UPDATE notifikacije
      SET procitano = TRUE
      WHERE id = $1 AND korisnik_id = $2
      RETURNING
        id,
        naslov,
        poruka,
        prioritet,
        korisnik_id AS "korisnikId",
        tip_notifikacije AS "tipNotifikacije",
        povezani_trosak_id AS "povezaniTrosakId",
        akcija_status AS "akcijaStatus",
        procitano,
        vrijeme_kreiranja AS "vrijemeKreiranja";
      `,
      [id, userId]
    );

    return this.mapNotification(result.rows[0]);
  }

  async markAsReadById(id: string) {
    const result = await AppDB.db.query(
      `
      UPDATE notifikacije
      SET procitano = TRUE
      WHERE id = $1
      RETURNING
        id,
        naslov,
        poruka,
        prioritet,
        korisnik_id AS "korisnikId",
        tip_notifikacije AS "tipNotifikacije",
        povezani_trosak_id AS "povezaniTrosakId",
        akcija_status AS "akcijaStatus",
        procitano,
        vrijeme_kreiranja AS "vrijemeKreiranja";
      `,
      [id]
    );

    return this.mapNotification(result.rows[0]);
  }

  async markActionHandledByExpenseId(expenseId: string, actionStatus: string) {
    const result = await AppDB.db.query(
      `
      UPDATE notifikacije
      SET procitano = TRUE,
          akcija_status = $2
      WHERE povezani_trosak_id = $1
      RETURNING
        id,
        naslov,
        poruka,
        prioritet,
        korisnik_id AS "korisnikId",
        tip_notifikacije AS "tipNotifikacije",
        povezani_trosak_id AS "povezaniTrosakId",
        akcija_status AS "akcijaStatus",
        procitano,
        vrijeme_kreiranja AS "vrijemeKreiranja";
      `,
      [expenseId, actionStatus]
    );

    return result.rows.map((row: any) => this.mapNotification(row));
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

  hasRole(authUser: any, role: string): boolean {
    return this.getAuthRoles(authUser).includes(this.normalizeRole(role));
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

  async getUserIdFromAuth(authUser: any) {
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

    const result = await AppDB.db.query(
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
}

module.exports = { NotificationRepository };
