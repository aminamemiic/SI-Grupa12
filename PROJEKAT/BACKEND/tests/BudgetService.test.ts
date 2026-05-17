export {};

const mockBudgetRepository = {
  getAll: jest.fn(),
  getById: jest.fn(),
  getReferenceData: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  existsDuplicate: jest.fn(),
  getUserIdFromAuth: jest.fn(),
};

jest.mock("../DAL/Repositories/BudgetRepository", () => ({
  BudgetRepository: jest.fn().mockImplementation(() => mockBudgetRepository),
}));

const { BudgetService } = require("../BLL/Services/BudgetService");

describe("BudgetService", () => {
  let service: any;

  const validPayload = {
    naziv: "Godišnji budžet IT odjela",
    planiraniIznos: 50000,
    datumPocetka: "2026-01-01",
    datumZavrsetka: "2026-12-31",
    odjelId: 1,
    kategorijaIds: [1, 2],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new BudgetService();
  });

  // ─────────────────────────────────────────────────────────────
  // getAllBudgets
  // ─────────────────────────────────────────────────────────────

  describe("getAllBudgets", () => {
    test("treba vratiti sve budžete iz repozitorija", async () => {
      const budgets = [
        { id: 1, naziv: "Budžet Q1", planiraniIznos: 10000 },
        { id: 2, naziv: "Budžet Q2", planiraniIznos: 12000 },
      ];
      mockBudgetRepository.getAll.mockResolvedValue(budgets);

      const result = await service.getAllBudgets();

      expect(result).toEqual(budgets);
      expect(mockBudgetRepository.getAll).toHaveBeenCalledTimes(1);
    });

    test("treba keširati budžete i ne zvati repozitorij drugi put odmah", async () => {
      const budgets = [{ id: 1, naziv: "Budžet Q1", planiraniIznos: 10000 }];
      mockBudgetRepository.getAll.mockResolvedValue(budgets);

      const firstResult = await service.getAllBudgets();
      const secondResult = await service.getAllBudgets();

      expect(firstResult).toEqual(budgets);
      expect(secondResult).toEqual(budgets);
      expect(mockBudgetRepository.getAll).toHaveBeenCalledTimes(1);
    });

    test("treba ponovo pozvati repozitorij nakon isteka keša", async () => {
      const budgets = [{ id: 1, naziv: "Budžet Q1", planiraniIznos: 10000 }];
      mockBudgetRepository.getAll.mockResolvedValue(budgets);

      await service.getAllBudgets();

      // Ručno istječi keš
      service.budgetsCache.expiresAt = Date.now() - 1;

      await service.getAllBudgets();

      expect(mockBudgetRepository.getAll).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // getBudgetById
  // ─────────────────────────────────────────────────────────────

  describe("getBudgetById", () => {
    test("treba vratiti budžet po ID-u", async () => {
      const budget = { id: "1", naziv: "Budžet Q1", planiraniIznos: 10000 };
      mockBudgetRepository.getById.mockResolvedValue(budget);

      const result = await service.getBudgetById("1");

      expect(result).toEqual(budget);
      expect(mockBudgetRepository.getById).toHaveBeenCalledWith("1");
    });

    test("treba vratiti null ako budžet ne postoji", async () => {
      mockBudgetRepository.getById.mockResolvedValue(null);

      const result = await service.getBudgetById("99");

      expect(result).toBeNull();
      expect(mockBudgetRepository.getById).toHaveBeenCalledWith("99");
    });
  });

  // ─────────────────────────────────────────────────────────────
  // getReferenceData
  // ─────────────────────────────────────────────────────────────

  describe("getReferenceData", () => {
    test("treba vratiti referentne podatke iz repozitorija", async () => {
      const referenceData = {
        kategorije: [{ id: 1, naziv: "Operativni troškovi" }],
        odjeli: [{ id: 1, naziv: "Finansije" }],
        projekti: [{ id: 1, naziv_projekta: "Projekat Alpha" }],
      };
      mockBudgetRepository.getReferenceData.mockResolvedValue(referenceData);

      const result = await service.getReferenceData();

      expect(result).toEqual(referenceData);
      expect(mockBudgetRepository.getReferenceData).toHaveBeenCalledTimes(1);
    });

    test("treba keširati referentne podatke i ne zvati repozitorij drugi put", async () => {
      const referenceData = { kategorije: [], odjeli: [], projekti: [] };
      mockBudgetRepository.getReferenceData.mockResolvedValue(referenceData);

      await service.getReferenceData();
      const result = await service.getReferenceData();

      expect(result).toEqual(referenceData);
      expect(mockBudgetRepository.getReferenceData).toHaveBeenCalledTimes(1);
    });

    test("treba ponovo pozvati repozitorij nakon isteka keša referentnih podataka", async () => {
      const referenceData = { kategorije: [], odjeli: [], projekti: [] };
      mockBudgetRepository.getReferenceData.mockResolvedValue(referenceData);

      await service.getReferenceData();

      service.referenceDataCache.expiresAt = Date.now() - 1;

      await service.getReferenceData();

      expect(mockBudgetRepository.getReferenceData).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // createBudget – uspješni scenariji
  // ─────────────────────────────────────────────────────────────

  describe("createBudget – uspješni scenariji", () => {
    test("treba kreirati validan budžet", async () => {
      const createdBudget = { id: 10, ...validPayload };
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.create.mockResolvedValue(createdBudget);

      const result = await service.createBudget(validPayload);

      expect(result).toEqual(createdBudget);
      expect(mockBudgetRepository.create).toHaveBeenCalledTimes(1);
    });

    test("treba obrisati keš budžeta nakon kreiranja novog budžeta", async () => {
      mockBudgetRepository.getAll
        .mockResolvedValueOnce([{ id: 1, naziv: "Stari budžet" }])
        .mockResolvedValueOnce([
          { id: 1, naziv: "Stari budžet" },
          { id: 2, naziv: "Novi budžet" },
        ]);
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.create.mockResolvedValue({ id: 2, ...validPayload });

      await service.getAllBudgets();
      await service.createBudget(validPayload);
      await service.getAllBudgets();

      expect(mockBudgetRepository.getAll).toHaveBeenCalledTimes(2);
    });

    test("treba normalizovati kategorijaIds i ukloniti duplikate", async () => {
      const payloadSaDuplikatima = { ...validPayload, kategorijaIds: [1, 1, 2, 2] };
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.create.mockResolvedValue({ id: 10, ...payloadSaDuplikatima });

      await service.createBudget(payloadSaDuplikatima);

      const callArg = mockBudgetRepository.create.mock.calls[0][0];
      expect(callArg.kategorijaIds).toEqual(["1", "2"]);
    });

    test("treba baciti grešku ako duplikat već postoji", async () => {
      mockBudgetRepository.existsDuplicate.mockResolvedValue(true);

      await expect(service.createBudget(validPayload)).rejects.toThrow(
        "Budzet za odabrani odjel, kategoriju i period vec postoji."
      );
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // createBudget – validacija naziva
  // ─────────────────────────────────────────────────────────────

  describe("createBudget – validacija naziva", () => {
    test("ne treba kreirati budžet ako naziv nije poslan (prazan string)", async () => {
      await expect(
        service.createBudget({ ...validPayload, naziv: "" })
      ).rejects.toThrow("Naziv budzeta je obavezan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako naziv sadrži samo razmake", async () => {
      await expect(
        service.createBudget({ ...validPayload, naziv: "   " })
      ).rejects.toThrow("Naziv budzeta je obavezan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako naziv prelazi 200 karaktera", async () => {
      await expect(
        service.createBudget({ ...validPayload, naziv: "a".repeat(201) })
      ).rejects.toThrow("Naziv budzeta ne smije imati vise od 200 karaktera.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("treba prihvatiti naziv koji ima tačno 200 karaktera", async () => {
      const createdBudget = { id: 12, ...validPayload, naziv: "a".repeat(200) };
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.create.mockResolvedValue(createdBudget);

      const result = await service.createBudget({ ...validPayload, naziv: "a".repeat(200) });

      expect(result).toEqual(createdBudget);
    });

    test("ne treba kreirati budžet ako payload nije poslan (null)", async () => {
      await expect(service.createBudget(null)).rejects.toThrow(
        "Podaci za budzet nisu poslani."
      );
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // createBudget – validacija planiranog iznosa
  // ─────────────────────────────────────────────────────────────

  describe("createBudget – validacija planiranog iznosa", () => {
    test("ne treba kreirati budžet ako je planirani iznos negativan", async () => {
      await expect(
        service.createBudget({ ...validPayload, planiraniIznos: -100 })
      ).rejects.toThrow("Planirani iznos mora biti veci od 0.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako je planirani iznos nula", async () => {
      await expect(
        service.createBudget({ ...validPayload, planiraniIznos: 0 })
      ).rejects.toThrow("Planirani iznos mora biti veci od 0.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako je planirani iznos Infinity", async () => {
      await expect(
        service.createBudget({ ...validPayload, planiraniIznos: Infinity })
      ).rejects.toThrow("Planirani iznos mora biti veci od 0.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("treba prihvatiti pozitivan decimalni iznos", async () => {
      const createdBudget = { id: 13, ...validPayload, planiraniIznos: 0.01 };
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.create.mockResolvedValue(createdBudget);

      const result = await service.createBudget({ ...validPayload, planiraniIznos: 0.01 });

      expect(result).toEqual(createdBudget);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // createBudget – validacija datuma
  // ─────────────────────────────────────────────────────────────

  describe("createBudget – validacija datuma", () => {
    test("ne treba kreirati budžet ako datum početka nije validan", async () => {
      await expect(
        service.createBudget({ ...validPayload, datumPocetka: "nije-datum" })
      ).rejects.toThrow("Datum pocetka je obavezan i mora biti validan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako datum početka nije poslan", async () => {
      await expect(
        service.createBudget({ ...validPayload, datumPocetka: "" })
      ).rejects.toThrow("Datum pocetka je obavezan i mora biti validan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako datum završetka nije validan", async () => {
      await expect(
        service.createBudget({ ...validPayload, datumZavrsetka: "nije-datum" })
      ).rejects.toThrow("Datum zavrsetka je obavezan i mora biti validan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako datum završetka nije poslan", async () => {
      await expect(
        service.createBudget({ ...validPayload, datumZavrsetka: "" })
      ).rejects.toThrow("Datum zavrsetka je obavezan i mora biti validan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako je datum završetka prije datuma početka", async () => {
      await expect(
        service.createBudget({
          ...validPayload,
          datumPocetka: "2026-12-31",
          datumZavrsetka: "2026-01-01",
        })
      ).rejects.toThrow("Datum zavrsetka ne moze biti prije datuma pocetka.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("treba prihvatiti datume u formatu dd.mm.yyyy i normalizovati ih prije upisa", async () => {
      const localDatePayload = {
        ...validPayload,
        datumPocetka: "01.05.2026",
        datumZavrsetka: "31.05.2026",
      };
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.create.mockResolvedValue({ id: 14, ...validPayload });

      await service.createBudget(localDatePayload);

      expect(mockBudgetRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          datumPocetka: "2026-05-01",
          datumZavrsetka: "2026-05-31",
        })
      );
    });

    test("ne treba kreirati budzet ako dd.mm.yyyy datum pocetka nije kalendarski validan", async () => {
      await expect(
        service.createBudget({ ...validPayload, datumPocetka: "31.02.2026" })
      ).rejects.toThrow("Datum pocetka je obavezan i mora biti validan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // createBudget – validacija obaveznih polja
  // ─────────────────────────────────────────────────────────────

  describe("createBudget – validacija obaveznih polja", () => {
    test("ne treba kreirati budžet ako odjelId nije poslan", async () => {
      await expect(
        service.createBudget({ ...validPayload, odjelId: undefined })
      ).rejects.toThrow("Odjel je obavezan.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako kategorijaIds je prazna lista", async () => {
      await expect(
        service.createBudget({ ...validPayload, kategorijaIds: [] })
      ).rejects.toThrow("Potrebno je odabrati barem jednu kategoriju.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("ne treba kreirati budžet ako kategorijaIds nije poslan", async () => {
      await expect(
        service.createBudget({ ...validPayload, kategorijaIds: undefined })
      ).rejects.toThrow("Potrebno je odabrati barem jednu kategoriju.");
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // updateBudget
  // ─────────────────────────────────────────────────────────────

  describe("updateBudget", () => {
    test("treba uspješno ažurirati postojeći budžet", async () => {
      const existing = { id: "1", naziv: "Stari naziv" };
      const updated = { id: "1", ...validPayload };
      mockBudgetRepository.getById.mockResolvedValue(existing);
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.update.mockResolvedValue(updated);

      const result = await service.updateBudget("1", validPayload);

      expect(result).toEqual(updated);
      expect(mockBudgetRepository.update).toHaveBeenCalledWith(
        "1",
        expect.objectContaining({ naziv: validPayload.naziv })
      );
    });

    test("treba obrisati keš budžeta nakon ažuriranja", async () => {
      mockBudgetRepository.getById.mockResolvedValue({ id: "1" });
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.update.mockResolvedValue({ id: "1", ...validPayload });
      mockBudgetRepository.getAll.mockResolvedValue([]);

      await service.getAllBudgets(); // popuni keš
      await service.updateBudget("1", validPayload);
      await service.getAllBudgets(); // treba pozvati repozitorij ponovo

      expect(mockBudgetRepository.getAll).toHaveBeenCalledTimes(2);
    });

    test("treba baciti grešku ako budžet ne postoji", async () => {
      mockBudgetRepository.getById.mockResolvedValue(null);

      await expect(service.updateBudget("99", validPayload)).rejects.toThrow(
        "Budzet ne postoji."
      );
      expect(mockBudgetRepository.update).not.toHaveBeenCalled();
    });

    // ✅ ISPRAVLJENO: poruka odgovara onoj u updateBudget() u servisu
    test("treba baciti grešku ako duplikat postoji pri ažuriranju", async () => {
      mockBudgetRepository.getById.mockResolvedValue({ id: "1" });
      mockBudgetRepository.existsDuplicate.mockResolvedValue(true);

      await expect(service.updateBudget("1", validPayload)).rejects.toThrow(
        "Nije moguce azurirati budzet jer za odabrani odjel i kategoriju vec postoji budzet u periodu koji se preklapa sa unesenim datumima."
      );
      expect(mockBudgetRepository.update).not.toHaveBeenCalled();
    });

    test("ne treba ažurirati budžet s neispravnim payloadom (validacija)", async () => {
      mockBudgetRepository.getById.mockResolvedValue({ id: "1" });

      await expect(
        service.updateBudget("1", { ...validPayload, naziv: "" })
      ).rejects.toThrow("Naziv budzeta je obavezan.");
      expect(mockBudgetRepository.update).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // updateBudgetStatus
  // ─────────────────────────────────────────────────────────────

  describe("updateBudgetStatus", () => {
    const authUser = { sub: "user-123", roles: ["finansijski_direktor"] };

    test("treba odobriti budžet i obrisati keš", async () => {
      const existing = { id: "1", statusOdobrenja: "NA_CEKANJU" };
      const updated = { id: "1", statusOdobrenja: "ODOBREN" };
      mockBudgetRepository.getById.mockResolvedValue(existing);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("korisnik-1");
      mockBudgetRepository.updateStatus.mockResolvedValue(updated);
      mockBudgetRepository.getAll.mockResolvedValue([]);

      await service.getAllBudgets(); // popuni keš
      const result = await service.updateBudgetStatus("1", "ODOBREN", authUser);
      await service.getAllBudgets(); // treba pozvati repozitorij ponovo

      expect(result).toEqual(updated);
      expect(mockBudgetRepository.updateStatus).toHaveBeenCalledWith("1", "ODOBREN", "korisnik-1");
      expect(mockBudgetRepository.getAll).toHaveBeenCalledTimes(2);
    });

    test("treba odbiti budžet i vratiti ažurirani budžet", async () => {
      const existing = { id: "1", statusOdobrenja: "NA_CEKANJU" };
      const updated = { id: "1", statusOdobrenja: "ODBIJEN" };
      mockBudgetRepository.getById.mockResolvedValue(existing);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("korisnik-1");
      mockBudgetRepository.updateStatus.mockResolvedValue(updated);

      const result = await service.updateBudgetStatus("1", "ODBIJEN", authUser);

      expect(result).toEqual(updated);
      expect(mockBudgetRepository.updateStatus).toHaveBeenCalledWith("1", "ODBIJEN", "korisnik-1");
    });

    test("treba baciti grešku ako status nije ODOBREN ili ODBIJEN", async () => {
      await expect(
        service.updateBudgetStatus("1", "NEVALIDAN", authUser)
      ).rejects.toThrow("Status budzeta mora biti ODOBREN ili ODBIJEN.");
      expect(mockBudgetRepository.getById).not.toHaveBeenCalled();
    });

    test("treba baciti grešku ako budžet ne postoji", async () => {
      mockBudgetRepository.getById.mockResolvedValue(null);

      await expect(
        service.updateBudgetStatus("99", "ODOBREN", authUser)
      ).rejects.toThrow("Budzet ne postoji.");
      expect(mockBudgetRepository.updateStatus).not.toHaveBeenCalled();
    });

    test("treba baciti grešku ako je budžet već odobren", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "ODOBREN",
      });

      await expect(
        service.updateBudgetStatus("1", "ODOBREN", authUser)
      ).rejects.toThrow("Budzet je vec odobren.");
      expect(mockBudgetRepository.updateStatus).not.toHaveBeenCalled();
    });

    test("treba baciti grešku ako nije moguće dohvatiti korisnika koji odobrava", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "NA_CEKANJU",
      });
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue(null);

      await expect(
        service.updateBudgetStatus("1", "ODOBREN", authUser)
      ).rejects.toThrow("Nije moguce evidentirati korisnika koji odobrava budzet.");
      expect(mockBudgetRepository.updateStatus).not.toHaveBeenCalled();
    });

    test("treba baciti grešku ako authUser nije proslijeđen", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "NA_CEKANJU",
      });

      await expect(
        service.updateBudgetStatus("1", "ODOBREN", undefined)
      ).rejects.toThrow("Nije moguce evidentirati korisnika koji odobrava budzet.");
      expect(mockBudgetRepository.updateStatus).not.toHaveBeenCalled();
    });
  });
});
