import { cn } from "@/utils/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-slate-200 dark:bg-slate-800", className)} />;
}

export function CardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 p-6 bg-white dark:border-slate-800 dark:bg-slate-900 space-y-4">
      <Skeleton className="h-6 w-1/3" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      <Skeleton className="h-10 w-full" />
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  );
}
