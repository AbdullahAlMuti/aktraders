"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider } from "next-themes";
import { queryClient } from "@/lib/react-query";
import { themeConfig } from "@/config/theme";
import { useState } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => queryClient);

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
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
