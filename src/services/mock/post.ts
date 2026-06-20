/**
 * Mock Post Service
 * Ref: SRS §5.1-5.4, §10.5-10.11 (DB schema)
 *      API contracts: §11.4 (Posts & Feed), §11.5 (Interactions)
 *
 * Persistensi menggunakan localStorage agar demo interaksi (like, comment, save, create post)
 * tetap bertahan saat berpindah halaman atau refresh halaman.
 */

import { delay } from '../../utils';
import type { User, Post, PostMedia, Comment, SavedPost } from '../../types/index';
import { getFollowing, getInterests } from './social';

// ============================================================
// Mock Database (Initial Data)
// ============================================================

const MOCK_USERS_MAP: Record<string, User> = {
  'user-001': {
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
  'user-002': {
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
  'user-003': {
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
  'user-004': {
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
  'user-005': {
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
};

const INITIAL_POSTS: Post[] = [
  {
    id: 'post-001',
    user_id: 'user-001',
    caption: 'Menyelesaikan setup design system Twistgram! Keren banget gradasi violet → blue nya 💻 #twistgram #frontend #designsystem',
    is_archived: false,
    created_at: '2026-06-20T10:00:00Z',
  },
  {
    id: 'post-002',
    user_id: 'user-002',
    caption: 'Menikmati sunset sore ini di pantai selatan 🌅 Indahnya ciptaan-Nya. #sunset #nature #photography',
    is_archived: false,
    created_at: '2026-06-19T17:30:00Z',
  },
  {
    id: 'post-003',
    user_id: 'user-003',
    caption: 'Kulineran di Bandung, nyobain cuanki hangat pas hujan. Mantap bener! 🍜 #bandung #kuliner #foodporn',
    is_archived: false,
    created_at: '2026-06-18T13:15:00Z',
  },
  {
    id: 'post-004',
    user_id: 'user-001',
    caption: 'Weekend coding project. Membangun Twistgram React app. #reactjs #typescript #programming',
    is_archived: false,
    created_at: '2026-06-17T09:00:00Z',
  },
  {
    id: 'post-005',
    user_id: 'user-004',
    caption: 'Konser musik semalam seru banget! Gak sabar buat nonton lagi. 🎶🎸 #concert #music #live',
    is_archived: false,
    created_at: '2026-06-16T22:00:00Z',
  },
];

const INITIAL_MEDIA: PostMedia[] = [
  {
    id: 'media-001',
    post_id: 'post-001',
    media_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop',
    media_type: 'image',
  },
  {
    id: 'media-002',
    post_id: 'post-002',
    media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    media_type: 'image',
  },
  {
    id: 'media-003',
    post_id: 'post-003',
    media_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&auto=format&fit=crop',
    media_type: 'image',
  },
  {
    id: 'media-004',
    post_id: 'post-004',
    media_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&auto=format&fit=crop',
    media_type: 'image',
  },
  {
    id: 'media-005',
    post_id: 'post-005',
    media_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    media_type: 'image',
  },
];

const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comment-001',
    post_id: 'post-001',
    user_id: 'user-002',
    content: 'Mantap Faris! Desainnya rapi banget.',
    created_at: '2026-06-20T10:15:00Z',
  },
  {
    id: 'comment-002',
    post_id: 'post-001',
    user_id: 'user-001',
    parent_comment_id: 'comment-001',
    content: 'Makasih Clara! Masih banyak polesan lagi nanti.',
    created_at: '2026-06-20T10:20:00Z',
  },
  {
    id: 'comment-003',
    post_id: 'post-002',
    user_id: 'user-003',
    content: 'Sunsetnya keren banget! Di pantai mana ini?',
    created_at: '2026-06-19T17:45:00Z',
  },
  {
    id: 'comment-004',
    post_id: 'post-002',
    user_id: 'user-002',
    parent_comment_id: 'comment-003',
    content: 'Di Pantai Parangtritis Jogja, Mas Andi.',
    created_at: '2026-06-19T17:50:00Z',
  },
];

interface MockLike {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

const INITIAL_LIKES: MockLike[] = [
  { id: 'like-001', user_id: 'user-002', post_id: 'post-001', created_at: '2026-06-20T10:10:00Z' },
  { id: 'like-002', user_id: 'user-003', post_id: 'post-001', created_at: '2026-06-20T10:30:00Z' },
  { id: 'like-003', user_id: 'user-001', post_id: 'post-002', created_at: '2026-06-19T17:40:00Z' },
];

const INITIAL_SAVED: SavedPost[] = [
  { id: 'save-001', user_id: 'user-001', post_id: 'post-002', created_at: '2026-06-20T08:00:00Z' },
];

// ============================================================
// Storage Keys & Initialization
// ============================================================

const STORAGE_KEYS = {
  POSTS: 'twistgram_posts',
  MEDIA: 'twistgram_post_media',
  COMMENTS: 'twistgram_comments',
  LIKES: 'twistgram_likes',
  SAVED: 'twistgram_saved_posts',
};

const getStorageData = <T>(key: string, initial: T): T => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : initial;
  } catch {
    return initial;
  }
};

const setStorageData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch {
    // ignore
  }
};

// Initialize localStorage
if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
  setStorageData(STORAGE_KEYS.POSTS, INITIAL_POSTS);
  setStorageData(STORAGE_KEYS.MEDIA, INITIAL_MEDIA);
  setStorageData(STORAGE_KEYS.COMMENTS, INITIAL_COMMENTS);
  setStorageData(STORAGE_KEYS.LIKES, INITIAL_LIKES);
  setStorageData(STORAGE_KEYS.SAVED, INITIAL_SAVED);
}

