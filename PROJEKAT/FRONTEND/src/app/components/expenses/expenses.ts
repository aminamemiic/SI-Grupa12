import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
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
import { ExpenseService } from '../../../services/expense.service';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expenses.html',
  styleUrl: './expenses.css',
})
export class ExpensesComponent implements OnInit {
  private fb = inject(FormBuilder);
  private expenseService = inject(ExpenseService);
  private cdr = inject(ChangeDetectorRef);

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
  successMessage = '';
  errorMessage = '';
  editingExpenseId: string | null = null;
  showDeleteModal = false;
  expenseToDeleteId: string | null = null;

  expenseForm = this.fb.group({
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

  ngOnInit(): void {
    this.loadReferenceData();
    this.loadExpenses();
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
        this.errorMessage = 'Greska pri dohvatu troskova. Provjerite prijavu i konekciju prema backendu.';
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
          'Greska pri dohvatu podataka za formu. Provjerite prijavu i konekciju prema backendu.';
        this.cdr.detectChanges();
      },
    });
  }

  saveExpense(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.expenseForm.invalid) {
      this.expenseForm.markAllAsTouched();
      this.errorMessage = 'Popunite sva obavezna polja.';
      return;
    }

    const formValue = this.expenseForm.value;

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

    this.isSaving = true;

    if (this.editingExpenseId) {
      this.expenseService.updateExpense(this.editingExpenseId, payload).subscribe({
        next: (updatedExpense) => {
          this.expenses = this.expenses.map((e) =>
            e.id === updatedExpense.id ? updatedExpense : e
          );
          this.cancelEdit();
          this.successMessage = 'Trosak je uspjesno azuriran.';
          this.isSaving = false;
          this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
            this.getErrorMessage(error, 'Greska pri azuriranju troska.');
        this.isSaving = false;
        this.cdr.detectChanges();
      },
      });
    } else {
      this.expenseService.createExpense(payload).subscribe({
        next: (createdExpense) => {
          this.expenses = [createdExpense, ...this.expenses];
          this.expenseForm.reset();
          this.successMessage = 'Trosak je uspjesno spremljen.';
          this.isSaving = false;
          this.cdr.detectChanges();
        },
        error: (error) => {
          console.error(error);
          this.errorMessage =
            this.getErrorMessage(error, 'Greska pri spremanju troska.');
          this.isSaving = false;
          this.cdr.detectChanges();
        },
      });
    }
  }

  editExpense(expense: Expense): void {
    this.editingExpenseId = expense.id.toString();
    this.successMessage = '';
    this.errorMessage = '';

    this.expenseForm.patchValue({
      naziv: expense.naziv,
      iznos: expense.iznos,
      datum: expense.datum.split('T')[0], 
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
        this.successMessage = 'Trosak je uspjesno obrisan.';
        this.closeDeleteModal();
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage =
          this.getErrorMessage(error, 'Greska pri brisanju troska.');
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
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.expenseForm.get(fieldName);
    return !!field && field.invalid && (field.dirty || field.touched);
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
}
