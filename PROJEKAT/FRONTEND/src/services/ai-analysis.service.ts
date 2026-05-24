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

@Injectable({ providedIn: 'root' })
export class AiAnalysisService {
  private readonly apiUrl = `${environment.apiUrl}/ai/analize/baza`;
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
    return this.http.post<DatabaseAnalysisResult>(this.apiUrl, {}, this.getAuthOptions());
  }
}
