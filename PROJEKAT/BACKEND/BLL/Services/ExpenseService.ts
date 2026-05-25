import type { CreateExpenseRequest, IExpenseService } from "../Interfaces/IExpenseService";

const { ExpenseRepository } = require("../../DAL/Repositories/ExpenseRepository");
const { AIAnalysisService } = require("./AIAnalysisService");
const { NotificationService } = require("./NotificationService");

export class ExpenseService implements IExpenseService {
  private expenseRepository: any;
  private aiAnalysisService: any;
  private notificationService: any;
  private expensesCache: { expiresAt: number; data: any[] } | null = null;
  private referenceDataCache: { expiresAt: number; data: any } | null = null;
  private readonly cacheTtlMs = 30 * 1000;

  constructor() {
    this.expenseRepository = new ExpenseRepository();
    this.aiAnalysisService = new AIAnalysisService();
    this.notificationService = new NotificationService();
  }

  async getAllExpenses(): Promise<any[]> {
    if (this.expensesCache && this.expensesCache.expiresAt > Date.now()) {
      return this.expensesCache.data;
    }

    const expenses = await this.expenseRepository.getAll();
    this.expensesCache = {
      expiresAt: Date.now() + this.cacheTtlMs,
      data: expenses,
    };

    return expenses;
  }

  async getReferenceData(): Promise<any> {
    if (this.referenceDataCache && this.referenceDataCache.expiresAt > Date.now()) {
      return this.referenceDataCache.data;
    }

    const referenceData = await this.expenseRepository.getReferenceData();
    this.referenceDataCache = {
      expiresAt: Date.now() + this.cacheTtlMs,
      data: referenceData,
    };

    return referenceData;
  }

  async suggestCategory(payload: any): Promise<any> {
    const naziv = typeof payload?.naziv === "string" ? payload.naziv.trim() : "";

    if (!naziv) {
      throw new Error("Naziv troska je obavezan za AI prijedlog kategorije.");
    }

    const referenceData = await this.getReferenceData();
    return this.aiAnalysisService.suggestExpenseCategory({
      naziv,
      opis: payload?.opis || null,
      dobavljac: payload?.dobavljac || null,
      categories: referenceData.kategorije || [],
    });
  }

  async createExpense(payload: CreateExpenseRequest, authUser?: unknown): Promise<any> {
    const normalizedPayload = this.validateCreateExpense(payload);

    let createdExpense = await this.expenseRepository.create(normalizedPayload, authUser);
    createdExpense = await this.runAiValidationForCreatedExpense(createdExpense);
    this.expensesCache = null;

    return createdExpense;
  }

  // ─────────────────────────────────────────────────────────────
  // Pre-validation method for real-time feedback
  // ─────────────────────────────────────────────────────────────
  async validateExpenseBeforeCreation(payload: CreateExpenseRequest): Promise<{
    isValid: boolean;
    validationErrors: string[];
    warnings: Array<{ type: string; message: string; severity: "LOW" | "MEDIUM" | "HIGH" }>;
  }> {
    const validationErrors: string[] = [];

    // Run basic validation
    try {
      this.validateCreateExpense(payload);
    } catch (error: any) {
      validationErrors.push(error.message);
    }

    if (validationErrors.length > 0) {
      return {
        isValid: false,
        validationErrors,
        warnings: [],
      };
    }

    // Get AI context and perform anomaly detection
    const warnings: Array<{ type: string; message: string; severity: "LOW" | "MEDIUM" | "HIGH" }> = [];

    try {
      // Create a temporary expense object for analysis
      const tempExpense = {
        id: "temp",
        naziv: payload.naziv,
        iznos: Number(payload.iznos),
        datum: this.normalizeDate(payload.datum),
        kategorijaId: payload.kategorijaId,
        odjelId: payload.odjelId,
      };

      const context = await this.expenseRepository.getAiAnalysisContext(tempExpense);
      const analysis = await this.aiAnalysisService.analyzeExpense(tempExpense, context);

      if (analysis?.findings && Array.isArray(analysis.findings)) {
        for (const finding of analysis.findings) {
          warnings.push({
            type: finding.type,
            message: finding.message,
            severity: finding.severity,
          });
        }
      }
    } catch (error) {
      // Don't let AI analysis failures block validation
      console.error("Error during pre-validation AI analysis:", error);
    }

    return {
      isValid: validationErrors.length === 0,
      validationErrors,
      warnings,
    };
  }

