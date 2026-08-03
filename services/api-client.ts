import { apiClient } from "@/lib/axios";
import { ApiResponse, ApiErrorResponse } from "@/types/api.types";

export const api = {
  get: async <T>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
    return apiClient.get(url, { params });
  },

  post: async <T>(url: string, data?: any, config?: any): Promise<ApiResponse<T>> => {
    return apiClient.post(url, data, config);
  },

  put: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return apiClient.put(url, data);
  },

  patch: async <T>(url: string, data?: any): Promise<ApiResponse<T>> => {
    return apiClient.patch(url, data);
  },

  delete: async <T>(url: string): Promise<ApiResponse<T>> => {
    return apiClient.delete(url);
  },
};
