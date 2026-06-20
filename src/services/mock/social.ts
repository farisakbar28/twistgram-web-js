/**
 * Mock Social Service
 * Ref: SRS §4 (Profile, Privacy, Social), §10.1–10.4 (DB schema)
 *      API contracts: §11.2 (Users & Profile), §11.3 (Follow & Social)
 *
 * Seluruh method mengikuti kontrak endpoint SRS §11.2–11.3 sehingga
 * di Fase 7 tinggal ganti implementasi internal dengan axios call
 * tanpa mengubah signature yang dipakai komponen.
 *
 * Storage: in-memory untuk sesi ini (reset saat page refresh — simulasi server state)
 */

import { delay } from '../../utils';
import type { User } from '../../types/index';
import type {
  UserProfile,
  Follow,
  FollowRequest,
  FollowStatus,
  UpdateProfilePayload,
  UpdatePrivacyPayload,
  ReportPayload,
} from '../../types/social';

// ============================================================
// Mock Database
// ============================================================

/** Referensi ke mock users dari auth service — diimpor untuk cross-reference */
export const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Faris Akbar',
    username: 'farisakbar28',
    email: 'faris@example.com',
    phone: '+628123456789',
    phone_verified: true,
    email_verified: true,
    bio: 'Building Twistgram 🚀 | Frontend Developer',
    avatar_url: undefined,
    is_private: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'user-002',
    name: 'Clara Clarissa',
    username: 'claraclarissa',
    email: 'clara@example.com',
    phone: undefined,
    phone_verified: false,
    email_verified: true,
    bio: 'Photographer & Content Creator 📸',
    avatar_url: undefined,
    is_private: true,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
  },
  {
    id: 'user-003',
    name: 'Andi Wirawan',
    username: 'andiwirawan',
    email: 'andi@example.com',
    phone: undefined,
    phone_verified: false,
    email_verified: true,
    bio: 'Travel & kuliner 🌍',
    avatar_url: undefined,
    is_private: false,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-06-15T00:00:00Z',
  },
  {
    id: 'user-004',
    name: 'Siti Rahayu',
    username: 'sitirahayu',
    email: 'siti@example.com',
    phone: undefined,
    phone_verified: false,
    email_verified: true,
    bio: undefined,
    avatar_url: undefined,
    is_private: false,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-06-18T00:00:00Z',
  },
  {
    id: 'user-005',
    name: 'Budi Santoso',
    username: 'budisantoso',
    email: 'budi@example.com',
    phone: undefined,
    phone_verified: false,
    email_verified: true,
    bio: 'Tech enthusiast 💻',
    avatar_url: undefined,
    is_private: true,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-06-20T00:00:00Z',
  },
];

/** Mock post counts per user */
const MOCK_POST_COUNTS: Record<string, number> = {
  'user-001': 24,
  'user-002': 57,
  'user-003': 12,
  'user-004': 8,
  'user-005': 31,
};

/** Mock interests per user */
const MOCK_USER_INTERESTS: Record<string, string[]> = {
  'user-001': ['Teknologi', 'Gaming', 'Fotografi'],
  'user-002': ['Fotografi', 'Seni & Desain', 'Fashion'],
  'user-003': ['Travel', 'Kuliner'],
  'user-004': ['Musik', 'Film & Seri'],
  'user-005': ['Teknologi', 'Bisnis'],
};

/**
 * Mock follows table — setiap entry: { followerId, followingId, status }
 * user-001 follows user-002 (pending - karena privat), user-003, user-004
 * user-002 follows user-001
 * user-003 follows user-001
 * user-005 (privat) punya pending request dari user-004
 */
export interface MockFollow {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'accepted' | 'pending';
  is_close_friend: boolean;
  created_at: string;
}

