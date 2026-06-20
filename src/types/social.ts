/**
 * Social & Profile TypeScript interfaces
 * Ref: SRS §4 (Profile, Privacy, Social), §10.1–10.4 (DB schema)
 *
 * Catatan: field [ADV] tetap ada agar shape kompatibel dengan skema DB,
 * namun belum dipakai di UI fase ini.
 */

import type { User } from './auth';

// ============================================================
// Follow
// ============================================================

/** Status relasi follow antara currentUser dan target user */
export type FollowStatus =
  | 'not_following'  // belum follow
  | 'following'      // sudah follow + accepted
  | 'pending'        // sudah follow, menunggu approval (akun privat)
  | 'blocked';       // currentUser memblock target atau sebaliknya

/** Satu entri di tabel follows (§10.3) */
export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  status: 'accepted' | 'pending';
  is_close_friend: boolean; // [ADV]
  created_at: string;
}

/** Permintaan follow masuk — untuk akun privat (§4.2) */
export interface FollowRequest {
  id: string;
  from_user: User;
  created_at: string;
}

// ============================================================
// Block & Report
// ============================================================

/** Satu entri di tabel blocks (§10.4) */
export interface Block {
  id: string;
  blocker_id: string;
  blocked_id: string;
  created_at: string;
}

/** Alasan report (§4.5, §10.17) */
export type ReportReason =
  | 'spam'
  | 'inappropriate'
  | 'harassment'
  | 'fake_account'
  | 'other';

export interface ReportPayload {
  target_type: 'user' | 'post' | 'comment';
  target_id: string;
  reason: ReportReason;
}

// ============================================================
// User Interest
// ============================================================

/** Satu entri di tabel user_interests (§10.2) */
export interface UserInterest {
  id: string;
  user_id: string;
  interest_category: string;
}

/** Kategori minat yang tersedia (pilihan statis MVP) */
export const INTEREST_CATEGORIES = [
  'Musik',
  'Olahraga',
  'Kuliner',
  'Teknologi',
  'Fashion',
  'Travel',
  'Film & Seri',
  'Seni & Desain',
  'Gaming',
  'Fotografi',
  'Kesehatan',
  'Bisnis',
] as const;

export type InterestCategory = (typeof INTEREST_CATEGORIES)[number];

// ============================================================
// Profile
// ============================================================

/**
 * Profil pengguna yang ditampilkan di halaman profil (§4.1)
 * Merupakan User + agregat statistik (post count, follower count, etc.)
 */
export interface UserProfile extends User {
  post_count: number;
  follower_count: number;
  following_count: number;
  /** Status relasi currentUser terhadap profil ini */
  follow_status: FollowStatus;
  /** Apakah ini profil currentUser sendiri? */
  is_own_profile: boolean;
  interests: string[];
}

// ============================================================
// Edit Profile Payload
// ============================================================

/** Payload untuk PATCH /users/me (§11.2) */
export interface UpdateProfilePayload {
  name?: string;
  username?: string;
  bio?: string;
  avatar_url?: string;
  external_link?: string; // field tambahan (tidak di schema tapi SRS §4.1 menyebut link eksternal)
}

/** Payload untuk PATCH /users/me/privacy (§11.2) */
export interface UpdatePrivacyPayload {
  is_private: boolean;
}
