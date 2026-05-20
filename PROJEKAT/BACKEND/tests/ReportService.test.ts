export {};

const XLSX = require("xlsx");

const mockReportRepository = {
  getExpenseReport: jest.fn(),
};

jest.mock("../DAL/Repositories/ReportRepository", () => ({
  ReportRepository: jest.fn().mockImplementation(() => mockReportRepository),
}));

const { ReportService } = require("../BLL/Services/ReportService");

describe("ReportService", () => {
  let service: any;

  const sampleReport = {
    generatedAt: "2026-05-20T10:00:00.000Z",
    period: {
      datumOd: "2026-05-01",
      datumDo: "2026-05-31",
    },
    summary: {
      totalExpenses: 2,
      totalAmount: 1500,
      averageAmount: 750,
      budgetCount: 1,
      budgetTotal: 3000,
      budgetUtilizationPercent: 50,
      highestExpense: {
        naziv: "Laptop",
        iznos: 1200,
        datum: "2026-05-01",
        kategorijaNaziv: "Oprema",
      },
      lowestExpense: {
        naziv: "Gorivo",
        iznos: 300,
        datum: "2026-05-02",
        kategorijaNaziv: "Putni troskovi",
      },
      topCategory: {
        label: "Oprema",
        total: 1200,
        count: 1,
        average: 1200,
        percentage: 80,
      },
      topDepartment: {
        label: "Finansije",
        total: 1500,
        count: 2,
        average: 750,
        percentage: 100,
      },
    },
    breakdowns: {
      byCategory: [
        { label: "Oprema", total: 1200, count: 1, average: 1200, percentage: 80 },
        { label: "Putni troskovi", total: 300, count: 1, average: 300, percentage: 20 },
      ],
      byDepartment: [
        { label: "Finansije", total: 1500, count: 2, average: 750, percentage: 100 },
      ],
      byCurrency: [
        { label: "BAM", total: 1500, count: 2, average: 750, percentage: 100 },
      ],
      byStatus: [
        { label: "VALIDAN", total: 1500, count: 2, average: 750, percentage: 100 },
      ],
      byMonth: [
        { label: "Maj 2026", total: 1500, count: 2, average: 750, percentage: 100 },
      ],
    },
    expenses: [
      {
        id: "t1",
        naziv: "Laptop",
        iznos: 1200,
        datum: "2026-05-01",
        kategorijaNaziv: "Oprema",
        odjelNaziv: "Finansije",
        valutaKod: "BAM",
        projekatNaziv: "ERP",
        dobavljacNaziv: "Dobavljac d.o.o.",
        statusValidacije: "VALIDAN",
        opis: "Kupovina opreme",
      },
      {
        id: "t2",
        naziv: "Gorivo",
        iznos: 300,
        datum: "2026-05-02",
        kategorijaNaziv: "Putni troskovi",
        odjelNaziv: "Finansije",
        valutaKod: "BAM",
        projekatNaziv: "ERP",
        dobavljacNaziv: "Dobavljac d.o.o.",
        statusValidacije: "VALIDAN",
        opis: "Sluzbeni put",
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockReportRepository.getExpenseReport.mockResolvedValue(sampleReport);
    service = new ReportService();
  });

  describe("getExpenseReport", () => {
    test("treba vratiti izvjestaj i proslijediti validan period repozitoriju", async () => {
      const result = await service.getExpenseReport({
        datumOd: "2026-05-01",
        datumDo: "2026-05-31",
      });

      expect(result).toEqual(sampleReport);
      expect(mockReportRepository.getExpenseReport).toHaveBeenCalledWith({
        datumOd: "2026-05-01",
        datumDo: "2026-05-31",
      });
    });

    test("treba prihvatiti alias parametre za period", async () => {
      await service.getExpenseReport({
        startDate: "2026-05-01",
        endDate: "2026-05-31",
      });

      expect(mockReportRepository.getExpenseReport).toHaveBeenCalledWith({
        datumOd: "2026-05-01",
        datumDo: "2026-05-31",
      });
    });

    test("treba baciti gresku ako datum od nije u YYYY-MM-DD formatu", async () => {
      await expect(
        service.getExpenseReport({ datumOd: "01.05.2026", datumDo: "2026-05-31" })
      ).rejects.toThrow("Datum od mora biti u formatu YYYY-MM-DD.");
      expect(mockReportRepository.getExpenseReport).not.toHaveBeenCalled();
    });

    test("treba baciti gresku ako datum do nije kalendarski validan", async () => {
      await expect(
        service.getExpenseReport({ datumOd: "2026-05-01", datumDo: "2026-02-31" })
      ).rejects.toThrow("Datum do mora biti u formatu YYYY-MM-DD.");
      expect(mockReportRepository.getExpenseReport).not.toHaveBeenCalled();
    });

    test("treba baciti gresku ako je datum od poslije datuma do", async () => {
      await expect(
        service.getExpenseReport({ datumOd: "2026-06-01", datumDo: "2026-05-31" })
      ).rejects.toThrow("Datum od ne moze biti poslije datuma do.");
      expect(mockReportRepository.getExpenseReport).not.toHaveBeenCalled();
    });
  });

  describe("exportExpenseReport", () => {
    test("treba generisati sazet Excel izvjestaj bez detaljnih listova", async () => {
      const result = await service.exportExpenseReport(
        { datumOd: "2026-05-01", datumDo: "2026-05-31", tipIzvjestaja: "sazeti" },
        "xlsx"
      );
      const workbook = XLSX.read(result.buffer, { type: "buffer" });

      expect(Buffer.isBuffer(result.buffer)).toBe(true);
      expect(result.contentType).toBe("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      expect(result.filename).toContain("izvjestaj-troskovi-sazeti-");
      expect(workbook.SheetNames).toEqual(
        expect.arrayContaining(["Sazetak", "Kategorije", "Odjeli", "Mjeseci", "Metodologija"])
      );
      expect(workbook.SheetNames).not.toContain("Troskovi");
      expect(workbook.SheetNames).not.toContain("Top troskovi");
    });

    test("treba generisati detaljni Excel izvjestaj sa listom troskova", async () => {
      const result = await service.exportExpenseReport(
        { datumOd: "2026-05-01", datumDo: "2026-05-31", tipIzvjestaja: "detaljni" },
        "xlsx"
      );
      const workbook = XLSX.read(result.buffer, { type: "buffer" });

      expect(result.filename).toContain("izvjestaj-troskovi-detaljni-");
      expect(workbook.SheetNames).toEqual(expect.arrayContaining(["Troskovi", "Top troskovi"]));
    });

    test("treba generisati detaljni CSV sa prosjecnim troskovima po mjesecima", async () => {
      const result = await service.exportExpenseReport(
        { datumOd: "2026-05-01", datumDo: "2026-05-31", reportType: "detaljni" },
        "csv"
      );
      const csv = result.buffer.toString("utf-8");

      expect(result.contentType).toBe("text/csv; charset=utf-8");
      expect(result.filename).toContain("izvjestaj-troskovi-detaljni-");
      expect(csv).toContain("Detaljni izvjestaj troskova");
      expect(csv).toContain("Mjesec");
      expect(csv).toContain("Prosjecan trosak");
      expect(csv).toContain("Detaljni troskovi");
      expect(csv).toContain("Maj 2026");
    });

    test("treba generisati sazet PDF izvjestaj", async () => {
      const result = await service.exportExpenseReport(
        { datumOd: "2026-05-01", datumDo: "2026-05-31", tip: "sazeti" },
        "pdf"
      );

      expect(result.contentType).toBe("application/pdf");
      expect(result.filename).toContain("izvjestaj-troskovi-sazeti-");
      expect(result.buffer.subarray(0, 4).toString("binary")).toBe("%PDF");
    });

    test("treba baciti gresku za nepodrzan format exporta", async () => {
      await expect(service.exportExpenseReport({}, "docx")).rejects.toThrow(
        "Format izvjestaja mora biti xlsx, csv ili pdf."
      );
      expect(mockReportRepository.getExpenseReport).not.toHaveBeenCalled();
    });

    test("treba baciti gresku za nepodrzan tip izvjestaja", async () => {
      await expect(
        service.exportExpenseReport({ tipIzvjestaja: "kratki" }, "csv")
      ).rejects.toThrow("Tip izvjestaja mora biti sazeti ili detaljni.");
      expect(mockReportRepository.getExpenseReport).not.toHaveBeenCalled();
    });
  });
});
