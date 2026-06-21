/**
 * Auth & User TypeScript interfaces
 * Ref: SRS §3 (Authentication), §10.1 (tabel users)
 */

// ============================================================
// Core User Entity (1:1 dengan tabel users §10.1)
// ============================================================

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string | null;
  phone_verified: boolean;
  email_verified: boolean;
  bio?: string | null;
  avatar_url?: string | null;
  external_link?: string | null;
  is_private: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================================
// Auth State
// ============================================================

export interface AuthState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ============================================================
// Request Payloads
// ============================================================

export interface LoginPayload {
  /** Bisa berisi email atau username — backend mendeteksi otomatis */
  identifier: string;
  password: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  username: string;
  password: string;
  phone?: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  newPassword: string;
  /** Token sementara yang didapat setelah OTP berhasil diverifikasi */
  resetToken: string;
}

export interface VerifyOtpPayload {
  otp: string;
  /** Identifikasi tujuan OTP: register verification, password reset, account recovery */
  purpose: 'register' | 'reset_password' | 'recover_username' | 'recover_email';
  /** Email atau identifier terkait */
  identifier: string;
}

/** Skenario A §3.4 — lupa username, masih ingat email */
export interface RecoverUsernamePayload {
  email: string;
}

/** Skenario B §3.4 — lupa email, punya nomor telepon terverifikasi */
export interface RecoverEmailPayload {
  username: string;
  phone: string;
}

export interface CompleteRecoverEmailPayload {
  recoveryToken: string;
  newEmail: string;
}

// ============================================================
// Response Shapes
// ============================================================

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number; // detik
}

export interface LoginResponse {
  user: User;
  tokens: AuthTokens;
}

export interface RegisterResponse {
  user: User;
  /** Langsung false — butuh verifikasi OTP email sebelum bisa pakai fitur penuh */
  email_verified: false;
}

export interface OtpVerifyResponse {
  success: boolean;
  /** Hanya ada bila purpose === 'reset_password' — digunakan untuk ResetPasswordPayload */
  resetToken?: string;
  /** Hanya ada bila purpose === 'recover_username' — username yang ditemukan */
  username?: string;
  /** Hanya ada bila purpose === 'recover_email' — email tersamarkan (a***@gmail.com) */
  maskedEmail?: string;
  /** Hanya ada bila purpose === 'recover_email' — token sementara untuk set email baru */
  recoveryToken?: string;
}

// ============================================================
// Error shape
// ============================================================

export interface AuthError {
  code: string;
  message: string;
}

// ============================================================
// Misc
// ============================================================

/** Digunakan untuk OTP countdown & state di OtpVerifyPage */
export type OtpPurpose =
  | 'register'
  | 'reset_password'
  | 'recover_username'
  | 'recover_email';
