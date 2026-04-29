import { Injectable } from '@angular/core';

export type ApiAccessResult = {
  ok: boolean;
  status: number;
  message: string;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly backendSessionUrl = 'http://localhost:3000/auth/session';
  private readonly backendLogoutUrl = 'http://localhost:3000/auth/logout';
  private readonly backendApiUrl = 'http://localhost:3000/api';

  private async fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  public async getValidSession(accessToken: string): Promise<void> {
    const sessionResponse = await this.fetchWithTimeout(this.backendSessionUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    });

    if (!sessionResponse.ok) {
      throw new Error('Backend nije kreirao session cookie.');
    }
  }

  public async logout(): Promise<void> {
    const response = await this.fetchWithTimeout(this.backendLogoutUrl, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Neuspjesan logout.');
    }
  }

  public async getProfile(): Promise<ApiAccessResult> {
    return this.getApiMessage('/profile');
  }

  public async getRoleMessage(path: string): Promise<ApiAccessResult> {
    return this.getApiMessage(path);
  }

  private async getApiMessage(path: string): Promise<ApiAccessResult> {
    const response = await this.fetchWithTimeout(`${this.backendApiUrl}${path}`, {
      method: 'GET',
      credentials: 'include',
    });

    let body: { message?: string; error?: string; user?: unknown } = {};

    try {
      body = (await response.json()) as typeof body;
    } catch {
      body = {};
    }

    return {
      ok: response.ok,
      status: response.status,
      message:
        body.message ||
        body.error ||
        (body.user ? 'Profil korisnika je uspjesno ucitan.' : 'Backend nije vratio poruku.'),
    };
  }
}
