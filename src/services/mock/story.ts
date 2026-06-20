/**
 * Mock Story Service
 * Ref: SRS §5.5, §10.12, §10.13, §11.6
 *
 * Persistensi menggunakan localStorage.
 * CNT-01: Story expired otomatis 24 jam setelah upload.
 * CNT-02: Reply story menghasilkan DM baru (di Fase ini dicatat sebagai intent, DM diimplementasikan Fase 6).
 */

import { delay } from '../../utils';
import type { Story, StoryView, User } from '../../types/index';

// ============================================================
// User helper (sinkron dengan post.ts agar konsisten)
// ============================================================

const MOCK_USERS_MAP: Record<string, User> = {
  'user-001': {
    id: 'user-001',
    name: 'Faris Akbar',
    username: 'farisakbar28',
    email: 'faris@example.com',
    phone_verified: true,
    email_verified: true,
    bio: 'Building Twistgram 🚀 | Frontend Developer',
    is_private: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  'user-002': {
    id: 'user-002',
    name: 'Clara Clarissa',
    username: 'claraclarissa',
    email: 'clara@example.com',
    phone_verified: false,
    email_verified: true,
    bio: 'Photographer & Content Creator 📸',
    is_private: true,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
  },
  'user-003': {
    id: 'user-003',
    name: 'Andi Wirawan',
    username: 'andiwirawan',
    email: 'andi@example.com',
    phone_verified: false,
    email_verified: true,
    bio: 'Travel & kuliner 🌍',
    is_private: false,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-06-15T00:00:00Z',
  },
  'user-004': {
    id: 'user-004',
    name: 'Siti Rahayu',
    username: 'sitirahayu',
    email: 'siti@example.com',
    phone_verified: false,
    email_verified: true,
    is_private: false,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-06-18T00:00:00Z',
  },
  'user-005': {
    id: 'user-005',
    name: 'Budi Santoso',
    username: 'budisantoso',
    email: 'budi@example.com',
    phone_verified: false,
    email_verified: true,
    bio: 'Tech enthusiast 💻',
    is_private: true,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-06-20T00:00:00Z',
  },
};

const getUserObject = (userId: string): User => {
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

// ============================================================
// Storage Keys & Initial Data
// ============================================================

const STORAGE_KEYS = {
  STORIES: 'twistgram_stories',
  STORY_VIEWS: 'twistgram_story_views',
};

// Buat stories yang aktif (belum expired) — waktu sekarang minus beberapa jam
const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600 * 1000).toISOString();
const expiresAt = (createdAt: string) => {
  const d = new Date(createdAt);
  d.setHours(d.getHours() + 24);
  return d.toISOString();
};

const INITIAL_STORIES: Story[] = [
  {
    id: 'story-001',
    user_id: 'user-002',
    media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
    media_type: 'image',
    expires_at: expiresAt(hoursAgo(2)),
    created_at: hoursAgo(2),
  },
  {
    id: 'story-002',
    user_id: 'user-002',
    media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
    media_type: 'image',
    expires_at: expiresAt(hoursAgo(1)),
    created_at: hoursAgo(1),
  },
  {
    id: 'story-003',
    user_id: 'user-003',
    media_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop',
    media_type: 'image',
    expires_at: expiresAt(hoursAgo(5)),
    created_at: hoursAgo(5),
  },
  {
    id: 'story-004',
    user_id: 'user-003',
    media_type: 'text',
    text_content: 'Selamat pagi semua! Hari yang cerah untuk memulai petualangan baru ☀️',
    expires_at: expiresAt(hoursAgo(3)),
    created_at: hoursAgo(3),
  },
  {
    id: 'story-005',
    user_id: 'user-004',
    media_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
    media_type: 'image',
    expires_at: expiresAt(hoursAgo(10)),
    created_at: hoursAgo(10),
  },
];

const INITIAL_VIEWS: StoryView[] = [
  { id: 'view-001', story_id: 'story-001', viewer_id: 'user-003', viewed_at: hoursAgo(1.5) },
];

// ============================================================
// Storage Helpers
// ============================================================

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

// Initialize localStorage on first load
if (!localStorage.getItem(STORAGE_KEYS.STORIES)) {
  setStorageData(STORAGE_KEYS.STORIES, INITIAL_STORIES);
  setStorageData(STORAGE_KEYS.STORY_VIEWS, INITIAL_VIEWS);
}

const getStoriesDb = (): Story[] => getStorageData<Story[]>(STORAGE_KEYS.STORIES, []);
const getViewsDb = (): StoryView[] => getStorageData<StoryView[]>(STORAGE_KEYS.STORY_VIEWS, []);

// ============================================================
// Helpers
// ============================================================

/** CNT-01: Cek apakah story masih aktif (belum expired) */
const isStoryActive = (story: Story): boolean => {
  return new Date(story.expires_at) > new Date();
};

const enrichStory = (story: Story, currentUserId: string): Story => {
  const views = getViewsDb().filter(v => v.story_id === story.id);
  return {
    ...story,
    user: getUserObject(story.user_id),
    views_count: views.length,
    is_viewed: views.some(v => v.viewer_id === currentUserId),
  };
};

// ============================================================
// Story Service — SRS §11.6
// ============================================================

/**
 * GET /stories/feed
 * Daftar story dari pengguna yang di-follow, masih aktif, dikelompokkan per user.
 * Juga mencakup story milik currentUser sendiri (di posisi paling depan).
 */
export interface StoryGroup {
  user: User;
  stories: Story[];
  hasUnviewed: boolean;
}

export const getStoryFeed = async (currentUserId: string): Promise<StoryGroup[]> => {
  await delay(400);

  // Dapatkan daftar following (import lazy agar tidak circular)
  let followingIds: string[] = [];
  try {
    const { getFollowing } = await import('./social');
    const following = await getFollowing(currentUserId, currentUserId);
    followingIds = following.map(f => f.id);
  } catch {
    // jika gagal, tampilkan story dari semua user publik
  }

  const activeStories = getStoriesDb().filter(isStoryActive);

  // Kelompokkan per user
  const grouped = new Map<string, Story[]>();

  // Tambahkan story sendiri dulu (posisi pertama)
  const ownStories = activeStories.filter(s => s.user_id === currentUserId);
  if (ownStories.length > 0) {
    grouped.set(currentUserId, ownStories.map(s => enrichStory(s, currentUserId)));
  }

  // Tambahkan story dari following
  for (const story of activeStories) {
    if (story.user_id === currentUserId) continue;
    if (!followingIds.includes(story.user_id)) continue;

    const existing = grouped.get(story.user_id) ?? [];
    grouped.set(story.user_id, [...existing, enrichStory(story, currentUserId)]);
  }

  // Jika tidak ada following, tampilkan story dari user publik non-privat
  if (grouped.size <= (ownStories.length > 0 ? 1 : 0)) {
    for (const story of activeStories) {
      if (story.user_id === currentUserId) continue;
      const author = getUserObject(story.user_id);
      if (author.is_private) continue;
      const existing = grouped.get(story.user_id) ?? [];
      grouped.set(story.user_id, [...existing, enrichStory(story, currentUserId)]);
    }
  }

  // Ubah ke array StoryGroup, sort: unviewed first, then by latest created_at
  const result: StoryGroup[] = [];
  for (const [userId, stories] of grouped) {
    const user = getUserObject(userId);
    const hasUnviewed = stories.some(s => !s.is_viewed);
    // Sort stories within group oldest first (untuk sequential viewing)
    stories.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    result.push({ user, stories, hasUnviewed });
  }

  // Own stories always first, then unviewed, then viewed
  result.sort((a, b) => {
    if (a.user.id === currentUserId) return -1;
    if (b.user.id === currentUserId) return 1;
    if (a.hasUnviewed && !b.hasUnviewed) return -1;
    if (!a.hasUnviewed && b.hasUnviewed) return 1;
    return 0;
  });

  return result;
};

/**
 * GET /stories/:id
 * Detail satu story.
 */
export const getStoryById = async (storyId: string, currentUserId: string): Promise<Story> => {
  await delay(300);
  const story = getStoriesDb().find(s => s.id === storyId);
  if (!story) throw new Error('Story tidak ditemukan.');
  if (!isStoryActive(story)) throw new Error('Story ini sudah kedaluwarsa.');
  return enrichStory(story, currentUserId);
};

/**
 * POST /stories/:id/view
 * Catat bahwa story telah dilihat oleh currentUser.
 */
export const markStoryViewed = async (storyId: string, currentUserId: string): Promise<void> => {
  await delay(200);
  const views = getViewsDb();
  const alreadyViewed = views.some(v => v.story_id === storyId && v.viewer_id === currentUserId);
  if (!alreadyViewed) {
    views.push({
      id: `view-${Date.now()}`,
      story_id: storyId,
      viewer_id: currentUserId,
      viewed_at: new Date().toISOString(),
    });
    setStorageData(STORAGE_KEYS.STORY_VIEWS, views);
  }
};

/**
 * GET /stories/:id/viewers
 * Daftar penonton story (hanya untuk pemilik story).
 */
export const getStoryViewers = async (storyId: string, currentUserId: string): Promise<StoryView[]> => {
  await delay(300);
  const story = getStoriesDb().find(s => s.id === storyId);
  if (!story) throw new Error('Story tidak ditemukan.');
  if (story.user_id !== currentUserId) throw new Error('Anda tidak memiliki akses ke daftar penonton story ini.');

  const views = getViewsDb().filter(v => v.story_id === storyId);
  return views.map(v => ({
    ...v,
    viewer: getUserObject(v.viewer_id),
  }));
};

/**
 * POST /stories
 * Upload story baru.
 */
export const createStory = async (
  currentUserId: string,
  payload: {
    mediaUrl?: string;
    mediaType: 'image' | 'video' | 'text';
    textContent?: string;
  }
): Promise<Story> => {
  await delay(600);

  if (payload.mediaType === 'text' && !payload.textContent?.trim()) {
    throw new Error('Konten teks tidak boleh kosong untuk story teks.');
  }
  if (payload.mediaType !== 'text' && !payload.mediaUrl?.trim()) {
    throw new Error('URL media wajib diisi untuk story foto/video.');
  }

  const stories = getStoriesDb();
  const createdAt = new Date().toISOString();
  const expiresAtDate = new Date();
  expiresAtDate.setHours(expiresAtDate.getHours() + 24);

  const newStory: Story = {
    id: `story-${Date.now()}`,
    user_id: currentUserId,
    media_url: payload.mediaUrl?.trim() || undefined,
    media_type: payload.mediaType,
    text_content: payload.textContent?.trim() || undefined,
    expires_at: expiresAtDate.toISOString(),
    created_at: createdAt,
  };

  stories.push(newStory);
  setStorageData(STORAGE_KEYS.STORIES, stories);

  return enrichStory(newStory, currentUserId);
};

/**
 * DELETE /stories/:id
 * Hapus story (hanya pemilik).
 */
export const deleteStory = async (storyId: string, currentUserId: string): Promise<void> => {
  await delay(400);
  const stories = getStoriesDb();
  const idx = stories.findIndex(s => s.id === storyId);
  if (idx === -1) throw new Error('Story tidak ditemukan.');
  if (stories[idx].user_id !== currentUserId) {
    throw new Error('Anda tidak memiliki wewenang untuk menghapus story ini.');
  }
  // Hard delete story (tidak perlu soft delete karena story memang ephemeral)
  stories.splice(idx, 1);
  setStorageData(STORAGE_KEYS.STORIES, stories);
};

/**
 * Periksa apakah user saat ini memiliki story aktif.
 * Digunakan untuk menentukan border gradient pada avatar di StoriesBar.
 */
export const hasActiveStory = async (userId: string): Promise<boolean> => {
  await delay(100);
  return getStoriesDb().some(s => s.user_id === userId && isStoryActive(s));
};
