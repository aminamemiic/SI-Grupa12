import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DataOverviewBudget, DataOverviewExpense } from '../../../../../models/entities';

type PlannedActualRow = {
  groupName: string;
  plannedAmount: number;
  actualAmount: number;
  variance: number;
  utilization: number | null;
  status: string;
};

@Component({
  selector: 'app-planned-actual-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './planned-actual-comparison.html',
  styleUrl: './planned-actual-comparison.css',
})
export class PlannedActualComparisonComponent {
  @Input() public expenses: DataOverviewExpense[] = [];
  @Input() public budgets: DataOverviewBudget[] = [];
  @Input() public selectedCategories: Set<string> = new Set();
  @Input() public selectedDepartments: Set<string> = new Set();
  @Input() public dateFrom = '';
  @Input() public dateTo = '';
  @Output() public closePanel = new EventEmitter<void>();
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
  private readonly statusPriority: Record<string, number> = {
    'Bez plana': 1,
    Kritično: 2,
    Prekoračeno: 3,
    'U okviru budžeta': 4,
    'Nije iskorišteno': 5,
  };

  public get categoryOptions(): string[] {
    const expenseCategories = this.expenses.map((expense) => this.getExpenseCategoryName(expense));
    const budgetCategories = this.budgets.flatMap((budget) => this.getBudgetCategoryNames(budget));
    return [...new Set([...expenseCategories, ...budgetCategories])].sort();
  }

  public get departmentOptions(): string[] {
    const expenseDepartments = this.expenses.map((expense) => this.getDepartmentName(expense.odjelNaziv));
    const budgetDepartments = this.budgets.map((budget) => this.getDepartmentName(budget.odjelNaziv));
    return [...new Set([...expenseDepartments, ...budgetDepartments])].sort();
  }

  public get filteredExpenses(): DataOverviewExpense[] {
    return this.expenses.filter((expense) => {
      const categoryName = this.getExpenseCategoryName(expense);
      const departmentName = this.getDepartmentName(expense.odjelNaziv);

      return this.categoryMatches(categoryName) &&
        this.departmentMatches(departmentName) &&
        this.dateMatches(expense.datum);
    });
  }

  public get filteredBudgets(): DataOverviewBudget[] {
    return this.budgets.filter((budget) => {
      const budgetCategories = this.getBudgetCategoryNames(budget);
      const departmentName = this.getDepartmentName(budget.odjelNaziv);

      return this.budgetCategoryMatches(budgetCategories) &&
        this.departmentMatches(departmentName) &&
        this.budgetPeriodOverlaps(budget);
    });
  }

  public get rows(): PlannedActualRow[] {
    const groupNames = new Set<string>();
    this.filteredExpenses.forEach((expense) => groupNames.add(this.getGroupName(this.getExpenseCategoryName(expense), this.getDepartmentName(expense.odjelNaziv))));
    this.filteredBudgets.forEach((budget) => {
      this.getBudgetCategoryNames(budget).forEach((category) => groupNames.add(this.getGroupName(category, this.getDepartmentName(budget.odjelNaziv))));
    });

    return Array.from(groupNames).map((groupName) => {
      const actualAmount = this.filteredExpenses
        .filter((expense) => this.getGroupName(this.getExpenseCategoryName(expense), this.getDepartmentName(expense.odjelNaziv)) === groupName)
        .reduce((sum, expense) => sum + this.getExpenseAmountInBam(expense), 0);

      const plannedAmount = this.filteredBudgets
        .filter((budget) => this.getBudgetCategoryNames(budget).some((category) => this.getGroupName(category, this.getDepartmentName(budget.odjelNaziv)) === groupName))
        .reduce((sum, budget) => sum + this.getBudgetAmountForGroup(budget), 0);

      return {
        groupName,
        plannedAmount,
        actualAmount,
        variance: actualAmount - plannedAmount,
        utilization: plannedAmount > 0 ? (actualAmount / plannedAmount) * 100 : null,
        status: this.getStatus(plannedAmount, actualAmount),
      };
    }).sort((first, second) =>
      this.statusPriority[first.status] - this.statusPriority[second.status] ||
      Math.abs(second.variance) - Math.abs(first.variance)
    );
  }

  public get totalPlannedAmount(): number {
    return this.rows.reduce((sum, row) => sum + row.plannedAmount, 0);
  }

  public get totalActualAmount(): number {
    return this.rows.reduce((sum, row) => sum + row.actualAmount, 0);
  }

  public get totalVariance(): number {
    return this.totalActualAmount - this.totalPlannedAmount;
  }

