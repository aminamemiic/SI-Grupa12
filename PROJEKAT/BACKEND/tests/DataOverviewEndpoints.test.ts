export {};

const express = require("express");
const request = require("supertest");

const mockDataOverviewService = {
  getDataOverview: jest.fn(),
};

jest.mock("../BLL/Services/DataOverviewService", () => ({
  DataOverviewService: jest.fn().mockImplementation(() => mockDataOverviewService),
}));

const { registerDataOverviewEndpoints } = require("../PRESENTATION API/Endpoints/DataOverviewEndpoints");

describe("DataOverviewEndpoints", () => {
  let app: any;

  const authService = {
    verifyBearerToken: jest.fn((_req: any, _res: any, next: any) => next()),
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["admin"] };
      next();
    }),
    requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
    refreshSession: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerDataOverviewEndpoints(app, authService);
  });

  test("GET /api/podaci/pregled treba vratiti 200 za validan zahtjev", async () => {
    const overview = {
      troskovi: [{ id: "t1", naziv: "Gorivo", kategorijaNaziv: "Putni troskovi" }],
      budzeti: [{ id: "b1", naziv: "Budzet 2026", odjelNaziv: "Finansije" }],
      kategorije: [],
      odjeli: [],
      valute: [],
      projekti: [],
      dobavljaci: [],
    };
    mockDataOverviewService.getDataOverview.mockResolvedValue(overview);

    const response = await request(app).get("/api/podaci/pregled");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(overview);
    expect(mockDataOverviewService.getDataOverview).toHaveBeenCalledTimes(1);
  });

  test("GET /api/podaci/pregled treba vratiti prazne nizove", async () => {
    const emptyOverview = {
      troskovi: [],
      budzeti: [],
      kategorije: [],
      odjeli: [],
      valute: [],
      projekti: [],
      dobavljaci: [],
    };
    mockDataOverviewService.getDataOverview.mockResolvedValue(emptyOverview);

    const response = await request(app).get("/api/podaci/pregled");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(emptyOverview);
  });

  test("GET /api/podaci/pregled treba vratiti 500 kada servis baci gresku", async () => {
    mockDataOverviewService.getDataOverview.mockRejectedValue(new Error("Database error"));

    const response = await request(app).get("/api/podaci/pregled");

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      message: "Greska pri dohvatu pregleda podataka.",
    });
  });

  test("treba pozivati RBAC middleware s rolama za pregled podataka", async () => {
    mockDataOverviewService.getDataOverview.mockResolvedValue({
      troskovi: [],
      budzeti: [],
      kategorije: [],
      odjeli: [],
      valute: [],
      projekti: [],
      dobavljaci: [],
    });

    await request(app).get("/api/podaci/pregled");

    expect(authService.requireAuthentication).toHaveBeenCalled();
    expect(authService.requireRole).toHaveBeenCalledWith(
      "admin",
      "glavni_racunovodja",
      "finansijski_direktor"
    );
  });
});

