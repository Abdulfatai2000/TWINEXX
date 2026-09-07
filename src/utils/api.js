import axios from 'axios';
import { API_BASE_URL } from '../config';

// ── Token Management ────────────────────────────────────────────────────────
// The current Clerk JWT. Set by the TokenSyncer component in App.js.
let authToken = null;

export const setAuthToken = (token) => {
  authToken = token;
};

export const clearAuthToken = () => {
  authToken = null;
};

// ── Axios instance ──────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach the Clerk JWT to every request
api.interceptors.request.use(
  async (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 responses (token expired / invalid)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear the stale token; the auth state will trigger a re-login
      authToken = null;
    }
    return Promise.reject(error);
  }
);

// ── Auth helpers ────────────────────────────────────────────────────────────
export const authAPI = {
  syncUser: () => api.post('/api/auth/sync'),
  me: () => api.get('/api/auth/me'),
};

// ── Task helpers ────────────────────────────────────────────────────────────
export const taskAPI = {
  list: () => api.get('/api/tasks'),
  create: (data) => api.post('/api/tasks', data),
  update: (id, data) => api.patch(`/api/tasks/${id}`, data),
  remove: (id) => api.delete(`/api/tasks/${id}`),
};

export default api;