export const mockFollows: MockFollow[] = [
  { id: 'follow-001', follower_id: 'user-001', following_id: 'user-002', status: 'pending', is_close_friend: false, created_at: '2026-06-01T00:00:00Z' },
  { id: 'follow-002', follower_id: 'user-001', following_id: 'user-003', status: 'accepted', is_close_friend: false, created_at: '2026-06-02T00:00:00Z' },
  { id: 'follow-003', follower_id: 'user-001', following_id: 'user-004', status: 'accepted', is_close_friend: false, created_at: '2026-06-03T00:00:00Z' },
  { id: 'follow-004', follower_id: 'user-002', following_id: 'user-001', status: 'accepted', is_close_friend: false, created_at: '2026-06-01T00:00:00Z' },
  { id: 'follow-005', follower_id: 'user-003', following_id: 'user-001', status: 'accepted', is_close_friend: false, created_at: '2026-06-04T00:00:00Z' },
  { id: 'follow-006', follower_id: 'user-004', following_id: 'user-005', status: 'pending', is_close_friend: false, created_at: '2026-06-10T00:00:00Z' },
  { id: 'follow-007', follower_id: 'user-003', following_id: 'user-004', status: 'accepted', is_close_friend: false, created_at: '2026-06-05T00:00:00Z' },
];

