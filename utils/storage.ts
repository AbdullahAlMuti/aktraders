export const storage = {
  get<T>(key: string, defaultValue: T | null = null): T | null {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error setting ${key} to localStorage`, e);
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error(`Error removing ${key} from localStorage`, e);
    }
  },

  clear(): void {
    if (typeof window === "undefined") return;
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Error clearing localStorage", e);
    }
  },
};
