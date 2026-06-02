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
  tipAnomalije?: string | null;
  opisAnomalije?: string | null;
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

export interface ExpenseCategorySuggestion {
  categoryId: string | number | null;
  categoryName: string | null;
  confidence: number;
  reason: string;
}

export interface Budget {
  id: string | number;
  naziv: string;
  planiraniIznos: number;
  datumPocetka: string;
  datumZavrsetka: string;
  odjelId: string | number;
  odjel?: string;
  projekatId?: string | number | null;
  projekat?: string | null;
  verzijaBudzeta?: number;
  statusOdobrenja?: BudzetStatus;
  kreiraoKorisnikId?: string | number | null;
  odobrioKorisnikId?: string | number | null;
  kategorije: string[];
  kategorijaIds: Array<string | number>;
}

export type BudzetStatus = 'nacrt' | 'na_cekanju' | 'odobren' | 'odbijen' | 'na_doradi' | 'NACRT' | 'ODOBREN' | 'ODBIJEN' | 'NA_CEKANJU';

export interface BudzetKomentar {
  id: number;
  budzetId: string | number;
  autorId: string;
  autorIme: string;
  komentar: string;
  tip: 'povrat_na_doradu' | 'ispravka' | 'odobravanje' | 'odbijanje';
  kreiranoAt: string;
}

export interface CreateBudgetRequest {
  naziv: string;
  planiraniIznos: number;
  datumPocetka: string;
  datumZavrsetka: string;
  odjelId: string | number;
  projekatId?: string | number | null;
  kategorijaIds: Array<string | number>;
}

export interface BudgetReferenceData {
  kategorije: ReferenceItem[];
  odjeli: ReferenceItem[];
  projekti: ReferenceItem[];
}

export interface DataOverviewExpense {
  id: string | number;
  naziv: string;
  iznos: number;
  datum: string;
  opis?: string | null;
  statusValidacije?: string;
  kategorijaId?: string | number;
  kategorijaNaziv?: string | null;
  odjelId?: string | number;
  odjelNaziv?: string | null;
  valutaId?: string | number;
  valutaKod?: string | null;
  valutaNaziv?: string | null;
  projekatId?: string | number | null;
  projekatNaziv?: string | null;
  dobavljacId?: string | number | null;
  dobavljacNaziv?: string | null;
  kreiraoKorisnikId?: string | number;
  tipAnomalije?: string | null;
  opisAnomalije?: string | null;
}

export interface DataOverviewBudget {
  id: string | number;
  naziv: string;
  planiraniIznos: number;
  datumPocetka: string;
  datumZavrsetka: string;
  odjelId?: string | number;
  odjelNaziv?: string | null;
  projekatId?: string | number | null;
  projekatNaziv?: string | null;
  verzijaBudzeta?: number;
  statusOdobrenja?: string;
  odobrioKorisnikId?: string | number | null;
  kategorije: Array<{ id: string | number; naziv: string }>;
  kategorijaIds: Array<string | number>;
}

export interface DataOverviewCategory {
  id: string | number;
  naziv: string;
  opis?: string | null;
}

export interface DataOverviewDepartment {
  id: string | number;
  naziv: string;
  sifraOdjela?: string;
  rukovodilacId?: string | number | null;
}

export interface DataOverviewCurrency {
  id: string | number;
  kod: string;
  naziv: string;
}

export interface DataOverviewProject {
  id: string | number;
  nazivProjekta: string;
  sifraProjekta?: string;
  budzetProjekta?: number;
  datumPocetak?: string;
  datumZavrsetak?: string | null;
  menadzerId?: string | number | null;
  status?: string;
}

export interface DataOverviewSupplier {
  id: string | number;
  nazivFirme: string;
  pibIdBroj?: string | null;
  adresa?: string | null;
  rejtingPouzdanosti?: number | null;
}

export interface DataOverview {
  troskovi: DataOverviewExpense[];
  budzeti: DataOverviewBudget[];
  kategorije: DataOverviewCategory[];
  odjeli: DataOverviewDepartment[];
  valute: DataOverviewCurrency[];
  projekti: DataOverviewProject[];
  dobavljaci: DataOverviewSupplier[];
}

export interface ReportFilters {
  datumOd?: string;
  datumDo?: string;
  tipIzvjestaja?: ReportType;
}

export type ReportExportFormat = 'xlsx' | 'csv' | 'pdf';
export type ReportType = 'sazeti' | 'detaljni';

export interface ReportBreakdownItem {
  label: string;
  total: number;
  count: number;
  average: number;
  percentage: number;
}

export interface ExpenseReportSummary {
  totalExpenses: number;
  totalAmount: number;
  averageAmount: number;
  budgetCount: number;
  budgetTotal: number;
  budgetUtilizationPercent: number | null;
  highestExpense: DataOverviewExpense | null;
  lowestExpense: DataOverviewExpense | null;
  topCategory: ReportBreakdownItem | null;
  topDepartment: ReportBreakdownItem | null;
}

export interface ExpenseReport {
  generatedAt: string;
  period: {
    datumOd: string | null;
    datumDo: string | null;
  };
  summary: ExpenseReportSummary;
  breakdowns: {
    byCategory: ReportBreakdownItem[];
    byDepartment: ReportBreakdownItem[];
    byCurrency: ReportBreakdownItem[];
    byStatus: ReportBreakdownItem[];
    byMonth: ReportBreakdownItem[];
  };
  expenses: DataOverviewExpense[];
}

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface AppNotification {
  id: string | number;
  naslov: string;
  poruka: string;
  prioritet: NotificationPriority;
  korisnikId?: string | number;
  tipNotifikacije?: string;
  povezaniTrosakId?: string | number | null;
  akcijaStatus?: string | null;
  procitano: boolean;
  vrijemeKreiranja: string;
}

export interface Comment {
  id: string | number;
  tekst: string;
  vrijemeUnosa: string;
  autorId: string | number;
  autorIme: string;
  autorPrezime: string;
}
