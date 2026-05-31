export {};

const { AIAnalysisService } = require("../BLL/Services/AIAnalysisService");

describe("AIAnalysisService fallback logic", () => {
  let svc: any;

  beforeEach(() => {
    svc = new AIAnalysisService("http://noop");
  });

  test("vraća VALIDAN kada nema signala", () => {
    const result = (svc as any).fallbackExpenseAnalysis({ iznos: 100 }, {});
    expect(result.status).toBe("VALIDAN");
    expect(result.findings).toHaveLength(0);
    expect(result.riskScore).toBeCloseTo(0.12, 2);
  });

  test("detektuje amount outlier kada je iznos znatno veci od prosjeka", () => {
    const expense = { iznos: 250 };
    const context = { historicalExpenses: [{ iznos: 50 }, { iznos: 40 }, { iznos: 30 }] };
    const result = (svc as any).fallbackExpenseAnalysis(expense, context);
    expect(result.status).toBe("ANOMALIJA");
    expect(result.findings.some((f: any) => f.type.includes("AMOUNT_OUTLIER"))).toBe(true);
    expect(result.severity).toBe("HIGH");
  });

  test("duplikat sam po sebi ostaje upozorenje, ne anomalija", () => {
    const expense = { iznos: 600, naziv: "Trosak", datum: "2026-04-20" };
    const context = {
      duplicateCandidates: [{ id: 1, iznos: 600, naziv: "Trosak", datum: "2026-04-20" }],
    };

    const result = (svc as any).fallbackExpenseAnalysis(expense, context);
    expect(result.status).toBe("VALIDAN");
    expect(result.findings.some((f: any) => f.type === "POTENCIJALNI_DUPLIKAT")).toBe(true);
    expect(result.severity).toBe("MEDIUM");
    expect(result.riskScore).toBeCloseTo(0.35, 2);
  });

  test("duplikat ne smije postati budzetska anomalija samo zato sto bi isti trosak bio uracunat dva puta", () => {
    const expense = { iznos: 600, naziv: "Trosak", datum: "2026-04-20" };
    const context = {
      duplicateCandidates: [{ id: 1, iznos: 600, naziv: "Trosak", datum: "2026-04-20" }],
      budget: { planiraniIznos: 500, potrosenoPrijeTroska: 0 },
    };

    const result = (svc as any).fallbackExpenseAnalysis(expense, context);
    expect(result.status).toBe("VALIDAN");
    expect(result.findings.some((f: any) => f.type === "POTENCIJALNI_DUPLIKAT")).toBe(true);
    expect(result.findings.some((f: any) => f.type === "BUDGET_EXCEEDED")).toBe(false);
    expect(result.severity).toBe("MEDIUM");
  });
});

