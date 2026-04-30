import type { NextFunction, Request, RequestHandler, Response } from "express";

export type JwtPayload = {
  sub?: string;
  exp?: number;
  role?: string | string[];
  roles?: string | string[];
  realm_access?: {
    roles?: string[];
  };
  resource_access?: Record<string, { roles?: string[] }>;
  [key: string]: unknown;
};

export type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

export type RefreshSessionResult = {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  refreshExpiresIn?: number;
  user: JwtPayload;
};

export interface IAuthService {
  verifyBearerToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
  requireAuthentication(req: AuthenticatedRequest, res: Response, next: NextFunction): void;
  requireRole(...allowedRoles: string[]): RequestHandler;
  refreshSession(refreshToken: string): Promise<RefreshSessionResult>;
}
