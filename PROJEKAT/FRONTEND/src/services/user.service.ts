import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

export type ApiAccessResult = {
  ok: boolean;
  status: number;
  message: string;
};

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly baseUrl = environment.apiUrl.replace('/api', '');
  private readonly backendSessionUrl = `${this.baseUrl}/auth/session`;
  private readonly backendLogoutUrl = `${this.baseUrl}/auth/logout`;
  private readonly backendApiUrl = environment.apiUrl;
  private readonly accessTokenKey = 'kc_access_token';


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
    const headers: HeadersInit = {};
    const accessToken = sessionStorage.getItem(this.accessTokenKey);

    if (accessToken) {
      headers['Authorization'] = `Bearer ${accessToken}`;
    }

    const response = await this.fetchWithTimeout(`${this.backendApiUrl}${path}`, {
      method: 'GET',
      headers,
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
