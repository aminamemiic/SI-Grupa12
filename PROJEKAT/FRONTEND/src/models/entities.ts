export interface Expense {
  id: string | number;
  naziv: string;
  iznos: number;
  datum: string;
  opis?: string | null;

  kategorijaId?: string | number;
  kategorija?: string;

  odjelId?: string | number;
  odjel?: string;

  projekatId?: string | number | null;
  projekat?: string | null;

  dobavljacId?: string | number | null;
  dobavljac?: string | null;

  valutaId?: string | number;
  valuta?: string;

  statusValidacije?: string;
  kreiraoKorisnikId?: string | number;
}

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
}

export interface ReferenceItem {
  id: string | number;
  naziv?: string;
  naziv_projekta?: string;
  naziv_firme?: string;
  kod?: string;
}

export interface ExpenseReferenceData {
  kategorije: ReferenceItem[];
  odjeli: ReferenceItem[];
  valute: ReferenceItem[];
  projekti: ReferenceItem[];
  dobavljaci: ReferenceItem[];
}