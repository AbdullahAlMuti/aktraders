import { useAuthStore } from "@/stores/use-auth-store";
import { authService } from "@/services/auth.service";
import { LoginCredentials } from "@/types/auth.types";
import { useState } from "react";

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, logout: storeLogout } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    try {
      const res = await authService.login(credentials);
      setAuth(res.user, res.token);
      return res;
    } catch (err: any) {
      setError(err.message || "Login failed");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
    } finally {
      storeLogout();
      setLoading(false);
    }
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    login,
    logout,
  };
}
