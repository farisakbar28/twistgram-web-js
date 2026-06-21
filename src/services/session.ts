import type { AuthTokens, User } from '../types/auth';

const STORAGE_KEY_USER = 'twistgram_user';
const STORAGE_KEY_TOKENS = 'twistgram_tokens';

export interface StoredSession {
  user: User | null;
  tokens: AuthTokens | null;
}

export const createMockTokens = (userId: string): AuthTokens => ({
  access_token: `mock_access_${userId}_${Date.now()}`,
  refresh_token: `mock_refresh_${userId}`,
  expires_in: 3600,
});

export const getStoredUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
};

export const getStoredTokens = (): AuthTokens | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TOKENS);
    return raw ? (JSON.parse(raw) as AuthTokens) : null;
  } catch {
    return null;
  }
};

export const getStoredSession = (): StoredSession => ({
  user: getStoredUser(),
  tokens: getStoredTokens(),
});

export const saveStoredSession = (user: User, tokens?: AuthTokens | null) => {
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
  localStorage.setItem(
    STORAGE_KEY_TOKENS,
    JSON.stringify(tokens ?? createMockTokens(user.id))
  );
};

export const updateStoredUser = (updater: (user: User) => User): User | null => {
  const currentUser = getStoredUser();
  if (!currentUser) return null;

  const updatedUser = updater(currentUser);
  const currentTokens = getStoredTokens();
  saveStoredSession(updatedUser, currentTokens);
  return updatedUser;
};

export const clearStoredSession = () => {
  localStorage.removeItem(STORAGE_KEY_USER);
  localStorage.removeItem(STORAGE_KEY_TOKENS);
};

export const getStoredAccessToken = (): string | null => getStoredTokens()?.access_token ?? null;
