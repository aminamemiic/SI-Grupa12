import type { Application, Response } from "express";
import type { IAuthService, AuthenticatedRequest } from "../../BLL/Interfaces/IAuthService";

export function registerUserEndpoints(app: Application, authService: IAuthService) {
  app.use("/api", authService.requireAuthentication);

  app.get("/api/profile", (req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ user: req.user });
  });

  app.get("/api/admin", authService.requireRole("admin"), (_req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ message: "Admin pristup odobren." });
  });

  app.get("/api/finansijski_direktor", authService.requireRole("finansijski_direktor"), (_req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ message: "Finansijski direktor pristup odobren." });
  });

  app.get("/api/glavni_racunovodja", authService.requireRole("glavni_racunovodja"), (_req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ message: "Glavni računovodja pristup odobren." });
  });

  app.get("/api/administrativni_radnik", authService.requireRole("administrativni_radnik"), (_req: AuthenticatedRequest, res: Response) => {
    res.status(200).json({ message: "Administrativni radnik pristup odobren." });
  });
  
}
