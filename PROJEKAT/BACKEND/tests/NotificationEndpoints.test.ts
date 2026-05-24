export {};

const express = require("express");
const request = require("supertest");

const mockNotificationService = {
  getNotificationsForUser: jest.fn(),
  getUnreadCountForUser: jest.fn(),
  markAsRead: jest.fn(),
};

jest.mock("../BLL/Services/NotificationService", () => ({
  NotificationService: jest.fn().mockImplementation(() => mockNotificationService),
}));

const { registerNotificationEndpoints } = require("../PRESENTATION API/Endpoints/NotificationEndpoints");

describe("NotificationEndpoints", () => {
  let app: any;

  const authService = {
    requireAuthentication: jest.fn((req: any, _res: any, next: any) => {
      req.user = { sub: "test-user", roles: ["glavni_racunovodja"] };
      next();
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    app = express();
    app.use(express.json());
    registerNotificationEndpoints(app, authService as any);
  });

  test("GET /api/notifikacije treba vratiti notifikacije korisnika", async () => {
    mockNotificationService.getNotificationsForUser.mockResolvedValue([{ id: "notif-1" }]);

    const response = await request(app).get("/api/notifikacije");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{ id: "notif-1" }]);
    expect(mockNotificationService.getNotificationsForUser).toHaveBeenCalledWith(
      expect.objectContaining({ sub: "test-user" })
    );
  });

  test("GET /api/notifikacije/neprocitane/count treba vratiti broj neprocitanih", async () => {
    mockNotificationService.getUnreadCountForUser.mockResolvedValue(3);

    const response = await request(app).get("/api/notifikacije/neprocitane/count");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ count: 3 });
  });

  test("PATCH /api/notifikacije/:id/procitano treba oznaciti notifikaciju kao procitanu", async () => {
    mockNotificationService.markAsRead.mockResolvedValue({ id: "notif-1", procitano: true });

    const response = await request(app).patch("/api/notifikacije/notif-1/procitano");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ id: "notif-1", procitano: true });
    expect(mockNotificationService.markAsRead).toHaveBeenCalledWith(
      "notif-1",
      expect.objectContaining({ sub: "test-user" })
    );
  });
});
