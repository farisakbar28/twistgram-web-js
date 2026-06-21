import type { User as AuthUser } from '../../types/auth';
import type {
  Comment,
  Conversation,
  Message,
  Notification,
  Post,
  PostTag,
  PostMedia,
  SavedPost,
  Story,
  StoryView,
} from '../../types/index';
import type { Block, Follow } from '../../types/social';

interface MockLikeRecord {
  id: string;
  user_id: string;
  post_id?: string;
  comment_id?: string;
  created_at: string;
}

export interface MockDatabase {
  users: AuthUser[];
  passwords: Record<string, string>;
  postCounts: Record<string, number>;
  userInterests: Record<string, string[]>;
  follows: Follow[];
  blocks: Block[];
  posts: Post[];
  postMedia: PostMedia[];
  postTags: PostTag[];
  comments: Comment[];
  likes: MockLikeRecord[];
  savedPosts: SavedPost[];
  stories: Story[];
  storyViews: StoryView[];
  conversations: Conversation[];
  conversationParticipants: Record<string, string[]>;
  messages: Message[];
  notifications: Notification[];
}

const STORAGE_KEY_DB = 'twistgram_mock_db';
const LEGACY_STORAGE_KEYS = {
  posts: 'twistgram_posts',
  postMedia: 'twistgram_post_media',
  postTags: 'twistgram_post_tags',
  comments: 'twistgram_comments',
  likes: 'twistgram_likes',
  savedPosts: 'twistgram_saved_posts',
  stories: 'twistgram_stories',
  storyViews: 'twistgram_story_views',
  conversations: 'twistgram_conversations',
  conversationParticipants: 'twistgram_conversation_participants',
  messages: 'twistgram_messages',
  notifications: 'twistgram_notifications',
  postCounts: 'twistgram_mock_post_counts',
} as const;

const hoursAgo = (hours: number) => new Date(Date.now() - hours * 3600 * 1000).toISOString();
const expiresAt = (createdAt: string) => {
  const date = new Date(createdAt);
  date.setHours(date.getHours() + 24);
  return date.toISOString();
};

const initialUsers = (): AuthUser[] => [
  {
    id: 'user-001',
    name: 'Faris Akbar',
    username: 'farisakbar28',
    email: 'faris@example.com',
    phone: '+628123456789',
    phone_verified: true,
    email_verified: true,
    bio: 'Building Twistgram 🚀 | Frontend Developer',
    avatar_url: null,
    is_private: false,
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-06-01T00:00:00Z',
  },
  {
    id: 'user-002',
    name: 'Clara Clarissa',
    username: 'claraclarissa',
    email: 'clara@example.com',
    phone: null,
    phone_verified: false,
    email_verified: true,
    bio: 'Photographer & Content Creator 📸',
    avatar_url: null,
    is_private: true,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
  },
  {
    id: 'user-003',
    name: 'Andi Wirawan',
    username: 'andiwirawan',
    email: 'andi@example.com',
    phone: null,
    phone_verified: false,
    email_verified: true,
    bio: 'Travel & kuliner 🌍',
    avatar_url: null,
    is_private: false,
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-06-15T00:00:00Z',
  },
  {
    id: 'user-004',
    name: 'Siti Rahayu',
    username: 'sitirahayu',
    email: 'siti@example.com',
    phone: null,
    phone_verified: false,
    email_verified: true,
    bio: null,
    avatar_url: null,
    is_private: false,
    created_at: '2026-04-01T00:00:00Z',
    updated_at: '2026-06-18T00:00:00Z',
  },
  {
    id: 'user-005',
    name: 'Budi Santoso',
    username: 'budisantoso',
    email: 'budi@example.com',
    phone: null,
    phone_verified: false,
    email_verified: true,
    bio: 'Tech enthusiast 💻',
    avatar_url: null,
    is_private: true,
    created_at: '2026-05-01T00:00:00Z',
    updated_at: '2026-06-20T00:00:00Z',
  },
];

