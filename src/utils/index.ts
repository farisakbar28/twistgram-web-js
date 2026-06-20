/**
 * Utility helpers for Twistgram
 * 
 * General-purpose utilities. Feature-specific helpers should live
 * inside their respective feature folder (e.g., src/features/auth/utils.ts).
 */

/**
 * Simulate async API delay — used by mock services in Phase 2–6
 * to mimic real network latency
 */
export const delay = (ms: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

/**
 * Format number to short notation (e.g., 1200 → "1.2K")
 */
export const formatCount = (count: number): string => {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return String(count);
};

/**
 * Truncate string to a max character length with ellipsis
 */
export const truncate = (str: string, maxLen: number): string =>
  str.length > maxLen ? `${str.slice(0, maxLen)}…` : str;

/**
 * Generate a username suggestion from a full name
 * e.g., "John Doe" → "johndoe"
 * Ref: SRS 3.1 — "Username otomatis disarankan sebagai placeholder dari nama"
 */
export const suggestUsername = (name: string): string =>
  name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .slice(0, 30);

/**
 * Check if a story is still active (not expired)
 * Ref: SRS CNT-01 — story expires exactly 24 hours after upload
 */
export const isStoryActive = (expiresAt: string): boolean =>
  new Date(expiresAt) > new Date();

/**
 * Format relative time (e.g., "2 jam lalu", "3 hari lalu")
 * Used in feeds, comments, notifications
 */
export const formatRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days = Math.floor(diff / 86_400_000);
  const weeks = Math.floor(diff / (7 * 86_400_000));

  if (mins < 1) return 'baru saja';
  if (mins < 60) return `${mins} mnt`;
  if (hours < 24) return `${hours} jam`;
  if (days < 7) return `${days} hari`;
  return `${weeks} mg`;
};
