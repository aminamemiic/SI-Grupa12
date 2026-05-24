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
