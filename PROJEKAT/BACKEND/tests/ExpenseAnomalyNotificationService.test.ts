export {};

const mockExpenseRepository = {
  getAll: jest.fn(),
  getReferenceData: jest.fn(),
  create: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  getAiAnalysisContext: jest.fn(),
  getBudgetContextForExpense: jest.fn(),
  updateValidationStatus: jest.fn(),
  createAnomaly: jest.fn(),
};

const mockAIAnalysisService = {
  analyzeExpense: jest.fn(),
};

const mockNotificationService = {
  createAnomalyNotification: jest.fn(),
  createPotentialDuplicateNotification: jest.fn(),
  markDuplicateActionHandled: jest.fn(),
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

  test("treba oznaciti trosak kao potencijalni duplikat bez anomaly notifikacije", async () => {
    const analysis = {
      status: "VALIDAN",
      severity: "MEDIUM",
      riskScore: 0.35,
      explanation: "Pronadjen je moguci dupli trosak.",
      recommendedAction: "Provjeriti prije dalje obrade.",
      findings: [
        {
          type: "POTENCIJALNI_DUPLIKAT",
          severity: "MEDIUM",
          message: "Pronadjen je moguci dupli trosak.",
        },
      ],
    };
    const updatedExpense = { ...createdExpense, statusValidacije: "POTENCIJALNI_DUPLIKAT" };

    mockExpenseRepository.create.mockResolvedValue(createdExpense);
    mockExpenseRepository.getAiAnalysisContext.mockResolvedValue({ duplicateCandidates: [] });
    mockAIAnalysisService.analyzeExpense.mockResolvedValue(analysis);
    mockExpenseRepository.updateValidationStatus.mockResolvedValue(updatedExpense);

    const result = await service.createExpense(payload);

    expect(mockExpenseRepository.updateValidationStatus).toHaveBeenCalledWith(
      "trosak-1",
      "POTENCIJALNI_DUPLIKAT"
    );
    expect(mockExpenseRepository.createAnomaly).not.toHaveBeenCalled();
    expect(mockNotificationService.createAnomalyNotification).not.toHaveBeenCalled();
    expect(mockNotificationService.createPotentialDuplicateNotification).toHaveBeenCalledWith(updatedExpense, analysis);
    expect(result.statusValidacije).toBe("POTENCIJALNI_DUPLIKAT");
    expect(result.aiAnaliza).toEqual(analysis);
  });

  test("duplikat ima prioritet nad anomalijom dok korisnik ne odluci sta s njim", async () => {
    const analysis = {
      status: "ANOMALIJA",
      severity: "HIGH",
      riskScore: 0.9,
      explanation: "Pronadjen je duplikat i veliki iznos.",
      recommendedAction: "Provjeriti.",
      findings: [
        {
          type: "POTENCIJALNI_DUPLIKAT",
          severity: "MEDIUM",
          message: "Pronadjen je moguci dupli trosak.",
        },
        {
          type: "AMOUNT_OUTLIER",
          severity: "HIGH",
          message: "Odstupanje iznosa.",
        },
      ],
    };
    const updatedExpense = { ...createdExpense, statusValidacije: "POTENCIJALNI_DUPLIKAT" };

    mockExpenseRepository.create.mockResolvedValue(createdExpense);
    mockExpenseRepository.getAiAnalysisContext.mockResolvedValue({ duplicateCandidates: [] });
    mockAIAnalysisService.analyzeExpense.mockResolvedValue(analysis);
    mockExpenseRepository.updateValidationStatus.mockResolvedValue(updatedExpense);
    mockNotificationService.createPotentialDuplicateNotification.mockResolvedValue([{ id: "notif-dup" }]);

    const result = await service.createExpense(payload);

    expect(mockExpenseRepository.updateValidationStatus).toHaveBeenCalledWith(
      "trosak-1",
      "POTENCIJALNI_DUPLIKAT"
    );
    expect(mockExpenseRepository.createAnomaly).not.toHaveBeenCalled();
    expect(mockNotificationService.createAnomalyNotification).not.toHaveBeenCalled();
    expect(mockNotificationService.createPotentialDuplicateNotification).toHaveBeenCalledWith(updatedExpense, analysis);
    expect(result.statusValidacije).toBe("POTENCIJALNI_DUPLIKAT");
  });

  test("treba obrisati potencijalni duplikat kada se odbije iz notifikacije", async () => {
    mockExpenseRepository.getById.mockResolvedValue({
      ...createdExpense,
      statusValidacije: "POTENCIJALNI_DUPLIKAT",
    });
    mockExpenseRepository.delete.mockResolvedValue(undefined);
    mockNotificationService.markDuplicateActionHandled.mockResolvedValue([]);

    const result = await service.resolvePotentialDuplicate("trosak-1", "DELETE");

    expect(mockExpenseRepository.delete).toHaveBeenCalledWith("trosak-1");
    expect(mockNotificationService.markDuplicateActionHandled).toHaveBeenCalledWith("trosak-1", "OBRISAN");
    expect(result).toEqual({ id: "trosak-1", action: "DELETE", deleted: true });
  });

  test("treba obrisati anomaliju sa duplikat notifikacije kada se odbije", async () => {
    mockExpenseRepository.getById.mockResolvedValue({
      ...createdExpense,
      statusValidacije: "ANOMALIJA",
    });
    mockExpenseRepository.delete.mockResolvedValue(undefined);
    mockNotificationService.markDuplicateActionHandled.mockResolvedValue([]);

    const result = await service.resolvePotentialDuplicate("trosak-1", "DELETE");

    expect(mockNotificationService.markDuplicateActionHandled).toHaveBeenCalledWith("trosak-1", "OBRISAN");
    expect(mockExpenseRepository.delete).toHaveBeenCalledWith("trosak-1");
    expect(result.deleted).toBe(true);
  });

  test("treba odobriti postojecu anomaliju bez promjene statusa", async () => {
    const anomalousExpense = {
      ...createdExpense,
      statusValidacije: "ANOMALIJA",
    };
    mockExpenseRepository.getById.mockResolvedValue(anomalousExpense);
    mockNotificationService.markDuplicateActionHandled.mockResolvedValue([]);

    const result = await service.resolvePotentialDuplicate("trosak-1", "SAVE");

    expect(mockExpenseRepository.updateValidationStatus).not.toHaveBeenCalled();
    expect(mockNotificationService.markDuplicateActionHandled).toHaveBeenCalledWith("trosak-1", "SACUVAN");
    expect(result).toEqual(anomalousExpense);
  });

  test("treba sacuvati potencijalni duplikat kao validan ako ne prekoracuje budzet", async () => {
    const pendingExpense = {
      ...createdExpense,
      statusValidacije: "POTENCIJALNI_DUPLIKAT",
    };
    const validExpense = { ...pendingExpense, statusValidacije: "VALIDAN" };

    mockExpenseRepository.getById.mockResolvedValue(pendingExpense);
    mockExpenseRepository.getBudgetContextForExpense.mockResolvedValue({
      planiraniIznos: 10000,
      potrosenoPrijeTroska: 1000,
    });
    mockExpenseRepository.updateValidationStatus.mockResolvedValue(validExpense);
    mockNotificationService.markDuplicateActionHandled.mockResolvedValue([]);

    const result = await service.resolvePotentialDuplicate("trosak-1", "SAVE");

    expect(mockExpenseRepository.updateValidationStatus).toHaveBeenCalledWith("trosak-1", "VALIDAN");
    expect(mockExpenseRepository.createAnomaly).not.toHaveBeenCalled();
    expect(result.statusValidacije).toBe("VALIDAN");
  });

  test("treba sacuvati potencijalni duplikat kao anomaliju ako prekoracuje budzet", async () => {
    const pendingExpense = {
      ...createdExpense,
      statusValidacije: "POTENCIJALNI_DUPLIKAT",
    };
    const anomalousExpense = { ...pendingExpense, statusValidacije: "ANOMALIJA" };

    mockExpenseRepository.getById.mockResolvedValue(pendingExpense);
    mockExpenseRepository.getBudgetContextForExpense.mockResolvedValue({
      planiraniIznos: 5500,
      potrosenoPrijeTroska: 1000,
    });
    mockExpenseRepository.updateValidationStatus.mockResolvedValue(anomalousExpense);
    mockExpenseRepository.createAnomaly.mockResolvedValue({ id: "anom-2" });
    mockNotificationService.createAnomalyNotification.mockResolvedValue([{ id: "notif-2" }]);
    mockNotificationService.markDuplicateActionHandled.mockResolvedValue([]);

    const result = await service.resolvePotentialDuplicate("trosak-1", "SAVE");

    expect(mockExpenseRepository.updateValidationStatus).toHaveBeenCalledWith("trosak-1", "ANOMALIJA");
    expect(mockExpenseRepository.createAnomaly).toHaveBeenCalled();
    expect(mockNotificationService.createAnomalyNotification).toHaveBeenCalled();
    expect(result.statusValidacije).toBe("ANOMALIJA");
  });
});
