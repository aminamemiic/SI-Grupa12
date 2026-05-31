import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Budget, BudzetKomentar, BudgetReferenceData, CreateBudgetRequest } from '../models/entities';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private readonly apiUrl = `${environment.apiUrl}/budzeti`;
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

  getBudgets(): Observable<Budget[]> {
    return this.http.get<Budget[]>(this.apiUrl, this.getAuthOptions());
  }

  getBudget(id: string): Observable<Budget> {
    return this.http.get<Budget>(`${this.apiUrl}/${id}`, this.getAuthOptions());
  }

  createBudget(payload: CreateBudgetRequest): Observable<Budget> {
    return this.http.post<Budget>(this.apiUrl, payload, this.getAuthOptions());
  }

  updateBudget(id: string, payload: CreateBudgetRequest): Observable<Budget> {
    return this.http.put<Budget>(`${this.apiUrl}/${id}`, payload, this.getAuthOptions());
  }
updateBudgetStatus(id: string, statusOdobrenja: "ODOBREN" | "ODBIJEN"): Observable<Budget> {
  return this.http.patch<Budget>(
    `${this.apiUrl}/${id}/status`,
    { statusOdobrenja },
    this.getAuthOptions()
  );
}

  vratiNaDoradu(budzetId: number | string, komentar: string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${budzetId}/vrati-na-doradu`,
      { komentar },
      this.getAuthOptions()
    );
  }

  submitujDoradu(budzetId: number | string): Observable<any> {
    return this.http.patch<any>(
      `${this.apiUrl}/${budzetId}/submituj-doradu`,
      {},
      this.getAuthOptions()
    );
  }

  getKomentari(budzetId: number | string): Observable<BudzetKomentar[]> {
    return this.http.get<BudzetKomentar[]>(
      `${this.apiUrl}/${budzetId}/komentari`,
      this.getAuthOptions()
    );
  }
  getReferenceData(): Observable<BudgetReferenceData> {
    return this.http.get<BudgetReferenceData>(`${this.apiUrl}/reference-data`, this.getAuthOptions());
  }

  getBudgetProjection(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}/projekcija`, this.getAuthOptions());
  }
}


