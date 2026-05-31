export {};

const express = require("express");
const request = require("supertest");

// ─── Mocks ───────────────────────────────────────────────────────────────────

const mockAIAnalysisService = {
  analyzeFullDatabase: jest.fn(),
  askAssistantWithGemini: jest.fn(),
  getTopGrowingSuppliers: jest.fn(),
  getExecutiveSummary: jest.fn(),
  explainAnomaly: jest.fn(),
  getCostOptimizationSuggestions: jest.fn(),
  detectMissingRecurringExpenses: jest.fn(),
  getSupplierDependencyRisk: jest.fn(),
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

  test("POST /api/ai/asistent/pitaj vraca 400 kada pitanje nije poslano", async () => {
    const response = await request(app).post("/api/ai/asistent/pitaj").send({ question: "   " });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Pitanje je obavezno.");
    expect(mockReportService.getExpenseReport).not.toHaveBeenCalled();
    expect(mockAIAnalysisService.askAssistantWithGemini).not.toHaveBeenCalled();
  });

  test("POST /api/ai/asistent/pitaj dohvaća izvjestaj i budzete pa vraca odgovor asistenta", async () => {
    const assistantResponse = {
      answer: "Najveci trosak je Laptop Dell.",
      source: "fallback",
      intent: "LARGEST_EXPENSE",
      data: { expense: { id: "e1" } },
    };
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.askAssistantWithGemini.mockResolvedValue(assistantResponse);

    const response = await request(app)
      .post("/api/ai/asistent/pitaj")
      .send({ question: "Koji trosak je najveci?" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(assistantResponse);
    expect(mockReportService.getExpenseReport).toHaveBeenCalledWith({});
    expect(mockBudgetService.getAllBudgets).toHaveBeenCalled();
    expect(mockAIAnalysisService.askAssistantWithGemini).toHaveBeenCalledWith(
      "Koji trosak je najveci?",
      sampleReport,
      sampleBudgets
    );
  });

  test("GET /api/ai/dobavljaci/rast vraca top dobavljace sa rastom", async () => {
    const supplierGrowth = {
      suppliers: [
        {
          supplierId: "dell",
          supplierName: "Dell",
          currentAmount: 8000,
          previousAmount: 4000,
          growthPercentage: 100,
          status: "growth",
          riskLevel: "HIGH",
        },
      ],
    };
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockAIAnalysisService.getTopGrowingSuppliers.mockReturnValue(supplierGrowth);

    const response = await request(app).get("/api/ai/dobavljaci/rast");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(supplierGrowth);
    expect(mockAIAnalysisService.getTopGrowingSuppliers).toHaveBeenCalledWith(sampleReport);
  });

  test("GET /api/ai/executive-summary vraca generisane poruke", async () => {
    const summary = {
      summary: [
        { type: "INFO", message: "Troskovi su stabilni." },
        { type: "WARNING", message: "Pronadjene su 2 anomalije." },
      ],
    };
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.getExecutiveSummary.mockReturnValue(summary);

    const response = await request(app).get("/api/ai/executive-summary");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(summary);
    expect(mockAIAnalysisService.getExecutiveSummary).toHaveBeenCalledWith(sampleReport, sampleBudgets);
  });

  test("GET /api/ai/anomaly-explanation/:expenseId vraca objasnjenje anomalije", async () => {
    const explanation = {
      explanation: "Trosak je znatno veci od prosjeka kategorije.",
      severity: "HIGH",
    };
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockAIAnalysisService.explainAnomaly.mockReturnValue(explanation);

    const response = await request(app).get("/api/ai/anomaly-explanation/e1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(explanation);
    expect(mockAIAnalysisService.explainAnomaly).toHaveBeenCalledWith("e1", sampleReport);
  });

  test("GET /api/ai/cost-suggestions vraca preporuke za ustedu", async () => {
    const suggestions = {
      suggestions: [
        {
          title: "Oprema raste",
          description: "Pregledati narudzbe i odobrenja.",
          estimatedImpact: "Srednji uticaj na troskove.",
        },
      ],
    };
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockBudgetService.getAllBudgets.mockResolvedValue(sampleBudgets);
    mockAIAnalysisService.getCostOptimizationSuggestions.mockReturnValue(suggestions);

    const response = await request(app).get("/api/ai/cost-suggestions");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(suggestions);
    expect(mockAIAnalysisService.getCostOptimizationSuggestions).toHaveBeenCalledWith(sampleReport, sampleBudgets);
  });

  test("GET /api/ai/missing-recurring-expenses vraca periodicne troskove za provjeru", async () => {
    const missing = {
      missingRecurringExpenses: [
        {
          expenseName: "internet usluge",
          lastSeenDate: "15.04.2026",
          averageAmount: 120,
          recommendation: "Provjeriti da li racun jos nije unesen.",
        },
      ],
    };
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockAIAnalysisService.detectMissingRecurringExpenses.mockReturnValue(missing);

    const response = await request(app).get("/api/ai/missing-recurring-expenses");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(missing);
    expect(mockAIAnalysisService.detectMissingRecurringExpenses).toHaveBeenCalledWith(sampleReport);
  });

  test("GET /api/ai/supplier-risk vraca rizike zavisnosti od dobavljaca", async () => {
    const risks = {
      risks: [
        {
          supplierName: "Dell",
          sharePercentage: 68,
          riskLevel: "HIGH",
          message: "Dobavljac predstavlja visok nivo zavisnosti.",
        },
      ],
    };
    mockReportService.getExpenseReport.mockResolvedValue(sampleReport);
    mockAIAnalysisService.getSupplierDependencyRisk.mockReturnValue(risks);

    const response = await request(app).get("/api/ai/supplier-risk");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(risks);
    expect(mockAIAnalysisService.getSupplierDependencyRisk).toHaveBeenCalledWith(sampleReport);
  });
});
