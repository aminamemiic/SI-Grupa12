import type {
  IIngestionService,
  ImportConfirmRequest,
  ImportPreviewRequest,
  ImportPreviewResult,
  ImportRowIssue,
} from "../Interfaces/IIngestionService";

const { parse } = require("csv-parse/sync");
const XLSX = require("xlsx");
const { ExpenseService } = require("./ExpenseService");
const { IngestionRepository } = require("../../DAL/Repositories/IngestionRepository");

type ReferenceLookup = {
  kategorijeById: Map<string, any>;
  kategorijeByName: Map<string, any>;
  odjeliById: Map<string, any>;
  odjeliByName: Map<string, any>;
  valuteById: Map<string, any>;
  valuteByCode: Map<string, any>;
  projektiById: Map<string, any>;
  projektiByName: Map<string, any>;
  dobavljaciById: Map<string, any>;
  dobavljaciByName: Map<string, any>;
};

export class IngestionService implements IIngestionService {
  private expenseService: any;
  private ingestionRepository: any;

  constructor() {
    this.expenseService = new ExpenseService();
    this.ingestionRepository = new IngestionRepository();
  }

  async previewImport(file: ImportPreviewRequest): Promise<ImportPreviewResult> {
    if (!file?.buffer || !file.originalName) {
      throw new Error("Fajl za uvoz je obavezan.");
    }

    const rawRows = this.parseFile(file);
    const referenceData = await this.expenseService.getReferenceData();
    const lookup = this.buildReferenceLookup(referenceData);
    const rows = rawRows.map((raw: any, index: number) => this.mapAndValidateRow(raw, index + 2, lookup));
    const validRows = rows.filter((row: any) => row.isValid).length;

    return {
      fileName: file.originalName,
      totalRows: rows.length,
      validRows,
      invalidRows: rows.length - validRows,
      rows,
    };
  }

  async confirmImport(payload: ImportConfirmRequest, authUser?: unknown) {
    const rows = Array.isArray(payload?.rows) ? payload.rows : [];

    if (rows.length === 0) {
      throw new Error("Nema redova za potvrdu uvoza.");
    }

    const errors: Array<{ rowNumber?: number; message: string }> = [];
    const createdExpenses: any[] = [];

    for (const row of rows) {
      const rowNumber = row?.rowNumber;
      const expense = row?.expense || row;

      try {
        const createdExpense = await this.expenseService.createExpense(expense, authUser);
        createdExpenses.push(createdExpense);
      } catch (error: any) {
        errors.push({
          rowNumber,
          message: error.message || "Red nije moguće upisati.",
        });
      }
    }

    const status = this.determineStatus(rows.length, createdExpenses.length);
    const importId = await this.ingestionRepository.createHistoryEntry({
      fileName: payload?.fileName || null,
      status,
      totalRows: rows.length,
      validRows: createdExpenses.length,
      invalidRows: errors.length,
      insertedCount: createdExpenses.length,
      errors,
      createdByEmail: this.getAuthEmail(authUser),
    });

    return {
      importId,
      fileName: payload?.fileName || null,
      totalRows: rows.length,
      insertedCount: createdExpenses.length,
      skippedCount: errors.length,
      createdExpenses,
      errors,
    };
  }

  async getImportHistory(): Promise<any[]> {
    return this.ingestionRepository.getHistory();
  }

  private parseFile(file: ImportPreviewRequest): any[] {
    const lowerName = file.originalName.toLowerCase();

    if (lowerName.endsWith(".csv") || file.mimetype === "text/csv") {
      return parse(file.buffer, {
        bom: true,
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });
    }

    if (lowerName.endsWith(".xlsx") || lowerName.endsWith(".xls")) {
      const workbook = XLSX.read(file.buffer, { type: "buffer", cellDates: true });
      const firstSheetName = workbook.SheetNames[0];

      if (!firstSheetName) {
        return [];
      }

      return XLSX.utils.sheet_to_json(workbook.Sheets[firstSheetName], {
        defval: "",
        raw: false,
      });
    }

    throw new Error("Podržani formati su CSV, XLS i XLSX.");
  }

