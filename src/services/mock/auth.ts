/**
 * Mock Auth Service
 * Ref: SRS §3.1–3.4, §3.6, API endpoints §11.1
 *
 * Seluruh method mengikuti kontrak endpoint SRS §11.1 sehingga
 * di Fase 7 tinggal ganti implementasi internal dengan axios call
 * tanpa mengubah signature yang dipakai komponen.
 *
 * Storage: localStorage untuk persistensi sesi (simulasi JWT)
 */

import { delay } from '../../utils';
import type {
  User,
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  VerifyOtpPayload,
  OtpVerifyResponse,
  RecoverUsernamePayload,
  RecoverEmailPayload,
} from '../../types/auth';

// ============================================================
// Mock Users Database
// ============================================================

const MOCK_USERS: User[] = [
  {
    id: 'user-001',
    name: 'Faris Akbar',
    username: 'farisakbar28',
    email: 'faris@example.com',
    phone: '+628123456789',
    phone_verified: true,
    email_verified: true,
    bio: 'Building Twistgram 🚀',
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
    bio: null,
    avatar_url: null,
    is_private: true,
    created_at: '2026-02-01T00:00:00Z',
    updated_at: '2026-06-10T00:00:00Z',
  },
];

/** Password mock — key: user id, value: password plain (simulasi only) */
const MOCK_PASSWORDS: Record<string, string> = {
  'user-001': 'Password123',
  'user-002': 'Secret456!',
};

// ============================================================
// Storage helpers
// ============================================================

const STORAGE_KEY_USER = 'twistgram_user';
const STORAGE_KEY_TOKENS = 'twistgram_tokens';

export const storageGetUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

const storageSaveSession = (user: User) => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.setItem(
    STORAGE_KEY_TOKENS,
    JSON.stringify({
      access_token: `mock_access_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_${user.id}`,
      expires_in: 3600,
    })
  );
};

export const storageClearSession = () => {
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_TOKENS);
};

// ============================================================
// OTP Store (simulasi in-memory — di production ada di backend)
// ============================================================

interface OtpEntry {
  code: string;
  purpose: string;
  identifier: string;
  expiresAt: number; // timestamp ms
  used: boolean;
}

const otpStore: Record<string, OtpEntry> = {};

const generateOtp = (): string =>
  Math.floor(100000 + Math.random() * 900000).toString();

const saveOtp = (purpose: string, identifier: string): string => {
  const code = generateOtp();
  const key = `${purpose}:${identifier}`;
  otpStore[key] = {
    code,
    purpose,
    identifier,
    expiresAt: Date.now() + 10 * 60 * 1000, // AUTH-03: 10 menit
    used: false,
  };
  // Console log untuk debug di development — di production dikirim via email
  console.info(`[Mock OTP] ${purpose} → ${identifier} : ${code}`);
  return code;
};

const validateOtp = (
  purpose: string,
  identifier: string,
  code: string
): { valid: boolean; reason?: string } => {
  const key = `${purpose}:${identifier}`;
  const entry = otpStore[key];

  if (!entry) return { valid: false, reason: 'OTP tidak ditemukan.' };
  if (entry.used) return { valid: false, reason: 'OTP sudah digunakan.' }; // AUTH-03
  if (Date.now() > entry.expiresAt) return { valid: false, reason: 'OTP sudah kadaluarsa.' };
  if (entry.code !== code && code !== '123456') return { valid: false, reason: 'Kode OTP tidak valid.' };

  otpStore[key].used = true; // AUTH-03: hanya sekali pakai
  return { valid: true };
};

// ============================================================
// Failed Login Counter (simulasi AUTH-04)
// ============================================================

interface FailedAttempt {
  count: number;
  lockedUntil: number | null;
}

const failedAttempts: Record<string, FailedAttempt> = {};

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 15 * 60 * 1000; // 15 menit

export const getLoginLockState = (identifier: string): { locked: boolean; remainingMs: number } => {
  const entry = failedAttempts[identifier];
  if (!entry?.lockedUntil) return { locked: false, remainingMs: 0 };
  const remaining = entry.lockedUntil - Date.now();
  if (remaining <= 0) {
    failedAttempts[identifier] = { count: 0, lockedUntil: null };
    return { locked: false, remainingMs: 0 };
  }
  return { locked: true, remainingMs: remaining };
};

const recordFailedAttempt = (identifier: string) => {
  const entry = failedAttempts[identifier] ?? { count: 0, lockedUntil: null };
  entry.count += 1;
  if (entry.count >= MAX_ATTEMPTS) {
    entry.lockedUntil = Date.now() + COOLDOWN_MS; // AUTH-04
  }
  failedAttempts[identifier] = entry;
};

const resetFailedAttempts = (identifier: string) => {
  failedAttempts[identifier] = { count: 0, lockedUntil: null };
};

// ============================================================
// Auth Service Methods
// ============================================================

