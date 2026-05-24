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
    expect(result.findings.some((f: any) => f.type === "AMOUNT_OUTLIER")).toBe(true);
    expect(result.severity).toBe("HIGH");
  });

  test("detektuje duplikat i prekoracen budzet", () => {
    const expense = { iznos: 600, naziv: "Trosak" };
    const context = {
      duplicateCandidates: [{}, {}],
      budget: { planiraniIznos: 500, potrosenoPrijeTroska: 0 },
    };

    const result = (svc as any).fallbackExpenseAnalysis(expense, context);
    expect(result.findings.some((f: any) => f.type === "POSSIBLE_DUPLICATE")).toBe(true);
    expect(result.findings.some((f: any) => f.type === "BUDGET_EXCEEDED")).toBe(true);
    expect(result.severity).toBe("HIGH");
  });
});
