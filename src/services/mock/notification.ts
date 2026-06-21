/**
 * Mock Notification Service
 * Ref: SRS §8, §11.9
 */

import { delay } from '../../utils';
import type { User, Notification, NotificationType } from '../../types/index';
import { getMockUserById, mockDb, persistMockDb } from './database';
import { mockBlocks } from './social';

const getNotificationsDb = (): Notification[] => mockDb.notifications;

const getUserObject = (userId: string): User => {
  try {
    const raw = localStorage.getItem('twistgram_user');
    if (raw) {
      const user = JSON.parse(raw) as User;
      if (user.id === userId) return user;
    }
  } catch {
    // ignore
  }

  const user = getMockUserById(userId);
  if (!user) {
    return {
      id: userId,
      name: 'Unknown User',
      username: 'unknown',
      email: 'unknown@example.com',
      phone_verified: false,
      email_verified: true,
      is_private: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }

  return {
    ...user,
    phone: user.phone ?? undefined,
    bio: user.bio ?? undefined,
    avatar_url: user.avatar_url ?? undefined,
  };
};

const isBlocked = (userA: string, userB: string): boolean =>
  mockBlocks.some(
    (block) =>
      (block.blocker_id === userA && block.blocked_id === userB) ||
      (block.blocker_id === userB && block.blocked_id === userA)
  );

export const getNotifications = async (currentUserId: string): Promise<Notification[]> => {
  await delay(400);

  return getNotificationsDb()
    .filter(
      (notification) =>
        notification.recipient_id === currentUserId &&
        !isBlocked(currentUserId, notification.actor_id)
    )
    .map((notification) => ({
      ...notification,
      actor: getUserObject(notification.actor_id),
    }))
    .sort(
      (notifA, notifB) =>
        new Date(notifB.created_at).getTime() - new Date(notifA.created_at).getTime()
    );
};

export const markNotificationAsRead = async (
  notificationId: string,
  _currentUserId: string
): Promise<void> => {
  await delay(200);
  const notification = getNotificationsDb().find((entry) => entry.id === notificationId);
  if (notification) {
    notification.is_read = true;
    persistMockDb();
  }
};

export const markAllNotificationsAsRead = async (currentUserId: string): Promise<void> => {
  await delay(300);
  let changed = false;

  getNotificationsDb().forEach((notification) => {
    if (notification.recipient_id === currentUserId && !notification.is_read) {
      notification.is_read = true;
      changed = true;
    }
  });

  if (changed) {
    persistMockDb();
  }
};

export const createNotification = async (
  recipientId: string,
  actorId: string,
  type: NotificationType,
  referenceId?: string
): Promise<Notification | null> => {
  if (recipientId === actorId) return null;
  if (isBlocked(recipientId, actorId)) return null;

  const deduped = getNotificationsDb().filter(
    (notification) =>
      !(
        notification.recipient_id === recipientId &&
        notification.actor_id === actorId &&
        notification.type === type &&
        notification.reference_id === referenceId &&
        !notification.is_read
      )
  );

  const newNotification: Notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipient_id: recipientId,
    actor_id: actorId,
    type,
    reference_id: referenceId,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  deduped.push(newNotification);
  getNotificationsDb().splice(0, getNotificationsDb().length, ...deduped);
  persistMockDb();

  return newNotification;
};

export const getUnreadNotificationsCount = async (currentUserId: string): Promise<number> =>
  getNotificationsDb().filter(
    (notification) =>
      notification.recipient_id === currentUserId &&
      !notification.is_read &&
      !isBlocked(currentUserId, notification.actor_id)
  ).length;
