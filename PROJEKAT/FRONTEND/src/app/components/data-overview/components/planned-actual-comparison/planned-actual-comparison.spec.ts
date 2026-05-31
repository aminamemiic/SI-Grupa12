import { PlannedActualComparisonComponent } from './planned-actual-comparison';

describe('PlannedActualComparisonComponent', () => {
  it('should show planned and actual values next to each other with variance', () => {
    const component = new PlannedActualComparisonComponent();
    component.expenses = [
      {
        id: 'e1',
        naziv: 'Laptop',
        iznos: 1200,
        datum: '2026-05-10',
        kategorijaNaziv: 'Oprema',
        odjelNaziv: 'IT',
        valutaKod: 'BAM',
      },
    ];
    component.budgets = [
      {
        id: 'b1',
        naziv: 'IT budzet',
        planiraniIznos: 1000,
        datumPocetka: '2026-01-01',
        datumZavrsetka: '2026-12-31',
        odjelNaziv: 'IT',
        kategorije: [{ id: 'k1', naziv: 'Oprema' }],
        kategorijaIds: ['k1'],
      },
    ];

    expect(component.rows).toEqual([
      expect.objectContaining({
        groupName: 'Oprema / IT',
        plannedAmount: 1000,
        actualAmount: 1200,
        variance: 200,
        utilization: 120,
      }),
    ]);
    expect(component.totalPlannedAmount).toBe(1000);
    expect(component.totalActualAmount).toBe(1200);
    expect(component.totalVariance).toBe(200);
    expect(component.totalUtilization).toBe(120);
  });

  it('should filter both sides of the comparison by category', () => {
    const component = new PlannedActualComparisonComponent();
    component.selectedCategories = new Set(['Usluge']);
    component.expenses = [
      { id: 'e1', naziv: 'Internet', iznos: 100, datum: '2026-05-10', kategorijaNaziv: 'Usluge', odjelNaziv: 'IT' },
      { id: 'e2', naziv: 'Laptop', iznos: 900, datum: '2026-05-10', kategorijaNaziv: 'Oprema', odjelNaziv: 'IT' },
    ];
    component.budgets = [
      {
        id: 'b1',
        naziv: 'IT budzet',
        planiraniIznos: 300,
        datumPocetka: '2026-01-01',
        datumZavrsetka: '2026-12-31',
        odjelNaziv: 'IT',
        kategorije: [{ id: 'k1', naziv: 'Usluge' }],
        kategorijaIds: ['k1'],
      },
    ];

    expect(component.rows).toHaveLength(1);
    expect(component.rows[0]).toEqual(expect.objectContaining({
      groupName: 'Usluge / IT',
      plannedAmount: 300,
      actualAmount: 100,
    }));
  });
});
