import type { IAuthService } from "../../BLL/Interfaces/IAuthService";

const { BudgetService } = require("../../BLL/Services/BudgetService");

function registerBudgetEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const budgetService = new BudgetService();
  const viewRoles = ["admin", "glavni_racunovodja", "finansijski_direktor"];
  const editRoles = ["admin", "glavni_racunovodja"];
  const approvalRoles = ["admin", "finansijski_direktor"];

  app.get(
    "/api/budzeti",
    authService.requireAuthentication,
    authService.requireRole(...viewRoles),
    async (_req: any, res: any) => {
      try {
        const budgets = await budgetService.getAllBudgets();
        return res.status(200).json(budgets);
      } catch (error: any) {
        console.error("Greska pri dohvatu budzeta:", error);
        return res.status(500).json({ message: "Greska pri dohvatu budzeta." });
      }
    }
  );

  app.get(
    "/api/budzeti/reference-data",
    authService.requireAuthentication,
    authService.requireRole(...viewRoles),
    async (_req: any, res: any) => {
      try {
        const referenceData = await budgetService.getReferenceData();
        return res.status(200).json(referenceData);
      } catch (error: any) {
        console.error("Greska pri dohvatu referentnih podataka za budzete:", error);
        return res.status(500).json({ message: "Greska pri dohvatu podataka za formu." });
      }
    }
  );

  app.get(
    "/api/budzeti/:id",
    authService.requireAuthentication,
    authService.requireRole(...viewRoles),
    async (req: any, res: any) => {
      try {
        const budget = await budgetService.getBudgetById(req.params.id);
        if (!budget) {
          return res.status(404).json({ message: "Budzet ne postoji." });
        }

        return res.status(200).json(budget);
      } catch (error: any) {
        console.error("Greska pri dohvatu budzeta:", error);
        return res.status(500).json({ message: "Greska pri dohvatu budzeta." });
      }
    }
  );

  app.post(
    "/api/budzeti",
    authService.requireAuthentication,
    authService.requireRole(...editRoles),
    async (req: any, res: any) => {
      try {
        const createdBudget = await budgetService.createBudget(req.body, req.user);
        return res.status(201).json(createdBudget);
      } catch (error: any) {
        console.error("Greska pri kreiranju budzeta:", error);
        return res.status(400).json({ message: error.message || "Greska pri kreiranju budzeta." });
      }
    }
  );

  app.put(
    "/api/budzeti/:id",
    authService.requireAuthentication,
    authService.requireRole(...editRoles),
    async (req: any, res: any) => {
      try {
        const updatedBudget = await budgetService.updateBudget(req.params.id, req.body, req.user);
        return res.status(200).json(updatedBudget);
      } catch (error: any) {
        console.error("Greska pri azuriranju budzeta:", error);
        return res.status(400).json({ message: error.message || "Greska pri azuriranju budzeta." });
      }
    }
  );

  app.patch(
  "/api/budzeti/:id/status",
  authService.requireAuthentication,
  authService.requireRole(...approvalRoles),
  async (req: any, res: any) => {
    try {
      const updatedBudget = await budgetService.updateBudgetStatus(
        req.params.id,
        req.body.statusOdobrenja,
        req.user
      );

      return res.status(200).json(updatedBudget);
    } catch (error: any) {
      console.error("Greska pri promjeni statusa budzeta:", error);

      if (error.message === "Budzet ne postoji.") {
        return res.status(404).json({ message: error.message });
      }

      return res.status(400).json({
        message: error.message || "Greska pri promjeni statusa budzeta.",
      });
    }
  }
);
}

module.exports = { registerBudgetEndpoints };

