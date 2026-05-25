import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import {
  ExpenseReport,
  ReportBreakdownItem,
  ReportExportFormat,
  ReportFilters,
  ReportType,
} from '../../../models/entities';
import { ReportService } from '../../../services/report.service';
import { AiAnalysisService, DatabaseAnalysisResult } from '../../../services/ai-analysis.service';


@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrl: './reports.css',
})
export class ReportsComponent implements OnInit {
  private readonly reportService = inject(ReportService);
  private readonly aiAnalysisService = inject(AiAnalysisService);
  private readonly cdr = inject(ChangeDetectorRef);

  public report: ExpenseReport | null = null;
  public dateFrom = '';
  public dateTo = '';
  public reportType: ReportType = 'sazeti';
  public isLoading = false;
  public isExporting = false;
  public errorMessage = '';
  public successMessage = '';

  // AI analiza
  public aiAnalysis: DatabaseAnalysisResult | null = null;
  public isAiLoading = false;
  public aiError = '';
  public showAiPanel = false;


  public ngOnInit(): void {
    this.loadReport();
  }

  public get periodIsInvalid(): boolean {
    const normalizedFrom = this.normalizeDisplayDate(this.dateFrom);
    const normalizedTo = this.normalizeDisplayDate(this.dateTo);

    return !!normalizedFrom && !!normalizedTo && normalizedFrom > normalizedTo;
  }

  public get periodLabel(): string {
    if (!this.report) {
      return '-';
    }

    const from = this.report.period.datumOd ? this.formatDate(this.report.period.datumOd) : 'Početak';
    const to = this.report.period.datumDo ? this.formatDate(this.report.period.datumDo) : 'Danas';

    return `${from} - ${to}`;
  }

  public get hasExpenses(): boolean {
    return (this.report?.expenses.length || 0) > 0;
  }

  public get isDetailedReport(): boolean {
    return this.reportType === 'detaljni';
  }

  public get selectedReportTypeLabel(): string {
    return this.reportType === 'detaljni' ? 'Detaljni' : 'Sažeti';
  }

  public get utilizationLabel(): string {
    const utilization = this.report?.summary.budgetUtilizationPercent;
    return utilization === null || utilization === undefined ? '-' : `${this.formatAmount(utilization)}%`;
  }

  public get visibleExpenses() {
    return this.report?.expenses.slice(0, 25) || [];
  }

  public get sortedMonthlyTrend(): ReportBreakdownItem[] {
    return [...(this.report?.breakdowns.byMonth || [])].sort(
      (first, second) => this.getMonthSortValue(first.label) - this.getMonthSortValue(second.label)
    );
  }

  public loadReport(): void {
    if (!this.periodDatesAreValid()) {
      this.errorMessage = 'Datumi moraju biti u formatu DD.MM.YYYY.';
      return;
    }

    if (this.periodIsInvalid) {
      this.errorMessage = 'Datum od ne može biti poslije datuma do.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reportService.getExpenseReport(this.buildFilters()).subscribe({
      next: (report) => {
        this.report = report;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = this.getErrorMessage(error, 'Greška pri generisanju izvještaja.');
        this.report = null;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public resetPeriod(): void {
    this.dateFrom = '';
    this.dateTo = '';
    this.loadReport();
  }

  public onPeriodDatePickerChange(field: 'from' | 'to', event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    if (!value) {
      return;
    }

    if (field === 'from') {
      this.dateFrom = this.toDisplayDate(value);
      return;
    }

    this.dateTo = this.toDisplayDate(value);
  }

  public toNativeDate(value: string): string {
    return this.normalizeDisplayDate(value) || '';
  }

  public selectReportType(reportType: ReportType): void {
    if (this.reportType === reportType) {
      return;
    }

    this.reportType = reportType;
    this.loadReport();
  }

  public exportReport(format: ReportExportFormat): void {
    if (!this.periodDatesAreValid()) {
      this.errorMessage = 'Datumi moraju biti u formatu DD.MM.YYYY.';
      return;
    }

    if (this.periodIsInvalid || this.isExporting) {
      this.errorMessage = this.periodIsInvalid ? 'Datum od ne može biti poslije datuma do.' : '';
      return;
    }

    this.isExporting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.reportService.exportExpenseReport(format, this.buildFilters()).subscribe({
      next: (blob) => {
        this.downloadBlob(blob, this.getExportFilename(format));
        this.successMessage = 'Izvještaj je spreman za preuzimanje.';
        this.isExporting = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error(error);
        this.errorMessage = this.getErrorMessage(error, 'Greška tokom izvoza izvještaja.');
        this.isExporting = false;
        this.cdr.detectChanges();
      },
    });
  }

  public formatAmount(value: unknown): string {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return '-';
    }

    return numberValue.toLocaleString('bs-BA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  public formatDate(value: unknown): string {
    if (!value) {
      return '-';
    }

    const dateParts = String(value).match(/^([+-]?\d{4,6})-(\d{2})-(\d{2})/);
    if (dateParts) {
      const year = dateParts[1].replace(/^\+/, '').replace(/^0+(?=\d{5,}$)/, '');
      return `${dateParts[3]}.${dateParts[2]}.${year}`;
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    return `${day}.${month}.${year}`;
  }

  public trackBreakdown(_index: number, item: ReportBreakdownItem): string {
    return item.label;
  }

  private buildFilters(): ReportFilters {
    return {
      ...(this.dateFrom.trim() ? { datumOd: this.normalizeDateForApi(this.dateFrom) } : {}),
      ...(this.dateTo.trim() ? { datumDo: this.normalizeDateForApi(this.dateTo) } : {}),
      tipIzvjestaja: this.reportType,
    };
  }

  private periodDatesAreValid(): boolean {
    return (!this.dateFrom || !!this.normalizeDisplayDate(this.dateFrom)) &&
      (!this.dateTo || !!this.normalizeDisplayDate(this.dateTo));
  }

  private normalizeDisplayDate(value: string): string | null {
    if (!value.trim()) {
      return null;
    }

    const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})\.?$/);
    if (!match) {
      return null;
    }

    const [, dayValue, monthValue, yearValue] = match;
    const day = Number(dayValue);
    const month = Number(monthValue);
    const year = Number(yearValue);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return `${yearValue}-${monthValue}-${dayValue}`;
  }

  private toDisplayDate(value: string): string {
    const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) {
      return value;
    }

    const [, year, month, day] = match;
    return `${day}.${month}.${year}`;
  }

