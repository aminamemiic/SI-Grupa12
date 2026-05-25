export {};

const express = require("express");
const request = require("supertest");

const mockExpenseService = {
  getAllExpenses: jest.fn(),
  getReferenceData: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  suggestCategory: jest.fn(),
};

jest.mock("../BLL/Services/ExpenseService", () => ({
  ExpenseService: jest.fn().mockImplementation(() => mockExpenseService),
}));

const { registerExpenseEndpoints } = require("../PRESENTATION API/Endpoints/ExpenseEndpoints");

describe("Expense category suggestion endpoint", () => {
  let app: any;

  const authService = {
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["admin"] };
      next();
    }),
    requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerExpenseEndpoints(app, authService);
  });

  test("vraca AI prijedlog kategorije", async () => {
    const payload = {
      naziv: "Laptop Lenovo",
      opis: "Razvojna oprema",
      dobavljac: "IT Shop",
    };
    const suggestion = {
      categoryId: "kat-1",
      categoryName: "Oprema",
      confidence: 0.85,
      reason: "Laptop pripada opremi.",
    };

    mockExpenseService.suggestCategory.mockResolvedValue(suggestion);

    const response = await request(app)
      .post("/api/troskovi/category-suggestion")
      .send(payload);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(suggestion);
    expect(mockExpenseService.suggestCategory).toHaveBeenCalledWith(payload);
  });

  test("koristi isti RBAC guard kao rucni unos troska", async () => {
    mockExpenseService.suggestCategory.mockResolvedValue({
      categoryId: null,
      categoryName: null,
      confidence: 0,
      reason: "Nema prijedloga.",
    });

    await request(app)
      .post("/api/troskovi/category-suggestion")
      .send({ naziv: "Gorivo" });

    expect(authService.requireAuthentication).toHaveBeenCalled();
    expect(authService.requireRole).toHaveBeenCalledWith(
      "admin",
      "administrativni_radnik",
      "administrativni_zaposlenik"
    );
  });

  test("vraca HTTP 400 sa servisnom porukom greske", async () => {
    mockExpenseService.suggestCategory.mockRejectedValue(
      new Error("Naziv troska je obavezan za AI prijedlog kategorije.")
    );

    const response = await request(app)
      .post("/api/troskovi/category-suggestion")
      .send({ naziv: "" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Naziv troska je obavezan za AI prijedlog kategorije.",
    });
  });

  test("vraca genericku poruku kada greska nema message", async () => {
    mockExpenseService.suggestCategory.mockRejectedValue({});

    const response = await request(app)
      .post("/api/troskovi/category-suggestion")
      .send({ naziv: "Laptop" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Greska pri AI prijedlogu kategorije.",
    });
  });
});
