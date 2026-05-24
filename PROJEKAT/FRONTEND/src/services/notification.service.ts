import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppNotification } from '../models/entities';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifikacije`;
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

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(this.apiUrl, this.getAuthOptions());
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/neprocitane/count`, this.getAuthOptions());
  }

  markAsRead(id: string | number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}/${id}/procitano`, {}, this.getAuthOptions());
  }
}
