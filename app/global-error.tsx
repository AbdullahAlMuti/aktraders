"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Root Error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center p-6 bg-slate-50 font-sans text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
          <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Application Error</h2>
        <p className="mt-2 text-sm text-slate-500 max-w-md">
          {error?.message || "An unexpected error occurred. Please try reloading the page."}
        </p>
        <button
          onClick={() => reset()}
          className="mt-6 rounded-lg bg-blue-600 px-6 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
