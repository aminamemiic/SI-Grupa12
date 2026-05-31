import type { IAuthService } from "../../BLL/Interfaces/IAuthService";

const { AIAnalysisService } = require("../../BLL/Services/AIAnalysisService");
const { ReportService } = require("../../BLL/Services/ReportService");
const { BudgetService } = require("../../BLL/Services/BudgetService");
const { NotificationService } = require("../../BLL/Services/NotificationService");

function registerAIAnalysisEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const aiAnalysisService = new AIAnalysisService();
  const reportService = new ReportService();
  const budgetService = new BudgetService();
  const notificationService = new NotificationService();

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

  app.get(
    "/api/ai/dobavljaci/rast",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (_req: any, res: any) => {
      try {
        const reportData = await reportService.getExpenseReport({});
        return res.status(200).json(aiAnalysisService.getTopGrowingSuppliers(reportData));
      } catch (error: any) {
        if (_logger) _logger("ERROR", "Greska pri analizi rasta dobavljaca", error);
        return res.status(500).json({ message: error?.message || "Greska pri analizi rasta dobavljaca." });
      }
    }
  );

  app.post(
    "/api/ai/asistent/pitaj",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (req: any, res: any) => {
      try {
        const question = typeof req.body?.question === "string" ? req.body.question.trim() : "";
        if (!question) {
          return res.status(400).json({ message: "Pitanje je obavezno." });
        }

        const reportData = await reportService.getExpenseReport({});
        const budgetData = await budgetService.getAllBudgets();
        return res.status(200).json(await aiAnalysisService.askAssistantWithGemini(question, reportData, budgetData));
      } catch (error: any) {
        if (_logger) _logger("ERROR", "Greska pri AI asistentu", error);
        return res.status(500).json({ message: error?.message || "Greska pri AI asistentu." });
      }
    }
  );

  app.get(
    "/api/ai/executive-summary",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (_req: any, res: any) => {
      try {
        const reportData = await reportService.getExpenseReport({});
        const budgetData = await budgetService.getAllBudgets();
        return res.status(200).json(aiAnalysisService.getExecutiveSummary(reportData, budgetData));
      } catch (error: any) {
        if (_logger) _logger("ERROR", "Greska pri AI executive summary", error);
        return res.status(500).json({ message: error?.message || "Greska pri AI executive summary." });
      }
    }
  );

  app.get(
    "/api/ai/anomaly-explanation/:expenseId",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (req: any, res: any) => {
      try {
        const reportData = await reportService.getExpenseReport({});
        return res.status(200).json(aiAnalysisService.explainAnomaly(req.params.expenseId, reportData));
      } catch (error: any) {
        if (_logger) _logger("ERROR", "Greska pri objasnjenju anomalije", error);
        return res.status(500).json({ message: error?.message || "Greska pri objasnjenju anomalije." });
      }
    }
  );

  app.get(
    "/api/ai/cost-suggestions",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (_req: any, res: any) => {
      try {
        const reportData = await reportService.getExpenseReport({});
        const budgetData = await budgetService.getAllBudgets();
        return res.status(200).json(aiAnalysisService.getCostOptimizationSuggestions(reportData, budgetData));
      } catch (error: any) {
        if (_logger) _logger("ERROR", "Greska pri AI preporukama za ustedu", error);
        return res.status(500).json({ message: error?.message || "Greska pri AI preporukama za ustedu." });
      }
    }
  );

  app.get(
    "/api/ai/missing-recurring-expenses",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (_req: any, res: any) => {
      try {
        const reportData = await reportService.getExpenseReport({});
        const result = aiAnalysisService.detectMissingRecurringExpenses(reportData);
        await notificationService.createMissingRecurringExpenseNotifications(result.missingRecurringExpenses);
        return res.status(200).json(result);
      } catch (error: any) {
        if (_logger) _logger("ERROR", "Greska pri detekciji zaboravljenih troskova", error);
        return res.status(500).json({ message: error?.message || "Greska pri detekciji zaboravljenih troskova." });
      }
    }
  );

  app.get(
    "/api/ai/supplier-risk",
    authService.requireAuthentication,
    authService.requireRole(...allowedRoles),
    async (_req: any, res: any) => {
      try {
        const reportData = await reportService.getExpenseReport({});
        return res.status(200).json(aiAnalysisService.getSupplierDependencyRisk(reportData));
      } catch (error: any) {
        if (_logger) _logger("ERROR", "Greska pri analizi zavisnosti od dobavljaca", error);
        return res.status(500).json({ message: error?.message || "Greska pri analizi zavisnosti od dobavljaca." });
      }
    }
  );
}

module.exports = { registerAIAnalysisEndpoints };
