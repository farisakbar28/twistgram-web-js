/**
 * Axios HTTP client instance
 * 
 * Currently configured but NOT actively used — all data fetching
 * goes through services/mock/* in Phase 0–6.
 * 
 * In Phase 7 (API Integration), mock implementations in services/mock/
 * will be replaced with real axios calls using this instance,
 * WITHOUT changing component code (service contract remains identical).
 * 
 * Ref: SRS section 11 — API endpoint contracts
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
