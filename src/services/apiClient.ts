/**
 * Axios HTTP client instance for backend API calls.
 * Ref: SRS section 11 — API endpoint contracts
 *
 * In mock mode (VITE_USE_MOCK=true), this client is available but not actively used.
 * All data fetching goes through src/services/mock/* services.
 *
 * When backend is ready, mock services will be replaced with axios calls
 * using this instance without changing UI components (service contract remains identical).
 */

import axios from 'axios';
import { getStoredAccessToken } from './session';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor — attaches JWT access token to every request
apiClient.interceptors.request.use(
  config => {
    const token = getStoredAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor — handles 401 (token expired) gracefully
apiClient.interceptors.response.use(
  response => response,
  async error => {
    // TODO(backend): implement refresh token rotation + request retry
    // once the real backend auth contract is available.
    return Promise.reject(error);
  }
);



export default apiClient;
