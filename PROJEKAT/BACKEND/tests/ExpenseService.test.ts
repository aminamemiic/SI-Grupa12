export {};
const mockExpenseRepository = {
  getAll: jest.fn(),
  getReferenceData: jest.fn(),
  create: jest.fn(),
};

jest.mock("../DAL/Repositories/ExpenseRepository", () => ({
  ExpenseRepository: jest.fn().mockImplementation(() => mockExpenseRepository),
}));

const { ExpenseService } = require("../BLL/Services/ExpenseService");

describe("ExpenseService", () => {
  let service: any;

  const validPayload = {
    naziv: "Kupovina kancelarijskog materijala",
    iznos: 120.5,
    datum: "2026-04-30",
    opis: "Papir i olovke",
    kategorijaId: 1,
    odjelId: 2,
    valutaId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new ExpenseService();
  });

  test("treba vratiti sve troškove iz repozitorija", async () => {
    const expenses = [
      { id: 1, naziv: "Gorivo", iznos: 50 },
      { id: 2, naziv: "Internet", iznos: 80 },
    ];

    mockExpenseRepository.getAll.mockResolvedValue(expenses);

    const result = await service.getAllExpenses();

    expect(result).toEqual(expenses);
    expect(mockExpenseRepository.getAll).toHaveBeenCalledTimes(1);
  });

  test("treba keširati troškove i ne zvati repozitorij drugi put odmah", async () => {
    const expenses = [{ id: 1, naziv: "Gorivo", iznos: 50 }];

    mockExpenseRepository.getAll.mockResolvedValue(expenses);

    const firstResult = await service.getAllExpenses();
    const secondResult = await service.getAllExpenses();

    expect(firstResult).toEqual(expenses);
    expect(secondResult).toEqual(expenses);
    expect(mockExpenseRepository.getAll).toHaveBeenCalledTimes(1);
  });

  test("treba vratiti referentne podatke", async () => {
    const referenceData = {
      kategorije: [{ id: 1, naziv: "Putni troškovi" }],
      odjeli: [{ id: 2, naziv: "Finansije" }],
      valute: [{ id: 1, oznaka: "BAM" }],
    };

    mockExpenseRepository.getReferenceData.mockResolvedValue(referenceData);

    const result = await service.getReferenceData();

    expect(result).toEqual(referenceData);
    expect(mockExpenseRepository.getReferenceData).toHaveBeenCalledTimes(1);
  });

  test("treba kreirati validan trošak", async () => {
    const createdExpense = {
      id: 10,
      ...validPayload,
    };

    mockExpenseRepository.create.mockResolvedValue(createdExpense);

    const result = await service.createExpense(validPayload);

    expect(result).toEqual(createdExpense);
    expect(mockExpenseRepository.create).toHaveBeenCalledWith(validPayload);
    expect(mockExpenseRepository.create).toHaveBeenCalledTimes(1);
  });

  test("treba obrisati cache nakon kreiranja novog troška", async () => {
    mockExpenseRepository.getAll
      .mockResolvedValueOnce([{ id: 1, naziv: "Stari trošak" }])
      .mockResolvedValueOnce([{ id: 1, naziv: "Stari trošak" }, { id: 2, naziv: "Novi trošak" }]);

    mockExpenseRepository.create.mockResolvedValue({ id: 2, ...validPayload });

    await service.getAllExpenses();
    await service.createExpense(validPayload);
    await service.getAllExpenses();

    expect(mockExpenseRepository.getAll).toHaveBeenCalledTimes(2);
  });

  test("ne treba kreirati trošak ako naziv nije poslan", async () => {
    await expect(
      service.createExpense({
        ...validPayload,
        naziv: "",
      })
    ).rejects.toThrow("Naziv troška je obavezan.");

    expect(mockExpenseRepository.create).not.toHaveBeenCalled();
  });

  test("ne treba kreirati trošak ako je iznos negativan", async () => {
    await expect(
      service.createExpense({
        ...validPayload,
        iznos: -10,
      })
    ).rejects.toThrow("Iznos mora biti veći od 0.");

    expect(mockExpenseRepository.create).not.toHaveBeenCalled();
  });

  test("ne treba kreirati trošak ako datum nije validan", async () => {
    await expect(
      service.createExpense({
        ...validPayload,
        datum: "nije-datum",
      })
    ).rejects.toThrow("Datum je obavezan i mora biti validan.");

    expect(mockExpenseRepository.create).not.toHaveBeenCalled();
  });

  test("ne treba kreirati trošak ako kategorija nije poslana", async () => {
    await expect(
      service.createExpense({
        ...validPayload,
        kategorijaId: undefined,
      })
    ).rejects.toThrow("Kategorija je obavezna.");

    expect(mockExpenseRepository.create).not.toHaveBeenCalled();
  });
});