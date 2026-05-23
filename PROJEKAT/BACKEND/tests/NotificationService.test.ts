export {};

const mockNotificationRepository = {
  getRecipientsForAnomalyNotifications: jest.fn(),
  createForUsers: jest.fn(),
  getUserIdFromAuth: jest.fn(),
  getByUserId: jest.fn(),
  getUnreadCountByUserId: jest.fn(),
  markAsRead: jest.fn(),
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
});
