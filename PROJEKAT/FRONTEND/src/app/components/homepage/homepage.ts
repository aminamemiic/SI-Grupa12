import { Component, inject } from '@angular/core';
import { AuthGuardService } from '../../../middleware/middleware.authguard';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-homepage',
  imports: [],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {
  private readonly authGuardService = inject(AuthGuardService);
  private readonly userService = inject(UserService);

  public readonly adminConsoleUrl = 'https://keycloak-production-4c61.up.railway.app/';
  public errorMessage = '';
  public isLoading = false;
  public infoMessage = '';
  public loadingMessage = '';

  public get isAdmin(): boolean {
    return this.authGuardService.hasAnyRole(['admin']);
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
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        this.errorMessage = 'Logout timeout. Provjeri da li je backend pokrenut.';
      } else {
        this.errorMessage = error instanceof Error ? error.message : 'Greska pri logoutu.';
      }
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }
}
