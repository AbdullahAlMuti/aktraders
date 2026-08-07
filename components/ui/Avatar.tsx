import * as React from "react";
import Image from "next/image";
import { cn } from "@/utils/cn";

export interface AvatarProps {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-12 w-12 text-base",
    xl: "h-16 w-16 text-lg",
  };

  const getInitials = (n: string) => {
    if (!n) return "U";
    const parts = n.trim().split(" ");
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return parts[0][0].toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative flex shrink-0 overflow-hidden rounded-full border border-slate-200 bg-blue-100 font-semibold text-blue-700 dark:border-slate-800 dark:bg-blue-900/60 dark:text-blue-200 items-center justify-center select-none",
        sizeClasses[size],
        className
      )}
    >
      {src ? (
        <Image src={src} alt={name} fill sizes="96px" unoptimized className="object-cover" />
      ) : (
        <span>{getInitials(name)}</span>
      )}
    </div>
  );
}
