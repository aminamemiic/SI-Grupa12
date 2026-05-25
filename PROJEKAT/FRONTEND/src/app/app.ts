import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthGuardService } from '../middleware/middleware.authguard';
import { NotificationService } from '../services/notification.service';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  private readonly authService = inject(AuthGuardService);
  private readonly userService = inject(UserService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  private readonly subscriptions = new Subscription();

  public readonly expenseRoles = ['admin', 'administrativni_radnik', 'administrativni_zaposlenik'];
  public readonly budgetRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
  public readonly dataOverviewRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
  public readonly reportRoles = ['admin', 'glavni_racunovodja', 'finansijski_direktor'];
  public readonly notificationRoles = ['admin', 'glavni_racunovodja'];
  public readonly adminConsoleUrl = 'https://keycloak-production-4c61.up.railway.app/';
  public isLoading = false;
  public navMessage = '';
  public isLoggedIn = false;
  public primaryRole = '';
  public readonly unreadNotificationCount$ = this.notificationService.unreadCount$;

  public ngOnInit(): void {
    if (window.location.hostname === '127.0.0.1' && window.location.port === '4200') {
      window.location.replace(`http://localhost:4200${window.location.pathname}${window.location.search}${window.location.hash}`);
      return;
    }

    this.refreshAuthState();
    this.syncNotificationRefresh();

    this.subscriptions.add(this.authService.authState$.subscribe((isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;
      this.primaryRole = isAuthenticated ? this.authService.getPrimaryRole() : '';
      this.syncNotificationRefresh();
    }));

    void this.handleKeycloakCallback();
  }

  public ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.notificationService.stopUnreadCountRefresh();
  }

  public get canOpenExpenses(): boolean {
    return this.authService.hasAnyRole(this.expenseRoles);
  }

  public get canOpenBudgets(): boolean {
  return this.authService.hasAnyRole(this.budgetRoles);
}

  public get canOpenDataOverview(): boolean {
    return this.authService.hasAnyRole(this.dataOverviewRoles);
  }

  public get canOpenReports(): boolean {
    return this.authService.hasAnyRole(this.reportRoles);
  }

  public get canOpenNotifications(): boolean {
    return this.authService.hasAnyRole(this.notificationRoles);
  }

  public get isAuthenticated(): boolean {
    return this.isLoggedIn;
  }

  public get isAdmin(): boolean {
    return this.authService.hasAnyRole(['admin']);
  }

  public async signIn(): Promise<void> {
    this.navMessage = '';
    await this.authService.loginWithKeycloak();
  }

  public async signOut(): Promise<void> {
    this.navMessage = '';
    this.isLoading = true;
    const logoutUrl = this.authService.getKeycloakLogoutUrl();
    this.authService.clearStoredTokens();
    this.refreshAuthState();
    void this.router.navigate(['/']);

    try {
      await this.userService.logout();
    } catch (error) {
      console.warn('Backend logout nije uspio, nastavljam Keycloak logout.', error);
    } finally {
      window.location.href = logoutUrl;
    }
  }

  public openExpensesTab(event: Event): void {
    if (!this.isAuthenticated) {
      event.preventDefault();
      this.navMessage = 'Prijavite se da biste pristupili aplikaciji.';
      void this.router.navigate(['/']);
      return;
    }

    if (this.canOpenExpenses) {
      this.navMessage = '';
      return;
    }

    event.preventDefault();
    this.navMessage = 'Formi za unos troškova mogu pristupiti samo admin i administrativni_radnik.';
    void this.router.navigate(['/home'], {
      queryParams: { accessDenied: 'troskovi' },
    });
  }

  public openBudgetsTab(event: Event): void {
  if (!this.isAuthenticated) {
    event.preventDefault();
    this.navMessage = 'Prijavite se da biste pristupili aplikaciji.';
    void this.router.navigate(['/']);
    return;
  }

  if (this.canOpenBudgets) {
    this.navMessage = '';
    return;
  }

  event.preventDefault();
  this.navMessage = 'Planiranju budžeta mogu pristupiti samo admin, glavni_racunovodja i finansijski_direktor.';
  void this.router.navigate(['/home'], {
    queryParams: { accessDenied: 'budzeti' },
  });
}

  public openDataOverviewTab(event: Event): void {
    if (!this.isAuthenticated) {
      event.preventDefault();
      this.navMessage = 'Prijavite se da biste pristupili aplikaciji.';
      void this.router.navigate(['/']);
      return;
    }

    if (this.canOpenDataOverview) {
      this.navMessage = '';
      return;
    }

    event.preventDefault();
    this.navMessage = 'Pregledu podataka mogu pristupiti samo admin, glavni_racunovodja i finansijski_direktor.';
    void this.router.navigate(['/home'], {
      queryParams: { accessDenied: 'pregled-podataka' },
    });
  }

  public openReportsTab(event: Event): void {
    if (!this.isAuthenticated) {
      event.preventDefault();
      this.navMessage = 'Prijavite se da biste pristupili aplikaciji.';
      void this.router.navigate(['/']);
      return;
    }

    if (this.canOpenReports) {
      this.navMessage = '';
      return;
    }

    event.preventDefault();
    this.navMessage = 'Izvještajima mogu pristupiti samo admin, glavni_racunovodja i finansijski_direktor.';
    void this.router.navigate(['/home'], {
      queryParams: { accessDenied: 'izvjestaji' },
    });
  }

  public openNotificationsTab(event: Event): void {
    if (!this.isAuthenticated) {
      event.preventDefault();
      this.navMessage = 'Prijavite se da biste pristupili aplikaciji.';
      void this.router.navigate(['/']);
      return;
    }

    if (this.canOpenNotifications) {
      this.navMessage = '';
      return;
    }

    event.preventDefault();
    this.navMessage = 'Notifikacijama mogu pristupiti samo admin i glavni_racunovodja.';
    void this.router.navigate(['/home'], {
      queryParams: { accessDenied: 'notifikacije' },
    });
  }

  private async handleKeycloakCallback(): Promise<void> {
    if (!this.authService.hasKeycloakCallback()) {
      return;
    }

    this.navMessage = 'Login u toku...';
    this.isLoading = true;

    const callbackResult = await this.authService.handleKeycloakCallback();

    if (callbackResult.status === 'idle') {
      this.isLoading = false;
      this.navMessage = '';
      return;
    }

    if (callbackResult.status === 'error') {
      this.isLoading = false;
      this.navMessage = callbackResult.message;
      return;
    }

    try {
      await this.userService.getValidSession(callbackResult.accessToken);
    } catch (error) {
      console.warn('Backend session nije kreirana, nastavljam sa Bearer token loginom.', error);
    } finally {
      this.isLoading = false;
      this.navMessage = '';
      this.refreshAuthState();
      this.syncNotificationRefresh();
      await this.router.navigate(['/home']);
    }
  }

  private refreshAuthState(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.primaryRole = this.isLoggedIn ? this.authService.getPrimaryRole() : '';
  }

  private syncNotificationRefresh(): void {
    if (this.isLoggedIn && this.canOpenNotifications) {
      this.notificationService.startUnreadCountRefresh();
      return;
    }

    this.notificationService.stopUnreadCountRefresh();
  }
}
