import type { IReportService, ReportExportFile, ReportExportFormat, ReportFilters, ReportType } from "../Interfaces/IReportService";

const XLSX = require("xlsx");
const { ReportRepository } = require("../../DAL/Repositories/ReportRepository");

type ExportColumn = {
  label: string;
  value: (expense: any) => unknown;
};

type TableSheetOptions = {
  widths: number[];
  numberFormats?: Record<number, string>;
};

export class ReportService implements IReportService {
  private reportRepository: any;

  constructor() {
    this.reportRepository = new ReportRepository();
  }

  async getExpenseReport(query: any): Promise<any> {
    const filters = this.validateFilters(query);
    return this.reportRepository.getExpenseReport(filters);
  }

  async exportExpenseReport(query: any, requestedFormat: unknown): Promise<ReportExportFile> {
    const format = this.normalizeExportFormat(requestedFormat);
    const reportType = this.normalizeReportType(query?.tipIzvjestaja || query?.tip || query?.reportType);
    const report = await this.getExpenseReport(query);
    const timestamp = this.formatPeriodDate(new Date()) || "danas";
    const reportTypeLabel = reportType === "detaljni" ? "detaljni" : "sazeti";

    if (format === "xlsx") {
      return {
        buffer: this.buildXlsx(report, reportType),
        contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        filename: `izvjestaj-troskovi-${reportTypeLabel}-${timestamp}.xlsx`,
      };
    }

    if (format === "pdf") {
      return {
        buffer: this.buildPdf(report, reportType),
        contentType: "application/pdf",
        filename: `izvjestaj-troskovi-${reportTypeLabel}-${timestamp}.pdf`,
      };
    }

    return {
      buffer: Buffer.from(this.buildCsv(report, reportType), "utf-8"),
      contentType: "text/csv; charset=utf-8",
      filename: `izvjestaj-troskovi-${reportTypeLabel}-${timestamp}.csv`,
    };
  }

  private validateFilters(query: any): ReportFilters {
    const datumOd = this.normalizeDate(query?.datumOd || query?.dateFrom || query?.startDate || query?.od);
    const datumDo = this.normalizeDate(query?.datumDo || query?.dateTo || query?.endDate || query?.do);

    if ((query?.datumOd || query?.dateFrom || query?.startDate || query?.od) && !datumOd) {
      throw new Error("Datum od mora biti u formatu DD.MM.YYYY.");
    }

    if ((query?.datumDo || query?.dateTo || query?.endDate || query?.do) && !datumDo) {
      throw new Error("Datum do mora biti u formatu DD.MM.YYYY.");
    }

    if (datumOd && datumDo && datumOd > datumDo) {
      throw new Error("Datum od ne moze biti poslije datuma do.");
    }

    return { datumOd, datumDo };
  }

  private normalizeDate(value: unknown): string | null {
    if (!value) {
      return null;
    }

    const dateValue = Array.isArray(value) ? value[0] : value;
    if (typeof dateValue !== "string") {
      return null;
    }

    const trimmed = dateValue.trim();
    const localMatch = trimmed.match(/^(\d{2})\.(\d{2})\.(\d{4})\.?$/);
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!localMatch && !isoMatch) {
      return null;
    }

