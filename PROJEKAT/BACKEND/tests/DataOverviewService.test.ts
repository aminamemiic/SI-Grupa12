export {};

const mockDataOverviewRepository = {
  getOverview: jest.fn(),
};

jest.mock("../DAL/Repositories/DataOverviewRepository", () => ({
  DataOverviewRepository: jest.fn().mockImplementation(() => mockDataOverviewRepository),
}));

const { DataOverviewService } = require("../BLL/Services/DataOverviewService");

describe("DataOverviewService", () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new DataOverviewService();
  });

  test("treba vratiti objedinjene podatke iz repozitorija", async () => {
    const overview = {
      troskovi: [{ id: "t1", naziv: "Gorivo", kategorijaNaziv: "Putni troskovi" }],
      budzeti: [{ id: "b1", naziv: "Budzet 2026", odjelNaziv: "Finansije" }],
      kategorije: [{ id: "k1", naziv: "Putni troskovi" }],
      odjeli: [{ id: "o1", naziv: "Finansije" }],
      valute: [{ id: "v1", kod: "BAM" }],
      projekti: [{ id: "p1", nazivProjekta: "ERP" }],
      dobavljaci: [{ id: "d1", nazivFirme: "Dobavljac d.o.o." }],
    };
    mockDataOverviewRepository.getOverview.mockResolvedValue(overview);

    const result = await service.getDataOverview();

    expect(result).toEqual(overview);
    expect(mockDataOverviewRepository.getOverview).toHaveBeenCalledTimes(1);
  });

  test("treba vratiti prazne nizove kada nema podataka", async () => {
    const emptyOverview = {
      troskovi: [],
      budzeti: [],
      kategorije: [],
      odjeli: [],
      valute: [],
      projekti: [],
      dobavljaci: [],
    };
    mockDataOverviewRepository.getOverview.mockResolvedValue(emptyOverview);

    const result = await service.getDataOverview();

    expect(result).toEqual(emptyOverview);
  });

  test("treba proslijediti gresku repozitorija", async () => {
    mockDataOverviewRepository.getOverview.mockRejectedValue(new Error("Database error"));

    await expect(service.getDataOverview()).rejects.toThrow("Database error");
  });
});

