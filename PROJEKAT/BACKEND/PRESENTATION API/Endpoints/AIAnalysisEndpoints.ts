import type { IAuthService } from "../../BLL/Interfaces/IAuthService";

const { AIAnalysisService } = require("../../BLL/Services/AIAnalysisService");
const { ReportService } = require("../../BLL/Services/ReportService");
const { BudgetService } = require("../../BLL/Services/BudgetService");

function registerAIAnalysisEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const aiAnalysisService = new AIAnalysisService();
  const reportService = new ReportService();
  const budgetService = new BudgetService();

  const allowedRoles = ["admin", "glavni_racunovodja", "finansijski_direktor"];

  /**
   * POST /api/ai/analize/baza
   *
   * Pokreće AI analizu cjelokupne baze troškova i budžeta.
   * Vraća izvještaj o kretanju troškova i predviđanje budžeta za naredni period.
   *
   * Pristup: admin, glavni_racunovodja, finansijski_direktor
   */
  app.post(
    "/api/ai/analize/baza",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (req: any, res: any) => {
      try {
        // Dohvati sve troškove (bez filtera datuma — cijela baza)
        const reportData = await reportService.getExpenseReport({});

        // Dohvati sve budžete
        const budgetData = await budgetService.getAllBudgets();

        // Pokreni AI analizu
        const analiza = await aiAnalysisService.analyzeFullDatabase(reportData, budgetData);

        return res.status(200).json(analiza);
      } catch (error: any) {
        if (_logger) {
          _logger("ERROR", "Greska pri AI analizi baze podataka", error);
        }
        return res.status(500).json({
          message: error?.message || "Greska pri pokretanju AI analize baze podataka.",
        });
      }
    }
  );
}

module.exports = { registerAIAnalysisEndpoints };
