export {};

const mockExpenseService = {
  getReferenceData: jest.fn(),
  validateExpenseBeforeCreation: jest.fn(),
  createExpense: jest.fn(),
};

const mockIngestionRepository = {
  createHistoryEntry: jest.fn(),
  getHistory: jest.fn(),
};

jest.mock("../BLL/Services/ExpenseService", () => ({
  ExpenseService: jest.fn().mockImplementation(() => mockExpenseService),
}));

jest.mock("../DAL/Repositories/IngestionRepository", () => ({
  IngestionRepository: jest.fn().mockImplementation(() => mockIngestionRepository),
}));

const { IngestionService } = require("../BLL/Services/IngestionService");
const XLSX = require("xlsx");

describe("IngestionService", () => {
  let service: any;

  const referenceData = {
    kategorije: [{ id: "kat-1", naziv: "Oprema" }],
    odjeli: [{ id: "odj-1", naziv: "Finansije" }],
    valute: [{ id: "val-1", kod: "BAM" }],
    projekti: [{ id: "proj-1", naziv_projekta: "ERP" }],
    dobavljaci: [{ id: "dob-1", naziv_firme: "Dobavljac d.o.o." }],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    service = new IngestionService();
    mockExpenseService.getReferenceData.mockResolvedValue(referenceData);
    mockExpenseService.validateExpenseBeforeCreation.mockResolvedValue({
      isValid: true,
      validationErrors: [],
      warnings: [],
    });
  });

  test("treba parsirati CSV, mapirati sifarnike i vratiti validan preview", async () => {
    const csv = [
      "naziv,iznos,datum,kategorija,odjel,valuta,projekat,dobavljac,opis",
      "Laptop,1200.50,2026-05-01,Oprema,Finansije,BAM,ERP,Dobavljac d.o.o.,Nabavka laptopa",
    ].join("\n");

    const result = await service.previewImport({
      originalName: "troskovi.csv",
      mimetype: "text/csv",
      buffer: Buffer.from(csv),
    });

    expect(result.totalRows).toBe(1);
    expect(result.validRows).toBe(1);
    expect(result.invalidRows).toBe(0);
    expect(result.rows[0].expense).toEqual({
      naziv: "Laptop",
      iznos: 1200.5,
      datum: "2026-05-01",
      opis: "Nabavka laptopa",
      kategorijaId: "kat-1",
      odjelId: "odj-1",
      valutaId: "val-1",
      projekatId: "proj-1",
      dobavljacId: "dob-1",
    });
  });

  test("treba oznaciti red kao nevalidan ako obavezni podaci nedostaju", async () => {
    const csv = ["naziv,iznos,datum,kategorija,odjel,valuta", ",0,nije-datum,Oprema,,BAM"].join("\n");

    const result = await service.previewImport({
      originalName: "nevalidno.csv",
      mimetype: "text/csv",
      buffer: Buffer.from(csv),
    });

    expect(result.validRows).toBe(0);
    expect(result.invalidRows).toBe(1);
    expect(result.rows[0].isValid).toBe(false);
    expect(result.rows[0].errors.map((error: any) => error.field)).toEqual(
      expect.arrayContaining(["odjel", "naziv", "iznos", "datum"])
    );
  });

  test("treba podrzati lokalni format iznosa sa decimalnim zarezom", async () => {
    const csv = ["naziv,iznos,datum,kategorija,odjel,valuta", "Laptop,\"1.200,50\",01.05.2026,Oprema,Finansije,BAM"].join("\n");

    const result = await service.previewImport({
      originalName: "lokalni-format.csv",
      mimetype: "text/csv",
      buffer: Buffer.from(csv),
    });

    expect(result.rows[0].isValid).toBe(true);
    expect(result.rows[0].expense.iznos).toBe(1200.5);
    expect(result.rows[0].expense.datum).toBe("2026-05-01");
  });

  test("treba dodati AI upozorenja u preview za anomalije u importovanom fajlu", async () => {
    mockExpenseService.validateExpenseBeforeCreation.mockResolvedValue({
      isValid: true,
      validationErrors: [],
      warnings: [
        {
          type: "AMOUNT_OUTLIER_THRESHOLD",
          severity: "HIGH",
          message: "Iznos je znatno veći od prosjeka.",
        },
      ],
    });

    const csv = ["naziv,iznos,datum,kategorija,odjel,valuta", "Server,50000,2026-05-02,Oprema,Finansije,BAM"].join("\n");

    const result = await service.previewImport({
      originalName: "anomalije.csv",
      mimetype: "text/csv",
      buffer: Buffer.from(csv),
    });

    expect(result.validRows).toBe(1);
    expect(result.rows[0].warnings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "ai",
          type: "AMOUNT_OUTLIER_THRESHOLD",
          severity: "HIGH",
        }),
      ])
    );
  });

  test("treba oznaciti red kao nevalidan ako ExpenseService validacija odbije importovani red", async () => {
    mockExpenseService.validateExpenseBeforeCreation.mockResolvedValue({
      isValid: false,
      validationErrors: ["Datum troška ne može biti u budućnosti."],
      warnings: [],
    });

    const csv = ["naziv,iznos,datum,kategorija,odjel,valuta", "Server,500,2026-05-02,Oprema,Finansije,BAM"].join("\n");

    const result = await service.previewImport({
      originalName: "nevalidan-red.csv",
      mimetype: "text/csv",
      buffer: Buffer.from(csv),
    });

    expect(result.validRows).toBe(0);
    expect(result.invalidRows).toBe(1);
    expect(result.rows[0].isValid).toBe(false);
    expect(result.rows[0].errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          field: "expense",
          message: "Datum troška ne može biti u budućnosti.",
        }),
      ])
    );
  });

  test("treba potvrditi uvoz i upisati historiju", async () => {
    const expense = {
      naziv: "Laptop",
      iznos: 1200,
      datum: "2026-05-01",
      kategorijaId: "kat-1",
      odjelId: "odj-1",
      valutaId: "val-1",
    };
    mockExpenseService.createExpense.mockResolvedValue({ id: "t-1", ...expense });
    mockIngestionRepository.createHistoryEntry.mockResolvedValue("uvoz-1");

    const result = await service.confirmImport(
      {
        fileName: "troskovi.csv",
        rows: [{ rowNumber: 2, expense }],
      },
      { email: "admin@test.ba" }
    );

    expect(result.importId).toBe("uvoz-1");
    expect(result.insertedCount).toBe(1);
    expect(result.skippedCount).toBe(0);
    expect(mockExpenseService.createExpense).toHaveBeenCalledWith(expense, {
      email: "admin@test.ba",
    });
    expect(mockIngestionRepository.createHistoryEntry).toHaveBeenCalledWith(
      expect.objectContaining({
        fileName: "troskovi.csv",
        status: "USPJESAN",
        insertedCount: 1,
        importedRows: [{ id: "t-1", ...expense }],
        createdByEmail: "admin@test.ba",
      })
    );
  });

  test("treba parsirati XLSX fajl i vratiti redove iz prve radne sveske", async () => {
    const readSpy = jest.spyOn(XLSX, "read").mockReturnValue({
      SheetNames: ["Sheet1"],
      Sheets: { Sheet1: {} },
    } as any);
    const sheetSpy = jest.spyOn(XLSX.utils, "sheet_to_json").mockReturnValue([
      {
        naziv: "Laptop",
        iznos: "1200.50",
        datum: "2026-05-01",
        kategorija: "Oprema",
        odjel: "Finansije",
        valuta: "BAM",
      },
    ] as any);

    const result = await service.previewImport({
      originalName: "troskovi.xlsx",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("fake"),
    });

    expect(result.totalRows).toBe(1);
    expect(readSpy).toHaveBeenCalled();
    expect(sheetSpy).toHaveBeenCalled();

    readSpy.mockRestore();
    sheetSpy.mockRestore();
  });

  test("treba vratiti prazan preview za XLSX bez radne sveske", async () => {
    const readSpy = jest.spyOn(XLSX, "read").mockReturnValue({
      SheetNames: [],
      Sheets: {},
    } as any);

    const result = await service.previewImport({
      originalName: "prazan.xlsx",
      mimetype: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      buffer: Buffer.from("fake"),
    });

    expect(result.totalRows).toBe(0);
    expect(result.rows).toHaveLength(0);

    readSpy.mockRestore();
  });

  test("treba prijaviti nepoznat obavezni sifarnik kada je ID neispravan", async () => {
    const csv = [
      "naziv,iznos,datum,kategorijaId,odjelId,valutaId",
      "Laptop,1200,2026-05-01,nepostojeci-kat,odj-1,val-1",
    ].join("\n");

    const result = await service.previewImport({
      originalName: "nepostojeci-id.csv",
      mimetype: "text/csv",
      buffer: Buffer.from(csv),
    });

    expect(result.validRows).toBe(0);
    expect(result.rows[0].errors.some((error: any) => error.field === "kategorija")).toBe(true);
  });

  test("treba odbiti red sa praznim iznosom", async () => {
    const csv = [
      "naziv,iznos,datum,kategorija,odjel,valuta",
      "Laptop,,2026-05-01,Oprema,Finansije,BAM",
    ].join("\n");

    const result = await service.previewImport({
      originalName: "prazan-iznos.csv",
      mimetype: "text/csv",
      buffer: Buffer.from(csv),
    });

    expect(result.validRows).toBe(0);
    expect(result.rows[0].errors.some((error: any) => error.field === "iznos")).toBe(true);
  });

  test("treba baciti gresku ako fajl nije poslan", async () => {
  await expect(service.previewImport({ originalName: "", buffer: null })).rejects.toThrow(
    "Fajl za uvoz je obavezan."
  );
});

