import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface ImportPreviewRequest {
  originalName: string;
  mimetype?: string;
}

export interface ImportRowIssue {
  field?: string;
  message: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  raw: any;
  expense: any;
  isValid: boolean;
  errors: ImportRowIssue[];
  warnings: ImportRowIssue[];
}

export interface ImportPreviewResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ImportPreviewRow[];
}

export interface ImportConfirmRequest {
  fileName?: string;
  rows: any[];
}

export interface ImportConfirmResult {
  importId: string | null;
  fileName: string | null;
  totalRows: number;
  insertedCount: number;
  skippedCount: number;
  createdExpenses: any[];
  errors: Array<{ rowNumber?: number; message: string }>;
}

@Injectable({
  providedIn: 'root',
})
export class IngestionService {
  private readonly apiUrl = `${environment.apiUrl}/troskovi/uvoz`;
  private readonly accessTokenKey = 'kc_access_token';
  private readonly idTokenKey = 'kc_id_token';

  constructor(private http: HttpClient) {}

  private getAuthOptions() {
    const token = sessionStorage.getItem(this.accessTokenKey) || sessionStorage.getItem(this.idTokenKey);
    const headers = token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : undefined;

    return {
      withCredentials: true,
      ...(headers ? { headers } : {}),
    };
  }

  previewImport(file: File): Observable<ImportPreviewResult> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ImportPreviewResult>(
      `${this.apiUrl}/preview`,
      formData,
      this.getAuthOptions()
    );
  }

  confirmImport(payload: ImportConfirmRequest): Observable<ImportConfirmResult> {
    return this.http.post<ImportConfirmResult>(
      `${this.apiUrl}/potvrdi`,
      payload,
      this.getAuthOptions()
    );
  }

  getImportHistory(): Observable<any[]> {
    return this.http.get<any[]>(
      `${this.apiUrl}/historija`,
      this.getAuthOptions()
    );
  }
}