/** Mock blocks */
export interface MockBlock {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

export const mockBlocks: MockBlock[] = [];

// ============================================================
// Storage helpers for currentUser updates
// ============================================================

const STORAGE_KEY_USER = 'twistgram_user';

const storageUpdateUser = (updates: Partial<User>) => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return;
    const user = JSON.parse(raw) as User;
    const updated = { ...user, ...updates, updated_at: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

// ============================================================
// Helpers
// ============================================================

const getFollowEntry = (followerId: string, followingId: string): MockFollow | undefined =>
  mockFollows.find(f => f.follower_id === followerId && f.following_id === followingId);

const getFollowStatus = (currentUserId: string | null, targetUserId: string): FollowStatus => {
  if (!currentUserId) return 'not_following';

  // Cek block (SOC-02: mutual)
  const isBlocked = mockBlocks.some(
    b => (b.blocker_id === currentUserId && b.blocked_id === targetUserId) ||
         (b.blocker_id === targetUserId && b.blocked_id === currentUserId)
  );
  if (isBlocked) return 'blocked';

  const follow = getFollowEntry(currentUserId, targetUserId);
  if (!follow) return 'not_following';
  if (follow.status === 'pending') return 'pending';
  return 'following';
};

const countFollowers = (userId: string): number =>
  mockFollows.filter(f => f.following_id === userId && f.status === 'accepted').length;

const countFollowing = (userId: string): number =>
  mockFollows.filter(f => f.follower_id === userId && f.status === 'accepted').length;

// ============================================================
// Profile Service — SRS §11.2
// ============================================================

/** GET /users/me */
export const getMyProfile = async (currentUserId: string): Promise<UserProfile> => {
  await delay(400);
  const user = MOCK_USERS.find(u => u.id === currentUserId);
  if (!user) throw new Error('User tidak ditemukan.');
  return {
    ...user,
    post_count: MOCK_POST_COUNTS[user.id] ?? 0,
    follower_count: countFollowers(user.id),
    following_count: countFollowing(user.id),
    follow_status: 'not_following',
    is_own_profile: true,
    interests: MOCK_USER_INTERESTS[user.id] ?? [],
  };
};

/** GET /users/:username */
export const getProfileByUsername = async (
  username: string,
  currentUserId: string | null
): Promise<UserProfile> => {
  await delay(500);
  const user = MOCK_USERS.find(u => u.username === username);
  if (!user) throw new Error('Profil tidak ditemukan.');

  // Cek block (SOC-02)
  if (currentUserId) {
    const blocked = mockBlocks.some(
      b => (b.blocker_id === currentUserId && b.blocked_id === user.id) ||
           (b.blocker_id === user.id && b.blocked_id === currentUserId)
    );
    if (blocked) throw new Error('Profil tidak dapat dilihat.');
  }

  return {
    ...user,
    post_count: MOCK_POST_COUNTS[user.id] ?? 0,
    follower_count: countFollowers(user.id),
    following_count: countFollowing(user.id),
    follow_status: getFollowStatus(currentUserId, user.id),
    is_own_profile: currentUserId === user.id,
    interests: MOCK_USER_INTERESTS[user.id] ?? [],
  };
};

/** PATCH /users/me — update profil */
export const updateProfile = async (
  currentUserId: string,
  payload: UpdateProfilePayload
): Promise<User> => {
  await delay(600);
  const userIdx = MOCK_USERS.findIndex(u => u.id === currentUserId);
  if (userIdx === -1) throw new Error('User tidak ditemukan.');

  // SOC-05: cek username change (1x per bulan) — simulasi: selalu boleh di mock
  if (payload.username) {
    const taken = MOCK_USERS.find(u => u.username === payload.username && u.id !== currentUserId);
    if (taken) throw new Error('Username sudah digunakan oleh pengguna lain.');
  }

  const updated: User = {
    ...MOCK_USERS[userIdx],
    ...(payload.name !== undefined && { name: payload.name }),
    ...(payload.username !== undefined && { username: payload.username }),
    ...(payload.bio !== undefined && { bio: payload.bio }),
    ...(payload.avatar_url !== undefined && { avatar_url: payload.avatar_url }),
    updated_at: new Date().toISOString(),
  };
  MOCK_USERS[userIdx] = updated;

  // Sync ke localStorage agar ProtectedRoute / AuthContext ikut terupdate
  storageUpdateUser(updated);

  return updated;
};

/** PATCH /users/me/privacy — toggle privasi */
export const updatePrivacy = async (
  currentUserId: string,
  payload: UpdatePrivacyPayload
): Promise<void> => {
  await delay(400);
  const userIdx = MOCK_USERS.findIndex(u => u.id === currentUserId);
  if (userIdx === -1) throw new Error('User tidak ditemukan.');
  MOCK_USERS[userIdx] = { ...MOCK_USERS[userIdx], is_private: payload.is_private };
  storageUpdateUser({ is_private: payload.is_private });
};

/** GET /users/me/interests */
export const getInterests = async (currentUserId: string): Promise<string[]> => {
  await delay(300);
  return MOCK_USER_INTERESTS[currentUserId] ?? [];
};

/** PUT /users/me/interests */
export const updateInterests = async (
  currentUserId: string,
  categories: string[]
): Promise<void> => {
  await delay(400);
  MOCK_USER_INTERESTS[currentUserId] = categories;
};

// ============================================================
// Follow Service — SRS §11.3
// ============================================================

/** POST /users/:id/follow */
export const followUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<Follow> => {
  await delay(400);

  if (currentUserId === targetUserId) throw new Error('Tidak bisa follow diri sendiri.');

  const existing = getFollowEntry(currentUserId, targetUserId);
  if (existing) throw new Error('Sudah follow pengguna ini.');

  const target = MOCK_USERS.find(u => u.id === targetUserId);
  if (!target) throw new Error('Pengguna tidak ditemukan.');

  const newFollow: MockFollow = {
    id: `follow-${Date.now()}`,
    follower_id: currentUserId,
    following_id: targetUserId,
    // SOC-01: jika akun privat, status = pending
    status: target.is_private ? 'pending' : 'accepted',
    is_close_friend: false,
    created_at: new Date().toISOString(),
  };
  mockFollows.push(newFollow);

  // Memicu notifikasi in-app
  try {
    const { createNotification } = await import('./notification');
    const type = target.is_private ? 'follow_request' : 'follow';
    await createNotification(targetUserId, currentUserId, type);
  } catch {}

  return newFollow;
};

/** DELETE /users/:id/follow */
export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  await delay(400);
  const idx = mockFollows.findIndex(
    f => f.follower_id === currentUserId && f.following_id === targetUserId
  );
  if (idx === -1) throw new Error('Belum follow pengguna ini.');
  mockFollows.splice(idx, 1);
};

/** GET /users/:id/followers */
export const getFollowers = async (
  targetUserId: string,
  currentUserId: string | null
): Promise<UserProfile[]> => {
  await delay(500);
  const followerIds = mockFollows
    .filter(f => f.following_id === targetUserId && f.status === 'accepted')
    .map(f => f.follower_id);

  return followerIds
    .map(id => {
      const user = MOCK_USERS.find(u => u.id === id);
      if (!user) return null;
      return {
        ...user,
        post_count: MOCK_POST_COUNTS[user.id] ?? 0,
        follower_count: countFollowers(user.id),
        following_count: countFollowing(user.id),
        follow_status: getFollowStatus(currentUserId, user.id),
        is_own_profile: currentUserId === user.id,
        interests: MOCK_USER_INTERESTS[user.id] ?? [],
      } as UserProfile;
    })
    .filter(Boolean) as UserProfile[];
};

/** GET /users/:id/following */
export const getFollowing = async (
  targetUserId: string,
  currentUserId: string | null
): Promise<UserProfile[]> => {
  await delay(500);
  const followingIds = mockFollows
    .filter(f => f.follower_id === targetUserId && f.status === 'accepted')
    .map(f => f.following_id);

  return followingIds
    .map(id => {
      const user = MOCK_USERS.find(u => u.id === id);
      if (!user) return null;
      return {
        ...user,
        post_count: MOCK_POST_COUNTS[user.id] ?? 0,
        follower_count: countFollowers(user.id),
        following_count: countFollowing(user.id),
        follow_status: getFollowStatus(currentUserId, user.id),
        is_own_profile: currentUserId === user.id,
        interests: MOCK_USER_INTERESTS[user.id] ?? [],
      } as UserProfile;
    })
    .filter(Boolean) as UserProfile[];
};

/** DELETE /users/me/followers/:id — Remove follower (SOC-04) */
export const removeFollower = async (
  currentUserId: string,
  followerUserId: string
): Promise<void> => {
  await delay(400);
  const idx = mockFollows.findIndex(
    f => f.follower_id === followerUserId && f.following_id === currentUserId && f.status === 'accepted'
  );
  if (idx === -1) throw new Error('Pengguna ini bukan follower Anda.');
  mockFollows.splice(idx, 1);
};

// ============================================================
// Follow Requests — SRS §4.2, §11.3
// ============================================================

/** GET /follow-requests */
export const getFollowRequests = async (currentUserId: string): Promise<FollowRequest[]> => {
  await delay(400);
  return mockFollows
    .filter(f => f.following_id === currentUserId && f.status === 'pending')
    .map(f => {
      const fromUser = MOCK_USERS.find(u => u.id === f.follower_id);
      if (!fromUser) return null;
      return { id: f.id, from_user: fromUser, created_at: f.created_at } as FollowRequest;
    })
    .filter(Boolean) as FollowRequest[];
};

/** POST /follow-requests/:id/approve */
export const approveFollowRequest = async (requestId: string): Promise<void> => {
  await delay(400);
  const follow = mockFollows.find(f => f.id === requestId);
  if (!follow || follow.status !== 'pending') throw new Error('Permintaan tidak ditemukan.');
  follow.status = 'accepted';

  // Memicu notifikasi in-app
  try {
    const { createNotification } = await import('./notification');
    await createNotification(follow.follower_id, follow.following_id, 'follow');
  } catch {}
};

/** POST /follow-requests/:id/decline */
export const declineFollowRequest = async (requestId: string): Promise<void> => {
  await delay(400);
  const idx = mockFollows.findIndex(f => f.id === requestId && f.status === 'pending');
  if (idx === -1) throw new Error('Permintaan tidak ditemukan.');
  mockFollows.splice(idx, 1);
};

// ============================================================
// Block & Report — SRS §4.5, §11.3
// ============================================================

/** POST /users/:id/block — SOC-02: mutual block */
export const blockUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  await delay(500);
  if (currentUserId === targetUserId) throw new Error('Tidak bisa memblock diri sendiri.');

