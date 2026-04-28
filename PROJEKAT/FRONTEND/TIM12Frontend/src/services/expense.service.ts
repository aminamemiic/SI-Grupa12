import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
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
      headers: this.getAuthHeaders(),
    });
  }

  createExpense(payload: CreateExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, payload, {
      headers: this.getAuthHeaders(),
    });
  }

  getReferenceData(): Observable<ExpenseReferenceData> {
    return this.http.get<ExpenseReferenceData>(`${this.apiUrl}/reference-data`, {
      headers: this.getAuthHeaders(),
    });
  }

  private getAuthHeaders(): HttpHeaders {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('access_token') ||
      sessionStorage.getItem('accessToken');

    if (!token) {
      return new HttpHeaders();
    }

    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }
}