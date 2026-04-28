import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';

import { ExpensesComponent } from './components/expenses/expenses';
export const routes: Routes = [
  { path: '', component: Homepage },{ path: 'troskovi', component: ExpensesComponent },
];
