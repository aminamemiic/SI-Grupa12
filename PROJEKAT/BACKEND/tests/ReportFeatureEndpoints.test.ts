export {};

const express = require("express");
const request = require("supertest");

const mockReportService = {
  getExpenseReport: jest.fn(),
  exportExpenseReport: jest.fn(),
};

jest.mock("../BLL/Services/ReportService", () => ({
  ReportService: jest.fn().mockImplementation(() => mockReportService),
}));

const { registerReportEndpoints } = require("../PRESENTATION API/Endpoints/ReportEndpoints");

describe("Report feature endpoints", () => {
  let app: any;

  const authService = {
    verifyBearerToken: jest.fn((_req: any, _res: any, next: any) => next()),
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["finansijski_direktor"] };
      next();
    }),
    requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    refreshSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerReportEndpoints(app, authService);
  });

  test("treba proslijediti period servisu pri generisanju izvjestaja", async () => {
    const report = {
      period: { datumOd: "2026-05-01", datumDo: "2026-05-31" },
      summary: { totalExpenses: 2, totalAmount: 1500 },
      breakdowns: { byMonth: [{ label: "Maj 2026", average: 750 }] },
      expenses: [],
    };
    mockReportService.getExpenseReport.mockResolvedValue(report);

    const response = await request(app)
      .get("/api/izvjestaji/troskovi")
      .query({ datumOd: "2026-05-01", datumDo: "2026-05-31" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(report);
    expect(mockReportService.getExpenseReport).toHaveBeenCalledWith({
      datumOd: "2026-05-01",
      datumDo: "2026-05-31",
    });
  });

  test("treba proslijediti format, period i tip izvjestaja pri exportu", async () => {
    mockReportService.exportExpenseReport.mockResolvedValue({
      buffer: Buffer.from("export"),
      contentType: "text/csv; charset=utf-8",
      filename: "izvjestaj-troskovi-detaljni-2026-05-20.csv",
    });

    const response = await request(app)
      .get("/api/izvjestaji/troskovi/export")
      .query({
        format: "csv",
        tipIzvjestaja: "detaljni",
        datumOd: "2026-05-01",
        datumDo: "2026-05-31",
      });

    expect(response.status).toBe(200);
    expect(response.headers["content-type"]).toContain("text/csv");
    expect(response.headers["content-disposition"]).toContain(
      "izvjestaj-troskovi-detaljni-2026-05-20.csv"
    );
    expect(mockReportService.exportExpenseReport).toHaveBeenCalledWith(
      {
        format: "csv",
        tipIzvjestaja: "detaljni",
        datumOd: "2026-05-01",
        datumDo: "2026-05-31",
      },
      "csv"
    );
  });

  test("treba vratiti 400 sa porukom servisa kada generisanje nije validno", async () => {
    mockReportService.getExpenseReport.mockRejectedValue(
      new Error("Datum od ne moze biti poslije datuma do.")
    );

    const response = await request(app)
      .get("/api/izvjestaji/troskovi")
      .query({ datumOd: "2026-06-01", datumDo: "2026-05-31" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Datum od ne moze biti poslije datuma do.",
    });
  });

  test("treba vratiti 400 sa porukom servisa kada export nije validan", async () => {
    mockReportService.exportExpenseReport.mockRejectedValue(
      new Error("Tip izvjestaja mora biti sazeti ili detaljni.")
    );

    const response = await request(app)
      .get("/api/izvjestaji/troskovi/export")
      .query({ format: "csv", tipIzvjestaja: "kratki" });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      message: "Tip izvjestaja mora biti sazeti ili detaljni.",
    });
  });
});