  async updateExpense(id: string, payload: CreateExpenseRequest): Promise<any> {
    const normalizedPayload = this.validateCreateExpense(payload);

    const existing = await this.expenseRepository.getById(id);
    if (!existing) {
      throw new Error("Trošak ne postoji.");
    }

    if (existing.statusValidacije === "ZAKLJUCAN") {
      throw new Error("Zaključani troškovi se ne mogu mijenjati.");
    }

    const updatedExpense = await this.expenseRepository.update(id, normalizedPayload);
    this.expensesCache = null;

    return updatedExpense;
  }

  async deleteExpense(id: string): Promise<void> {
    const existing = await this.expenseRepository.getById(id);
    if (!existing) {
      return; 
    }

    if (existing.statusValidacije === "ZAKLJUCAN") {
      throw new Error("Zaključani troškovi se ne mogu brisati.");
    }

    await this.expenseRepository.delete(id);
    this.expensesCache = null;
  }

  private validateCreateExpense(payload: CreateExpenseRequest): CreateExpenseRequest {
    if (!payload) {
      throw new Error("Podaci za trošak nisu poslani.");
    }

    // Validate naziv (name)
    if (!payload.naziv || payload.naziv.trim() === "") {
      throw new Error("Naziv troška je obavezan.");
    }

    const trimmedNaziv = payload.naziv.trim();
    if (trimmedNaziv.length > 200) {
      throw new Error("Naziv troška ne smije imati više od 200 karaktera.");
    }

    if (trimmedNaziv.length < 3) {
      throw new Error("Naziv troška mora imati najmanje 3 karaktera.");
    }

    // Validate iznos (amount)
    const iznos = Number(payload.iznos);

    if (!Number.isFinite(iznos)) {
      throw new Error("Iznos mora biti validan broj.");
    }

    if (iznos <= 0) {
      throw new Error("Iznos mora biti veći od 0.");
    }

    // Warn about unrealistic amounts in validateCreateExpense
    if (iznos < 0.01) {
      throw new Error("Iznos je premali. Minimalni iznos je 0.01.");
    }

    if (iznos > 10000000) {
      throw new Error("Iznos je prevelik. Maksimalni iznos je 10,000,000.");
    }

    // Validate datum (date)
    const datum = this.normalizeDate(payload.datum);
    if (!datum) {
      throw new Error("Datum je obavezan i mora biti u formatu DD.MM.YYYY.");
    }

    // Validate that date is not in the future
    const expenseDate = new Date(datum);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (expenseDate > today) {
      throw new Error("Datum troška ne može biti u budućnosti.");
    }

    // Validate that date is not too old (more than 5 years in the past)
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);
    if (expenseDate < fiveYearsAgo) {
      throw new Error("Datum troška ne može biti stariji od 5 godina.");
    }

    // Validate kategorijaId (category)
    if (!payload.kategorijaId) {
      throw new Error("Kategorija je obavezna.");
    }

    // Validate odjelId (department)
    if (!payload.odjelId) {
      throw new Error("Odjel je obavezan.");
    }

    // Validate valutaId (currency)
    if (!payload.valutaId) {
      throw new Error("Valuta je obavezna.");
    }

    // Validate opis (description) if provided
    if (payload.opis && payload.opis.trim().length > 1000) {
      throw new Error("Opis troška ne smije imati više od 1000 karaktera.");
    }