// ============================================================
// Helpers
// ============================================================

const getPostsDb = (): Post[] => getStorageData<Post[]>(STORAGE_KEYS.POSTS, []);
const getMediaDb = (): PostMedia[] => getStorageData<PostMedia[]>(STORAGE_KEYS.MEDIA, []);
const getCommentsDb = (): Comment[] => getStorageData<Comment[]>(STORAGE_KEYS.COMMENTS, []);
const getLikesDb = (): MockLike[] => getStorageData<MockLike[]>(STORAGE_KEYS.LIKES, []);
const getSavedDb = (): SavedPost[] => getStorageData<SavedPost[]>(STORAGE_KEYS.SAVED, []);

const getUserObject = (userId: string): User => {
  // Sync dengan database profile jika ada yang diperbarui (misalnya Faris ganti nama di profile)
  try {
    const raw = localStorage.getItem('twistgram_user');
    if (raw) {
      const u = JSON.parse(raw) as { id: string; phone?: string | null; bio?: string | null; avatar_url?: string | null; [key: string]: unknown };
      if (u.id === userId) {
        return {
          ...u,
          phone: u.phone ?? undefined,
          bio: u.bio ?? undefined,
          avatar_url: u.avatar_url ?? undefined,
        } as User;
      }
    }
  } catch {
    // ignore
  }

  // Fallback
  return MOCK_USERS_MAP[userId] ?? {
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

const enrichPost = (post: Post, currentUserId: string): Post => {
  const media = getMediaDb().filter(m => m.post_id === post.id);
  const likes = getLikesDb().filter(l => l.post_id === post.id);
  const comments = getCommentsDb().filter(c => c.post_id === post.id && !c.deleted_at);
  const saves = getSavedDb().filter(s => s.post_id === post.id);

  return {
    ...post,
    user: getUserObject(post.user_id),
    media,
    likes_count: likes.length,
    comments_count: comments.length,
    is_liked: likes.some(l => l.user_id === currentUserId),
    is_saved: saves.some(s => s.user_id === currentUserId),
  };
};

// ============================================================
// Post Service — SRS §11.4
// ============================================================

/** GET /feed — Beranda */
export const getFeed = async (currentUserId: string): Promise<Post[]> => {
  await delay(500);

  const posts = getPostsDb().filter(p => !p.deleted_at && !p.is_archived);

  // Ambil user yang diikuti
  let followingUserIds: string[] = [];
  try {
    const following = await getFollowing(currentUserId, currentUserId);
    followingUserIds = following.map(f => f.id);
  } catch {
    // ignore
  }

  // Jika tidak follow siapa pun, filter berdasarkan minat (Fallback)
  let userInterests: string[] = [];
  try {
    userInterests = await getInterests(currentUserId);
  } catch {
    // ignore
  }

  const followedPosts = posts.filter(p => followingUserIds.includes(p.user_id) || p.user_id === currentUserId);

  let filtered = followedPosts;

  // Jika feed kosong karena belum follow siapa pun, tampilkan semua post yang bukan privat atau sesuai minat
  if (filtered.length === 0) {
    filtered = posts.filter(p => {
      const author = getUserObject(p.user_id);
      // Kecuali akun privat yang belum di-follow
      return !author.is_private;
    });

    // Urutkan yang sesuai minat terlebih dahulu jika ada
    if (userInterests.length > 0) {
      filtered.sort((a, b) => {
        const aHashtags = a.caption?.toLowerCase().match(/#[a-z0-9_]+/g) || [];
        const bHashtags = b.caption?.toLowerCase().match(/#[a-z0-9_]+/g) || [];

        const aMatches = aHashtags.some(tag => userInterests.some(i => i.toLowerCase() === tag.replace('#', '')));
        const bMatches = bHashtags.some(tag => userInterests.some(i => i.toLowerCase() === tag.replace('#', '')));

        if (aMatches && !bMatches) return -1;
        if (!aMatches && bMatches) return 1;
        return 0;
      });
    }
  } else {
    // Urutkan secara kronologis (terbaru di atas)
    filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  return filtered.map(p => enrichPost(p, currentUserId));
};

/** POST /posts — Buat post baru */
export const createPost = async (
  currentUserId: string,
  payload: { mediaUrl: string; mediaType: 'image' | 'video'; caption?: string }
): Promise<Post> => {
  await delay(600);

  const posts = getPostsDb();
  const media = getMediaDb();

  const newPostId = `post-${Date.now()}`;
  const newPost: Post = {
    id: newPostId,
    user_id: currentUserId,
    caption: payload.caption,
    is_archived: false,
    created_at: new Date().toISOString(),
  };

  const newMedia: PostMedia = {
    id: `media-${Date.now()}`,
    post_id: newPostId,
    media_url: payload.mediaUrl,
    media_type: payload.mediaType,
  };

  posts.unshift(newPost); // Taruh paling atas
  media.push(newMedia);

  setStorageData(STORAGE_KEYS.POSTS, posts);
  setStorageData(STORAGE_KEYS.MEDIA, media);

  // Sync post_count ke localStorage mock profile jika ada
  try {
    const countsKey = 'twistgram_mock_post_counts';
    const counts = JSON.parse(localStorage.getItem(countsKey) || '{}') as Record<string, number>;
    counts[currentUserId] = (counts[currentUserId] ?? 0) + 1;
    localStorage.setItem(countsKey, JSON.stringify(counts));
  } catch {
    // ignore
  }

  return enrichPost(newPost, currentUserId);
};

/** GET /posts/:id — Detail post */
export const getPostById = async (postId: string, currentUserId: string): Promise<Post> => {
  await delay(400);

  const post = getPostsDb().find(p => p.id === postId && !p.deleted_at);
  if (!post) throw new Error('Postingan tidak ditemukan.');

  const author = getUserObject(post.user_id);
  // Cek jika akun privat dan bukan milik sendiri dan bukan following
  if (author.is_private && post.user_id !== currentUserId) {
    let followingUserIds: string[] = [];
    try {
      const following = await getFollowing(currentUserId, currentUserId);
      followingUserIds = following.map(f => f.id);
    } catch {
      // ignore
    }
    if (!followingUserIds.includes(post.user_id)) {
      throw new Error('Postingan ini bersifat privat.');
    }
  }

  return enrichPost(post, currentUserId);
};

/** PATCH /posts/:id — Edit caption post */
export const updatePostCaption = async (
  postId: string,
  currentUserId: string,
  caption: string
): Promise<Post> => {
  await delay(400);

  const posts = getPostsDb();
  const idx = posts.findIndex(p => p.id === postId && !p.deleted_at);
  if (idx === -1) throw new Error('Postingan tidak ditemukan.');

  if (posts[idx].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk mengedit postingan ini.');
  }

  posts[idx].caption = caption;
  setStorageData(STORAGE_KEYS.POSTS, posts);

  return enrichPost(posts[idx], currentUserId);
};

/** DELETE /posts/:id — Hapus post (soft delete) */
export const deletePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(500);

  const posts = getPostsDb();
  const idx = posts.findIndex(p => p.id === postId && !p.deleted_at);
  if (idx === -1) throw new Error('Postingan tidak ditemukan.');

  if (posts[idx].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk menghapus postingan ini.');
  }

  posts[idx].deleted_at = new Date().toISOString();
  setStorageData(STORAGE_KEYS.POSTS, posts);

  // Sync post_count ke profile
  try {
    const countsKey = 'twistgram_mock_post_counts';
    const counts = JSON.parse(localStorage.getItem(countsKey) || '{}') as Record<string, number>;
    counts[currentUserId] = Math.max(0, (counts[currentUserId] ?? 1) - 1);
    localStorage.setItem(countsKey, JSON.stringify(counts));
  } catch {
    // ignore
  }
};

/** POST /posts/:id/archive — Arsipkan post */
export const archivePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(400);

  const posts = getPostsDb();
  const idx = posts.findIndex(p => p.id === postId && !p.deleted_at);
  if (idx === -1) throw new Error('Postingan tidak ditemukan.');

  if (posts[idx].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk mengarsipkan postingan ini.');
  }

  posts[idx].is_archived = true;
  setStorageData(STORAGE_KEYS.POSTS, posts);
};

/** POST /posts/:id/unarchive — Kembalikan dari arsip */
export const unarchivePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(400);

  const posts = getPostsDb();
  const idx = posts.findIndex(p => p.id === postId && !p.deleted_at);
  if (idx === -1) throw new Error('Postingan tidak ditemukan.');

  if (posts[idx].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk membuka arsip postingan ini.');
  }

  posts[idx].is_archived = false;
  setStorageData(STORAGE_KEYS.POSTS, posts);
};

/** GET /users/:id/posts — Daftar post milik pengguna tertentu */
export const getUserPosts = async (targetUserId: string, currentUserId: string): Promise<Post[]> => {
  await delay(500);

  const author = getUserObject(targetUserId);
  if (author.is_private && targetUserId !== currentUserId) {
    let followingUserIds: string[] = [];
    try {
      const following = await getFollowing(currentUserId, currentUserId);
      followingUserIds = following.map(f => f.id);
    } catch {
      // ignore
    }
    if (!followingUserIds.includes(targetUserId)) {
      return []; // Return empty if private and not following
    }
  }

  const posts = getPostsDb()
    .filter(p => p.user_id === targetUserId && !p.deleted_at && (!p.is_archived || targetUserId === currentUserId))
    .map(p => enrichPost(p, currentUserId));

  // Sort by date newest
  posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return posts;
};

// ============================================================
// Post Interaction Service — SRS §11.5
// ============================================================

/** POST /posts/:id/like — Like post */
export const likePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const likes = getLikesDb();
  const alreadyLiked = likes.some(l => l.user_id === currentUserId && l.post_id === postId);

  if (!alreadyLiked) {
    likes.push({
      id: `like-${Date.now()}`,
      user_id: currentUserId,
      post_id: postId,
      created_at: new Date().toISOString(),
    });
    setStorageData(STORAGE_KEYS.LIKES, likes);
  }
};

/** DELETE /posts/:id/like — Unlike post */
export const unlikePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const likes = getLikesDb();
  const filtered = likes.filter(l => !(l.user_id === currentUserId && l.post_id === postId));
  setStorageData(STORAGE_KEYS.LIKES, filtered);
};

