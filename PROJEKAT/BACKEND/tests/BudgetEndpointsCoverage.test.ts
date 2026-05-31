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

describe("BudgetEndpoints dodatna pokrivenost", () => {
  let app: any;
  let consoleErrorSpy: jest.SpyInstance;

  const authService = {
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "user-1", roles: ["admin"] };
      next();
    }),
    requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    app = express();
    app.use(express.json());
    registerBudgetEndpoints(app, authService);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  test("GET /api/budzeti vraca budzete", async () => {
    mockBudgetService.getAllBudgets.mockResolvedValue([{ id: "b1" }]);

    const response = await request(app).get("/api/budzeti");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: "b1" }]);
  });

  test("GET /api/budzeti vraca 500 na gresku servisa", async () => {
    mockBudgetService.getAllBudgets.mockRejectedValue(new Error("db"));

    const response = await request(app).get("/api/budzeti");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Greska pri dohvatu budzeta." });
  });

  test("GET /api/budzeti/reference-data vraca podatke za formu", async () => {
    const data = { odjeli: [{ id: 1 }], kategorije: [{ id: 2 }], projekti: [] };
    mockBudgetService.getReferenceData.mockResolvedValue(data);

    const response = await request(app).get("/api/budzeti/reference-data");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(data);
  });

  test("GET /api/budzeti/reference-data vraca 500 na gresku", async () => {
    mockBudgetService.getReferenceData.mockRejectedValue(new Error("db"));

    const response = await request(app).get("/api/budzeti/reference-data");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Greska pri dohvatu podataka za formu." });
  });

  test("GET /api/budzeti/:id vraca budzet", async () => {
    mockBudgetService.getBudgetById.mockResolvedValue({ id: "b1", naziv: "Budzet" });

    const response = await request(app).get("/api/budzeti/b1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "b1", naziv: "Budzet" });
  });

  test("GET /api/budzeti/:id vraca 404 kada budzet ne postoji", async () => {
    mockBudgetService.getBudgetById.mockResolvedValue(null);

    const response = await request(app).get("/api/budzeti/missing");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("GET /api/budzeti/:id vraca 500 na gresku", async () => {
    mockBudgetService.getBudgetById.mockRejectedValue(new Error("db"));

    const response = await request(app).get("/api/budzeti/b1");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Greska pri dohvatu budzeta." });
  });

  test("GET /api/budzeti/:id/projekcija vraca projekciju", async () => {
    mockBudgetService.getBudgetProjection.mockResolvedValue({ budgetId: "b1", utilizationPercent: 50 });

    const response = await request(app).get("/api/budzeti/b1/projekcija");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ budgetId: "b1", utilizationPercent: 50 });
  });

  test("GET /api/budzeti/:id/projekcija vraca 404 za nepostojeci budzet", async () => {
    mockBudgetService.getBudgetProjection.mockRejectedValue(new Error("Budzet ne postoji."));

    const response = await request(app).get("/api/budzeti/b1/projekcija");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("GET /api/budzeti/:id/projekcija vraca 500 na neocekivanu gresku", async () => {
    mockBudgetService.getBudgetProjection.mockRejectedValue(new Error("timeout"));

    const response = await request(app).get("/api/budzeti/b1/projekcija");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Greska pri dohvatu projekcije budzeta." });
  });

  test("POST /api/budzeti kreira budzet", async () => {
    const payload = { naziv: "Plan", planiraniIznos: 1000 };
    mockBudgetService.createBudget.mockResolvedValue({ id: "b1", ...payload });

    const response = await request(app).post("/api/budzeti").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual({ id: "b1", ...payload });
    expect(mockBudgetService.createBudget).toHaveBeenCalledWith(payload, expect.objectContaining({ sub: "user-1" }));
  });

  test("POST /api/budzeti vraca servisnu poruku greske", async () => {
    mockBudgetService.createBudget.mockRejectedValue(new Error("Naziv budzeta je obavezan."));

    const response = await request(app).post("/api/budzeti").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Naziv budzeta je obavezan." });
  });

  test("POST /api/budzeti vraca genericku poruku bez error.message", async () => {
    mockBudgetService.createBudget.mockRejectedValue({});

    const response = await request(app).post("/api/budzeti").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Greska pri kreiranju budzeta." });
  });

  test("PUT /api/budzeti/:id azurira budzet", async () => {
    const payload = { naziv: "Plan 2" };
    mockBudgetService.updateBudget.mockResolvedValue({ id: "b1", ...payload });

    const response = await request(app).put("/api/budzeti/b1").send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "b1", ...payload });
    expect(mockBudgetService.updateBudget).toHaveBeenCalledWith("b1", payload, expect.objectContaining({ sub: "user-1" }));
  });

  test("PUT /api/budzeti/:id vraca servisnu poruku greske", async () => {
    mockBudgetService.updateBudget.mockRejectedValue(new Error("Budzet ne postoji."));

    const response = await request(app).put("/api/budzeti/b1").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("PUT /api/budzeti/:id vraca genericku poruku bez error.message", async () => {
    mockBudgetService.updateBudget.mockRejectedValue({});

    const response = await request(app).put("/api/budzeti/b1").send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Greska pri azuriranju budzeta." });
  });

  test("PATCH /api/budzeti/:id/status mijenja status", async () => {
    mockBudgetService.updateBudgetStatus.mockResolvedValue({ id: "b1", statusOdobrenja: "ODOBREN" });

    const response = await request(app).patch("/api/budzeti/b1/status").send({ statusOdobrenja: "ODOBREN" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "b1", statusOdobrenja: "ODOBREN" });
    expect(mockBudgetService.updateBudgetStatus).toHaveBeenCalledWith("b1", "ODOBREN", expect.objectContaining({ sub: "user-1" }));
  });

  test("PATCH /api/budzeti/:id/status vraca 404 za nepostojeci budzet", async () => {
    mockBudgetService.updateBudgetStatus.mockRejectedValue(new Error("Budzet ne postoji."));

    const response = await request(app).patch("/api/budzeti/b1/status").send({ statusOdobrenja: "ODOBREN" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("PATCH /api/budzeti/:id/status vraca servisnu validacijsku gresku", async () => {
    mockBudgetService.updateBudgetStatus.mockRejectedValue(new Error("Status budzeta mora biti ODOBREN ili ODBIJEN."));

    const response = await request(app).patch("/api/budzeti/b1/status").send({ statusOdobrenja: "X" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Status budzeta mora biti ODOBREN ili ODBIJEN." });
  });

  test("PATCH /api/budzeti/:id/status vraca genericku poruku bez error.message", async () => {
    mockBudgetService.updateBudgetStatus.mockRejectedValue({});

    const response = await request(app).patch("/api/budzeti/b1/status").send({ statusOdobrenja: "X" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ message: "Greska pri promjeni statusa budzeta." });
  });

  test("registruje RBAC role za pregled, izmjenu i odobravanje", async () => {
    mockBudgetService.getAllBudgets.mockResolvedValue([]);
    await request(app).get("/api/budzeti");

    expect(authService.requireRole).toHaveBeenCalledWith("admin", "glavni_racunovodja", "finansijski_direktor");
    expect(authService.requireRole).toHaveBeenCalledWith("admin", "glavni_racunovodja");
    expect(authService.requireRole).toHaveBeenCalledWith("admin", "finansijski_direktor");
  });
});
