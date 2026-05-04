import type { IAuthService } from "../../BLL/Interfaces/IAuthService";
const { ExpenseService } = require("../../BLL/Services/ExpenseService");

function registerExpenseEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const expenseService = new ExpenseService();

  app.get("/api/troskovi", async (req: any, res: any) => {
    try {
      const expenses = await expenseService.getAllExpenses();
      return res.status(200).json(expenses);
    } catch (error: any) {
      console.error("Greška pri dohvatu troškova:", error);
      return res.status(500).json({
        message: "Greška pri dohvatu troškova.",
      });
    }
  });

  app.get("/api/troskovi/reference-data", async (req: any, res: any) => {
    try {
      const referenceData = await expenseService.getReferenceData();
      return res.status(200).json(referenceData);
    } catch (error: any) {
      console.error("Greška pri dohvatu referentnih podataka:", error);
      return res.status(500).json({
        message: "Greška pri dohvatu referentnih podataka.",
      });
    }
  });

  app.post("/api/troskovi", authService.requireAuthentication, authService.requireRole("admin", "administrativni_radnik", "administrativni_zaposlenik"), async (req: any, res: any) => {
    try {
      const createdExpense = await expenseService.createExpense(req.body, req.user);
      return res.status(201).json(createdExpense);
    } catch (error: any) {
      console.error("Greška pri kreiranju troška:", error);
      return res.status(400).json({
        message: error.message || "Greška pri kreiranju troška.",
      });
    }
  });

  app.put("/api/troskovi/:id", authService.requireAuthentication, authService.requireRole("admin", "administrativni_radnik", "administrativni_zaposlenik"), async (req: any, res: any) => {
    try {
      const updatedExpense = await expenseService.updateExpense(req.params.id, req.body);
      return res.status(200).json(updatedExpense);
    } catch (error: any) {
      console.error("Greška pri ažuriranju troška:", error);
      return res.status(400).json({
        message: error.message || "Greška pri ažuriranju troška.",
      });
    }
  });

  app.delete("/api/troskovi/:id", authService.requireAuthentication, authService.requireRole("admin", "administrativni_radnik", "administrativni_zaposlenik"), async (req: any, res: any) => {
    try {
      await expenseService.deleteExpense(req.params.id);
      return res.status(204).send();
    } catch (error: any) {
      console.error("Greška pri brisanju troška:", error);
      return res.status(400).json({
        message: error.message || "Greška pri brisanju troška.",
      });
    }
  });
}

module.exports = { registerExpenseEndpoints };
