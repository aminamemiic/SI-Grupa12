const jwt = require("jsonwebtoken");
const jwksClient = require("jwks-rsa");

import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest, IAuthService, JwtPayload, RefreshSessionResult } from "../Interfaces/IAuthService";

type AuthServiceConfig = {
  jwtIssuer: string;
  jwtAudience: string;
  jwksUri: string;
  keycloakUrl: string;
  keycloakRealm: string;
  keycloakClientId: string;
  keycloakClientSecret?: string;
};

type Logger = (level: string, message: string, error?: unknown) => void;

export class AuthService implements IAuthService {
  private readonly keycloakJwksClient: any;
  private readonly config: AuthServiceConfig;
  private readonly logger: Logger;

  constructor(config: AuthServiceConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;

    this.keycloakJwksClient = jwksClient({
      jwksUri: config.jwksUri,
      cache: true,
      cacheMaxEntries: 5,
      cacheMaxAge: 10 * 60 * 1000,
      rateLimit: true,
      jwksRequestsPerMinute: 10,
      timeout: 30000,
    });
  }

  private normalizeRole(role: string): string {
    return role
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[\s-]+/g, "_");
  }

  private normalizeRoles(payload: JwtPayload): string[] {
    const roleSet = new Set<string>();
    const addRole = (role: unknown) => {
      if (typeof role === "string" && role.trim()) {
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

    if (payload.resource_access) {
      const configuredClientRoles = payload.resource_access[this.config.keycloakClientId]?.roles;
      addRoles(configuredClientRoles);

      Object.values(payload.resource_access).forEach((resource) => addRoles(resource?.roles));
    }

    return Array.from(roleSet);
  }

  private getSigningKey = (
    header: { kid?: string },
    callback: (error: Error | null, key?: string) => void
  ) => {
    if (!header.kid) {
      callback(new Error("JWT token nema kid header."));
      return;
    }

    this.keycloakJwksClient.getSigningKey(header.kid, (error: Error | null, key: any) => {
      if (error) {
        callback(error);
        return;
      }

      const signingKey = key?.getPublicKey?.();
      if (!signingKey) {
        callback(new Error("Ne mogu dobiti javni ključ iz Keycloak JWKS endpointa."));
        return;
      }

      callback(null, signingKey);
    });
  };

  private verifyToken(token: string): Promise<JwtPayload> {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.getSigningKey,
        {
          algorithms: ["RS256"],
          issuer: this.config.jwtIssuer,
          audience: this.config.jwtAudience,
        },
        (error: Error | null, decoded?: JwtPayload | string) => {
          if (error || !decoded || typeof decoded === "string") {
            reject(error || new Error("Token payload nije ispravan."));
            return;
          }

          resolve(decoded);
        }
      );
    });
  }

  public verifyBearerToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Nedostaje validan Bearer token." });
      return;
    }

    const token = authHeader.substring(7).trim();

    this.verifyToken(token)
      .then((decoded) => {
        req.user = decoded;

        const sessionRequest = req as AuthenticatedRequest & { session?: any };
        if (sessionRequest.session) {
          sessionRequest.session.user = decoded;

          if (decoded.exp) {
            const ttl = Math.max(0, (decoded.exp * 1000) - Date.now());
            sessionRequest.session.cookie.maxAge = ttl;
          }
        }

        next();
      })
      .catch((error: unknown) => {
        this.logger(
          "WARN",
          "Nevalidan Keycloak JWT token.",
          error || new Error("Token payload nije ispravan.")
        );
        res.status(401).json({ error: "Token nije validan ili je istekao." });
      });
  };

  public requireAuthentication = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const sessionRequest = req as AuthenticatedRequest & { session?: any };
    const sessionUser = sessionRequest.session?.user as JwtPayload | undefined;

    if (sessionUser) {
      req.user = sessionUser;
      next();
      return;
    }

    this.verifyBearerToken(req, res, next);
  };

  public requireRole(...allowedRoles: string[]) {
    const normalizedAllowedRoles = allowedRoles.map((role) => this.normalizeRole(role));

    const checkRole = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (!req.user) {
        res.status(401).json({ error: "Korisnik nije autentifikovan." });
        return;
      }

      const userRoles = this.normalizeRoles(req.user);
      const hasRole = userRoles.some((role) => normalizedAllowedRoles.includes(role));

      if (!hasRole) {
        res.status(403).json({ error: "Nemate dozvolu za ovaj resurs." });
        return;
      }

      next();
    };

    return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
      if (req.user) {
        checkRole(req, res, next);
        return;
      }

      this.requireAuthentication(req, res, (error?: unknown) => {
        if (error) {
          next(error);
          return;
        }

        checkRole(req, res, next);
        return;
      });
    };
  }

  public async refreshSession(refreshToken: string): Promise<RefreshSessionResult> {
    const tokenEndpoint = `${this.config.keycloakUrl}/realms/${this.config.keycloakRealm}/protocol/openid-connect/token`;

    const form = new URLSearchParams();
    form.set("grant_type", "refresh_token");
    form.set("client_id", this.config.keycloakClientId);
    form.set("refresh_token", refreshToken);

    if (this.config.keycloakClientSecret) {
      form.set("client_secret", this.config.keycloakClientSecret);
    }

    const response = await fetch(tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: form.toString(),
    });

    if (!response.ok) {
      const errorText = await response.text();
      this.logger("WARN", "Keycloak refresh token zahtjev nije uspio.", new Error(errorText));
      throw new Error("Refresh token nije validan ili je istekao.");
    }

    const tokens = await response.json() as {
      access_token?: string;
      refresh_token?: string;
      expires_in?: number;
      refresh_expires_in?: number;
    };

    if (!tokens.access_token) {
      throw new Error("Keycloak nije vratio novi access token.");
    }

    const user = await this.verifyToken(tokens.access_token);

    return {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      refreshExpiresIn: tokens.refresh_expires_in,
      user,
    };
  }
}
