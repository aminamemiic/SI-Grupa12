import { Component, OnInit, inject } from '@angular/core';
import { AuthGuardService } from '../../../middleware/middleware.authguard';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage implements OnInit {
  private readonly authGuardService = inject(AuthGuardService);
  private readonly userService = inject(UserService);

  public errorMessage = '';
  public isLoading = false;
  public infoMessage = '';
  public loadingMessage = '';

  public ngOnInit(): void {
    void this.handleKeycloakCallback();
  }

  public async loginWithKeycloak(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';
    this.loadingMessage = '';

    await this.authGuardService.loginWithKeycloak();
  }

  public async logoutFromBackend(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';
    this.loadingMessage = 'Logout u toku...';
    this.isLoading = true;

    try {
      await this.userService.logout();
      this.authGuardService.logoutFromKeycloak();
      return;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.errorMessage = 'Logout timeout. Provjeri da li je backend pokrenut.';
      } else {
        this.errorMessage = error instanceof Error ? error.message : 'Greška pri logoutu.';
      }
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }

  private async handleKeycloakCallback(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';
    this.loadingMessage = '';
    this.isLoading = false;

    let callbackResult;
    try {
      callbackResult = await this.authGuardService.handleKeycloakCallback();
    } catch {
      this.errorMessage = 'Greška pri obradi Keycloak callback-a.';
      this.isLoading = false;
      this.loadingMessage = '';
      return;
    }

    if (callbackResult.status === 'idle') {
      this.isLoading = false;
      this.loadingMessage = '';
      return;
    }

    if (callbackResult.status === 'error') {
      this.errorMessage = callbackResult.message;
      this.isLoading = false;
      this.loadingMessage = '';
      return;
    }

    this.isLoading = true;
    this.loadingMessage = 'Login u toku...';

    try {
      await this.userService.getValidSession(callbackResult.accessToken);
      this.infoMessage = 'Session kreirana na backendu.';
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.errorMessage = 'Zahtjev je istekao. Provjeri da li su Keycloak i backend pokrenuti.';
      } else {
        this.errorMessage = error instanceof Error ? error.message : 'Greška pri loginu.';
      }
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }
}