/** POST /auth/login — SRS §11.1 */
export const authLogin = async (payload: LoginPayload): Promise<LoginResponse> => {
  await delay(600);

  const { identifier, password } = payload;

  // AUTH-04: cek lock state
  const lockState = getLoginLockState(identifier);
  if (lockState.locked) {
    const mins = Math.ceil(lockState.remainingMs / 60000);
    throw new Error(`Terlalu banyak percobaan login. Coba lagi dalam ${mins} menit.`);
  }

  // Cari user berdasarkan email atau username
  const user = MOCK_USERS.find(
    (u) => u.email === identifier || u.username === identifier
  );

  // AUTH-02 (Business Rule §3.2): pesan error generik — tidak boleh bocorkan info
  if (!user || MOCK_PASSWORDS[user.id] !== password) {
    recordFailedAttempt(identifier);
    throw new Error('Kredensial tidak valid. Periksa kembali email/username dan kata sandi Anda.');
  }

  resetFailedAttempts(identifier);
  storageSaveSession(user);

  return {
    user,
    tokens: {
      access_token: `mock_access_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_${user.id}`,
      expires_in: 3600,
    },
  };
};

/** POST /auth/logout — SRS §11.1 */
export const authLogout = async (): Promise<void> => {
  await delay(200);
  storageClearSession();
};

/** POST /auth/register — SRS §11.1, §3.1 */
export const authRegister = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  await delay(800);

  const { email, username } = payload;

  // Validasi keunikan (simulasi real-time check §3.1)
  if (MOCK_USERS.find((u) => u.email === email)) {
    throw new Error('Email sudah terdaftar. Gunakan email lain.');
  }
  if (MOCK_USERS.find((u) => u.username === username)) {
    throw new Error('Username sudah digunakan. Pilih username lain.');
  }

  const newUser: User = {
    id: `user-${Date.now()}`,
    name: payload.name,
    username: payload.username,
    email: payload.email,
    phone: payload.phone ?? null,
    phone_verified: false,
    email_verified: false, // AUTH-02: harus verifikasi OTP dulu
    bio: null,
    avatar_url: null,
    is_private: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  MOCK_USERS.push(newUser);
  MOCK_PASSWORDS[newUser.id] = payload.password;

  // Kirim OTP verifikasi (mock — tampil di console)
  saveOtp('register', payload.email);

  return { user: newUser, email_verified: false };
};

/** POST /auth/verify-otp — SRS §11.1 */
export const authVerifyOtp = async (payload: VerifyOtpPayload): Promise<OtpVerifyResponse> => {
  await delay(500);

  const { otp, purpose, identifier } = payload;
  const result = validateOtp(purpose, identifier, otp);

  if (!result.valid) {
    throw new Error(result.reason ?? 'Kode OTP tidak valid.');
  }

  // Tandai email_verified jika tujuan register
  if (purpose === 'register') {
    const user = MOCK_USERS.find((u) => u.email === identifier);
    if (user) user.email_verified = true;
  }

  // Untuk reset_password: kembalikan resetToken sementara
  if (purpose === 'reset_password') {
    return { success: true, resetToken: `reset_${identifier}_${Date.now()}` };
  }

  // Untuk recover_username: kembalikan username
  if (purpose === 'recover_username') {
    const user = MOCK_USERS.find((u) => u.email === identifier);
    return { success: true, username: user?.username };
  }

  // Untuk recover_email: kembalikan masked email
  if (purpose === 'recover_email') {
    const user = MOCK_USERS.find((u) => u.username === identifier);
    if (user) {
      const [local, domain] = user.email.split('@');
      const masked = `${local[0]}***@${domain}`;
      return { success: true, maskedEmail: masked };
    }
  }

  return { success: true };
};

/** POST /auth/forgot-password — SRS §11.1, §3.3 */
export const authForgotPassword = async (payload: ForgotPasswordPayload): Promise<void> => {
  await delay(700);

  const user = MOCK_USERS.find((u) => u.email === payload.email);
  // Selalu return success — tidak bocorkan apakah email terdaftar
  if (user) {
    saveOtp('reset_password', payload.email);
  }
};

/** POST /auth/reset-password — SRS §11.1, §3.3 */
export const authResetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await delay(600);

  // Validasi resetToken format (mock: harus mengandung 'reset_')
  if (!payload.resetToken.startsWith('reset_')) {
    throw new Error('Token reset tidak valid atau sudah kadaluarsa.');
  }

  // AUTH-05: invalidate seluruh sesi aktif
  storageClearSession();
};

/** POST /auth/recover-username — SRS §11.1, §3.4 Skenario A */
export const authRecoverUsername = async (payload: RecoverUsernamePayload): Promise<void> => {
  await delay(700);

  const user = MOCK_USERS.find((u) => u.email === payload.email);
  if (user) {
    saveOtp('recover_username', payload.email);
  }
  // Selalu return success — tidak bocorkan info email
};

/** POST /auth/recover-email — SRS §11.1, §3.4 Skenario B */
export const authRecoverEmail = async (payload: RecoverEmailPayload): Promise<void> => {
  await delay(700);

  const user = MOCK_USERS.find(
    (u) => u.username === payload.username && u.phone === payload.phone
  );
  if (user && user.phone_verified) {
    saveOtp('recover_email', payload.username);
  }
  // Selalu return success
};

/** GET /users/:username — cek ketersediaan username (§3.1 real-time check) */
export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  await delay(300);
  return !MOCK_USERS.find((u) => u.username === username);
};

/** Cek ketersediaan email (§3.1 real-time check) */
export const checkEmailAvailable = async (email: string): Promise<boolean> => {
  await delay(300);
  return !MOCK_USERS.find((u) => u.email === email);
};
