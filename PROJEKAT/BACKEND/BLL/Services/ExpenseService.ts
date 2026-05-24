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

    if (!payload.naziv || payload.naziv.trim() === "") {
      throw new Error("Naziv troška je obavezan.");
    }

    if (payload.naziv.length > 200) {
      throw new Error("Naziv troška ne smije imati više od 200 karaktera.");
    }

    const iznos = Number(payload.iznos);

    if (!Number.isFinite(iznos)) {
      throw new Error("Iznos mora biti validan broj.");
    }

    if (iznos <= 0) {
      throw new Error("Iznos mora biti veći od 0.");
    }

    const datum = this.normalizeDate(payload.datum);
    if (!datum) {
      throw new Error("Datum je obavezan i mora biti validan.");
    }

    if (!payload.kategorijaId) {
      throw new Error("Kategorija je obavezna.");
    }

    if (!payload.odjelId) {
      throw new Error("Odjel je obavezan.");
    }

    if (!payload.valutaId) {
      throw new Error("Valuta je obavezna.");
    }

    return {
      ...payload,
      datum,
    };
  }

  private async runAiValidationForCreatedExpense(createdExpense: any): Promise<any> {
    try {
      const context = await this.expenseRepository.getAiAnalysisContext(createdExpense);
      const analysis = await this.aiAnalysisService.analyzeExpense(createdExpense, context);

      if (analysis?.status !== "ANOMALIJA") {
        return await this.expenseRepository.updateValidationStatus(createdExpense.id, "VALIDAN");
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
