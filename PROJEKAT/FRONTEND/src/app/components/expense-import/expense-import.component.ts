import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  IngestionService,
  ImportPreviewResult,
  ImportPreviewRow,
  ImportConfirmResult,
} from '../../../services/ingestion.service';

@Component({
  selector: 'app-expense-import',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './expense-import.component.html',
  styleUrl: './expense-import.component.css',
})
export class ExpenseImportComponent implements OnInit {
  private fb = inject(FormBuilder);
  private ingestionService = inject(IngestionService);
  private cdr = inject(ChangeDetectorRef);

  // Koraci: 1 = upload, 2 = validacija, 3 = pregled
  currentStep: number = 1;

  // Korak 1: Upload
  selectedFile: File | null = null;
  fileInput: HTMLInputElement | null = null;
  uploadErrorMessage = '';
  uploadSuccessMessage = '';
  isUploading = false;

  // Korak 2: Validacija
  previewData: ImportPreviewResult | null = null;
  selectedRows: Set<number> = new Set();
  isValidating = false;
  validationErrorMessage = '';
  isConfirming = false;

  // Korak 3: Pregled
  confirmResult: ImportConfirmResult | null = null;
  confirmErrorMessage = '';

  ngOnInit(): void {
    // Inicijalizacija
  }

  // ============ KORAK 1: UPLOAD ============
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (!files || files.length === 0) {
      this.uploadErrorMessage = 'Trebate odabrati fajl.';
      return;
    }

    const file = files[0];
    const fileName = file.name.toLowerCase();

    if (!fileName.endsWith('.csv') && !fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      this.uploadErrorMessage = 'Podržani formati su CSV, XLS i XLSX.';
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      this.uploadErrorMessage = 'Fajl ne može biti veći od 10 MB.';
      return;
    }

    this.selectedFile = file;
    this.uploadErrorMessage = '';
    this.uploadSuccessMessage = `Odabran fajl: ${file.name}`;
    this.cdr.detectChanges();
  }

  previewImport(): void {
    if (!this.selectedFile) {
      this.uploadErrorMessage = 'Trebate odabrati fajl.';
      return;
    }

    this.isUploading = true;
    this.uploadErrorMessage = '';

    this.ingestionService.previewImport(this.selectedFile).subscribe({
      next: (data) => {
        this.previewData = data;
        this.selectedRows.clear();

        // Automatski odaberi sve validne redove
        data.rows.forEach((row) => {
          if (row.isValid) {
            this.selectedRows.add(row.rowNumber);
          }
        });

        this.currentStep = 2;
        this.isUploading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.uploadErrorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Greška pri učitavanju fajla. Provjerite format i pokušajte ponovo.';
        this.isUploading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ============ KORAK 2: VALIDACIJA ============
  toggleRowSelection(rowNumber: number): void {
    if (this.selectedRows.has(rowNumber)) {
      this.selectedRows.delete(rowNumber);
    } else {
      this.selectedRows.add(rowNumber);
    }
    this.cdr.detectChanges();
  }

  selectAllValid(): void {
    if (!this.previewData) return;

    this.previewData.rows.forEach((row) => {
      if (row.isValid) {
        this.selectedRows.add(row.rowNumber);
      }
    });
    this.cdr.detectChanges();
  }

  deselectAll(): void {
    this.selectedRows.clear();
    this.cdr.detectChanges();
  }

  confirmImport(): void {
    if (this.selectedRows.size === 0) {
      this.validationErrorMessage = 'Trebate odabrati barem jedan red za import.';
      return;
    }

    const rowsToImport = this.previewData?.rows
      .filter((row) => this.selectedRows.has(row.rowNumber))
      .map((row) => ({
        rowNumber: row.rowNumber,
        expense: row.expense,
      })) || [];

    if (rowsToImport.length === 0) {
      this.validationErrorMessage = 'Nema redova za import.';
      return;
    }

    this.isConfirming = true;
    this.validationErrorMessage = '';

    const payload = {
      fileName: this.previewData?.fileName || undefined,
      rows: rowsToImport,
    };

    this.ingestionService.confirmImport(payload).subscribe({
      next: (data) => {
        this.confirmResult = data;
        this.currentStep = 3;
        this.isConfirming = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.validationErrorMessage =
          error?.error?.message ||
          error?.error?.error ||
          'Greška pri potvrdi importa.';
        this.isConfirming = false;
        this.cdr.detectChanges();
      },
    });
  }

  // ============ KORAK 3: PREGLED ============
  goBackToUpload(): void {
    this.currentStep = 1;
    this.selectedFile = null;
    this.previewData = null;
    this.selectedRows.clear();
    this.confirmResult = null;
    this.uploadErrorMessage = '';
    this.uploadSuccessMessage = '';
    this.validationErrorMessage = '';
    this.confirmErrorMessage = '';
    this.cdr.detectChanges();
  }

  // ============ POMOĆNE METODE ============
  getRowStatusClass(row: ImportPreviewRow): string {
    if (row.isValid) {
      return 'status-valid';
    }
    return 'status-invalid';
  }

  getRowStatusText(row: ImportPreviewRow): string {
    if (row.isValid) {
      return 'Validna';
    }
    return 'Nevalidna';
  }

  getErrorMessages(row: ImportPreviewRow): string[] {
    return row.errors.map((e) => e.message);
  }

  getWarningMessages(row: ImportPreviewRow): string[] {
    return row.warnings.map((w) => w.message);
  }

  isRowSelected(rowNumber: number): boolean {
    return this.selectedRows.has(rowNumber);
  }

  // Gramatički ispravna forma za broj redova
  getRowCountLabel(count: number): string {
    if (count === 1) {
      return '1 reda';
    } else if (count >= 2 && count <= 4) {
      return `${count} reda`;
    } else {
      return `${count} redova`;
    }
  }
}
