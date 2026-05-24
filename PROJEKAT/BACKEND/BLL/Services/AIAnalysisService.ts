type ExpenseAnalysisFinding = {
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  evidence?: Record<string, unknown>;
};

type ExpenseAnalysisResult = {
  status: "VALIDAN" | "ANOMALIJA";
  riskScore: number;
  severity: "LOW" | "MEDIUM" | "HIGH";
  findings: ExpenseAnalysisFinding[];
  explanation: string;
  recommendedAction: string;
};

type CategorySuggestionResult = {
  categoryId: string | null;
  categoryName: string | null;
  confidence: number;
  reason: string;
};

export class AIAnalysisService {
  private readonly aiServiceUrl: string;

  constructor(aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000") {
    this.aiServiceUrl = aiServiceUrl.replace(/\/+$/, "");
  }

  async analyzeExpense(expense: any, context: any): Promise<ExpenseAnalysisResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${this.aiServiceUrl}/ai/expense-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expense, context }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`AI servis je vratio status ${response.status}.`);
      }

      return await response.json() as ExpenseAnalysisResult;
    } catch (_error) {
      return this.fallbackExpenseAnalysis(expense, context);
    }
  }

  async suggestExpenseCategory(payload: any): Promise<CategorySuggestionResult> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(`${this.aiServiceUrl}/ai/category-suggestion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI servis je vratio status ${response.status}.`);
      }

      return await response.json() as CategorySuggestionResult;
    } catch (_error) {
      return {
        categoryId: null,
        categoryName: null,
        confidence: 0,
        reason: "AI servis trenutno nije dostupan za prijedlog kategorije.",
      };
    } finally {
      clearTimeout(timeout);
    }
  }

  private fallbackExpenseAnalysis(expense: any, context: any): ExpenseAnalysisResult {
    const amount = Number(expense?.iznos || 0);
    const historicalAmounts = Array.isArray(context?.historicalExpenses)
      ? context.historicalExpenses.map((item: any) => Number(item.iznos)).filter((value: number) => Number.isFinite(value) && value > 0)
      : [];
    const findings: ExpenseAnalysisFinding[] = [];

    if (historicalAmounts.length >= 3) {
      const average = historicalAmounts.reduce((sum: number, value: number) => sum + value, 0) / historicalAmounts.length;
      if (average > 0 && amount >= average * 2.5) {
        findings.push({
          type: "AMOUNT_OUTLIER",
          severity: "HIGH",
          message: `Iznos je ${(amount / average).toFixed(1)} puta veci od prosjeka slicnih troskova.`,
          evidence: {
            currentAmount: amount,
            averageAmount: Number(average.toFixed(2)),
            sampleSize: historicalAmounts.length,
          },
        });
      }
    }

    const duplicateCandidates = Array.isArray(context?.duplicateCandidates) ? context.duplicateCandidates : [];
    if (duplicateCandidates.length > 0) {
      findings.push({
        type: "POSSIBLE_DUPLICATE",
        severity: "HIGH",
        message: "Pronadjen je moguci dupli trosak sa istim nazivom, iznosom i datumom.",
        evidence: { duplicateCount: duplicateCandidates.length },
      });
    }

    const budget = context?.budget;
    if (budget && Number.isFinite(Number(budget.planiraniIznos))) {
      const planned = Number(budget.planiraniIznos);
      const spentBefore = Number(budget.potrosenoPrijeTroska || 0);
      const projected = spentBefore + amount;
      if (planned > 0 && projected > planned) {
        findings.push({
          type: "BUDGET_EXCEEDED",
          severity: "HIGH",
          message: "Trosak bi doveo do prekoracenja planiranog budzeta.",
          evidence: {
            plannedAmount: planned,
            spentBefore,
            projectedSpent: projected,
            deviation: Number((projected - planned).toFixed(2)),
          },
        });
      }
    }

    const riskScore = findings.length > 0 ? 0.9 : 0.12;
    const status = findings.length > 0 ? "ANOMALIJA" : "VALIDAN";
    const explanation = findings.length > 0
      ? findings.map((finding) => finding.message).join(" ")
      : "AI analiza nije pronasla znacajna odstupanja za uneseni trosak.";

    return {
      status,
      riskScore,
      severity: findings.some((finding) => finding.severity === "HIGH") ? "HIGH" : "LOW",
      findings,
      explanation,
      recommendedAction: findings.length > 0
        ? "Provjeriti trosak i pratecu dokumentaciju prije dalje obrade."
        : "Nije potrebna dodatna akcija.",
    };
  }

}

module.exports = { AIAnalysisService };