  const alreadyBlocked = mockBlocks.some(
    b => b.blocker_id === currentUserId && b.blocked_id === targetUserId
  );
  if (alreadyBlocked) throw new Error('Pengguna sudah diblokir.');

  // Hapus relasi follow kedua arah (SOC-02)
  const toRemove: number[] = [];
  mockFollows.forEach((f, idx) => {
    if (
      (f.follower_id === currentUserId && f.following_id === targetUserId) ||
      (f.follower_id === targetUserId && f.following_id === currentUserId)
    ) {
      toRemove.push(idx);
    }
  });
  // Hapus dari belakang agar index tidak bergeser
  toRemove.reverse().forEach(idx => mockFollows.splice(idx, 1));

  mockBlocks.push({
    id: `block-${Date.now()}`,
    blocker_id: currentUserId,
    blocked_id: targetUserId,
    created_at: new Date().toISOString(),
  });
};

/** DELETE /users/:id/block */
export const unblockUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  await delay(400);
  const idx = mockBlocks.findIndex(
    b => b.blocker_id === currentUserId && b.blocked_id === targetUserId
  );
  if (idx === -1) throw new Error('Pengguna tidak sedang diblokir.');
  mockBlocks.splice(idx, 1);
};

/** POST /reports — Report user atau konten */
export const reportContent = async (
  _currentUserId: string,
  payload: ReportPayload
): Promise<void> => {
  await delay(500);
  // Mock: hanya log — di production disimpan ke tabel reports (§10.17)
  console.info('[Mock Report]', payload);
};
