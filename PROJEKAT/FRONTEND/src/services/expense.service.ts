import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  CreateExpenseRequest,
  Expense,
  ExpenseReferenceData,
} from '../models/entities';
import { environment } from '../environments/environment';

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

  getReferenceData(): Observable<ExpenseReferenceData> {
    return this.http.get<ExpenseReferenceData>(`${this.apiUrl}/reference-data`, this.getAuthOptions());
  }
}
