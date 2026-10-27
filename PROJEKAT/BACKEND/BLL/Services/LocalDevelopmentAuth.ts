import jwt from "jsonwebtoken";
import type { Application } from "express";
import type { JwtPayload } from "../Interfaces/IAuthService";

const ISSUER = "companydashboard-local-development";
const AUDIENCE = "companydashboard-local";

/** Explicitly enabled local development login; never available in production. */
export class LocalDevelopmentAuth {
  private constructor(private readonly secret: string) {}

  static fromEnvironment(env: NodeJS.ProcessEnv): LocalDevelopmentAuth | undefined {
    if (env.LOCAL_AUTH_ENABLED !== "true") return undefined;
    if (env.NODE_ENV !== "development") {
      throw new Error("LOCAL_AUTH_ENABLED je dozvoljen samo uz NODE_ENV=development.");
    }
    if (!env.SESSION_SECRET || env.SESSION_SECRET.length < 32) {
      throw new Error("Lokalna prijava zahtijeva SESSION_SECRET od najmanje 32 znaka.");
    }
    return new LocalDevelopmentAuth(env.SESSION_SECRET);
  }

  async verifyToken(token: string): Promise<JwtPayload> {
    return jwt.verify(token, this.secret, {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    }) as JwtPayload;
  }

  registerEndpoints(app: Application, frontendOrigin: string): void {
    app.post("/auth/local-login", (req, res) => {
      if (req.headers.origin !== frontendOrigin) {
        res.status(403).json({ error: "Lokalna prijava je dostupna samo iz lokalnog frontenda." });
        return;
      }
      const accessToken = jwt.sign({
        sub: "00000000-0000-4000-8000-000000000012",
        preferred_username: "local-admin",
        email: "local-admin@example.test",
        name: "Lokalni administrator",
        given_name: "Lokalni",
        family_name: "Administrator",
        realm_access: { roles: ["admin"] },
      }, this.secret, {
        algorithm: "HS256",
        issuer: ISSUER,
        audience: AUDIENCE,
        expiresIn: "1h",
      });
      res.setHeader("Cache-Control", "no-store");
      res.json({ accessToken });
    });
  }
}
