export {};

const mockExpenseRepository = {
  getAll: jest.fn(),
  getReferenceData: jest.fn(),
  create: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getAiAnalysisContext: jest.fn(),
  updateValidationStatus: jest.fn(),
  createAnomaly: jest.fn(),
};

const mockAIAnalysisService = {
  analyzeExpense: jest.fn(),
};

const mockNotificationService = {
  createAnomalyNotification: jest.fn(),
};

jest.mock("../DAL/Repositories/ExpenseRepository", () => ({
  ExpenseRepository: jest.fn().mockImplementation(() => mockExpenseRepository),
}));

jest.mock("../BLL/Services/AIAnalysisService", () => ({
  AIAnalysisService: jest.fn().mockImplementation(() => mockAIAnalysisService),
}));

jest.mock("../BLL/Services/NotificationService", () => ({
  NotificationService: jest.fn().mockImplementation(() => mockNotificationService),
}));

const { ExpenseService } = require("../BLL/Services/ExpenseService");

describe("ExpenseService AI anomaly notifications", () => {
  let service: any;

  const payload = {
    naziv: "Neocekivano veliki trosak opreme",
    iznos: 5000,
    datum: "2026-05-20",
    kategorijaId: "kat-1",
    odjelId: "odj-1",
    valutaId: "val-1",
  };

  const createdExpense = {
    id: "trosak-1",
    ...payload,
    kategorija: "Oprema",
    odjel: "IT",
    valuta: "BAM",
    statusValidacije: "NA_CEKANJU",
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExpenseService();
  });

  test("treba snimiti anomaliju i poslati notifikacije kada AI oznaci trosak kao anomaliju", async () => {
    const analysis = {
      status: "ANOMALIJA",
      severity: "HIGH",
      riskScore: 0.9,
      explanation: "Iznos je 3 puta veci od prosjeka.",
      recommendedAction: "Provjeriti racun.",
      findings: [{ type: "AMOUNT_OUTLIER", severity: "HIGH", message: "Odstupanje iznosa." }],
    };
    const updatedExpense = { ...createdExpense, statusValidacije: "ANOMALIJA" };

    mockExpenseRepository.create.mockResolvedValue(createdExpense);
    mockExpenseRepository.getAiAnalysisContext.mockResolvedValue({ historicalExpenses: [] });
    mockAIAnalysisService.analyzeExpense.mockResolvedValue(analysis);
    mockExpenseRepository.updateValidationStatus.mockResolvedValue(updatedExpense);
    mockExpenseRepository.createAnomaly.mockResolvedValue({ id: "anom-1" });
    mockNotificationService.createAnomalyNotification.mockResolvedValue([{ id: "notif-1" }]);

    const result = await service.createExpense(payload);

    expect(mockAIAnalysisService.analyzeExpense).toHaveBeenCalledWith(createdExpense, { historicalExpenses: [] });
    expect(mockExpenseRepository.updateValidationStatus).toHaveBeenCalledWith("trosak-1", "ANOMALIJA");
    expect(mockExpenseRepository.createAnomaly).toHaveBeenCalledWith("trosak-1", analysis);
    expect(mockNotificationService.createAnomalyNotification).toHaveBeenCalledWith(updatedExpense, analysis);
    expect(result.statusValidacije).toBe("ANOMALIJA");
    expect(result.aiAnaliza).toEqual(analysis);
  });

  test("treba oznaciti trosak kao validan kada AI ne pronadje anomaliju", async () => {
    const analysis = {
      status: "VALIDAN",
      severity: "LOW",
      riskScore: 0.12,
      explanation: "Nema odstupanja.",
      recommendedAction: "Nije potrebna akcija.",
      findings: [],
    };
    const updatedExpense = { ...createdExpense, statusValidacije: "VALIDAN" };

    mockExpenseRepository.create.mockResolvedValue(createdExpense);
    mockExpenseRepository.getAiAnalysisContext.mockResolvedValue({ historicalExpenses: [] });
    mockAIAnalysisService.analyzeExpense.mockResolvedValue(analysis);
    mockExpenseRepository.updateValidationStatus.mockResolvedValue(updatedExpense);

    const result = await service.createExpense(payload);

    expect(mockExpenseRepository.updateValidationStatus).toHaveBeenCalledWith("trosak-1", "VALIDAN");
    expect(mockExpenseRepository.createAnomaly).not.toHaveBeenCalled();
    expect(mockNotificationService.createAnomalyNotification).not.toHaveBeenCalled();
    expect(result.statusValidacije).toBe("VALIDAN");
  });
});