    const dayValue = localMatch ? localMatch[1] : isoMatch![3];
    const monthValue = localMatch ? localMatch[2] : isoMatch![2];
    const yearValue = localMatch ? localMatch[3] : isoMatch![1];
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const date = new Date(Date.UTC(year, month - 1, day));

    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() !== month - 1 ||
      date.getUTCDate() !== day
    ) {
      return null;
    }

    return `${yearValue}-${monthValue}-${dayValue}`;
  }

  private normalizeExportFormat(value: unknown): ReportExportFormat {
    const format = String(Array.isArray(value) ? value[0] : value || "xlsx").toLowerCase();

    if (format === "xlsx" || format === "csv" || format === "pdf") {
      return format;
    }

    throw new Error("Format izvjestaja mora biti xlsx, csv ili pdf.");
  }

  private normalizeReportType(value: unknown): ReportType {
    const reportType = String(Array.isArray(value) ? value[0] : value || "sazeti").toLowerCase();

    if (reportType === "sazeti" || reportType === "detaljni") {
      return reportType;
    }

    throw new Error("Tip izvjestaja mora biti sazeti ili detaljni.");
  }

  private getExpenseColumns(): ExportColumn[] {
    return [
      { label: "Naziv", value: (expense) => expense.naziv },
      { label: "Iznos", value: (expense) => expense.iznos },
      { label: "Datum", value: (expense) => this.formatPeriodDate(expense.datum) || "" },
      { label: "Kategorija", value: (expense) => expense.kategorijaNaziv },
      { label: "Odjel", value: (expense) => expense.odjelNaziv },
      { label: "Valuta", value: (expense) => expense.valutaKod },
      { label: "Projekat", value: (expense) => expense.projekatNaziv },
      { label: "Dobavljac", value: (expense) => expense.dobavljacNaziv },
      { label: "Status", value: (expense) => expense.statusValidacije },
      { label: "Opis", value: (expense) => expense.opis },
    ];
  }

  private buildXlsx(report: any, reportType: ReportType): Buffer {
    const workbook = XLSX.utils.book_new();
    workbook.Props = {
      Title: reportType === "detaljni" ? "Detaljni izvjestaj o troskovima" : "Sazeti izvjestaj o troskovima",
      Subject: this.getPeriodLabel(report),
      Author: "TIM12",
      CreatedDate: new Date(),
    };

    XLSX.utils.book_append_sheet(workbook, this.buildSummarySheet(report, reportType), "Sazetak");
    XLSX.utils.book_append_sheet(workbook, this.buildBreakdownSheet(report.breakdowns.byCategory), "Kategorije");
    XLSX.utils.book_append_sheet(workbook, this.buildBreakdownSheet(report.breakdowns.byDepartment), "Odjeli");
    XLSX.utils.book_append_sheet(workbook, this.buildBreakdownSheet(report.breakdowns.byMonth), "Mjeseci");
    XLSX.utils.book_append_sheet(workbook, this.buildBreakdownSheet(report.breakdowns.byStatus), "Statusi");
    XLSX.utils.book_append_sheet(workbook, this.buildBreakdownSheet(report.breakdowns.byCurrency), "Valute");

    if (reportType === "detaljni") {
      XLSX.utils.book_append_sheet(workbook, this.buildExpensesSheet(report.expenses), "Troskovi");
      XLSX.utils.book_append_sheet(workbook, this.buildTopExpensesSheet(report.expenses), "Top troskovi");
    }

    XLSX.utils.book_append_sheet(workbook, this.buildMethodologySheet(report, reportType), "Metodologija");

    return XLSX.write(workbook, { bookType: "xlsx", type: "buffer" });
  }

  private buildSummarySheet(report: any, reportType: ReportType) {
    const rows: unknown[][] = [
      [reportType === "detaljni" ? "Detaljni izvjestaj o troskovima" : "Sazeti izvjestaj o troskovima"],
      ["Generisano", this.formatDateTime(report.generatedAt)],
      ["Period", this.getPeriodLabel(report)],
      ["Tip izvjestaja", reportType === "detaljni" ? "Detaljni" : "Sazeti"],
      [],
      ["Kljucne informacije", "Vrijednost", "Napomena"],
      ["Ukupno troskova", report.summary.totalExpenses, "Broj troskova u odabranom periodu"],
      ["Ukupni iznos", report.summary.totalAmount, "Zbir svih troskova"],
      ["Prosjecan trosak", report.summary.averageAmount, "Ukupni iznos / broj troskova"],
      ["Ukupni budzet", report.summary.budgetTotal, `${report.summary.budgetCount || 0} budzeta u periodu`],
      ["Iskoristenost budzeta", this.toPercentValue(report.summary.budgetUtilizationPercent), "Ukupni iznos / ukupni budzet"],
      ["Top kategorija", report.summary.topCategory?.label || "-", this.getBreakdownNote(report.summary.topCategory)],
      ["Top odjel", report.summary.topDepartment?.label || "-", this.getBreakdownNote(report.summary.topDepartment)],
      ["Najveci trosak", report.summary.highestExpense?.naziv || "-", this.formatAmountWithCurrency(report.summary.highestExpense?.iznos)],
      ["Najmanji trosak", report.summary.lowestExpense?.naziv || "-", this.formatAmountWithCurrency(report.summary.lowestExpense?.iznos)],
      [],
      ["Brzi pregled kategorija", "Iznos", "Broj troskova", "Prosjecan trosak", "Udio"],
      ...report.breakdowns.byCategory.slice(0, 8).map((item: any) => [
        item.label,
        item.total,
        item.count,
        item.average,
        this.toPercentValue(item.percentage),
      ]),
      [],
      ["Brzi pregled odjela", "Iznos", "Broj troskova", "Prosjecan trosak", "Udio"],
      ...report.breakdowns.byDepartment.slice(0, 8).map((item: any) => [
        item.label,
        item.total,
        item.count,
        item.average,
        this.toPercentValue(item.percentage),
      ]),
      [],
      ["Prosjecni troskovi po mjesecima", "Iznos", "Broj troskova", "Prosjecan trosak", "Udio"],
      ...report.breakdowns.byMonth.map((item: any) => [
        item.label,
        item.total,
        item.count,
        item.average,
        this.toPercentValue(item.percentage),
      ]),
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);

    sheet["!cols"] = [{ wch: 32 }, { wch: 20 }, { wch: 18 }, { wch: 20 }, { wch: 14 }];
    sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];
    this.applyNumberFormat(sheet, [7, 8, 9], 1, "#,##0.00");
    this.applyNumberFormat(sheet, [10], 1, "0.00%");
    this.applyNumberFormat(sheet, this.getRowIndexes(rows, "Brzi pregled kategorija", "Brzi pregled odjela", "Prosjecni troskovi po mjesecima"), 1, "#,##0.00");
    this.applyNumberFormat(sheet, this.getRowIndexes(rows, "Brzi pregled kategorija", "Brzi pregled odjela", "Prosjecni troskovi po mjesecima"), 3, "#,##0.00");
    this.applyNumberFormat(sheet, this.getRowIndexes(rows, "Brzi pregled kategorija", "Brzi pregled odjela", "Prosjecni troskovi po mjesecima"), 4, "0.00%");

    return sheet;
  }

  private buildExpensesSheet(expenses: any[]) {
    const headers = ["Naziv", "Iznos", "Datum", "Kategorija", "Odjel", "Valuta", "Projekat", "Dobavljac", "Status", "Opis"];
    const rows = expenses.map((expense) => this.getExpenseColumns().map((column) => column.value(expense) ?? ""));

    return this.createTableSheet(headers, rows, {
      widths: [28, 14, 14, 20, 18, 10, 22, 22, 18, 36],
      numberFormats: { 1: "#,##0.00" },
    });
  }

  private buildTopExpensesSheet(expenses: any[]) {
    const headers = ["Rang", "Naziv", "Iznos", "Datum", "Kategorija", "Odjel", "Valuta", "Dobavljac", "Status"];
    const rows = [...expenses]
      .sort((a, b) => Number(b.iznos || 0) - Number(a.iznos || 0))
      .slice(0, 20)
      .map((expense, index) => [
        index + 1,
        expense.naziv || "",
        Number(expense.iznos || 0),
        this.formatPeriodDate(expense.datum) || "",
        expense.kategorijaNaziv || "",
        expense.odjelNaziv || "",
        expense.valutaKod || "",
        expense.dobavljacNaziv || "",
        expense.statusValidacije || "",
      ]);

    return this.createTableSheet(headers, rows, {
      widths: [8, 30, 14, 14, 20, 18, 10, 22, 18],
      numberFormats: { 2: "#,##0.00" },
    });
  }

  private buildBreakdownSheet(items: any[]) {
    const headers = ["Naziv", "Ukupni iznos", "Broj troskova", "Prosjecan trosak", "Udio"];
    const rows = items.map((item) => [
      item.label,
      Number(item.total || 0),
      Number(item.count || 0),
      Number(item.average || 0),
      this.toPercentValue(item.percentage),
    ]);

    return this.createTableSheet(headers, rows, {
      widths: [30, 16, 14, 18, 12],
      numberFormats: { 1: "#,##0.00", 3: "#,##0.00", 4: "0.00%" },
    });
  }

  private buildMethodologySheet(report: any, reportType: ReportType) {
    const rows: unknown[][] = [
      ["Metodologija izvjestaja"],
      ["Period", this.getPeriodLabel(report)],
      ["Tip izvjestaja", reportType === "detaljni" ? "Detaljni" : "Sazeti"],
      ["Izvor podataka", "Tabela troskovi sa povezanim kategorijama, odjelima, valutama, projektima i dobavljacima."],
      ["Filter perioda", "U izvjestaj ulaze troskovi ciji datum pripada odabranom periodu."],
      ["Budzet", "Budzet se racuna za budzete koji se preklapaju s odabranim periodom."],
      ["Udio", "Udio je odnos pojedinacne grupe prema ukupnom iznosu troskova u izvjestaju."],
      [
        "Export",
        reportType === "detaljni"
          ? "Detaljni Excel sadrzi sazetak, sve troskove, top troskove i agregacije po kategoriji, odjelu, mjesecu, statusu i valuti."
          : "Sazeti Excel sadrzi kljucne informacije i agregacije bez liste pojedinacnih troskova.",
      ],
    ];
    const sheet = XLSX.utils.aoa_to_sheet(rows);
    sheet["!cols"] = [{ wch: 22 }, { wch: 95 }];
    sheet["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }];

    return sheet;
  }

  private createTableSheet(headers: string[], rows: unknown[][], options: TableSheetOptions) {
    const sheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const range = XLSX.utils.decode_range(sheet["!ref"]);

    sheet["!cols"] = options.widths.map((width) => ({ wch: width }));
    sheet["!autofilter"] = {
      ref: XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: range.e.r, c: range.e.c },
      }),
    };
    sheet["!freeze"] = { xSplit: 0, ySplit: 1 };

    Object.entries(options.numberFormats || {}).forEach(([columnIndex, format]) => {
      const column = Number(columnIndex);

      for (let row = 1; row <= range.e.r; row += 1) {
        const address = XLSX.utils.encode_cell({ r: row, c: column });
        if (sheet[address]) {
          sheet[address].z = format;
        }
      }
    });

    return sheet;
  }

  private applyNumberFormat(sheet: any, rows: number[], column: number, format: string): void {
    rows.forEach((row) => {
      const address = XLSX.utils.encode_cell({ r: row, c: column });
      if (sheet[address]) {
        sheet[address].z = format;
      }
    });
  }

  private getRowIndexes(rows: unknown[][], ...sectionTitles: string[]): number[] {
    const indexes: number[] = [];
    let isInsideSection = false;

    rows.forEach((row, index) => {
      const title = String(row[0] || "");

      if (sectionTitles.includes(title)) {
        isInsideSection = true;
        return;
      }

      if (row.length === 0) {
        isInsideSection = false;
        return;
      }

      if (isInsideSection) {
        indexes.push(index);
      }
    });

    return indexes;
  }

  private buildCsv(report: any, reportType: ReportType): string {
    const rows: unknown[][] = [
      [reportType === "detaljni" ? "Detaljni izvjestaj troskova" : "Sazeti izvjestaj troskova"],
      ["Period", this.getPeriodLabel(report)],
      ["Tip izvjestaja", reportType === "detaljni" ? "Detaljni" : "Sazeti"],
      ["Ukupno troskova", report.summary.totalExpenses],
      ["Ukupni iznos", report.summary.totalAmount],
      ["Prosjecan trosak", report.summary.averageAmount],
      ["Ukupni budzet", report.summary.budgetTotal],
      ["Iskoristenost budzeta (%)", report.summary.budgetUtilizationPercent ?? "-"],
      [],
      ["Kategorija", "Ukupni iznos", "Broj troskova", "Prosjecan trosak", "Udio (%)"],
      ...report.breakdowns.byCategory.map((item: any) => [item.label, item.total, item.count, item.average, item.percentage]),
      [],
      ["Odjel", "Ukupni iznos", "Broj troskova", "Prosjecan trosak", "Udio (%)"],
      ...report.breakdowns.byDepartment.map((item: any) => [item.label, item.total, item.count, item.average, item.percentage]),
      [],
      ["Mjesec", "Ukupni iznos", "Broj troskova", "Prosjecan trosak", "Udio (%)"],
      ...report.breakdowns.byMonth.map((item: any) => [item.label, item.total, item.count, item.average, item.percentage]),
    ];

    if (reportType === "detaljni") {
      rows.push(
        [],
        ["Detaljni troskovi"],
        this.getExpenseColumns().map((column) => column.label),
        ...report.expenses.map((expense: any) => this.getExpenseColumns().map((column) => column.value(expense) ?? ""))
      );
    }

    return rows.map((row) => row.map((value) => this.escapeCsv(value)).join(",")).join("\r\n");
  }

  private buildPdf(report: any, reportType: ReportType): Buffer {
    const lines = [
      reportType === "detaljni" ? "Detaljni izvjestaj troskova" : "Sazeti izvjestaj troskova",
      `Period: ${this.getPeriodLabel(report)}`,
      `Tip: ${reportType === "detaljni" ? "Detaljni" : "Sazeti"}`,
      `Ukupno troskova: ${report.summary.totalExpenses}`,
      `Ukupni iznos: ${this.formatAmount(report.summary.totalAmount)}`,
      `Prosjecan trosak: ${this.formatAmount(report.summary.averageAmount)}`,
      `Ukupni budzet: ${this.formatAmount(report.summary.budgetTotal)}`,
      `Iskoristenost budzeta: ${report.summary.budgetUtilizationPercent ?? "-"}%`,
      `Top kategorija: ${report.summary.topCategory?.label || "-"}`,
      `Top odjel: ${report.summary.topDepartment?.label || "-"}`,
      "",
      "Kategorije:",
      ...report.breakdowns.byCategory.slice(0, 8).map((item: any) =>
        `${item.label || "-"} | ukupno ${this.formatAmount(item.total)} | prosjek ${this.formatAmount(item.average)} | ${item.count || 0} troskova`
      ),
      "",
      "Odjeli:",
      ...report.breakdowns.byDepartment.slice(0, 8).map((item: any) =>
        `${item.label || "-"} | ukupno ${this.formatAmount(item.total)} | prosjek ${this.formatAmount(item.average)} | ${item.count || 0} troskova`
      ),
      "",
      "Prosjecni troskovi po mjesecima:",
      ...report.breakdowns.byMonth.slice(0, 12).map((item: any) =>
        `${item.label || "-"} | ukupno ${this.formatAmount(item.total)} | prosjek ${this.formatAmount(item.average)} | ${item.count || 0} troskova`
      ),
    ];

    if (reportType === "detaljni") {
      lines.push(
        "",
        "Troskovi:",
      ...report.expenses.slice(0, 35).map((expense: any) =>
          `${this.formatPeriodDate(expense.datum) || "-"} | ${expense.naziv || "-"} | ${this.formatAmount(expense.iznos)} | ${expense.kategorijaNaziv || "-"}`
        )
      );

      if (report.expenses.length > 35) {
        lines.push(`Prikazano prvih 35 od ${report.expenses.length} troskova.`);
      }
    }

    return this.createSimplePdf(lines);
  }

  private buildLegacyCsv(report: any): string {
    const rows: unknown[][] = [
      ["Izvjestaj troskova"],
      ["Period", this.getPeriodLabel(report)],
      ["Ukupno troskova", report.summary.totalExpenses],
      ["Ukupni iznos", report.summary.totalAmount],
      ["Prosjecan trosak", report.summary.averageAmount],
      ["Ukupni budzet", report.summary.budgetTotal],
      ["Iskoristenost budzeta (%)", report.summary.budgetUtilizationPercent ?? "-"],
      [],
      this.getExpenseColumns().map((column) => column.label),
      ...report.expenses.map((expense: any) => this.getExpenseColumns().map((column) => column.value(expense) ?? "")),
    ];

    return rows.map((row) => row.map((value) => this.escapeCsv(value)).join(",")).join("\r\n");
  }

  private buildLegacyPdf(report: any): Buffer {
    const lines = [
      "Izvjestaj troskova",
      `Period: ${this.getPeriodLabel(report)}`,
      `Ukupno troskova: ${report.summary.totalExpenses}`,
      `Ukupni iznos: ${this.formatAmount(report.summary.totalAmount)}`,
      `Prosjecan trosak: ${this.formatAmount(report.summary.averageAmount)}`,
      `Ukupni budzet: ${this.formatAmount(report.summary.budgetTotal)}`,
      `Iskoristenost budzeta: ${report.summary.budgetUtilizationPercent ?? "-"}%`,
      `Top kategorija: ${report.summary.topCategory?.label || "-"}`,
      `Top odjel: ${report.summary.topDepartment?.label || "-"}`,
      "",
      "Troskovi:",
      ...report.expenses.slice(0, 35).map((expense: any) =>
        `${this.formatPeriodDate(expense.datum) || "-"} | ${expense.naziv || "-"} | ${this.formatAmount(expense.iznos)} | ${expense.kategorijaNaziv || "-"}`
      ),
    ];

    if (report.expenses.length > 35) {
      lines.push(`Prikazano prvih 35 od ${report.expenses.length} troskova.`);
    }

    return this.createSimplePdf(lines);
  }

  private mapExpenseForExport(expense: any) {
    return this.getExpenseColumns().reduce((row: any, column) => {
      row[column.label] = column.value(expense) ?? "";
      return row;
    }, {});
  }

  private escapeCsv(value: unknown): string {
    const text = value === null || value === undefined ? "" : String(value);
    return `"${text.replace(/"/g, '""')}"`;
  }

  private getPeriodLabel(report: any): string {
    const from = this.formatPeriodDate(report.period?.datumOd) || "pocetak";
    const to = this.formatPeriodDate(report.period?.datumDo) || "danas";
    return `${from} - ${to}`;
  }

  private formatPeriodDate(value: unknown): string | null {
    const dateParts = this.getDateParts(value);
    if (!dateParts) {
      return value ? String(value) : null;
    }

    return `${dateParts.day}.${dateParts.month}.${dateParts.year}`;
  }

  private formatDateTime(value: unknown): string {
    if (!value) {
      return "-";
    }

    const date = new Date(String(value));
    if (Number.isNaN(date.getTime())) {
      return String(value);
    }

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");

    return `${day}.${month}.${year} ${hours}:${minutes}`;
  }

  private formatAmount(value: unknown): string {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return "-";
    }

    return numberValue.toFixed(2);
  }

  private formatAmountWithCurrency(value: unknown): string {
    const amount = this.formatAmount(value);
    return amount === "-" ? "-" : `${amount} BAM`;
  }

  private toPercentValue(value: unknown): number | string {
    const numberValue = Number(value);
    if (!Number.isFinite(numberValue)) {
      return "-";
    }

    return numberValue / 100;
  }

  private getBreakdownNote(item: any): string {
    if (!item) {
      return "-";
    }

    return `${this.formatAmountWithCurrency(item.total)} | ${item.count || 0} troskova`;
  }

  private getDateParts(value: unknown): { year: string; month: string; day: string } | null {
    if (!value) {
      return null;
    }

    const rawValue = value instanceof Date ? value.toISOString() : String(value);
    const match = rawValue.match(/^([+-]?\d{4,6})-(\d{2})-(\d{2})/);
    if (!match) {
      return null;
    }

    return {
      year: match[1].replace(/^\+/, "").replace(/^0+(?=\d{5,}$)/, ""),
      month: match[2],
      day: match[3],
    };
  }

  private createSimplePdf(lines: string[]): Buffer {
    const lineHeight = 16;
    const startX = 48;
    const startY = 790;
    const content = [
      "BT",
      "/F1 12 Tf",
      `${startX} ${startY} Td`,
      ...lines.flatMap((line, index) => [
        index === 0 ? "" : `0 -${lineHeight} Td`,
        `(${this.escapePdfText(this.toPdfSafeText(line))}) Tj`,
      ]).filter(Boolean),
      "ET",
    ].join("\n");
    const objects = [
      "<< /Type /Catalog /Pages 2 0 R >>",
      "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
      "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
      "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
      `<< /Length ${Buffer.byteLength(content, "binary")} >>\nstream\n${content}\nendstream`,
    ];
    let pdf = "%PDF-1.4\n";
    const offsets: number[] = [0];

    objects.forEach((object, index) => {
      offsets.push(Buffer.byteLength(pdf, "binary"));
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });

    const xrefOffset = Buffer.byteLength(pdf, "binary");
    pdf += `xref\n0 ${objects.length + 1}\n`;
    pdf += "0000000000 65535 f \n";
    offsets.slice(1).forEach((offset) => {
      pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
    });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

    return Buffer.from(pdf, "binary");
  }

  private toPdfSafeText(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\x20-\x7E]/g, "?");
  }

  private escapePdfText(value: string): string {
    return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
  }
}

module.exports = { ReportService };
