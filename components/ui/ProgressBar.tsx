import * as React from "react";
import { cn } from "@/utils/cn";

export interface ProgressBarProps {
  value: number; // 0 to 100
  showLabel?: boolean;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({ value, showLabel = false, className, barClassName }: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-400">
          <span>প্রগ্রেস (Progress)</span>
          <span>{clampedValue}%</span>
        </div>
      )}
      <div className={cn("h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800", className)}>
        <div
          className={cn("h-full bg-blue-600 transition-all duration-300 ease-in-out dark:bg-blue-500", barClassName)}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
