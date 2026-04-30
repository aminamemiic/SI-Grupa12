import { Injectable } from '@angular/core';

export type KeycloakCallbackResult =
  | { status: 'idle' }
  | { status: 'error'; message: string }
  | {
      status: 'success';
      accessToken: string;
      refreshToken?: string;
      idToken?: string;
    };

@Injectable({ providedIn: 'root' })
export class AuthGuardService {
  private readonly keycloakAuthorizeUrl =
    'http://localhost:8080/realms/Grupa12SI/protocol/openid-connect/auth';
  private readonly keycloakTokenUrl =
    'http://localhost:8080/realms/Grupa12SI/protocol/openid-connect/token';
  private readonly keycloakLogoutUrl =
    'http://localhost:8080/realms/Grupa12SI/protocol/openid-connect/logout';

  private readonly clientId = 'public';
  private readonly pkceVerifierKey = 'kc_pkce_verifier';
  private readonly authStateKey = 'kc_auth_state';
  private readonly accessTokenKey = 'kc_access_token';
  private readonly refreshTokenKey = 'kc_refresh_token';
  private readonly idTokenKey = 'kc_id_token';

  private async fetchWithTimeout(input: RequestInfo | URL, init: RequestInit, timeoutMs = 15000): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

    try {
      return await fetch(input, { ...init, signal: controller.signal });
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  private generateRandomString(length: number): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
    const random = new Uint8Array(length);
    crypto.getRandomValues(random);
    return Array.from(random, (value) => charset[value % charset.length]).join('');
  }

  private base64UrlEncode(bytes: Uint8Array): string {
    return btoa(String.fromCharCode(...bytes))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/g, '');
  }

  private async createPkceChallenge(verifier: string): Promise<string> {
    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier));
    return this.base64UrlEncode(new Uint8Array(digest));
  }

  public async loginWithKeycloak(): Promise<void> {
    const redirectUri = `${window.location.origin}/`;
    const codeVerifier = this.generateRandomString(96);
    const codeChallenge = await this.createPkceChallenge(codeVerifier);
    const state = this.generateRandomString(32);

    sessionStorage.setItem(this.pkceVerifierKey, codeVerifier);
    sessionStorage.setItem(this.authStateKey, state);

    const query = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid profile email',
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
      state,
    });

    window.location.href = `${this.keycloakAuthorizeUrl}?${query.toString()}`;
  }

  public async handleKeycloakCallback(): Promise<KeycloakCallbackResult> {
    const params = new URLSearchParams(window.location.search);
    const error = params.get('error');
    const errorDescription = params.get('error_description');
    const code = params.get('code');
    const state = params.get('state');

    if (error) {
      return { status: 'error', message: errorDescription || error };
    }

    if (!code) {
      return { status: 'idle' };
    }

    const expectedState = sessionStorage.getItem(this.authStateKey);
    const codeVerifier = sessionStorage.getItem(this.pkceVerifierKey);

    if (!expectedState || expectedState !== state || !codeVerifier) {
      return { status: 'error', message: 'Neispravan Keycloak callback state.' };
    }

    try {
      const redirectUri = `${window.location.origin}/`;
      const tokenRequestBody = new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: this.clientId,
        code,
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      });

      const tokenResponse = await this.fetchWithTimeout(this.keycloakTokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: tokenRequestBody.toString(),
      });

      if (!tokenResponse.ok) {
        return { status: 'error', message: 'Neuspješna razmjena authorization code za access token.' };
      }

      const tokens = (await tokenResponse.json()) as {
        access_token?: string;
        refresh_token?: string;
        id_token?: string;
      };

      if (!tokens.access_token) {
        return { status: 'error', message: 'Keycloak nije vratio access token.' };
      }

      sessionStorage.setItem(this.accessTokenKey, tokens.access_token);

      if (tokens.refresh_token) {
        sessionStorage.setItem(this.refreshTokenKey, tokens.refresh_token);
      }

      if (tokens.id_token) {
        sessionStorage.setItem(this.idTokenKey, tokens.id_token);
      }

      sessionStorage.removeItem(this.authStateKey);
      sessionStorage.removeItem(this.pkceVerifierKey);
      history.replaceState({}, document.title, '/');

      return {
        status: 'success',
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        return { status: 'error', message: 'Zahtjev je istekao. Provjeri da li su Keycloak i backend pokrenuti.' };
      }

      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Greška pri loginu.',
      };
    }
  }

  public logoutFromKeycloak(): void {
    const redirectUri = `${window.location.origin}/`;
    const logoutQuery = new URLSearchParams({
      client_id: this.clientId,
      post_logout_redirect_uri: redirectUri,
    });

    const idTokenHint = sessionStorage.getItem(this.idTokenKey);
    if (idTokenHint) {
      logoutQuery.set('id_token_hint', idTokenHint);
    }

    this.clearStoredTokens();
    window.location.href = `${this.keycloakLogoutUrl}?${logoutQuery.toString()}`;
  }

  public clearStoredTokens(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.idTokenKey);
    sessionStorage.removeItem(this.authStateKey);
    sessionStorage.removeItem(this.pkceVerifierKey);
  }

  public isAuthenticated(): boolean {
    return Boolean(sessionStorage.getItem(this.accessTokenKey) || sessionStorage.getItem(this.idTokenKey));
  }

  public getCurrentUserRoles(): string[] {
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const idToken = sessionStorage.getItem(this.idTokenKey);
    const token = accessToken || idToken;

    if (!token) return [];

    try {
      const payload = JSON.parse(this.decodeJwtPayload(token));
      const clientRoles = payload.resource_access?.[this.clientId]?.roles;

      if (!Array.isArray(clientRoles)) {
        return [];
      }

      return clientRoles.filter(
        (role: unknown): role is string => typeof role === 'string' && role.trim().length > 0
      );
    } catch {
      return [];
    }
  }

  public hasAnyRole(allowedRoles: string[]): boolean {
    const userRoles = this.getCurrentUserRoles().map((role) => role.toLowerCase());
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    return userRoles.some((role) => normalizedAllowedRoles.includes(role));
  }

  private decodeJwtPayload(token: string): string {
    const payload = token.split('.')[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=');

    return decodeURIComponent(
      Array.from(atob(padded), (character) => `%${character.charCodeAt(0).toString(16).padStart(2, '0')}`).join('')
    );
  }
}
