"use client";

import * as React from "react";
import { cn } from "@/utils/cn";

export interface AvatarProps {
  src?: string | null;
  name: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  // Reset error state if src changes
  React.useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClasses = {
    xs: "h-6 w-6 text-[10px]",
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const getInitials = (n: string) => {
    if (!n) return "U";
    const clean = n.replace(/\(.*?\)/g, "").trim();
    const parts = clean.split(/\s+/).filter(Boolean);
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    if (parts.length === 1 && parts[0].length >= 1) return parts[0][0].toUpperCase();
    return "U";
  };

  const shouldShowImage = Boolean(src && !hasError && src.trim().length > 0);

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-slate-200/80 bg-blue-100 font-semibold text-blue-700 dark:border-slate-800 dark:bg-blue-950/60 dark:text-blue-200 items-center justify-center select-none shadow-xs",
        sizeClasses[size],
        className
      )}
    >
      {shouldShowImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setHasError(true)}
          loading="lazy"
        />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}

