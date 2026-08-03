import { LoginCredentials, LoginResponse, User, UserRole } from "@/types/auth.types";
import { createClient } from "@/utils/supabase/client";

export const authService = {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);

    // Map Supabase user to our application User type
    // Role comes from app_metadata (server-controlled, secure for authorization)
    return {
      user: {
        id: data.user.id,
        name: data.user.user_metadata?.name || data.user.email || "User",
        email: data.user.email!,
        role: (data.user.app_metadata?.role as UserRole) || "employee",
        department: data.user.user_metadata?.department,
        createdAt: data.user.created_at,
      },
      token: data.session.access_token,
      refreshToken: data.session.refresh_token,
    };
  },

  async logout(): Promise<void> {
    const supabase = createClient();
    await supabase.auth.signOut();
  },

  async getCurrentUser(): Promise<User> {
    const supabase = createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) throw new Error("Not authenticated");

    return {
      id: user.id,
      name: user.user_metadata?.name || user.email || "User",
      email: user.email!,
      role: (user.app_metadata?.role as UserRole) || "employee",
      department: user.user_metadata?.department,
      createdAt: user.created_at,
    };
  },
};
