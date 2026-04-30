import type { Application, Request, Response } from "express";
import type { IAuthService, AuthenticatedRequest } from "../../BLL/Interfaces/IAuthService";

type Logger = (level: string, message: string, error?: unknown) => void;

async function regenerateAuthenticatedSession(
  req: Request & { session?: any },
  user: AuthenticatedRequest["user"],
  writeLog: Logger
) {
  if (!req.session || !user) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    req.session.regenerate((error: Error | null) => {
      if (error) {
        reject(error);
        return;
      }

      req.session.user = user;

      if (user.exp) {
        const ttl = Math.max(0, (user.exp * 1000) - Date.now());
        req.session.cookie.maxAge = ttl;
      }

      resolve();
    });
  }).catch((error: unknown) => {
    writeLog("ERROR", "Greška pri session regenerate", error);
    throw error;
  });
}

export function registerSessionEndpoints(
  app: Application,
  authService: IAuthService,
  writeLog: Logger,
  sessionCookieName: string
) {
  app.get("/auth/session", authService.verifyBearerToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      await regenerateAuthenticatedSession(req as Request & { session?: any }, req.user, writeLog);
    } catch {
      res.status(500).json({ error: "Ne mogu kreirati session." });
      return;
    }

    res.status(200).json({ message: "Session kreirana.", user: req.user });
  });

  app.post("/auth/logout", (req: Request & { session?: any }, res: Response) => {
    if (!req.session) {
      res.status(204).send();
      return;
    }

    req.session.destroy((error: Error | null) => {
      if (error) {
        writeLog("ERROR", "Greška pri gašenju session-a", error);
        res.status(500).json({ error: "Ne mogu ugasiti session." });
        return;
      }

      res.clearCookie(sessionCookieName);
      res.status(204).send();
    });
  });

  app.post("/auth/refresh", async (req: Request & { session?: any }, res: Response) => {
    try {
      const authHeader = req.headers.authorization;
      const bearerToken = authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.substring(7).trim()
        : undefined;

      const refreshToken = req.body?.refreshToken || bearerToken;

      if (!refreshToken || typeof refreshToken !== "string") {
        res.status(400).json({ error: "Refresh token je obavezan." });
        return;
      }

      const refreshed = await authService.refreshSession(refreshToken);

      await regenerateAuthenticatedSession(req, refreshed.user, writeLog);

      res.status(200).json({
        message: "Session osvježena.",
        user: refreshed.user,
        accessToken: refreshed.accessToken,
        refreshToken: refreshed.refreshToken,
        expiresIn: refreshed.expiresIn,
        refreshExpiresIn: refreshed.refreshExpiresIn,
        sessionCookieName,
      });
    } catch (error) {
      writeLog("WARN", "Greška pri osvježavanju session-a", error);
      res.status(401).json({ error: "Refresh token nije validan ili je istekao." });
    }
  });
}
