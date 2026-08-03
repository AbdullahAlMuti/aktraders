import { create } from "zustand";
import { User } from "@/types/auth.types";
import { storage } from "@/utils/storage";
import { APP_CONFIG } from "@/constants/config";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: storage.get<User>(APP_CONFIG.USER_KEY),
  token: storage.get<string>(APP_CONFIG.TOKEN_KEY),
  isAuthenticated: !!storage.get<string>(APP_CONFIG.TOKEN_KEY),
  setAuth: (user, token) => {
    storage.set(APP_CONFIG.USER_KEY, user);
    storage.set(APP_CONFIG.TOKEN_KEY, token);
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    storage.remove(APP_CONFIG.USER_KEY);
    storage.remove(APP_CONFIG.TOKEN_KEY);
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