describe("AIAnalysisService category suggestion", () => {
  let svc: any;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    svc = new AIAnalysisService("http://ai-service.test/");
    fetchSpy = jest.spyOn(global, "fetch" as any);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  test("salje zahtjev AI servisu i vraca prijedlog kategorije", async () => {
    const suggestion = {
      categoryId: "kat-1",
      categoryName: "Oprema",
      confidence: 0.84,
      reason: "Laptop pripada opremi.",
    };

    fetchSpy.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(suggestion),
    } as any);

    const payload = {
      naziv: "Laptop Lenovo",
      categories: [{ id: "kat-1", naziv: "Oprema" }],
    };

    const result = await svc.suggestExpenseCategory(payload);

    expect(result).toEqual(suggestion);
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://ai-service.test/ai/category-suggestion",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
    );
  });

  test("vraca kontrolisanu poruku kada AI servis vrati neuspjesan status", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 503,
      json: jest.fn(),
    } as any);

    const result = await svc.suggestExpenseCategory({ naziv: "Laptop" });

    expect(result).toEqual({
      categoryId: null,
      categoryName: null,
      confidence: 0,
      reason: "AI servis trenutno nije dostupan za prijedlog kategorije.",
    });
  });

  test("vraca kontrolisanu poruku kada poziv AI servisa pukne", async () => {
    fetchSpy.mockRejectedValue(new Error("network down"));

    const result = await svc.suggestExpenseCategory({ naziv: "Laptop" });

    expect(result.categoryId).toBeNull();
    expect(result.confidence).toBe(0);
    expect(result.reason).toBe("AI servis trenutno nije dostupan za prijedlog kategorije.");
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// fallbackDatabaseAnalysis – unit testovi
// ─────────────────────────────────────────────────────────────────────────────

describe("AIAnalysisService supplier growth and assistant", () => {
  let svc: any;

  beforeEach(() => {
    svc = new AIAnalysisService("http://noop");
  });

  const reportData = {
    summary: { totalAmount: 18000, budgetTotal: 20000 },
    breakdowns: {
      byCategory: [{ label: "Oprema", total: 12000 }],
      byDepartment: [{ label: "IT", total: 15000 }],
    },
    expenses: [
      { id: "1", datum: "2026-04-05", iznos: 1000, dobavljacId: "dell", dobavljacNaziv: "Dell", kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
      { id: "2", datum: "2026-05-05", iznos: 2000, dobavljacId: "dell", dobavljacNaziv: "Dell", kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
      { id: "3", datum: "2026-04-08", iznos: 1000, dobavljacId: "hp", dobavljacNaziv: "HP", kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
      { id: "4", datum: "2026-05-08", iznos: 1300, dobavljacId: "hp", dobavljacNaziv: "HP", kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
      { id: "5", datum: "2026-05-12", iznos: 7000, dobavljacId: "lenovo", dobavljacNaziv: "Lenovo", kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
    ],
  };

  test("getTopGrowingSuppliers racuna rast ispravno", () => {
    const result = svc.getTopGrowingSuppliers(reportData);
    const dell = result.suppliers.find((supplier: any) => supplier.supplierName === "Dell");

    expect(dell.currentAmount).toBe(2000);
    expect(dell.previousAmount).toBe(1000);
    expect(dell.growthPercentage).toBe(100);
    expect(dell.status).toBe("growth");
    expect(dell.riskLevel).toBe("HIGH");
  });

  test("getTopGrowingSuppliers ne dijeli nulom kada previousAmount iznosi 0", () => {
    const result = svc.getTopGrowingSuppliers(reportData);
    const lenovo = result.suppliers.find((supplier: any) => supplier.supplierName === "Lenovo");

    expect(lenovo.previousAmount).toBe(0);
    expect(lenovo.growthPercentage).toBeNull();
    expect(lenovo.status).toBe("new_spending");
    expect(lenovo.riskLevel).toBe("HIGH");
  });

  test("getTopGrowingSuppliers sortira dobavljace po rastu i nove po trenutnom iznosu", () => {
    const result = svc.getTopGrowingSuppliers(reportData);

    expect(result.suppliers[0].supplierName).toBe("Lenovo");
    expect(result.suppliers[1].supplierName).toBe("Dell");
    expect(result.suppliers[2].supplierName).toBe("HP");
  });

  test("askAssistant vraca odgovor za pitanje o dobavljacima", () => {
    const result = svc.askAssistant("Koji dobavljac ima najveci rast?", reportData, []);

    expect(result.intent).toBe("SUPPLIER_GROWTH");
    expect(result.answer).toContain("Lenovo");
    expect(result.data.suppliers).toHaveLength(3);
  });

  test("pitanje koji trosak je najveci vraca LARGEST_EXPENSE", () => {
    const result = svc.askAssistant("koji trosak je najveci", reportData, []);

    expect(result.intent).toBe("LARGEST_EXPENSE");
    expect(result.answer).toContain("Lenovo");
    expect(result.answer).toContain("7.000");
  });

  test("pitanje koji trošak je najveći radi sa dijakritikom", () => {
    const result = svc.askAssistant("koji trošak je najveći", reportData, []);

    expect(result.intent).toBe("LARGEST_EXPENSE");
    expect(result.answer).toContain("Lenovo");
  });

  test("pitanje kojih je 5 najvećih troškova vraca TOP_EXPENSES", () => {
    const result = svc.askAssistant("kojih je 5 najvećih troškova", reportData, []);

    expect(result.intent).toBe("TOP_EXPENSES");
    expect(result.data.expenses).toHaveLength(5);
    expect(result.answer).toContain("1.");
  });

  test("pitanje kome smo najviše platili vraca MOST_EXPENSIVE_SUPPLIER", () => {
    const result = svc.askAssistant("kome smo najviše platili", reportData, []);

    expect(result.intent).toBe("MOST_EXPENSIVE_SUPPLIER");
    expect(result.answer).toContain("Lenovo");
  });

  test("pitanje koliko je ostalo budžeta vraca BUDGET_REMAINING", () => {
    const result = svc.askAssistant("koliko je ostalo budžeta", reportData, []);

    expect(result.intent).toBe("BUDGET_REMAINING");
    expect(result.data.remaining).toBe(2000);
  });

  test("nepoznato pitanje vraca help odgovor sa primjerima", () => {
    const result = svc.askAssistant("Kakvo je vrijeme danas?", reportData, []);

    expect(result.intent).toBe("HELP");
    expect(result.answer).toContain("Mogu odgovoriti");
    expect(result.answer).toContain("Koji trosak je najveci?");
  });

  test("askAssistantWithGemini bez GEMINI_API_KEY vraca fallback odgovor", async () => {
    const result = await svc.askAssistantWithGemini("koji trosak je najveci", reportData, []);

    expect(result.source).toBe("fallback");
    expect(result.intent).toBe("LARGEST_EXPENSE");
  });

  test("askAssistantWithGemini vraca fallback ako Gemini poziv baci gresku", async () => {
    const previousKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";
    svc.geminiClient = {
      models: {
        generateContent: jest.fn().mockRejectedValue(new Error("Gemini down")),
      },
    };

    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => undefined);
    const result = await svc.askAssistantWithGemini("kome smo najvise platili", reportData, []);

    expect(result.source).toBe("fallback");
    expect(result.intent).toBe("MOST_EXPENSIVE_SUPPLIER");
    consoleSpy.mockRestore();
    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  });

  test("askAssistantWithGemini vraca Gemini odgovor kada SDK uspije", async () => {
    const previousKey = process.env.GEMINI_API_KEY;
    process.env.GEMINI_API_KEY = "test-key";
    svc.geminiClient = {
      models: {
        generateContent: jest.fn().mockResolvedValue({ text: "Najveci trosak je Lenovo." }),
      },
    };

    const result = await svc.askAssistantWithGemini("Koji trosak je najveci?", reportData, []);

    expect(result.source).toBe("gemini");
    expect(result.intent).toBe("GEMINI");
    expect(result.answer).toBe("Najveci trosak je Lenovo.");
    expect(result.data.topExpenses[0].iznos).toBe(7000);
    expect(result.data.topExpenses[0].dobavljac).toBe("Lenovo");

    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  });

  test("askAssistant prepoznaje najskuplju kategoriju preko breakdown podataka", () => {
    const result = svc.askAssistant("na sta najvise trosimo", reportData, []);

    expect(result.intent).toBe("MOST_EXPENSIVE_CATEGORY");
    expect(result.answer).toContain("Oprema");
    expect(result.data.total).toBe(12000);
  });

  test("askAssistant prepoznaje odjel sa najvecom potrosnjom", () => {
    const result = svc.askAssistant("koji odjel najvise trosi", reportData, []);

    expect(result.intent).toBe("MOST_EXPENSIVE_DEPARTMENT");
    expect(result.answer).toContain("IT");
  });

  test("askAssistant prijavljuje prekoracen budzet kada troskovi prelaze budzet", () => {
    const overBudgetReport = { ...reportData, summary: { totalAmount: 25000, budgetTotal: 20000 } };
    const result = svc.askAssistant("koliko je ostalo budzeta", overBudgetReport, []);

    expect(result.intent).toBe("BUDGET_REMAINING");
    expect(result.data.remaining).toBe(-5000);
    expect(result.answer).toContain("prekoracen");
  });

  test("askAssistant pronalazi najvecu anomaliju", () => {
    const anomalyReport = {
      ...reportData,
      expenses: [
        ...reportData.expenses,
        { id: "a1", naziv: "Sumnjivi server", datum: "2026-05-20", iznos: 9000, statusValidacije: "ANOMALIJA" },
        { id: "a2", naziv: "Dupli racun", datum: "2026-05-21", iznos: 500, statusValidacije: "POTENCIJALNI_DUPLIKAT" },
      ],
    };

    const result = svc.askAssistant("koja je najveca anomalija", anomalyReport, []);

    expect(result.intent).toBe("BIGGEST_ANOMALY");
    expect(result.answer).toContain("Sumnjivi server");
    expect(result.answer).toContain("ANOMALIJA");
  });

  test("askAssistant trend pitanja vracaju SPENDING_TREND intent", () => {
    const trendReport = {
      expenses: [
        { datum: "2026-01-01", iznos: 100, kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
        { datum: "2026-02-01", iznos: 100, kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
        { datum: "2026-03-01", iznos: 100, kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
        { datum: "2026-04-01", iznos: 500, kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
        { datum: "2026-05-01", iznos: 500, kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
        { datum: "2026-06-01", iznos: 500, kategorijaNaziv: "Oprema", odjelNaziv: "IT" },
      ],
    };

    const result = svc.askAssistant("da li troskovi rastu ili padaju", trendReport, []);

    expect(result.intent).toBe("SPENDING_TREND");
    expect(result.answer).toContain("rastu");
  });

  test("askAssistant koristi reportData.data kada expenses ne postoji", () => {
    const result = svc.askAssistant("koji trosak je najveci", {
      summary: { totalAmount: 300 },
      data: [
        { naziv: "Manji trosak", iznos: 100, datum: "2026-05-10" },
        { naziv: "Veci trosak", iznos: 200, datum: "2026-05-11" },
      ],
    }, []);

    expect(result.intent).toBe("LARGEST_EXPENSE");
    expect(result.answer).toContain("Veci trosak");
    expect(result.answer).toContain("11.05.2026");
  });

  test("askAssistant koristi reportData.items kada expenses i data ne postoje", () => {
    const result = svc.askAssistant("kojih je 5 najvecih troskova", {
      items: [
        { naziv: "Prvi", iznos: 10 },
        { naziv: "Drugi", iznos: 20 },
      ],
    }, []);

    expect(result.intent).toBe("TOP_EXPENSES");
    expect(result.data.expenses[0].naziv).toBe("Drugi");
  });
});

describe("AIAnalysisService dashboard AI helpers", () => {
  let svc: any;

  beforeEach(() => {
    svc = new AIAnalysisService("http://noop");
  });

  const helperReport = {
    summary: {
      totalExpenses: 8,
      totalAmount: 20000,
      averageAmount: 2500,
      budgetTotal: 25000,
      budgetUtilizationPercent: 80,
      topCategory: { label: "IT oprema", total: 12000 },
      topDepartment: { label: "IT", total: 15000 },
    },
    breakdowns: {
      byCategory: [{ label: "IT oprema", total: 12000 }, { label: "Zakup", total: 8000 }],
      byDepartment: [{ label: "IT", total: 15000 }, { label: "Finansije", total: 5000 }],
    },
    expenses: [
      { id: "1", naziv: "Internet usluge", datum: "2026-01-15", iznos: 120, kategorijaNaziv: "Usluge", odjelNaziv: "IT", dobavljacId: "tel", dobavljacNaziv: "Telekom" },
      { id: "2", naziv: "Internet usluge", datum: "2026-02-15", iznos: 121, kategorijaNaziv: "Usluge", odjelNaziv: "IT", dobavljacId: "tel", dobavljacNaziv: "Telekom" },
      { id: "3", naziv: "Internet usluge", datum: "2026-03-15", iznos: 119, kategorijaNaziv: "Usluge", odjelNaziv: "IT", dobavljacId: "tel", dobavljacNaziv: "Telekom" },
      { id: "4", naziv: "Laptop Dell", datum: "2026-04-10", iznos: 3000, kategorijaNaziv: "IT oprema", odjelNaziv: "IT", dobavljacId: "dell", dobavljacNaziv: "Dell" },
      { id: "5", naziv: "Laptop Dell", datum: "2026-05-10", iznos: 7000, kategorijaNaziv: "IT oprema", odjelNaziv: "IT", dobavljacId: "dell", dobavljacNaziv: "Dell", statusValidacije: "ANOMALIJA" },
      { id: "6", naziv: "Zakup", datum: "2026-05-01", iznos: 8000, kategorijaNaziv: "Zakup", odjelNaziv: "Finansije", dobavljacId: "rent", dobavljacNaziv: "RentCo" },
    ],
  };

  test("getExecutiveSummary vraca vise poruka sa tipovima", () => {
    const result = svc.getExecutiveSummary(helperReport, [{ planiraniIznos: 25000 }]);

    expect(result.summary.length).toBeGreaterThanOrEqual(3);
    expect(result.summary.every((item: any) => ["INFO", "WARNING", "SUCCESS"].includes(item.type))).toBe(true);
  });

  test("explainAnomaly vraca objasnjenje za postojeci trosak", () => {
    const result = svc.explainAnomaly("5", helperReport);

    expect(result.explanation).toContain("7.000");
    expect(result.explanation).toContain("IT oprema");
    expect(["LOW", "MEDIUM", "HIGH"]).toContain(result.severity);
  });

  test("explainAnomaly vraca kontrolisan odgovor za nepostojeci trosak", () => {
    const result = svc.explainAnomaly("missing", helperReport);

    expect(result.severity).toBe("LOW");
    expect(result.explanation).toContain("nije pronadjen");
  });

  test("getCostOptimizationSuggestions uvijek vraca barem jednu preporuku", () => {
    const result = svc.getCostOptimizationSuggestions(helperReport, [{ planiraniIznos: 25000 }]);

    expect(result.suggestions.length).toBeGreaterThan(0);
    expect(result.suggestions[0]).toHaveProperty("title");
    expect(result.suggestions[0]).toHaveProperty("description");
    expect(result.suggestions[0]).toHaveProperty("estimatedImpact");
  });

  test("detectMissingRecurringExpenses pronalazi redovan trosak koji nedostaje u trenutnom mjesecu", () => {
    const result = svc.detectMissingRecurringExpenses(helperReport);

    expect(result.missingRecurringExpenses.some((item: any) => item.expenseName.includes("internet usluge"))).toBe(true);
    expect(result.missingRecurringExpenses[0].lastSeenDate).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
  });

  test("getSupplierDependencyRisk detektuje dobavljaca sa preko 50 posto kategorije", () => {
    const result = svc.getSupplierDependencyRisk(helperReport);

    expect(result.risks.length).toBeGreaterThan(0);
    expect(result.risks.some((risk: any) => risk.riskLevel === "HIGH")).toBe(true);
  });

  test("buildAssistantContextData ne salje cijelu bazu nego kompaktne top liste", () => {
    const manyExpenses = Array.from({ length: 20 }, (_, index) => ({
      id: String(index + 1),
      naziv: `Trosak ${index + 1}`,
      datum: "2026-05-01",
      iznos: index + 1,
      kategorijaNaziv: "Kategorija",
      odjelNaziv: "Odjel",
      dobavljacNaziv: "Dobavljac",
    }));
    const result = (svc as any).buildAssistantContextData({ expenses: manyExpenses, summary: { totalAmount: 210 } }, []);

    expect(result.topExpenses).toHaveLength(10);
    expect(result.categories.length).toBeLessThanOrEqual(10);
    expect(result.departments.length).toBeLessThanOrEqual(10);
  });
});

describe("AIAnalysisService – fallbackDatabaseAnalysis", () => {
  let svc: any;

  beforeEach(() => {
    svc = new AIAnalysisService("http://noop");
  });

  const makeExpense = (datum: string, iznos: number, kategorijaNaziv = "Plate", odjelNaziv = "IT") => ({
    datum,
    iznos,
    kategorijaNaziv,
    odjelNaziv,
  });

  test("vraća sve obavezne ključeve rezultata", () => {
    const result = svc.fallbackDatabaseAnalysis({ expenses: [] }, []);

    expect(result).toHaveProperty("analizaId");
    expect(result).toHaveProperty("generisanoU");
    expect(result).toHaveProperty("ukupnoTroskova");
    expect(result).toHaveProperty("ukupniIznos");
    expect(result).toHaveProperty("prosjecniMjesecniIznos");
    expect(result).toHaveProperty("trenKretanja");
    expect(result).toHaveProperty("postotakPromjene");
    expect(result).toHaveProperty("topKategorija");
    expect(result).toHaveProperty("topOdjel");
    expect(result).toHaveProperty("mjesecniTrendovi");
    expect(result).toHaveProperty("predvidjanjeBudzeta");
    expect(result).toHaveProperty("preporuke");
    expect(result).toHaveProperty("sazetak");
  });

  test("vraća STABILAN trend i 0 troškova za praznu bazu", () => {
    const result = svc.fallbackDatabaseAnalysis({ expenses: [] }, []);

    expect(result.trenKretanja).toBe("STABILAN");
    expect(result.ukupnoTroskova).toBe(0);
    expect(result.ukupniIznos).toBe(0);
    expect(result.topKategorija).toBeNull();
    expect(result.topOdjel).toBeNull();
    expect(result.predvidjanjeBudzeta).toHaveLength(0);
  });

  test("ispravno gradi mjesecne trendove za više troškova", () => {
    const expenses = [
      makeExpense("2026-01-10", 500),
      makeExpense("2026-01-20", 300),
      makeExpense("2026-02-05", 800),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.ukupnoTroskova).toBe(3);
    expect(result.ukupniIznos).toBeCloseTo(1600, 1);
    expect(result.mjesecniTrendovi).toHaveLength(2);

    const jan = result.mjesecniTrendovi.find((m: any) => m.mjesec.startsWith("Januar"));
    expect(jan).toBeDefined();
    expect(jan.ukupniIznos).toBeCloseTo(800, 1);
    expect(jan.brojTroskova).toBe(2);
  });

  test("detektuje trend RAST kada su noviji troškovi veći", () => {
    // Stariji period (3 mj): avg 100
    // Noviji period (3 mj): avg ~300
    const expenses = [
      makeExpense("2025-10-01", 100),
      makeExpense("2025-11-01", 100),
      makeExpense("2025-12-01", 100),
      makeExpense("2026-01-01", 300),
      makeExpense("2026-02-01", 300),
      makeExpense("2026-03-01", 300),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.trenKretanja).toBe("RAST");
    expect(result.postotakPromjene).toBeGreaterThan(5);
  });

  test("detektuje trend PAD kada su noviji troškovi manji", () => {
    const expenses = [
      makeExpense("2025-10-01", 300),
      makeExpense("2025-11-01", 300),
      makeExpense("2025-12-01", 300),
      makeExpense("2026-01-01", 100),
      makeExpense("2026-02-01", 100),
      makeExpense("2026-03-01", 100),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.trenKretanja).toBe("PAD");
    expect(result.postotakPromjene).toBeLessThan(-5);
  });

  test("generira predviđanje za 2 naredna mjeseca kad ima >= 2 måneder s podacima", () => {
    const expenses = [
      makeExpense("2026-01-01", 1000),
      makeExpense("2026-02-01", 1200),
      makeExpense("2026-03-01", 1100),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.predvidjanjeBudzeta).toHaveLength(2);
    const [pred1, pred2] = result.predvidjanjeBudzeta;
    expect(pred1.predvideniIznos).toBeGreaterThanOrEqual(0);
    expect(pred2.predvideniIznos).toBeGreaterThanOrEqual(0);
    expect(pred1.donjaBoundary).toBeLessThanOrEqual(pred1.predvideniIznos);
    expect(pred1.gornjaBoundary).toBeGreaterThanOrEqual(pred1.predvideniIznos);
  });

  test("predviđanje ima pouzdanost VISOKA kada ima >= 6 mjeseci podataka", () => {
    const expenses = [
      makeExpense("2025-10-01", 1000),
      makeExpense("2025-11-01", 1000),
      makeExpense("2025-12-01", 1000),
      makeExpense("2026-01-01", 1000),
      makeExpense("2026-02-01", 1000),
      makeExpense("2026-03-01", 1000),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.predvidjanjeBudzeta[0].pouzdanostProcjene).toBe("VISOKA");
  });

  test("prepoznaje top kategoriju i top odjel", () => {
    const expenses = [
      makeExpense("2026-01-01", 5000, "Plate", "IT"),
      makeExpense("2026-01-02", 1000, "Oprema", "HR"),
      makeExpense("2026-01-03", 2000, "Plate", "IT"),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.topKategorija).toBe("Plate");
    expect(result.topOdjel).toBe("IT");
  });

  test("generira preporuku o rastu troškova", () => {
    const expenses = [
      makeExpense("2025-10-01", 100),
      makeExpense("2025-11-01", 100),
      makeExpense("2025-12-01", 100),
      makeExpense("2026-01-01", 500),
      makeExpense("2026-02-01", 500),
      makeExpense("2026-03-01", 500),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.preporuke.some((p: string) => p.includes("rastu"))).toBe(true);
  });

  test("upozorava na prekoračenje budžeta ako troškovi prelaze 90% budžeta", () => {
    const expenses = [
      makeExpense("2026-01-01", 9500),
    ];
    const budgets = [{ planiraniIznos: 10000 }];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, budgets);

    expect(result.preporuke.some((p: string) => p.toLowerCase().includes("budzet") || p.toLowerCase().includes("budžet"))).toBe(true);
  });

  test("sažetak sadrži broj troškova i ukupni iznos", () => {
    const expenses = [
      makeExpense("2026-01-01", 1000),
      makeExpense("2026-02-01", 2000),
    ];

    const result = svc.fallbackDatabaseAnalysis({ expenses }, []);

    expect(result.sazetak).toContain("2");
    expect(result.sazetak).toContain("3000.00");
  });

  test("ne baca grešku za troškove bez datuma", () => {
    const expenses = [
      { iznos: 500, kategorijaNaziv: "Plate", odjelNaziv: "IT" }, // bez datum
      makeExpense("2026-01-01", 300),
    ];

    expect(() => svc.fallbackDatabaseAnalysis({ expenses }, [])).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// analyzeFullDatabase – AI servis i fallback integracija
// ─────────────────────────────────────────────────────────────────────────────

describe("AIAnalysisService – analyzeFullDatabase (fetch)", () => {
  let svc: any;
  let fetchSpy: jest.SpyInstance;

  beforeEach(() => {
    svc = new AIAnalysisService("http://ai-service.test/");
    fetchSpy = jest.spyOn(global, "fetch" as any);
  });

  afterEach(() => {
    fetchSpy.mockRestore();
  });

  const sampleReport = {
    expenses: [{ datum: "2026-01-01", iznos: 500, kategorijaNaziv: "Plate", odjelNaziv: "IT" }],
  };
  const sampleBudgets = [{ planiraniIznos: 10000 }];

  test("šalje POST zahtjev na /ai/database-analysis i vraća rezultat AI servisa", async () => {
    const aiResult = {
      analizaId: "ai-123",
      generisanoU: new Date().toISOString(),
      trenKretanja: "STABILAN",
      postotakPromjene: 0,
      ukupnoTroskova: 1,
      ukupniIznos: 500,
      prosjecniMjesecniIznos: 500,
      topKategorija: "Plate",
      topOdjel: "IT",
      mjesecniTrendovi: [],
      predvidjanjeBudzeta: [],
      preporuke: [],
      sazetak: "AI analiza",
    };

    fetchSpy.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue(aiResult),
    } as any);

    const result = await svc.analyzeFullDatabase(sampleReport, sampleBudgets);

    expect(result).toEqual(aiResult);
    expect(fetchSpy).toHaveBeenCalledWith(
      "http://ai-service.test/ai/database-analysis",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData: sampleReport, budgetData: sampleBudgets }),
      })
    );
  });

  test("pada na fallback kada AI servis vrati neuspješan status", async () => {
    fetchSpy.mockResolvedValue({
      ok: false,
      status: 503,
    } as any);

    const result = await svc.analyzeFullDatabase(sampleReport, sampleBudgets);

    // Fallback mora biti pozvan – provjerimo strukturu odgovora
    expect(result).toHaveProperty("trenKretanja");
    expect(result).toHaveProperty("predvidjanjeBudzeta");
    expect(result.analizaId).toBeNull();
  });

  test("pada na fallback kada fetch baci mrežnu grešku", async () => {
    fetchSpy.mockRejectedValue(new Error("Network error"));

    const result = await svc.analyzeFullDatabase(sampleReport, sampleBudgets);

    expect(result).toHaveProperty("trenKretanja");
    expect(result.analizaId).toBeNull();
  });
});
