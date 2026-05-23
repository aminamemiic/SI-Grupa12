import type { IAuthService } from "../../BLL/Interfaces/IAuthService";

const { NotificationService } = require("../../BLL/Services/NotificationService");

function registerNotificationEndpoints(app: any, authService: IAuthService, _logger?: any) {
  const notificationService = new NotificationService();

  app.get("/api/notifikacije", authService.requireAuthentication, async (req: any, res: any) => {
    try {
      const notifications = await notificationService.getNotificationsForUser(req.user);
      return res.status(200).json(notifications);
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Greska pri dohvatu notifikacija.",
      });
    }
  });

  app.get("/api/notifikacije/neprocitane/count", authService.requireAuthentication, async (req: any, res: any) => {
    try {
      const count = await notificationService.getUnreadCountForUser(req.user);
      return res.status(200).json({ count });
    } catch (error: any) {
      return res.status(500).json({
        message: error.message || "Greska pri dohvatu broja neprocitanih notifikacija.",
      });
    }
  });

  app.patch("/api/notifikacije/:id/procitano", authService.requireAuthentication, async (req: any, res: any) => {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user);
      return res.status(200).json(notification);
    } catch (error: any) {
      return res.status(400).json({
        message: error.message || "Greska pri oznacavanju notifikacije kao procitane.",
      });
    }
  });
}

module.exports = { registerNotificationEndpoints };
