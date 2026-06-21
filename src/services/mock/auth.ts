/**
 * Mock Auth Service
 * Ref: SRS §3.1-3.4, §3.6, API endpoints §11.1
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
import {
  getMockUserByEmail,
  getMockUserByUsername,
  mockDb,
  persistMockDb,
} from './database';
import {
  clearStoredSession,
  createMockTokens,
  getStoredUser,
  saveStoredSession,
  updateStoredUser,
} from '../session';

export const storageGetUser = getStoredUser;
export const storageClearSession = clearStoredSession;

interface OtpEntry {
  code: string;
  purpose: string;
  identifier: string;
  expiresAt: number;
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
    expiresAt: Date.now() + 10 * 60 * 1000,
    used: false,
  };
  console.info(`[Mock OTP] ${purpose} -> ${identifier} : ${code}`);
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
  if (entry.used) return { valid: false, reason: 'OTP sudah digunakan.' };
  if (Date.now() > entry.expiresAt) return { valid: false, reason: 'OTP sudah kadaluarsa.' };
  if (entry.code !== code && code !== '123456') {
    return { valid: false, reason: 'Kode OTP tidak valid.' };
  }

  otpStore[key].used = true;
  return { valid: true };
};

interface FailedAttempt {
  count: number;
  lockedUntil: number | null;
}

const failedAttempts: Record<string, FailedAttempt> = {};
const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 15 * 60 * 1000;

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
    entry.lockedUntil = Date.now() + COOLDOWN_MS;
  }
  failedAttempts[identifier] = entry;
};

const resetFailedAttempts = (identifier: string) => {
  failedAttempts[identifier] = { count: 0, lockedUntil: null };
};

export const authLogin = async (payload: LoginPayload): Promise<LoginResponse> => {
  await delay(600);

  const { identifier, password } = payload;
  const lockState = getLoginLockState(identifier);
  if (lockState.locked) {
    const mins = Math.ceil(lockState.remainingMs / 60000);
    throw new Error(`Terlalu banyak percobaan login. Coba lagi dalam ${mins} menit.`);
  }

  const user = mockDb.users.find(
    (candidate) => candidate.email === identifier || candidate.username === identifier
  );

  if (!user || mockDb.passwords[user.id] !== password) {
    recordFailedAttempt(identifier);
    throw new Error('Kredensial tidak valid. Periksa kembali email/username dan kata sandi Anda.');
  }

  resetFailedAttempts(identifier);
  saveStoredSession(user, createMockTokens(user.id));

  return {
    user,
    tokens: {
      access_token: `mock_access_${user.id}_${Date.now()}`,
      refresh_token: `mock_refresh_${user.id}`,
      expires_in: 3600,
    },
  };
};

export const authLogout = async (): Promise<void> => {
  await delay(200);
  storageClearSession();
};

export const authRegister = async (payload: RegisterPayload): Promise<RegisterResponse> => {
  await delay(800);

  if (getMockUserByEmail(payload.email)) {
    throw new Error('Email sudah terdaftar. Gunakan email lain.');
  }
  if (getMockUserByUsername(payload.username)) {
    throw new Error('Username sudah digunakan. Pilih username lain.');
  }

  const timestamp = Date.now();
  const newUser: User = {
    id: `user-${timestamp}`,
    name: payload.name,
    username: payload.username,
    email: payload.email,
    phone: payload.phone ?? null,
    phone_verified: false,
    email_verified: false,
    bio: null,
    avatar_url: null,
    is_private: false,
    created_at: new Date(timestamp).toISOString(),
    updated_at: new Date(timestamp).toISOString(),
  };

  mockDb.users.push(newUser);
  mockDb.passwords[newUser.id] = payload.password;
  mockDb.postCounts[newUser.id] = 0;
  mockDb.userInterests[newUser.id] = [];
  persistMockDb();
  saveStoredSession(newUser, createMockTokens(newUser.id));

  saveOtp('register', payload.email);

  return { user: newUser, email_verified: false };
};

export const authVerifyOtp = async (payload: VerifyOtpPayload): Promise<OtpVerifyResponse> => {
  await delay(500);

  const { otp, purpose, identifier } = payload;
  const result = validateOtp(purpose, identifier, otp);

  if (!result.valid) {
    throw new Error(result.reason ?? 'Kode OTP tidak valid.');
  }

  if (purpose === 'register') {
    const user = getMockUserByEmail(identifier);
    if (user) {
      user.email_verified = true;
      user.updated_at = new Date().toISOString();
      persistMockDb();
      saveStoredSession(user);
    } else {
      updateStoredUser((currentUser) => ({
        ...currentUser,
        email_verified: true,
        updated_at: new Date().toISOString(),
      }));
    }
  }

  if (purpose === 'reset_password') {
    return { success: true, resetToken: `reset_${identifier}_${Date.now()}` };
  }

  if (purpose === 'recover_username') {
    const user = getMockUserByEmail(identifier);
    return { success: true, username: user?.username };
  }

  if (purpose === 'recover_email') {
    const user = getMockUserByUsername(identifier);
    if (user) {
      const [local, domain] = user.email.split('@');
      return { success: true, maskedEmail: `${local[0]}***@${domain}` };
    }
  }

  return { success: true };
};

export const authForgotPassword = async (payload: ForgotPasswordPayload): Promise<void> => {
  await delay(700);

  if (getMockUserByEmail(payload.email)) {
    saveOtp('reset_password', payload.email);
  }
};

export const authResetPassword = async (payload: ResetPasswordPayload): Promise<void> => {
  await delay(600);

  if (!payload.resetToken.startsWith('reset_')) {
    throw new Error('Token reset tidak valid atau sudah kadaluarsa.');
  }

  clearStoredSession();
};

export const authRecoverUsername = async (payload: RecoverUsernamePayload): Promise<void> => {
  await delay(700);

  if (getMockUserByEmail(payload.email)) {
    saveOtp('recover_username', payload.email);
  }
};

export const authRecoverEmail = async (payload: RecoverEmailPayload): Promise<void> => {
  await delay(700);

  const user = mockDb.users.find(
    (candidate) => candidate.username === payload.username && candidate.phone === payload.phone
  );
  if (user && user.phone_verified) {
    saveOtp('recover_email', payload.username);
  }
};

export const checkUsernameAvailable = async (username: string): Promise<boolean> => {
  await delay(300);
  return !getMockUserByUsername(username);
};

export const checkEmailAvailable = async (email: string): Promise<boolean> => {
  await delay(300);
  return !getMockUserByEmail(email);
};
