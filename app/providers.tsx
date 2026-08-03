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

    const syncUserProfile = async (user: any, token: string = "") => {
      let dbProfile: any = null;
      try {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();
        dbProfile = data;
      } catch (e) {
        // Fallback to metadata if DB table query fails
      }

      useAuthStore.getState().setAuth(
        {
          id: user.id,
          name: dbProfile?.name || user.user_metadata?.name || user.email || "User",
          email: user.email!,
          role: (dbProfile?.role || user.app_metadata?.role || user.user_metadata?.role || "employee") as UserRole,
          department: dbProfile?.department || user.user_metadata?.department,
          avatarUrl: dbProfile?.avatar_url || user.user_metadata?.avatar_url,
          createdAt: user.created_at,
        },
        token
      );
    };

    // Get initial session on mount
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        syncUserProfile(user);
      }
    });

    // Listen for auth state changes (sign-in, sign-out, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncUserProfile(session.user, session.access_token);
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
