export {};



const express = require("express");
const request = require("supertest");

const mockExpenseService = {
  getAllExpenses: jest.fn(),
  getReferenceData: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
};

jest.mock("../BLL/Services/ExpenseService", () => ({
  ExpenseService: jest.fn().mockImplementation(() => mockExpenseService),
}));

const { registerExpenseEndpoints } = require("../PRESENTATION API/Endpoints/ExpenseEndpoints");

describe("ExpenseEndpoints – integracioni testovi", () => {
  let app: any;

  const authService = {
    verifyBearerToken: jest.fn((_req: any, _res: any, next: any) => next()),
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["admin"] };
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
    registerExpenseEndpoints(app, authService);
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/troskovi
  // ─────────────────────────────────────────────────────────────

  describe("GET /api/troskovi", () => {
    test("treba vratiti sve troškove s HTTP 200", async () => {
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

    test("treba vratiti praznu listu ako nema troškova", async () => {
      mockExpenseService.getAllExpenses.mockResolvedValue([]);

      const response = await request(app).get("/api/troskovi");

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    test("treba vratiti HTTP 500 ako servis baci grešku", async () => {
      mockExpenseService.getAllExpenses.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/troskovi");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Greška pri dohvatu troškova.",
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // GET /api/troskovi/reference-data
  // ─────────────────────────────────────────────────────────────

  describe("GET /api/troskovi/reference-data", () => {
    test("treba vratiti referentne podatke s HTTP 200", async () => {
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

    test("treba vratiti HTTP 500 ako servis baci grešku", async () => {
      mockExpenseService.getReferenceData.mockRejectedValue(
        new Error("Database error")
      );

      const response = await request(app).get("/api/troskovi/reference-data");

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        message: "Greška pri dohvatu referentnih podataka.",
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // POST /api/troskovi
  // ─────────────────────────────────────────────────────────────

  describe("POST /api/troskovi", () => {
    const validPayload = {
      naziv: "Kancelarijski materijal",
      iznos: 120,
      datum: "2026-04-30",
      kategorijaId: 1,
      odjelId: 2,
      valutaId: 1,
    };

    test("treba kreirati trošak i vratiti HTTP 201", async () => {
      const createdExpense = { id: 15, ...validPayload };
      mockExpenseService.createExpense.mockResolvedValue(createdExpense);

      const response = await request(app)
        .post("/api/troskovi")
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdExpense);
      expect(mockExpenseService.createExpense).toHaveBeenCalledWith(
        validPayload,
        expect.objectContaining({ sub: "test-user" })
      );
    });

    test("treba pozivati requireAuthentication middleware (RBAC)", async () => {
      mockExpenseService.createExpense.mockResolvedValue({ id: 1, ...validPayload });

      await request(app).post("/api/troskovi").send(validPayload);

      expect(authService.requireAuthentication).toHaveBeenCalled();
    });

    test("treba pozivati requireRole middleware s ispravnim rolama (RBAC)", async () => {
      mockExpenseService.createExpense.mockResolvedValue({ id: 1, ...validPayload });

      await request(app).post("/api/troskovi").send(validPayload);

      expect(authService.requireRole).toHaveBeenCalledWith(
        "admin",
        "administrativni_radnik",
        "administrativni_zaposlenik"
      );
    });

    test("treba vratiti HTTP 400 s porukom greške ako servis odbaci neispravne podatke", async () => {
      mockExpenseService.createExpense.mockRejectedValue(
        new Error("Naziv troška je obavezan.")
      );

      const response = await request(app)
        .post("/api/troskovi")
        .send({ naziv: "", iznos: -20 });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Naziv troška je obavezan.",
      });
    });

    test("treba vratiti generičku poruku ako greška nema message", async () => {
      mockExpenseService.createExpense.mockRejectedValue({});

      const response = await request(app)
        .post("/api/troskovi")
        .send(validPayload);

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Greška pri kreiranju troška.");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // PUT /api/troskovi/:id
  // ─────────────────────────────────────────────────────────────

  describe("PUT /api/troskovi/:id", () => {
    const validPayload = {
      naziv: "Ažurirani trošak",
      iznos: 200,
      datum: "2026-05-01",
      kategorijaId: 1,
      odjelId: 2,
      valutaId: 1,
    };

    test("treba ažurirati trošak i vratiti HTTP 200", async () => {
      const updated = { id: "1", ...validPayload };
      mockExpenseService.updateExpense.mockResolvedValue(updated);

      const response = await request(app)
        .put("/api/troskovi/1")
        .send(validPayload);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updated);
      expect(mockExpenseService.updateExpense).toHaveBeenCalledWith(
        "1",
        validPayload
      );
    });

    test("treba pozivati requireAuthentication middleware (RBAC)", async () => {
      mockExpenseService.updateExpense.mockResolvedValue({ id: "1", ...validPayload });

      await request(app).put("/api/troskovi/1").send(validPayload);

      expect(authService.requireAuthentication).toHaveBeenCalled();
    });

    test("treba pozivati requireRole middleware s ispravnim rolama (RBAC)", async () => {
      mockExpenseService.updateExpense.mockResolvedValue({ id: "1", ...validPayload });

      await request(app).put("/api/troskovi/1").send(validPayload);

      expect(authService.requireRole).toHaveBeenCalledWith(
        "admin",
        "administrativni_radnik",
        "administrativni_zaposlenik"
      );
    });

    test("treba vratiti HTTP 400 ako trošak ne postoji", async () => {
      mockExpenseService.updateExpense.mockRejectedValue(
        new Error("Trošak ne postoji.")
      );

      const response = await request(app)
        .put("/api/troskovi/99")
        .send(validPayload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Trošak ne postoji." });
    });

    test("treba vratiti HTTP 400 ako je trošak zaključan", async () => {
      mockExpenseService.updateExpense.mockRejectedValue(
        new Error("Zaključani troškovi se ne mogu mijenjati.")
      );

      const response = await request(app)
        .put("/api/troskovi/1")
        .send(validPayload);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Zaključani troškovi se ne mogu mijenjati.",
      });
    });
  });

  // ─────────────────────────────────────────────────────────────
  // DELETE /api/troskovi/:id
  // ─────────────────────────────────────────────────────────────

  describe("DELETE /api/troskovi/:id", () => {
    test("treba obrisati trošak i vratiti HTTP 204 bez tijela", async () => {
      mockExpenseService.deleteExpense.mockResolvedValue(undefined);

      const response = await request(app).delete("/api/troskovi/1");

      expect(response.status).toBe(204);
      expect(response.body).toEqual({});
      expect(mockExpenseService.deleteExpense).toHaveBeenCalledWith("1");
    });

    test("treba pozivati requireAuthentication middleware (RBAC)", async () => {
      mockExpenseService.deleteExpense.mockResolvedValue(undefined);

      await request(app).delete("/api/troskovi/1");

      expect(authService.requireAuthentication).toHaveBeenCalled();
    });

    test("treba pozivati requireRole middleware s ispravnim rolama (RBAC)", async () => {
      mockExpenseService.deleteExpense.mockResolvedValue(undefined);

      await request(app).delete("/api/troskovi/1");

      expect(authService.requireRole).toHaveBeenCalledWith(
        "admin",
        "administrativni_radnik",
        "administrativni_zaposlenik"
      );
    });

    test("treba vratiti HTTP 400 ako je trošak zaključan", async () => {
      mockExpenseService.deleteExpense.mockRejectedValue(
        new Error("Zaključani troškovi se ne mogu brisati.")
      );

      const response = await request(app).delete("/api/troskovi/1");

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        message: "Zaključani troškovi se ne mogu brisati.",
      });
    });

    test("treba vratiti generičku poruku ako greška nema message", async () => {
      mockExpenseService.deleteExpense.mockRejectedValue({});

      const response = await request(app).delete("/api/troskovi/1");

      expect(response.status).toBe(400);
      expect(response.body.message).toBe("Greška pri brisanju troška.");
    });
  });
});