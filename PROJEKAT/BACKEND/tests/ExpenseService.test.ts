export {};


const mockExpenseRepository = {
  getAll: jest.fn(),
  getReferenceData: jest.fn(),
  create: jest.fn(),
  getById: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
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

  // ─────────────────────────────────────────────────────────────
  // getAllExpenses
  // ─────────────────────────────────────────────────────────────

  describe("getAllExpenses", () => {
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

    test("treba ponovo pozvati repozitorij nakon isteka keša", async () => {
      const expenses = [{ id: 1, naziv: "Gorivo", iznos: 50 }];
      mockExpenseRepository.getAll.mockResolvedValue(expenses);

      await service.getAllExpenses();

      // Ručno istječi keš
      service.expensesCache.expiresAt = Date.now() - 1;

      await service.getAllExpenses();

      expect(mockExpenseRepository.getAll).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // getReferenceData
  // ─────────────────────────────────────────────────────────────

  describe("getReferenceData", () => {
    test("treba vratiti referentne podatke iz repozitorija", async () => {
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

    test("treba keširati referentne podatke i ne zvati repozitorij drugi put", async () => {
      const referenceData = { kategorije: [], odjeli: [], valute: [] };
      mockExpenseRepository.getReferenceData.mockResolvedValue(referenceData);

      await service.getReferenceData();
      const result = await service.getReferenceData();

      expect(result).toEqual(referenceData);
      expect(mockExpenseRepository.getReferenceData).toHaveBeenCalledTimes(1);
    });

    test("treba ponovo pozvati repozitorij nakon isteka keša referentnih podataka", async () => {
      const referenceData = { kategorije: [], odjeli: [], valute: [] };
      mockExpenseRepository.getReferenceData.mockResolvedValue(referenceData);

      await service.getReferenceData();

      service.referenceDataCache.expiresAt = Date.now() - 1;

      await service.getReferenceData();

      expect(mockExpenseRepository.getReferenceData).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // createExpense – uspješno kreiranje
  // ─────────────────────────────────────────────────────────────

  describe("createExpense – uspješni scenariji", () => {
    test("treba kreirati validan trošak", async () => {
      const createdExpense = { id: 10, ...validPayload };
      mockExpenseRepository.create.mockResolvedValue(createdExpense);

      const result = await service.createExpense(validPayload);

      expect(result).toEqual(createdExpense);
      expect(mockExpenseRepository.create).toHaveBeenCalledWith(validPayload,undefined);
      expect(mockExpenseRepository.create).toHaveBeenCalledTimes(1);
    });

    test("treba proslijediti authUser repozitoriju pri kreiranju", async () => {
      const createdExpense = { id: 11, ...validPayload };
      const authUser = { sub: "user-123", roles: ["admin"] };
      mockExpenseRepository.create.mockResolvedValue(createdExpense);

      await service.createExpense(validPayload, authUser);

      expect(mockExpenseRepository.create).toHaveBeenCalledWith(validPayload, authUser);
    });

    test("treba obrisati keš troškova nakon kreiranja novog troška", async () => {
      mockExpenseRepository.getAll
        .mockResolvedValueOnce([{ id: 1, naziv: "Stari trošak" }])
        .mockResolvedValueOnce([
          { id: 1, naziv: "Stari trošak" },
          { id: 2, naziv: "Novi trošak" },
        ]);
      mockExpenseRepository.create.mockResolvedValue({ id: 2, ...validPayload });

      await service.getAllExpenses();
      await service.createExpense(validPayload);
      await service.getAllExpenses();

      expect(mockExpenseRepository.getAll).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // createExpense – validacija polja (US-15, strategija: validaciona logika)
  // ─────────────────────────────────────────────────────────────

  describe("createExpense – validacija naziva", () => {
    test("ne treba kreirati trošak ako naziv nije poslan (prazan string)", async () => {
      await expect(
        service.createExpense({ ...validPayload, naziv: "" })
      ).rejects.toThrow("Naziv troška je obavezan.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako naziv sadrži samo razmake", async () => {
      await expect(
        service.createExpense({ ...validPayload, naziv: "   " })
      ).rejects.toThrow("Naziv troška je obavezan.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako naziv prelazi 200 karaktera", async () => {
      await expect(
        service.createExpense({ ...validPayload, naziv: "a".repeat(201) })
      ).rejects.toThrow("Naziv troška ne smije imati više od 200 karaktera.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("treba prihvatiti naziv koji ima tačno 200 karaktera", async () => {
      const createdExpense = { id: 12, ...validPayload, naziv: "a".repeat(200) };
      mockExpenseRepository.create.mockResolvedValue(createdExpense);

      const result = await service.createExpense({
        ...validPayload,
        naziv: "a".repeat(200),
      });

      expect(result).toEqual(createdExpense);
    });
  });

  describe("createExpense – validacija iznosa", () => {
    test("ne treba kreirati trošak ako je iznos negativan", async () => {
      await expect(
        service.createExpense({ ...validPayload, iznos: -10 })
      ).rejects.toThrow("Iznos mora biti veći od 0.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako je iznos nula", async () => {
      await expect(
        service.createExpense({ ...validPayload, iznos: 0 })
      ).rejects.toThrow("Iznos mora biti veći od 0.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako iznos nije validan broj (string)", async () => {
      await expect(
        service.createExpense({ ...validPayload, iznos: "abc" })
      ).rejects.toThrow("Iznos mora biti validan broj.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako je iznos Infinity", async () => {
      await expect(
        service.createExpense({ ...validPayload, iznos: Infinity })
      ).rejects.toThrow("Iznos mora biti validan broj.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("treba prihvatiti iznos koji je pozitivan decimalni broj", async () => {
      const createdExpense = { id: 13, ...validPayload, iznos: 0.01 };
      mockExpenseRepository.create.mockResolvedValue(createdExpense);

      const result = await service.createExpense({ ...validPayload, iznos: 0.01 });

      expect(result).toEqual(createdExpense);
    });
  });

  describe("createExpense – validacija datuma", () => {
    test("ne treba kreirati trošak ako datum nije validan", async () => {
      await expect(
        service.createExpense({ ...validPayload, datum: "nije-datum" })
      ).rejects.toThrow("Datum je obavezan i mora biti validan.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako datum nije poslan", async () => {
      await expect(
        service.createExpense({ ...validPayload, datum: "" })
      ).rejects.toThrow("Datum je obavezan i mora biti validan.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });
  });

  describe("createExpense – validacija obaveznih ID polja", () => {
    test("ne treba kreirati trošak ako kategorijaId nije poslana", async () => {
      await expect(
        service.createExpense({ ...validPayload, kategorijaId: undefined })
      ).rejects.toThrow("Kategorija je obavezna.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako odjelId nije poslan", async () => {
      await expect(
        service.createExpense({ ...validPayload, odjelId: undefined })
      ).rejects.toThrow("Odjel je obavezan.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako valutaId nije poslana", async () => {
      await expect(
        service.createExpense({ ...validPayload, valutaId: undefined })
      ).rejects.toThrow("Valuta je obavezna.");
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati trošak ako payload nije poslan (null)", async () => {
      await expect(service.createExpense(null)).rejects.toThrow(
        "Podaci za trošak nisu poslani."
      );
      expect(mockExpenseRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // updateExpense
  // ─────────────────────────────────────────────────────────────

  describe("updateExpense", () => {
    test("treba uspješno ažurirati postojeći trošak", async () => {
      const existing = { id: "1", statusValidacije: "AKTIVAN" };
      const updated = { id: "1", ...validPayload };
      mockExpenseRepository.getById.mockResolvedValue(existing);
      mockExpenseRepository.update.mockResolvedValue(updated);

      const result = await service.updateExpense("1", validPayload);

      expect(result).toEqual(updated);
      expect(mockExpenseRepository.update).toHaveBeenCalledWith("1", validPayload);
    });

    test("treba obrisati keš troškova nakon ažuriranja", async () => {
      const existing = { id: "1", statusValidacije: "AKTIVAN" };
      mockExpenseRepository.getById.mockResolvedValue(existing);
      mockExpenseRepository.update.mockResolvedValue({ id: "1", ...validPayload });
      mockExpenseRepository.getAll.mockResolvedValue([]);

      await service.getAllExpenses(); // popuni keš
      await service.updateExpense("1", validPayload);
      await service.getAllExpenses(); // treba pozvati repozitorij ponovo

      expect(mockExpenseRepository.getAll).toHaveBeenCalledTimes(2);
    });

    test("treba baciti grešku ako trošak ne postoji", async () => {
      mockExpenseRepository.getById.mockResolvedValue(null);

      await expect(service.updateExpense("99", validPayload)).rejects.toThrow(
        "Trošak ne postoji."
      );
      expect(mockExpenseRepository.update).not.toHaveBeenCalled();
    });

    test("treba baciti grešku ako je trošak zaključan", async () => {
      mockExpenseRepository.getById.mockResolvedValue({
        id: "1",
        statusValidacije: "ZAKLJUCAN",
      });

      await expect(service.updateExpense("1", validPayload)).rejects.toThrow(
        "Zaključani troškovi se ne mogu mijenjati."
      );
      expect(mockExpenseRepository.update).not.toHaveBeenCalled();
    });

    test("ne treba ažurirati trošak s neispravnim payloadom (validacija)", async () => {
      mockExpenseRepository.getById.mockResolvedValue({
        id: "1",
        statusValidacije: "AKTIVAN",
      });

      await expect(
        service.updateExpense("1", { ...validPayload, naziv: "" })
      ).rejects.toThrow("Naziv troška je obavezan.");
      expect(mockExpenseRepository.update).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // deleteExpense
  // ─────────────────────────────────────────────────────────────

  describe("deleteExpense", () => {
    test("treba uspješno obrisati postojeći trošak", async () => {
      mockExpenseRepository.getById.mockResolvedValue({
        id: "1",
        statusValidacije: "AKTIVAN",
      });
      mockExpenseRepository.delete.mockResolvedValue(undefined);

      await service.deleteExpense("1");

      expect(mockExpenseRepository.delete).toHaveBeenCalledWith("1");
    });

    test("treba obrisati keš troškova nakon brisanja", async () => {
      mockExpenseRepository.getById.mockResolvedValue({
        id: "1",
        statusValidacije: "AKTIVAN",
      });
      mockExpenseRepository.delete.mockResolvedValue(undefined);
      mockExpenseRepository.getAll.mockResolvedValue([]);

      await service.getAllExpenses(); // popuni keš
      await service.deleteExpense("1");
      await service.getAllExpenses(); // treba pozvati repozitorij ponovo

      expect(mockExpenseRepository.getAll).toHaveBeenCalledTimes(2);
    });

    test("treba tiho izaći (bez greške) ako trošak ne postoji", async () => {
      mockExpenseRepository.getById.mockResolvedValue(null);

      await expect(service.deleteExpense("99")).resolves.toBeUndefined();
      expect(mockExpenseRepository.delete).not.toHaveBeenCalled();
    });

    test("treba baciti grešku ako je trošak zaključan", async () => {
      mockExpenseRepository.getById.mockResolvedValue({
        id: "1",
        statusValidacije: "ZAKLJUCAN",
      });

      await expect(service.deleteExpense("1")).rejects.toThrow(
        "Zaključani troškovi se ne mogu brisati."
      );
      expect(mockExpenseRepository.delete).not.toHaveBeenCalled();
    });
  });
});