import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthGuardService } from '../middleware/middleware.authguard';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  private readonly authService = inject(AuthGuardService);
  private readonly userService = inject(UserService);
  private readonly router = inject(Router);

  public readonly expenseRoles = ['admin', 'administrativni_radnik'];
  public isLoading = false;
  public navMessage = '';

  public get canOpenExpenses(): boolean {
    return this.authService.hasAnyRole(this.expenseRoles);
  }

  public async signIn(): Promise<void> {
    this.navMessage = '';
    await this.authService.loginWithKeycloak();
  }

  public async signOut(): Promise<void> {
    this.navMessage = '';
    this.isLoading = true;

    try {
      await this.userService.logout();
      this.authService.logoutFromKeycloak();
    } catch (error) {
      this.isLoading = false;
      this.navMessage = error instanceof Error ? error.message : 'Logout nije uspio.';
    }
  }

  public openExpensesTab(event: Event): void {
    if (this.canOpenExpenses) {
      return;
    }

    event.preventDefault();
    this.navMessage = 'Formi za unos troskova mogu pristupiti samo admin i administrativni_radnik.';
    void this.router.navigate(['/home'], {
      queryParams: { accessDenied: 'troskovi' },
    });
  }
}
