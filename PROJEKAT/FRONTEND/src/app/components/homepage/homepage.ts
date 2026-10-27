import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { AuthGuardService } from '../../../middleware/middleware.authguard';
import { UserService } from '../../../services/user.service';
import { environment } from '../../../environments/environment';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../ui/icon';

@Component({
  selector: 'app-homepage',
  imports: [RouterLink, IconComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class Homepage {
  private readonly authGuardService = inject(AuthGuardService);
  private readonly userService = inject(UserService);
  private readonly cdr = inject(ChangeDetectorRef);

  public readonly adminConsoleUrl = `${environment.keycloakUrl}/`;
  public readonly localAuth = !environment.production && environment.localAuth;
  public errorMessage = '';
  public isLoading = false;
  public infoMessage = '';
  public loadingMessage = '';

  public get isAdmin(): boolean {
    return this.authGuardService.hasAnyRole(['admin']);
  }

  public get isAuthenticated(): boolean { return this.authGuardService.isAuthenticated(); }

  public async loginWithKeycloak(): Promise<void> {
    this.errorMessage = '';
    this.infoMessage = '';
    this.loadingMessage = '';

    this.isLoading = true;
    try {
      await this.authGuardService.loginWithKeycloak();
    } catch (error) {
      this.errorMessage = error instanceof Error ? error.message : 'Prijava nije uspjela.';
    } finally {
      this.isLoading = false;
      this.cdr.markForCheck();
    }
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
        this.errorMessage = error instanceof Error ? error.message : 'Greška pri logoutu.';
      }
    } finally {
      this.isLoading = false;
      this.loadingMessage = '';
    }
  }
}
