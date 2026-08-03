"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { queryClient } from "@/lib/react-query";
import { themeConfig } from "@/config/theme";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useAuthStore } from "@/stores/use-auth-store";
import { UserRole } from "@/types/auth.types";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

  // Sync Supabase auth session changes into the Zustand store
  useEffect(() => {
    const supabase = createClient();

    // Get initial session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        useAuthStore.getState().setAuth(
          {
            id: user.id,
            name: user.user_metadata?.name || user.email || "User",
            email: user.email!,
            role: (user.app_metadata?.role as UserRole) || "employee",
            department: user.user_metadata?.department,
            createdAt: user.created_at,
          },
          "" // token is managed by @supabase/ssr cookies; not needed in the store
        );
      }
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        useAuthStore.getState().setAuth(
          {
            id: session.user.id,
            name: session.user.user_metadata?.name || session.user.email || "User",
            email: session.user.email!,
            role: (session.user.app_metadata?.role as UserRole) || "employee",
            department: session.user.user_metadata?.department,
            createdAt: session.user.created_at,
          },
          session.access_token
        );
      } else {
        useAuthStore.getState().logout();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={client}>
      <ThemeProvider
        attribute={themeConfig.attribute as any}
        defaultTheme={themeConfig.defaultTheme}
        enableSystem={themeConfig.enableSystem}
        storageKey={themeConfig.storageKey}
      >
        {children}
      </ThemeProvider>
      {process.env.NODE_ENV !== "production" && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
