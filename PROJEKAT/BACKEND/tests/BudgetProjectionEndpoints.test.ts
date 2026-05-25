export {};
const express = require("express");
const request = require("supertest");

const mockBudgetService = {
  getAllBudgets: jest.fn(),
  getBudgetById: jest.fn(),
  getReferenceData: jest.fn(),
  createBudget: jest.fn(),
  updateBudget: jest.fn(),
  updateBudgetStatus: jest.fn(),
  getBudgetProjection: jest.fn(),
};

jest.mock("../BLL/Services/BudgetService", () => ({
  BudgetService: jest.fn().mockImplementation(() => mockBudgetService),
}));

const { registerBudgetEndpoints } = require("../PRESENTATION API/Endpoints/BudgetEndpoints");

describe("GET /api/budzeti/:id/projekcija – integracioni testovi", () => {
  let app: any;

  const authService = {
    verifyBearerToken: jest.fn((_req: any, _res: any, next: any) => next()),
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["glavni_racunovodja"] };
      next();
    }),
    requireRole: jest.fn(
      () => (_req: any, _res: any, next: any) => next()
    ),
    refreshSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerBudgetEndpoints(app, authService);
  });

  // ─────────────────────────────────────────────────────────────
  // Uspješan dohvat projekcije
  // ─────────────────────────────────────────────────────────────

  test("treba vratiti projekciju budžeta s HTTP 200", async () => {
    const projection = {
      budgetId: "uuid-1",
      planiraniIznos: 100000,
      potrosenoPrijeOvogMjeseca: 34000,
      potrosenoUovomMjesecu: 8000,
      dnevnaBrzinaTrosenja: 333.33,
      projektovanaPotrosnjaZaMjesec: 10333.23,
      projektovanoKrajnjeStanje: 55666.77,
    };
    mockBudgetService.getBudgetProjection.mockResolvedValue(projection);

    const response = await request(app).get("/api/budzeti/uuid-1/projekcija");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(projection);
    expect(mockBudgetService.getBudgetProjection).toHaveBeenCalledWith("uuid-1");
  });

  test("treba vratiti sve ključeve projekcije u odgovoru", async () => {
    const projection = {
      budgetId: "uuid-2",
      planiraniIznos: 50000,
      potrosenoPrijeOvogMjeseca: 0,
      potrosenoUovomMjesecu: 0,
      dnevnaBrzinaTrosenja: 0,
      projektovanaPotrosnjaZaMjesec: 0,
      projektovanoKrajnjeStanje: 50000,
    };
    mockBudgetService.getBudgetProjection.mockResolvedValue(projection);

    const response = await request(app).get("/api/budzeti/uuid-2/projekcija");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("budgetId");
    expect(response.body).toHaveProperty("planiraniIznos");
    expect(response.body).toHaveProperty("potrosenoPrijeOvogMjeseca");
    expect(response.body).toHaveProperty("potrosenoUovomMjesecu");
    expect(response.body).toHaveProperty("dnevnaBrzinaTrosenja");
    expect(response.body).toHaveProperty("projektovanaPotrosnjaZaMjesec");
    expect(response.body).toHaveProperty("projektovanoKrajnjeStanje");
  });

  // ─────────────────────────────────────────────────────────────
  // Greške
  // ─────────────────────────────────────────────────────────────

  test("treba vratiti HTTP 404 ako budžet ne postoji", async () => {
    mockBudgetService.getBudgetProjection.mockRejectedValue(
      new Error("Budzet ne postoji.")
    );

    const response = await request(app).get("/api/budzeti/nepostojeci-id/projekcija");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("treba vratiti HTTP 500 za neočekivane greške servisa", async () => {
    mockBudgetService.getBudgetProjection.mockRejectedValue(
      new Error("Database connection lost")
    );

    const response = await request(app).get("/api/budzeti/uuid-1/projekcija");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Greska pri dohvatu projekcije budzeta." });
  });

  // ─────────────────────────────────────────────────────────────
  // RBAC – Autentifikacija i autorizacija
  // ─────────────────────────────────────────────────────────────

  test("treba pozivati requireAuthentication middleware", async () => {
    mockBudgetService.getBudgetProjection.mockResolvedValue({
      budgetId: "uuid-1",
      planiraniIznos: 10000,
      projektovanoKrajnjeStanje: 5000,
    });

    await request(app).get("/api/budzeti/uuid-1/projekcija");

    expect(authService.requireAuthentication).toHaveBeenCalled();
  });

  test("treba pozivati requireRole middleware sa ispravnim rolama (admin, glavni_racunovodja, finansijski_direktor)", async () => {
    mockBudgetService.getBudgetProjection.mockResolvedValue({
      budgetId: "uuid-1",
      planiraniIznos: 10000,
      projektovanoKrajnjeStanje: 5000,
    });

    await request(app).get("/api/budzeti/uuid-1/projekcija");

    expect(authService.requireRole).toHaveBeenCalledWith(
      "admin",
      "glavni_racunovodja",
      "finansijski_direktor"
    );
  });

  // ─────────────────────────────────────────────────────────────
  // Proslijeđivanje ispravnog ID-a iz URL parametra
  // ─────────────────────────────────────────────────────────────

  test("treba proslijediti ID iz URL parametra servisu", async () => {
    mockBudgetService.getBudgetProjection.mockResolvedValue({
      budgetId: "abc-def-123",
      planiraniIznos: 10000,
      projektovanoKrajnjeStanje: 5000,
    });

    await request(app).get("/api/budzeti/abc-def-123/projekcija");

    expect(mockBudgetService.getBudgetProjection).toHaveBeenCalledWith("abc-def-123");
  });
});