const createInitialMockDb = (): MockDatabase => {
  const storyCreatedAt1 = hoursAgo(2);
  const storyCreatedAt2 = hoursAgo(1);
  const storyCreatedAt3 = hoursAgo(5);
  const storyCreatedAt4 = hoursAgo(3);
  const storyCreatedAt5 = hoursAgo(10);

  return {
    users: initialUsers(),
    passwords: {
      'user-001': 'Password123',
      'user-002': 'Secret456!',
      'user-003': 'Password123',
      'user-004': 'Password123',
      'user-005': 'Password123',
    },
    postCounts: {
      'user-001': 24,
      'user-002': 57,
      'user-003': 12,
      'user-004': 8,
      'user-005': 31,
    },
    userInterests: {
      'user-001': ['Teknologi', 'Gaming', 'Fotografi'],
      'user-002': ['Fotografi', 'Seni & Desain', 'Fashion'],
      'user-003': ['Travel', 'Kuliner'],
      'user-004': ['Musik', 'Film & Seri'],
      'user-005': ['Teknologi', 'Bisnis'],
    },
    follows: [
      { id: 'follow-001', follower_id: 'user-001', following_id: 'user-002', status: 'pending', is_close_friend: false, created_at: '2026-06-01T00:00:00Z' },
      { id: 'follow-002', follower_id: 'user-001', following_id: 'user-003', status: 'accepted', is_close_friend: false, created_at: '2026-06-02T00:00:00Z' },
      { id: 'follow-003', follower_id: 'user-001', following_id: 'user-004', status: 'accepted', is_close_friend: false, created_at: '2026-06-03T00:00:00Z' },
      { id: 'follow-004', follower_id: 'user-002', following_id: 'user-001', status: 'accepted', is_close_friend: false, created_at: '2026-06-01T00:00:00Z' },
      { id: 'follow-005', follower_id: 'user-003', following_id: 'user-001', status: 'accepted', is_close_friend: false, created_at: '2026-06-04T00:00:00Z' },
      { id: 'follow-006', follower_id: 'user-004', following_id: 'user-005', status: 'pending', is_close_friend: false, created_at: '2026-06-10T00:00:00Z' },
      { id: 'follow-007', follower_id: 'user-003', following_id: 'user-004', status: 'accepted', is_close_friend: false, created_at: '2026-06-05T00:00:00Z' },
    ],
    blocks: [],
    posts: [
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
    ],
    postMedia: [
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
    ],
    postTags: [],
    comments: [
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
    ],
    likes: [
      { id: 'like-001', user_id: 'user-002', post_id: 'post-001', created_at: '2026-06-20T10:10:00Z' },
      { id: 'like-002', user_id: 'user-003', post_id: 'post-001', created_at: '2026-06-20T10:30:00Z' },
      { id: 'like-003', user_id: 'user-001', post_id: 'post-002', created_at: '2026-06-19T17:40:00Z' },
    ],
    savedPosts: [
      { id: 'save-001', user_id: 'user-001', post_id: 'post-002', created_at: '2026-06-20T08:00:00Z' },
    ],
    stories: [
      {
        id: 'story-001',
        user_id: 'user-002',
        media_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop',
        media_type: 'image',
        expires_at: expiresAt(storyCreatedAt1),
        created_at: storyCreatedAt1,
      },
      {
        id: 'story-002',
        user_id: 'user-002',
        media_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&auto=format&fit=crop',
        media_type: 'image',
        expires_at: expiresAt(storyCreatedAt2),
        created_at: storyCreatedAt2,
      },
      {
        id: 'story-003',
        user_id: 'user-003',
        media_url: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop',
        media_type: 'image',
        expires_at: expiresAt(storyCreatedAt3),
        created_at: storyCreatedAt3,
      },
      {
        id: 'story-004',
        user_id: 'user-003',
        media_type: 'text',
        text_content: 'Selamat pagi semua! Hari yang cerah untuk memulai petualangan baru ☀️',
        expires_at: expiresAt(storyCreatedAt4),
        created_at: storyCreatedAt4,
      },
      {
        id: 'story-005',
        user_id: 'user-004',
        media_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=800&auto=format&fit=crop',
        media_type: 'image',
        expires_at: expiresAt(storyCreatedAt5),
        created_at: storyCreatedAt5,
      },
    ],
    storyViews: [
      { id: 'view-001', story_id: 'story-001', viewer_id: 'user-003', viewed_at: new Date(Date.now() - 1.5 * 3600 * 1000).toISOString() },
    ],
    conversations: [
      {
        id: 'conv-001',
        created_at: '2026-06-20T09:00:00Z',
      },
      {
        id: 'conv-002',
        created_at: '2026-06-19T14:00:00Z',
      },
    ],
    conversationParticipants: {
      'conv-001': ['user-001', 'user-002'],
      'conv-002': ['user-001', 'user-005'],
    },
    messages: [
      {
        id: 'msg-001',
        conversation_id: 'conv-001',
        sender_id: 'user-002',
        content: 'Hai Faris! Selamat atas pengerjaan Twistgram!',
        created_at: '2026-06-20T09:00:00Z',
      },
      {
        id: 'msg-002',
        conversation_id: 'conv-001',
        sender_id: 'user-001',
        content: 'Halo Clara! Makasih banyak ya. Ini berkat dukungannya juga.',
        created_at: '2026-06-20T09:05:00Z',
      },
      {
        id: 'msg-003',
        conversation_id: 'conv-001',
        sender_id: 'user-002',
        content: 'Tentu! Aku suka banget sama styling gradient-nya 💖',
        created_at: '2026-06-20T09:08:00Z',
      },
      {
        id: 'msg-004',
        conversation_id: 'conv-002',
        sender_id: 'user-005',
        content: 'Halo Faris, bisa tolong review portofolio React aku?',
        created_at: '2026-06-19T14:00:00Z',
      },
    ],
    notifications: [
      {
        id: 'notif-001',
        recipient_id: 'user-001',
        actor_id: 'user-002',
        type: 'follow',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
      },
      {
        id: 'notif-002',
        recipient_id: 'user-001',
        actor_id: 'user-003',
        type: 'like',
        reference_id: 'post-001',
        is_read: false,
        created_at: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
      {
        id: 'notif-003',
        recipient_id: 'user-001',
        actor_id: 'user-002',
        type: 'comment',
        reference_id: 'post-001',
        is_read: true,
        created_at: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
      },
      {
        id: 'notif-004',
        recipient_id: 'user-002',
        actor_id: 'user-001',
        type: 'follow_request',
        reference_id: 'follow-001',
        is_read: false,
        created_at: '2026-06-01T00:00:00Z',
      },
    ],
  };
};

const readStorage = <T>(key: string): T | null => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
};