test("treba odbiti nepodrzan format fajla", async () => {
  await expect(
    service.previewImport({
      originalName: "troskovi.txt",
      mimetype: "text/plain",
      buffer: Buffer.from("test"),
    })
  ).rejects.toThrow("Podržani formati su CSV, XLS i XLSX.");
});

test("treba podrzati ID kolone i prazne opcionalne reference", async () => {
  const csv = [
    "naziv,iznos,datum,kategorijaId,odjelId,valutaId,opis",
    "Monitor,300,2026-05-02,kat-1,odj-1,val-1,"
  ].join("\n");

  const result = await service.previewImport({
    originalName: "ids.csv",
    mimetype: "text/csv",
    buffer: Buffer.from(csv),
  });

  expect(result.validRows).toBe(1);
  expect(result.rows[0].expense).toEqual(
    expect.objectContaining({
      kategorijaId: "kat-1",
      odjelId: "odj-1",
      valutaId: "val-1",
      projekatId: null,
      dobavljacId: null,
      opis: null,
    })
  );
});

test("treba vratiti warning kada opcionalni projekat ili dobavljac ne postoje", async () => {
  const csv = [
    "naziv,iznos,datum,kategorija,odjel,valuta,projekat,dobavljac",
    "Monitor,300,2026-05-02,Oprema,Finansije,BAM,Nepostojeci projekat,Nepostojeci dobavljac"
  ].join("\n");

  const result = await service.previewImport({
    originalName: "warnings.csv",
    mimetype: "text/csv",
    buffer: Buffer.from(csv),
  });

  expect(result.rows[0].isValid).toBe(false);
  expect(result.rows[0].warnings.length).toBeGreaterThan(0);
});

