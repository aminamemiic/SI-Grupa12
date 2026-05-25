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

  // ─────────────────────────────────────────────────────────────
  // String similarity helper for fuzzy matching
  // ─────────────────────────────────────────────────────────────
  private calculateLevenshteinDistance(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    const lens = [s1.length, s2.length];
    const max = Math.max(...lens);
    const min = Math.min(...lens);

    if (max === 0) return 0;

    const dist: number[][] = Array(min + 1)
      .fill(null)
      .map(() => Array(max + 1).fill(0));

    for (let i = 0; i <= max; i++) {
      dist[0][i] = i;
    }
    for (let i = 0; i <= min; i++) {
      dist[i][0] = i;
    }

    for (let i = 1; i <= min; i++) {
      for (let j = 1; j <= max; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
        dist[i][j] = Math.min(dist[i - 1][j] + 1, dist[i][j - 1] + 1, dist[i - 1][j - 1] + cost);
      }
    }

    return dist[min][max];
  }

  private getStringSimilarity(str1: string, str2: string): number {
    const maxLen = Math.max(str1.length, str2.length);
    if (maxLen === 0) return 1;
    const distance = this.calculateLevenshteinDistance(str1, str2);
    const levenshteinSimilarity = 1 - distance / maxLen;
    const commonPrefixLength = this.getCommonPrefixLength(str1, str2);
    const prefixBoost = Math.min(0.1, commonPrefixLength * 0.01);
    return Math.min(1, levenshteinSimilarity + prefixBoost);
  }

  private getCommonPrefixLength(str1: string, str2: string): number {
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    const maxPrefixLength = Math.min(s1.length, s2.length, 10);

    for (let i = 0; i < maxPrefixLength; i++) {
      if (s1[i] !== s2[i]) {
        return i;
      }
    }

    return maxPrefixLength;
  }

  // ─────────────────────────────────────────────────────────────
  // Statistical helpers for outlier detection
  // ─────────────────────────────────────────────────────────────
  private calculateMean(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, v) => sum + v, 0) / values.length;
  }

  private calculateStandardDeviation(values: number[]): number {
    if (values.length < 2) return 0;
    const mean = this.calculateMean(values);
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateInterquartileRange(values: number[]): { q1: number; q3: number; iqr: number } {
    if (values.length < 2) return { q1: values[0] || 0, q3: values[0] || 0, iqr: 0 };

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    const q1 = sorted[Math.floor(mid / 2)];
    const q3 = sorted[mid + Math.floor((sorted.length - mid) / 2)];

    return { q1, q3, iqr: q3 - q1 };
  }

  // ─────────────────────────────────────────────────────────────
  // Anomaly detection helpers
  // ─────────────────────────────────────────────────────────────
  private detectAmountOutlier(amount: number, historicalAmounts: number[]): ExpenseAnalysisFinding | null {
    if (historicalAmounts.length < 3) return null;

    // Method 1: Simple threshold (2.5x average)
    const average = this.calculateMean(historicalAmounts);
    if (average > 0 && amount >= average * 2.5) {
      return {
        type: "AMOUNT_OUTLIER_THRESHOLD",
        severity: "HIGH",
        message: `Iznos je ${(amount / average).toFixed(1)} puta veći od prosječnih troškova.`,
        evidence: {
          currentAmount: amount,
          averageAmount: Number(average.toFixed(2)),
          sampleSize: historicalAmounts.length,
        },
      };
    }

    // Method 2: Z-score outlier detection (> 2.5 standard deviations)
    const stdDev = this.calculateStandardDeviation(historicalAmounts);
    if (stdDev > 0) {
      const zScore = Math.abs((amount - average) / stdDev);
      if (zScore > 2.5) {
        return {
          type: "AMOUNT_OUTLIER_ZSCORE",
          severity: zScore > 3.5 ? "HIGH" : "MEDIUM",
          message: `Iznos značajno odstupa od istorijskih vrijednosti (Z-score: ${zScore.toFixed(2)}).`,
          evidence: {
            currentAmount: amount,
            averageAmount: Number(average.toFixed(2)),
            stdDeviation: Number(stdDev.toFixed(2)),
            zScore: Number(zScore.toFixed(2)),
            sampleSize: historicalAmounts.length,
          },
        };
      }
    }

    // Method 3: IQR-based outlier detection
    const { q1, q3, iqr } = this.calculateInterquartileRange(historicalAmounts);
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;

    if (amount > upperBound) {
      return {
        type: "AMOUNT_OUTLIER_IQR",
        severity: "MEDIUM",
        message: `Iznos prelazi gornju granicu rasporeda vrijednosti (${upperBound.toFixed(2)}).`,
        evidence: {
          currentAmount: amount,
          q1: Number(q1.toFixed(2)),
          q3: Number(q3.toFixed(2)),
          upperBound: Number(upperBound.toFixed(2)),
        },
      };
    }

    return null;
  }

  private detectDuplicates(
    expense: any,
    duplicateCandidates: any[]
  ): ExpenseAnalysisFinding | null {
    if (duplicateCandidates.length === 0) return null;

    const expenseName = expense.naziv?.trim().toLowerCase() || "";
    const expenseAmount = Number(expense.iznos || 0);

    // Check for exact matches first
    const exactMatches = duplicateCandidates.filter(
      (candidate) =>
        candidate.naziv?.trim().toLowerCase() === expenseName &&
        Number(candidate.iznos || 0) === expenseAmount &&
        candidate.datum === expense.datum
    );

    if (exactMatches.length > 0) {
      return {
        type: "POTENCIJALNI_DUPLIKAT",
        severity: "MEDIUM",
        message: `Pronađeno je ${exactMatches.length} mogućih duplikata sa istim nazivom, iznosom i datumom.`,
        evidence: {
          duplicateKind: "EXACT",
          matchCount: exactMatches.length,
          duplicates: exactMatches.map((d) => ({
            id: d.id,
            naziv: d.naziv,
            iznos: d.iznos,
            datum: d.datum,
          })),
        },
      };
    }

    // Check for fuzzy matches on name and similar amounts
    for (const candidate of duplicateCandidates) {
      const candidateName = candidate.naziv?.trim().toLowerCase() || "";
      const candidateAmount = Number(candidate.iznos || 0);
      const similarity = this.getStringSimilarity(expenseName, candidateName);
      const amountDifference = Math.abs(expenseAmount - candidateAmount);
      const maxAmount = Math.max(expenseAmount, candidateAmount);
      const amountSimilarity = maxAmount > 0 ? 1 - amountDifference / maxAmount : 0;

      // If names are very similar (>80%) and amounts are similar (>95%), flag as potential duplicate
      if (similarity > 0.8 && amountSimilarity > 0.95) {
        // Also check if dates are close (within 3 days)
        const expenseDate = new Date(expense.datum).getTime();
        const candidateDate = new Date(candidate.datum).getTime();
        const daysDifference = Math.abs(expenseDate - candidateDate) / (1000 * 60 * 60 * 24);

        if (daysDifference <= 3) {
          return {
            type: "POTENCIJALNI_DUPLIKAT",
            severity: "MEDIUM",
            message: `Pronađen je mogući dupli trošak sa sličnim nazivom, iznosom i datumom.`,
            evidence: {
              duplicateKind: "FUZZY",
              similarity: Number(similarity.toFixed(2)),
              amountSimilarity: Number(amountSimilarity.toFixed(2)),
              daysDifference: Number(daysDifference.toFixed(1)),
              candidateId: candidate.id,
              candidateName: candidate.naziv,
              candidateAmount: candidateAmount,
              candidateDate: candidate.datum,
            },
          };
        }
      }
    }

    // Check for same vendor multiple times in same day
    const sameVendorSameDay = duplicateCandidates.filter(
      (candidate) =>
        candidate.naziv?.trim().toLowerCase().includes(expenseName.split(" ")[0]) &&
        candidate.datum === expense.datum
    );

    if (sameVendorSameDay.length >= 2) {
      return {
        type: "POTENCIJALNI_DUPLIKAT",
        severity: "MEDIUM",
        message: `Pronađeni su višestruki troškovi od istog dobavljača u istom danu.`,
        evidence: {
          duplicateKind: "REPEATED_VENDOR",
          vendorName: sameVendorSameDay[0].naziv,
          occurrences: sameVendorSameDay.length,
          date: expense.datum,
        },
      };
    }

    return null;
  }

  private detectUnrealisticValues(expense: any): ExpenseAnalysisFinding | null {
    const amount = Number(expense.iznos || 0);

    // Detect extremely small amounts (potential data entry errors)
    if (amount > 0 && amount < 0.01) {
      return {
        type: "UNREALISTIC_AMOUNT_TOO_SMALL",
        severity: "LOW",
        message: "Iznos je izuzetno mali. Provjerite da li je ispravno unesen.",
        evidence: { amount },
      };
    }

    // Detect very large amounts (potential data entry errors with extra zeros)
    if (amount > 1000000) {
      return {
        type: "UNREALISTIC_AMOUNT_TOO_LARGE",
        severity: "HIGH",
        message: "Iznos je izuzetno veliki. Provjerite da li su slučajno dodani dodatni nuli.",
        evidence: { amount },
      };
    }

    // Detect suspiciously round amounts that might indicate estimates
    const amountStr = amount.toFixed(2);
    if (amountStr.endsWith("00") || amountStr.endsWith("000")) {
      // This is just a note, not necessarily an error
      return null;
    }

    return null;
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

      const analysis = await response.json() as ExpenseAnalysisResult;
      return this.applyRequiredBudgetRule(analysis, expense, context);
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
      ? context.historicalExpenses
          .map((item: any) => Number(item.iznos))
          .filter((value: number) => Number.isFinite(value) && value > 0)
      : [];
    const findings: ExpenseAnalysisFinding[] = [];

    // 1. Check for unrealistic values (data entry errors)
    const unrealisticFinding = this.detectUnrealisticValues(expense);
    if (unrealisticFinding) {
      findings.push(unrealisticFinding);
    }

    // 2. Check for amount outliers using multiple methods
    if (historicalAmounts.length >= 3) {
      const outlierFinding = this.detectAmountOutlier(amount, historicalAmounts);
      if (outlierFinding) {
        findings.push(outlierFinding);
      }
    }

    // 3. Check for duplicates (exact and fuzzy matching)
    const duplicateCandidates = Array.isArray(context?.duplicateCandidates)
      ? context.duplicateCandidates
      : [];
    const duplicateFinding = this.detectDuplicates(expense, duplicateCandidates);
    if (duplicateFinding) {
      findings.push(duplicateFinding);
    }

    // 4. Check budget constraints. Potential duplicates are not counted as new budget
    // consumption until they are reviewed, otherwise the same invoice can create a
    // false budget-exceeded anomaly.
    const budget = context?.budget;
    const missingBudgetFinding = this.getMissingBudgetFinding(expense, context, duplicateFinding);
    if (missingBudgetFinding) {
      findings.push(missingBudgetFinding);
    }

    if (!duplicateFinding && budget && Number.isFinite(Number(budget.planiraniIznos))) {
      const planned = Number(budget.planiraniIznos);
      const spentBefore = Number(budget.potrosenoPrijeTroska || 0);
      const projected = spentBefore + amount;
      if (planned > 0 && projected > planned) {
        const percentageOverBudget = ((projected - planned) / planned * 100).toFixed(1);
        findings.push({
          type: "BUDGET_EXCEEDED",
          severity: "HIGH",
          message: `Trošak bi doveo do prekoračenja planiranog budžeta za ${percentageOverBudget}%.`,
          evidence: {
            plannedAmount: planned,
            spentBefore,
            projectedSpent: projected,
            deviation: Number((projected - planned).toFixed(2)),
            percentageOverBudget: parseFloat(percentageOverBudget),
          },
        });
      }
    }

    const anomalyFindings = findings.filter((finding) => this.isAnomalyFinding(finding));

    // Calculate risk score based on anomaly severity. Duplicate-only findings are warnings.
    let riskScore = 0.12; // Default low risk
    if (anomalyFindings.length > 0) {
      const highSeverityCount = anomalyFindings.filter((f) => f.severity === "HIGH").length;
      const mediumSeverityCount = anomalyFindings.filter((f) => f.severity === "MEDIUM").length;
      riskScore = Math.min(0.95, 0.3 + highSeverityCount * 0.3 + mediumSeverityCount * 0.15);
    } else if (findings.length > 0) {
      riskScore = 0.35;
    }

    const status = anomalyFindings.length > 0 ? "ANOMALIJA" : "VALIDAN";
    const explanation =
      findings.length > 0
        ? findings.map((finding) => finding.message).join(" ")
        : "AI analiza nije pronašla značajna odstupanja za uneseni trošak.";

    return {
      status,
      riskScore: Number(riskScore.toFixed(2)),
      severity: anomalyFindings.some((finding) => finding.severity === "HIGH") ? "HIGH" : findings.length > 0 ? "MEDIUM" : "LOW",
      findings,
      explanation,
      recommendedAction:
        findings.length > 0
          ? "Provjeriti trošak i prateću dokumentaciju prije dalje obrade."
          : "Nije potrebna dodatna akcija.",
    };
  }

  private isAnomalyFinding(finding: ExpenseAnalysisFinding): boolean {
    return finding.type !== "POTENCIJALNI_DUPLIKAT";
  }

  private getMissingBudgetFinding(
    expense: any,
    context: any,
    duplicateFinding?: ExpenseAnalysisFinding | null
  ): ExpenseAnalysisFinding | null {
    if (duplicateFinding || !Object.prototype.hasOwnProperty.call(context || {}, "budget") || context?.budget) {
      return null;
    }

    return {
      type: "BUDGET_NOT_DEFINED",
      severity: "HIGH",
      message: "Za odabrani odjel, kategoriju i datum troska ne postoji odobren budzet.",
      evidence: {
        odjelId: expense?.odjelId,
        kategorijaId: expense?.kategorijaId,
        datum: expense?.datum,
      },
    };
  }

  private applyRequiredBudgetRule(analysis: ExpenseAnalysisResult, expense: any, context: any): ExpenseAnalysisResult {
    const findings = Array.isArray(analysis?.findings) ? analysis.findings : [];
    const duplicateFinding = findings.find((finding) => finding?.type === "POTENCIJALNI_DUPLIKAT");
    const missingBudgetFinding = this.getMissingBudgetFinding(expense, context, duplicateFinding);

    if (!missingBudgetFinding || findings.some((finding) => finding?.type === missingBudgetFinding.type)) {
      return analysis;
    }

    const nextFindings = [...findings, missingBudgetFinding];
    return {
      ...analysis,
      status: "ANOMALIJA",
      severity: "HIGH",
      riskScore: Math.max(Number(analysis?.riskScore || 0), 0.6),
      findings: nextFindings,
      explanation: nextFindings.map((finding) => finding.message).join(" "),
      recommendedAction: "Provjeriti trosak i definisati/odobriti budzet prije dalje obrade.",
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
