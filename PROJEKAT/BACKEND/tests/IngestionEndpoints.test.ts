export {};

const express = require("express");
const request = require("supertest");

const mockIngestionService = {
  previewImport: jest.fn(),
  confirmImport: jest.fn(),
  getImportHistory: jest.fn(),
};

jest.mock("../BLL/Services/IngestionService", () => ({
  IngestionService: jest.fn().mockImplementation(() => mockIngestionService),
}));

const { registerIngestionEndpoints } = require("../PRESENTATION API/Endpoints/IngestionEndpoints");

describe("IngestionEndpoints", () => {
  let app: any;

  const authService = {
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", email: "admin@test.ba", roles: ["admin"] };
      next();
    }),
    requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerIngestionEndpoints(app, authService);
  });

  test("POST /api/troskovi/uvoz/preview treba primiti fajl i vratiti preview", async () => {
    const preview = { fileName: "troskovi.csv", totalRows: 1, validRows: 1, invalidRows: 0, rows: [] };
    mockIngestionService.previewImport.mockResolvedValue(preview);

    const response = await request(app)
      .post("/api/troskovi/uvoz/preview")
      .attach("file", Buffer.from("naziv,iznos\nLaptop,10"), "troskovi.csv");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(preview);
    expect(mockIngestionService.previewImport).toHaveBeenCalledWith(
      expect.objectContaining({
        originalName: "troskovi.csv",
        buffer: expect.any(Buffer),
      })
    );
  });

  test("POST /api/troskovi/uvoz/preview treba vratiti 400 ako fajl nije poslan", async () => {
    const response = await request(app).post("/api/troskovi/uvoz/preview");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Fajl za uvoz je obavezan.");
  });

  test("POST /api/troskovi/uvoz/potvrdi treba potvrditi validirane redove", async () => {
    const result = { insertedCount: 1, skippedCount: 0, createdExpenses: [{ id: "1" }], errors: [] };
    mockIngestionService.confirmImport.mockResolvedValue(result);

    const payload = {
      fileName: "troskovi.csv",
      rows: [{ expense: { naziv: "Laptop", iznos: 10 } }],
    };
    const response = await request(app).post("/api/troskovi/uvoz/potvrdi").send(payload);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(result);
    expect(mockIngestionService.confirmImport).toHaveBeenCalledWith(
      payload,
      expect.objectContaining({ email: "admin@test.ba" })
    );
  });

  test("GET /api/troskovi/uvoz/historija treba vratiti historiju uvoza", async () => {
    const history = [{ id: "uvoz-1", fileName: "troskovi.csv" }];
    mockIngestionService.getImportHistory.mockResolvedValue(history);

    const response = await request(app).get("/api/troskovi/uvoz/historija");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(history);
  });
});