/** GET /posts/:id/comments — Daftar komentar */
export const getPostComments = async (postId: string, _currentUserId: string): Promise<Comment[]> => {
  await delay(400);

  const allComments = getCommentsDb();
  // Filter comments for this post that are not deleted
  const postComments = allComments.filter(c => c.post_id === postId && !c.deleted_at);

  const enrichComment = (c: Comment): Comment => ({
    ...c,
    user: getUserObject(c.user_id),
  });

  // Pisahkan parent comment dan reply
  const rootComments = postComments.filter(c => !c.parent_comment_id).map(enrichComment);
  const replies = postComments.filter(c => c.parent_comment_id).map(enrichComment);

  // Masukkan replies ke parent (1-level thread)
  const result = rootComments.map(parent => {
    const parentReplies = replies.filter(r => r.parent_comment_id === parent.id);
    return {
      ...parent,
      replies: parentReplies,
    };
  });

  // Sort by date newest
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return result;
};

/** POST /posts/:id/comments — Tambah komentar */
export const createComment = async (
  postId: string,
  currentUserId: string,
  payload: { content: string; parentCommentId?: string }
): Promise<Comment> => {
  await delay(400);

  const comments = getCommentsDb();
  const newComment: Comment = {
    id: `comment-${Date.now()}`,
    post_id: postId,
    user_id: currentUserId,
    parent_comment_id: payload.parentCommentId,
    content: payload.content.trim(),
    created_at: new Date().toISOString(),
  };

  comments.push(newComment);
  setStorageData(STORAGE_KEYS.COMMENTS, comments);

  return {
    ...newComment,
    user: getUserObject(currentUserId),
    replies: [],
  };
};

