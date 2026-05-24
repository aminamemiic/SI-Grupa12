export {};

describe("AppDB module behavior", () => {
  afterEach(() => {
    jest.resetModules();
  });

  test("baciti gresku kada DATABASE_URL nije definisan", () => {
    delete process.env.DATABASE_URL;
    delete process.env.NODE_ENV;
    jest.resetModules();
    const AppDB = require("../DAL/ApDbContext/AppDB");
    expect(() => AppDB.db).toThrow("DATABASE_URL nije definisan.");
  });

  test("vraca pool kada je DATABASE_URL definisan (mock)", () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost/db";
    jest.resetModules();
    const pg = require("pg");
    const originalPool = pg.Pool;
    const mockPool = jest.fn().mockImplementation((opts: any) => ({ query: jest.fn(), _opts: opts }));
    pg.Pool = mockPool as any;
    const AppDB = require("../DAL/ApDbContext/AppDB");
    const db = AppDB.db;
    expect(db).toBeDefined();
    expect(mockPool).toHaveBeenCalled();
    pg.Pool = originalPool;
  });

  test("u production modu postavlja ssl objekt", () => {
    process.env.DATABASE_URL = "postgres://user:pass@localhost/db";
    process.env.NODE_ENV = "production";
    jest.resetModules();
    const pg = require("pg");
    const originalPool = pg.Pool;
    const mockPool = jest.fn().mockImplementation((opts: any) => ({ query: jest.fn(), _opts: opts }));
    pg.Pool = mockPool as any;
    const AppDB = require("../DAL/ApDbContext/AppDB");
    // access to trigger creation
    void AppDB.db;
    const calledWith = mockPool.mock.calls[0][0];
    expect(calledWith).toHaveProperty("ssl");
    expect(calledWith.ssl).toEqual({ rejectUnauthorized: false });
    pg.Pool = originalPool;
    delete process.env.NODE_ENV;
  });
});
