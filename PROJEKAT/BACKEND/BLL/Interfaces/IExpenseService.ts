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
  getReferenceData(): Promise<any>;
}
