import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

export interface SpinnerProps {
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
  label?: string;
}

export function Spinner({ size = "md", className, label }: SpinnerProps) {
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2 p-4">
      <Loader2 className={cn("animate-spin text-blue-600 dark:text-blue-400", sizeMap[size], className)} />
      {label && <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{label}</p>}
    </div>
  );
}
