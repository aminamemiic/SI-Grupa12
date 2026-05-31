export interface INotificationService {
  createMissingRecurringExpenseNotifications(expenses: any[]): Promise<any[]>;
  getNotificationsForUser(authUser: unknown): Promise<any[]>;
  getUnreadCountForUser(authUser: unknown): Promise<number>;
  markAsRead(id: string, authUser: unknown): Promise<any>;
}
