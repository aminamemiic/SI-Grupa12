import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiAccessResult, UserService } from '../../../services/user.service';
import { AuthGuardService } from '../../../middleware/middleware.authguard';

@Component({
  selector: 'app-role-access',
  imports: [CommonModule],
  templateUrl: './role-access.html',
  styleUrl: './role-access.css',
})
export class RoleAccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);
  private readonly authService = inject(AuthGuardService);

  public title = '';
  public isLoading = true;
  public result?: ApiAccessResult;

  public async ngOnInit(): Promise<void> {
    this.title = this.route.snapshot.data['title'] || 'Provjera pristupa';
    const apiPath = this.route.snapshot.data['apiPath'];

    if (typeof apiPath !== 'string') {
      this.result = {
        ok: false,
        status: 0,
        message: 'Frontend ruta nije pravilno konfigurisana.',
      };
      this.isLoading = false;
      return;
    }

    const allowedRoles = this.route.snapshot.data['allowedRoles'];
    if (Array.isArray(allowedRoles)) {
      this.result = this.getLocalAccessResult(apiPath, allowedRoles);
      this.isLoading = false;
      return;
    }

    try {
      this.result =
        apiPath === '/profile'
          ? await this.userService.getProfile()
          : await this.userService.getRoleMessage(apiPath);
    } catch (error) {
      this.result = {
        ok: false,
        status: 0,
        message: error instanceof Error ? error.message : 'Zahtjev prema backendu nije uspio.',
      };
    } finally {
      this.isLoading = false;
    }
  }

  private getLocalAccessResult(apiPath: string, allowedRoles: string[]): ApiAccessResult {
    if (!this.authService.isAuthenticated()) {
      return {
        ok: false,
        status: 401,
        message: 'Korisnik nije autentifikovan.',
      };
    }

    if (!this.authService.hasAnyRole(allowedRoles)) {
      return {
        ok: false,
        status: 403,
        message: 'Nemate dozvolu za ovaj resurs.',
      };
    }

    return {
      ok: true,
      status: 200,
      message: this.getSuccessMessage(apiPath),
    };
  }

  private getSuccessMessage(apiPath: string): string {
    const messages: Record<string, string> = {
      '/admin': 'Admin pristup odobren.',
      '/finansijski_direktor': 'Finansijski direktor pristup odobren.',
      '/glavni_racunovodja': 'Glavni racunovodja pristup odobren.',
      '/administrativni_radnik': 'Administrativni radnik pristup odobren.',
    };

    return messages[apiPath] || 'Pristup odobren.';
  }
}
