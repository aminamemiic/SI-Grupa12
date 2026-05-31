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

type SupplierGrowthStatus = "growth" | "decline" | "stable" | "new_spending";
type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

type TopGrowingSupplier = {
  supplierId: string | null;
  supplierName: string;
  currentAmount: number;
  previousAmount: number;
  growthPercentage: number | null;
  status: SupplierGrowthStatus;
  riskLevel: RiskLevel;
};

export class AIAnalysisService {
  private readonly aiServiceUrl: string;
  private geminiClient: any | null | undefined;

  constructor(aiServiceUrl = process.env.AI_SERVICE_URL || "http://localhost:8000") {
    this.aiServiceUrl = aiServiceUrl.replace(/\/+$/, "");
    this.geminiClient = undefined;
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
    let timeout: ReturnType<typeof setTimeout> | undefined;
    try {
      const controller = new AbortController();
      timeout = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(`${this.aiServiceUrl}/ai/database-analysis`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportData, budgetData }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI servis je vratio status ${response.status}.`);
      }

      return await response.json() as DatabaseAnalysisResult;
    } catch (_error) {
      return this.fallbackDatabaseAnalysis(reportData, budgetData);
    } finally {
      if (timeout) {
        clearTimeout(timeout);
      }
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

  getTopGrowingSuppliers(reportData: any): { suppliers: TopGrowingSupplier[] } {
    const expenses = this.getReportExpenses(reportData);
    const { currentMonth, previousMonth } = this.getCurrentAndPreviousMonthKeys(expenses);
    if (!currentMonth) {
      return { suppliers: [] };
    }

    const currentTotals = this.groupSupplierTotalsByMonth(expenses, currentMonth);
    const previousTotals = previousMonth ? this.groupSupplierTotalsByMonth(expenses, previousMonth) : new Map<string, any>();
    const supplierKeys = new Set<string>([...currentTotals.keys(), ...previousTotals.keys()]);

    const suppliers = Array.from(supplierKeys)
      .map((key) => {
        const current = currentTotals.get(key);
        const previous = previousTotals.get(key);
        const currentAmount = Number(current?.amount || 0);
        const previousAmount = Number(previous?.amount || 0);
        const supplierId = current?.supplierId ?? previous?.supplierId ?? null;
        const supplierName = current?.supplierName ?? previous?.supplierName ?? "Bez dobavljaca";

        let growthPercentage: number | null = 0;
        let status: SupplierGrowthStatus = "stable";

        if (previousAmount === 0) {
          if (currentAmount > 0) {
            growthPercentage = null;
            status = "new_spending";
          }
        } else {
          growthPercentage = this.round(((currentAmount - previousAmount) / previousAmount) * 100);
          if (growthPercentage > 5) status = "growth";
          else if (growthPercentage < -5) status = "decline";
        }

        return {
          supplierId: supplierId === null || supplierId === undefined ? null : String(supplierId),
          supplierName,
          currentAmount: this.round(currentAmount),
          previousAmount: this.round(previousAmount),
          growthPercentage,
          status,
          riskLevel: this.getSupplierGrowthRisk(growthPercentage, status, currentAmount),
        };
      })
      .filter((supplier) => supplier.currentAmount > 0)
      .sort((a, b) => {
        if (a.status === "new_spending" && b.status === "new_spending") {
          return b.currentAmount - a.currentAmount;
        }
        if (a.status === "new_spending") return -1;
        if (b.status === "new_spending") return 1;
        return Number(b.growthPercentage || 0) - Number(a.growthPercentage || 0);
      })
      .slice(0, 5);

    return { suppliers };
  }

  askAssistant(question: string, reportData: any, budgetData: any): { answer: string; intent: string; data: any } {
    const normalizedQuestion = this.normalizeQuestion(question);
    const expenses = this.extractExpenses(reportData);
    const summary = reportData?.summary || {};

    if (this.matchesAny(normalizedQuestion, [
      "top troskovi",
      "najveci troskovi",
      "kojih je 5 najvecih troskova",
      "prikazi najvece troskove",
      "najskuplje stavke",
    ])) {
      if (expenses.length === 0) {
        return { intent: "TOP_EXPENSES", answer: "Nema evidentiranih troskova za prikaz.", data: { expenses: [] } };
      }

      const requestedLimit = Number(normalizedQuestion.match(/\b(\d{1,2})\b/)?.[1] || 5);
      const limit = Math.min(Math.max(Number.isFinite(requestedLimit) ? requestedLimit : 5, 1), 10);
      const topExpenses = [...expenses]
        .sort((a, b) => Number(b.iznos || 0) - Number(a.iznos || 0))
        .slice(0, limit);
      const lines = topExpenses.map((expense, index) => `${index + 1}. ${expense.naziv || "Bez naziva"} - ${this.formatAmount(Number(expense.iznos || 0))} KM`);

      return {
        intent: "TOP_EXPENSES",
        answer: `Najveci troskovi su:\n${lines.join("\n")}`,
        data: { expenses: topExpenses },
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "koji trosak je najveci",
      "najveci trosak",
      "najskuplji trosak",
      "najveca stavka",
      "najveci iznos",
      "sta nas najvise kosta",
    ])) {
      if (expenses.length === 0) {
        return { intent: "LARGEST_EXPENSE", answer: "Nema evidentiranih troskova za analizu.", data: null };
      }

      const largestExpense = [...expenses].sort((a, b) => Number(b.iznos || 0) - Number(a.iznos || 0))[0];
      const amount = Number(largestExpense?.iznos || 0);
      const totalAmount = this.getTotalAmount(reportData, expenses);
      const share = totalAmount > 0 ? this.round((amount / totalAmount) * 100) : 0;
      const category = largestExpense?.kategorijaNaziv || largestExpense?.kategorija || "nije navedena";
      const supplier = largestExpense?.dobavljacNaziv || largestExpense?.dobavljac || "nije naveden";
      const department = largestExpense?.odjelNaziv || largestExpense?.odjel || "nije naveden";
      const date = this.formatDisplayDate(largestExpense?.datum) || "datum nije naveden";

      return {
        intent: "LARGEST_EXPENSE",
        answer: `Najveci evidentirani trosak je ${largestExpense?.naziv || "Bez naziva"} u iznosu od ${this.formatAmount(amount)} KM. Pripada kategoriji ${category}, dobavljac je ${supplier}, odjel je ${department}, a evidentiran je ${date}. Ovaj trosak cini ${share}% ukupnih troskova.`,
        data: { expense: largestExpense, sharePercentage: share },
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "koja kategorija najvise trosi",
      "najskuplja kategorija",
      "na sta najvise trosimo",
      "gdje najvise trosimo",
    ])) {
      const categories = Array.isArray(reportData?.breakdowns?.byCategory) && reportData.breakdowns.byCategory.length > 0
        ? reportData.breakdowns.byCategory
        : this.buildAssistantBreakdown(expenses, "kategorijaNaziv", "kategorija");
      const top = [...categories].sort((a, b) => Number(b.total || 0) - Number(a.total || 0))[0];
      if (!top) {
        return { intent: "MOST_EXPENSIVE_CATEGORY", answer: "Nema dovoljno podataka po kategorijama.", data: [] };
      }
      const totalAmount = this.getTotalAmount(reportData, expenses);
      const percentage = totalAmount > 0 ? this.round((Number(top.total || 0) / totalAmount) * 100) : Number(top.percentage || 0);

      return {
        intent: "MOST_EXPENSIVE_CATEGORY",
        answer: `Najveca potrosnja je u kategoriji ${top.label} sa ukupno ${this.formatAmount(Number(top.total || 0))} KM, sto cini ${percentage}% ukupnih troskova.`,
        data: top,
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "kome smo najvise platili",
      "dobavljac sa najvecom potrosnjom",
      "kojem dobavljacu najvise placamo",
      "koji dobavljac najvise kosta",
    ])) {
      const suppliers = this.buildAssistantBreakdown(expenses, "dobavljacNaziv", "dobavljac");
      const top = suppliers[0];
      if (!top) {
        return { intent: "MOST_EXPENSIVE_SUPPLIER", answer: "Nema dovoljno podataka o dobavljacima.", data: [] };
      }
      const totalAmount = this.getTotalAmount(reportData, expenses);
      const percentage = totalAmount > 0 ? this.round((Number(top.total || 0) / totalAmount) * 100) : 0;

      return {
        intent: "MOST_EXPENSIVE_SUPPLIER",
        answer: `Najvise je placeno dobavljacu ${top.label}, ukupno ${this.formatAmount(Number(top.total || 0))} KM. To predstavlja ${percentage}% ukupnih troskova.`,
        data: top,
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "koji odjel najvise trosi",
      "koji sektor najvise trosi",
      "najveca potrosnja po odjelu",
    ])) {
      const departments = Array.isArray(reportData?.breakdowns?.byDepartment) && reportData.breakdowns.byDepartment.length > 0
        ? reportData.breakdowns.byDepartment
        : this.buildAssistantBreakdown(expenses, "odjelNaziv", "odjel");
      const top = [...departments].sort((a, b) => Number(b.total || 0) - Number(a.total || 0))[0];
      if (!top) {
        return { intent: "MOST_EXPENSIVE_DEPARTMENT", answer: "Nema dovoljno podataka po odjelima.", data: [] };
      }

      return {
        intent: "MOST_EXPENSIVE_DEPARTMENT",
        answer: `Odjel sa najvecom potrosnjom je ${top.label}, ukupno ${this.formatAmount(Number(top.total || 0))} KM.`,
        data: top,
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "koliko je ostalo budzeta",
      "koliko jos mozemo potrositi",
      "preostali budzet",
      "imamo li jos budzeta",
    ])) {
      const totalAmount = this.getTotalAmount(reportData, expenses);
      const budgetTotal = Number(summary.budgetTotal || this.getBudgetTotal(budgetData));
      if (budgetTotal <= 0) {
        return { intent: "BUDGET_REMAINING", answer: "Budzet nije definisan za dostupne podatke.", data: { totalAmount, budgetTotal } };
      }

      const remaining = this.round(budgetTotal - totalAmount);
      const usedPercentage = this.round((totalAmount / budgetTotal) * 100);
      return {
        intent: "BUDGET_REMAINING",
        answer: remaining >= 0
          ? `Preostalo je ${this.formatAmount(remaining)} KM budzeta. Trenutno je iskoristeno ${usedPercentage}% ukupnog budzeta.`
          : `Budzet je prekoracen za ${this.formatAmount(Math.abs(remaining))} KM. Iskoristenost budzeta je ${usedPercentage}%.`,
        data: { totalAmount, budgetTotal, remaining, usedPercentage },
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "koja je najveca anomalija",
      "najveca sumnjiva stavka",
      "najrizicniji trosak",
      "najveci problem",
    ])) {
      const anomalies = expenses.filter((expense) => ["ANOMALIJA", "POTENCIJALNI_DUPLIKAT"].includes(String(expense.statusValidacije || "")));
      const biggest = [...anomalies].sort((a, b) => Number(b.iznos || 0) - Number(a.iznos || 0))[0];
      if (!biggest) {
        return { intent: "BIGGEST_ANOMALY", answer: "Trenutno nema evidentiranih anomalija ili potencijalnih duplikata.", data: { anomalies: [] } };
      }

      return {
        intent: "BIGGEST_ANOMALY",
        answer: `Najveca sumnjiva stavka je ${biggest.naziv || "Bez naziva"} u iznosu od ${this.formatAmount(Number(biggest.iznos || 0))} KM. Status validacije je ${biggest.statusValidacije}. Preporuka je da se ovaj trosak pregleda prije zakljucivanja perioda.`,
        data: { expense: biggest },
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "koji dobavljac ima najveci rast",
      "koji dobavljac je najvise porastao",
      "kome najbrze rastu troskovi",
      "dobavljaci sa najvecim rastom",
    ])) {
      const data = this.getTopGrowingSuppliers(reportData);
      const top = data.suppliers[0];
      if (!top) {
        return { intent: "SUPPLIER_GROWTH", answer: "Nema dovoljno podataka o dobavljacima za poredjenje.", data };
      }
      const change = top.status === "new_spending"
        ? "Novi trosak u ovom mjesecu."
        : `${top.growthPercentage}% vise nego prethodni mjesec.`;
      return {
        intent: "SUPPLIER_GROWTH",
        answer: `Dobavljac ${top.supplierName} ima najveci rast. Trenutni iznos je ${this.formatAmount(top.currentAmount)} KM. ${change}`,
        data,
      };
    }

    if (this.matchesAny(normalizedQuestion, [
      "da li troskovi rastu ili padaju",
      "kakav je trend troskova",
      "trosimo li vise nego prije",
      "jesu li troskovi porasli",
      "rast",
      "porasli",
      "povecanje",
      "povecali",
      "porast",
    ])) {
      const analysis = this.fallbackDatabaseAnalysis(reportData, budgetData);
      const direction = analysis.trenKretanja === "RAST" ? "rastu" : analysis.trenKretanja === "PAD" ? "padaju" : "su stabilni";
      const topCategory = analysis.topKategorija ? ` Najveci doprinos ima kategorija ${analysis.topKategorija}.` : "";
      return {
        intent: "SPENDING_TREND",
        answer: `Troskovi trenutno ${direction} za ${Math.abs(analysis.postotakPromjene)}% u odnosu na prethodni period.${topCategory}`,
        data: analysis,
      };
    }

    if (this.matchesAny(normalizedQuestion, ["budzet", "prekoracen", "prekoracenje", "prekoraceno"])) {
      const totalAmount = Number(summary.totalAmount || 0);
      const budgetTotal = Number(summary.budgetTotal || this.getBudgetTotal(budgetData));
      const utilization = budgetTotal > 0 ? this.round((totalAmount / budgetTotal) * 100) : null;
      const answer = utilization === null
        ? "Budzet nije definisan za dostupne podatke, pa nije moguce izracunati iskoristenost."
        : utilization > 100
          ? `Budzet je prekoracen. Iskoristenost je ${utilization}%.`
          : `Budzet je iskoristen ${utilization}%.`;
      return { intent: "BUDGET_STATUS", answer, data: { totalAmount, budgetTotal, utilization } };
    }

    if (this.matchesAny(normalizedQuestion, ["kategorija", "kategorije"])) {
      const top = reportData?.breakdowns?.byCategory?.[0];
      return {
        intent: "CATEGORY",
        answer: top
          ? `Najvise trosi kategorija ${top.label}, ukupno ${this.formatAmount(top.total)} KM.`
          : "Nema dovoljno podataka po kategorijama.",
        data: reportData?.breakdowns?.byCategory || [],
      };
    }

    if (this.matchesAny(normalizedQuestion, ["odjel", "odjeli"])) {
      const top = reportData?.breakdowns?.byDepartment?.[0];
      return {
        intent: "DEPARTMENT",
        answer: top
          ? `Najvise trosi odjel ${top.label}, ukupno ${this.formatAmount(top.total)} KM.`
          : "Nema dovoljno podataka po odjelima.",
        data: reportData?.breakdowns?.byDepartment || [],
      };
    }

    if (this.matchesAny(normalizedQuestion, ["anomalija", "anomalije", "sumnjivo", "sumnjivi"])) {
      const anomalies = expenses.filter((expense) => ["ANOMALIJA", "POTENCIJALNI_DUPLIKAT"].includes(String(expense.statusValidacije || "")));
      return {
        intent: "ANOMALY_COUNT",
        answer: `Trenutno je pronadjeno ${anomalies.length} sumnjivih troskova. Preporuka je da se pregledaju prije zakljucivanja perioda.`,
        data: { anomalies },
      };
    }

    return {
      intent: "HELP",
      answer: "Mogu odgovoriti na pitanja kao sto su:\n- Koji trosak je najveci?\n- Kojih je 5 najvecih troskova?\n- Koja kategorija najvise trosi?\n- Kome smo najvise platili?\n- Koliko je ostalo budzeta?\n- Koja je najveca anomalija?\n- Da li troskovi rastu ili padaju?\n- Koji dobavljac ima najveci rast?",
      data: null,
    };
  }

  async askAssistantWithGemini(question: string, reportData: any, budgetData: any): Promise<{ answer: string; source: "gemini" | "fallback"; intent: string; data: any }> {
    const contextData = this.buildAssistantContextData(reportData, budgetData);

    const ai = await this.getGeminiClient();

    if (ai) {
      try {
        const prompt = `
Ti si finansijski AI asistent za aplikaciju za pracenje troskova.
Odgovaraj kratko, jasno i na bosanskom jeziku.
Koristi samo podatke koje dobijes u kontekstu.
Ako nema dovoljno podataka, reci da nema dovoljno podataka.
Ne izmisljaj brojeve, dobavljace, kategorije ili budzete.

Pitanje korisnika:
${question}

Podaci iz sistema:
${JSON.stringify(contextData)}
`;

        const response = await ai.models.generateContent({
          model: process.env.GEMINI_MODEL || "gemini-2.5-flash",
          contents: prompt,
        });

        const answer = typeof response.text === "string" ? response.text.trim() : "";
        if (answer) {
          return {
            answer,
            source: "gemini",
            intent: "GEMINI",
            data: contextData,
          };
        }
      } catch (error) {
        console.error("Gemini error:", error);
      }
    }

    const fallback = this.askAssistant(question, reportData, budgetData);
    return {
      ...fallback,
      source: "fallback",
    };
  }

  getExecutiveSummary(reportData: any, budgetData: any): { summary: Array<{ type: "INFO" | "WARNING" | "SUCCESS"; message: string }> } {
    const analysis = this.fallbackDatabaseAnalysis(reportData, budgetData);
    const suppliers = this.getTopGrowingSuppliers(reportData).suppliers;
    const anomalies = this.getReportExpenses(reportData).filter((expense) => ["ANOMALIJA", "POTENCIJALNI_DUPLIKAT"].includes(String(expense.statusValidacije || "")));
    const budgetUtilization = Number(reportData?.summary?.budgetUtilizationPercent ?? 0);
    const messages: Array<{ type: "INFO" | "WARNING" | "SUCCESS"; message: string }> = [];

    if (analysis.trenKretanja === "RAST") {
      messages.push({ type: "WARNING", message: `Troskovi su porasli za ${Math.abs(analysis.postotakPromjene)}% u odnosu na prethodni period.` });
    } else if (analysis.trenKretanja === "PAD") {
      messages.push({ type: "SUCCESS", message: `Troskovi su smanjeni za ${Math.abs(analysis.postotakPromjene)}% u odnosu na prethodni period.` });
    } else {
      messages.push({ type: "INFO", message: "Troskovi su stabilni u odnosu na prethodni period." });
    }

    if (budgetUtilization > 0) {
      messages.push({
        type: budgetUtilization >= 90 ? "WARNING" : "INFO",
        message: `Ukupna iskoristenost budzeta je ${this.round(budgetUtilization)}%.`,
      });
    }

    messages.push({
      type: anomalies.length > 0 ? "WARNING" : "SUCCESS",
      message: anomalies.length > 0
        ? `Pronadjene su ${anomalies.length} anomalije ili potencijalni duplikati koji cekaju pregled.`
        : "Nema otvorenih anomalija u dostupnim troskovima.",
    });

    if (suppliers[0]) {
      const top = suppliers[0];
      const change = top.status === "new_spending" ? "novi trosak" : `+${top.growthPercentage}%`;
      messages.push({ type: top.riskLevel === "HIGH" ? "WARNING" : "INFO", message: `Dobavljac ${top.supplierName} ima najveci rast troskova (${change}).` });
    }

    if (analysis.topKategorija) {
      messages.push({ type: "INFO", message: `Kategorija sa najvecim troskovima je ${analysis.topKategorija}.` });
    }

    return { summary: messages.slice(0, 6) };
  }

  explainAnomaly(expenseId: string, reportData: any): { explanation: string; severity: RiskLevel } {
    const expenses = this.getReportExpenses(reportData);
    const expense = expenses.find((item) => String(item.id) === String(expenseId));
    if (!expense) {
      return { explanation: "Trosak nije pronadjen u dostupnim podacima.", severity: "LOW" };
    }

    const amount = Number(expense.iznos || 0);
    const category = expense.kategorijaNaziv || expense.kategorija || "Nerasporedjeno";
    const categoryExpenses = expenses.filter((item) => (item.kategorijaNaziv || item.kategorija || "Nerasporedjeno") === category && String(item.id) !== String(expenseId));
    const amounts = categoryExpenses.map((item) => Number(item.iznos || 0)).filter((value) => Number.isFinite(value) && value > 0);
    const average = this.calculateMean(amounts);
    const median = this.calculateMedian(amounts);
    const duplicates = expenses.filter((item) =>
      String(item.id) !== String(expenseId)
      && this.normalizeText(item.naziv || "") === this.normalizeText(expense.naziv || "")
      && Math.abs(Number(item.iznos || 0) - amount) <= Math.max(1, amount * 0.03)
    );
    const aboveAveragePercent = average > 0 ? this.round(((amount - average) / average) * 100) : 0;
    const severity: RiskLevel = String(expense.statusValidacije || "") === "ANOMALIJA" || aboveAveragePercent >= 100 ? "HIGH" : duplicates.length > 0 || aboveAveragePercent >= 50 ? "MEDIUM" : "LOW";
    const duplicateText = duplicates.length > 0 ? ` Pronadjen je i moguci duplikat (${duplicates.length}).` : "";

    return {
      severity,
      explanation: average > 0
          ? `Trosak iznosi ${this.formatAmount(amount)} KM. Prosjek kategorije ${category} iznosi ${this.formatAmount(average)} KM, a medijan ${this.formatAmount(median)} KM. Trosak je ${Math.max(0, aboveAveragePercent)}% veci od prosjeka.${duplicateText}`
        : `Trosak iznosi ${this.formatAmount(amount)} KM. Nema dovoljno slicnih troskova za pouzdano poredjenje.${duplicateText}`,
    };
  }

  getCostOptimizationSuggestions(reportData: any, budgetData: any): { suggestions: Array<{ title: string; description: string; estimatedImpact: string }> } {
    const suggestions: Array<{ title: string; description: string; estimatedImpact: string }> = [];
    const categoryGrowth = this.getCategoryMonthGrowth(reportData);
    const topCategory = categoryGrowth.find((item) => item.growthPercentage >= 20);
    if (topCategory) {
      suggestions.push({
        title: `${topCategory.categoryName} raste ${topCategory.growthPercentage}%`,
        description: `Pregledati narudzbe i odobrenja za kategoriju ${topCategory.categoryName}.`,
        estimatedImpact: "Srednji uticaj na troskove.",
      });
    }

    const supplierRisk = this.getSupplierDependencyRisk(reportData).risks[0];
    if (supplierRisk) {
      suggestions.push({
        title: "Konsolidacija dobavljaca",
        description: supplierRisk.message,
        estimatedImpact: "Moguce ustede pregovorom ili alternativnim ponudama.",
      });
    }

    const budgetTotal = this.getBudgetTotal(budgetData) || Number(reportData?.summary?.budgetTotal || 0);
    const totalAmount = Number(reportData?.summary?.totalAmount || 0);
    if (budgetTotal > 0 && totalAmount / budgetTotal >= 0.9) {
      suggestions.push({
        title: "Budzet je blizu ogranicenja",
        description: `Troskovi su dostigli ${this.round((totalAmount / budgetTotal) * 100)}% ukupnog budzeta.`,
        estimatedImpact: "Visok uticaj ako se potrosnja ne uspori.",
      });
    }

    const recurring = this.detectRecurringExpenseGroups(reportData).slice(0, 1);
    recurring.forEach((item) => {
      suggestions.push({
        title: "Ponavljajuci trosak za pregled",
        description: `${item.expenseName} se ponavlja kroz vise mjeseci. Provjeriti uslove ugovora ili pretplate.`,
        estimatedImpact: "Nizak do srednji uticaj.",
      });
    });

    if (suggestions.length === 0) {
      suggestions.push({
        title: "Nema kriticnih preporuka",
        description: "Dostupni podaci ne pokazuju jasno odstupanje za hitnu optimizaciju.",
        estimatedImpact: "Informativno.",
      });
    }

    return { suggestions: suggestions.slice(0, 5) };
  }

  detectMissingRecurringExpenses(reportData: any): { missingRecurringExpenses: Array<{ expenseName: string; lastSeenDate: string; averageAmount: number; recommendation: string }> } {
    const groups = this.detectRecurringExpenseGroups(reportData);
    const { currentMonth } = this.getCurrentAndPreviousMonthKeys(this.getReportExpenses(reportData));
    if (!currentMonth) {
      return { missingRecurringExpenses: [] };
    }

    const missingRecurringExpenses = groups
      .filter((group) => !group.months.includes(currentMonth))
      .map((group) => ({
        expenseName: group.expenseName,
          lastSeenDate: this.formatDisplayDate(group.lastSeenDate) || group.lastSeenDate,
        averageAmount: this.round(group.averageAmount),
        recommendation: "Provjeriti da li racun jos nije unesen.",
      }))
      .slice(0, 5);

    return { missingRecurringExpenses };
  }

  getSupplierDependencyRisk(reportData: any): { risks: Array<{ supplierName: string; sharePercentage: number; riskLevel: string; message: string }> } {
    const expenses = this.getReportExpenses(reportData).filter((expense) => expense.dobavljacNaziv || expense.dobavljac);
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.iznos || 0), 0);
    const supplierTotals = new Map<string, number>();
    const supplierCategoryTotals = new Map<string, { categoryName: string; total: number; categoryTotal: number }>();
    const categoryTotals = new Map<string, number>();

    expenses.forEach((expense) => {
      const supplierName = expense.dobavljacNaziv || expense.dobavljac || "Bez dobavljaca";
      const categoryName = expense.kategorijaNaziv || expense.kategorija || "Nerasporedjeno";
      const amount = Number(expense.iznos || 0);
      supplierTotals.set(supplierName, (supplierTotals.get(supplierName) || 0) + amount);
      categoryTotals.set(categoryName, (categoryTotals.get(categoryName) || 0) + amount);
      const key = `${supplierName}__${categoryName}`;
      const existing = supplierCategoryTotals.get(key) || { categoryName, total: 0, categoryTotal: 0 };
      existing.total += amount;
      supplierCategoryTotals.set(key, existing);
    });

    const risks: Array<{ supplierName: string; sharePercentage: number; riskLevel: string; message: string }> = [];
    supplierTotals.forEach((amount, supplierName) => {
      const sharePercentage = totalAmount > 0 ? this.round((amount / totalAmount) * 100) : 0;
      if (sharePercentage > 50) {
        risks.push({
          supplierName,
          sharePercentage,
          riskLevel: "HIGH",
          message: `${sharePercentage}% ukupnih troskova odlazi dobavljacu ${supplierName}. Dobavljac predstavlja visok nivo zavisnosti.`,
        });
      }
    });

    supplierCategoryTotals.forEach((value, key) => {
      const supplierName = key.split("__")[0];
      const categoryTotal = categoryTotals.get(value.categoryName) || 0;
      const sharePercentage = categoryTotal > 0 ? this.round((value.total / categoryTotal) * 100) : 0;
      if (sharePercentage > 50 && !risks.some((risk) => risk.supplierName === supplierName && risk.message.includes(value.categoryName))) {
        risks.push({
          supplierName,
          sharePercentage,
          riskLevel: "HIGH",
          message: `${sharePercentage}% troskova kategorije ${value.categoryName} odlazi dobavljacu ${supplierName}.`,
        });
      }
    });

    return { risks: risks.slice(0, 5) };
  }

  private getReportExpenses(reportData: any): any[] {
    return this.extractExpenses(reportData);
  }

  private buildAssistantContextData(reportData: any, budgetData: any): any {
    const expenses = this.extractExpenses(reportData);
    const totalAmount = this.getTotalAmount(reportData, expenses);
    const topExpenses = [...expenses]
      .sort((a, b) => Number(b.iznos || 0) - Number(a.iznos || 0))
      .slice(0, 10)
      .map((expense) => ({
        id: expense.id ?? null,
        naziv: expense.naziv || "Bez naziva",
        iznos: this.round(Number(expense.iznos || 0)),
        datum: this.formatDisplayDate(expense.datum),
        kategorija: expense.kategorijaNaziv || expense.kategorija || null,
        odjel: expense.odjelNaziv || expense.odjel || null,
        dobavljac: expense.dobavljacNaziv || expense.dobavljac || null,
        statusValidacije: expense.statusValidacije || null,
        sharePercentage: totalAmount > 0 ? this.round((Number(expense.iznos || 0) / totalAmount) * 100) : 0,
      }));

    const anomalies = expenses
      .filter((expense) => ["ANOMALIJA", "POTENCIJALNI_DUPLIKAT"].includes(String(expense.statusValidacije || "")))
      .sort((a, b) => Number(b.iznos || 0) - Number(a.iznos || 0))
      .slice(0, 10)
      .map((expense) => ({
        id: expense.id ?? null,
        naziv: expense.naziv || "Bez naziva",
        iznos: this.round(Number(expense.iznos || 0)),
        datum: this.formatDisplayDate(expense.datum),
        statusValidacije: expense.statusValidacije || null,
        kategorija: expense.kategorijaNaziv || expense.kategorija || null,
        dobavljac: expense.dobavljacNaziv || expense.dobavljac || null,
      }));

    const budgets = Array.isArray(budgetData) ? budgetData : [];
    const budgetSummary = {
      count: budgets.length,
      total: this.round(this.getBudgetTotal(budgetData)),
      topBudgets: budgets
        .map((budget: any) => ({
          naziv: budget.naziv || null,
          planiraniIznos: this.round(Number(budget.planiraniIznos || budget.planirani_iznos || 0)),
          datumPocetka: this.formatDisplayDate(budget.datumPocetka || budget.datum_pocetka),
          datumZavrsetka: this.formatDisplayDate(budget.datumZavrsetka || budget.datum_zavrsetka),
          odjel: budget.odjelNaziv || budget.odjel || null,
          statusOdobrenja: budget.statusOdobrenja || null,
        }))
        .sort((a: any, b: any) => b.planiraniIznos - a.planiraniIznos)
        .slice(0, 10),
    };

    return {
      summary: {
        totalExpenses: Number(reportData?.summary?.totalExpenses || expenses.length),
        totalAmount: this.round(totalAmount),
        averageAmount: this.round(Number(reportData?.summary?.averageAmount || (expenses.length ? totalAmount / expenses.length : 0))),
        budgetTotal: this.round(Number(reportData?.summary?.budgetTotal || budgetSummary.total)),
        budgetUtilizationPercent: reportData?.summary?.budgetUtilizationPercent ?? null,
        topCategory: reportData?.summary?.topCategory || null,
        topDepartment: reportData?.summary?.topDepartment || null,
      },
      topExpenses,
      categories: Array.isArray(reportData?.breakdowns?.byCategory)
        ? reportData.breakdowns.byCategory.slice(0, 10)
        : this.buildAssistantBreakdown(expenses, "kategorijaNaziv", "kategorija").slice(0, 10),
      departments: Array.isArray(reportData?.breakdowns?.byDepartment)
        ? reportData.breakdowns.byDepartment.slice(0, 10)
        : this.buildAssistantBreakdown(expenses, "odjelNaziv", "odjel").slice(0, 10),
      suppliers: {
        topBySpend: this.buildAssistantBreakdown(expenses, "dobavljacNaziv", "dobavljac").slice(0, 10),
        topGrowing: this.getTopGrowingSuppliers(reportData).suppliers,
        dependencyRisks: this.getSupplierDependencyRisk(reportData).risks,
      },
      budgets: budgetSummary,
      anomalies,
      missingRecurringExpenses: this.detectMissingRecurringExpenses(reportData).missingRecurringExpenses,
    };
  }

  private async getGeminiClient(): Promise<any | null> {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }

    if (this.geminiClient !== undefined) {
      return this.geminiClient;
    }

    const { GoogleGenAI } = await import("@google/genai");
    this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    return this.geminiClient;
  }

  private getCurrentAndPreviousMonthKeys(expenses: any[]): { currentMonth: string | null; previousMonth: string | null } {
    const months = expenses
      .map((expense) => this.getMonthKey(expense?.datum))
      .filter((month): month is string => Boolean(month))
      .sort();
    const currentMonth = months[months.length - 1] || null;
    if (!currentMonth) {
      return { currentMonth: null, previousMonth: null };
    }
    const [year, month] = currentMonth.split("-").map(Number);
    const previousDate = new Date(Date.UTC(year, month - 2, 1));
    return {
      currentMonth,
      previousMonth: `${previousDate.getUTCFullYear()}-${String(previousDate.getUTCMonth() + 1).padStart(2, "0")}`,
    };
  }

  private getMonthKey(value: unknown): string | null {
    const rawValue = value instanceof Date ? value.toISOString() : String(value || "");
    const match = rawValue.match(/^(\d{4})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}` : null;
  }

  private groupSupplierTotalsByMonth(expenses: any[], monthKey: string): Map<string, any> {
    const totals = new Map<string, { supplierId: string | null; supplierName: string; amount: number }>();
    expenses
      .filter((expense) => this.getMonthKey(expense?.datum) === monthKey)
      .forEach((expense) => {
        const supplierId = expense.dobavljacId === null || expense.dobavljacId === undefined ? null : String(expense.dobavljacId);
        const supplierName = expense.dobavljacNaziv || expense.dobavljac || "Bez dobavljaca";
        const key = supplierId || supplierName;
        const existing = totals.get(key) || { supplierId, supplierName, amount: 0 };
        existing.amount += Number(expense.iznos || 0);
        totals.set(key, existing);
      });
    return totals;
  }

  private getSupplierGrowthRisk(growthPercentage: number | null, status: SupplierGrowthStatus, currentAmount: number): RiskLevel {
    if ((growthPercentage !== null && growthPercentage >= 50) || (status === "new_spending" && currentAmount > 5000)) {
      return "HIGH";
    }
    if (growthPercentage !== null && growthPercentage >= 20) {
      return "MEDIUM";
    }
    return "LOW";
  }

  private containsAny(value: string, keywords: string[]): boolean {
    return keywords.some((keyword) => value.includes(keyword));
  }

  private normalizeQuestion(question: string): string {
    return this.normalizeText(question);
  }

  private matchesAny(question: string, keywords: string[]): boolean {
    return this.containsAny(question, keywords.map((keyword) => this.normalizeQuestion(keyword)));
  }

  private extractExpenses(reportData: any): any[] {
    if (Array.isArray(reportData?.expenses)) return reportData.expenses;
    if (Array.isArray(reportData?.data)) return reportData.data;
    if (Array.isArray(reportData?.items)) return reportData.items;
    return [];
  }

  private normalizeText(value: string): string {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  }

  private getTotalAmount(reportData: any, expenses: any[]): number {
    const summaryTotal = Number(reportData?.summary?.totalAmount);
    if (Number.isFinite(summaryTotal) && summaryTotal > 0) {
      return summaryTotal;
    }
    return expenses.reduce((sum, expense) => sum + Number(expense.iznos || 0), 0);
  }

  private buildAssistantBreakdown(expenses: any[], primaryField: string, fallbackField: string): Array<{ label: string; total: number; count: number; percentage: number }> {
    const totalAmount = expenses.reduce((sum, expense) => sum + Number(expense.iznos || 0), 0);
    const totals = new Map<string, { total: number; count: number }>();

    expenses.forEach((expense) => {
      const label = expense[primaryField] || expense[fallbackField] || "Nerasporedjeno";
      const existing = totals.get(label) || { total: 0, count: 0 };
      existing.total += Number(expense.iznos || 0);
      existing.count += 1;
      totals.set(label, existing);
    });

    return Array.from(totals.entries())
      .map(([label, value]) => ({
        label,
        total: this.round(value.total),
        count: value.count,
        percentage: totalAmount > 0 ? this.round((value.total / totalAmount) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total || a.label.localeCompare(b.label));
  }

  private getBudgetTotal(budgetData: any): number {
    if (!Array.isArray(budgetData)) {
      return 0;
    }
    return budgetData.reduce((sum: number, budget: any) => sum + Number(budget.planiraniIznos || budget.planirani_iznos || 0), 0);
  }

  private calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  private getCategoryMonthGrowth(reportData: any): Array<{ categoryName: string; growthPercentage: number }> {
    const expenses = this.getReportExpenses(reportData);
    const { currentMonth, previousMonth } = this.getCurrentAndPreviousMonthKeys(expenses);
    if (!currentMonth || !previousMonth) return [];

    const current = this.groupTotalsByMonthAndField(expenses, currentMonth, "kategorijaNaziv");
    const previous = this.groupTotalsByMonthAndField(expenses, previousMonth, "kategorijaNaziv");

    return Array.from(current.entries())
      .map(([categoryName, currentAmount]) => {
        const previousAmount = previous.get(categoryName) || 0;
        return {
          categoryName,
          growthPercentage: previousAmount > 0 ? this.round(((currentAmount - previousAmount) / previousAmount) * 100) : 100,
        };
      })
      .sort((a, b) => b.growthPercentage - a.growthPercentage);
  }

  private groupTotalsByMonthAndField(expenses: any[], monthKey: string, fieldName: string): Map<string, number> {
    const totals = new Map<string, number>();
    expenses
      .filter((expense) => this.getMonthKey(expense?.datum) === monthKey)
      .forEach((expense) => {
        const label = expense[fieldName] || "Nerasporedjeno";
        totals.set(label, (totals.get(label) || 0) + Number(expense.iznos || 0));
      });
    return totals;
  }

  private detectRecurringExpenseGroups(reportData: any): Array<{ expenseName: string; lastSeenDate: string; averageAmount: number; months: string[] }> {
    const groups = new Map<string, any[]>();
    this.getReportExpenses(reportData).forEach((expense) => {
      const key = this.normalizeText(expense.naziv || "").replace(/\d+/g, "").replace(/\s+/g, " ").trim();
      if (!key) return;
      const items = groups.get(key) || [];
      items.push(expense);
      groups.set(key, items);
    });

    return Array.from(groups.entries())
      .map(([expenseName, items]) => {
        const months = Array.from(new Set(items.map((item) => this.getMonthKey(item.datum)).filter(Boolean) as string[])).sort();
        const amounts = items.map((item) => Number(item.iznos || 0)).filter((value) => Number.isFinite(value));
        return {
          expenseName,
          lastSeenDate: items.map((item) => String(item.datum || "")).sort().pop() || "",
          averageAmount: this.calculateMean(amounts),
          months,
        };
      })
      .filter((group) => group.months.length >= 3 && this.hasThreeConsecutiveMonths(group.months));
  }

  private hasThreeConsecutiveMonths(months: string[]): boolean {
    const values = months.map((month) => {
      const [year, monthNumber] = month.split("-").map(Number);
      return year * 12 + monthNumber;
    }).sort((a, b) => a - b);

    for (let index = 2; index < values.length; index += 1) {
      if (values[index] - values[index - 1] === 1 && values[index - 1] - values[index - 2] === 1) {
        return true;
      }
    }
    return false;
  }

  private round(value: number): number {
    return Number(Number(value || 0).toFixed(2));
  }

  private formatAmount(value: number): string {
    return this.round(value).toLocaleString("bs-BA", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  private formatDisplayDate(value: unknown): string | null {
    if (!value) return null;
    const match = String(value).match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return String(value);
    return `${match[3]}.${match[2]}.${match[1]}`;
  }

}

module.exports = { AIAnalysisService };
