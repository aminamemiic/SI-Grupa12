export {};

const express = require("express");
const request = require("supertest");

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockAIAnalysisService = {
  analyzeFullDatabase: jest.fn(),
  askAssistantWithGemini: jest.fn(),
};

const mockReportService = {
  getExpenseReport: jest.fn(),
};

const mockBudgetService = {
  getAllBudgets: jest.fn(),
};

jest.mock("../BLL/Services/AIAnalysisService", () => ({
  AIAnalysisService: jest.fn().mockImplementation(() => mockAIAnalysisService),
}));

jest.mock("../BLL/Services/ReportService", () => ({
  ReportService: jest.fn().mockImplementation(() => mockReportService),
}));

jest.mock("../BLL/Services/BudgetService", () => ({
  BudgetService: jest.fn().mockImplementation(() => mockBudgetService),
}));

const { registerAIAnalysisEndpoints } = require("../PRESENTATION API/Endpoints/AIAnalysisEndpoints");

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const sampleAnaliza = {
  analizaId: null,
  generisanoU: "2026-05-25T00:00:00.000Z",
  ukupnoTroskova: 10,
  ukupniIznos: 5000.00,
  prosjecniMjesecniIznos: 1250.00,
  trenKretanja: "RAST",
  postotakPromjene: 12.5,
  topKategorija: "Plate",
  topOdjel: "IT",
  mjesecniTrendovi: [
    { mjesec: "Februar 2026", ukupniIznos: 2000, brojTroskova: 4, prosjecniIznos: 500 },
    { mjesec: "Mart 2026", ukupniIznos: 3000, brojTroskova: 6, prosjecniIznos: 500 },
  ],
  predvidjanjeBudzeta: [
    { sljedeciMjesec: "April 2026", predvideniIznos: 3500, donjaBoundary: 3000, gornjaBoundary: 4000, pouzdanostProcjene: "SREDNJA" },
  ],
  preporuke: ["Troškovi rastu po stopi od 12.5%."],
  sazetak: "Analiza obuhvata 10 troškova.",
};

const sampleReport = {
  expenses: [],
  summary: { totalExpenses: 0, totalAmount: 0 },
  breakdowns: { byCategory: [], byDepartment: [], byMonth: [], byStatus: [], byCurrency: [] },
};

const sampleBudgets = [
  { id: "b1", naziv: "IT Budzet 2026", planiraniIznos: 50000 },
];

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe("POST /api/ai/analize/baza – AIAnalysisEndpoints", () => {
  let app: any;

  const authService = {
    verifyBearerToken: jest.fn((_req: any, _res: any, next: any) => next()),
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["glavni_racunovodja"] };
      next();
    }),
    requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    refreshSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerAIAnalysisEndpoints(app, authService);
  });

  // ─── Uspješan poziv ────────────────────────────────────────────────────────

  test("treba pokrenuti AI analizu i vratiti rezultat s HTTP 200", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.analyzeFullDatabase.mockResolvedValue(sampleAnaliza);

    const response = await request(app).post("/api/ai/analize/baza");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(sampleAnaliza);
  });

  test("treba dohvatiti izvještaj s praznim filterima (cijela baza)", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.analyzeFullDatabase.mockResolvedValue(sampleAnaliza);

    await request(app).post("/api/ai/analize/baza");

    expect(mockReportService.getExpenseReport).toHaveBeenCalledWith({});
  });

  test("treba dohvatiti sve budžete", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.analyzeFullDatabase.mockResolvedValue(sampleAnaliza);

    await request(app).post("/api/ai/analize/baza");

    expect(mockBudgetService.getAllBudgets).toHaveBeenCalled();
  });

  test("treba proslijediti reportData i budgetData AI servisu", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.analyzeFullDatabase.mockResolvedValue(sampleAnaliza);

    await request(app).post("/api/ai/analize/baza");

    expect(mockAIAnalysisService.analyzeFullDatabase).toHaveBeenCalledWith(
      sampleReport,
      sampleBudgets
    );
  });

  test("odgovor treba sadržavati sve ključeve rezultata analize", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.analyzeFullDatabase.mockResolvedValue(sampleAnaliza);

    const response = await request(app).post("/api/ai/analize/baza");

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("ukupnoTroskova");
    expect(response.body).toHaveProperty("ukupniIznos");
    expect(response.body).toHaveProperty("trenKretanja");
    expect(response.body).toHaveProperty("postotakPromjene");
    expect(response.body).toHaveProperty("topKategorija");
    expect(response.body).toHaveProperty("topOdjel");
    expect(response.body).toHaveProperty("mjesecniTrendovi");
    expect(response.body).toHaveProperty("predvidjanjeBudzeta");
    expect(response.body).toHaveProperty("preporuke");
    expect(response.body).toHaveProperty("sazetak");
    expect(response.body).toHaveProperty("generisanoU");
  });

  // ─── Greške servisa ────────────────────────────────────────────────────────

  test("treba vratiti HTTP 500 ako getExpenseReport baci grešku", async () => {
    mockReportService.getExpenseReport.mockRejectedValue(new Error("DB konekcija prekinuta"));
    mockBudgetService.getAllBudgets.mockResolvedValue([]);

    const response = await request(app).post("/api/ai/analize/baza");

    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty("message");
    expect(response.body.message).toBe("DB konekcija prekinuta");
  });

  test("treba vratiti HTTP 500 ako getAllBudgets baci grešku", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockRejectedValue(new Error("Budzet servis nedostupan"));

    const response = await request(app).post("/api/ai/analize/baza");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Budzet servis nedostupan");
  });

  test("treba vratiti HTTP 500 sa generičkom porukom ako greška nema message", async () => {
    mockReportService.getExpenseReport.mockRejectedValue({});
    mockBudgetService.getAllBudgets.mockResolvedValue([]);

    const response = await request(app).post("/api/ai/analize/baza");

    expect(response.status).toBe(500);
    expect(response.body.message).toBe("Greska pri pokretanju AI analize baze podataka.");
  });

  // ─── RBAC ─────────────────────────────────────────────────────────────────

  test("treba pozivati requireAuthentication middleware", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue([]);
    mockAIAnalysisService.analyzeFullDatabase.mockResolvedValue(sampleAnaliza);

    await request(app).post("/api/ai/analize/baza");

    expect(authService.requireAuthentication).toHaveBeenCalled();
  });

  test("treba pozivati requireRole s ispravnim rolama (admin, glavni_racunovodja, finansijski_direktor)", async () => {
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue([]);
    mockAIAnalysisService.analyzeFullDatabase.mockResolvedValue(sampleAnaliza);

    await request(app).post("/api/ai/analize/baza");

    expect(authService.requireRole).toHaveBeenCalledWith(
      "admin",
      "glavni_racunovodja",
      "finansijski_direktor"
    );
  });
});
