import { Routes } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { ExpensesComponent } from './components/expenses/expenses';
import { HomeComponent } from './components/home/home';
import { RoleAccessComponent } from './components/role-access/role-access';
import { AuthGuardService } from '../middleware/middleware.authguard';

const expenseRoles = ['admin', 'administrativni_radnik', 'administrativni_zaposlenik'];

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

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'home', component: HomeComponent, canActivate: [requireAuth] },
  { path: 'troskovi', component: ExpensesComponent, canActivate: [canOpenExpenses] },
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
    data: { title: 'Glavni racunovodja', apiPath: '/glavni_racunovodja', allowedRoles: ['admin', 'glavni_racunovodja'] },
  },
  {
    path: 'administrativni_radnik',
    component: RoleAccessComponent,
    canActivate: [requireAuth],
    data: { title: 'Administrativni radnik', apiPath: '/administrativni_radnik', allowedRoles: ['admin', 'administrativni_radnik'] },
  },
];
