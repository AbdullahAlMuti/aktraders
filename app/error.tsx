"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { AlertOctagon, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400 mb-4">
        <AlertOctagon className="h-8 w-8" />
      </div>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
        Application Error
      </h2>
      <p className="mt-2 text-sm text-slate-500 max-w-md">
        {error.message || "A temporary system error occurred. Please try again."}
      </p>
      <Button onClick={() => reset()} className="mt-6" leftIcon={<RefreshCw className="h-4 w-4" />}>
        Try Again
      </Button>
    </div>
  );
}
