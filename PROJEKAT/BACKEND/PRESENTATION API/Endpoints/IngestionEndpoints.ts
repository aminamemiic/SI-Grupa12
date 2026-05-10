import type { IAuthService } from "../../BLL/Interfaces/IAuthService";

const multer = require("multer");
const { IngestionService } = require("../../BLL/Services/IngestionService");

function registerIngestionEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const ingestionService = new IngestionService();
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
  const requireImportRole = authService.requireRole("admin", "administrativni_radnik");

  app.post(
    "/api/troskovi/uvoz/preview",
    authService.requireAuthentication,
    requireImportRole,
    upload.single("file"),
    async (req: any, res: any) => {
      try {
        if (!req.file) {
          return res.status(400).json({ message: "Fajl za uvoz je obavezan." });
        }

        const preview = await ingestionService.previewImport({
          originalName: req.file.originalname,
          mimetype: req.file.mimetype,
          buffer: req.file.buffer,
        });

        return res.status(200).json(preview);
      } catch (error: any) {
        console.error("Greška pri preview uvozu troškova:", error);
        return res.status(400).json({
          message: error.message || "Greška pri preview uvozu troškova.",
        });
      }
    }
  );

  app.post(
    "/api/troskovi/uvoz/potvrdi",
    authService.requireAuthentication,
    requireImportRole,
    async (req: any, res: any) => {
      try {
        const result = await ingestionService.confirmImport(req.body, req.user);
        const statusCode = result.skippedCount > 0 ? 207 : 201;
        return res.status(statusCode).json(result);
      } catch (error: any) {
        console.error("Greška pri potvrdi uvoza troškova:", error);
        return res.status(400).json({
          message: error.message || "Greška pri potvrdi uvoza troškova.",
        });
      }
    }
  );

  app.get(
    "/api/troskovi/uvoz/historija",
    authService.requireAuthentication,
    requireImportRole,
    async (_req: any, res: any) => {
      try {
        const history = await ingestionService.getImportHistory();
        return res.status(200).json(history);
      } catch (error: any) {
        console.error("Greška pri dohvatu historije uvoza troškova:", error);
        return res.status(500).json({
          message: "Greška pri dohvatu historije uvoza troškova.",
        });
      }
    }
  );
}

module.exports = { registerIngestionEndpoints };
