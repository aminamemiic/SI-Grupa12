export {};

const mockBudgetRepository = {
  getAll: jest.fn(),
  getById: jest.fn(),
  getReferenceData: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  updateStatus: jest.fn(),
  vratiNaDoradu: jest.fn(),
  getKomentari: jest.fn(),
  dodajKomentar: jest.fn(),
  existsDuplicate: jest.fn(),
  getUserIdFromAuth: jest.fn(),
  getBudgetSpentStats: jest.fn(),
};

const mockNotificationService = {
  createBudgetReturnedToRevisionNotification: jest.fn(),
  createBudgetRevisedNotification: jest.fn(),
};

jest.mock("../DAL/Repositories/BudgetRepository", () => ({
  BudgetRepository: jest.fn().mockImplementation(() => mockBudgetRepository),
}));

jest.mock("../BLL/Services/NotificationService", () => ({
  NotificationService: jest.fn().mockImplementation(() => mockNotificationService),
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

    test("treba prihvatiti datume u formatu DD.MM.YYYY i normalizovati ih prije upisa", async () => {
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
        }),
        null
      );
    });

    test("ne treba kreirati budzet ako DD.MM.YYYY datum pocetka nije kalendarski validan", async () => {
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

  // ─────────────────────────────────────────────────────────────
  describe("vratiNaDoradu", () => {
    const authUser = {
      sub: "finansijski-dokument-1",
      name: "Amra Direktorica",
      roles: ["finansijski_direktor"],
    };

    test("treba uspješno vratiti budžet na doradu kada je status na_cekanju", async () => {
      const existing = {
        id: "1",
        naziv: "Budzet",
        statusOdobrenja: "na_cekanju",
        kreiraoKorisnikId: "creator-1",
      };
      const updated = { ...existing, statusOdobrenja: "na_doradi" };

      mockBudgetRepository.getById.mockResolvedValue(existing);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("fd-db-1");
      mockBudgetRepository.vratiNaDoradu.mockResolvedValue(updated);
      mockNotificationService.createBudgetReturnedToRevisionNotification.mockResolvedValue([]);

      const result = await service.vratiNaDoradu(1, "Potrebna je korekcija.", authUser);

      expect(result).toEqual(updated);
      expect(mockBudgetRepository.vratiNaDoradu).toHaveBeenCalledWith(
        1,
        "fd-db-1",
        "Amra Direktorica",
        "Potrebna je korekcija."
      );
      expect(mockNotificationService.createBudgetReturnedToRevisionNotification).toHaveBeenCalledWith(
        updated,
        "Potrebna je korekcija."
      );
    });

    test("ne treba dozvoliti povrat ako budžet nije u statusu na_cekanju ili nacrt", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "ODOBREN",
      });

      await expect(service.vratiNaDoradu(1, "Komentar", authUser)).rejects.toThrow(
        "Budžet mora biti u statusu 'nacrt' ili 'na čekanju' da bi se mogao vratiti na doradu."
      );
      expect(mockBudgetRepository.vratiNaDoradu).not.toHaveBeenCalled();
    });

    test("ne treba dozvoliti povrat s praznim komentarom", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "na_cekanju",
        kreiraoKorisnikId: "creator-1",
      });
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("fd-db-1");

      await expect(service.vratiNaDoradu(1, "   ", authUser)).rejects.toThrow(
        "Komentar je obavezan pri povratu budžeta na doradu."
      );
      expect(mockBudgetRepository.vratiNaDoradu).not.toHaveBeenCalled();
    });

    test("ne treba dozvoliti povrat korisniku bez odgovarajuće role", async () => {
      const unauthorizedUser = { sub: "user-1", roles: ["glavni_racunovodja"] };

      await expect(service.vratiNaDoradu(1, "Komentar", unauthorizedUser)).rejects.toThrow(
        "Nemate dozvolu za ovu akciju."
      );
    });
  });

  describe("submitujDoradu", () => {
    const authUser = {
      sub: "creator-1",
      name: "Haris Racunovodja",
      roles: ["glavni_racunovodja"],
    };

    test("treba uspješno submitovati doradu kada je status na_doradi", async () => {
      const existing = {
        id: "1",
        naziv: "Budzet",
        statusOdobrenja: "na_doradi",
        kreiraoKorisnikId: "creator-1",
        odobrioKorisnikId: "fd-1",
      };
      const updated = { ...existing, statusOdobrenja: "na_cekanju" };

      mockBudgetRepository.getById.mockResolvedValue(existing);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("creator-1");
      mockBudgetRepository.updateStatus.mockResolvedValue(updated);
      mockBudgetRepository.dodajKomentar.mockResolvedValue({
        id: 10,
        komentar: "Budžet je dorađen i ponovo poslan na odobravanje.",
      });
      mockNotificationService.createBudgetRevisedNotification.mockResolvedValue([]);

      const result = await service.submitujDoradu(1, authUser);

      expect(result).toEqual(updated);
      expect(mockBudgetRepository.updateStatus).toHaveBeenCalledWith("1", "na_cekanju", "fd-1");
      expect(mockBudgetRepository.dodajKomentar).toHaveBeenCalledWith(
        "1",
        "creator-1",
        "Haris Racunovodja",
        "Budžet je dorađen i ponovo poslan na odobravanje.",
        "ispravka"
      );
      expect(mockNotificationService.createBudgetRevisedNotification).toHaveBeenCalledWith(
        updated,
        "fd-1"
      );
    });

    test("ne treba dozvoliti submitovanje dorade od strane korisnika koji nije kreator budžeta", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "na_doradi",
        kreiraoKorisnikId: "creator-1",
        odobrioKorisnikId: "fd-1",
      });
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("neko-drugi");

      await expect(service.submitujDoradu(1, authUser)).rejects.toThrow(
        "Samo kreator budžeta može submitovati doradu."
      );
      expect(mockBudgetRepository.updateStatus).not.toHaveBeenCalled();
    });
  });

  // getBudgetProjection
  // ─────────────────────────────────────────────────────────────

  describe("getBudgetProjection", () => {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    test("treba izračunati projekciju budžeta sa pozitivnim krajnjim stanjem", async () => {
      mockBudgetRepository.getBudgetSpentStats.mockResolvedValue({
        planiraniIznos: 100000,
        potrosenoPrijeOvogMjeseca: 34000,
        potrosenoUovomMjesecu: 8000,
      });

      const result = await service.getBudgetProjection("budget-1");

      expect(result.budgetId).toBe("budget-1");
      expect(result.planiraniIznos).toBe(100000);
      expect(result.potrosenoPrijeOvogMjeseca).toBe(34000);
      expect(result.potrosenoUovomMjesecu).toBe(8000);

      // Dnevna brzina = 8000 / currentDay
      const expectedDailyRate = 8000 / currentDay;
      expect(result.dnevnaBrzinaTrosenja).toBeCloseTo(expectedDailyRate, 2);

      // Projektovana potrošnja za mjesec = dnevna brzina * dani u mjesecu
      const expectedProjectedMonth = expectedDailyRate * daysInMonth;
      expect(result.projektovanaPotrosnjaZaMjesec).toBeCloseTo(expectedProjectedMonth, 2);

      // Krajnje stanje = 100000 - 34000 - projektovana potrošnja
      const expectedFinalBalance = 100000 - 34000 - expectedProjectedMonth;
      expect(result.projektovanoKrajnjeStanje).toBeCloseTo(expectedFinalBalance, 2);

      expect(mockBudgetRepository.getBudgetSpentStats).toHaveBeenCalledWith("budget-1");
    });

    test("treba izračunati negativno krajnje stanje kada je potrošnja previsoka", async () => {
      mockBudgetRepository.getBudgetSpentStats.mockResolvedValue({
        planiraniIznos: 15000,
        potrosenoPrijeOvogMjeseca: 5000,
        potrosenoUovomMjesecu: 12000,
      });

      const result = await service.getBudgetProjection("budget-2");

      expect(result.budgetId).toBe("budget-2");
      expect(result.planiraniIznos).toBe(15000);

      const expectedDailyRate = 12000 / currentDay;
      const expectedProjectedMonth = expectedDailyRate * daysInMonth;
      const expectedFinalBalance = 15000 - 5000 - expectedProjectedMonth;

      expect(result.projektovanoKrajnjeStanje).toBeCloseTo(expectedFinalBalance, 2);
      // Ovo bi trebalo biti negativno (probijanje budžeta)
      expect(result.projektovanoKrajnjeStanje).toBeLessThan(0);
    });

    test("treba vratiti nulu za dnevnu brzinu trošenja ako je potrošnja nula", async () => {
      mockBudgetRepository.getBudgetSpentStats.mockResolvedValue({
        planiraniIznos: 50000,
        potrosenoPrijeOvogMjeseca: 0,
        potrosenoUovomMjesecu: 0,
      });

      const result = await service.getBudgetProjection("budget-3");

      expect(result.dnevnaBrzinaTrosenja).toBe(0);
      expect(result.projektovanaPotrosnjaZaMjesec).toBe(0);
      // Krajnje stanje = planirani iznos jer nema potrošnje
      expect(result.projektovanoKrajnjeStanje).toBe(50000);
    });

    test("treba proslijediti budgetId repozitoriju", async () => {
      mockBudgetRepository.getBudgetSpentStats.mockResolvedValue({
        planiraniIznos: 10000,
        potrosenoPrijeOvogMjeseca: 0,
        potrosenoUovomMjesecu: 0,
      });

      await service.getBudgetProjection("my-uuid-123");

      expect(mockBudgetRepository.getBudgetSpentStats).toHaveBeenCalledWith("my-uuid-123");
    });

    test("treba baciti grešku ako budžet ne postoji u repozitoriju", async () => {
      mockBudgetRepository.getBudgetSpentStats.mockRejectedValue(
        new Error("Budzet ne postoji.")
      );

      await expect(service.getBudgetProjection("nepostojeci-id")).rejects.toThrow(
        "Budzet ne postoji."
      );
    });

    test("treba vratiti sve potrebne ključeve u odgovoru", async () => {
      mockBudgetRepository.getBudgetSpentStats.mockResolvedValue({
        planiraniIznos: 20000,
        potrosenoPrijeOvogMjeseca: 3000,
        potrosenoUovomMjesecu: 1500,
      });

      const result = await service.getBudgetProjection("budget-keys");

      expect(result).toHaveProperty("budgetId");
      expect(result).toHaveProperty("planiraniIznos");
      expect(result).toHaveProperty("potrosenoPrijeOvogMjeseca");
      expect(result).toHaveProperty("potrosenoUovomMjesecu");
      expect(result).toHaveProperty("dnevnaBrzinaTrosenja");
      expect(result).toHaveProperty("projektovanaPotrosnjaZaMjesec");
      expect(result).toHaveProperty("projektovanoKrajnjeStanje");
    });
  });
  describe("additional branch coverage", () => {
    test("createBudget baca gresku kada kreator ne moze biti evidentiran", async () => {
      const authUser = { sub: "user-1", roles: ["admin"] };
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue(null);

      await expect(service.createBudget(validPayload, authUser)).rejects.toThrow(
        "Nije moguce evidentirati kreatora budzeta."
      );
      expect(mockBudgetRepository.create).not.toHaveBeenCalled();
    });

    test("createBudget mapira overlap gresku iz repozitorija", async () => {
      const authUser = { sub: "user-1", roles: ["admin"] };
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("user-1");
      mockBudgetRepository.create.mockRejectedValue({
        constraint: "budzeti_odjel_id_daterange_excl",
      });

      await expect(service.createBudget(validPayload, authUser)).rejects.toThrow(
        "Nije moguce kreirati budzet jer za odabrani odjel vec postoji budzet u periodu koji se preklapa sa unesenim datumima."
      );
    });

    test("createBudget odbija neispravan ISO datum", async () => {
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      await expect(
        service.createBudget({
          ...validPayload,
          datumPocetka: "2026-02-31",
          datumZavrsetka: "2026-12-31",
        })
      ).rejects.toThrow("Datum pocetka je obavezan i mora biti validan.");
    });

    test("updateBudget mapira overlap gresku iz repozitorija", async () => {
      mockBudgetRepository.getById.mockResolvedValue({ id: "1" });
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.update.mockRejectedValue({
        constraint: "budzeti_odjel_id_daterange_excl",
      });

      await expect(service.updateBudget("1", validPayload)).rejects.toThrow(
        "Nije moguce azurirati budzet jer za odabrani odjel vec postoji budzet u periodu koji se preklapa sa unesenim datumima."
      );
    });

    test("updateBudget propagira genericku gresku repozitorija", async () => {
      mockBudgetRepository.getById.mockResolvedValue({ id: "1" });
      mockBudgetRepository.existsDuplicate.mockResolvedValue(false);
      mockBudgetRepository.update.mockRejectedValue(new Error("db"));

      await expect(service.updateBudget("1", validPayload)).rejects.toThrow("db");
    });

    test("vratiNaDoradu koristi sastavljeno ime iz auth korisnika", async () => {
      const authUser = {
        sub: "fd-1",
        given_name: "Amra Amra",
        family_name: "Direktorica Direktorica",
        roles: ["finansijski_direktor"],
      };
      const existing = {
        id: "1",
        naziv: "Budzet",
        statusOdobrenja: "na_cekanju",
        kreiraoKorisnikId: "creator-1",
      };

      mockBudgetRepository.getById.mockResolvedValue(existing);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("fd-db-1");
      mockBudgetRepository.vratiNaDoradu.mockResolvedValue({
        ...existing,
        statusOdobrenja: "na_doradi",
      });
      mockNotificationService.createBudgetReturnedToRevisionNotification.mockResolvedValue([]);

      await service.vratiNaDoradu(1, "Potrebna je korekcija.", authUser);

      expect(mockBudgetRepository.vratiNaDoradu).toHaveBeenCalledWith(
        1,
        "fd-db-1",
        "Amra Direktorica",
        "Potrebna je korekcija."
      );
    });

    test("vratiNaDoradu koristi resource_access za autorizaciju", async () => {
      const authUser = {
        sub: "fd-1",
        preferred_username: "amra.direktorica",
        resource_access: {
          app: { roles: ["finansijski_direktor"] },
        },
      };
      const existing = {
        id: "1",
        naziv: "Budzet",
        statusOdobrenja: "na_cekanju",
        kreiraoKorisnikId: "creator-1",
      };

      mockBudgetRepository.getById.mockResolvedValue(existing);
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue("fd-db-1");
      mockBudgetRepository.vratiNaDoradu.mockResolvedValue({
        ...existing,
        statusOdobrenja: "na_doradi",
      });
      mockNotificationService.createBudgetReturnedToRevisionNotification.mockResolvedValue([]);

      await service.vratiNaDoradu(1, "Komentar", authUser);

      expect(mockBudgetRepository.vratiNaDoradu).toHaveBeenCalledWith(
        1,
        "fd-db-1",
        "amra.direktorica",
        "Komentar"
      );
    });

    test("vratiNaDoradu baca gresku kada budzet ne postoji", async () => {
      mockBudgetRepository.getById.mockResolvedValue(null);

      await expect(service.vratiNaDoradu(1, "Komentar", { sub: "fd-1", roles: ["finansijski_direktor"] })).rejects.toThrow(
        "Budzet ne postoji."
      );
    });

    test("vratiNaDoradu baca gresku kada se ne moze identifikovati autor", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        naziv: "Budzet",
        statusOdobrenja: "na_cekanju",
        kreiraoKorisnikId: "creator-1",
      });
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue(null);

      await expect(service.vratiNaDoradu(1, "Komentar", { sub: "fd-1", roles: ["finansijski_direktor"] })).rejects.toThrow(
        "Nije moguce evidentirati korisnika koji vraca budzet na doradu."
      );
    });

    test("submitujDoradu baca gresku kada se kreator ne moze identifikovati", async () => {
      const authUser = {
        sub: "creator-1",
        name: "Haris Racunovodja",
        roles: ["glavni_racunovodja"],
      };

      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "na_doradi",
        kreiraoKorisnikId: "creator-1",
        odobrioKorisnikId: "fd-1",
      });
      mockBudgetRepository.getUserIdFromAuth.mockResolvedValue(null);

      await expect(service.submitujDoradu(1, authUser)).rejects.toThrow(
        /Samo kreator bud.* submitovati doradu\./
      );
    });

    test("submitujDoradu baca gresku kada budzet ne postoji", async () => {
      mockBudgetRepository.getById.mockResolvedValue(null);

      await expect(service.submitujDoradu(1, { sub: "creator-1", roles: ["glavni_racunovodja"] })).rejects.toThrow(
        "Budzet ne postoji."
      );
    });

    test("submitujDoradu baca gresku kada rola nije glavni racunovodja", async () => {
      await expect(service.submitujDoradu(1, { sub: "creator-1", roles: ["finansijski_direktor"] })).rejects.toThrow(
        "Nemate dozvolu za ovu akciju."
      );
    });

    test("submitujDoradu baca gresku kada budzet nije na_doradi", async () => {
      mockBudgetRepository.getById.mockResolvedValue({
        id: "1",
        statusOdobrenja: "nacrt",
        kreiraoKorisnikId: "creator-1",
      });

      await expect(service.submitujDoradu(1, { sub: "creator-1", roles: ["glavni_racunovodja"] })).rejects.toThrow(
        /Bud.* mora biti u statusu 'na_doradi' da bi se mogao submitovati\./
      );
    });
  });
});
