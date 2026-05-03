import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthGuardService } from '../middleware/middleware.authguard';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly authService = inject(AuthGuardService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  public readonly expenseRoles = ['admin', 'administrativni_radnik', 'administrativni_zaposlenik'];
  public readonly adminConsoleUrl = 'https://keycloak-production-4c61.up.railway.app/';
  public isLoading = false;
  public navMessage = '';
  public isLoggedIn = false;
  public primaryRole = '';

  public ngOnInit(): void {
    if (window.location.hostname === '127.0.0.1' && window.location.port === '4200') {
      window.location.replace(`http://localhost:4200${window.location.pathname}${window.location.search}${window.location.hash}`);
      return;
    }

    this.refreshAuthState();
    this.authService.authState$.subscribe((isAuthenticated) => {
      this.isLoggedIn = isAuthenticated;
      this.primaryRole = isAuthenticated ? this.authService.getPrimaryRole() : '';
    });

    void this.handleKeycloakCallback();
  }

  public get canOpenExpenses(): boolean {
    return this.authService.hasAnyRole(this.expenseRoles);
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
      return;
    }

    event.preventDefault();
    this.navMessage = 'Formi za unos troskova mogu pristupiti samo admin i administrativni_radnik.';
    void this.router.navigate(['/home'], {
      queryParams: { accessDenied: 'troskovi' },
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
      await this.router.navigate(['/home']);
    }
  }

  private refreshAuthState(): void {
    this.isLoggedIn = this.authService.isAuthenticated();
    this.primaryRole = this.isLoggedIn ? this.authService.getPrimaryRole() : '';
  }
}
