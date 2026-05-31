import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface MonthlyTrendPoint {
  mjesec: string;
  ukupniIznos: number;
  brojTroskova: number;
  prosjecniIznos: number;
}

export interface BudzetPrediction {
  sljedeciMjesec: string;
  predvideniIznos: number;
  donjaBoundary: number;
  gornjaBoundary: number;
  pouzdanostProcjene: 'NISKA' | 'SREDNJA' | 'VISOKA';
}

export interface DatabaseAnalysisResult {
  analizaId: string | null;
  generisanoU: string;
  ukupnoTroskova: number;
  ukupniIznos: number;
  prosjecniMjesecniIznos: number;
  trenKretanja: 'RAST' | 'PAD' | 'STABILAN';
  postotakPromjene: number;
  topKategorija: string | null;
  topOdjel: string | null;
  mjesecniTrendovi: MonthlyTrendPoint[];
  predvidjanjeBudzeta: BudzetPrediction[];
  preporuke: string[];
  sazetak: string;
}

export interface AssistantResponse {
  answer: string;
  source: 'gemini' | 'fallback';
  intent: string;
  data: unknown;
}

export interface TopGrowingSupplier {
  supplierId: string | null;
  supplierName: string;
  currentAmount: number;
  previousAmount: number;
  growthPercentage: number | null;
  status: 'growth' | 'decline' | 'stable' | 'new_spending';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface TopGrowingSuppliersResponse {
  suppliers: TopGrowingSupplier[];
}

export interface ExecutiveSummaryResponse {
  summary: Array<{ type: 'INFO' | 'WARNING' | 'SUCCESS'; message: string }>;
}

export interface CostSuggestionsResponse {
  suggestions: Array<{ title: string; description: string; estimatedImpact: string }>;
}

export interface MissingRecurringExpensesResponse {
  missingRecurringExpenses: Array<{
    expenseName: string;
    lastSeenDate: string;
    averageAmount: number;
    recommendation: string;
  }>;
}

export interface SupplierRiskResponse {
  risks: Array<{ supplierName: string; sharePercentage: number; riskLevel: string; message: string }>;
}

export interface AnomalyExplanationResponse {
  explanation: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

@Injectable({ providedIn: 'root' })
export class AiAnalysisService {
  private readonly apiBaseUrl = `${environment.apiUrl}/ai`;
  private readonly accessTokenKey = 'kc_access_token';

  constructor(private http: HttpClient) {}

  private getAuthOptions() {
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const headers = accessToken
      ? new HttpHeaders({ Authorization: `Bearer ${accessToken}` })
      : undefined;

    return {
      withCredentials: true,
      ...(headers ? { headers } : {}),
    };
  }

  runDatabaseAnalysis(): Observable<DatabaseAnalysisResult> {
    return this.http.post<DatabaseAnalysisResult>(`${this.apiBaseUrl}/analize/baza`, {}, this.getAuthOptions());
  }

  askAssistant(question: string): Observable<AssistantResponse> {
    return this.http.post<AssistantResponse>(`${this.apiBaseUrl}/asistent/pitaj`, { question }, this.getAuthOptions());
  }

  getTopGrowingSuppliers(): Observable<TopGrowingSuppliersResponse> {
    return this.http.get<TopGrowingSuppliersResponse>(`${this.apiBaseUrl}/dobavljaci/rast`, this.getAuthOptions());
  }

  getExecutiveSummary(): Observable<ExecutiveSummaryResponse> {
    return this.http.get<ExecutiveSummaryResponse>(`${this.apiBaseUrl}/executive-summary`, this.getAuthOptions());
  }

  getCostSuggestions(): Observable<CostSuggestionsResponse> {
    return this.http.get<CostSuggestionsResponse>(`${this.apiBaseUrl}/cost-suggestions`, this.getAuthOptions());
  }

  getMissingRecurringExpenses(): Observable<MissingRecurringExpensesResponse> {
    return this.http.get<MissingRecurringExpensesResponse>(`${this.apiBaseUrl}/missing-recurring-expenses`, this.getAuthOptions());
  }

  getSupplierRisk(): Observable<SupplierRiskResponse> {
    return this.http.get<SupplierRiskResponse>(`${this.apiBaseUrl}/supplier-risk`, this.getAuthOptions());
  }

  explainAnomaly(expenseId: string | number): Observable<AnomalyExplanationResponse> {
    return this.http.get<AnomalyExplanationResponse>(`${this.apiBaseUrl}/anomaly-explanation/${expenseId}`, this.getAuthOptions());
  }
}