  private getExportFilename(format: ReportExportFormat): string {
    const today = this.toDisplayDate(new Date().toISOString().slice(0, 10));
    return `izvjestaj-troskovi-${today}.${format}`;
  }

  private normalizeDateForApi(value: string): string {
    const match = value.trim().match(/^(\d{2})\.(\d{2})\.(\d{4})\.?$/);
    if (!match) {
      return value;
    }

    const [, day, month, year] = match;
    return `${day}.${month}.${year}`;
  }

  private downloadBlob(blob: Blob, filename: string): void {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  private getErrorMessage(error: any, fallback: string): string {
    const message = error?.error?.message || error?.error?.error || error?.message || fallback;

    if (error?.status === 401 || String(message).toLowerCase().includes('token')) {
      return 'Sesija je istekla. Odjavi se i prijavi ponovo, pa generiši izvještaj.';
    }

    return message;
  }

  public runAiAnalysis(): void {
    this.isAiLoading = true;
    this.aiError = '';
    this.aiAnalysis = null;
    this.showAiPanel = true;

    this.aiAnalysisService.runDatabaseAnalysis().subscribe({
      next: (result) => {
        this.aiAnalysis = result;
        this.isAiLoading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        this.aiError = this.getErrorMessage(error, 'Greška pri pokretanju AI analize.');
        this.isAiLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  public closeAiPanel(): void {
    this.showAiPanel = false;
    this.aiAnalysis = null;
    this.aiError = '';
  }

  public get aiTrendLabel(): string {
    switch (this.aiAnalysis?.trenKretanja) {
      case 'RAST': return '↑ Rast';
      case 'PAD': return '↓ Pad';
      default: return '→ Stabilan';
    }
  }

  public get aiTrendClass(): string {
    switch (this.aiAnalysis?.trenKretanja) {
      case 'RAST': return 'trend-rast';
      case 'PAD': return 'trend-pad';
      default: return 'trend-stabilan';
    }
  }

  public pouzdanostLabel(p: string): string {
    switch (p) {
      case 'VISOKA': return '● Visoka';
      case 'SREDNJA': return '◐ Srednja';
      default: return '○ Niska';
    }
  }


  private getMonthSortValue(label: string): number {
    const monthOrder: Record<string, number> = {
      januar: 1,
      februar: 2,
      mart: 3,
      april: 4,
      maj: 5,
      juni: 6,
      juli: 7,
      august: 8,
      septembar: 9,
      oktobar: 10,
      novembar: 11,
      decembar: 12,
    };
    const match = label.trim().toLowerCase().match(/^([a-zčćžšđ]+)\s+(\d+)$/);

    if (!match) {
      return Number.MAX_SAFE_INTEGER;
    }

    const month = monthOrder[match[1]] || 99;
    const year = Number(match[2]);

    if (!Number.isFinite(year)) {
      return Number.MAX_SAFE_INTEGER;
    }

    return year * 100 + month;
  }
}
