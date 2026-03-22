import { clearAuthSession, getAuthSession } from "@/services/auth-storage";
import axios from "axios";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  "https://b8ltrdc5-8000.inc1.devtunnels.ms/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    const hasAuthHeader = Boolean(config.headers?.Authorization);

    if (!hasAuthHeader) {
      const session = await getAuthSession();
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error?.response?.status === 401) {
      await clearAuthSession();
      delete api.defaults.headers.common.Authorization;
    }

    return Promise.reject(error);
  },
);

export default api;
