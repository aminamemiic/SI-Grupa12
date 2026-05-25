export {};

const mockExpenseRepository = {
  getReferenceData: jest.fn(),
};

jest.mock("../DAL/Repositories/ExpenseRepository", () => ({
  ExpenseRepository: jest.fn().mockImplementation(() => mockExpenseRepository),
}));

const { ExpenseService } = require("../BLL/Services/ExpenseService");

describe("ExpenseService category suggestions", () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExpenseService();
  });

  test("salje naziv, opis, dobavljaca i dostupne kategorije AI servisu", async () => {
    const referenceData = {
      kategorije: [
        { id: "kat-1", naziv: "Oprema" },
        { id: "kat-2", naziv: "Marketing" },
      ],
      odjeli: [],
      valute: [],
    };
    const suggestion = {
      categoryId: "kat-1",
      categoryName: "Oprema",
      confidence: 0.8,
      reason: "Laptop je oprema.",
    };

    mockExpenseRepository.getReferenceData.mockResolvedValue(referenceData);
    service.aiAnalysisService = {
      suggestExpenseCategory: jest.fn().mockResolvedValue(suggestion),
    };

    const result = await service.suggestCategory({
      naziv: "  Laptop Lenovo  ",
      opis: "Razvojna oprema",
      dobavljac: "IT Shop",
    });

    expect(result).toEqual(suggestion);
    expect(service.aiAnalysisService.suggestExpenseCategory).toHaveBeenCalledWith({
      naziv: "Laptop Lenovo",
      opis: "Razvojna oprema",
      dobavljac: "IT Shop",
      categories: referenceData.kategorije,
    });
  });

  test("salje null za opcionalna polja i praznu listu kategorija kada ih nema", async () => {
    mockExpenseRepository.getReferenceData.mockResolvedValue({});
    service.aiAnalysisService = {
      suggestExpenseCategory: jest.fn().mockResolvedValue({
        categoryId: null,
        categoryName: null,
        confidence: 0,
        reason: "Nema prijedloga.",
      }),
    };

    await service.suggestCategory({ naziv: "Gorivo" });

    expect(service.aiAnalysisService.suggestExpenseCategory).toHaveBeenCalledWith({
      naziv: "Gorivo",
      opis: null,
      dobavljac: null,
      categories: [],
    });
  });

  test("odbija AI prijedlog ako naziv nije poslan", async () => {
    service.aiAnalysisService = {
      suggestExpenseCategory: jest.fn(),
    };

    await expect(service.suggestCategory({ naziv: "   " })).rejects.toThrow(
      "Naziv troska je obavezan za AI prijedlog kategorije."
    );
    expect(service.aiAnalysisService.suggestExpenseCategory).not.toHaveBeenCalled();
  });
});
