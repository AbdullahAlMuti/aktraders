import axios, { InternalAxiosRequestConfig } from "axios";
import { env } from "@/config/env";
import { APP_CONFIG } from "@/constants/config";
import { storage } from "@/utils/storage";

export const apiClient = axios.create({
  baseURL: env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30000,
});

// Request Interceptor: Attach Auth Token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = storage.get<string>(APP_CONFIG.TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Global Error Handling & Refresh Logic
apiClient.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear token and redirect to login if client-side
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        storage.remove(APP_CONFIG.TOKEN_KEY);
        storage.remove(APP_CONFIG.USER_KEY);
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
