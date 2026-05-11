export interface CreateBudgetRequest {
  naziv: string;
  planiraniIznos: number;
  datumPocetka: string;
  datumZavrsetka: string;
  odjelId: string | number;
  projekatId?: string | number | null;
  kategorijaIds: Array<string | number>;
}

export interface IBudgetService {
  getAllBudgets(): Promise<any[]>;
  getBudgetById(id: string): Promise<any>;
  getReferenceData(): Promise<any>;
  createBudget(payload: CreateBudgetRequest, authUser?: unknown): Promise<any>;
  updateBudget(id: string, payload: CreateBudgetRequest, authUser?: unknown): Promise<any>;
  updateBudgetStatus(id: string, statusOdobrenja: string, authUser?: unknown): Promise<any>;
}

