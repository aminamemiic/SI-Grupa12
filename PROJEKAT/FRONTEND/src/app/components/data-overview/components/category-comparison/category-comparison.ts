import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataOverviewExpense } from '../../../../../models/entities';

type CategoryComparisonRow = {
  groupName: string;
  expenseCount: number;
  totalAmountBam: number;
  averageAmountBam: number;
  highestAmountBam: number;
  lowestAmountBam: number;
  percentage: number;
};

type GroupComparisonMode = 'category' | 'department' | 'categoryDepartment' | 'period';

@Component({
  selector: 'app-category-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-comparison.html',
  styleUrl: './category-comparison.css',
})
export class CategoryComparisonComponent {
  @Input() public expenses: DataOverviewExpense[] = [];
  @Input() public comparisonMode: GroupComparisonMode = 'category';
  @Input() public selectedCategories: Set<string> = new Set();
  @Input() public selectedDepartments: Set<string> = new Set();
  @Input() public dateFrom = '';
  @Input() public dateTo = '';
  @Output() public closePanel = new EventEmitter<void>();
  @Output() public comparisonModeChange = new EventEmitter<GroupComparisonMode>();
  @Output() public selectedCategoriesChange = new EventEmitter<Set<string>>();
  @Output() public selectedDepartmentsChange = new EventEmitter<Set<string>>();
  @Output() public dateFromChange = new EventEmitter<string>();
  @Output() public dateToChange = new EventEmitter<string>();

  private readonly exchangeRatesToBam: Record<string, number> = {
    BAM: 1,
    KM: 1,
    EUR: 1.95583,
    USD: 1.8,
    GBP: 2.3,
  };

  public get canCompare(): boolean {
    return this.expenses.length > 0;
  }

  public get categoryOptions(): string[] {
    return [...new Set(this.expenses.map((expense) => this.getExpenseCategoryName(expense)))].sort();
  }

  public get departmentOptions(): string[] {
    return [...new Set(this.expenses.map((expense) => this.getExpenseDepartmentName(expense)))].sort();
  }

  public get groupColumnLabel(): string {
    const labels: Record<GroupComparisonMode, string> = {
      category: 'Kategorija',
      department: 'Odjel',
      categoryDepartment: 'Kategorija i odjel',
      period: 'Period',
    };

    return labels[this.comparisonMode];
  }

  public get selectedGroupCountLabel(): string {
    if (this.comparisonMode === 'category') {
      return `${this.selectedCategories.size} kategorija odabrano`;
    }

    if (this.comparisonMode === 'department') {
      return `${this.selectedDepartments.size} odjela odabrano`;
    }

    if (this.comparisonMode === 'categoryDepartment') {
      return `${this.selectedCategories.size} kategorija, ${this.selectedDepartments.size} odjela`;
    }

    return 'Poređenje po periodu';
  }

  public get emptySelectionMessage(): string {
    return 'Nema troškova za prikaz poređenja.';
  }

  public get comparisonExpenses(): DataOverviewExpense[] {
    return this.expenses.filter((expense) => {
      const categoryName = this.getExpenseCategoryName(expense);
      const departmentName = this.getExpenseDepartmentName(expense);

      if (this.comparisonMode === 'category' && !this.categoryMatches(categoryName)) {
        return false;
      }

      if (this.comparisonMode === 'department' && !this.departmentMatches(departmentName)) {
        return false;
      }

      if (
        this.comparisonMode === 'categoryDepartment' &&
        (!this.categoryMatches(categoryName) || !this.departmentMatches(departmentName))
      ) {
        return false;
      }

      if (this.dateFrom && expense.datum < this.dateFrom) {
        return false;
      }

      if (this.dateTo && expense.datum > this.dateTo) {
        return false;
      }

      return true;
    });
  }

  public get rows(): CategoryComparisonRow[] {
    const grouped = new Map<string, DataOverviewExpense[]>();

    this.comparisonExpenses.forEach((expense) => {
      const groupName = this.getGroupName(expense);
      const current = grouped.get(groupName) || [];
      current.push(expense);
      grouped.set(groupName, current);
    });

    return Array.from(grouped.entries())
      .map(([groupName, expenses]) => {
        const amounts = expenses.map((expense) => this.getExpenseAmountInBam(expense));
        const totalAmountBam = amounts.reduce((sum, amount) => sum + amount, 0);

        return {
          groupName,
          expenseCount: expenses.length,
          totalAmountBam,
          averageAmountBam: totalAmountBam / expenses.length,
          highestAmountBam: Math.max(...amounts),
          lowestAmountBam: Math.min(...amounts),
          percentage: this.totalAmount > 0 ? (totalAmountBam / this.totalAmount) * 100 : 0,
        };
      })
      .sort((first, second) => second.totalAmountBam - first.totalAmountBam);
  }

