/**
 * TypeScript interfaces for Twistgram
 * 
 * Organized 1:1 with database schema from SRS section 10.
 * All types will be progressively filled in as each feature phase is implemented.
 * 
 * Phase 0: Skeleton only — types will be added per phase:
 *   - Phase 2: User, Auth types
 *   - Phase 3: Follow, Block types
 *   - Phase 4: Post, Comment, Like, SavedPost types
 *   - Phase 5: Story, StoryView types
 *   - Phase 6: Conversation, Message, Notification types
 */

// ============================================================
// Utility types (shared)
// ============================================================

export type UUID = string;
export type ISODateString = string;

// ============================================================
// Enums (matching SRS section 10 ENUM columns)
// ============================================================

/** SRS 10.3 — follows.status */
export type FollowStatus = 'accepted' | 'pending';

/** SRS 10.5 — post_media.media_type */
export type MediaType = 'image' | 'video';

/** SRS 10.6 — stories.media_type */
export type StoryMediaType = 'image' | 'video' | 'text';

/** SRS 10.9 — likes.likeable_type */
export type LikeableType = 'post' | 'comment';

/** SRS 10.16 — notifications.type */
export type NotificationType =
  | 'like'
  | 'comment'
  | 'follow'
  | 'follow_request'
  | 'mention'
  | 'story_reply';

/** SRS 10.17 — reports.reason */
export type ReportReason = 'spam' | 'inappropriate' | 'harassment' | 'fake_account' | 'other';

/** SRS 10.17 — reports.status */
export type ReportStatus = 'pending' | 'reviewed' | 'action_taken' | 'dismissed';

/** SRS 10.17 — reports.target_type */
export type ReportTargetType = 'user' | 'post' | 'comment';

// ============================================================
// Entity interfaces — will be populated per phase
// ============================================================

// Phase 2 ↓
export interface User {
  id: UUID;
  name: string;
  username: string;
  email: string;
  phone?: string;
  phone_verified: boolean;
  email_verified: boolean;
  bio?: string;
  avatar_url?: string;
  is_private: boolean;
  created_at: ISODateString;
  updated_at: ISODateString;
}

// Phase 3 ↓
export interface Follow {
  id: UUID;
  follower_id: UUID;
  following_id: UUID;
  status: FollowStatus;
  is_close_friend: boolean;
  created_at: ISODateString;
}

export interface Block {
  id: UUID;
  blocker_id: UUID;
  blocked_id: UUID;
  created_at: ISODateString;
}

// Phase 4 ↓
export interface Post {
  id: UUID;
  user_id: UUID;
  caption?: string;
  is_archived: boolean;
  created_at: ISODateString;
  deleted_at?: ISODateString;
  // Relations (populated by API)
  user?: User;
  media?: PostMedia[];
  likes_count?: number;
  comments_count?: number;
  is_liked?: boolean;
  is_saved?: boolean;
}

export interface PostMedia {
  id: UUID;
  post_id: UUID;
  media_url: string;
  media_type: MediaType;
}

export interface Comment {
  id: UUID;
  post_id: UUID;
  user_id: UUID;
  parent_comment_id?: UUID;
  content: string;
  created_at: ISODateString;
  deleted_at?: ISODateString;
  // Relations
  user?: User;
  replies?: Comment[];
  likes_count?: number;
  is_liked?: boolean;
}

export interface Like {
  id: UUID;
  user_id: UUID;
  likeable_type: LikeableType;
  likeable_id: UUID;
  created_at: ISODateString;
}

export interface SavedPost {
  id: UUID;
  user_id: UUID;
  post_id: UUID;
  created_at: ISODateString;
}

// Phase 5 ↓
export interface Story {
  id: UUID;
  user_id: UUID;
  media_url?: string;
  media_type: StoryMediaType;
  text_content?: string;
  expires_at: ISODateString;
  created_at: ISODateString;
  // Relations
  user?: User;
  views_count?: number;
  is_viewed?: boolean;
}

export interface StoryView {
  id: UUID;
  story_id: UUID;
  viewer_id: UUID;
  viewed_at: ISODateString;
  // Relations
  viewer?: User;
}

// Phase 6 ↓
export interface Conversation {
  id: UUID;
  created_at: ISODateString;
  // Relations
  participants?: User[];
  last_message?: Message;
}

export interface Message {
  id: UUID;
  conversation_id: UUID;
  sender_id: UUID;
  content?: string;
  media_url?: string;
  reply_to_story_id?: UUID;
  created_at: ISODateString;
  // Relations
  sender?: User;
}

export interface Notification {
  id: UUID;
  recipient_id: UUID;
  actor_id: UUID;
  type: NotificationType;
  reference_id?: UUID;
  is_read: boolean;
  created_at: ISODateString;
  // Relations
  actor?: User;
}

export interface Report {
  id: UUID;
  reporter_id: UUID;
  target_type: ReportTargetType;
  target_id: UUID;
  reason: ReportReason;
  status: ReportStatus;
  created_at: ISODateString;
}

// ============================================================
// API response wrappers
// ============================================================

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  cursor?: string;
  has_more: boolean;
}

// ============================================================
// Auth types (Phase 2)
// ============================================================

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  identifier: string; // email OR username
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}
