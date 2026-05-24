import type { INotificationService } from "../Interfaces/INotificationService";

const { NotificationRepository } = require("../../DAL/Repositories/NotificationRepository");

export class NotificationService implements INotificationService {
  private notificationRepository: any;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  async createAnomalyNotification(expense: any, analysis: any): Promise<any[]> {
    const recipients = await this.notificationRepository.getRecipientsForAnomalyNotifications();
    const recipientIds = recipients.map((recipient: any) => recipient.id);

    const priority = analysis?.severity === "HIGH" ? "HIGH" : "MEDIUM";
    const amount = Number(expense?.iznos || 0).toFixed(2);
    const currency = expense?.valuta || "BAM";
    const title = `AI anomalija: ${expense?.naziv || "Trosak"}`;
    const explanation = analysis?.explanation || "AI analiza je oznacila trosak kao anomaliju.";
    const recommendation = analysis?.recommendedAction || "Provjeriti trosak prije dalje obrade.";
    const message = [
      `Trosak "${expense?.naziv || "bez naziva"}" (${amount} ${currency}) oznacen je kao anomalija.`,
      explanation,
      `Preporucena akcija: ${recommendation}`,
    ].join(" ");

    return this.notificationRepository.createForUsers(recipientIds, {
      naslov: title,
      poruka: message,
      prioritet: priority,
      tipNotifikacije: "AI_ANOMALIJA",
      povezaniTrosakId: expense?.id || null,
    });
  }

  async createPotentialDuplicateNotification(expense: any, analysis: any): Promise<any[]> {
    const recipients = await this.notificationRepository.getRecipientsForAnomalyNotifications();
    const recipientIds = recipients.map((recipient: any) => recipient.id);

    const amount = Number(expense?.iznos || 0).toFixed(2);
    const currency = expense?.valuta || "BAM";
    const title = `Dupli trosak: ${expense?.naziv || "Trosak"}`;
    const explanation =
      analysis?.explanation ||
      "Sistem je pronasao moguci identican trosak sa istim nazivom, iznosom i datumom.";
    const message = [
      `Trosak "${expense?.naziv || "bez naziva"}" (${amount} ${currency}) je oznacen kao moguci duplikat.`,
      explanation,
      "Preporucena akcija: obrisati zapis ako je greskom ponovljen ili ga sacuvati ako predstavlja stvarni trosak.",
    ].join(" ");

    return this.notificationRepository.createForUsers(recipientIds, {
      naslov: title,
      poruka: message,
      prioritet: "MEDIUM",
      tipNotifikacije: "DUPLI_TROSAK",
      povezaniTrosakId: expense?.id || null,
    });
  }

  async getNotificationsForUser(authUser: unknown): Promise<any[]> {
    const userId = await this.notificationRepository.getUserIdFromAuth(authUser);
    if (!userId) {
      throw new Error("Nije moguce dohvatiti korisnika za notifikacije.");
    }

    return this.notificationRepository.getByUserId(userId);
  }

  async getUnreadCountForUser(authUser: unknown): Promise<number> {
    const userId = await this.notificationRepository.getUserIdFromAuth(authUser);
    if (!userId) {
      throw new Error("Nije moguce dohvatiti korisnika za notifikacije.");
    }

    return this.notificationRepository.getUnreadCountByUserId(userId);
  }

  async markAsRead(id: string, authUser: unknown): Promise<any> {
    if (!id) {
      throw new Error("ID notifikacije je obavezan.");
    }

    const userId = await this.notificationRepository.getUserIdFromAuth(authUser);
    if (!userId) {
      throw new Error("Nije moguce dohvatiti korisnika za notifikacije.");
    }

    const notification = await this.notificationRepository.markAsRead(id, userId);
    if (!notification) {
      throw new Error("Notifikacija ne postoji ili ne pripada korisniku.");
    }

    return notification;
  }

  async markDuplicateActionHandled(expenseId: string, actionStatus: "SACUVAN" | "OBRISAN"): Promise<any[]> {
    if (!expenseId) {
      return [];
    }

    return this.notificationRepository.markActionHandledByExpenseId(expenseId, actionStatus);
  }
}

module.exports = { NotificationService };
