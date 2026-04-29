import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiAccessResult, UserService } from '../../../services/user.service';

@Component({
  selector: 'app-role-access',
  imports: [CommonModule],
  templateUrl: './role-access.html',
  styleUrl: './role-access.css',
})
export class RoleAccessComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly userService = inject(UserService);

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
}
