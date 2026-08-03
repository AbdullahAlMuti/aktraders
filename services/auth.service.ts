import { LoginCredentials, LoginResponse, SignUpCredentials, User, UserRole } from "@/types/auth.types";
import { createClient } from "@/utils/supabase/client";

export const authService = {
  async signUp(credentials: SignUpCredentials): Promise<LoginResponse> {
    const supabase = createClient();

    // 1. Register user with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.name,
          role: credentials.role || "employee",
          department: credentials.department || "Sales",
        },
      },
    });

    if (error) throw new Error(error.message);
    if (!data.user) throw new Error("Sign up failed");

    // 2. Persist user profile in public.profiles table
    const profile = {
      id: data.user.id,
      email: credentials.email,
      name: credentials.name,
      role: credentials.role || "employee",
      department: credentials.department || "Sales",
      updated_at: new Date().toISOString(),
    };

    const { error: profileError } = await supabase.from("profiles").upsert(profile);
    if (profileError) {
      console.warn("Profile upsert notice:", profileError.message);
    }

    const token = data.session?.access_token || "";
    const refreshToken = data.session?.refresh_token || "";

    return {
      user: {
        id: data.user.id,
        name: credentials.name,
        email: credentials.email,
        role: (credentials.role as UserRole) || "employee",
        department: credentials.department || "Sales",
        createdAt: data.user.created_at,
      },
      token,
      refreshToken,
    };
  },

  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw new Error(error.message);

    // Fetch user profile from public.profiles table
    let dbProfile: any = null;
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      dbProfile = prof;
    } catch (e) {
      // Ignore fallback
    }

    // Upsert to ensure profile exists
    if (!dbProfile) {
      const newProf = {
        id: data.user.id,
        email: data.user.email!,
        name: data.user.user_metadata?.name || data.user.email?.split("@")[0] || "User",
        role: (data.user.app_metadata?.role || data.user.user_metadata?.role || "employee") as UserRole,
        department: data.user.user_metadata?.department || "Sales",
      };
      await supabase.from("profiles").upsert(newProf);
      dbProfile = newProf;
    }

    return {
      user: {
        id: data.user.id,
        name: dbProfile?.name || data.user.user_metadata?.name || data.user.email || "User",
        email: data.user.email!,
        role: (dbProfile?.role || data.user.app_metadata?.role || data.user.user_metadata?.role || "employee") as UserRole,
        department: dbProfile?.department || data.user.user_metadata?.department,
        avatarUrl: dbProfile?.avatar_url || data.user.user_metadata?.avatar_url,
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

    let dbProfile: any = null;
    try {
      const { data: prof } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      dbProfile = prof;
    } catch (e) {
      // Ignore
    }

    return {
      id: user.id,
      name: dbProfile?.name || user.user_metadata?.name || user.email || "User",
      email: user.email!,
      role: (dbProfile?.role || user.app_metadata?.role || user.user_metadata?.role || "employee") as UserRole,
      department: dbProfile?.department || user.user_metadata?.department,
      avatarUrl: dbProfile?.avatar_url || user.user_metadata?.avatar_url,
      createdAt: user.created_at,
    };
  },
};