const syncLegacyStorage = (db: MockDatabase) => {
  try {
    localStorage.setItem(LEGACY_STORAGE_KEYS.posts, JSON.stringify(db.posts));
    localStorage.setItem(LEGACY_STORAGE_KEYS.postMedia, JSON.stringify(db.postMedia));
    localStorage.setItem(LEGACY_STORAGE_KEYS.postTags, JSON.stringify(db.postTags));
    localStorage.setItem(LEGACY_STORAGE_KEYS.comments, JSON.stringify(db.comments));
    localStorage.setItem(LEGACY_STORAGE_KEYS.likes, JSON.stringify(db.likes));
    localStorage.setItem(LEGACY_STORAGE_KEYS.savedPosts, JSON.stringify(db.savedPosts));
    localStorage.setItem(LEGACY_STORAGE_KEYS.stories, JSON.stringify(db.stories));
    localStorage.setItem(LEGACY_STORAGE_KEYS.storyViews, JSON.stringify(db.storyViews));
    localStorage.setItem(LEGACY_STORAGE_KEYS.conversations, JSON.stringify(db.conversations));
    localStorage.setItem(
      LEGACY_STORAGE_KEYS.conversationParticipants,
      JSON.stringify(db.conversationParticipants)
    );
    localStorage.setItem(LEGACY_STORAGE_KEYS.messages, JSON.stringify(db.messages));
    localStorage.setItem(LEGACY_STORAGE_KEYS.notifications, JSON.stringify(db.notifications));
    localStorage.setItem(LEGACY_STORAGE_KEYS.postCounts, JSON.stringify(db.postCounts));
  } catch {
    // ignore storage sync failure in mock mode
  }
};

const hydrateFromLegacySlices = (db: MockDatabase): MockDatabase => {
  const currentUser = readStorage<AuthUser>('twistgram_user');
  if (currentUser) {
    const existingIndex = db.users.findIndex(user => user.id === currentUser.id);
    if (existingIndex >= 0) {
      db.users[existingIndex] = { ...db.users[existingIndex], ...currentUser };
    } else {
      db.users.push(currentUser);
    }
  }

  return {
    ...db,
    posts: readStorage<Post[]>(LEGACY_STORAGE_KEYS.posts) ?? db.posts,
    postMedia: readStorage<PostMedia[]>(LEGACY_STORAGE_KEYS.postMedia) ?? db.postMedia,
    postTags: readStorage<PostTag[]>(LEGACY_STORAGE_KEYS.postTags) ?? db.postTags,
    comments: readStorage<Comment[]>(LEGACY_STORAGE_KEYS.comments) ?? db.comments,
    likes: readStorage<MockLikeRecord[]>(LEGACY_STORAGE_KEYS.likes) ?? db.likes,
    savedPosts: readStorage<SavedPost[]>(LEGACY_STORAGE_KEYS.savedPosts) ?? db.savedPosts,
    stories: readStorage<Story[]>(LEGACY_STORAGE_KEYS.stories) ?? db.stories,
    storyViews: readStorage<StoryView[]>(LEGACY_STORAGE_KEYS.storyViews) ?? db.storyViews,
    conversations: readStorage<Conversation[]>(LEGACY_STORAGE_KEYS.conversations) ?? db.conversations,
    conversationParticipants:
      readStorage<Record<string, string[]>>(LEGACY_STORAGE_KEYS.conversationParticipants) ??
      db.conversationParticipants,
    messages: readStorage<Message[]>(LEGACY_STORAGE_KEYS.messages) ?? db.messages,
    notifications: readStorage<Notification[]>(LEGACY_STORAGE_KEYS.notifications) ?? db.notifications,
    postCounts: readStorage<Record<string, number>>(LEGACY_STORAGE_KEYS.postCounts) ?? db.postCounts,
  };
};

const initializeMockDb = (): MockDatabase => {
  const existingDb = readStorage<MockDatabase>(STORAGE_KEY_DB);
  if (existingDb) {
    syncLegacyStorage(existingDb);
    return existingDb;
  }

  const seededDb = hydrateFromLegacySlices(createInitialMockDb());
  localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(seededDb));
  syncLegacyStorage(seededDb);
  return seededDb;
};

export const mockDb = initializeMockDb();

export const persistMockDb = () => {
  localStorage.setItem(STORAGE_KEY_DB, JSON.stringify(mockDb));
  syncLegacyStorage(mockDb);
};

export const getMockUserById = (userId: string) =>
  mockDb.users.find(user => user.id === userId);

export const getMockUserByEmail = (email: string) =>
  mockDb.users.find(user => user.email === email);

export const getMockUserByUsername = (username: string) =>
  mockDb.users.find(user => user.username === username);
