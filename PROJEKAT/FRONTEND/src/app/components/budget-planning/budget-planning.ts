import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthGuardService } from '../../../middleware/middleware.authguard';
import { Budget, BudgetReferenceData, CreateBudgetRequest } from '../../../models/entities';
import { BudgetService } from '../../../services/budget.service';

@Component({
  selector: 'app-budget-planning',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './budget-planning.html',
  styleUrl: './budget-planning.css',
})
export class BudgetPlanningComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly budgetService = inject(BudgetService);
  private readonly authService = inject(AuthGuardService);
  private readonly cdr = inject(ChangeDetectorRef);

  public budgets: Budget[] = [];
  public selectedBudget: Budget | null = null;
  public selectedBudgetProjection: any = null;
  public isProjectionLoading = false;
  public projectionErrorMessage = '';
  public referenceData: BudgetReferenceData = { kategorije: [], odjeli: [], projekti: [] };
  public isLoading = false;
  public isSaving = false;
  public showForm = false;
  public editingBudgetId: string | null = null;
  public successMessage = '';
  public errorMessage = '';

  public budgetForm = this.fb.group({
    naziv: ['', [Validators.required, Validators.maxLength(200)]],
    planiraniIznos: [null as number | null, [Validators.required, Validators.min(0.01)]],
    datumPocetka: ['', [Validators.required, Validators.pattern(/^\d{1,2}\.\d{1,2}\.\d{4}\.?$/)]],
    datumZavrsetka: ['', [Validators.required, Validators.pattern(/^\d{1,2}\.\d{1,2}\.\d{4}\.?$/)]],
    odjelId: ['', Validators.required],
    projekatId: [''],
    kategorijaIds: [[] as string[], Validators.required],
  });

  public ngOnInit(): void {
    this.loadReferenceData();
    this.loadBudgets();
  }

  public get canEditBudgets(): boolean {
    return this.authService.hasAnyRole(['admin', 'glavni_racunovodja']);
  }

  public get canApproveBudgets(): boolean {
  return this.authService.hasAnyRole(['admin', 'finansijski_direktor']);
}

  public get hasUnsavedChanges(): boolean {
    return this.showForm && this.budgetForm.dirty;
  }

  @HostListener('window:beforeunload', ['$event'])
  public beforeUnload(event: BeforeUnloadEvent): void {
    if (this.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  public loadBudgets(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.budgetService.getBudgets().subscribe({
      next: (budgets) => {
        this.budgets = budgets;
        this.selectBudget(budgets[0] || null);
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = this.getErrorMessage(error, 'Greška pri dohvatu budžeta.');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public loadReferenceData(): void {
    this.budgetService.getReferenceData().subscribe({
      next: (data) => {
        this.referenceData = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = this.getErrorMessage(error, 'Greška pri dohvatu podataka za formu.');
        this.cdr.detectChanges();
      },
    });
  }

  public openCreateForm(): void {
    if (!this.canEditBudgets) return;
    if (!this.confirmDiscardChanges()) return;

    this.showForm = true;
    this.editingBudgetId = null;
    this.successMessage = '';
    this.errorMessage = '';
    this.budgetForm.reset({ kategorijaIds: [] });
    this.budgetForm.markAsPristine();
  }

  public editBudget(budget: Budget): void {
  if (!this.canEditBudgets) return;

  if (budget.statusOdobrenja === 'ODOBREN') {
    this.errorMessage = 'Odobren budžet se ne može uređivati.';
    return;
  }

  if (!this.confirmDiscardChanges()) return;

    this.showForm = true;
    this.editingBudgetId = budget.id.toString();
    this.successMessage = '';
    this.errorMessage = '';

    this.budgetForm.patchValue({
      naziv: budget.naziv,
      planiraniIznos: budget.planiraniIznos,
      datumPocetka: this.toDisplayDate(budget.datumPocetka),
      datumZavrsetka: this.toDisplayDate(budget.datumZavrsetka),
      odjelId: budget.odjelId?.toString() || '',
      projekatId: budget.projekatId?.toString() || '',
      kategorijaIds: (budget.kategorijaIds || []).map((id) => id.toString()),
    });

    this.budgetForm.markAsPristine();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  public saveBudget(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.budgetForm.invalid || this.hasInvalidPeriod() || !this.hasSelectedCategory()) {
      this.budgetForm.markAllAsTouched();
      if (this.hasInvalidPeriod()) {
        this.errorMessage = 'Datum završetka ne može biti prije datuma početka.';
      } else if (!this.hasSelectedCategory()) {
        this.errorMessage = 'Odaberite barem jednu kategoriju.';
      } else {
        this.errorMessage = 'Popunite sva obavezna polja.';
      }
      return;
    }

    const formValue = this.budgetForm.value;
    const payload: CreateBudgetRequest = {
      naziv: formValue.naziv!,
      planiraniIznos: Number(formValue.planiraniIznos),
      datumPocetka: this.toIsoDate(formValue.datumPocetka!),
      datumZavrsetka: this.toIsoDate(formValue.datumZavrsetka!),
      odjelId: formValue.odjelId!,
      projekatId: formValue.projekatId || null,
      kategorijaIds: formValue.kategorijaIds || [],
    };

    this.isSaving = true;
    const request = this.editingBudgetId
      ? this.budgetService.updateBudget(this.editingBudgetId, payload)
      : this.budgetService.createBudget(payload);

    request.subscribe({
      next: (savedBudget) => {
        if (this.editingBudgetId) {
          this.budgets = this.budgets.map((budget) => budget.id === savedBudget.id ? savedBudget : budget);
          this.successMessage = 'Budžet je uspješno ažuriran.';
        } else {
          this.budgets = [savedBudget, ...this.budgets];
          this.successMessage = 'Budžet je uspješno sačuvan.';
        }

        this.selectBudget(savedBudget);
        this.closeForm(false);
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = this.getErrorMessage(error, 'Greška pri spremanju budžeta.');
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
  }

  public closeForm(askConfirmation = true): void {
    if (askConfirmation && !this.confirmDiscardChanges()) return;

    this.showForm = false;
    this.editingBudgetId = null;
    this.budgetForm.reset({ kategorijaIds: [] });
    this.budgetForm.markAsPristine();
  }

  public selectBudget(budget: Budget | null): void {
    this.selectedBudget = budget;
    if (budget) {
      this.loadBudgetProjection(budget.id.toString());
    } else {
      this.selectedBudgetProjection = null;
    }
  }

  public loadBudgetProjection(budgetId: string): void {
    this.isProjectionLoading = true;
    this.projectionErrorMessage = '';
    this.selectedBudgetProjection = null;
    this.cdr.detectChanges();

    this.budgetService.getBudgetProjection(budgetId).subscribe({
      next: (projection) => {
        this.selectedBudgetProjection = projection;
        this.isProjectionLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Greška pri dohvatu projekcije:', error);
        this.projectionErrorMessage = 'Neuspješno učitavanje projekcije budžeta.';
        this.isProjectionLoading = false;
        this.cdr.detectChanges();
      }
    });
  }

  public approveBudget(budget: Budget): void {
  if (!this.canApproveBudgets) {
    this.errorMessage = 'Nemate pravo za odobravanje budžeta.';
    return;
  }

  this.updateBudgetStatus(budget, 'ODOBREN');
}

public rejectBudget(budget: Budget): void {
  if (!this.canApproveBudgets) {
    this.errorMessage = 'Nemate pravo za odbijanje budžeta.';
    return;
  }

  this.updateBudgetStatus(budget, 'ODBIJEN');
}

private updateBudgetStatus(budget: Budget, statusOdobrenja: 'ODOBREN' | 'ODBIJEN'): void {
  this.successMessage = '';
  this.errorMessage = '';

  this.budgetService.updateBudgetStatus(budget.id.toString(), statusOdobrenja).subscribe({
    next: (updatedBudget) => {
      this.budgets = this.budgets.map((item) =>
        item.id === updatedBudget.id ? updatedBudget : item
      );

      if (this.selectedBudget?.id === updatedBudget.id) {
        this.selectedBudget = updatedBudget;
      }

      this.successMessage =
        statusOdobrenja === 'ODOBREN'
          ? 'Budžet je uspješno odobren.'
          : 'Budžet je odbijen.';

      this.cdr.detectChanges();
    },
    error: (error) => {
      console.error(error);
      this.errorMessage = this.getErrorMessage(
        error,
        'Greška pri promjeni statusa budžeta.'
      );
      this.cdr.detectChanges();
    },
  });
}

  public onCategoryChange(event: Event, categoryId: string | number): void {
    const input = event.target as HTMLInputElement;
    const current = new Set((this.budgetForm.value.kategorijaIds || []).map((id) => id.toString()));

    if (input.checked) {
      current.add(categoryId.toString());
    } else {
      current.delete(categoryId.toString());
    }

    this.budgetForm.patchValue({ kategorijaIds: Array.from(current) });
    this.budgetForm.markAsDirty();
  }

  public isCategorySelected(categoryId: string | number): boolean {
    return (this.budgetForm.value.kategorijaIds || []).map((id) => id.toString()).includes(categoryId.toString());
  }

  public isFieldInvalid(fieldName: string): boolean {
    const field = this.budgetForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  public onDatePickerChange(event: Event, fieldName: 'datumPocetka' | 'datumZavrsetka'): void {
    const value = (event.target as HTMLInputElement).value;

    if (!value) {
      return;
    }

    this.budgetForm.patchValue({
      [fieldName]: this.toDisplayDate(value),
    });
  }

  public hasInvalidPeriod(): boolean {
    const start = this.budgetForm.value.datumPocetka;
    const end = this.budgetForm.value.datumZavrsetka;
    const startIso = start ? this.toIsoDate(start) : '';
    const endIso = end ? this.toIsoDate(end) : '';

    return Boolean(startIso && endIso && endIso < startIso);
  }

  public hasSelectedCategory(): boolean {
    return (this.budgetForm.value.kategorijaIds || []).length > 0;
  }

  public getItemLabel(item: any): string {
    return item.naziv || item.naziv_projekta || item.nazivProjekta || item.id;
  }

  private confirmDiscardChanges(): boolean {
    if (!this.hasUnsavedChanges) return true;
    return window.confirm('Imate nespremljene izmjene. Želite li nastaviti bez spremanja?');
  }

  private getErrorMessage(error: any, fallback: string): string {
    return error?.error?.message || error?.error?.error || fallback;
  }
  searchQuery: string = '';

get filteredBudgets() {
  if (!this.searchQuery.trim()) return this.budgets;

  const q = this.searchQuery.toLowerCase();
  return this.budgets.filter(b =>
    b.naziv?.toLowerCase().includes(q) ||
    b.odjel?.toLowerCase().includes(q) ||
    b.statusOdobrenja?.toLowerCase().includes(q)
  );
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
