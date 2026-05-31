import { SelectedExpenseComparisonComponent } from './selected-expense-comparison';

describe('SelectedExpenseComparisonComponent', () => {
  it('should calculate side-by-side summary values in BAM', () => {
    const component = new SelectedExpenseComparisonComponent();
    component.expenses = [
      { id: '1', naziv: 'Licenca', iznos: 100, datum: '2026-05-01', valutaKod: 'EUR' },
      { id: '2', naziv: 'Zakup', iznos: 300, datum: '2026-05-02', valutaKod: 'BAM' },
    ];

    expect(component.totalAmount).toBeCloseTo(495.583);
    expect(component.highestAmount).toBe(300);
    expect(component.lowestAmount).toBeCloseTo(195.583);
    expect(component.amountDifference).toBeCloseTo(104.417);
    expect(component.averageAmount).toBeCloseTo(247.7915);
    expect(component.isHighestExpense(component.expenses[1])).toBe(true);
    expect(component.isLowestExpense(component.expenses[0])).toBe(true);
  });

  it('should return empty summary values without selected expenses', () => {
    const component = new SelectedExpenseComparisonComponent();

    expect(component.totalAmount).toBe(0);
    expect(component.highestAmount).toBeNull();
    expect(component.lowestAmount).toBeNull();
    expect(component.averageAmount).toBeNull();
    expect(component.amountDifference).toBeNull();
  });
});
