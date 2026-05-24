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
});
