import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, Subscription, timer } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { AppNotification } from '../models/entities';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly apiUrl = `${environment.apiUrl}/notifikacije`;
  private readonly accessTokenKey = 'kc_access_token';
  private readonly refreshIntervalMs = 3000;
  private readonly unreadCountSubject = new BehaviorSubject<number>(0);
  private unreadRefreshSubscription: Subscription | null = null;

  public readonly unreadCount$ = this.unreadCountSubject.asObservable();

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
    return this.http.get<AppNotification[]>(this.apiUrl, this.getAuthOptions()).pipe(
      tap((notifications) => this.setUnreadCountFromNotifications(notifications))
    );
  }

  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/neprocitane/count`, this.getAuthOptions()).pipe(
      tap(({ count }) => this.unreadCountSubject.next(count))
    );
  }

  markAsRead(id: string | number): Observable<AppNotification> {
    return this.http.patch<AppNotification>(`${this.apiUrl}/${id}/procitano`, {}, this.getAuthOptions()).pipe(
      tap((notification) => {
        if (notification.procitano) {
          this.decrementUnreadCount();
        }
      })
    );
  }

  startUnreadCountRefresh(): void {
    if (this.unreadRefreshSubscription) {
      return;
    }

    this.unreadRefreshSubscription = timer(0, this.refreshIntervalMs).subscribe(() => {
      this.getUnreadCount()
        .pipe(catchError(() => of({ count: this.unreadCountSubject.value })))
        .subscribe();
    });
  }

  stopUnreadCountRefresh(): void {
    this.unreadRefreshSubscription?.unsubscribe();
    this.unreadRefreshSubscription = null;
    this.unreadCountSubject.next(0);
  }

  syncUnreadCount(notifications: AppNotification[]): void {
    this.setUnreadCountFromNotifications(notifications);
  }

  private setUnreadCountFromNotifications(notifications: AppNotification[]): void {
    this.unreadCountSubject.next(notifications.filter((notification) => !notification.procitano).length);
  }

  private decrementUnreadCount(): void {
    this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));
  }
}
