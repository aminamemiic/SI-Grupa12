import { Routes } from '@angular/router';
import { Homepage } from './components/homepage/homepage';
import { ExpensesComponent } from './components/expenses/expenses';
import { HomeComponent } from './components/home/home';

export const routes: Routes = [
  { path: '', component: Homepage },
  { path: 'home', component: HomeComponent },
  { path: 'troskovi', component: ExpensesComponent },
];