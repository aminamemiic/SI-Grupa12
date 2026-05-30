import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CreateExpenseRequest,
  Expense,
  ExpenseReferenceData,
} from '../../../models/entities';
import { ExpenseService, ValidationResult } from '../../../services/expense.service';
import { Subject, debounceTime, takeUntil } from 'rxjs';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class ExpensesComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private cdr = inject(ChangeDetectorRef);
  private destroy$ = new Subject<void>();

  expenses: Expense[] = [];

  referenceData: ExpenseReferenceData = {
    kategorije: [],
    odjeli: [],
    valute: [],
    projekti: [],
    dobavljaci: [],
  };

  isLoading = false;
  isSaving = false;
  isSuggestingCategory = false;
  isValidating = false;
  successMessage = '';
  errorMessage = '';
  categorySuggestionMessage = '';
  editingExpenseId: string | null = null;
  showDeleteModal = false;
  expenseToDeleteId: string | null = null;

  // Validation warnings and errors
  validationWarnings: Array<{ type: string; message: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }> = [];
  validationErrors: string[] = [];
  hasValidationWarnings = false;

  expenseForm = this.fb.group({
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

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadExpenses();
    this.setupFormValidation();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ─────────────────────────────────────────────────────────────
  // Real-time validation setup
  // ─────────────────────────────────────────────────────────────
  private setupFormValidation(): void {
    this.expenseForm.valueChanges
      .pipe(
        debounceTime(500),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.performRealtimeValidation();
      });
  }

  private performRealtimeValidation(): void {
    // Clear previous warnings if form is invalid
    if (this.expenseForm.invalid) {
      this.validationWarnings = [];
      this.validationErrors = [];
      this.hasValidationWarnings = false;
      return;
    }

    // Skip validation if we're editing and not all required fields are filled
    const formValue = this.expenseForm.value;
    if (!formValue.naziv || !formValue.iznos || !formValue.datum || !formValue.kategorijaId || !formValue.odjelId || !formValue.valutaId) {
      this.validationWarnings = [];
      this.validationErrors = [];
      this.hasValidationWarnings = false;
      return;
    }

    this.isValidating = true;

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

    this.expenseService.validateExpenseBeforeCreation(payload).subscribe({
      next: (result: ValidationResult) => {
        this.validationWarnings = result.warnings || [];
        this.validationErrors = result.validationErrors || [];
        this.hasValidationWarnings = this.validationWarnings.length > 0;
        this.isValidating = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Greška pri validaciji troška:', error);
        // Don't show errors for validation, just clear warnings
        this.validationWarnings = [];
        this.validationErrors = [];
        this.hasValidationWarnings = false;
        this.isValidating = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadExpenses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.expenseService.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = 'Greška pri dohvatu troškova. Provjerite prijavu i konekciju prema backendu.';
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  loadReferenceData(): void {
    this.expenseService.getReferenceData().subscribe({
      next: (data) => {
        this.referenceData = data;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          'Greška pri dohvatu podataka za formu. Provjerite prijavu i konekciju prema backendu.';
        this.cdr.detectChanges();
      },
    });
  }

  saveExpense(): void {
    this.successMessage = '';
    this.errorMessage = '';
    this.validationWarnings = [];
    this.validationErrors = [];
    this.hasValidationWarnings = false;

    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      this.errorMessage = 'Popunite sva obavezna polja.';
      return;
    }

    const formValue = this.expenseForm.value;

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

    this.isSaving = true;

    if (this.editingExpenseId) {
      this.expenseService.updateExpense(this.editingExpenseId, payload).subscribe({
        next: (updatedExpense) => {
          this.expenses = this.expenses.map((e) =>
            e.id === updatedExpense.id ? updatedExpense : e
          );
          this.cancelEdit();
          this.successMessage = 'Trošak je uspješno ažuriran.';
          this.isSaving = false;
          this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
            this.getErrorMessage(error, 'Greška pri ažuriranju troška.');
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      });
    } else {
      this.expenseService.createExpense(payload).subscribe({
        next: (createdExpense) => {
          this.expenses = [createdExpense, ...this.expenses];
          this.expenseForm.reset();
          this.successMessage = 'Trošak je uspješno spremljen.';
          this.isSaving = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage =
            this.getErrorMessage(error, 'Greška pri spremanju troška.');
          this.isSaving = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  suggestCategory(): void {
    const naziv = this.expenseForm.get('naziv')?.value?.trim() || '';

    this.successMessage = '';
    this.errorMessage = '';
    this.categorySuggestionMessage = '';

    if (!naziv) {
      this.expenseForm.get('naziv')?.markAsTouched();
      this.errorMessage = 'Unesite naziv troska prije AI prijedloga.';
      return;
    }

    const dobavljacId = this.expenseForm.get('dobavljacId')?.value || '';
    const dobavljac = this.referenceData.dobavljaci.find(
      (item) => String(item.id) === String(dobavljacId)
    );

    this.isSuggestingCategory = true;

    this.expenseService.suggestCategory({
      naziv,
      opis: this.expenseForm.get('opis')?.value || null,
      dobavljac: dobavljac ? this.getItemLabel(dobavljac) : null,
    }).subscribe({
      next: (suggestion) => {
        const category = this.referenceData.kategorije.find(
          (item) => String(item.id) === String(suggestion.categoryId)
        );

        if (category) {
          this.expenseForm.patchValue({ kategorijaId: String(category.id) });
          this.categorySuggestionMessage =
            `AI prijedlog: ${this.getItemLabel(category)} (${Math.round((suggestion.confidence || 0) * 100)}%).`;
        } else {
          this.errorMessage = suggestion.reason || 'AI nije pronasao prijedlog kategorije.';
        }

        this.isSuggestingCategory = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = this.getErrorMessage(error, 'Greska pri AI prijedlogu kategorije.');
        this.isSuggestingCategory = false;
        this.cdr.detectChanges();
      },
    });
  }

  editExpense(expense: Expense): void {
    this.editingExpenseId = expense.id.toString();
    this.successMessage = '';
    this.errorMessage = '';
    this.categorySuggestionMessage = '';

    this.expenseForm.patchValue({
      naziv: expense.naziv,
      iznos: expense.iznos,
      datum: this.toDisplayDate(expense.datum),
      opis: expense.opis,
      kategorijaId: expense.kategorijaId?.toString() || '',
      odjelId: expense.odjelId?.toString() || '',
      valutaId: expense.valutaId?.toString() || '',
      projekatId: expense.projekatId?.toString() || '',
      dobavljacId: expense.dobavljacId?.toString() || '',
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  openDeleteModal(id: string): void {
    this.expenseToDeleteId = id;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.expenseToDeleteId = null;
  }

  confirmDelete(): void {
    if (!this.expenseToDeleteId) return;

    this.expenseService.deleteExpense(this.expenseToDeleteId).subscribe({
      next: () => {
        this.expenses = this.expenses.filter((e) => e.id !== this.expenseToDeleteId);
        this.successMessage = 'Trošak je uspješno obrisan.';
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          this.getErrorMessage(error, 'Greška pri brisanju troška.');
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
    });
  }

  deleteExpense(id: string): void {
    this.openDeleteModal(id);
  }

  cancelEdit(): void {
    this.editingExpenseId = null;
    this.expenseForm.reset();
    this.successMessage = '';
    this.errorMessage = '';
    this.validationWarnings = [];
    this.validationErrors = [];
    this.hasValidationWarnings = false;
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
  }

  onDatePickerChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (!value) {
      return;
    }

    this.expenseForm.patchValue({
      datum: this.toDisplayDate(value),
    });
  }

  getItemLabel(item: any): string {
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

  private getErrorMessage(error: any, fallback: string): string {
    const backendMessage = error?.error?.message || error?.error?.error;

    if (backendMessage) {
      return backendMessage;
    }

    if (error?.status) {
      return `${fallback} Status: ${error.status}.`;
    }

    return fallback;
  }
  searchQuery: string = '';

get filteredExpenses() {
  if (!this.searchQuery.trim()) return this.expenses;

  const q = this.searchQuery.toLowerCase();
  return this.expenses.filter(e =>
    e.naziv?.toLowerCase().includes(q) ||
    e.kategorija?.toLowerCase().includes(q) ||
    e.odjel?.toLowerCase().includes(q) ||
    e.valuta?.toLowerCase().includes(q)
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
