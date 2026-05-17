import type { IAuthService } from "../../BLL/Interfaces/IAuthService";

const { DataOverviewService } = require("../../BLL/Services/DataOverviewService");

function registerDataOverviewEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const dataOverviewService = new DataOverviewService();

  app.get(
    "/api/podaci/pregled",
    authService.requireAuthentication,
    authService.requireRole("admin", "glavni_racunovodja", "finansijski_direktor"),
    async (_req: any, res: any) => {
      try {
        const overview = await dataOverviewService.getDataOverview();
        return res.status(200).json(overview);
      } catch (error: any) {
        console.error("Greska pri dohvatu pregleda podataka:", error);
        return res.status(500).json({
          message: "Greska pri dohvatu pregleda podataka.",
        });
      }
    }
  );
}

module.exports = { registerDataOverviewEndpoints };

