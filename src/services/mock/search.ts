/**
 * Mock Search Service
 * Ref: SRS §6, §11.7
 */

import { delay } from '../../utils';
import type { User, Post, PostMedia } from '../../types/index';
import { getMockUserById, mockDb } from './database';
import { MOCK_USERS, mockBlocks, mockFollows } from './social';

const getPostsDb = (): Post[] => mockDb.posts;
const getMediaDb = (): PostMedia[] => mockDb.postMedia;
const getLikesDb = (): Array<{ user_id: string; post_id?: string }> => mockDb.likes as Array<{
  user_id: string;
  post_id?: string;
}>;
const getCommentsDb = (): Array<{ post_id: string; deleted_at?: string }> => mockDb.comments as Array<{
  post_id: string;
  deleted_at?: string;
}>;
const getSavedDb = (): Array<{ user_id: string; post_id: string }> => mockDb.savedPosts as Array<{
  user_id: string;
  post_id: string;
}>;

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
    external_link: user.external_link ?? undefined,
  };
};

const isBlocked = (userA: string, userB: string): boolean =>
  mockBlocks.some(
    (block) =>
      (block.blocker_id === userA && block.blocked_id === userB) ||
      (block.blocker_id === userB && block.blocked_id === userA)
  );

const isFollowing = (followerId: string, followingId: string): boolean =>
  mockFollows.some(
    (follow) =>
      follow.follower_id === followerId &&
      follow.following_id === followingId &&
      follow.status === 'accepted'
  );

export const searchUsers = async (query: string, currentUserId: string): Promise<User[]> => {
  await delay(400);
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const currentUser = getUserObject(currentUserId);
  const usersList = MOCK_USERS.map((user) =>
    user.id === currentUserId ? currentUser : getUserObject(user.id)
  );

  return usersList.filter((user) => {
    if (user.id === currentUserId) return false;
    if (isBlocked(currentUserId, user.id)) return false;

    return (
      user.name.toLowerCase().includes(normalizedQuery) ||
      user.username.toLowerCase().includes(normalizedQuery)
    );
  });
};

export const searchHashtags = async (query: string): Promise<string[]> => {
  await delay(300);
  const normalizedQuery = query.trim().toLowerCase().replace('#', '');
  if (!normalizedQuery) return [];

  const hashtags = new Set<string>();
  getPostsDb()
    .filter((post) => !post.deleted_at)
    .forEach((post) => {
      const matches = post.caption?.match(/#[a-zA-Z0-9_]+/g);
      if (!matches) return;

      matches.forEach((tag) => {
        const cleanTag = tag.replace('#', '');
        if (cleanTag.toLowerCase().includes(normalizedQuery)) {
          hashtags.add(cleanTag);
        }
      });
    });

  return Array.from(hashtags);
};

export const getHashtagPosts = async (tag: string, currentUserId: string): Promise<Post[]> => {
  await delay(450);
  const cleanTag = tag.trim().toLowerCase().replace('#', '');
  if (!cleanTag) return [];

  return getPostsDb()
    .filter((post) => {
      if (post.deleted_at || post.is_archived || !post.caption) return false;
      if (isBlocked(currentUserId, post.user_id)) return false;

      const author = getUserObject(post.user_id);
      if (
        author.is_private &&
        post.user_id !== currentUserId &&
        !isFollowing(currentUserId, post.user_id)
      ) {
        return false;
      }

      return new RegExp(`#${cleanTag}\\b`, 'i').test(post.caption);
    })
    .map((post) => {
      const media = getMediaDb().filter((entry) => entry.post_id === post.id);
      const likes = getLikesDb().filter((entry) => entry.post_id === post.id);
      const comments = getCommentsDb().filter(
        (entry) => entry.post_id === post.id && !entry.deleted_at
      );
      const saved = getSavedDb().filter(
        (entry) => entry.user_id === currentUserId && entry.post_id === post.id
      );

      return {
        ...post,
        user: getUserObject(post.user_id),
        media,
        likes_count: likes.length,
        comments_count: comments.length,
        is_liked: likes.some(
          (entry) => entry.user_id === currentUserId && entry.post_id === post.id
        ),
        is_saved: saved.length > 0,
      };
    });
};
