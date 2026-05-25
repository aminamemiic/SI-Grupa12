import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateExpenseRequest,
  Expense,
  ExpenseCategorySuggestion,
  ExpenseReferenceData,
} from '../models/entities';
import { environment } from '../environments/environment';

export interface ValidationResult {
  isValid: boolean;
  validationErrors: string[];
  warnings: Array<{ type: string; message: string; severity: 'LOW' | 'MEDIUM' | 'HIGH' }>;
}

@Injectable({
  providedIn: 'root',
})
export class ExpenseService {
  private readonly apiUrl = `${environment.apiUrl}/troskovi`;

  private readonly accessTokenKey = 'kc_access_token';

  constructor(private http: HttpClient) {}

  private getAuthOptions() {
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined;

    return {
      withCredentials: true,
      ...(headers ? { headers } : {}),
    };
  }

  getExpenses(): Observable<Expense[]> {
    return this.http.get<Expense[]>(this.apiUrl, this.getAuthOptions());
  }

  createExpense(payload: CreateExpenseRequest): Observable<Expense> {
    return this.http.post<Expense>(this.apiUrl, payload, this.getAuthOptions());
  }

  updateExpense(id: string, payload: CreateExpenseRequest): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/${id}`, payload, this.getAuthOptions());
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`, this.getAuthOptions());
  }

  savePotentialDuplicate(id: string | number): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/${id}/duplikat/sacuvaj`, {}, this.getAuthOptions());
  }

  deletePotentialDuplicate(id: string | number): Observable<{ id: string | number; deleted: boolean }> {
    return this.http.delete<{ id: string | number; deleted: boolean }>(`${this.apiUrl}/${id}/duplikat`, this.getAuthOptions());
  }

  getReferenceData(): Observable<ExpenseReferenceData> {
    return this.http.get<ExpenseReferenceData>(`${this.apiUrl}/reference-data`, this.getAuthOptions());
  }

  // ─────────────────────────────────────────────────────────────
  // Real-time validation and anomaly detection
  // ─────────────────────────────────────────────────────────────
  validateExpenseBeforeCreation(payload: CreateExpenseRequest): Observable<ValidationResult> {
    return this.http.post<ValidationResult>(`${this.apiUrl}/validate`, payload, this.getAuthOptions());
  suggestCategory(payload: { naziv: string; opis?: string | null; dobavljac?: string | null }): Observable<ExpenseCategorySuggestion> {
    return this.http.post<ExpenseCategorySuggestion>(`${this.apiUrl}/category-suggestion`, payload, this.getAuthOptions());
  }
}