  public get totalUtilization(): number | null {
    return this.totalPlannedAmount > 0 ? (this.totalActualAmount / this.totalPlannedAmount) * 100 : null;
  }

  public get criticalVarianceCount(): number {
    return this.rows.filter((row) => row.status === 'Kritično').length;
  }

  public get highestOverrunLabel(): string {
    const row = this.rows
      .filter((item) => item.variance > 0)
      .sort((first, second) => second.variance - first.variance)[0];

    return row ? `${row.groupName}: ${row.variance.toLocaleString('bs-BA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} KM` : '-';
  }

  public toggleCategory(categoryName: string): void {
    const nextSelection = new Set(this.selectedCategories);
    nextSelection.has(categoryName) ? nextSelection.delete(categoryName) : nextSelection.add(categoryName);
    this.selectedCategoriesChange.emit(nextSelection);
  }

  public toggleDepartment(departmentName: string): void {
    const nextSelection = new Set(this.selectedDepartments);
    nextSelection.has(departmentName) ? nextSelection.delete(departmentName) : nextSelection.add(departmentName);
    this.selectedDepartmentsChange.emit(nextSelection);
  }

  public clearComparison(): void {
    this.selectedCategoriesChange.emit(new Set());
    this.selectedDepartmentsChange.emit(new Set());
    this.dateFromChange.emit('');
    this.dateToChange.emit('');
  }

  public isCategorySelected(categoryName: string): boolean {
    return this.selectedCategories.has(categoryName);
  }

  public isDepartmentSelected(departmentName: string): boolean {
    return this.selectedDepartments.has(departmentName);
  }

  public getVarianceClass(value: number): string {
    return value > 0 ? 'over-budget' : value < 0 ? 'under-budget' : '';
  }

  public getStatusClass(status: string): string {
    return status
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[čć]/g, 'c')
      .replace(/š/g, 's')
      .replace(/ž/g, 'z')
      .replace(/đ/g, 'd');
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

  private getBudgetAmountForGroup(budget: DataOverviewBudget): number {
    const matchingCategoryCount = this.getBudgetCategoryNames(budget)
      .filter((category) => this.categoryMatches(category))
      .length || this.getBudgetCategoryNames(budget).length || 1;

    return Number(budget.planiraniIznos || 0) / matchingCategoryCount;
  }

  private categoryMatches(categoryName: string): boolean {
    return this.selectedCategories.size === 0 || this.selectedCategories.has(categoryName);
  }

  private budgetCategoryMatches(categoryNames: string[]): boolean {
    return this.selectedCategories.size === 0 || categoryNames.some((category) => this.selectedCategories.has(category));
  }

  private departmentMatches(departmentName: string): boolean {
    return this.selectedDepartments.size === 0 || this.selectedDepartments.has(departmentName);
  }

  private dateMatches(dateValue: string): boolean {
    return (!this.dateFrom || dateValue >= this.dateFrom) && (!this.dateTo || dateValue <= this.dateTo);
  }

  private budgetPeriodOverlaps(budget: DataOverviewBudget): boolean {
    return (!this.dateFrom || budget.datumZavrsetka >= this.dateFrom) && (!this.dateTo || budget.datumPocetka <= this.dateTo);
  }

  private getExpenseAmountInBam(expense: DataOverviewExpense): number {
    const currencyCode = (expense.valutaKod || expense.valutaNaziv || 'BAM').toUpperCase();
    const rate = this.exchangeRatesToBam[currencyCode] ?? 1;
    return Number(expense.iznos || 0) * rate;
  }

  private getExpenseCategoryName(expense: DataOverviewExpense): string {
    return expense.kategorijaNaziv || 'Bez kategorije';
  }

  private getBudgetCategoryNames(budget: DataOverviewBudget): string[] {
    return budget.kategorije?.length ? budget.kategorije.map((category) => category.naziv) : ['Bez kategorije'];
  }

  private getDepartmentName(value: string | null | undefined): string {
    return value || 'Bez odjela';
  }

  private getGroupName(categoryName: string, departmentName: string): string {
    return `${categoryName} / ${departmentName}`;
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

  private getStatus(plannedAmount: number, actualAmount: number): string {
    const utilization = plannedAmount > 0 ? (actualAmount / plannedAmount) * 100 : null;

    if (plannedAmount === 0 && actualAmount > 0) {
      return 'Bez plana';
    }

    if (actualAmount === 0 && plannedAmount > 0) {
      return 'Nije iskorišteno';
    }

    if (utilization !== null && utilization > 125) {
      return 'Kritično';
    }

    if (utilization !== null && utilization > 100) {
      return 'Prekoračeno';
    }

    return 'U okviru budžeta';
  }
}
