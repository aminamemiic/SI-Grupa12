export interface ImportPreviewRequest {
  originalName: string;
  mimetype?: string;
  buffer: Buffer;
}

export interface ImportConfirmRequest {
  fileName?: string;
  rows: any[];
}

export interface ImportRowIssue {
  field?: string;
  message: string;
}

export interface ImportPreviewRow {
  rowNumber: number;
  raw: any;
  expense: any;
  isValid: boolean;
  errors: ImportRowIssue[];
  warnings: ImportRowIssue[];
}

export interface ImportPreviewResult {
  fileName: string;
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ImportPreviewRow[];
}

export interface ImportConfirmResult {
  importId: string | null;
  fileName: string | null;
  totalRows: number;
  insertedCount: number;
  skippedCount: number;
  createdExpenses: any[];
  errors: Array<{ rowNumber?: number; message: string }>;
}

export interface IIngestionService {
  previewImport(file: ImportPreviewRequest): Promise<ImportPreviewResult>;
  confirmImport(payload: ImportConfirmRequest, authUser?: unknown): Promise<ImportConfirmResult>;
  getImportHistory(): Promise<any[]>;
}
