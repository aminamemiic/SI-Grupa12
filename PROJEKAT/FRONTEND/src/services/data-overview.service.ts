import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DataOverview } from '../models/entities';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DataOverviewService {
  private readonly apiUrl = `${environment.apiUrl}/podaci/pregled`;
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

  getOverview(): Observable<DataOverview> {
    return this.http.get<DataOverview>(this.apiUrl, this.getAuthOptions());
  }
}

