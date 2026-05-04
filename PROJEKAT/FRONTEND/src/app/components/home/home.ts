import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthGuardService } from '../../../middleware/middleware.authguard';
import { CreateExpenseRequest, Expense, ExpenseReferenceData } from '../../../models/entities';
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
  private readonly fb = inject(FormBuilder);
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly expenseRoles = ['admin', 'administrativni_radnik', 'administrativni_zaposlenik'];
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

  public editForm = this.fb.group({
    naziv: ['', [Validators.required, Validators.maxLength(200)]],
    iznos: [null as number | null, [Validators.required, Validators.min(0.01)]],
    datum: ['', Validators.required],
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
        return;
      }

      this.expenses = [];
      this.isLoadingExpenses = false;
      this.cdr.detectChanges();
    });

    this.loadReferenceData();

    if (this.route.snapshot.queryParamMap.get('accessDenied') === 'troskovi') {
      this.accessNotice = 'Pristup formi za unos troskova je dozvoljen samo ulogama admin i administrativni_radnik.';
    }
  }

  public get canOpenExpenses(): boolean {
    return this.authService.hasAnyRole(this.expenseRoles);
  }

  public get isAdmin(): boolean {
    return this.authService.hasAnyRole(['admin']);
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
        this.dashboardError = 'Greska pri dohvatu troskova.';
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
        this.dashboardError = 'Greska pri dohvatu podataka za uredjivanje troskova.';
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
      datum: expense.datum.split('T')[0],
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
      datum: formValue.datum!,
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
        this.dashboardMessage = 'Trosak je uspjesno azuriran.';
        this.isSavingExpense = false;
        this.closeEditExpense();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.dashboardError = error?.error?.message || 'Greska pri azuriranju troska.';
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
        this.dashboardMessage = 'Trosak je uspjesno obrisan.';
        this.closeDeleteExpense();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.dashboardError = error?.error?.message || 'Greska pri brisanju troska.';
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
      this.accessNotice = 'Pristup formi za unos troskova je dozvoljen samo ulogama admin i administrativni_radnik.';
      return;
    }

    void this.router.navigate(['/troskovi']);
  }

  private buildBreakdown(fieldName: 'kategorija' | 'odjel'): ExpenseBreakdown[] {
    const totals = new Map<string, { total: number; count: number }>();

    this.expenses.forEach((expense) => {
      const label = String(expense[fieldName] || 'Nerasporedjeno');
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
}