  public get totalAmount(): number {
    return this.comparisonExpenses.reduce((sum, expense) => sum + this.getExpenseAmountInBam(expense), 0);
  }

  public get expenseCount(): number {
    return this.comparisonExpenses.length;
  }

  public get averageAmount(): number | null {
    if (!this.expenseCount) {
      return null;
    }

    return this.totalAmount / this.expenseCount;
  }

  public get highestCategoryAmount(): number | null {
    return this.rows[0]?.totalAmountBam ?? null;
  }

  public get lowestCategoryAmount(): number | null {
    return this.rows[this.rows.length - 1]?.totalAmountBam ?? null;
  }

  public get highestCategoryName(): string {
    return this.rows[0]?.groupName || '-';
  }

  public get lowestCategoryName(): string {
    return this.rows[this.rows.length - 1]?.groupName || '-';
  }

  public setComparisonMode(mode: GroupComparisonMode): void {
    this.comparisonModeChange.emit(mode);
  }

  public toggleCategory(categoryName: string): void {
    const nextSelection = new Set(this.selectedCategories);

    if (nextSelection.has(categoryName)) {
      nextSelection.delete(categoryName);
    } else {
      nextSelection.add(categoryName);
    }

    this.selectedCategoriesChange.emit(nextSelection);
  }

  public toggleDepartment(departmentName: string): void {
    const nextSelection = new Set(this.selectedDepartments);

    if (nextSelection.has(departmentName)) {
      nextSelection.delete(departmentName);
    } else {
      nextSelection.add(departmentName);
    }

    this.selectedDepartmentsChange.emit(nextSelection);
  }

  public isCategorySelected(categoryName: string): boolean {
    return this.selectedCategories.has(categoryName);
  }

  public isDepartmentSelected(departmentName: string): boolean {
    return this.selectedDepartments.has(departmentName);
  }

  public clearComparison(): void {
    this.selectedCategoriesChange.emit(new Set());
    this.selectedDepartmentsChange.emit(new Set());
    this.dateFromChange.emit('');
    this.dateToChange.emit('');
    this.comparisonModeChange.emit('category');
  }

  public onDisplayDateChange(value: string, fieldName: 'from' | 'to'): void {
    const isoDate = this.toIsoDate(value);
    if (fieldName === 'from') {
      this.dateFromChange.emit(isoDate);
      return;
    }

    this.dateToChange.emit(isoDate);
  }

  public toDisplayDate(value: string): string {
    const match = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}.${match[2]}.${match[1]}` : value;
  }

  public isHighestRow(row: CategoryComparisonRow): boolean {
    return this.highestCategoryAmount !== null && row.totalAmountBam === this.highestCategoryAmount;
  }

  public isLowestRow(row: CategoryComparisonRow): boolean {
    return this.lowestCategoryAmount !== null && row.totalAmountBam === this.lowestCategoryAmount;
  }

  public getBarWidth(row: CategoryComparisonRow): string {
    if (!this.highestCategoryAmount) {
      return '0%';
    }

    return `${Math.max((row.totalAmountBam / this.highestCategoryAmount) * 100, 4)}%`;
  }

  private getExpenseAmountInBam(expense: DataOverviewExpense): number {
    const currencyCode = (expense.valutaKod || expense.valutaNaziv || 'BAM').toUpperCase();
    const rate = this.exchangeRatesToBam[currencyCode] ?? 1;

    return Number(expense.iznos || 0) * rate;
  }

  private getExpenseCategoryName(expense: DataOverviewExpense): string {
    return expense.kategorijaNaziv || 'Bez kategorije';
  }

  private getExpenseDepartmentName(expense: DataOverviewExpense): string {
    return expense.odjelNaziv || 'Bez odjela';
  }

  private categoryMatches(categoryName: string): boolean {
    return this.selectedCategories.size === 0 || this.selectedCategories.has(categoryName);
  }

  private departmentMatches(departmentName: string): boolean {
    return this.selectedDepartments.size === 0 || this.selectedDepartments.has(departmentName);
  }

  private getGroupName(expense: DataOverviewExpense): string {
    if (this.comparisonMode === 'department') {
      return this.getExpenseDepartmentName(expense);
    }

    if (this.comparisonMode === 'categoryDepartment') {
      return `${this.getExpenseCategoryName(expense)} / ${this.getExpenseDepartmentName(expense)}`;
    }

    if (this.comparisonMode === 'period') {
      return this.getExpensePeriodName(expense);
    }

    return this.getExpenseCategoryName(expense);
  }

  private getExpensePeriodName(expense: DataOverviewExpense): string {
    const match = String(expense.datum || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) {
      return 'Nepoznat period';
    }

    return `${match[3]}.${match[2]}.${match[1]}`;
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

}
