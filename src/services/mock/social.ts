/**
 * Mock Social Service
 * Ref: SRS §4 (Profile, Privacy, Social), §10.1-10.4 (DB schema)
 *      API contracts: §11.2 (Users & Profile), §11.3 (Follow & Social)
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
import { getMockUserById, mockDb, persistMockDb } from './database';

export type MockFollow = Follow;
export type MockBlock = {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
};

export const MOCK_USERS = mockDb.users as unknown as User[];
export const mockFollows = mockDb.follows as MockFollow[];
export const mockBlocks = mockDb.blocks as MockBlock[];

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

const normalizeUser = (user: typeof mockDb.users[number]): User => ({
  ...user,
  phone: user.phone ?? undefined,
  bio: user.bio ?? undefined,
  avatar_url: user.avatar_url ?? undefined,
});

const getFollowEntry = (followerId: string, followingId: string): MockFollow | undefined =>
  mockFollows.find(
    (follow) => follow.follower_id === followerId && follow.following_id === followingId
  );

const isBlockedRelation = (userA: string, userB: string) =>
  mockBlocks.some(
    (block) =>
      (block.blocker_id === userA && block.blocked_id === userB) ||
      (block.blocker_id === userB && block.blocked_id === userA)
  );

const getFollowStatus = (currentUserId: string | null, targetUserId: string): FollowStatus => {
  if (!currentUserId) return 'not_following';
  if (isBlockedRelation(currentUserId, targetUserId)) return 'blocked';

  const follow = getFollowEntry(currentUserId, targetUserId);
  if (!follow) return 'not_following';
  return follow.status === 'pending' ? 'pending' : 'following';
};

const countFollowers = (userId: string): number =>
  mockFollows.filter((follow) => follow.following_id === userId && follow.status === 'accepted')
    .length;

const countFollowing = (userId: string): number =>
  mockFollows.filter((follow) => follow.follower_id === userId && follow.status === 'accepted')
    .length;

const buildUserProfile = (user: typeof mockDb.users[number], currentUserId: string | null): UserProfile => ({
  ...normalizeUser(user),
  post_count: mockDb.postCounts[user.id] ?? 0,
  follower_count: countFollowers(user.id),
  following_count: countFollowing(user.id),
  follow_status: currentUserId === user.id ? 'not_following' : getFollowStatus(currentUserId, user.id),
  is_own_profile: currentUserId === user.id,
  interests: mockDb.userInterests[user.id] ?? [],
});

export const getMyProfile = async (currentUserId: string): Promise<UserProfile> => {
  await delay(400);
  const user = getMockUserById(currentUserId);
  if (!user) throw new Error('User tidak ditemukan.');
  return buildUserProfile(user, currentUserId);
};

export const getProfileByUsername = async (
  username: string,
  currentUserId: string | null
): Promise<UserProfile> => {
  await delay(500);
  const user = mockDb.users.find((candidate) => candidate.username === username);
  if (!user) throw new Error('Profil tidak ditemukan.');

  if (currentUserId && isBlockedRelation(currentUserId, user.id)) {
    throw new Error('Profil tidak dapat dilihat.');
  }

  return buildUserProfile(user, currentUserId);
};

export const updateProfile = async (
  currentUserId: string,
  payload: UpdateProfilePayload
): Promise<User> => {
  await delay(600);
  const userIndex = mockDb.users.findIndex((user) => user.id === currentUserId);
  if (userIndex === -1) throw new Error('User tidak ditemukan.');

  if (payload.username) {
    const taken = mockDb.users.find(
      (user) => user.username === payload.username && user.id !== currentUserId
    );
    if (taken) throw new Error('Username sudah digunakan oleh pengguna lain.');
  }

  const updated = {
    ...mockDb.users[userIndex],
    ...(payload.name !== undefined && { name: payload.name }),
    ...(payload.username !== undefined && { username: payload.username }),
    ...(payload.bio !== undefined && { bio: payload.bio }),
    ...(payload.avatar_url !== undefined && { avatar_url: payload.avatar_url }),
    updated_at: new Date().toISOString(),
  };

  mockDb.users[userIndex] = updated;
  persistMockDb();
  storageUpdateUser(normalizeUser(updated));

  return normalizeUser(updated);
};

export const updatePrivacy = async (
  currentUserId: string,
  payload: UpdatePrivacyPayload
): Promise<void> => {
  await delay(400);
  const user = getMockUserById(currentUserId);
  if (!user) throw new Error('User tidak ditemukan.');

  user.is_private = payload.is_private;
  user.updated_at = new Date().toISOString();
  persistMockDb();
  storageUpdateUser({ is_private: payload.is_private });
};

export const getInterests = async (currentUserId: string): Promise<string[]> => {
  await delay(300);
  return mockDb.userInterests[currentUserId] ?? [];
};

export const updateInterests = async (
  currentUserId: string,
  categories: string[]
): Promise<void> => {
  await delay(400);
  mockDb.userInterests[currentUserId] = categories;
  persistMockDb();
};

export const followUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<Follow> => {
  await delay(400);

  if (currentUserId === targetUserId) throw new Error('Tidak bisa follow diri sendiri.');
  if (getFollowEntry(currentUserId, targetUserId)) {
    throw new Error('Sudah follow pengguna ini.');
  }

  const target = getMockUserById(targetUserId);
  if (!target) throw new Error('Pengguna tidak ditemukan.');

  const newFollow: MockFollow = {
    id: `follow-${Date.now()}`,
    follower_id: currentUserId,
    following_id: targetUserId,
    status: target.is_private ? 'pending' : 'accepted',
    is_close_friend: false,
    created_at: new Date().toISOString(),
  };

  mockFollows.push(newFollow);
  persistMockDb();

  try {
    const { createNotification } = await import('./notification');
    await createNotification(
      targetUserId,
      currentUserId,
      target.is_private ? 'follow_request' : 'follow'
    );
  } catch {
    // ignore mock notification failure
  }

  return newFollow;
};

export const unfollowUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  await delay(400);
  const index = mockFollows.findIndex(
    (follow) => follow.follower_id === currentUserId && follow.following_id === targetUserId
  );
  if (index === -1) throw new Error('Belum follow pengguna ini.');
  mockFollows.splice(index, 1);
  persistMockDb();
};

export const getFollowers = async (
  targetUserId: string,
  currentUserId: string | null
): Promise<UserProfile[]> => {
  await delay(500);
  return mockFollows
    .filter((follow) => follow.following_id === targetUserId && follow.status === 'accepted')
    .map((follow) => getMockUserById(follow.follower_id))
    .filter(Boolean)
    .map((user) => buildUserProfile(user!, currentUserId));
};

export const getFollowing = async (
  targetUserId: string,
  currentUserId: string | null
): Promise<UserProfile[]> => {
  await delay(500);
  return mockFollows
    .filter((follow) => follow.follower_id === targetUserId && follow.status === 'accepted')
    .map((follow) => getMockUserById(follow.following_id))
    .filter(Boolean)
    .map((user) => buildUserProfile(user!, currentUserId));
};

export const removeFollower = async (
  currentUserId: string,
  followerUserId: string
): Promise<void> => {
  await delay(400);
  const index = mockFollows.findIndex(
    (follow) =>
      follow.follower_id === followerUserId &&
      follow.following_id === currentUserId &&
      follow.status === 'accepted'
  );
  if (index === -1) throw new Error('Pengguna ini bukan follower Anda.');
  mockFollows.splice(index, 1);
  persistMockDb();
};

export const getFollowRequests = async (currentUserId: string): Promise<FollowRequest[]> => {
  await delay(400);
  return mockFollows
    .filter((follow) => follow.following_id === currentUserId && follow.status === 'pending')
    .map((follow) => {
      const fromUser = getMockUserById(follow.follower_id);
      if (!fromUser) return null;
      return {
        id: follow.id,
        from_user: normalizeUser(fromUser),
        created_at: follow.created_at,
      } as FollowRequest;
    })
    .filter(Boolean) as FollowRequest[];
};

const removeFollowRequestNotification = (follow: MockFollow) => {
  const filtered = mockDb.notifications.filter(
    (notification) =>
      !(
        notification.type === 'follow_request' &&
        notification.actor_id === follow.follower_id &&
        notification.recipient_id === follow.following_id
      )
  );

  mockDb.notifications.splice(0, mockDb.notifications.length, ...filtered);
};

export const approveFollowRequest = async (requestId: string): Promise<void> => {
  await delay(400);
  const follow = mockFollows.find((entry) => entry.id === requestId);
  if (!follow || follow.status !== 'pending') throw new Error('Permintaan tidak ditemukan.');

  follow.status = 'accepted';
  removeFollowRequestNotification(follow);
  persistMockDb();

  try {
    const { createNotification } = await import('./notification');
    await createNotification(follow.follower_id, follow.following_id, 'follow');
  } catch {
    // ignore mock notification failure
  }
};

export const declineFollowRequest = async (requestId: string): Promise<void> => {
  await delay(400);
  const follow = mockFollows.find((entry) => entry.id === requestId && entry.status === 'pending');
  if (!follow) throw new Error('Permintaan tidak ditemukan.');

  const index = mockFollows.findIndex(
    (entry) => entry.id === requestId && entry.status === 'pending'
  );
  mockFollows.splice(index, 1);
  removeFollowRequestNotification(follow);
  persistMockDb();
};

export const blockUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  await delay(500);

  if (currentUserId === targetUserId) throw new Error('Tidak bisa memblock diri sendiri.');
  if (mockBlocks.some((block) => block.blocker_id === currentUserId && block.blocked_id === targetUserId)) {
    throw new Error('Pengguna sudah diblokir.');
  }

  for (let index = mockFollows.length - 1; index >= 0; index -= 1) {
    const follow = mockFollows[index];
    if (
      (follow.follower_id === currentUserId && follow.following_id === targetUserId) ||
      (follow.follower_id === targetUserId && follow.following_id === currentUserId)
    ) {
      mockFollows.splice(index, 1);
    }
  }

  mockBlocks.push({
    id: `block-${Date.now()}`,
    blocker_id: currentUserId,
    blocked_id: targetUserId,
    created_at: new Date().toISOString(),
  });
  persistMockDb();
};

export const unblockUser = async (
  currentUserId: string,
  targetUserId: string
): Promise<void> => {
  await delay(400);
  const index = mockBlocks.findIndex(
    (block) => block.blocker_id === currentUserId && block.blocked_id === targetUserId
  );
  if (index === -1) throw new Error('Pengguna tidak sedang diblokir.');
  mockBlocks.splice(index, 1);
  persistMockDb();
};

export const reportContent = async (
  _currentUserId: string,
  payload: ReportPayload
): Promise<void> => {
  await delay(500);
  console.info('[Mock Report]', payload);
};
