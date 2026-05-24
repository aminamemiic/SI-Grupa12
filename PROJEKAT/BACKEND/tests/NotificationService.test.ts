export {};

const mockNotificationRepository = {
  getRecipientsForAnomalyNotifications: jest.fn(),
  createForUsers: jest.fn(),
  getUserIdFromAuth: jest.fn(),
  getByUserId: jest.fn(),
  getUnreadCountByUserId: jest.fn(),
  markAsRead: jest.fn(),
  markActionHandledByExpenseId: jest.fn(),
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

  test("treba oznaciti notifikaciju kao procitanu", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue("user-1");
    mockNotificationRepository.markAsRead.mockResolvedValue({ id: "notif-1", procitano: true });

    const result = await service.markAsRead("notif-1", { sub: "user" });

    expect(result.procitano).toBe(true);
    expect(mockNotificationRepository.markAsRead).toHaveBeenCalledWith("notif-1", "user-1");
  });

  test("getNotificationsForUser baca gresku kada nema userId", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue(null);
    await expect(service.getNotificationsForUser({})).rejects.toThrow("Nije moguce dohvatiti korisnika za notifikacije.");
  });

  test("getUnreadCountForUser baca gresku kada nema userId", async () => {
    mockNotificationRepository.getUserIdFromAuth.mockResolvedValue(null);
    await expect(service.getUnreadCountForUser({})).rejects.toThrow("Nije moguce dohvatiti korisnika za notifikacije.");
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

  test("markDuplicateActionHandled delegira repository poziv", async () => {
    mockNotificationRepository.markActionHandledByExpenseId.mockResolvedValue([{ id: "notif-1" }]);

    const result = await service.markDuplicateActionHandled("trosak-1", "SACUVAN");

    expect(result).toEqual([{ id: "notif-1" }]);
    expect(mockNotificationRepository.markActionHandledByExpenseId).toHaveBeenCalledWith("trosak-1", "SACUVAN");
  });
});