test("treba vratiti djelimican status ako se neki redovi ne upisu", async () => {
  mockExpenseService.createExpense
    .mockResolvedValueOnce({ id: "t-1" })
    .mockRejectedValueOnce(new Error("Nevalidan red"));
  mockIngestionRepository.createHistoryEntry.mockResolvedValue("uvoz-2");

  const result = await service.confirmImport(
    {
      fileName: "mixed.csv",
      rows: [
        { rowNumber: 2, expense: { naziv: "OK" } },
        { rowNumber: 3, expense: { naziv: "BAD" } },
      ],
    },
    { preferred_username: "admin@test.ba" }
  );

  expect(result.insertedCount).toBe(1);
  expect(result.skippedCount).toBe(1);
  expect(result.errors[0].message).toBe("Nevalidan red");
  expect(mockIngestionRepository.createHistoryEntry).toHaveBeenCalledWith(
    expect.objectContaining({
      status: "DJELIMICAN",
      createdByEmail: "admin@test.ba",
    })
  );
});

test("treba vratiti neuspjesan status ako nijedan red nije upisan", async () => {
  mockExpenseService.createExpense.mockRejectedValue({});
  mockIngestionRepository.createHistoryEntry.mockResolvedValue("uvoz-3");

  const result = await service.confirmImport({
    fileName: "failed.csv",
    rows: [{ rowNumber: 2, expense: { naziv: "BAD" } }],
  });

  expect(result.insertedCount).toBe(0);
  expect(result.skippedCount).toBe(1);
  expect(result.errors[0].message).toBe("Red nije moguće upisati.");
  expect(mockIngestionRepository.createHistoryEntry).toHaveBeenCalledWith(
    expect.objectContaining({
      status: "NEUSPJESAN",
      createdByEmail: null,
    })
  );
});

test("treba baciti gresku ako nema redova za potvrdu", async () => {
  await expect(service.confirmImport({ fileName: "empty.csv", rows: [] })).rejects.toThrow(
    "Nema redova za potvrdu uvoza."
  );
});

test("treba vratiti historiju uvoza", async () => {
  const history = [{ id: "uvoz-1", fileName: "troskovi.csv" }];
  mockIngestionRepository.getHistory.mockResolvedValue(history);

  await expect(service.getImportHistory()).resolves.toEqual(history);
});

});
