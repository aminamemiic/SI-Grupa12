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

jest.mock("../DAL/Repositories/ExpenseRepository", () => ({
  ExpenseRepository: jest.fn().mockImplementation(() => mockExpenseRepository),
}));

const { ExpenseService } = require("../BLL/Services/ExpenseService");
const { AIAnalysisService } = require("../BLL/Services/AIAnalysisService");

describe("User Story 34 - Automatska validacija i detekcija anomalija pri unosu", () => {
  let service: any;
  let aiService: any;

  const validExpense = {
    naziv: "Kupovina kancelarijskog materijala",
    iznos: 100,
    datum: "2026-04-20",
    kategorijaId: 1,
    odjelId: 2,
    valutaId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2026-06-01T10:00:00"));
    service = new ExpenseService();
    aiService = new AIAnalysisService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // ─────────────────────────────────────────────────────────────
  // Detekcija abnormalnih iznosa
  // ─────────────────────────────────────────────────────────────

  describe("Detekcija abnormalnih iznosa (Amount Outlier Detection)", () => {
    test("trebalo bi detektovati iznos koji je značajno veći od prosječne vrijednosti", () => {
      const expense = { ...validExpense, iznos: 1000 };
      const historicalAmounts = [50, 60, 55]; // prosječno 55
      const context = {
        historicalExpenses: historicalAmounts.map((iznos) => ({ iznos })),
        duplicateCandidates: [],
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("ANOMALIJA");
      expect(result.findings.length).toBeGreaterThan(0);
      const outlierFinding = result.findings.find((f: any) => f.type.includes("OUTLIER"));
      expect(outlierFinding).toBeDefined();
      expect(outlierFinding?.severity).toBe("HIGH");
    });

    test("trebalo bi detektovati iznose koji se odklanjaju od prosjeka korištenjem Z-score metode", () => {
      const expense = { ...validExpense, iznos: 1000 };
      const historicalAmounts = [100, 105, 98, 102, 101]; // mali raspon
      const context = {
        historicalExpenses: historicalAmounts.map((iznos) => ({ iznos })),
        duplicateCandidates: [],
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("ANOMALIJA");
      const zscore = result.findings.find((f: any) => f.type.includes("OUTLIER"));
      expect(zscore).toBeDefined();
    });

    test("trebalo bi detektovati iznose koje prelaze IQR gornju granicu", () => {
      const expense = { ...validExpense, iznos: 1000 };
      const historicalAmounts = [10, 15, 20, 25, 30, 35, 40]; // normalna distribucija
      const context = {
        historicalExpenses: historicalAmounts.map((iznos) => ({ iznos })),
        duplicateCandidates: [],
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("ANOMALIJA");
      const iqrFinding = result.findings.find((f: any) => f.type.includes("OUTLIER"));
      expect(iqrFinding).toBeDefined();
    });

    test("trebalo bi prihvatiti iznose koji su u normalnom rasponu", () => {
      const expense = { ...validExpense, iznos: 55 };
      const historicalAmounts = [50, 60, 55, 58, 52]; // iznos je u rasponu
      const context = {
        historicalExpenses: historicalAmounts.map((iznos) => ({ iznos })),
        duplicateCandidates: [],
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("VALIDAN");
      expect(result.findings.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Detekcija duplikata
  // ─────────────────────────────────────────────────────────────

  describe("Detekcija duplikata (Duplicate Detection)", () => {
    test("trebalo bi detektovati točne duplikate s istim nazivom, iznosom i datumom", () => {
      const expense = validExpense;
      const duplicateCandidates = [
        {
          id: 1,
          naziv: expense.naziv,
          iznos: expense.iznos,
          datum: expense.datum,
        },
      ];
      const context = {
        historicalExpenses: [],
        duplicateCandidates,
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("VALIDAN");
      const duplicateFinding = result.findings.find((f: any) => f.type === "POTENCIJALNI_DUPLIKAT");
      expect(duplicateFinding).toBeDefined();
      expect(duplicateFinding?.severity).toBe("MEDIUM");
      expect(duplicateFinding?.evidence?.duplicateKind).toBe("EXACT");
    });

    test("trebalo bi detektovati fuzzy duplikate sa sličnim nazivom i iznosom", () => {
      const expense = validExpense;
      const duplicateCandidates = [
        {
          id: 1,
          naziv: "Kupovina kancerlijskog materijala", // sličan naziv (mali typo)
          iznos: 100, // isti iznos
          datum: "2026-04-21", // sličan datum (1 dan razlike)
        },
      ];
      const context = {
        historicalExpenses: [],
        duplicateCandidates,
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      // Trebalo bi detektovati kao anomaliju jer je dupli s sličnom vrednostima
      expect(result.status).toBe("VALIDAN");
      const fuzzFinding = result.findings.find((f: any) => f.type === "POTENCIJALNI_DUPLIKAT");
      expect(fuzzFinding).toBeDefined();
      expect(fuzzFinding?.evidence?.duplicateKind).toBe("FUZZY");
    });

    test("trebalo bi detektovati više troškova od istog dobavljača u istom danu", () => {
      const expense = { ...validExpense, naziv: "Vodafone - mesečna pretplata" };
      const duplicateCandidates = [
        {
          id: 1,
          naziv: "Vodafone - novčana pomoć",
          iznos: 50,
          datum: "2026-04-20",
        },
        {
          id: 2,
          naziv: "Vodafone - usluga interneta",
          iznos: 30,
          datum: "2026-04-20",
        },
      ];
      const context = {
        historicalExpenses: [],
        duplicateCandidates,
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("VALIDAN");
      const repeatVendor = result.findings.find((f: any) => f.type === "POTENCIJALNI_DUPLIKAT");
      expect(repeatVendor).toBeDefined();
      expect(repeatVendor?.evidence?.duplicateKind).toBe("REPEATED_VENDOR");
    });

    test("trebalo bi prihvatiti troške koji nisu duplikati", () => {
      const expense = validExpense;
      const duplicateCandidates = [
        {
          id: 1,
          naziv: "Neki drugi trošak",
          iznos: 500,
          datum: "2026-03-20",
        },
      ];
      const context = {
        historicalExpenses: [],
        duplicateCandidates,
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("VALIDAN");
      expect(result.findings.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Detekcija nerealnih vrijednosti
  // ─────────────────────────────────────────────────────────────

  describe("Detekcija nerealnih vrijednosti (Unrealistic Values)", () => {
    test("trebalo bi detektovati izuzetno male iznose", () => {
      const expense = { ...validExpense, iznos: 0.001 };
      const context = {
        historicalExpenses: [],
        duplicateCandidates: [],
        budget: null,
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("ANOMALIJA");
      const unrealistic = result.findings.find((f: any) =>
        f.type.includes("UNREALISTIC_AMOUNT")
      );
      expect(unrealistic).toBeDefined();
    });

    test("trebalo bi detektovati izuzetno velike iznose", () => {
      const expense = { ...validExpense, iznos: 50000000 };
      const context = {
        historicalExpenses: [],
        duplicateCandidates: [],
        budget: null,
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("ANOMALIJA");
      const unrealistic = result.findings.find((f: any) =>
        f.type === "UNREALISTIC_AMOUNT_TOO_LARGE"
      );
      expect(unrealistic).toBeDefined();
      expect(unrealistic?.severity).toBe("HIGH");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Validacija pri unosu - Razred
  // ─────────────────────────────────────────────────────────────

  describe("validateExpenseBeforeCreation - Validacija prije kreiranja", () => {
    test("trebalo bi vratiti grešku ako naziv nije poslan", async () => {
      const invalidPayload = { ...validExpense, naziv: "" };

      const result = await service.validateExpenseBeforeCreation(invalidPayload);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors.length).toBeGreaterThan(0);
      expect(result.validationErrors[0]).toContain("Naziv");
    });

    test("trebalo bi vratiti grešku ako iznos nije validan broj", async () => {
      const invalidPayload = { ...validExpense, iznos: "abc" };

      const result = await service.validateExpenseBeforeCreation(invalidPayload);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors.some((e: any) => e.includes("broj"))).toBe(true);
    });

    test("trebalo bi vratiti grešku ako je iznos jednak nuli", async () => {
      const invalidPayload = { ...validExpense, iznos: 0 };

      const result = await service.validateExpenseBeforeCreation(invalidPayload);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors.some((e: any) => e.includes("veći od 0"))).toBe(true);
    });

    test("trebalo bi vratiti grešku ako datum nije u budućnosti", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const invalidPayload = {
        ...validExpense,
        datum: futureDate.toISOString().split("T")[0],
      };

      const result = await service.validateExpenseBeforeCreation(invalidPayload);

      expect(result.isValid).toBe(false);
      expect(result.validationErrors.some((e: any) => e.includes("budućnost"))).toBe(true);
    });

    test("trebalo bi vratiti upozorenja ako su detektovane anomalije", async () => {
      mockExpenseRepository.getAiAnalysisContext.mockResolvedValue({
        historicalExpenses: [
          { iznos: 50 },
          { iznos: 60 },
          { iznos: 55 },
        ],
        duplicateCandidates: [],
        budget: null,
      });

      const anomalousExpense = { ...validExpense, iznos: 1000 }; // znatno veći od prosjeka

      const result = await service.validateExpenseBeforeCreation(anomalousExpense);

      expect(result.isValid).toBe(true); // validacija ne blokira, samo upozorenja
      expect(result.warnings.length).toBeGreaterThan(0);
      expect(result.warnings[0].severity).toBe("HIGH");
    });

    test("trebalo bi vratiti praznu listu upozorenja za validne troškove", async () => {
      mockExpenseRepository.getAiAnalysisContext.mockResolvedValue({
        historicalExpenses: [
          { iznos: 90 },
          { iznos: 100 },
          { iznos: 110 },
        ],
        duplicateCandidates: [],
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      });

      const normalExpense = { ...validExpense, iznos: 100 }; // u normalnom rasponu

      const result = await service.validateExpenseBeforeCreation(normalExpense);

      expect(result.isValid).toBe(true);
      expect(result.warnings.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Poboljšane validacije polja
  // ─────────────────────────────────────────────────────────────

  describe("Poboljšane validacije polja pri kreiranju", () => {
    test("trebalo bi odbiti naziv sa manje od 3 karaktera", async () => {
      await expect(
        service.createExpense({ ...validExpense, naziv: "ab" })
      ).rejects.toThrow("najmanje 3 karaktera");
    });

    test("trebalo bi odbiti iznos manji od 0.01", async () => {
      await expect(
        service.createExpense({ ...validExpense, iznos: 0.001 })
      ).rejects.toThrow("premali");
    });

    test("trebalo bi odbiti iznos veći od 10,000,000", async () => {
      await expect(
        service.createExpense({ ...validExpense, iznos: 11000000 })
      ).rejects.toThrow("prevelik");
    });

    test("trebalo bi odbiti datum stariji od 5 godina", async () => {
      const oldDate = new Date();
      oldDate.setFullYear(oldDate.getFullYear() - 6);
      await expect(
        service.createExpense({
          ...validExpense,
          datum: oldDate.toISOString().split("T")[0],
        })
      ).rejects.toThrow("5 godina");
    });

    test("trebalo bi prihvatiti datum tačno prije 5 godina", async () => {
      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
      fiveYearsAgo.setDate(fiveYearsAgo.getDate() + 1); // Dodaj 1 dan da izbegne granične slučajeve
      const payload = {
        ...validExpense,
        datum: fiveYearsAgo.toISOString().split("T")[0],
      };

      mockExpenseRepository.create.mockResolvedValue({ id: 1, ...payload });
      mockExpenseRepository.updateValidationStatus.mockResolvedValue({ id: 1, ...payload, statusValidacije: "VALIDAN" });
      mockExpenseRepository.getAiAnalysisContext.mockResolvedValue({
        historicalExpenses: [],
        duplicateCandidates: [],
        budget: null,
      });

      const result = await service.createExpense(payload);

      expect(result).toBeDefined();
    });

    test("trebalo bi odbiti opis duži od 1000 karaktera", async () => {
      await expect(
        service.createExpense({
          ...validExpense,
          opis: "a".repeat(1001),
        })
      ).rejects.toThrow("1000 karaktera");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Integracija sa budžetima
  // ─────────────────────────────────────────────────────────────

  describe("Budžetna ograničenja (Budget Constraints)", () => {
    test("trebalo bi detektovati anomaliju ako budzet ne postoji za odjel, kategoriju i datum", () => {
      const expense = { ...validExpense, iznos: 300 };
      const context = {
        historicalExpenses: [],
        duplicateCandidates: [],
        budget: null,
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("ANOMALIJA");
      const missingBudget = result.findings.find((f: any) => f.type === "BUDGET_NOT_DEFINED");
      expect(missingBudget).toBeDefined();
      expect(missingBudget?.severity).toBe("HIGH");
    });

    test("trebalo bi detektovati ako trošak prelazi budžet", () => {
      const expense = { ...validExpense, iznos: 800 };
      const budget = {
        id: 1,
        planiraniIznos: 1000,
        potrosenoPrijeTroska: 500, // 500 + 800 = 1300 > 1000
      };
      const context = {
        historicalExpenses: [],
        duplicateCandidates: [],
        budget,
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("ANOMALIJA");
      const budgetExceeded = result.findings.find((f: any) => f.type === "BUDGET_EXCEEDED");
      expect(budgetExceeded).toBeDefined();
      expect(budgetExceeded?.evidence?.percentageOverBudget).toBe(30);
    });

    test("trebalo bi prihvatiti trošak koji ostaje u budžetu", () => {
      const expense = { ...validExpense, iznos: 300 };
      const budget = {
        id: 1,
        planiraniIznos: 1000,
        potrosenoPrijeTroska: 500, // 500 + 300 = 800 < 1000
      };
      const context = {
        historicalExpenses: [],
        duplicateCandidates: [],
        budget,
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.status).toBe("VALIDAN");
      expect(result.findings.length).toBe(0);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Risk Score izračun
  // ─────────────────────────────────────────────────────────────

  describe("Izračun risk score-a", () => {
    test("trebalo bi dodijeliti nisku vrijednost rizika za validne troške", () => {
      const expense = { ...validExpense, iznos: 100 };
      const context = {
        historicalExpenses: [
          { iznos: 90 },
          { iznos: 100 },
          { iznos: 110 },
        ],
        duplicateCandidates: [],
        budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.riskScore).toBeLessThan(0.5);
    });

    test("trebalo bi dodijeliti visoku vrijednost rizika za troškove sa visokim anomalijama", () => {
      const expense = { ...validExpense, iznos: 1000 };
      const duplicateCandidates = [
        {
          id: 1,
          naziv: expense.naziv,
          iznos: expense.iznos,
          datum: expense.datum,
        },
      ];
      const context = {
        historicalExpenses: [
          { iznos: 50 },
          { iznos: 60 },
          { iznos: 55 },
        ],
        duplicateCandidates,
        budget: null,
      };

      const result = aiService["fallbackExpenseAnalysis"](expense, context);

      expect(result.riskScore).toBeGreaterThan(0.5);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Levenshtein distanca za fuzzy matching
  // ─────────────────────────────────────────────────────────────

  describe("String similarity za fuzzy matching", () => {
    test("trebalo bi prepoznati potpuno identične stringove", () => {
      const result = aiService["getStringSimilarity"]("test", "test");
      expect(result).toBe(1);
    });

    test("trebalo bi prepoznati sličan string sa malim greškama", () => {
      const result = aiService["getStringSimilarity"](
        "Kupovina kancelarijskog",
        "Kupovina kancerlijskog"
      );
      expect(result).toBeGreaterThan(0.8);
    });

    test("trebalo bi detektovati različite stringove", () => {
      const result = aiService["getStringSimilarity"]("Gorivo", "Internet");
      expect(result).toBeLessThan(0.5);
    });
  });

  describe("User Story 40 - Napredne AI anomalije", () => {
    describe("OUT_OF_HOURS_ENTRY - Unos van radnog vremena", () => {
      test("trebalo bi detektovati unos u 22:00 kao van radnog vremena", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-01T22:00:00"));

        const expense = { ...validExpense };
        const context = {
          historicalExpenses: [],
          duplicateCandidates: [],
          budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
        };

        const result = aiService["fallbackExpenseAnalysis"](expense, context);

        expect(result.status).toBe("ANOMALIJA");
        const outOfHours = result.findings.find((f: any) => f.type === "OUT_OF_HOURS_ENTRY");
        expect(outOfHours).toBeDefined();

        jest.useRealTimers();
      });

      test("trebalo bi detektovati unos u subotu kao van radnog vremena", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-05-30T10:00:00")); // Subota

        const expense = { ...validExpense };
        const context = {
          historicalExpenses: [],
          duplicateCandidates: [],
          budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
        };

        const result = aiService["fallbackExpenseAnalysis"](expense, context);

        const outOfHours = result.findings.find((f: any) => f.type === "OUT_OF_HOURS_ENTRY");
        expect(outOfHours).toBeDefined();

        jest.useRealTimers();
      });

      test("trebalo bi prihvatiti unos u ponedjeljak u 10:00 kao radno vrijeme", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-01T10:00:00")); // Ponedjeljak

        const expense = { ...validExpense, iznos: 100 };
        const context = {
          historicalExpenses: [
            { iznos: 90 }, { iznos: 100 }, { iznos: 110 },
          ],
          duplicateCandidates: [],
          budget: { id: 1, planiraniIznos: 1000, potrosenoPrijeTroska: 100 },
        };

        const result = aiService["fallbackExpenseAnalysis"](expense, context);

        const outOfHours = result.findings.find((f: any) => f.type === "OUT_OF_HOURS_ENTRY");
        expect(outOfHours).toBeUndefined();

        jest.useRealTimers();
      });
    });

    describe("POTENCIJALNO_CIJEPANJE_RACUNA - Cijepanje računa", () => {
      test("trebalo bi detektovati cijepanje kada zbir malih troškova prelazi 1000 BAM", () => {
        const expense = { ...validExpense, iznos: 600, kategorijaId: 1, odjelId: 2 };
        const context = {
          historicalExpenses: [],
          duplicateCandidates: [],
          budget: { id: 1, planiraniIznos: 5000, potrosenoPrijeTroska: 100 },
          recentExpensesInCategory: [
            { id: 99, naziv: "Laptop", iznos: 500, kategorijaId: 1, odjelId: 2, datum: "2026-06-01" },
          ],
        };

        const result = aiService["fallbackExpenseAnalysis"](expense, context);

        const splitting = result.findings.find((f: any) => f.type === "POTENCIJALNO_CIJEPANJE_RACUNA");
        expect(splitting).toBeDefined();
        expect(splitting?.severity).toBe("MEDIUM");
      });

      test("ne treba detektovati cijepanje ako zbir ne prelazi 1000 BAM", () => {
        const expense = { ...validExpense, iznos: 300, kategorijaId: 1, odjelId: 2 };
        const context = {
          historicalExpenses: [],
          duplicateCandidates: [],
          budget: { id: 1, planiraniIznos: 5000, potrosenoPrijeTroska: 100 },
          recentExpensesInCategory: [
            { id: 99, naziv: "Laptop", iznos: 400, kategorijaId: 1, odjelId: 2, datum: "2026-06-01" },
          ],
        };

        const result = aiService["fallbackExpenseAnalysis"](expense, context);

        const splitting = result.findings.find((f: any) => f.type === "POTENCIJALNO_CIJEPANJE_RACUNA");
        expect(splitting).toBeUndefined();
      });

      test("ne treba detektovati cijepanje ako nema nedavnih troškova", () => {
        const expense = { ...validExpense, iznos: 600, kategorijaId: 1, odjelId: 2 };
        const context = {
          historicalExpenses: [],
          duplicateCandidates: [],
          budget: { id: 1, planiraniIznos: 5000, potrosenoPrijeTroska: 100 },
          recentExpensesInCategory: [],
        };

        const result = aiService["fallbackExpenseAnalysis"](expense, context);

        const splitting = result.findings.find((f: any) => f.type === "POTENCIJALNO_CIJEPANJE_RACUNA");
        expect(splitting).toBeUndefined();
      });
    });

    describe("collectExtraFindings - sakupljanje dodatnih nalaza", () => {
      test("trebalo bi vratiti prazan niz kad nema anomalija", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-01T10:00:00"));

        const expense = { ...validExpense, iznos: 100 };
        const context = {
          recentExpensesInCategory: [],
        };

        const findings = aiService["collectExtraFindings"](expense, context);
        expect(findings).toEqual([]);

        jest.useRealTimers();
      });

      test("trebalo bi vratiti obje anomalije kad su obje prisutne", () => {
        jest.useFakeTimers();
        jest.setSystemTime(new Date("2026-06-01T22:00:00"));

        const expense = { ...validExpense, iznos: 600, kategorijaId: 1, odjelId: 2 };
        const context = {
          recentExpensesInCategory: [
            { id: 99, naziv: "Laptop", iznos: 500, kategorijaId: 1, odjelId: 2, datum: "2026-06-01" },
          ],
        };

        const findings = aiService["collectExtraFindings"](expense, context);

        expect(findings.length).toBe(2);
        expect(findings.some((f: any) => f.type === "OUT_OF_HOURS_ENTRY")).toBe(true);
        expect(findings.some((f: any) => f.type === "POTENCIJALNO_CIJEPANJE_RACUNA")).toBe(true);

        jest.useRealTimers();
      });
    });

    describe("buildRecommendedAction - preporuke sistema", () => {
      test("kombinacija cijepanja i van radnog vremena", () => {
        const action = aiService["buildRecommendedAction"]([
          "POTENCIJALNO_CIJEPANJE_RACUNA",
          "OUT_OF_HOURS_ENTRY",
        ]);
        expect(action).toContain("malverzacije");
      });

      test("samo cijepanje računa", () => {
        const action = aiService["buildRecommendedAction"]([
          "POTENCIJALNO_CIJEPANJE_RACUNA",
        ]);
        expect(action).toContain("zaobilaženje limita");
      });

      test("samo van radnog vremena", () => {
        const action = aiService["buildRecommendedAction"]([
          "OUT_OF_HOURS_ENTRY",
        ]);
        expect(action).toContain("opravdan");
      });

      test("učestalo uređivanje", () => {
        const action = aiService["buildRecommendedAction"]([
          "UCESTALO_UREDREIVANJE",
        ]);
        expect(action).toContain("audit log");
      });

      test("učestalo brisanje", () => {
        const action = aiService["buildRecommendedAction"]([
          "UCESTALO_BRISANJE",
        ]);
        expect(action).toContain("audit log");
      });
    });
  });
});
