import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  DataOverview,
  DataOverviewBudget,
  DataOverviewCategory,
  DataOverviewCurrency,
  DataOverviewDepartment,
  DataOverviewExpense,
  DataOverviewProject,
  DataOverviewSupplier,
} from '../../../models/entities';
import { DataOverviewService } from '../../../services/data-overview.service';
import { IngestionService, ImportHistoryEntry } from '../../../services/ingestion.service';
import { CategoryComparisonComponent } from './components/category-comparison/category-comparison';
import { PlannedActualComparisonComponent } from './components/planned-actual-comparison/planned-actual-comparison';
import { SelectedExpenseComparisonComponent } from './components/selected-expense-comparison/selected-expense-comparison';

type GroupComparisonMode = 'category' | 'department' | 'categoryDepartment' | 'period';

type DetailField = {
  label: string;
  value: string;
};

type SelectedDetail = {
  type: string;
  title: string;
  fields: DetailField[];
  importedRows?: any[];
  errors?: Array<{ rowNumber?: number; message: string }>;
};

@Component({
  selector: 'app-data-overview',
  standalone: true,
  imports: [CommonModule, SelectedExpenseComparisonComponent, CategoryComparisonComponent, PlannedActualComparisonComponent],
  templateUrl: './data-overview.html',
  styleUrl: './data-overview.css',
})
export class DataOverviewComponent implements OnInit {
  private readonly dataOverviewService = inject(DataOverviewService);
  private readonly ingestionService = inject(IngestionService);
  private readonly cdr = inject(ChangeDetectorRef);

  public overview: DataOverview = this.getEmptyOverview();
  public isLoading = false;
  public isLoadingImportHistory = false;
  public errorMessage = '';
  public importHistoryMessage = '';
  public importHistory: ImportHistoryEntry[] = [];
  public selectedDetail: SelectedDetail | null = null;
  public selectedExpenseIds: Set<string | number> = new Set();
  public isComparisonPanelOpen = false;
  public isCategoryComparisonPanelOpen = false;
  public isPlannedActualComparisonPanelOpen = false;
  public categoryComparisonSelectedCategories: Set<string> = new Set();
  public categoryComparisonSelectedDepartments: Set<string> = new Set();
  public categoryComparisonDateFrom = '';
  public categoryComparisonDateTo = '';
  public categoryComparisonMode: GroupComparisonMode = 'category';
  public plannedActualSelectedCategories: Set<string> = new Set();
  public plannedActualSelectedDepartments: Set<string> = new Set();
  public plannedActualDateFrom = '';
  public plannedActualDateTo = '';

  public ngOnInit(): void {
    this.loadOverview();
    this.loadImportHistory();
  }

  public get totalExpensesAmount(): number {
    return this.overview.troskovi.reduce((sum, expense) => sum + Number(expense.iznos || 0), 0);
  }

  public get totalBudgetsAmount(): number {
    return this.overview.budzeti.reduce((sum, budget) => sum + Number(budget.planiraniIznos || 0), 0);
  }

  public get hasAnyData(): boolean {
    return Object.values(this.overview).some((items) => items.length > 0);
  }

  public get selectedExpenses(): DataOverviewExpense[] {
    return this.overview.troskovi.filter((expense) => this.selectedExpenseIds.has(expense.id));
  }

  public get canCompareExpenses(): boolean {
    return this.selectedExpenseIds.size >= 2;
  }

