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
        this.errorMessage = 'Greška pri dohvatu troškova.';
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
          'Greška pri dohvatu podataka za formu. Provjeri da li postoji ruta /api/troskovi/reference-data.';
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
          error?.error?.message || 'Greška pri spremanju troška.';
        this.isSaving = false;
        this.cdr.detectChanges();
      },
    });
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
}
