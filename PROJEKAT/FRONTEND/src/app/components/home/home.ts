import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthGuardService } from '../../../middleware/middleware.authguard';
import { CreateExpenseRequest, Expense, ExpenseReferenceData } from '../../../models/entities';
import {
  AiAnalysisService,
  CostSuggestionsResponse,
  ExecutiveSummaryResponse,
  MissingRecurringExpensesResponse,
  SupplierRiskResponse,
  TopGrowingSupplier,
} from '../../../services/ai-analysis.service';
import { ExpenseService } from '../../../services/expense.service';

type ExpenseBreakdown = {
  label: string;
  total: number;
  count: number;
  percentage: number;
};

@Component({
  selector: 'app-home',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthGuardService);
  private readonly expenseService = inject(ExpenseService);
  private readonly aiAnalysisService = inject(AiAnalysisService);
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly expenseRoles = ['admin', 'administrativni_radnik', 'administrativni_zaposlenik'];
  public readonly budgetRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
  public readonly dataOverviewRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
  public readonly reportRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
  public readonly adminConsoleUrl = 'https://keycloak-production-4c61.up.railway.app/';

  public accessNotice = '';
  public expenses: Expense[] = [];
  public referenceData: ExpenseReferenceData = {
    kategorije: [],
    odjeli: [],
    valute: [],
    projekti: [],
    dobavljaci: [],
  };
  public isLoadingExpenses = false;
  public isSavingExpense = false;
  public dashboardMessage = '';
  public dashboardError = '';
  public editingExpense: Expense | null = null;
  public expenseToDelete: Expense | null = null;
  public assistantQuestion = '';
  public assistantAnswer = '';
  public assistantSource: 'gemini' | 'fallback' | '' = '';
  public isAssistantLoading = false;
  public assistantError = '';
  public suggestedQuestions = [
    'Koji trošak je najveći?',
    'Kojih je 5 najvećih troškova?',
    'Koja kategorija najviše troši?',
    'Kome smo najviše platili?',
    'Koliko je ostalo budžeta?',
    'Koja je najveća anomalija?',
    'Da li troškovi rastu ili padaju?',
    'Koji dobavljač ima najveći rast?',
  ];
  public showAllSuggestedQuestions = false;
  public topGrowingSuppliers: TopGrowingSupplier[] = [];
  public isLoadingSuppliers = false;
  public suppliersError = '';
  public executiveSummary: ExecutiveSummaryResponse['summary'] = [];
  public isLoadingExecutiveSummary = false;
  public executiveSummaryError = '';
  public costSuggestions: CostSuggestionsResponse['suggestions'] = [];
  public isLoadingCostSuggestions = false;
  public costSuggestionsError = '';
  public missingRecurringExpenses: MissingRecurringExpensesResponse['missingRecurringExpenses'] = [];
  public isLoadingMissingRecurring = false;
  public missingRecurringError = '';
  public supplierRisks: SupplierRiskResponse['risks'] = [];
  public isLoadingSupplierRisks = false;
  public supplierRisksError = '';
  public anomalyExplanationById: Record<string, string> = {};
  public anomalyExplanationSeverityById: Record<string, string> = {};
  public loadingAnomalyExplanationId: string | number | null = null;

  public editForm = this.fb.group({
    naziv: ['', [Validators.required, Validators.maxLength(200)]],
    iznos: [null as number | null, [Validators.required, Validators.min(0.01)]],
    datum: ['', [Validators.required, Validators.pattern(/^\d{2}\.\d{2}\.\d{4}\.?$/)]],
    opis: [''],
    kategorijaId: ['', Validators.required],
    odjelId: ['', Validators.required],
    valutaId: ['', Validators.required],
    projekatId: [''],
    dobavljacId: [''],
  });

  public ngOnInit(): void {
    this.authService.authState$.subscribe((isAuthenticated) => {
      if (isAuthenticated) {
        this.loadDashboardExpenses();
        if (this.canOpenAiAnalysis) {
          this.loadTopGrowingSuppliers();
          this.loadExecutiveSummary();
          this.loadCostSuggestions();
          this.loadMissingRecurringExpenses();
          this.loadSupplierRisks();
        }
        return;
      }

      this.expenses = [];
      this.topGrowingSuppliers = [];
      this.executiveSummary = [];
      this.costSuggestions = [];
      this.missingRecurringExpenses = [];
      this.supplierRisks = [];
      this.isLoadingExpenses = false;
      this.cdr.detectChanges();
    });

    this.loadReferenceData();

    if (this.route.snapshot.queryParamMap.get('accessDenied') === 'troskovi') {
      this.accessNotice = 'Pristup formi za unos troškova je dozvoljen samo ulogama admin i administrativni_radnik.';
    }

    if (this.route.snapshot.queryParamMap.get('accessDenied') === 'pregled-podataka') {
      this.accessNotice = 'Pristup pregledu podataka je dozvoljen samo ulogama admin, glavni_racunovodja i finansijski_direktor.';
    }

    if (this.route.snapshot.queryParamMap.get('accessDenied') === 'izvjestaji') {
      this.accessNotice = 'Pristup izvještajima je dozvoljen samo ulogama admin, glavni_racunovodja i finansijski_direktor.';
    }
  }

  public get canOpenExpenses(): boolean {
    return this.authService.hasAnyRole(this.expenseRoles);
  }
  public get canOpenBudgets(): boolean {
  return this.authService.hasAnyRole(this.budgetRoles);
}

  public get canOpenDataOverview(): boolean {
    return this.authService.hasAnyRole(this.dataOverviewRoles);
  }

  public get canOpenReports(): boolean {
    return this.authService.hasAnyRole(this.reportRoles);
  }

  public get canOpenAiAnalysis(): boolean {
    return this.authService.hasAnyRole(this.reportRoles);
  }

  public get isAdmin(): boolean {
    return this.authService.hasAnyRole(['admin']);
  }

  public get visibleSuggestedQuestions(): string[] {
    return this.showAllSuggestedQuestions ? this.suggestedQuestions : this.suggestedQuestions.slice(0, 4);
  }

  public get totalAmount(): number {
    return this.expenses.reduce((sum, expense) => sum + Number(expense.iznos || 0), 0);
  }

  public get totalExpenses(): number {
    return this.expenses.length;
  }

  public get averageAmount(): number {
    return this.totalExpenses ? this.totalAmount / this.totalExpenses : 0;
  }

  public get categoryBreakdown(): ExpenseBreakdown[] {
    return this.buildBreakdown('kategorija');
  }

  public get departmentBreakdown(): ExpenseBreakdown[] {
    return this.buildBreakdown('odjel');
  }

  public get topCategoryLabel(): string {
    return this.categoryBreakdown[0]?.label || '-';
  }

  public get topDepartmentLabel(): string {
    return this.departmentBreakdown[0]?.label || '-';
  }

  public loadDashboardExpenses(): void {
    this.isLoadingExpenses = true;
    this.dashboardError = '';

    this.expenseService.getExpenses().subscribe({
      next: (expenses) => {
        this.expenses = expenses;
        this.isLoadingExpenses = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.dashboardError = 'Greška pri dohvatu troškova.';
        this.isLoadingExpenses = false;
        this.cdr.detectChanges();
      },
    });
  }

  public loadReferenceData(): void {
    this.expenseService.getReferenceData().subscribe({
      next: (referenceData) => {
        this.referenceData = referenceData;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.dashboardError = 'Greška pri dohvatu podataka za uređivanje troškova.';
        this.cdr.detectChanges();
      },
    });
  }

  public askAssistant(): void {
    if (!this.canOpenAiAnalysis) {
      this.assistantError = 'AI analiza je dostupna samo ovlaštenim finansijskim ulogama.';
      return;
    }

    const question = this.assistantQuestion.trim();
    this.assistantError = '';
    this.assistantAnswer = '';
    this.assistantSource = '';

    if (!question) {
      this.assistantError = 'Unesite pitanje za AI asistenta.';
      return;
    }

    this.isAssistantLoading = true;
    this.aiAnalysisService.askAssistant(question).subscribe({
      next: (response) => {
        this.assistantAnswer = response.answer;
        this.assistantSource = response.source || '';
        this.isAssistantLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.assistantError = error?.error?.message || 'Greška pri komunikaciji sa AI asistentom.';
        this.isAssistantLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public askSuggestedQuestion(question: string): void {
    this.assistantQuestion = question;
    this.askAssistant();
  }

  public loadTopGrowingSuppliers(): void {
    this.isLoadingSuppliers = true;
    this.suppliersError = '';

    this.aiAnalysisService.getTopGrowingSuppliers().subscribe({
      next: (response) => {
        this.topGrowingSuppliers = response.suppliers || [];
        this.isLoadingSuppliers = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.suppliersError = 'Greška pri dohvatu dobavljača.';
        this.isLoadingSuppliers = false;
        this.cdr.detectChanges();
      },
    });
  }

  public loadExecutiveSummary(): void {
    this.isLoadingExecutiveSummary = true;
    this.executiveSummaryError = '';

    this.aiAnalysisService.getExecutiveSummary().subscribe({
      next: (response) => {
        this.executiveSummary = response.summary || [];
        this.isLoadingExecutiveSummary = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.executiveSummaryError = 'Greška pri dohvatu AI sažetka.';
        this.isLoadingExecutiveSummary = false;
        this.cdr.detectChanges();
      },
    });
  }

  public loadCostSuggestions(): void {
    this.isLoadingCostSuggestions = true;
    this.costSuggestionsError = '';

    this.aiAnalysisService.getCostSuggestions().subscribe({
      next: (response) => {
        this.costSuggestions = response.suggestions || [];
        this.isLoadingCostSuggestions = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.costSuggestionsError = 'Greška pri dohvatu AI preporuka.';
        this.isLoadingCostSuggestions = false;
        this.cdr.detectChanges();
      },
    });
  }

  public loadMissingRecurringExpenses(): void {
    this.isLoadingMissingRecurring = true;
    this.missingRecurringError = '';

    this.aiAnalysisService.getMissingRecurringExpenses().subscribe({
      next: (response) => {
        this.missingRecurringExpenses = response.missingRecurringExpenses || [];
        this.isLoadingMissingRecurring = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.missingRecurringError = 'Greška pri dohvatu zaboravljenih troškova.';
        this.isLoadingMissingRecurring = false;
        this.cdr.detectChanges();
      },
    });
  }

  public loadSupplierRisks(): void {
    this.isLoadingSupplierRisks = true;
    this.supplierRisksError = '';

    this.aiAnalysisService.getSupplierRisk().subscribe({
      next: (response) => {
        this.supplierRisks = response.risks || [];
        this.isLoadingSupplierRisks = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.supplierRisksError = 'Greška pri dohvatu rizika dobavljača.';
        this.isLoadingSupplierRisks = false;
        this.cdr.detectChanges();
      },
    });
  }

  public explainAnomaly(expense: Expense): void {
    this.loadingAnomalyExplanationId = expense.id;

    this.aiAnalysisService.explainAnomaly(expense.id).subscribe({
      next: (response) => {
        const key = expense.id.toString();
        this.anomalyExplanationById[key] = response.explanation;
        this.anomalyExplanationSeverityById[key] = response.severity;
        this.loadingAnomalyExplanationId = null;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.anomalyExplanationById[expense.id.toString()] = 'Greška pri dohvatu objašnjenja anomalije.';
        this.loadingAnomalyExplanationId = null;
        this.cdr.detectChanges();
      },
    });
  }

  public openEditExpense(expense: Expense): void {
    this.editingExpense = expense;
    this.dashboardMessage = '';
    this.dashboardError = '';

    this.editForm.patchValue({
      naziv: expense.naziv,
      iznos: Number(expense.iznos),
      datum: this.toDisplayDate(expense.datum),
      opis: expense.opis || '',
      kategorijaId: expense.kategorijaId?.toString() || '',
      odjelId: expense.odjelId?.toString() || '',
      valutaId: expense.valutaId?.toString() || '',
      projekatId: expense.projekatId?.toString() || '',
      dobavljacId: expense.dobavljacId?.toString() || '',
    });
  }

  public closeEditExpense(): void {
    this.editingExpense = null;
    this.editForm.reset();
  }

  public saveDashboardExpense(): void {
    if (!this.editingExpense) return;

    this.dashboardMessage = '';
    this.dashboardError = '';

    if (this.editForm.invalid) {
      this.editForm.markAllAsTouched();
      this.dashboardError = 'Popunite sva obavezna polja.';
      return;
    }

    const formValue = this.editForm.value;
    const payload: CreateExpenseRequest = {
      naziv: formValue.naziv!,
      iznos: Number(formValue.iznos),
      datum: this.toIsoDate(formValue.datum!),
      opis: formValue.opis || null,
      kategorijaId: formValue.kategorijaId!,
      odjelId: formValue.odjelId!,
      valutaId: formValue.valutaId!,
      projekatId: formValue.projekatId || null,
      dobavljacId: formValue.dobavljacId || null,
    };

    this.isSavingExpense = true;
    this.expenseService.updateExpense(this.editingExpense.id.toString(), payload).subscribe({
      next: (updatedExpense) => {
        this.expenses = this.expenses.map((expense) =>
          expense.id === updatedExpense.id ? updatedExpense : expense
        );
        this.dashboardMessage = 'Trošak je uspješno ažuriran.';
        this.isSavingExpense = false;
        this.closeEditExpense();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.dashboardError = error?.error?.message || 'Greška pri ažuriranju troška.';
        this.isSavingExpense = false;
        this.cdr.detectChanges();
      },
    });
  }

  public openDeleteExpense(expense: Expense): void {
    this.expenseToDelete = expense;
    this.dashboardMessage = '';
    this.dashboardError = '';
  }

  public closeDeleteExpense(): void {
    this.expenseToDelete = null;
  }

  public confirmDeleteExpense(): void {
    if (!this.expenseToDelete) return;

    const deleteId = this.expenseToDelete.id.toString();
    this.expenseService.deleteExpense(deleteId).subscribe({
      next: () => {
        this.expenses = this.expenses.filter((expense) => expense.id.toString() !== deleteId);
        this.dashboardMessage = 'Trošak je uspješno obrisan.';
        this.closeDeleteExpense();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.dashboardError = error?.error?.message || 'Greška pri brisanju troška.';
        this.closeDeleteExpense();
        this.cdr.detectChanges();
      },
    });
  }

  public isEditFieldInvalid(fieldName: string): boolean {
    const field = this.editForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  public getItemLabel(item: any): string {
    return (
      item.naziv ||
      item.naziv_projekta ||
      item.nazivProjekta ||
      item.naziv_firme ||
      item.nazivFirme ||
      item.kod ||
      item.id
    );
  }

  public idiNaTroskove(): void {
    if (!this.canOpenExpenses) {
      this.accessNotice = 'Pristup formi za unos troškova je dozvoljen samo ulogama admin i administrativni_radnik.';
      return;
    }

    void this.router.navigate(['/troskovi']);
  }

  public idiNaImportTroskova(): void {
    if (!this.canOpenExpenses) {
      this.accessNotice = 'Pristup importu troškova je dozvoljen samo ulogama admin i administrativni_radnik.';
      return;
    }

    void this.router.navigate(['/troskovi/import']);
  }
  public idiNaBudzetiranje(): void {
  if (!this.canOpenBudgets) {
    this.accessNotice = 'Pristup planiranju budžeta je dozvoljen samo ulogama admin, glavni_racunovodja i finansijski_direktor.';
    return;
  }

  void this.router.navigate(['/budzeti']);
}

  public idiNaPregledPodataka(): void {
    if (!this.canOpenDataOverview) {
      this.accessNotice = 'Pristup pregledu podataka je dozvoljen samo ulogama admin, glavni_racunovodja i finansijski_direktor.';
      return;
    }

    void this.router.navigate(['/podaci/pregled']);
  }

  public idiNaIzvjestaje(): void {
    if (!this.canOpenReports) {
      this.accessNotice = 'Pristup izvještajima je dozvoljen samo ulogama admin, glavni_racunovodja i finansijski_direktor.';
      return;
    }

    void this.router.navigate(['/izvjestaji']);
  }

  private buildBreakdown(fieldName: 'kategorija' | 'odjel'): ExpenseBreakdown[] {
    const totals = new Map<string, { total: number; count: number }>();

    this.expenses.forEach((expense) => {
      const label = String(expense[fieldName] || 'Neraspoređeno');
      const existing = totals.get(label) || { total: 0, count: 0 };
      existing.total += Number(expense.iznos || 0);
      existing.count += 1;
      totals.set(label, existing);
    });

    const maxTotal = Math.max(...Array.from(totals.values()).map((item) => item.total), 0);

    return Array.from(totals.entries())
      .map(([label, value]) => ({
        label,
        total: value.total,
        count: value.count,
        percentage: maxTotal > 0 ? Math.max((value.total / maxTotal) * 100, 6) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }

  private toIsoDate(value: string): string {
    const match = value.trim().match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/);

    if (!match) {
      return value;
    }

    const [, day, month, year] = match;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  private toDisplayDate(value: string): string {
    const isoDate = value.split('T')[0];
    const match = isoDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);

    if (!match) {
      return value;
    }

    const [, year, month, day] = match;
    return `${day}.${month}.${year}`;
  }
}
