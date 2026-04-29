import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { ExpensesComponent } from './components/expenses/expenses';
import { HomeComponent } from './components/home/home';
import { RoleAccessComponent } from './components/role-access/role-access';
import { AuthGuardService } from '../middleware/middleware.authguard';

const expenseRoles = ['admin', 'administrativni_radnik'];

const canOpenExpenses = () => {
  const authService = inject(AuthGuardService);
  const router = inject(Router);

  if (authService.hasAnyRole(expenseRoles)) {
    return true;
  }

  return router.createUrlTree(['/home'], {
    queryParams: { accessDenied: 'troskovi' },
  });
};

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'home', component: HomeComponent },
  { path: 'troskovi', component: ExpensesComponent, canActivate: [canOpenExpenses] },
  {
    path: 'profile',
    component: RoleAccessComponent,
    data: { title: 'Profil', apiPath: '/profile' },
  },
  {
    path: 'admin',
    component: RoleAccessComponent,
    data: { title: 'Admin', apiPath: '/admin' },
  },
  {
    path: 'finansijski_direktor',
    component: RoleAccessComponent,
    data: { title: 'Finansijski direktor', apiPath: '/finansijski_direktor' },
  },
  {
    path: 'glavni_racunovodja',
    component: RoleAccessComponent,
    data: { title: 'Glavni racunovodja', apiPath: '/glavni_racunovodja' },
  },
  {
    path: 'administrativni_radnik',
    component: RoleAccessComponent,
    data: { title: 'Administrativni radnik', apiPath: '/administrativni_radnik' },
  },
];
