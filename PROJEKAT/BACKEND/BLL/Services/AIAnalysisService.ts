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

export type MonthlyTrendPoint = {
  mjesec: string;
  ukupniIznos: number;
  brojTroskova: number;
  prosjecniIznos: number;
};

export type BudzetPrediction = {
  sljedeciMjesec: string;
  predvideniIznos: number;
  donjaBoundary: number;
  gornjaBoundary: number;
  pouzdanostProcjene: "NISKA" | "SREDNJA" | "VISOKA";
};

export type DatabaseAnalysisResult = {
  analizaId: string | null;
  generisanoU: string;
  ukupnoTroskova: number;
  ukupniIznos: number;
  prosjecniMjesecniIznos: number;
  trenKretanja: "RAST" | "PAD" | "STABILAN";
  postotakPromjene: number;
  topKategorija: string | null;
  topOdjel: string | null;
  mjesecniTrendovi: MonthlyTrendPoint[];
  predvidjanjeBudzeta: BudzetPrediction[];
  preporuke: string[];
  sazetak: string;
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

  async analyzeFullDatabase(reportData: any, budgetData: any): Promise<DatabaseAnalysisResult> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.aiServiceUrl}/ai/database-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData, budgetData }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!response.ok) {
        throw new Error(`AI servis je vratio status ${response.status}.`);
      }

      return await response.json() as DatabaseAnalysisResult;
    } catch (_error) {
      return this.fallbackDatabaseAnalysis(reportData, budgetData);
    }
  }

  fallbackDatabaseAnalysis(reportData: any, budgetData: any): DatabaseAnalysisResult {
    const expenses: any[] = Array.isArray(reportData?.expenses) ? reportData.expenses : [];
    const budgets: any[] = Array.isArray(budgetData) ? budgetData : [];

    // Build monthly trend map
    const monthMap = new Map<string, { ukupniIznos: number; brojTroskova: number; label: string }>();
    for (const expense of expenses) {
      const datum = String(expense?.datum || "");
      const match = datum.match(/^(\d{4})-(\d{2})/);
      if (!match) continue;
      const key = `${match[1]}-${match[2]}`;
      const monthNames = ["Januar","Februar","Mart","April","Maj","Juni","Juli","August","Septembar","Oktobar","Novembar","Decembar"];
      const monthIndex = Number(match[2]) - 1;
      const label = `${monthNames[monthIndex] ?? match[2]} ${match[1]}`;
      const existing = monthMap.get(key) ?? { ukupniIznos: 0, brojTroskova: 0, label };
      existing.ukupniIznos += Number(expense?.iznos ?? 0);
      existing.brojTroskova += 1;
      monthMap.set(key, existing);
    }

    const sortedMonths = Array.from(monthMap.entries())
      .sort(([a], [b]) => a.localeCompare(b));

    const mjesecniTrendovi: MonthlyTrendPoint[] = sortedMonths.map(([, value]) => ({
      mjesec: value.label,
      ukupniIznos: Number(value.ukupniIznos.toFixed(2)),
      brojTroskova: value.brojTroskova,
      prosjecniIznos: value.brojTroskova > 0
        ? Number((value.ukupniIznos / value.brojTroskova).toFixed(2))
        : 0,
    }));

    // Trend direction – compare last 3 months vs prior 3 months
    const recentAmounts = sortedMonths.slice(-3).map(([, v]) => v.ukupniIznos);
    const olderAmounts = sortedMonths.slice(-6, -3).map(([, v]) => v.ukupniIznos);
    const recentAvg = recentAmounts.length > 0
      ? recentAmounts.reduce((s, v) => s + v, 0) / recentAmounts.length : 0;
    const olderAvg = olderAmounts.length > 0
      ? olderAmounts.reduce((s, v) => s + v, 0) / olderAmounts.length : 0;

    let trenKretanja: "RAST" | "PAD" | "STABILAN" = "STABILAN";
    let postotakPromjene = 0;
    if (olderAvg > 0) {
      postotakPromjene = Number((((recentAvg - olderAvg) / olderAvg) * 100).toFixed(2));
      if (postotakPromjene > 5) trenKretanja = "RAST";
      else if (postotakPromjene < -5) trenKretanja = "PAD";
    } else if (recentAvg > 0) {
      trenKretanja = "RAST";
      postotakPromjene = 100;
    }

    // Simple linear regression for budget prediction
    const lastSixMonths = sortedMonths.slice(-6);
    const predvidjanjeBudzeta: BudzetPrediction[] = [];
    if (lastSixMonths.length >= 2) {
      const amounts = lastSixMonths.map(([, v]) => v.ukupniIznos);
      const n = amounts.length;
      const meanX = (n - 1) / 2;
      const meanY = amounts.reduce((s, v) => s + v, 0) / n;
      let sxx = 0;
      let sxy = 0;
      for (let i = 0; i < n; i++) {
        sxx += (i - meanX) ** 2;
        sxy += (i - meanX) * (amounts[i] - meanY);
      }
      const slope = sxx !== 0 ? sxy / sxx : 0;
      const intercept = meanY - slope * meanX;
      const predictedNext = Math.max(0, intercept + slope * n);
      const predictedPlusOne = Math.max(0, intercept + slope * (n + 1));
      const stdDev = Math.sqrt(amounts.reduce((s, v) => s + (v - meanY) ** 2, 0) / n);

      const pouzdanost: "NISKA" | "SREDNJA" | "VISOKA" =
        lastSixMonths.length >= 6 ? "VISOKA" : lastSixMonths.length >= 4 ? "SREDNJA" : "NISKA";

      const lastKey = lastSixMonths[lastSixMonths.length - 1][0];
      const [lastYear, lastMonth] = lastKey.split("-").map(Number);
      const nextMonth1 = lastMonth === 12 ? 1 : lastMonth + 1;
      const nextYear1 = lastMonth === 12 ? lastYear + 1 : lastYear;
      const nextMonth2 = nextMonth1 === 12 ? 1 : nextMonth1 + 1;
      const nextYear2 = nextMonth1 === 12 ? nextYear1 + 1 : nextYear1;
      const monthNames = ["Januar","Februar","Mart","April","Maj","Juni","Juli","August","Septembar","Oktobar","Novembar","Decembar"];

      predvidjanjeBudzeta.push({
        sljedeciMjesec: `${monthNames[nextMonth1 - 1]} ${nextYear1}`,
        predvideniIznos: Number(predictedNext.toFixed(2)),
        donjaBoundary: Number(Math.max(0, predictedNext - stdDev).toFixed(2)),
        gornjaBoundary: Number((predictedNext + stdDev).toFixed(2)),
        pouzdanostProcjene: pouzdanost,
      });
      predvidjanjeBudzeta.push({
        sljedeciMjesec: `${monthNames[nextMonth2 - 1]} ${nextYear2}`,
        predvideniIznos: Number(predictedPlusOne.toFixed(2)),
        donjaBoundary: Number(Math.max(0, predictedPlusOne - stdDev).toFixed(2)),
        gornjaBoundary: Number((predictedPlusOne + stdDev).toFixed(2)),
        pouzdanostProcjene: pouzdanost,
      });
    }

    // Category and department breakdown
    const categoryTotals = new Map<string, number>();
    const departmentTotals = new Map<string, number>();
    let ukupniIznos = 0;
    for (const expense of expenses) {
      const amount = Number(expense?.iznos ?? 0);
      ukupniIznos += amount;
      const kat = expense?.kategorijaNaziv ?? "Nerasporedjeno";
      const odjel = expense?.odjelNaziv ?? "Nerasporedjeno";
      categoryTotals.set(kat, (categoryTotals.get(kat) ?? 0) + amount);
      departmentTotals.set(odjel, (departmentTotals.get(odjel) ?? 0) + amount);
    }
    const topKategorija = Array.from(categoryTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
    const topOdjel = Array.from(departmentTotals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;

    // Generate recommendations
    const preporuke: string[] = [];
    if (trenKretanja === "RAST") {
      preporuke.push(`Troškovi rastu po stopi od ${postotakPromjene}% u odnosu na prethodni period. Preporučujemo pregled budžeta.`);
    } else if (trenKretanja === "PAD") {
      preporuke.push(`Troškovi opadaju za ${Math.abs(postotakPromjene)}%. Uštede su vidljive u odnosu na prethodni period.`);
    } else {
      preporuke.push("Troškovi su stabilni. Nastavi pratiti budzet u narednom periodu.");
    }
    if (topKategorija) {
      preporuke.push(`Kategorija s najvišim troškovima je '${topKategorija}'. Razmotrite mogućnost optimizacije.`);
    }
    if (budgets.length > 0) {
      const totalBudget = budgets.reduce((s: number, b: any) => s + Number(b.planiraniIznos ?? 0), 0);
      if (totalBudget > 0 && ukupniIznos > totalBudget * 0.9) {
        preporuke.push("Ukupni troškovi su blizu ili premašuju ukupni budzet. Hitno je potrebna revizija troškova.");
      }
    }

    const sazetak = `Analiza obuhvata ${expenses.length} troškova u ukupnom iznosu od ${ukupniIznos.toFixed(2)} BAM raspoređenih kroz ${sortedMonths.length} mjeseci. Trend kretanja: ${trenKretanja === "RAST" ? "rast" : trenKretanja === "PAD" ? "pad" : "stabilan"}.`;

    return {
      analizaId: null,
      generisanoU: new Date().toISOString(),
      ukupnoTroskova: expenses.length,
      ukupniIznos: Number(ukupniIznos.toFixed(2)),
      prosjecniMjesecniIznos: sortedMonths.length > 0
        ? Number((ukupniIznos / sortedMonths.length).toFixed(2))
        : 0,
      trenKretanja,
      postotakPromjene,
      topKategorija,
      topOdjel,
      mjesecniTrendovi,
      predvidjanjeBudzeta,
      preporuke,
      sazetak,
    };
  }

}

module.exports = { AIAnalysisService };
