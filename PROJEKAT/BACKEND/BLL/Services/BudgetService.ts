import type {
  BudzetKomentar,
  CreateBudgetRequest,
  IBudgetService,
  JwtPayload,
} from "../Interfaces/IBudgetService";

const { BudgetRepository } = require("../../DAL/Repositories/BudgetRepository");
const { NotificationService } = require("./NotificationService");

export class BudgetService implements IBudgetService {
  private budgetRepository: any;
  private notificationService: any;
  private budgetsCache: { expiresAt: number; data: any[] } | null = null;
  private referenceDataCache: { expiresAt: number; data: any } | null = null;
  private readonly cacheTtlMs = 30 * 1000;

  constructor() {
    this.budgetRepository = new BudgetRepository();
    this.notificationService = new NotificationService();
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

  async getBudgetProjection(id: string): Promise<any> {
    const stats = await this.budgetRepository.getBudgetSpentStats(id);
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const dailySpendingRate = currentDay > 0 ? stats.potrosenoUovomMjesecu / currentDay : 0;
    const projectedThisMonth = dailySpendingRate * daysInMonth;
    const projectedFinalBalance = stats.planiraniIznos - stats.potrosenoPrijeOvogMjeseca - projectedThisMonth;

    return {
      budgetId: id,
      planiraniIznos: stats.planiraniIznos,
      potrosenoPrijeOvogMjeseca: stats.potrosenoPrijeOvogMjeseca,
      potrosenoUovomMjesecu: stats.potrosenoUovomMjesecu,
      dnevnaBrzinaTrosenja: dailySpendingRate,
      projektovanaPotrosnjaZaMjesec: projectedThisMonth,
      projektovanoKrajnjeStanje: projectedFinalBalance,
    };
  }

  async getReferenceData(): Promise<any> {
    if (this.referenceDataCache && this.referenceDataCache.expiresAt > Date.now()) {
      return this.referenceDataCache.data;
    }

    const referenceData = await this.budgetRepository.getReferenceData();
    this.referenceDataCache = { expiresAt: Date.now() + this.cacheTtlMs, data: referenceData };
    return referenceData;
  }

  async createBudget(payload: CreateBudgetRequest, authUser?: JwtPayload): Promise<any> {
    const normalized = this.validateBudget(payload);

    if (await this.budgetRepository.existsDuplicate(normalized)) {
      throw new Error("Budzet za odabrani odjel, kategoriju i period vec postoji.");
    }

    try {
      const createdById = authUser ? await this.budgetRepository.getUserIdFromAuth(authUser) : null;

      if (authUser && !createdById) {
        throw new Error("Nije moguce evidentirati kreatora budzeta.");
      }

      const createdBudget = await this.budgetRepository.create(normalized, createdById);
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

  async updateBudgetStatus(id: string, statusOdobrenja: string, authUser?: JwtPayload): Promise<any> {
    const allowedStatuses = ["ODOBREN", "ODBIJEN"];

    if (!allowedStatuses.includes(statusOdobrenja)) {
      throw new Error("Status budzeta mora biti ODOBREN ili ODBIJEN.");
    }

    const existing = await this.budgetRepository.getById(id);

    if (!existing) {
      throw new Error("Budzet ne postoji.");
    }

    if (this.normalizeStatus(existing.statusOdobrenja) === "odobren") {
      throw new Error("Budzet je vec odobren.");
    }

    const odobrioKorisnikId = authUser
      ? await this.budgetRepository.getUserIdFromAuth(authUser)
      : null;

    if (!odobrioKorisnikId) {
      throw new Error("Nije moguce evidentirati korisnika koji odobrava budzet.");
    }

    const updatedBudget = await this.budgetRepository.updateStatus(
      id,
      statusOdobrenja,
      odobrioKorisnikId
    );

    this.budgetsCache = null;

    return updatedBudget;
  }

  async vratiNaDoradu(budzetId: number | string, komentar: string, korisnik: JwtPayload): Promise<any> {
    if (!this.hasRole(korisnik, "finansijski_direktor")) {
      throw new Error("Nemate dozvolu za ovu akciju.");
    }

    const existing = await this.budgetRepository.getById(String(budzetId));
    if (!existing) {
      throw new Error("Budzet ne postoji.");
    }

    const status = this.normalizeStatus(existing.statusOdobrenja);
    if (!["nacrt", "na_cekanju"].includes(status)) {
      throw new Error("Budžet mora biti u statusu 'nacrt' ili 'na čekanju' da bi se mogao vratiti na doradu.");
    }

    const trimmedKomentar = (komentar || "").trim();
    if (!trimmedKomentar) {
      throw new Error("Komentar je obavezan pri povratu budžeta na doradu.");
    }

    const autorId = korisnik ? await this.budgetRepository.getUserIdFromAuth(korisnik) : null;
    if (!autorId) {
      throw new Error("Nije moguce evidentirati korisnika koji vraca budzet na doradu.");
    }

    const autorIme = this.getDisplayNameFromAuthUser(korisnik);
    const updatedBudget = await this.budgetRepository.vratiNaDoradu(
      budzetId,
      autorId,
      autorIme,
      trimmedKomentar
    );

    this.budgetsCache = null;

    await this.notificationService.createBudgetReturnedToRevisionNotification(
      updatedBudget,
      trimmedKomentar
    );

    return updatedBudget;
  }

  async submitujDoradu(budzetId: number | string, korisnik: JwtPayload): Promise<any> {
    if (!this.hasRole(korisnik, "glavni_racunovodja")) {
      throw new Error("Nemate dozvolu za ovu akciju.");
    }

    const existing = await this.budgetRepository.getById(String(budzetId));
    if (!existing) {
      throw new Error("Budzet ne postoji.");
    }

    if (this.normalizeStatus(existing.statusOdobrenja) !== "na_doradi") {
      throw new Error("Budžet mora biti u statusu 'na_doradi' da bi se mogao submitovati.");
    }

    const currentUserId = await this.budgetRepository.getUserIdFromAuth(korisnik);
    if (!currentUserId || currentUserId !== existing.kreiraoKorisnikId) {
      throw new Error("Samo kreator budžeta može submitovati doradu.");
    }

    const finansijskiDirektorId = existing.odobrioKorisnikId || null;
    const autorIme = this.getDisplayNameFromAuthUser(korisnik);

    const updatedBudget = await this.budgetRepository.updateStatus(
      String(budzetId),
      "na_cekanju",
      finansijskiDirektorId
    );

    await this.budgetRepository.dodajKomentar(
      String(budzetId),
      currentUserId,
      autorIme,
      "Budžet je dorađen i ponovo poslan na odobravanje.",
      "ispravka"
    );

    this.budgetsCache = null;

    await this.notificationService.createBudgetRevisedNotification(
      updatedBudget,
      finansijskiDirektorId
    );

    return updatedBudget;
  }

  async getKomentari(budzetId: number | string): Promise<BudzetKomentar[]> {
    return this.budgetRepository.getKomentari(budzetId);
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

    const kategorijaIds = Array.from(
      new Set((payload.kategorijaIds || []).map((id) => String(id)).filter(Boolean))
    );

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

  private normalizeStatus(status: string | null | undefined): string {
    return String(status || "").toLowerCase().trim();
  }

  private hasRole(authUser: JwtPayload | undefined, role: string): boolean {
    return this.getAuthRoles(authUser).includes(role);
  }

  private getAuthRoles(authUser: any): string[] {
    const roleSet = new Set<string>();

    const addRole = (role: unknown) => {
      if (typeof role === "string" && role.trim()) {
        roleSet.add(this.normalizeRole(role));
      }
    };

    const addRoles = (roles: unknown) => {
      if (Array.isArray(roles)) {
        roles.forEach(addRole);
        return;
      }

      addRole(roles);
    };

    addRoles(authUser?.roles);
    addRoles(authUser?.role);
    addRoles(authUser?.realm_access?.roles);

    if (authUser?.resource_access && typeof authUser.resource_access === "object") {
      Object.values(authUser.resource_access).forEach((resource: any) =>
        addRoles(resource?.roles)
      );
    }

    return Array.from(roleSet);
  }

  private normalizeRole(role: string): string {
    return role
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_");
  }

  private getDisplayNameFromAuthUser(authUser: JwtPayload | undefined): string {
    const name = typeof authUser?.name === "string" ? authUser.name.trim() : "";
    if (name) {
      return this.collapseRepeatedWords(name);
    }

    const givenName = typeof authUser?.given_name === "string" ? authUser.given_name.trim() : "";
    const familyName = typeof authUser?.family_name === "string" ? authUser.family_name.trim() : "";
    const preferredUsername =
      typeof authUser?.preferred_username === "string"
        ? authUser.preferred_username.trim()
        : "";

    if (givenName || familyName) {
      return this.collapseRepeatedWords(`${givenName} ${familyName}`.trim());
    }

    return this.collapseRepeatedWords(
      preferredUsername || (typeof authUser?.sub === "string" ? authUser.sub.trim() : "Korisnik")
    );
  }

  private collapseRepeatedWords(value: string): string {
    const parts = value.split(/\s+/).filter(Boolean);
    const deduped: string[] = [];

    for (const part of parts) {
      if (deduped[deduped.length - 1]?.toLowerCase() === part.toLowerCase()) {
        continue;
      }

      deduped.push(part);
    }

    return deduped.join(" ").trim();
  }

  private isBudgetPeriodOverlapError(error: any): boolean {
    return (
      error?.constraint === "budzeti_odjel_id_daterange_excl" ||
      error?.message?.includes("budzeti_odjel_id_daterange_excl")
    );
  }
}

module.exports = { BudgetService };
