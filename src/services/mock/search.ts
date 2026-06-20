/**
 * Mock Search Service
 * Ref: SRS §6, §11.7
 */

import { delay } from '../../utils';
import type { User, Post, PostMedia } from '../../types/index';
import { MOCK_USERS, mockBlocks, mockFollows } from './social';

// ============================================================
// Helpers
// ============================================================

const getPostsDb = (): Post[] => {
  try {
    const raw = localStorage.getItem('twistgram_posts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getMediaDb = (): PostMedia[] => {
  try {
    const raw = localStorage.getItem('twistgram_post_media');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getLikesDb = (): any[] => {
  try {
    const raw = localStorage.getItem('twistgram_likes');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getCommentsDb = (): any[] => {
  try {
    const raw = localStorage.getItem('twistgram_comments');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getSavedDb = (): any[] => {
  try {
    const raw = localStorage.getItem('twistgram_saved_posts');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const getUserObject = (userId: string): User => {
  // Sync with localStorage
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

const isFollowing = (followerId: string, followingId: string): boolean => {
  return mockFollows.some(
    f => f.follower_id === followerId && f.following_id === followingId && f.status === 'accepted'
  );
};

// ============================================================
// Service Methods
// ============================================================

/**
 * GET /search/users?q=
 * Cari pengguna berdasarkan username atau nama.
 * SRCH-01: Tidak menampilkan akun yang diblokir/memblokir.
 */
export const searchUsers = async (query: string, currentUserId: string): Promise<User[]> => {
  await delay(400);
  const q = query.trim().toLowerCase();
  if (!q) return [];

  // Ambil semua pengguna terdaftar (termasuk sync localStorage jika user mengganti profilenya)
  const currentSyncUser = getUserObject(currentUserId);
  const usersList = MOCK_USERS.map(u => u.id === currentUserId ? currentSyncUser : getUserObject(u.id));

  return usersList.filter(user => {
    // Jangan tampilkan diri sendiri di pencarian
    if (user.id === currentUserId) return false;
    
    // SRCH-01: Filter block
    if (isBlocked(currentUserId, user.id)) return false;

    // Cocokkan nama atau username
    return (
      user.name.toLowerCase().includes(q) ||
      user.username.toLowerCase().includes(q)
    );
  });
};

/**
 * GET /search/hashtags?q=
 * Cari hashtag unik dari postingan yang ada.
 */
export const searchHashtags = async (query: string): Promise<string[]> => {
  await delay(300);
  const q = query.trim().toLowerCase().replace('#', '');
  if (!q) return [];

  const posts = getPostsDb().filter(p => !p.deleted_at);
  const hashtags = new Set<string>();

  posts.forEach(post => {
    if (!post.caption) return;
    const matches = post.caption.match(/#[a-zA-Z0-9_]+/g);
    if (matches) {
      matches.forEach(tag => {
        const cleanTag = tag.replace('#', '');
        if (cleanTag.toLowerCase().includes(q)) {
          hashtags.add(cleanTag);
        }
      });
    }
  });

  return Array.from(hashtags);
};

/**
 * GET /hashtags/:tag/posts
 * Daftar post dengan hashtag tertentu.
 * SRCH-02: Post dari akun privat tidak muncul untuk non-follower.
 */
export const getHashtagPosts = async (tag: string, currentUserId: string): Promise<Post[]> => {
  await delay(450);
  const cleanTag = tag.trim().toLowerCase().replace('#', '');
  if (!cleanTag) return [];

  const posts = getPostsDb().filter(p => !p.deleted_at && !p.is_archived);
  const media = getMediaDb();
  const likes = getLikesDb();
  const comments = getCommentsDb();
  const saved = getSavedDb();

  const matchedPosts = posts.filter(post => {
    if (!post.caption) return false;
    
    // Cek block (SRCH-01)
    if (isBlocked(currentUserId, post.user_id)) return false;

    // Cek privasi (SRCH-02)
    const author = getUserObject(post.user_id);
    if (author.is_private && post.user_id !== currentUserId && !isFollowing(currentUserId, post.user_id)) {
      return false;
    }

    // Cek hashtag match
    const tagRegex = new RegExp(`#${cleanTag}\\b`, 'i');
    return tagRegex.test(post.caption);
  });

  // Enrich posts
  return matchedPosts.map(post => {
    const postMedia = media.filter(m => m.post_id === post.id);
    const postLikes = likes.filter(l => l.post_id === post.id);
    const postComments = comments.filter(c => c.post_id === post.id && !c.deleted_at);
    const postSaved = saved.filter(s => s.user_id === currentUserId && s.post_id === post.id);

    return {
      ...post,
      user: getUserObject(post.user_id),
      media: postMedia,
      likes_count: postLikes.length,
      comments_count: postComments.length,
      is_liked: likes.some(l => l.user_id === currentUserId && l.post_id === post.id),
      is_saved: postSaved.length > 0,
    };
  });
};
