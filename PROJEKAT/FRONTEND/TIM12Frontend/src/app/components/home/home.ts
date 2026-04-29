import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { AuthGuardService } from '../../../middleware/middleware.authguard';

@Component({
  selector: 'app-home',
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class HomeComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthGuardService);

  public readonly expenseRoles = ['admin', 'administrativni_radnik'];

  public currentRoles: string[] = [];
  public accessNotice = '';

  public ngOnInit(): void {
    this.currentRoles = this.authService.getCurrentUserRoles();

    if (this.route.snapshot.queryParamMap.get('accessDenied') === 'troskovi') {
      this.accessNotice = 'Pristup formi za unos troskova je dozvoljen samo ulogama admin i administrativni_radnik.';
    }
  }

  public get canOpenExpenses(): boolean {
    return this.authService.hasAnyRole(this.expenseRoles);
  }

  public idiNaTroskove(): void {
    if (!this.canOpenExpenses) {
      this.accessNotice = 'Pristup formi za unos troskova je dozvoljen samo ulogama admin i administrativni_radnik.';
      return;
    }

    void this.router.navigate(['/troskovi']);
  }
}
