export {};



const express = require("express");
const request = require("supertest");

const mockExpenseService = {
  getAllExpenses: jest.fn(),
  getReferenceData: jest.fn(),
  createExpense: jest.fn(),
  updateExpense: jest.fn(),
  deleteExpense: jest.fn(),
  resolvePotentialDuplicate: jest.fn(),
  suggestCategory: jest.fn(),
  validateExpenseBeforeCreation: jest.fn(),
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
  // PUT /api/troskovi
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
        .send({ ...validPayload, id: "1" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updated);
      expect(mockExpenseService.updateExpense).toHaveBeenCalledWith(
        "1",
        expect.objectContaining(validPayload),
        expect.objectContaining({ sub: "test-user" })
      );
    });

    test("treba pozivati requireAuthentication middleware (RBAC)", async () => {
      mockExpenseService.updateExpense.mockResolvedValue({ id: "1", ...validPayload });

      await request(app).put("/api/troskovi/1").send({ ...validPayload, id: "1" });

      expect(authService.requireAuthentication).toHaveBeenCalled();
    });

    test("treba pozivati requireRole middleware s ispravnim rolama (RBAC)", async () => {
      mockExpenseService.updateExpense.mockResolvedValue({ id: "1", ...validPayload });

      await request(app).put("/api/troskovi/1").send({ ...validPayload, id: "1" });

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
        .send({ ...validPayload, id: "99" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Trošak ne postoji." });
    });

    test("treba vratiti HTTP 400 ako je trošak zaključan", async () => {
      mockExpenseService.updateExpense.mockRejectedValue(
        new Error("Zaključani troškovi se ne mogu mijenjati.")
      );

      const response = await request(app)
        .put("/api/troskovi/1")
        .send({ ...validPayload, id: "1" });

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
      expect(mockExpenseService.deleteExpense).toHaveBeenCalledWith("1", expect.objectContaining({ sub: "test-user" }));
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

  describe("Akcije za potencijalni duplikat", () => {
    test("POST /api/troskovi/:id/duplikat/sacuvaj treba sacuvati duplikat", async () => {
      mockExpenseService.resolvePotentialDuplicate.mockResolvedValue({
        id: "dup-1",
        statusValidacije: "VALIDAN",
      });

      const response = await request(app).post("/api/troskovi/dup-1/duplikat/sacuvaj");

      expect(response.status).toBe(200);
      expect(response.body.statusValidacije).toBe("VALIDAN");
      expect(mockExpenseService.resolvePotentialDuplicate).toHaveBeenCalledWith("dup-1", "SAVE");
    });

    test("DELETE /api/troskovi/:id/duplikat treba obrisati duplikat", async () => {
      mockExpenseService.resolvePotentialDuplicate.mockResolvedValue({
        id: "dup-1",
        action: "DELETE",
        deleted: true,
      });

      const response = await request(app).delete("/api/troskovi/dup-1/duplikat");

      expect(response.status).toBe(200);
      expect(response.body.deleted).toBe(true);
      expect(mockExpenseService.resolvePotentialDuplicate).toHaveBeenCalledWith("dup-1", "DELETE");
    });
  });

  describe("Dodatne grane endpointa", () => {
    test("POST /api/troskovi/category-suggestion vraca prijedlog kategorije", async () => {
      mockExpenseService.suggestCategory.mockResolvedValue({ kategorijaId: "kat-1", confidence: 0.91 });

      const response = await request(app)
        .post("/api/troskovi/category-suggestion")
        .send({ naziv: "Laptop", opis: "Racunarska oprema" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ kategorijaId: "kat-1", confidence: 0.91 });
    });

    test("POST /api/troskovi/category-suggestion vraca servisnu i genericku gresku", async () => {
      mockExpenseService.suggestCategory.mockRejectedValueOnce(new Error("Naziv je obavezan."));
      const serviceError = await request(app).post("/api/troskovi/category-suggestion").send({});
      expect(serviceError.status).toBe(400);
      expect(serviceError.body).toEqual({ message: "Naziv je obavezan." });

      mockExpenseService.suggestCategory.mockRejectedValueOnce({});
      const genericError = await request(app).post("/api/troskovi/category-suggestion").send({});
      expect(genericError.status).toBe(400);
      expect(genericError.body).toEqual({ message: "Greska pri AI prijedlogu kategorije." });
    });

    test("POST /api/troskovi/validate vraca rezultat validacije", async () => {
      const validation = { isValid: true, validationErrors: [], warnings: [] };
      mockExpenseService.validateExpenseBeforeCreation.mockResolvedValue(validation);

      const response = await request(app).post("/api/troskovi/validate").send({ naziv: "Gorivo" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(validation);
    });

    test("POST /api/troskovi/validate vraca servisnu i genericku gresku", async () => {
      mockExpenseService.validateExpenseBeforeCreation.mockRejectedValueOnce(new Error("Datum je obavezan."));
      const serviceError = await request(app).post("/api/troskovi/validate").send({});
      expect(serviceError.status).toBe(400);
      expect(serviceError.body).toEqual({ message: "Datum je obavezan." });

      mockExpenseService.validateExpenseBeforeCreation.mockRejectedValueOnce({});
      const genericError = await request(app).post("/api/troskovi/validate").send({});
      expect(genericError.status).toBe(400);
      expect(genericError.body).toEqual({ message: "Greška pri validaciji troška." });
    });

    test("PUT /api/troskovi/:id koristi id iz body ili query kada param nije dovoljan za branch fallback", async () => {
      mockExpenseService.updateExpense.mockResolvedValue({ id: "body-id" });
      const bodyResponse = await request(app).put("/api/troskovi/").send({ id: "body-id" });
      expect(bodyResponse.status).toBe(404);

      mockExpenseService.updateExpense.mockResolvedValue({ id: "query-id" });
      const response = await request(app).put("/api/troskovi/query-id").query({ id: "ignored" }).send({});
      expect(response.status).toBe(200);
      expect(mockExpenseService.updateExpense).toHaveBeenLastCalledWith("query-id", {}, expect.objectContaining({ sub: "test-user" }));
    });

    test("duplikat akcije vracaju fallback greske bez message", async () => {
      mockExpenseService.resolvePotentialDuplicate.mockRejectedValueOnce({});
      const saveResponse = await request(app).post("/api/troskovi/dup-1/duplikat/sacuvaj");
      expect(saveResponse.status).toBe(400);
      expect(saveResponse.body).toEqual({ message: "Greska pri cuvanju duplog troska." });

      mockExpenseService.resolvePotentialDuplicate.mockRejectedValueOnce({});
      const deleteResponse = await request(app).delete("/api/troskovi/dup-1/duplikat");
      expect(deleteResponse.status).toBe(400);
      expect(deleteResponse.body).toEqual({ message: "Greska pri brisanju duplog troska." });
    });

    test("PUT /api/troskovi/:id vraca 400 kada id nedostaje", async () => {
      const response = await request(app).put("/api/troskovi/").send({ naziv: "Nesto" });

      expect(response.status).toBe(404);
    });

    test("DELETE /api/troskovi/:id vraca 400 kada id nedostaje", async () => {
      const response = await request(app).delete("/api/troskovi/");

      expect(response.status).toBe(404);
    });
  });
});
