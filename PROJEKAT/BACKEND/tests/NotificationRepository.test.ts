export {};

jest.mock("../DAL/ApDbContext/AppDB", () => ({
  db: { query: jest.fn() },
}));

const AppDB = require("../DAL/ApDbContext/AppDB");
const { NotificationRepository } = require("../DAL/Repositories/NotificationRepository");

describe("NotificationRepository internals and DB calls", () => {
  let repo: any;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new NotificationRepository();
  });

  test("mapNotification vraća null za falsy row", () => {
    expect((repo as any).mapNotification(null)).toBeNull();
  });

  test("mapNotification konvertuje procitano u boolean", () => {
    const row = { id: "n1", procitano: 1 };
    const mapped = (repo as any).mapNotification(row);
    expect(mapped.procitano).toBe(true);
  });

  test("createForUsers vraća prazan niz kada nema userId-ova", async () => {
    const result = await repo.createForUsers([], { naslov: "a", poruka: "b", prioritet: "LOW" });
    expect(result).toEqual([]);
  });

  test("getRecipientsForAnomalyNotifications poziva db i vraća redove", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ id: "u1", email: "e", ime: "I", prezime: "P" }] });
    const rows = await repo.getRecipientsForAnomalyNotifications();
    expect(rows).toEqual([{ id: "u1", email: "e", ime: "I", prezime: "P" }]);
    expect(AppDB.db.query).toHaveBeenCalled();
  });

  test("getUserIdFromAuth vraća null kada nema identifikatora", async () => {
    const res = await repo.getUserIdFromAuth({});
    expect(res).toBeNull();
  });

  test("getUserIdFromAuth ubacuje/povratni id i mapira ulogu na ADMINISTRATOR", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ id: "db-user-1" }] });
    const authUser = { sub: "sub1", name: "John Doe", roles: ["admin"] };
    const id = await repo.getUserIdFromAuth(authUser);
    expect(id).toBe("db-user-1");
    const calledArgs = AppDB.db.query.mock.calls[0][1];
    expect(calledArgs[3]).toBe("ADMINISTRATOR");
  });

  test("normalizeRole uklanja dijakritiku i formatira string", () => {
    const raw = "Šef-Računovodja  ";
    const normalized = (repo as any).normalizeRole(raw);
    expect(normalized).toBe("sef_racunovodja");
  });

  test("getAuthRoles podrzava roles kao string, array i resource_access objekt", () => {
    const authUser: any = {
      roles: "Manager",
      role: ["Operator"],
      realm_access: { roles: ["RealmRole"] },
      resource_access: { serviceX: { roles: ["ServiceRole"] } },
    };

    const roles = (repo as any).getAuthRoles(authUser);
    expect(roles).toEqual(expect.arrayContaining(["manager", "operator", "realmrole", "servicerole"]));
  });

  test("mapAuthRoleToDatabaseRole mape specificne uloge", () => {
    expect((repo as any).mapAuthRoleToDatabaseRole({ roles: ["administrator"] })).toBe("ADMINISTRATOR");
    expect((repo as any).mapAuthRoleToDatabaseRole({ roles: ["glavni_racunovodja"] })).toBe("GLAVNI_RACUNOVODJA");
    expect((repo as any).mapAuthRoleToDatabaseRole({ roles: ["finansijski_direktor"] })).toBe("FINANSIJSKI_DIREKTOR");
    expect((repo as any).mapAuthRoleToDatabaseRole({ roles: ["nepoznato"] })).toBe("ADMINISTRATIVNI_ZAPOSLENIK");
  });

  test("getUserIdFromAuth koristi email claim kada postoji i preferred_username fallback", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ id: "db-user-2" }] });
    const authUser = { email: "someone@example.com", preferred_username: "userX" };
    const id = await repo.getUserIdFromAuth(authUser);
    expect(id).toBe("db-user-2");
    const calledArgs = AppDB.db.query.mock.calls[0][1];
    expect(calledArgs[2]).toBe("someone@example.com");
  });

  test("createForUsers kreira notifikacije za vise korisnika i mapira procitano", async () => {
    AppDB.db.query.mockResolvedValueOnce({
      rows: [
        { id: "n1", naslov: "A", procitano: 0 },
        { id: "n2", naslov: "A", procitano: 1 },
      ],
    });

    const result = await repo.createForUsers(["u1", "u2"], {
      naslov: "A",
      poruka: "P",
      prioritet: "HIGH",
      tipNotifikacije: "DUPLI_TROSAK",
      povezaniTrosakId: "t1",
      akcijaStatus: "NOVO",
    });

    expect(result.map((row: any) => row.procitano)).toEqual([false, true]);
    expect(AppDB.db.query.mock.calls[0][0]).toContain("INSERT INTO notifikacije");
    expect(AppDB.db.query.mock.calls[0][1]).toEqual([
      "A",
      "P",
      "HIGH",
      "u1",
      "DUPLI_TROSAK",
      "t1",
      "NOVO",
      "A",
      "P",
      "HIGH",
      "u2",
      "DUPLI_TROSAK",
      "t1",
      "NOVO",
    ]);
  });

  test("createForUsers koristi default tip i null akcijske podatke", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ id: "n1", procitano: false }] });

    await repo.createForUsers(["u1"], { naslov: "A", poruka: "P", prioritet: "LOW" });

    expect(AppDB.db.query.mock.calls[0][1]).toEqual(["A", "P", "LOW", "u1", "AI_ANOMALIJA", null, null]);
  });

  test("createForUsersIfAbsent preskace korisnike koji vec imaju istu notifikaciju", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ korisnikId: "u1" }] });
    jest.spyOn(repo, "createForUsers").mockResolvedValue([{ id: "n2" }]);

    const result = await repo.createForUsersIfAbsent(["u1", "u2"], {
      naslov: "Izostao periodicni trosak: Internet (06.2026)",
      poruka: "Provjera.",
      prioritet: "MEDIUM",
      tipNotifikacije: "IZOSTAO_PERIODICNI_TROSAK",
    });

    expect(result).toEqual([{ id: "n2" }]);
    expect(repo.createForUsers).toHaveBeenCalledWith(
      ["u2"],
      expect.objectContaining({ tipNotifikacije: "IZOSTAO_PERIODICNI_TROSAK" })
    );
  });

  test("createForUsersIfAbsent ne pristupa bazi bez korisnika", async () => {
    await expect(repo.createForUsersIfAbsent([], { naslov: "A" })).resolves.toEqual([]);
    expect(AppDB.db.query).not.toHaveBeenCalled();
  });

  test("getByUserId vraca notifikacije korisnika", async () => {
    AppDB.db.query.mockResolvedValueOnce({
      rows: [
        { id: "n1", naslov: "A", procitano: false },
        { id: "n2", naslov: "B", procitano: true },
      ],
    });

    const result = await repo.getByUserId("u1");

    expect(result).toEqual([
      { id: "n1", naslov: "A", procitano: false },
      { id: "n2", naslov: "B", procitano: true },
    ]);
    expect(AppDB.db.query.mock.calls[0][1]).toEqual(["u1"]);
  });

  test("getUnreadCountByUserId vraca broj neprocitanih i fallback nulu", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ count: "4" }] });
    await expect(repo.getUnreadCountByUserId("u1")).resolves.toBe(4);

    AppDB.db.query.mockResolvedValueOnce({ rows: [] });
    await expect(repo.getUnreadCountByUserId("u1")).resolves.toBe(0);
  });

  test("markAsRead vraca azuriranu notifikaciju ili undefined", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ id: "n1", procitano: 1 }] });
    await expect(repo.markAsRead("n1", "u1")).resolves.toEqual({ id: "n1", procitano: true });
    expect(AppDB.db.query.mock.calls[0][1]).toEqual(["n1", "u1"]);

    AppDB.db.query.mockResolvedValueOnce({ rows: [] });
    await expect(repo.markAsRead("missing", "u1")).resolves.toBeUndefined();
  });

  test("markActionHandledByExpenseId oznacava povezane notifikacije", async () => {
    AppDB.db.query.mockResolvedValueOnce({
      rows: [
        { id: "n1", procitano: 1, akcijaStatus: "SACUVAN" },
        { id: "n2", procitano: 1, akcijaStatus: "SACUVAN" },
      ],
    });

    const result = await repo.markActionHandledByExpenseId("t1", "SACUVAN");

    expect(result).toEqual([
      { id: "n1", procitano: true, akcijaStatus: "SACUVAN" },
      { id: "n2", procitano: true, akcijaStatus: "SACUVAN" },
    ]);
    expect(AppDB.db.query.mock.calls[0][1]).toEqual(["t1", "SACUVAN"]);
  });

  test("getUserIdFromAuth koristi fallback email, given_name i null id fallback", async () => {
    AppDB.db.query.mockResolvedValueOnce({ rows: [{ id: "db-user-3" }] });
    const firstId = await repo.getUserIdFromAuth({ sub: "sub-123", preferred_username: "korisnik" });
    expect(firstId).toBe("db-user-3");
    expect(AppDB.db.query.mock.calls[0][1][0]).toBe("korisnik");
    expect(AppDB.db.query.mock.calls[0][1][2]).toBe("korisnik@keycloak.local");

    AppDB.db.query.mockResolvedValueOnce({ rows: [{ id: "db-user-4" }] });
    await repo.getUserIdFromAuth({
      email: "ime@example.com",
      given_name: "Ime",
      family_name: "Prezime",
      roles: ["finansijski_direktor"],
    });
    expect(AppDB.db.query.mock.calls[1][1][0]).toBe("Ime");
    expect(AppDB.db.query.mock.calls[1][1][1]).toBe("Prezime");
    expect(AppDB.db.query.mock.calls[1][1][3]).toBe("FINANSIJSKI_DIREKTOR");

    AppDB.db.query.mockResolvedValueOnce({ rows: [] });
    await expect(repo.getUserIdFromAuth({ email: "x@example.com" })).resolves.toBeNull();
  });
});
