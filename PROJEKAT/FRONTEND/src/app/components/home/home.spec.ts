import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { HomeComponent } from './home';
import { AuthGuardService } from '../../../middleware/middleware.authguard';
import { ExpenseService } from '../../../services/expense.service';
import { AiAnalysisService } from '../../../services/ai-analysis.service';
import { ReportService } from '../../../services/report.service';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthGuardService,
          useValue: {
            authState$: of(false),
            hasAnyRole: () => false,
          },
        },
        {
          provide: ExpenseService,
          useValue: {
            getExpenses: () => of([]),
            getReferenceData: () =>
              of({
                kategorije: [],
                odjeli: [],
                valute: [],
                projekti: [],
                dobavljaci: [],
              }),
          },
        },
        {
          provide: AiAnalysisService,
          useValue: {},
        },
        {
          provide: ReportService,
          useValue: {
            getExpenseReport: () => of({
              summary: {
                totalExpenses: 0,
                totalAmount: 0,
                averageAmount: 0,
                budgetCount: 0,
                budgetTotal: 0,
                budgetUtilizationPercent: null,
                highestExpense: null,
                lowestExpense: null,
                topCategory: null,
                topDepartment: null,
              },
            }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate the consolidated budget status', () => {
    component.budgetSummary = {
      totalExpenses: 4,
      totalAmount: 850,
      averageAmount: 212.5,
      budgetCount: 2,
      budgetTotal: 1000,
      budgetUtilizationPercent: 85,
      highestExpense: null,
      lowestExpense: null,
      topCategory: null,
      topDepartment: null,
    };

    expect(component.budgetRemainingAmount).toBe(150);
    expect(component.budgetProgressPercentage).toBe(85);
    expect(component.budgetStatusLabel).toBe('U granicama budzeta');
    expect(component.budgetStatusClass).toBe('healthy');
  });

  it('should cap an exceeded budget progress bar and flag the critical state', () => {
    component.budgetSummary = {
      totalExpenses: 2,
      totalAmount: 1250,
      averageAmount: 625,
      budgetCount: 1,
      budgetTotal: 1000,
      budgetUtilizationPercent: 125,
      highestExpense: null,
      lowestExpense: null,
      topCategory: null,
      topDepartment: null,
    };

    expect(component.budgetRemainingAmount).toBe(-250);
    expect(component.budgetProgressPercentage).toBe(100);
    expect(component.budgetStatusLabel).toBe('Budzet je prekoracen');
    expect(component.budgetStatusClass).toBe('critical');
  });
});