  private mapAndValidateRow(raw: any, rowNumber: number, lookup: ReferenceLookup) {
    const errors: ImportRowIssue[] = [];
    const warnings: ImportRowIssue[] = [];
    const expense = {
      naziv: this.pick(raw, ["naziv", "naziv troska", "naziv_troska", "trošak", "trosak"]),
      iznos: this.parseAmount(this.pick(raw, ["iznos", "amount"])),
      datum: this.parseDate(this.pick(raw, ["datum", "date"])),
      opis: this.emptyToNull(this.pick(raw, ["opis", "description"])),
      kategorijaId: this.resolveRequiredReference(
        raw,
        lookup.kategorijeById,
        lookup.kategorijeByName,
        ["kategorijaId", "kategorija_id", "id kategorije"],
        ["kategorija", "naziv kategorije"],
        "kategorija",
        errors
      ),
      odjelId: this.resolveRequiredReference(
        raw,
        lookup.odjeliById,
        lookup.odjeliByName,
        ["odjelId", "odjel_id", "id odjela"],
        ["odjel", "naziv odjela"],
        "odjel",
        errors
      ),
      valutaId: this.resolveRequiredReference(
        raw,
        lookup.valuteById,
        lookup.valuteByCode,
        ["valutaId", "valuta_id", "id valute"],
        ["valuta", "kod valute"],
        "valuta",
        errors
      ),
      projekatId: this.resolveOptionalReference(
        raw,
        lookup.projektiById,
        lookup.projektiByName,
        ["projekatId", "projekat_id", "id projekta"],
        ["projekat", "naziv projekta"],
        "projekat",
        errors,
        warnings
      ),
      dobavljacId: this.resolveOptionalReference(
        raw,
        lookup.dobavljaciById,
        lookup.dobavljaciByName,
        ["dobavljacId", "dobavljac_id", "id dobavljaca", "id dobavljača"],
        ["dobavljac", "dobavljač", "naziv dobavljaca", "naziv dobavljača"],
        "dobavljač",
        errors,
        warnings
      ),
    };

    this.validateExpenseShape(expense, errors);

    return {
      rowNumber,
      raw,
      expense,
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  private buildReferenceLookup(referenceData: any): ReferenceLookup {
    return {
      kategorijeById: this.mapBy(referenceData?.kategorije, "id"),
      kategorijeByName: this.mapBy(referenceData?.kategorije, "naziv"),
      odjeliById: this.mapBy(referenceData?.odjeli, "id"),
      odjeliByName: this.mapBy(referenceData?.odjeli, "naziv"),
      valuteById: this.mapBy(referenceData?.valute, "id"),
      valuteByCode: this.mapBy(referenceData?.valute, "kod"),
      projektiById: this.mapBy(referenceData?.projekti, "id"),
      projektiByName: this.mapBy(referenceData?.projekti, "naziv_projekta"),
      dobavljaciById: this.mapBy(referenceData?.dobavljaci, "id"),
      dobavljaciByName: this.mapBy(referenceData?.dobavljaci, "naziv_firme"),
    };
  }

  private mapBy(items: any[] = [], field: string) {
    const result = new Map<string, any>();

    for (const item of items || []) {
      if (item?.[field] !== undefined && item?.[field] !== null) {
        result.set(this.normalizeKey(item[field]), item);
      }
    }

    return result;
  }

  private resolveRequiredReference(
    raw: any,
    byId: Map<string, any>,
    byName: Map<string, any>,
    idHeaders: string[],
    nameHeaders: string[],
    label: string,
    errors: ImportRowIssue[]
  ) {
    const value = this.resolveReference(raw, byId, byName, idHeaders, nameHeaders, label, errors);

    if (!value) {
      errors.push({ field: label, message: `${this.capitalize(label)} je obavezna/o.` });
    }

    return value;
  }

  private resolveOptionalReference(
    raw: any,
    byId: Map<string, any>,
    byName: Map<string, any>,
    idHeaders: string[],
    nameHeaders: string[],
    label: string,
    errors: ImportRowIssue[],
    warnings: ImportRowIssue[]
  ) {
    const hasValue = this.pick(raw, idHeaders) || this.pick(raw, nameHeaders);

    if (!hasValue) {
      return null;
    }

    const value = this.resolveReference(raw, byId, byName, idHeaders, nameHeaders, label, errors);
    if (!value) {
      warnings.push({ field: label, message: `${this.capitalize(label)} nije pronađen u šifarniku.` });
    }

    return value;
  }

  private resolveReference(
    raw: any,
    byId: Map<string, any>,
    byName: Map<string, any>,
    idHeaders: string[],
    nameHeaders: string[],
    label: string,
    errors: ImportRowIssue[]
  ) {
    const idValue = this.pick(raw, idHeaders);
    if (idValue) {
      const matchedById = byId.get(this.normalizeKey(idValue));
      if (matchedById) {
        return matchedById.id;
      }
      errors.push({ field: label, message: `${this.capitalize(label)} sa ID vrijednošću "${idValue}" ne postoji.` });
      return null;
    }

    const nameValue = this.pick(raw, nameHeaders);
    if (nameValue) {
      const matchedByName = byName.get(this.normalizeKey(nameValue));
      if (matchedByName) {
        return matchedByName.id;
      }
      errors.push({ field: label, message: `${this.capitalize(label)} "${nameValue}" ne postoji.` });
    }

    return null;
  }

  private validateExpenseShape(expense: any, errors: ImportRowIssue[]) {
    if (!expense.naziv || String(expense.naziv).trim() === "") {
      errors.push({ field: "naziv", message: "Naziv troška je obavezan." });
    } else if (String(expense.naziv).length > 200) {
      errors.push({ field: "naziv", message: "Naziv troška ne smije imati više od 200 karaktera." });
    }

    if (!Number.isFinite(expense.iznos)) {
      errors.push({ field: "iznos", message: "Iznos mora biti validan broj." });
    } else if (expense.iznos <= 0) {
      errors.push({ field: "iznos", message: "Iznos mora biti veći od 0." });
    }

    if (!expense.datum || Number.isNaN(Date.parse(expense.datum))) {
      errors.push({ field: "datum", message: "Datum je obavezan i mora biti validan." });
    }
  }

  private pick(raw: any, headers: string[]) {
    const normalizedRaw = new Map<string, any>();
    Object.keys(raw || {}).forEach((key) => normalizedRaw.set(this.normalizeHeader(key), raw[key]));

    for (const header of headers) {
      const value = normalizedRaw.get(this.normalizeHeader(header));
      if (value !== undefined && value !== null && String(value).trim() !== "") {
        return String(value).trim();
      }
    }

    return "";
  }

  private parseAmount(value: string) {
    if (!value) {
      return NaN;
    }

    const compact = value.replace(/\s/g, "");
    const commaIndex = compact.lastIndexOf(",");
    const dotIndex = compact.lastIndexOf(".");
    const normalized =
      commaIndex > -1 && dotIndex > -1
        ? commaIndex > dotIndex
          ? compact.replace(/\./g, "").replace(",", ".")
          : compact.replace(/,/g, "")
        : compact.replace(",", ".");

    return Number(normalized);
  }

  private parseDate(value: string) {
    if (!value) {
      return "";
    }

    const match = value.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})\.?$/);
    if (match) {
      const [, day, month, year] = match;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    const directDate = new Date(value);
    if (!Number.isNaN(directDate.getTime())) {
      return directDate.toISOString().slice(0, 10);
    }

    return value;
  }

  private emptyToNull(value: string) {
    return value ? value : null;
  }

  private normalizeHeader(value: string) {
    return this.normalizeKey(value).replace(/[_-]+/g, " ");
  }

  private normalizeKey(value: any) {
    return String(value)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ");
  }

  private capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private determineStatus(totalRows: number, insertedCount: number) {
    if (insertedCount === totalRows) {
      return "USPJESAN";
    }

    return insertedCount > 0 ? "DJELIMICAN" : "NEUSPJESAN";
  }

  private getAuthEmail(authUser: any) {
    return authUser?.email || authUser?.preferred_username || null;
  }
}

module.exports = { IngestionService };
