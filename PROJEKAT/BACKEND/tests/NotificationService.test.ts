export {};

const mockNotificationRepository = {
  getRecipientsForAnomalyNotifications: jest.fn(),
  createForUsers: jest.fn(),
  createForUsersIfAbsent: jest.fn(),
  getUserIdFromAuth: jest.fn(),
  getByUserId: jest.fn(),
  getAllNotifications: jest.fn(),
  getUnreadCountByUserId: jest.fn(),
  getUnreadCount: jest.fn(),
  markAsRead: jest.fn(),
  markAsReadById: jest.fn(),
  markActionHandledByExpenseId: jest.fn(),
  hasRole: jest.fn(),
};

jest.mock("../DAL/Repositories/NotificationRepository", () => ({
  NotificationRepository: jest.fn().mockImplementation(() => mockNotificationRepository),
}));

const { NotificationService } = require("../BLL/Services/NotificationService");

describe("NotificationService", () => {
  let service: any;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new NotificationService();
    mockNotificationRepository.hasRole.mockReturnValue(false);
  });

  test("treba kreirati notifikaciju za glavne racunovodje sa sazetkom anomalije", async () => {
    mockNotificationRepository.getRecipientsForAnomalyNotifications.mockResolvedValue([
      { id: "user-1" },
      { id: "user-2" },
    ]);
    mockNotificationRepository.createForUsers.mockResolvedValue([{ id: "notif-1" }]);

    const expense = { naziv: "Laptop", iznos: 3000, valuta: "BAM" };
    const analysis = {
      severity: "HIGH",
      explanation: "Iznos je veci od prosjeka.",
      recommendedAction: "Provjeriti odobrenje.",
    };

    await service.createAnomalyNotification(expense, analysis);

    expect(mockNotificationRepository.createForUsers).toHaveBeenCalledWith(
      ["user-1", "user-2"],
      expect.objectContaining({
        naslov: "AI anomalija: Laptop",
        prioritet: "HIGH",
        poruka: expect.stringContaining("Iznos je veci od prosjeka."),
      })
    );
  });

  test("treba vratiti notifikacije za autentifikovanog korisnika", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue("user-1");
    mockNotificationRepository.getByUserId.mockResolvedValue([{ id: "notif-1" }]);

    const result = await service.getNotificationsForUser({ sub: "user" });

    expect(result).toEqual([{ id: "notif-1" }]);
    expect(mockNotificationRepository.getByUserId).toHaveBeenCalledWith("user-1");
  });

  test("finansijski direktor treba vidjeti sve notifikacije", async () => {
    mockNotificationRepository.hasRole.mockReturnValue(true);
    mockNotificationRepository.getAllNotifications.mockResolvedValue([{ id: "notif-1" }, { id: "notif-2" }]);

    const result = await service.getNotificationsForUser({ sub: "fd-1" });

    expect(result).toEqual([{ id: "notif-1" }, { id: "notif-2" }]);
    expect(mockNotificationRepository.getAllNotifications).toHaveBeenCalled();
    expect(mockNotificationRepository.getUserIdFromAuth).not.toHaveBeenCalled();
  });

  test("treba oznaciti notifikaciju kao procitanu", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue("user-1");
    mockNotificationRepository.markAsRead.mockResolvedValue({ id: "notif-1", procitano: true });

    const result = await service.markAsRead("notif-1", { sub: "user" });

    expect(result.procitano).toBe(true);
    expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith("notif-1", "user-1");
  });

  test("finansijski direktor moze oznaciti bilo koju notifikaciju kao procitanu", async () => {
    mockNotificationRepository.hasRole.mockReturnValue(true);
    mockNotificationRepository.markAsReadById.mockResolvedValue({ id: "notif-1", procitano: true });

    const result = await service.markAsRead("notif-1", { sub: "fd-1" });

    expect(result.procitano).toBe(true);
    expect(mockNotificationRepository.markAsReadById).toHaveBeenCalledWith("notif-1");
    expect(mockNotificationRepository.getUserIdFromAuth).not.toHaveBeenCalled();
  });

  test("getNotificationsForUser baca gresku kada nema userId", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue(null);
    await expect(service.getNotificationsForUser({})).rejects.toThrow("Nije moguce dohvatiti korisnika za notifikacije.");
  });

  test("getUnreadCountForUser baca gresku kada nema userId", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue(null);
    await expect(service.getUnreadCountForUser({})).rejects.toThrow("Nije moguce dohvatiti korisnika za notifikacije.");
  });

  test("finansijski direktor dobija ukupan broj neprocitanih notifikacija", async () => {
    mockNotificationRepository.hasRole.mockReturnValue(true);
    mockNotificationRepository.getUnreadCount.mockResolvedValue(11);

    await expect(service.getUnreadCountForUser({ sub: "fd-1" })).resolves.toBe(11);
    expect(mockNotificationRepository.getUnreadCount).toHaveBeenCalled();
    expect(mockNotificationRepository.getUserIdFromAuth).not.toHaveBeenCalled();
  });

  test("markAsRead baca gresku kada id nije proslijedjen", async () => {
    await expect(service.markAsRead("", {})).rejects.toThrow("ID notifikacije je obavezan.");
  });

  test("markAsRead baca gresku kada notifikacija ne postoji", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue("user-1");
    mockNotificationRepository.markAsRead.mockResolvedValue(null);
    await expect(service.markAsRead("notif-1", { sub: "user" })).rejects.toThrow("Notifikacija ne postoji ili ne pripada korisniku.");
  });

  test("createAnomalyNotification vraca prazan niz kada nema recipienta", async () => {
    mockNotificationRepository.getRecipientsForAnomalyNotifications.mockResolvedValue([]);
    mockNotificationRepository.createForUsers.mockResolvedValue([]);

    const expense = { naziv: "Stavka", iznos: 10 };
    const analysis = { severity: "LOW" };

    const res = await service.createAnomalyNotification(expense, analysis);
    expect(res).toEqual([]);
  });

  test("treba kreirati notifikaciju za potencijalni dupli trosak", async () => {
    mockNotificationRepository.getRecipientsForAnomalyNotifications.mockResolvedValue([{ id: "user-1" }]);
    mockNotificationRepository.createForUsers.mockResolvedValue([{ id: "notif-dup" }]);

    await service.createPotentialDuplicateNotification(
      { id: "trosak-1", naziv: "Sto", iznos: 20000, valuta: "BAM" },
      { explanation: "Pronadjen je moguci duplikat." }
    );

    expect(mockNotificationRepository.createForUsers).toHaveBeenCalledWith(
      ["user-1"],
      expect.objectContaining({
        naslov: "Dupli trosak: Sto",
        tipNotifikacije: "DUPLI_TROSAK",
        povezaniTrosakId: "trosak-1",
      })
    );
  });

  test("treba kreirati info notifikaciju kada je budzet vracen na doradu", async () => {
    mockNotificationRepository.createForUsers.mockResolvedValue([{ id: "notif-budget-return" }]);

    await service.createBudgetReturnedToRevisionNotification(
      { id: "b-1", naziv: "Budzet Q1", kreiraoKorisnikId: "creator-1" },
      "Potrebna je korekcija."
    );

    expect(mockNotificationRepository.createForUsers).toHaveBeenCalledWith(
      ["creator-1"],
      expect.objectContaining({
        naslov: 'Budzet "Budzet Q1" vracen je na doradu',
        prioritet: "LOW",
        tipNotifikacije: "budzet_vracen_na_doradu",
      })
    );
  });

  test("treba kreirati deduplicirano upozorenje za izostali periodicni trosak", async () => {
    mockNotificationRepository.getRecipientsForAnomalyNotifications.mockResolvedValue([{ id: "user-1" }]);
    mockNotificationRepository.createForUsersIfAbsent.mockResolvedValue([{ id: "notif-recurring" }]);

    const result = await service.createMissingRecurringExpenseNotifications([
      {
        expenseName: "Internet usluge",
        expectedMonth: "06.2026",
        averageAmount: 120,
        recommendation: "Provjeriti da li racun jos nije unesen.",
      },
    ]);

    expect(result).toEqual([{ id: "notif-recurring" }]);
    expect(mockNotificationRepository.createForUsersIfAbsent).toHaveBeenCalledWith(
      ["user-1"],
      expect.objectContaining({
        naslov: "Izostao periodicni trosak: Internet usluge (06.2026)",
        tipNotifikacije: "IZOSTAO_PERIODICNI_TROSAK",
        poruka: expect.stringContaining("120.00 BAM"),
      })
    );
  });

  test("treba kreirati info notifikaciju kada je budzet ponovo poslan na odobravanje", async () => {
    mockNotificationRepository.createForUsers.mockResolvedValue([{ id: "notif-budget-revised" }]);

    await service.createBudgetRevisedNotification(
      { id: "b-1", naziv: "Budzet Q1" },
      "fd-1"
    );

    expect(mockNotificationRepository.createForUsers).toHaveBeenCalledWith(
      ["fd-1"],
      expect.objectContaining({
        naslov: 'Budzet "Budzet Q1" je doradjen',
        prioritet: "LOW",
        tipNotifikacije: "budzet_doradjen",
      })
    );
  });

  test("upozorenja za periodicne troskove vracaju prazno bez troskova ili primalaca", async () => {
    await expect(service.createMissingRecurringExpenseNotifications([])).resolves.toEqual([]);
    expect(mockNotificationRepository.getRecipientsForAnomalyNotifications).not.toHaveBeenCalled();

    mockNotificationRepository.getRecipientsForAnomalyNotifications.mockResolvedValue([]);
    await expect(service.createMissingRecurringExpenseNotifications([{ expenseName: "Internet" }])).resolves.toEqual([]);
    expect(mockNotificationRepository.createForUsersIfAbsent).not.toHaveBeenCalled();
  });

  test("markDuplicateActionHandled delegira repository poziv", async () => {
    mockNotificationRepository.markActionHandledByExpenseId.mockResolvedValue([{ id: "notif-1" }]);

    const result = await service.markDuplicateActionHandled("trosak-1", "SACUVAN");

    expect(result).toEqual([{ id: "notif-1" }]);
    expect(mockNotificationRepository.markActionHandledByExpenseId).toHaveBeenCalledWith("trosak-1", "SACUVAN");
  });

  test("createAnomalyNotification koristi fallback vrijednosti za nepotpun trosak i analizu", async () => {
    mockNotificationRepository.getRecipientsForAnomalyNotifications.mockResolvedValue([{ id: "user-1" }]);
    mockNotificationRepository.createForUsers.mockResolvedValue([{ id: "notif-1" }]);

    await service.createAnomalyNotification({}, {});

    expect(mockNotificationRepository.createForUsers).toHaveBeenCalledWith(
      ["user-1"],
      expect.objectContaining({
        naslov: "AI anomalija: Trosak",
        prioritet: "MEDIUM",
        povezaniTrosakId: null,
        poruka: expect.stringContaining('Trosak "bez naziva" (0.00 BAM)'),
      })
    );
  });

  test("createPotentialDuplicateNotification koristi fallback vrijednosti za nepotpun trosak i analizu", async () => {
    mockNotificationRepository.getRecipientsForAnomalyNotifications.mockResolvedValue([{ id: "user-1" }]);
    mockNotificationRepository.createForUsers.mockResolvedValue([{ id: "notif-1" }]);

    await service.createPotentialDuplicateNotification({}, {});

    expect(mockNotificationRepository.createForUsers).toHaveBeenCalledWith(
      ["user-1"],
      expect.objectContaining({
        naslov: "Dupli trosak: Trosak",
        povezaniTrosakId: null,
        poruka: expect.stringContaining('Trosak "bez naziva" (0.00 BAM)'),
      })
    );
  });

  test("getUnreadCountForUser vraca broj neprocitanih za korisnika", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue("user-1");
    mockNotificationRepository.getUnreadCountByUserId.mockResolvedValue(5);

    await expect(service.getUnreadCountForUser({ sub: "user" })).resolves.toBe(5);
    expect(mockNotificationRepository.getUnreadCountByUserId).toHaveBeenCalledWith("user-1");
  });

  test("markAsRead baca gresku kada nema korisnika", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue(null);

    await expect(service.markAsRead("notif-1", {})).rejects.toThrow("Nije moguce dohvatiti korisnika za notifikacije.");
  });

  test("markDuplicateActionHandled vraca prazan niz bez expenseId", async () => {
    await expect(service.markDuplicateActionHandled("", "OBRISAN")).resolves.toEqual([]);
    expect(mockNotificationRepository.markActionHandledByExpenseId).not.toHaveBeenCalled();
  });
});
