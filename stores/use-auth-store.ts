import { create } from "zustand";
import { User } from "@/types/auth.types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  // Initial state is empty — Supabase session is managed via cookies by @supabase/ssr.
  // The auth state is hydrated by the onAuthStateChange listener in app/providers.tsx.
  user: null,
  token: null,
  isAuthenticated: false,
  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
