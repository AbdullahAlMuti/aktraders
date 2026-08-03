import { create } from "zustand";

interface UIState {
  sidebarOpen: boolean;
  language: "bn" | "en";
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setLanguage: (lang: "bn" | "en") => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  language: "bn",
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setLanguage: (lang) => set({ language: lang }),
}));