/** DELETE /comments/:id — Hapus komentar */
export const deleteComment = async (commentId: string, currentUserId: string): Promise<void> => {
  await delay(400);

  const comments = getCommentsDb();
  const idx = comments.findIndex(c => c.id === commentId && !c.deleted_at);
  if (idx === -1) throw new Error('Komentar tidak ditemukan.');

  if (comments[idx].user_id !== currentUserId) {
    // Bisa juga jika dia pemilik post
    const posts = getPostsDb();
    const post = posts.find(p => p.id === comments[idx].post_id);
    if (!post || post.user_id !== currentUserId) {
      throw new Error('Anda tidak memiliki wewenang untuk menghapus komentar ini.');
    }
  }

  comments[idx].deleted_at = new Date().toISOString();
  setStorageData(STORAGE_KEYS.COMMENTS, comments);
};

/** POST /posts/:id/save — Simpan post */
export const savePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const saves = getSavedDb();
  const alreadySaved = saves.some(s => s.user_id === currentUserId && s.post_id === postId);

  if (!alreadySaved) {
    saves.push({
      id: `save-${Date.now()}`,
      user_id: currentUserId,
      post_id: postId,
      created_at: new Date().toISOString(),
    });
    setStorageData(STORAGE_KEYS.SAVED, saves);
  }
};

/** DELETE /posts/:id/save — Hapus dari tersimpan */
export const unsavePost = async (postId: string, currentUserId: string): Promise<void> => {
  await delay(300);

  const saves = getSavedDb();
  const filtered = saves.filter(s => !(s.user_id === currentUserId && s.post_id === postId));
  setStorageData(STORAGE_KEYS.SAVED, filtered);
};

/** GET /users/me/saved — Daftar post tersimpan */
export const getUserSavedPosts = async (currentUserId: string): Promise<Post[]> => {
  await delay(500);

  const savedPostIds = getSavedDb()
    .filter(s => s.user_id === currentUserId)
    .map(s => s.post_id);

  const posts = getPostsDb()
    .filter(p => savedPostIds.includes(p.id) && !p.deleted_at)
    .map(p => enrichPost(p, currentUserId));

  posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return posts;
};

/** POST /posts/:id/share — Share post (Catat log share & return link) */
export const sharePost = async (postId: string, _currentUserId: string): Promise<string> => {
  await delay(300);
  // Mock share analytics log
  console.info('[Mock Share Post]', postId);
  return `${window.location.origin}/posts/${postId}`;
};
