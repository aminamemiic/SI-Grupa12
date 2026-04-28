const { ExpenseService } = require("../../BLL/Services/ExpenseService");

function registerExpenseEndpoints(app: any, _logger?: any) {
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

  app.post("/api/troskovi", async (req: any, res: any) => {
    try {
      const createdExpense = await expenseService.createExpense(req.body);

      return res.status(201).json(createdExpense);
    } catch (error: any) {
      console.error("Greška pri kreiranju troška:", error);

      return res.status(400).json({
        message: error.message || "Greška pri kreiranju troška.",
      });
    }
  });
}

module.exports = { registerExpenseEndpoints };
