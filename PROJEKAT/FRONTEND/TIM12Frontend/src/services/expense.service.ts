import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateExpenseRequest,
  Expense,
  ExpenseReferenceData,
} from '../models/entities';

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly apiUrl = 'http://localhost:3000/api/troskovi';

  constructor(private http: HttpClient) {}

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl, {
      withCredentials: true
    });
  }

  createExpense(payload: CreateExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, payload, {
      withCredentials: true
    });
  }

  getReferenceData(): Observable<ExpenseReferenceData> {
    return this.http.get<ExpenseReferenceData>(`${this.apiUrl}/reference-data`, {
      withCredentials: true
    });
  }
}