  public loadOverview(): void {
    this.isLoading = true;
    this.errorMessage = '';
    this.selectedDetail = null;
    this.clearExpenseSelection();
    this.isComparisonPanelOpen = false;

    this.dataOverviewService.getOverview().subscribe({
      next: (overview) => {
        this.overview = this.normalizeOverview(overview);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = error?.error?.message || 'Greška pri dohvatu pregleda podataka.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public loadImportHistory(): void {
    this.isLoadingImportHistory = true;
    this.importHistoryMessage = '';

    this.ingestionService.getImportHistory().subscribe({
      next: (history) => {
        this.importHistory = history || [];
        this.isLoadingImportHistory = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.importHistory = [];
        this.importHistoryMessage = 'Historija uvoza trenutno nije dostupna.';
        this.isLoadingImportHistory = false;
        this.cdr.detectChanges();
      },
    });
  }

  public getBudgetCategories(budget: DataOverviewBudget): string {
    if (!budget.kategorije?.length) {
      return '-';
    }

    return budget.kategorije.map((category) => category.naziv).join(', ');
  }

  public getExpenseCurrency(expense: DataOverviewExpense): string {
    return expense.valutaKod || expense.valutaNaziv || '-';
  }

  public isExpenseSelected(expenseId: string | number): boolean {
    return this.selectedExpenseIds.has(expenseId);
  }

  public toggleExpenseSelection(expense: DataOverviewExpense): void {
    if (this.selectedExpenseIds.has(expense.id)) {
      this.selectedExpenseIds.delete(expense.id);
    } else {
      this.selectedExpenseIds.add(expense.id);
    }

    if (!this.canCompareExpenses) {
      this.isComparisonPanelOpen = false;
    }
  }

  public areAllFilteredExpensesSelected(): boolean {
    return this.filteredExpenses.length > 0 && this.filteredExpenses.every((expense) => this.selectedExpenseIds.has(expense.id));
  }

  public selectAllFilteredExpenses(): void {
    if (this.areAllFilteredExpensesSelected()) {
      this.filteredExpenses.forEach((expense) => this.selectedExpenseIds.delete(expense.id));
    } else {
      this.filteredExpenses.forEach((expense) => this.selectedExpenseIds.add(expense.id));
    }

    if (!this.canCompareExpenses) {
      this.isComparisonPanelOpen = false;
    }
  }

  public clearExpenseSelection(): void {
    this.selectedExpenseIds.clear();
    this.isComparisonPanelOpen = false;
  }

  public openComparisonPanel(): void {
    if (!this.canCompareExpenses) {
      return;
    }

    this.selectedDetail = null;
    this.isComparisonPanelOpen = true;
  }

  public closeComparisonPanel(): void {
    this.isComparisonPanelOpen = false;
  }

  public openCategoryComparisonPanel(): void {
    this.selectedDetail = null;
    this.isCategoryComparisonPanelOpen = true;
  }

  public closeCategoryComparisonPanel(): void {
    this.isCategoryComparisonPanelOpen = false;
  }

  public openPlannedActualComparisonPanel(): void {
    this.selectedDetail = null;
    this.isPlannedActualComparisonPanelOpen = true;
  }

  public closePlannedActualComparisonPanel(): void {
    this.isPlannedActualComparisonPanelOpen = false;
  }

  public openExpenseDetails(expense: DataOverviewExpense): void {
    this.selectedDetail = {
      type: 'Trošak',
      title: expense.naziv || 'Trošak',
      fields: [
        { label: 'Naziv', value: this.formatValue(expense.naziv) },
        { label: 'Iznos', value: this.formatAmount(expense.iznos) },
        { label: 'Datum', value: this.formatDate(expense.datum) },
        { label: 'Opis', value: this.formatValue(expense.opis) },
        { label: 'Status validacije', value: this.formatValue(expense.statusValidacije) },
        { label: 'Kategorija naziv', value: this.formatValue(expense.kategorijaNaziv) },
        { label: 'Odjel naziv', value: this.formatValue(expense.odjelNaziv) },
        { label: 'Valuta kod', value: this.formatValue(expense.valutaKod) },
        { label: 'Valuta naziv', value: this.formatValue(expense.valutaNaziv) },
        { label: 'Projekat naziv', value: this.formatValue(expense.projekatNaziv) },
        { label: 'Dobavljač naziv', value: this.formatValue(expense.dobavljacNaziv) },
      ],
    };
  }

  public openBudgetDetails(budget: DataOverviewBudget): void {
    this.selectedDetail = {
      type: 'Budžet',
      title: budget.naziv || 'Budžet',
      fields: [
        { label: 'Naziv', value: this.formatValue(budget.naziv) },
        { label: 'Planirani iznos', value: this.formatAmount(budget.planiraniIznos) },
        { label: 'Datum početka', value: this.formatDate(budget.datumPocetka) },
        { label: 'Datum završetka', value: this.formatDate(budget.datumZavrsetka) },
        { label: 'Odjel naziv', value: this.formatValue(budget.odjelNaziv) },
        { label: 'Kategorije', value: this.getBudgetCategories(budget) },
        { label: 'Projekat naziv', value: this.formatValue(budget.projekatNaziv) },
        { label: 'Verzija budžeta', value: this.formatValue(budget.verzijaBudzeta) },
        { label: 'Status odobrenja', value: this.formatValue(budget.statusOdobrenja) },
      ],
    };
  }

  public openCategoryDetails(category: DataOverviewCategory): void {
    this.selectedDetail = {
      type: 'Kategorija',
      title: category.naziv || 'Kategorija',
      fields: [
        { label: 'Naziv', value: this.formatValue(category.naziv) },
        { label: 'Opis', value: this.formatValue(category.opis) },
      ],
    };
  }

  public openDepartmentDetails(department: DataOverviewDepartment): void {
    this.selectedDetail = {
      type: 'Odjel',
      title: department.naziv || 'Odjel',
      fields: [
        { label: 'Naziv', value: this.formatValue(department.naziv) },
        { label: 'Šifra odjela', value: this.formatValue(department.sifraOdjela) },
      ],
    };
  }

  public openCurrencyDetails(currency: DataOverviewCurrency): void {
    this.selectedDetail = {
      type: 'Valuta',
      title: currency.kod || 'Valuta',
      fields: [
        { label: 'Kod', value: this.formatValue(currency.kod) },
        { label: 'Naziv', value: this.formatValue(currency.naziv) },
      ],
    };
  }

  public openProjectDetails(project: DataOverviewProject): void {
    this.selectedDetail = {
      type: 'Projekat',
      title: project.nazivProjekta || 'Projekat',
      fields: [
        { label: 'Naziv projekta', value: this.formatValue(project.nazivProjekta) },
        { label: 'Šifra projekta', value: this.formatValue(project.sifraProjekta) },
        { label: 'Budžet projekta', value: this.formatAmount(project.budzetProjekta) },
        { label: 'Datum početka', value: this.formatDate(project.datumPocetak) },
        { label: 'Datum završetka', value: this.formatDate(project.datumZavrsetak) },
        { label: 'Status', value: this.formatValue(project.status) },
      ],
    };
  }

  public openSupplierDetails(supplier: DataOverviewSupplier): void {
    this.selectedDetail = {
      type: 'Dobavljač',
      title: supplier.nazivFirme || 'Dobavljač',
      fields: [
        { label: 'Naziv firme', value: this.formatValue(supplier.nazivFirme) },
        { label: 'PIB broj', value: this.formatValue(supplier.pibIdBroj) },
        { label: 'Adresa', value: this.formatValue(supplier.adresa) },
        { label: 'Rejting pouzdanosti', value: this.formatValue(supplier.rejtingPouzdanosti) },
      ],
    };
  }

  public closeDetails(): void {
    this.selectedDetail = null;
  }

  public openImportHistoryDetails(entry: ImportHistoryEntry): void {
    this.selectedDetail = {
      type: 'Historija uvoza',
      title: entry.fileName || 'Uvoz bez naziva fajla',
      fields: [
        { label: 'Naziv fajla', value: this.formatValue(entry.fileName) },
        { label: 'Vrijeme uvoza', value: this.formatDateTime(entry.createdAt) },
        { label: 'Status', value: this.formatValue(entry.status) },
        { label: 'Ukupno redova', value: this.formatValue(entry.totalRows) },
        { label: 'Validnih redova', value: this.formatValue(entry.validRows) },
        { label: 'Nevalidnih redova', value: this.formatValue(entry.invalidRows) },
        { label: 'Upisanih redova', value: this.formatValue(entry.insertedCount) },
        { label: 'Kreirao', value: this.formatValue(entry.createdByEmail) },
      ],
      importedRows: entry.importedRows || [],
      errors: entry.errors || [],
    };
  }

  public getImportedExpenseValue(row: any, fieldName: string): string {
    if (fieldName === 'datum') {
      return this.formatDate(row?.[fieldName]);
    }

    return this.formatValue(row?.[fieldName]);
  }

  public onBudgetFilterDateChange(value: string, fieldName: 'from' | 'to'): void {
    const isoDate = this.toIsoDate(value);
    if (fieldName === 'from') {
      this.budgetFilterPeriodOd = isoDate;
      return;
    }

    this.budgetFilterPeriodDo = isoDate;
  }

  public toDisplayDate(value: string): string {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
  }

  private normalizeOverview(overview: DataOverview | null | undefined): DataOverview {
    const empty = this.getEmptyOverview();

    return {
      troskovi: overview?.troskovi || empty.troskovi,
      budzeti: overview?.budzeti || empty.budzeti,
      kategorije: overview?.kategorije || empty.kategorije,
      odjeli: overview?.odjeli || empty.odjeli,
      valute: overview?.valute || empty.valute,
      projekti: overview?.projekti || empty.projekti,
      dobavljaci: overview?.dobavljaci || empty.dobavljaci,
    };
  }

  private getEmptyOverview(): DataOverview {
    return {
      troskovi: [],
      budzeti: [],
      kategorije: [],
      odjeli: [],
      valute: [],
      projekti: [],
      dobavljaci: [],
    };
  }

  private formatValue(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    return String(value);
  }

  private formatAmount(value: unknown): string {
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    const amount = Number(value);
    if (!Number.isFinite(amount)) {
      return String(value);
    }

    return amount.toLocaleString('bs-BA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  private formatDate(value: unknown): string {
    if (!value) {
      return '-';
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return this.formatDateParts(date);
  }

  private formatDateTime(value: unknown): string {
    if (!value) {
      return '-';
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    return `${this.formatDateParts(date)} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  }

  private formatDateParts(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  private toIsoDate(value: string): string {
    const trimmed = String(value || '').trim();
    const displayMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/);
    if (displayMatch) {
      const [, day, month, year] = displayMatch;
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    return trimmed.match(/^\d{4}-\d{2}-\d{2}$/) ? trimmed : '';
  }

  sectionSearch: string = '';

showSection(name: string): boolean {
  if (!this.sectionSearch.trim()) return true;
  const q = this.sectionSearch.toLowerCase().trim();
  const map: Record<string, string[]> = {
    'troskovi': ['trošak', 'troskovi', 'trosak', 'expense'],
    'budzeti': ['budzet', 'budžet', 'budget'],
    'historija': ['historija', 'uvoz', 'import'],
    'kategorije': ['kategorija', 'kategorije'],
    'odjeli': ['odjel', 'odjeli'],
    'valute': ['valuta', 'valute'],
    'projekti': ['projekat', 'projekti'],
    'dobavljaci': ['dobavljac', 'dobavljaci'],
  };
  return map[name]?.some(keyword => keyword.includes(q) || q.includes(keyword)) ?? false;
}
expenseSearch: string = '';
expenseSortColumn: string = '';
expenseSortDirection: 'asc' | 'desc' = 'asc';

get filteredExpenses() {
  let list = [...this.overview.troskovi];

  if (this.expenseSearch.trim()) {
    const q = this.expenseSearch.toLowerCase();
    list = list.filter(e =>
      e.naziv?.toLowerCase().includes(q) ||
      e.kategorijaNaziv?.toLowerCase().includes(q) ||
      e.odjelNaziv?.toLowerCase().includes(q) ||
      e.projekatNaziv?.toLowerCase().includes(q) ||
      e.dobavljacNaziv?.toLowerCase().includes(q) ||
      e.statusValidacije?.toLowerCase().includes(q)
    );
  }

  if (this.expenseFilterKategorija) {
    list = list.filter(e => e.kategorijaNaziv === this.expenseFilterKategorija);
  }

  if (this.expenseFilterOdjel) {
    list = list.filter(e => e.odjelNaziv === this.expenseFilterOdjel);
  }

  if (this.expenseFilterStatus) {
    list = list.filter(e => e.statusValidacije === this.expenseFilterStatus);
  }
  if (this.expenseFilterValuta) {
    list = list.filter(e => e.valutaKod === this.expenseFilterValuta);
  }
  if (this.expenseFilterDobavljac) {
  list = list.filter(e => e.dobavljacNaziv === this.expenseFilterDobavljac);
}

if (this.expenseMinIznos > 0 || this.expenseMaxIznos > 0) {
  list = list.filter(e => {
    const iznos = Number(e.iznos || 0);
    const min = this.expenseMinIznos || this.expenseIznosMin;
    const max = this.expenseMaxIznos || this.expenseIznosMax;
    return iznos >= min && iznos <= max;
  });
}

  if (this.expenseSortColumn) {
    list.sort((a, b) => {
      const valA = (a as any)[this.expenseSortColumn] ?? '';
      const valB = (b as any)[this.expenseSortColumn] ?? '';
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return this.expenseSortDirection === 'asc' ? cmp : -cmp;
    });
  }

  return list;
}

sortExpenses(column: string): void {
  if (this.expenseSortColumn === column) {
    this.expenseSortDirection = this.expenseSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.expenseSortColumn = column;
    this.expenseSortDirection = 'asc';
  }
}
expenseFilterKategorija: string = '';
expenseFilterOdjel: string = '';
expenseFilterStatus: string = '';
expenseFilterValuta: string = '';
get uniqueKategorije() {
  return [...new Set(this.overview.troskovi.map(e => e.kategorijaNaziv).filter(Boolean))];
}

get uniqueOdjeli() {
  return [...new Set(this.overview.troskovi.map(e => e.odjelNaziv).filter(Boolean))];
}

get uniqueStatusi() {
  return [...new Set(this.overview.troskovi.map(e => e.statusValidacije).filter(Boolean))];
}
get uniqueValute() {
  return [...new Set(this.overview.troskovi.map(e => e.valutaKod).filter(Boolean))];
}
// --- IZNOS FILTER (troškovi) ---
expenseMinIznos: number = 0;
expenseMaxIznos: number = 0;
expenseIznosRange: [number, number] = [0, 0];
expenseFilterDobavljac: string = '';

get uniqueDobavljaci() {
  return [...new Set(this.overview.troskovi.map(e => e.dobavljacNaziv).filter(Boolean))];
}

get expenseIznosMin(): number {
  return Math.min(...this.overview.troskovi.map(e => Number(e.iznos || 0)));
}

get expenseIznosMax(): number {
  return Math.max(...this.overview.troskovi.map(e => Number(e.iznos || 0)));
}

// --- IZNOS FILTER (budžeti) ---
budgetMinIznos: number = 0;
budgetMaxIznos: number = 0;

get budgetIznosMin(): number {
  return Math.min(...this.overview.budzeti.map(b => Number(b.planiraniIznos || 0)));
}

get budgetIznosMax(): number {
  return Math.max(...this.overview.budzeti.map(b => Number(b.planiraniIznos || 0)));
}

// --- BUDGET FILTER/SORT ---
budgetSearch: string = '';
budgetSortColumn: string = '';
budgetSortDirection: 'asc' | 'desc' = 'asc';
budgetFilterOdjel: string = '';
budgetFilterStatus: string = '';
budgetFilterKategorija: string = '';
budgetFilterPeriodOd: string = '';
budgetFilterPeriodDo: string = '';

get uniqueBudgetOdjeli() {
  return [...new Set(this.overview.budzeti.map(b => b.odjelNaziv).filter(Boolean))];
}

get uniqueBudgetStatusi() {
  return [...new Set(this.overview.budzeti.map(b => b.statusOdobrenja).filter(Boolean))];
}

get uniqueBudgetKategorije() {
  return [...new Set(this.overview.budzeti.flatMap(b => b.kategorije?.map((k: any) => k.naziv) || []).filter(Boolean))];
}

get filteredBudgets() {
  let list = [...this.overview.budzeti];

  if (this.budgetSearch.trim()) {
    const q = this.budgetSearch.toLowerCase();
    list = list.filter(b =>
      b.naziv?.toLowerCase().includes(q) ||
      b.odjelNaziv?.toLowerCase().includes(q) ||
      b.statusOdobrenja?.toLowerCase().includes(q) ||
      b.projekatNaziv?.toLowerCase().includes(q)
    );
  }

  if (this.budgetFilterOdjel) {
    list = list.filter(b => b.odjelNaziv === this.budgetFilterOdjel);
  }

  if (this.budgetFilterStatus) {
    list = list.filter(b => b.statusOdobrenja === this.budgetFilterStatus);
  }

  if (this.budgetFilterKategorija) {
    list = list.filter(b => b.kategorije?.some((k: any) => k.naziv === this.budgetFilterKategorija));
  }

  if (this.budgetFilterPeriodOd) {
    list = list.filter(b => b.datumPocetka >= this.budgetFilterPeriodOd);
  }

  if (this.budgetFilterPeriodDo) {
    list = list.filter(b => b.datumZavrsetka <= this.budgetFilterPeriodDo);
  }

  if (this.budgetMinIznos > 0 || this.budgetMaxIznos > 0) {
    list = list.filter(b => {
      const iznos = Number(b.planiraniIznos || 0);
      const min = this.budgetMinIznos || this.budgetIznosMin;
      const max = this.budgetMaxIznos || this.budgetIznosMax;
      return iznos >= min && iznos <= max;
    });
  }

  if (this.budgetSortColumn) {
    list.sort((a, b) => {
      const valA = (a as any)[this.budgetSortColumn] ?? '';
      const valB = (b as any)[this.budgetSortColumn] ?? '';
      const cmp = valA < valB ? -1 : valA > valB ? 1 : 0;
      return this.budgetSortDirection === 'asc' ? cmp : -cmp;
    });
  }

  return list;
}

sortBudgets(column: string): void {
  if (this.budgetSortColumn === column) {
    this.budgetSortDirection = this.budgetSortDirection === 'asc' ? 'desc' : 'asc';
  } else {
    this.budgetSortColumn = column;
    this.budgetSortDirection = 'asc';
  }
}
}