    return {
      ...payload,
      naziv: trimmedNaziv,
      datum,
    };
  }

  private async runAiValidationForCreatedExpense(createdExpense: any): Promise<any> {
    try {
      const context = await this.expenseRepository.getAiAnalysisContext(createdExpense);
      const analysis = await this.aiAnalysisService.analyzeExpense(createdExpense, context);

      if (this.hasPotentialDuplicateFinding(analysis)) {
        const updatedExpense = await this.expenseRepository.updateValidationStatus(createdExpense.id, "POTENCIJALNI_DUPLIKAT");
        await this.notificationService.createPotentialDuplicateNotification(updatedExpense, analysis);

        return {
          ...updatedExpense,
          aiAnaliza: analysis,
        };
      }

      if (analysis?.status !== "ANOMALIJA") {
        const updatedExpense = await this.expenseRepository.updateValidationStatus(createdExpense.id, "VALIDAN");

        return {
          ...updatedExpense,
          aiAnaliza: analysis,
        };
      }

      const updatedExpense = await this.expenseRepository.updateValidationStatus(createdExpense.id, "ANOMALIJA");
      await this.expenseRepository.createAnomaly(createdExpense.id, analysis);
      await this.notificationService.createAnomalyNotification(updatedExpense, analysis);

      return {
        ...updatedExpense,
        aiAnaliza: analysis,
      };
    } catch (error) {
      return createdExpense;
    }
  }

  private hasPotentialDuplicateFinding(analysis: any): boolean {
    return Array.isArray(analysis?.findings)
      && analysis.findings.some((finding: any) => finding?.type === "POTENCIJALNI_DUPLIKAT");
  }

  async resolvePotentialDuplicate(id: string, action: "SAVE" | "DELETE"): Promise<any> {
    if (!id) {
      throw new Error("ID troska je obavezan.");
    }

    const existing = await this.expenseRepository.getById(id);
    if (!existing) {
      throw new Error("Trosak ne postoji.");
    }

    if (!["POTENCIJALNI_DUPLIKAT", "ANOMALIJA"].includes(existing.statusValidacije)) {
      throw new Error("Trosak nije u statusu koji zahtijeva odluku.");
    }

    if (action === "DELETE") {
      await this.notificationService.markDuplicateActionHandled(id, "OBRISAN");
      await this.expenseRepository.delete(id);
      this.expensesCache = null;

      return { id, action: "DELETE", deleted: true };
    }

    if (existing.statusValidacije === "ANOMALIJA") {
      await this.notificationService.markDuplicateActionHandled(id, "SACUVAN");
      this.expensesCache = null;

      return existing;
    }

    const budget = await this.expenseRepository.getBudgetContextForExpense(existing);
    const amount = Number(existing.iznos || 0);
    const planned = Number(budget?.planiraniIznos || 0);
    const spentBefore = Number(budget?.potrosenoPrijeTroska || 0);
    const projected = spentBefore + amount;

    if (budget && planned > 0 && projected > planned) {
      const percentageOverBudget = Number((((projected - planned) / planned) * 100).toFixed(1));
      const analysis = {
        status: "ANOMALIJA",
        severity: "HIGH",
        riskScore: 0.9,
        explanation: `Trosak bi doveo do prekoracenja planiranog budzeta za ${percentageOverBudget}%.`,
        recommendedAction: "Provjeriti trosak i odobrenje prije dalje obrade.",
        findings: [
          {
            type: "BUDGET_EXCEEDED",
            severity: "HIGH",
            message: `Trosak bi doveo do prekoracenja planiranog budzeta za ${percentageOverBudget}%.`,
            evidence: {
              plannedAmount: planned,
              spentBefore,
              projectedSpent: projected,
              deviation: Number((projected - planned).toFixed(2)),
              percentageOverBudget,
            },
          },
        ],
      };

      const updatedExpense = await this.expenseRepository.updateValidationStatus(id, "ANOMALIJA");
      await this.expenseRepository.createAnomaly(id, analysis);
      await this.notificationService.createAnomalyNotification(updatedExpense, analysis);
      await this.notificationService.markDuplicateActionHandled(id, "SACUVAN");
      this.expensesCache = null;

      return {
        ...updatedExpense,
        aiAnaliza: analysis,
      };
    }

    const updatedExpense = await this.expenseRepository.updateValidationStatus(id, "VALIDAN");
    await this.notificationService.markDuplicateActionHandled(id, "SACUVAN");
    this.expensesCache = null;

    return updatedExpense;
  }

  private normalizeDate(value: string): string | null {
    if (!value) {
      return null;
    }

    const localMatch = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/);
    if (localMatch) {
      const [, dayValue, monthValue, yearValue] = localMatch;

      if (!this.isValidDateParts(Number(yearValue), Number(monthValue), Number(dayValue))) {
        return null;
      }

      return `${yearValue}-${monthValue.padStart(2, "0")}-${dayValue.padStart(2, "0")}`;
    }

    const isoMatch = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
      const [, yearValue, monthValue, dayValue] = isoMatch;

      if (!this.isValidDateParts(Number(yearValue), Number(monthValue), Number(dayValue))) {
        return null;
      }

      return value.trim();
    }

    return null;
  }

  private isValidDateParts(year: number, month: number, day: number): boolean {
    const date = new Date(Date.UTC(year, month - 1, day));

    return (
      date.getUTCFullYear() === year &&
      date.getUTCMonth() === month - 1 &&
      date.getUTCDate() === day
    );
  }
}

module.exports = { ExpenseService };
