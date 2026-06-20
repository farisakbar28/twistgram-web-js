/**
 * Mock Auth Service — Phase 0 Skeleton
 * 
 * Implements the auth service contract matching SRS section 11.1 endpoints.
 * Full mock implementation will be added in Phase 2.
 * 
 * Service contract (method signatures) MUST remain stable through Phase 7,
 * when implementations are replaced with real axios calls.
 */

import type { AuthTokens, LoginRequest, RegisterRequest } from '../../types';

// Phase 2 will implement these methods with proper mock data and delays
export const authService = {
  /** POST /auth/login — SRS 11.1 */
  login: async (_data: LoginRequest): Promise<AuthTokens> => {
    throw new Error('authService.login: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/register — SRS 11.1 */
  register: async (_data: RegisterRequest): Promise<void> => {
    throw new Error('authService.register: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/verify-otp — SRS 11.1 */
  verifyOtp: async (_email: string, _code: string): Promise<void> => {
    throw new Error('authService.verifyOtp: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/logout — SRS 11.1 */
  logout: async (): Promise<void> => {
    throw new Error('authService.logout: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/forgot-password — SRS 11.1 */
  forgotPassword: async (_identifier: string): Promise<void> => {
    throw new Error('authService.forgotPassword: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/reset-password — SRS 11.1 */
  resetPassword: async (_token: string, _newPassword: string): Promise<void> => {
    throw new Error('authService.resetPassword: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/recover-username — SRS 11.1 (Scenario A, 3.4) */
  recoverUsername: async (_email: string): Promise<string> => {
    throw new Error('authService.recoverUsername: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/recover-email — SRS 11.1 (Scenario B, 3.4) */
  recoverEmail: async (_username: string, _phone: string): Promise<string> => {
    throw new Error('authService.recoverEmail: not implemented yet — coming in Phase 2');
  },

  /** POST /auth/refresh-token — SRS 11.1 */
  refreshToken: async (_refreshToken: string): Promise<AuthTokens> => {
    throw new Error('authService.refreshToken: not implemented yet — coming in Phase 2');
  },
};
