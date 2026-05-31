export interface CreateBudgetRequest {
  naziv: string;
  planiraniIznos: number;
  datumPocetka: string;
  datumZavrsetka: string;
  odjelId: string | number;
  projekatId?: string | number | null;
  kategorijaIds: Array<string | number>;
}

export interface JwtPayload {
  sub?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  preferred_username?: string;
  roles?: string | string[];
  role?: string | string[];
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  [key: string]: unknown;
}

export interface BudzetKomentar {
  id: number;
  budzetId: string | number;
  autorId: string;
  autorIme: string;
  komentar: string;
  tip: "povrat_na_doradu" | "ispravka" | "odobravanje" | "odbijanje";
  kreiranoAt: string;
}

export interface IBudgetService {
  getAllBudgets(): Promise<any[]>;
  getBudgetById(id: string): Promise<any>;
  getReferenceData(): Promise<any>;
  createBudget(payload: CreateBudgetRequest, authUser?: unknown): Promise<any>;
  updateBudget(id: string, payload: CreateBudgetRequest, authUser?: unknown): Promise<any>;
  updateBudgetStatus(id: string, statusOdobrenja: string, authUser?: unknown): Promise<any>;
  vratiNaDoradu(budzetId: number | string, komentar: string, korisnik: JwtPayload): Promise<any>;
  submitujDoradu(budzetId: number | string, korisnik: JwtPayload): Promise<any>;
  getKomentari(budzetId: number | string): Promise<BudzetKomentar[]>;
}
