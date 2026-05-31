import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { ExpensesComponent } from './components/expenses/expenses';
import { ExpenseImportComponent } from './components/expense-import/expense-import.component';
import { BudgetPlanningComponent } from './components/budget-planning/budget-planning';
import { DataOverviewComponent } from './components/data-overview/data-overview';
import { ReportsComponent } from './components/reports/reports';
import { NotificationsComponent } from './components/notifications/notifications';
import { HomeComponent } from './components/home/home';
import { RoleAccessComponent } from './components/role-access/role-access';
import { AuthGuardService } from '../middleware/middleware.authguard';

const expenseRoles = ['admin', 'administrativni_radnik', 'administrativni_zaposlenik'];
const budgetViewRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
const dataOverviewRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
const reportRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
const notificationRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];

const requireAuth = () => {
  const authService = inject(AuthGuardService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  return router.createUrlTree(['/']);
};

const canOpenExpenses = () => {
  const authService = inject(AuthGuardService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  if (authService.hasAnyRole(expenseRoles)) {
    return true;
  }

  return router.createUrlTree(['/home'], {
    queryParams: { accessDenied: 'troskovi' },
  });
};

const canOpenBudgets = () => {
  const authService = inject(AuthGuardService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  if (authService.hasAnyRole(budgetViewRoles)) {
    return true;
  }

  return router.createUrlTree(['/home'], {
    queryParams: { accessDenied: 'budzeti' },
  });
};

const canOpenDataOverview = () => {
  const authService = inject(AuthGuardService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  if (authService.hasAnyRole(dataOverviewRoles)) {
    return true;
  }

  return router.createUrlTree(['/home'], {
    queryParams: { accessDenied: 'pregled-podataka' },
  });
};

const canOpenReports = () => {
  const authService = inject(AuthGuardService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  if (authService.hasAnyRole(reportRoles)) {
    return true;
  }

  return router.createUrlTree(['/home'], {
    queryParams: { accessDenied: 'izvjestaji' },
  });
};

const canOpenNotifications = () => {
  const authService = inject(AuthGuardService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return router.createUrlTree(['/']);
  }

  if (authService.hasAnyRole(notificationRoles)) {
    return true;
  }

  return router.createUrlTree(['/home'], {
    queryParams: { accessDenied: 'notifikacije' },
  });
};

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'home', component: HomeComponent, canActivate: [requireAuth] },
  { path: 'troskovi', component: ExpensesComponent, canActivate: [canOpenExpenses] },
  { path: 'troskovi/import', component: ExpenseImportComponent, canActivate: [canOpenExpenses] },
  { path: 'budzeti', component: BudgetPlanningComponent, canActivate: [canOpenBudgets] },
  { path: 'podaci/pregled', component: DataOverviewComponent, canActivate: [canOpenDataOverview] },
  { path: 'izvjestaji', component: ReportsComponent, canActivate: [canOpenReports] },
  { path: 'notifikacije', component: NotificationsComponent, canActivate: [canOpenNotifications] },
  {
    path: 'profile',
    component: RoleAccessComponent,
    canActivate: [requireAuth],
    data: { title: 'Profil', apiPath: '/profile' },
  },
  {
    path: 'admin',
    component: RoleAccessComponent,
    canActivate: [requireAuth],
    data: { title: 'Admin', apiPath: '/admin', allowedRoles: ['admin'] },
  },
  {
    path: 'finansijski_direktor',
    component: RoleAccessComponent,
    canActivate: [requireAuth],
    data: { title: 'Finansijski direktor', apiPath: '/finansijski_direktor', allowedRoles: ['admin', 'finansijski_direktor'] },
  },
  {
    path: 'glavni_racunovodja',
    component: RoleAccessComponent,
    canActivate: [requireAuth],
    data: { title: 'Glavni računovođa', apiPath: '/glavni_racunovodja', allowedRoles: ['admin', 'glavni_racunovodja'] },
  },
  {
    path: 'administrativni_radnik',
    component: RoleAccessComponent,
    canActivate: [requireAuth],
    data: { title: 'Administrativni radnik', apiPath: '/administrativni_radnik', allowedRoles: ['admin', 'administrativni_radnik'] },
  },
];
