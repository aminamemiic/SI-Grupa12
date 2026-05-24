export interface INotificationService {
  getNotificationsForUser(authUser: unknown): Promise<any[]>;
  getUnreadCountForUser(authUser: unknown): Promise<number>;
  markAsRead(id: string, authUser: unknown): Promise<any>;
}
