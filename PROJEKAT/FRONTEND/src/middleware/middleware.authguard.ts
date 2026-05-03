import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../environments/environment';

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
    `${environment.keycloakUrl}/realms/Grupa12SI/protocol/openid-connect/auth`;
  private readonly keycloakTokenUrl =
    `${environment.keycloakUrl}/realms/Grupa12SI/protocol/openid-connect/token`;
  private readonly keycloakLogoutUrl =
    `${environment.keycloakUrl}/realms/Grupa12SI/protocol/openid-connect/logout`;

  private readonly clientId = 'public';
  private readonly pkceVerifierKey = 'kc_pkce_verifier';
  private readonly authStateKey = 'kc_auth_state';
  private readonly accessTokenKey = 'kc_access_token';
  private readonly refreshTokenKey = 'kc_refresh_token';
  private readonly idTokenKey = 'kc_id_token';
  private readonly redirectUriKey = 'kc_redirect_uri';
  private readonly authStateSubject = new BehaviorSubject<boolean>(this.hasStoredTokens());
  public readonly authState$ = this.authStateSubject.asObservable();

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

  private getRedirectUri(): string {
    if (window.location.port === '4200' && ['127.0.0.1', '[::1]', '::1'].includes(window.location.hostname)) {
      return 'http://localhost:4200/';
    }

    return `${window.location.origin}/`;
  }

  private shouldUseCanonicalLocalhost(): boolean {
    return window.location.port === '4200' && ['127.0.0.1', '[::1]', '::1'].includes(window.location.hostname);
  }

  public hasKeycloakCallback(): boolean {
    const params = this.getCallbackParams();
    return Boolean(params.get('code') || params.get('error'));
  }

  public async loginWithKeycloak(): Promise<void> {
    if (this.shouldUseCanonicalLocalhost()) {
      window.location.replace(
        `http://localhost:4200${window.location.pathname}${window.location.search}${window.location.hash}`
      );
      return;
    }

    const redirectUri = this.getRedirectUri();
    const codeVerifier = this.generateRandomString(96);
    const codeChallenge = await this.createPkceChallenge(codeVerifier);
    const state = this.generateRandomString(32);

    sessionStorage.setItem(this.pkceVerifierKey, codeVerifier);
    sessionStorage.setItem(this.authStateKey, state);
    sessionStorage.setItem(this.redirectUriKey, redirectUri);

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
    const params = this.getCallbackParams();
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
      const redirectUri = sessionStorage.getItem(this.redirectUriKey) || this.getRedirectUri();
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
        return { status: 'error', message: 'Neuspjesna razmjena authorization code za access token.' };
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
      sessionStorage.removeItem(this.redirectUriKey);
      this.authStateSubject.next(true);
      history.replaceState({}, document.title, '/#/');

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
        message: error instanceof Error ? error.message : 'Greska pri loginu.',
      };
    }
  }

  private getCallbackParams(): URLSearchParams {
    const searchParams = new URLSearchParams(window.location.search);

    if (searchParams.get('code') || searchParams.get('error')) {
      return searchParams;
    }

    const hashQueryIndex = window.location.hash.indexOf('?');
    if (hashQueryIndex >= 0) {
      return new URLSearchParams(window.location.hash.slice(hashQueryIndex + 1));
    }

    return searchParams;
  }

  public logoutFromKeycloak(): void {
    const logoutUrl = this.getKeycloakLogoutUrl();
    this.clearStoredTokens();
    window.location.href = logoutUrl;
  }

  public getKeycloakLogoutUrl(): string {
    const redirectUri = this.getRedirectUri();
    const logoutQuery = new URLSearchParams({
      client_id: this.clientId,
      post_logout_redirect_uri: redirectUri,
    });

    const idTokenHint = sessionStorage.getItem(this.idTokenKey);
    if (idTokenHint) {
      logoutQuery.set('id_token_hint', idTokenHint);
    }

    return `${this.keycloakLogoutUrl}?${logoutQuery.toString()}`;
  }

  public clearStoredTokens(): void {
    sessionStorage.removeItem(this.accessTokenKey);
    sessionStorage.removeItem(this.refreshTokenKey);
    sessionStorage.removeItem(this.idTokenKey);
    sessionStorage.removeItem(this.authStateKey);
    sessionStorage.removeItem(this.pkceVerifierKey);
    sessionStorage.removeItem(this.redirectUriKey);
    this.authStateSubject.next(false);
  }

  public isAuthenticated(): boolean {
    return this.hasStoredTokens();
  }

  private hasStoredTokens(): boolean {
    return Boolean(sessionStorage.getItem(this.accessTokenKey) || sessionStorage.getItem(this.idTokenKey));
  }

  public getCurrentUserRoles(): string[] {
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const idToken = sessionStorage.getItem(this.idTokenKey);
    const tokens = [accessToken, idToken].filter((token): token is string => Boolean(token));

    if (tokens.length === 0) return [];

    try {
      const roleSet = new Set<string>();

      tokens.forEach((token) => {
        const payload = JSON.parse(this.decodeJwtPayload(token));
        this.collectNormalizedRoles(payload).forEach((role) => roleSet.add(role));
      });

      return Array.from(roleSet);
    } catch {
      return [];
    }
  }

  public getPrimaryRole(): string {
    const roles = this.getCurrentUserRoles();
    const priority = [
      'admin',
      'administrator',
      'administrativni_zaposlenik',
      'administrativni_radnik',
      'finansijski_direktor',
      'glavni_racunovodja',
    ];
    const hiddenRoles = new Set([
      'offline_access',
      'uma_authorization',
      'default_roles_grupa12si',
      'manage_account',
      'manage_account_links',
      'view_profile',
    ]);

    return (
      priority.find((role) => roles.includes(role)) ||
      roles.find((role) => !hiddenRoles.has(role)) ||
      ''
    );
  }

  public getRawRoleDebug(): string {
    const accessToken = sessionStorage.getItem(this.accessTokenKey);
    const idToken = sessionStorage.getItem(this.idTokenKey);
    const tokenDebug = [
      this.getTokenRoleDebug('access_token', accessToken),
      this.getTokenRoleDebug('id_token', idToken),
    ];

    return JSON.stringify(tokenDebug, null, 2);
  }

  public hasAnyRole(allowedRoles: string[]): boolean {
    const userRoles = this.getCurrentUserRoles();
    const normalizedAllowedRoles = allowedRoles.map((role) => this.normalizeRole(role));

    return userRoles.some((role) => normalizedAllowedRoles.includes(role));
  }

  private normalizeRole(role: string): string {
    return role
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, '_');
  }

  private collectNormalizedRoles(payload: any): string[] {
    const roleSet = new Set<string>();
    const addRole = (role: unknown) => {
      if (typeof role === 'string' && role.trim().length > 0) {
        roleSet.add(this.normalizeRole(role));
      }
    };
    const addRoles = (roles: unknown) => {
      if (Array.isArray(roles)) {
        roles.forEach(addRole);
        return;
      }

      addRole(roles);
    };

    addRoles(payload.roles);
    addRoles(payload.role);
    addRoles(payload.realm_access?.roles);
    addRoles(payload.resource_access?.[this.clientId]?.roles);

    if (payload.resource_access && typeof payload.resource_access === 'object') {
      Object.values(payload.resource_access).forEach((resource: any) => addRoles(resource?.roles));
    }

    return Array.from(roleSet);
  }

  private getTokenRoleDebug(tokenName: string, token: string | null): Record<string, unknown> {
    if (!token) {
      return {
        token: tokenName,
        present: false,
      };
    }

    try {
      const payload = JSON.parse(this.decodeJwtPayload(token));

      return {
        token: tokenName,
        present: true,
        issuer: payload.iss ?? null,
        audience: payload.aud ?? null,
        authorized_party: payload.azp ?? null,
        preferred_username: payload.preferred_username ?? null,
        realm_access: payload.realm_access ?? null,
        resource_access: payload.resource_access ?? null,
        roles: payload.roles ?? null,
        role: payload.role ?? null,
        normalized_roles: this.collectNormalizedRoles(payload),
      };
    } catch {
      return {
        token: tokenName,
        present: true,
        error: 'Token je spremljen, ali ga frontend ne moze dekodirati.',
      };
    }
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
