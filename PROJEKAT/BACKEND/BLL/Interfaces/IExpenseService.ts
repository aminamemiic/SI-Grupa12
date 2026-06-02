export interface CreateExpenseRequest {
  naziv: string;
  iznos: number;
  datum: string;
  opis?: string | null;
  kategorijaId: string | number;
  odjelId: string | number;
  projekatId?: string | number | null;
  dobavljacId?: string | number | null;
  valutaId: string | number;
  kreiraoKorisnikId?: string | number | null;
}

export interface IExpenseService {
  getAllExpenses(): Promise<any[]>;
  createExpense(payload: CreateExpenseRequest, authUser?: unknown): Promise<any>;
  updateExpense(id: string, payload: CreateExpenseRequest, authUser?: unknown): Promise<any>;
  deleteExpense(id: string, authUser?: unknown): Promise<void>;
  getReferenceData(): Promise<any>;
  suggestCategory(payload: any): Promise<any>;
  validateExpenseBeforeCreation(payload: CreateExpenseRequest): Promise<{
    isValid: boolean;
    validationErrors: string[];
    warnings: Array<{ type: string; message: string; severity: "LOW" | "MEDIUM" | "HIGH" }>;
  }>;
}
