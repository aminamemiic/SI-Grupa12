export interface INotificationService {
  createAnomalyNotification(expense: any, analysis: any): Promise<any[]>;
  createPotentialDuplicateNotification(expense: any, analysis: any): Promise<any[]>;
  createBudgetReturnedToRevisionNotification(budget: any, komentar: string): Promise<any[]>;
  createBudgetRevisedNotification(budget: any, finansijskiDirektorId: string | null): Promise<any[]>;
  createMissingRecurringExpenseNotifications(expenses: any[]): Promise<any[]>;
  getNotificationsForUser(authUser: unknown): Promise<any[]>;
  getUnreadCountForUser(authUser: unknown): Promise<number>;
  markAsRead(id: string, authUser: unknown): Promise<any>;
  markDuplicateActionHandled(expenseId: string, actionStatus: "SACUVAN" | "OBRISAN"): Promise<any[]>;
  createFrequentActivityNotification(korisnikId: string, tip: string, poruka: string): Promise<any[]>;
}
