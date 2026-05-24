import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { forkJoin, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { AppNotification, NotificationPriority } from '../../../models/entities';
import { NotificationService } from '../../../services/notification.service';

type NotificationFilter = 'ALL' | NotificationPriority;

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.html',
  styleUrl: './notifications.css',
})
export class NotificationsComponent implements OnInit {
  private readonly notificationService = inject(NotificationService);
  private readonly cdr = inject(ChangeDetectorRef);

  public notifications: AppNotification[] = [];
  public selectedNotification: AppNotification | null = null;
  public activeFilter: NotificationFilter = 'ALL';
  public isLoading = false;
  public isUpdating = false;
  public errorMessage = '';

  public readonly filters: Array<{ value: NotificationFilter; label: string }> = [
    { value: 'ALL', label: 'Sve' },
    { value: 'HIGH', label: 'Kritično' },
    { value: 'MEDIUM', label: 'Upozorenje' },
    { value: 'LOW', label: 'Info' },
  ];

  public ngOnInit(): void {
    this.loadNotifications();
  }

  public get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.procitano).length;
  }

  public get filteredNotifications(): AppNotification[] {
    if (this.activeFilter === 'ALL') {
      return this.notifications;
    }

    return this.notifications.filter((notification) => notification.prioritet === this.activeFilter);
  }

  public get selectedSummary(): string {
    if (!this.selectedNotification) {
      return '';
    }

    return this.getSummary(this.selectedNotification);
  }

  public get selectedRecommendation(): string {
    if (!this.selectedNotification) {
      return '-';
    }

    return this.extractRecommendation(this.selectedNotification.poruka);
  }

  public loadNotifications(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.notificationService.getNotifications()
      .pipe(finalize(() => {
        this.isLoading = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (notifications) => {
          this.notifications = notifications;
          this.selectedNotification = notifications[0] || null;
        },
        error: (error) => {
          console.error(error);
          this.errorMessage = this.getErrorMessage(error);
          this.notifications = [];
          this.selectedNotification = null;
        },
      });
  }

  public setFilter(filter: NotificationFilter): void {
    this.activeFilter = filter;
    const selectedStillVisible = this.selectedNotification &&
      this.filteredNotifications.some((notification) => notification.id === this.selectedNotification?.id);

    if (!selectedStillVisible) {
      this.selectedNotification = this.filteredNotifications[0] || null;
    }
  }

  public selectNotification(notification: AppNotification): void {
    this.selectedNotification = notification;
  }

  public markSelectedAsRead(): void {
    if (!this.selectedNotification || this.selectedNotification.procitano || this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    this.notificationService.markAsRead(this.selectedNotification.id)
      .pipe(finalize(() => {
        this.isUpdating = false;
        this.cdr.detectChanges();
      }))
      .subscribe({
        next: (updated) => this.replaceNotification(updated),
        error: (error) => {
          console.error(error);
          this.errorMessage = this.getErrorMessage(error);
        },
      });
  }

  public markAllAsRead(): void {
    const unread = this.notifications.filter((notification) => !notification.procitano);
    if (!unread.length || this.isUpdating) {
      return;
    }

    this.isUpdating = true;
    forkJoin(
      unread.map((notification) =>
        this.notificationService.markAsRead(notification.id).pipe(catchError(() => of(notification)))
      )
    )
      .pipe(finalize(() => {
        this.isUpdating = false;
        this.cdr.detectChanges();
      }))
      .subscribe((updatedNotifications) => {
        updatedNotifications.forEach((notification) => this.replaceNotification(notification));
      });
  }

  public priorityLabel(priority: NotificationPriority): string {
    const labels: Record<NotificationPriority, string> = {
      HIGH: 'Kritično',
      MEDIUM: 'Upozorenje',
      LOW: 'Info',
    };

    return labels[priority] || priority;
  }

  public priorityIcon(priority: NotificationPriority): string {
    if (priority === 'HIGH') {
      return '!';
    }

    if (priority === 'MEDIUM') {
      return '~';
    }

    return 'i';
  }

  public priorityClass(priority: NotificationPriority): string {
    return `priority-${priority.toLowerCase()}`;
  }

  public formatRelativeTime(value: string): string {
    const createdAt = new Date(value).getTime();
    if (!Number.isFinite(createdAt)) {
      return '-';
    }

    const diffMinutes = Math.max(0, Math.floor((Date.now() - createdAt) / 60000));
    if (diffMinutes < 1) {
      return 'upravo sada';
    }

    if (diffMinutes < 60) {
      return `prije ${diffMinutes} min`;
    }

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) {
      return `prije ${diffHours} h`;
    }

    const diffDays = Math.floor(diffHours / 24);
    return `prije ${diffDays} d`;
  }

  public formatDate(value: string): string {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return '-';
    }

    return date.toLocaleString('bs-BA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  public getSummary(notification: AppNotification): string {
    const [beforeRecommendation] = notification.poruka.split(/Preporu[cč]ena akcija:/);
    return this.normalizeDisplayText(beforeRecommendation.trim());
  }

  public extractRecommendation(message: string): string {
    const match = message.match(/Preporu[cč]ena akcija:/);

    if (!match || match.index === undefined) {
      return 'Pregledati trošak i prateću dokumentaciju prije dalje obrade.';
    }

    return this.normalizeDisplayText(message.slice(match.index + match[0].length).trim());
  }

  public trackNotification(_index: number, notification: AppNotification): string | number {
    return notification.id;
  }

  private replaceNotification(updated: AppNotification): void {
    this.notifications = this.notifications.map((notification) =>
      notification.id === updated.id ? updated : notification
    );

    if (this.selectedNotification?.id === updated.id) {
      this.selectedNotification = updated;
    }
  }

  private getErrorMessage(error: any): string {
    const message = error?.error?.message || error?.error?.error || error?.message;

    if (error?.status === 401 || String(message || '').toLowerCase().includes('token')) {
      return 'Sesija je istekla. Odjavi se i prijavi ponovo.';
    }

    return message || 'Greška pri dohvatu notifikacija.';
  }

  private normalizeDisplayText(value: string): string {
    return value
      .replace(/\bTrosak\b/g, 'Trošak')
      .replace(/\btrosak\b/g, 'trošak')
      .replace(/\btroska\b/g, 'troška')
      .replace(/\btroskova\b/g, 'troškova')
      .replace(/\bpratecu\b/g, 'prateću')
      .replace(/\boznacen\b/g, 'označen')
      .replace(/\bPreporucena\b/g, 'Preporučena');
  }
}
