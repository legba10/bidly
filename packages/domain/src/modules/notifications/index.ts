import type { EntityId, UtcInstant, UserId } from '../../shared/index.js';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'TELEGRAM';

export interface Notification {
  readonly id: EntityId<'Notification'>;
  readonly recipientId: UserId;
  readonly channel: NotificationChannel;
  readonly templateKey: string;
  readonly safeVariables: Readonly<Record<string, string | number | boolean>>;
  readonly scheduledAt: UtcInstant;
}

export interface NotificationService {
  enqueue(notification: Notification): Promise<void>;
}

export class LocalNotificationService implements NotificationService {
  readonly notifications: Notification[] = [];

  async enqueue(notification: Notification): Promise<void> {
    this.notifications.push(notification);
  }
}
