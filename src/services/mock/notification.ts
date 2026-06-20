/**
 * Mock Notification Service
 * Ref: SRS §8, §11.9
 */

import { delay } from '../../utils';
import type { User, Notification, NotificationType } from '../../types/index';
import { MOCK_USERS, mockBlocks } from './social';

// ============================================================
// Storage Keys & Initial Data
// ============================================================

const STORAGE_KEYS = {
  NOTIFICATIONS: 'twistgram_notifications',
};

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-001',
    recipient_id: 'user-001', // Faris
    actor_id: 'user-002', // Clara
    type: 'follow',
    is_read: false,
    created_at: new Date(Date.now() - 3600 * 1000 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-002',
    recipient_id: 'user-001', // Faris
    actor_id: 'user-003', // Andi
    type: 'like',
    reference_id: 'post-001',
    is_read: false,
    created_at: new Date(Date.now() - 3600 * 1000 * 5).toISOString(), // 5 hours ago
  },
  {
    id: 'notif-003',
    recipient_id: 'user-001', // Faris
    actor_id: 'user-002', // Clara
    type: 'comment',
    reference_id: 'post-001',
    is_read: true,
    created_at: new Date(Date.now() - 3600 * 1000 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-004',
    recipient_id: 'user-001', // Faris
    actor_id: 'user-005', // Budi (private)
    type: 'follow_request',
    is_read: false,
    created_at: new Date(Date.now() - 3600 * 1000 * 1).toISOString(), // 1 hour ago
  },
];

// ============================================================
// Storage Helpers
// ============================================================

const getStorageData = <T>(key: string, initial: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : initial;
  } catch {
    return initial;
  }
};

const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {}
};

// Initialize
if (!localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS)) {
  setStorageData(STORAGE_KEYS.NOTIFICATIONS, INITIAL_NOTIFICATIONS);
}

const getNotificationsDb = (): Notification[] => getStorageData<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, []);

const getUserObject = (userId: string): User => {
  try {
    const raw = localStorage.getItem('twistgram_user');
    if (raw) {
      const u = JSON.parse(raw) as User;
      if (u.id === userId) return u;
    }
  } catch {}
  return MOCK_USERS.find(u => u.id === userId) ?? {
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
};

const isBlocked = (userA: string, userB: string): boolean => {
  return mockBlocks.some(
    b => (b.blocker_id === userA && b.blocked_id === userB) ||
         (b.blocker_id === userB && b.blocked_id === userA)
  );
};

// ============================================================
// Service Methods
// ============================================================

/**
 * GET /notifications
 * Mengambil daftar notifikasi pengguna.
 * NTF-02: Menyaring notifikasi dari pengguna yang diblokir.
 */
export const getNotifications = async (currentUserId: string): Promise<Notification[]> => {
  await delay(400);

  const notifications = getNotificationsDb();
  
  // Filter notifikasi milik currentUserId
  const userNotifs = notifications.filter(n => n.recipient_id === currentUserId);

  // Filter block (NTF-02)
  const filtered = userNotifs.filter(n => !isBlocked(currentUserId, n.actor_id));

  // Enrich with actor info
  const result = filtered.map(n => ({
    ...n,
    actor: getUserObject(n.actor_id),
  }));

  // Sort by date newest
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return result;
};

/**
 * POST /notifications/:id/read
 * Tandai satu notifikasi telah dibaca.
 */
export const markNotificationAsRead = async (notificationId: string, _currentUserId: string): Promise<void> => {
  await delay(200);

  const notifications = getNotificationsDb();
  const idx = notifications.findIndex(n => n.id === notificationId);
  if (idx !== -1) {
    notifications[idx].is_read = true;
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

/**
 * POST /notifications/read-all
 * Tandai semua notifikasi pengguna sebagai terbaca.
 */
export const markAllNotificationsAsRead = async (currentUserId: string): Promise<void> => {
  await delay(300);

  const notifications = getNotificationsDb();
  let changed = false;

  notifications.forEach(n => {
    if (n.recipient_id === currentUserId && !n.is_read) {
      n.is_read = true;
      changed = true;
    }
  });

  if (changed) {
    setStorageData(STORAGE_KEYS.NOTIFICATIONS, notifications);
  }
};

/**
 * Helper untuk membuat notifikasi baru.
 * NTF-01: Tidak mengirim notifikasi untuk aksi diri sendiri.
 * NTF-02: Tidak mengirim notifikasi dari/ke akun yang diblokir.
 */
export const createNotification = async (
  recipientId: string,
  actorId: string,
  type: NotificationType,
  referenceId?: string
): Promise<Notification | null> => {
  // NTF-01: Lewati jika aksi sendiri
  if (recipientId === actorId) return null;

  // Filter jika diblokir
  if (isBlocked(recipientId, actorId)) return null;

  const notifications = getNotificationsDb();

  const newNotif: Notification = {
    id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    recipient_id: recipientId,
    actor_id: actorId,
    type,
    reference_id: referenceId,
    is_read: false,
    created_at: new Date().toISOString(),
  };

  // Hapus duplikasi notifikasi sejenis yang belum terbaca agar bersih
  // Contoh: user follow berkali-kali, atau un-like lalu re-like
  const filteredNotifs = notifications.filter(
    n => !(n.recipient_id === recipientId && n.actor_id === actorId && n.type === type && n.reference_id === referenceId && !n.is_read)
  );

  filteredNotifs.push(newNotif);
  setStorageData(STORAGE_KEYS.NOTIFICATIONS, filteredNotifs);

  return newNotif;
};

/**
 * Mendapatkan jumlah notifikasi yang belum dibaca.
 */
export const getUnreadNotificationsCount = async (currentUserId: string): Promise<number> => {
  const notifications = getNotificationsDb();
  // Filter block
  const unread = notifications.filter(
    n => n.recipient_id === currentUserId && !n.is_read && !isBlocked(currentUserId, n.actor_id)
  );
  return unread.length;
};
