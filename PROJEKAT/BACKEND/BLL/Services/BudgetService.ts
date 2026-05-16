import type { CreateBudgetRequest, IBudgetService } from "../Interfaces/IBudgetService";

const { BudgetRepository } = require("../../DAL/Repositories/BudgetRepository");

export class BudgetService implements IBudgetService {
  private budgetRepository: any;
  private budgetsCache: { expiresAt: number; data: any[] } | null = null;
  private referenceDataCache: { expiresAt: number; data: any } | null = null;
  private readonly cacheTtlMs = 30 * 1000;

  constructor() {
    this.budgetRepository = new BudgetRepository();
  }

  async getAllBudgets(): Promise<any[]> {
    if (this.budgetsCache && this.budgetsCache.expiresAt > Date.now()) {
      return this.budgetsCache.data;
    }

    const budgets = await this.budgetRepository.getAll();
    this.budgetsCache = { expiresAt: Date.now() + this.cacheTtlMs, data: budgets };
    return budgets;
  }

  async getBudgetById(id: string): Promise<any> {
    return this.budgetRepository.getById(id);
  }

  async getReferenceData(): Promise<any> {
    if (this.referenceDataCache && this.referenceDataCache.expiresAt > Date.now()) {
      return this.referenceDataCache.data;
    }

    const referenceData = await this.budgetRepository.getReferenceData();
    this.referenceDataCache = { expiresAt: Date.now() + this.cacheTtlMs, data: referenceData };
    return referenceData;
  }

  async createBudget(payload: CreateBudgetRequest): Promise<any> {
    const normalized = this.validateBudget(payload);

    if (await this.budgetRepository.existsDuplicate(normalized)) {
      throw new Error("Budzet za odabrani odjel, kategoriju i period vec postoji.");
      
    }

     try {
    const createdBudget = await this.budgetRepository.create(normalized);
    this.budgetsCache = null;
    return createdBudget;
  } catch (error: any) {
    if (this.isBudgetPeriodOverlapError(error)) {
      throw new Error(
        "Nije moguce kreirati budzet jer za odabrani odjel vec postoji budzet u periodu koji se preklapa sa unesenim datumima."
      );
    }

    throw error;
  }
  }

 async updateBudget(id: string, payload: CreateBudgetRequest): Promise<any> {
  const existing = await this.budgetRepository.getById(id);
  if (!existing) {
    throw new Error("Budzet ne postoji.");
  }

  const normalized = this.validateBudget(payload);

  if (await this.budgetRepository.existsDuplicate(normalized, id)) {
    throw new Error(
      "Nije moguce azurirati budzet jer za odabrani odjel i kategoriju vec postoji budzet u periodu koji se preklapa sa unesenim datumima."
    );
  }

  try {
    const updatedBudget = await this.budgetRepository.update(id, normalized);
    this.budgetsCache = null;
    return updatedBudget;
  } catch (error: any) {
    if (this.isBudgetPeriodOverlapError(error)) {
      throw new Error(
        "Nije moguce azurirati budzet jer za odabrani odjel vec postoji budzet u periodu koji se preklapa sa unesenim datumima."
      );
    }

    throw error;
  }
}

  async updateBudgetStatus(id: string, statusOdobrenja: string, authUser?: any): Promise<any> {
  const allowedStatuses = ["ODOBREN", "ODBIJEN"];

  if (!allowedStatuses.includes(statusOdobrenja)) {
    throw new Error("Status budzeta mora biti ODOBREN ili ODBIJEN.");
  }

  const existing = await this.budgetRepository.getById(id);

  if (!existing) {
    throw new Error("Budzet ne postoji.");
  }

  if (existing.statusOdobrenja === "ODOBREN") {
    throw new Error("Budzet je vec odobren.");
  }

  const odobrioKorisnikId = authUser
  ? await this.budgetRepository.getUserIdFromAuth(authUser)
  : null;

if (!odobrioKorisnikId) {
  throw new Error("Nije moguce evidentirati korisnika koji odobrava budzet.");
}
  //const odobrioKorisnikId = null;

  const updatedBudget = await this.budgetRepository.updateStatus(
    id,
    statusOdobrenja,
    odobrioKorisnikId
  );

  this.budgetsCache = null;

  return updatedBudget;
}

  private validateBudget(payload: CreateBudgetRequest): any {
    if (!payload) {
      throw new Error("Podaci za budzet nisu poslani.");
    }

    if (!payload.naziv || payload.naziv.trim() === "") {
      throw new Error("Naziv budzeta je obavezan.");
    }

    if (payload.naziv.length > 200) {
      throw new Error("Naziv budzeta ne smije imati vise od 200 karaktera.");
    }

    const planiraniIznos = Number(payload.planiraniIznos);
    if (!Number.isFinite(planiraniIznos) || planiraniIznos <= 0) {
      throw new Error("Planirani iznos mora biti veci od 0.");
    }

    const datumPocetka = this.normalizeDate(payload.datumPocetka);
    if (!datumPocetka) {
      throw new Error("Datum pocetka je obavezan i mora biti validan.");
    }

    const datumZavrsetka = this.normalizeDate(payload.datumZavrsetka);
    if (!datumZavrsetka) {
      throw new Error("Datum zavrsetka je obavezan i mora biti validan.");
    }

    if (datumZavrsetka < datumPocetka) {
      throw new Error("Datum zavrsetka ne moze biti prije datuma pocetka.");
    }

    if (!payload.odjelId) {
      throw new Error("Odjel je obavezan.");
    }

    const kategorijaIds = Array.from(new Set((payload.kategorijaIds || []).map((id) => String(id)).filter(Boolean)));
    if (kategorijaIds.length === 0) {
      throw new Error("Potrebno je odabrati barem jednu kategoriju.");
    }

    return {
      naziv: payload.naziv.trim(),
      planiraniIznos,
      datumPocetka,
      datumZavrsetka,
      odjelId: payload.odjelId,
      projekatId: payload.projekatId || null,
      kategorijaIds,
    };
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

  private isBudgetPeriodOverlapError(error: any): boolean {
  return (
    error?.constraint === "budzeti_odjel_id_daterange_excl" ||
    error?.message?.includes("budzeti_odjel_id_daterange_excl")
  );
}
}

module.exports = { BudgetService };

