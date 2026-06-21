/**
 * Mock Notification Service
 * Ref: SRS §8, §11.9
 */

import { delay } from '../../utils';
import type { User, Notification, NotificationType } from '../../types/index';
import { getMockUserById, mockDb, persistMockDb } from './database';

const getNotificationsDb = (): Notification[] => mockDb.notifications;
const getBlocksDb = () => mockDb.blocks;
const getFollowsDb = () => mockDb.follows;

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
  getBlocksDb().some(
    (block) =>
      (block.blocker_id === userA && block.blocked_id === userB) ||
      (block.blocker_id === userB && block.blocked_id === userA)
  );

const isValidFollowRequestNotification = (
  notification: Notification,
  pendingFollow: (typeof mockDb.follows)[number]
) =>
  notification.recipient_id === pendingFollow.following_id &&
  notification.actor_id === pendingFollow.follower_id;

export const syncFollowRequestNotifications = (): void => {
  const notifications = getNotificationsDb();
  const pendingFollows = getFollowsDb().filter((follow) => follow.status === 'pending');
  const pendingById = new Map(pendingFollows.map((follow) => [follow.id, follow]));
  const matchedFollowIds = new Set<string>();

  const normalized: Notification[] = [];

  for (const notification of notifications) {
    if (notification.type !== 'follow_request') {
      normalized.push(notification);
      continue;
    }

    const referencedFollow = notification.reference_id
      ? pendingById.get(notification.reference_id)
      : pendingFollows.find((follow) => isValidFollowRequestNotification(notification, follow));

    if (!referencedFollow) {
      continue;
    }

    matchedFollowIds.add(referencedFollow.id);
    normalized.push({
      ...notification,
      reference_id: referencedFollow.id,
      recipient_id: referencedFollow.following_id,
      actor_id: referencedFollow.follower_id,
      created_at: notification.created_at || referencedFollow.created_at,
    });
  }

  for (const follow of pendingFollows) {
    if (matchedFollowIds.has(follow.id)) continue;

    normalized.push({
      id: `notif-follow-request-${follow.id}`,
      recipient_id: follow.following_id,
      actor_id: follow.follower_id,
      type: 'follow_request',
      reference_id: follow.id,
      is_read: false,
      created_at: follow.created_at,
    });
  }

  const hasChanged =
    normalized.length !== notifications.length ||
    normalized.some((notification, index) => {
      const previous = notifications[index];
      return (
        !previous ||
        previous.id !== notification.id ||
        previous.reference_id !== notification.reference_id ||
        previous.recipient_id !== notification.recipient_id ||
        previous.actor_id !== notification.actor_id ||
        previous.is_read !== notification.is_read
      );
    });

  if (hasChanged) {
    notifications.splice(0, notifications.length, ...normalized);
    persistMockDb();
  }
};

export const getNotifications = async (currentUserId: string): Promise<Notification[]> => {
  await delay(400);
  syncFollowRequestNotifications();

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
  if (type === 'follow_request' && !referenceId) {
    throw new Error('Follow request notification membutuhkan reference_id request.');
  }

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

  if (type === 'follow_request') {
    syncFollowRequestNotifications();
  }

  return newNotification;
};

export const getUnreadNotificationsCount = async (currentUserId: string): Promise<number> =>
  getNotificationsDb().filter(
    (notification) =>
      notification.recipient_id === currentUserId &&
      !notification.is_read &&
      !isBlocked(currentUserId, notification.actor_id)
  ).length;
