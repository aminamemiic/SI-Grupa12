export {};
const express = require("express");
const request = require("supertest");

const mockExpenseService = {
  getAllExpenses: jest.fn(),
  getReferenceData: jest.fn(),
  createExpense: jest.fn(),
};

jest.mock("../BLL/Services/ExpenseService", () => ({
  ExpenseService: jest.fn().mockImplementation(() => mockExpenseService),
}));

const { registerExpenseEndpoints } = require("../PRESENTATION API/Endpoints/ExpenseEndpoints");

describe("ExpenseEndpoints", () => {
  let app: any;

  const authService = {
    verifyBearerToken: jest.fn((_req: any, _res: any, next: any) => next()),
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["admin"] };
      next();
    }),
    requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    refreshSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();

    app = express();
    app.use(express.json());

    registerExpenseEndpoints(app, authService);
  });

  test("GET /api/troskovi treba vratiti sve troškove", async () => {
    const expenses = [
      { id: 1, naziv: "Gorivo", iznos: 50 },
      { id: 2, naziv: "Internet", iznos: 80 },
    ];

    mockExpenseService.getAllExpenses.mockResolvedValue(expenses);

    const response = await request(app).get("/api/troskovi");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expenses);
    expect(mockExpenseService.getAllExpenses).toHaveBeenCalledTimes(1);
  });

  test("GET /api/troskovi treba vratiti 500 ako servis baci grešku", async () => {
    mockExpenseService.getAllExpenses.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/troskovi");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Greška pri dohvatu troškova.",
    });
  });

  test("GET /api/troskovi/reference-data treba vratiti referentne podatke", async () => {
    const referenceData = {
      kategorije: [{ id: 1, naziv: "Putni troškovi" }],
      odjeli: [{ id: 1, naziv: "Finansije" }],
      valute: [{ id: 1, oznaka: "BAM" }],
    };

    mockExpenseService.getReferenceData.mockResolvedValue(referenceData);

    const response = await request(app).get("/api/troskovi/reference-data");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(referenceData);
    expect(mockExpenseService.getReferenceData).toHaveBeenCalledTimes(1);
  });

  test("POST /api/troskovi treba kreirati trošak za autentifikovanog korisnika sa rolom", async () => {
    const payload = {
      naziv: "Kancelarijski materijal",
      iznos: 120,
      datum: "2026-04-30",
      kategorijaId: 1,
      odjelId: 2,
      valutaId: 1,
    };

    const createdExpense = {
      id: 15,
      ...payload,
    };

    mockExpenseService.createExpense.mockResolvedValue(createdExpense);

    const response = await request(app)
      .post("/api/troskovi")
      .send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(createdExpense);
    expect(mockExpenseService.createExpense).toHaveBeenCalledWith(payload);
    expect(authService.requireAuthentication).toHaveBeenCalled();
    expect(authService.requireRole).toHaveBeenCalledWith("admin", "administrativni_radnik");
  });

  test("POST /api/troskovi treba vratiti 400 ako servis odbije neispravne podatke", async () => {
    const payload = {
      naziv: "",
      iznos: -20,
      datum: "nije-datum",
    };

    mockExpenseService.createExpense.mockRejectedValue(
      new Error("Naziv troška je obavezan.")
    );

    const response = await request(app)
      .post("/api/troskovi")
      .send(payload);

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Naziv troška je obavezan.",
    });
  });
});