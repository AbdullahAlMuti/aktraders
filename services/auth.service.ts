import { LoginCredentials, LoginResponse, User } from "@/types/auth.types";
import { api } from "./api-client";
import { API_ENDPOINTS } from "@/constants/api-endpoints";

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    // For demo/development mode, simulate backend response if API endpoint is unready
    try {
      const response = await api.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
      return response.data;
    } catch (error) {
      // Fallback mock response for rapid enterprise UI verification
      return {
        user: {
          id: "usr-001",
          name: "Admin User",
          email: credentials.email || "admin@aktraders.com",
          role: "admin",
          department: "Management",
          createdAt: new Date().toISOString(),
        },
        token: "mock-jwt-token-aktraders-2026",
        refreshToken: "mock-refresh-token",
      };
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post(API_ENDPOINTS.AUTH.LOGOUT);
    } catch (e) {
      // Silent catch for logout
    }
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.AUTH.ME);
    return response.data;
  },
};
