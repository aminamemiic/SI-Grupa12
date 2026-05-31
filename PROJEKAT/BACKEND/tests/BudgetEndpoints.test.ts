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
  vratiNaDoradu: jest.fn(),
  submitujDoradu: jest.fn(),
  getKomentari: jest.fn(),
};

jest.mock("../BLL/Services/BudgetService", () => ({
  BudgetService: jest.fn().mockImplementation(() => mockBudgetService),
}));

const { registerBudgetEndpoints } = require("../PRESENTATION API/Endpoints/BudgetEndpoints");

describe("BudgetEndpoints – integracioni testovi", () => {
  let app: any;

  const authService = {
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      const roleHeader = req.headers["x-test-role"] || "admin";
      const subHeader = req.headers["x-test-sub"] || "user-1";
      req.user = { sub: subHeader, roles: [roleHeader] };
      next();
    }),
    requireRole: jest.fn((...allowedRoles: string[]) => (req: any, res: any, next: any) => {
      const roles = req.user?.roles || [];
      const hasRole = roles.some((role: string) => allowedRoles.includes(role));

      if (!hasRole) {
        return res.status(403).json({ error: "Nemate dozvolu za ovaj resurs." });
      }

      return next();
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerBudgetEndpoints(app, authService);
  });

  test("PATCH /api/budzeti/:id/vrati-na-doradu treba vratiti 200 za finansijskog direktora s validnim komentarom", async () => {
    const updatedBudget = { id: "b1", statusOdobrenja: "na_doradi" };
    mockBudgetService.vratiNaDoradu.mockResolvedValue(updatedBudget);

    const response = await request(app)
      .patch("/api/budzeti/b1/vrati-na-doradu")
      .set("x-test-role", "finansijski_direktor")
      .set("x-test-sub", "fd-1")
      .send({ komentar: "Budžet treba dopuniti novim obrazloženjem." });

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      budzet: updatedBudget,
      poruka: "Budžet je vraćen na doradu.",
    });
    expect(mockBudgetService.vratiNaDoradu).toHaveBeenCalledWith(
      "b1",
      "Budžet treba dopuniti novim obrazloženjem.",
      expect.objectContaining({ sub: "fd-1" })
    );
  });

  test("PATCH /api/budzeti/:id/vrati-na-doradu treba vratiti 403 za glavnog računovođu", async () => {
    const response = await request(app)
      .patch("/api/budzeti/b1/vrati-na-doradu")
      .set("x-test-role", "glavni_racunovodja")
      .send({ komentar: "Komentar" });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ error: "Nemate dozvolu za ovaj resurs." });
    expect(mockBudgetService.vratiNaDoradu).not.toHaveBeenCalled();
  });

  test("PATCH /api/budzeti/:id/vrati-na-doradu treba vratiti 400 s praznim komentarom", async () => {
    mockBudgetService.vratiNaDoradu.mockRejectedValue(
      new Error("Komentar je obavezan pri povratu budžeta na doradu.")
    );

    const response = await request(app)
      .patch("/api/budzeti/b1/vrati-na-doradu")
      .set("x-test-role", "finansijski_direktor")
      .send({ komentar: "   " });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Komentar je obavezan pri povratu budžeta na doradu.",
    });
  });

  test("PATCH /api/budzeti/:id/submituj-doradu treba vratiti 200 za kreator budžeta", async () => {
    const updatedBudget = { id: "b1", statusOdobrenja: "na_cekanju" };
    mockBudgetService.submitujDoradu.mockResolvedValue(updatedBudget);

    const response = await request(app)
      .patch("/api/budzeti/b1/submituj-doradu")
      .set("x-test-role", "glavni_racunovodja")
      .set("x-test-sub", "creator-1")
      .send({});

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      budzet: updatedBudget,
      poruka: "Budžet je ponovo poslan na odobravanje.",
    });
    expect(mockBudgetService.submitujDoradu).toHaveBeenCalledWith(
      "b1",
      expect.objectContaining({ sub: "creator-1" })
    );
  });

  test("PATCH /api/budzeti/:id/submituj-doradu treba vratiti 400 ako budžet nije u statusu na_doradi", async () => {
    mockBudgetService.submitujDoradu.mockRejectedValue(
      new Error("Budžet mora biti u statusu 'na_doradi' da bi se mogao submitovati.")
    );

    const response = await request(app)
      .patch("/api/budzeti/b1/submituj-doradu")
      .set("x-test-role", "glavni_racunovodja")
      .set("x-test-sub", "creator-1")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Budžet mora biti u statusu 'na_doradi' da bi se mogao submitovati.",
    });
  });

  test("GET /api/budzeti/:id/komentari treba vratiti listu komentara", async () => {
    const comments = [
      {
        id: 1,
        budzetId: "b1",
        autorId: "fd-1",
        autorIme: "Amra Direktorica",
        komentar: "Potrebna dopuna.",
        tip: "povrat_na_doradu",
        kreiranoAt: "2026-05-31T10:00:00.000Z",
      },
    ];
    mockBudgetService.getKomentari.mockResolvedValue(comments);

    const response = await request(app)
      .get("/api/budzeti/b1/komentari")
      .set("x-test-role", "glavni_racunovodja");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(comments);
    expect(mockBudgetService.getKomentari).toHaveBeenCalledWith("b1");
  });

  test("PATCH /api/budzeti/:id/vrati-na-doradu treba vratiti 404 ako budzet ne postoji", async () => {
    mockBudgetService.vratiNaDoradu.mockRejectedValue(new Error("Budzet ne postoji."));

    const response = await request(app)
      .patch("/api/budzeti/missing/vrati-na-doradu")
      .set("x-test-role", "finansijski_direktor")
      .send({ komentar: "Komentar" });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("PATCH /api/budzeti/:id/vrati-na-doradu treba vratiti 400 za genericku gresku", async () => {
    mockBudgetService.vratiNaDoradu.mockRejectedValue({});

    const response = await request(app)
      .patch("/api/budzeti/b1/vrati-na-doradu")
      .set("x-test-role", "finansijski_direktor")
      .send({ komentar: "Komentar" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Greska pri povratu budzeta na doradu.",
    });
  });

  test("PATCH /api/budzeti/:id/submituj-doradu treba vratiti 404 ako budzet ne postoji", async () => {
    mockBudgetService.submitujDoradu.mockRejectedValue(new Error("Budzet ne postoji."));

    const response = await request(app)
      .patch("/api/budzeti/missing/submituj-doradu")
      .set("x-test-role", "glavni_racunovodja")
      .set("x-test-sub", "creator-1")
      .send({});

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("PATCH /api/budzeti/:id/submituj-doradu treba vratiti 400 za genericku gresku", async () => {
    mockBudgetService.submitujDoradu.mockRejectedValue({});

    const response = await request(app)
      .patch("/api/budzeti/b1/submituj-doradu")
      .set("x-test-role", "glavni_racunovodja")
      .set("x-test-sub", "creator-1")
      .send({});

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Greska pri slanju budzeta na doradu.",
    });
  });

  test("GET /api/budzeti/:id/komentari treba vratiti 404 kada budzet ne postoji", async () => {
    mockBudgetService.getKomentari.mockRejectedValue(new Error("Budzet ne postoji."));

    const response = await request(app)
      .get("/api/budzeti/missing/komentari")
      .set("x-test-role", "glavni_racunovodja");

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ message: "Budzet ne postoji." });
  });

  test("GET /api/budzeti/:id/komentari treba vratiti 500 za genericku gresku", async () => {
    mockBudgetService.getKomentari.mockRejectedValue({});

    const response = await request(app)
      .get("/api/budzeti/missing/komentari")
      .set("x-test-role", "glavni_racunovodja");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ message: "Greska pri dohvatu komentara budzeta." });
  });
});
