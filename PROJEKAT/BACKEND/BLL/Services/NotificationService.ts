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

  async createBudgetReturnedToRevisionNotification(budget: any, komentar: string): Promise<any[]> {
    const recipientId = budget?.kreiraoKorisnikId;
    if (!recipientId) {
      return [];
    }

    const naziv = budget?.naziv || "Budzet";
    const safeComment = komentar || "Bez komentara";

    return this.notificationRepository.createForUsers([recipientId], {
      naslov: `Budzet "${naziv}" vracen je na doradu`,
      poruka: `Finansijski direktor je vratio budzet na doradu uz sljedeci komentar: "${safeComment}". Molimo ispravite budzet i ponovo ga posaljite na odobravanje.`,
      prioritet: "LOW",
      tipNotifikacije: "budzet_vracen_na_doradu",
      povezaniBudzetId: budget?.id || null,
    });
  }

  async createBudgetRevisedNotification(budget: any, finansijskiDirektorId: string | null): Promise<any[]> {
    if (!finansijskiDirektorId) {
      return [];
    }

    const naziv = budget?.naziv || "Budzet";

    return this.notificationRepository.createForUsers([finansijskiDirektorId], {
      naslov: `Budzet "${naziv}" je doradjen`,
      poruka: "Glavni racunovodja je doradio budzet i ponovo ga poslao na odobravanje. Molimo pregledajte izmjene.",
      prioritet: "LOW",
      tipNotifikacije: "budzet_doradjen",
      povezaniBudzetId: budget?.id || null,
    });
  }

  async createMissingRecurringExpenseNotifications(expenses: any[]): Promise<any[]> {
    if (!Array.isArray(expenses) || expenses.length === 0) {
      return [];
    }

    const recipients = await this.notificationRepository.getRecipientsForAnomalyNotifications();
    const recipientIds = recipients.map((recipient: any) => recipient.id);
    if (recipientIds.length === 0) {
      return [];
    }

    const notifications = await Promise.all(
      expenses.map((expense) => {
        const expenseName = expense?.expenseName || "Trosak";
        const expectedMonth = expense?.expectedMonth || "tekuci mjesec";
        const averageAmount = Number(expense?.averageAmount || 0).toFixed(2);
        const recommendation = expense?.recommendation || "Provjeriti da li racun jos nije unesen.";

        return this.notificationRepository.createForUsersIfAbsent(recipientIds, {
          naslov: `Izostao periodicni trosak: ${expenseName} (${expectedMonth})`,
          poruka: [
            `Trosak "${expenseName}" nije evidentiran za ${expectedMonth}.`,
            `Prosjecni raniji iznos je ${averageAmount} BAM.`,
            `Preporucena akcija: ${recommendation}`,
          ].join(" "),
          prioritet: "MEDIUM",
          tipNotifikacije: "IZOSTAO_PERIODICNI_TROSAK",
          povezaniTrosakId: null,
        });
      })
    );

    return notifications.flat();
  }

  async getNotificationsForUser(authUser: unknown): Promise<any[]> {
    if (this.notificationRepository.hasRole(authUser, "finansijski_direktor")) {
      return this.notificationRepository.getAllNotifications();
    }

    const userId = await this.notificationRepository.getUserIdFromAuth(authUser);
    if (!userId) {
      throw new Error("Nije moguce dohvatiti korisnika za notifikacije.");
    }

    return this.notificationRepository.getByUserId(userId);
  }

  async getUnreadCountForUser(authUser: unknown): Promise<number> {
    if (this.notificationRepository.hasRole(authUser, "finansijski_direktor")) {
      return this.notificationRepository.getUnreadCount();
    }

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

    if (this.notificationRepository.hasRole(authUser, "finansijski_direktor")) {
      const notification = await this.notificationRepository.markAsReadById(id);
      if (!notification) {
        throw new Error("Notifikacija ne postoji ili ne pripada korisniku.");
      }

      return notification;
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
