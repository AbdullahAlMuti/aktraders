"use client";

import { useToastStore } from "@/hooks/use-toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/utils/cn";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            "pointer-events-auto flex items-start justify-between p-4 rounded-xl shadow-lg border text-xs transition-all duration-300 animate-in slide-in-from-right-5",
            t.type === "success" && "bg-emerald-950/90 text-emerald-100 border-emerald-800 dark:bg-emerald-950 dark:border-emerald-700",
            t.type === "error" && "bg-rose-950/90 text-rose-100 border-rose-800 dark:bg-rose-950 dark:border-rose-700",
            t.type === "warning" && "bg-amber-950/90 text-amber-100 border-amber-800 dark:bg-amber-950 dark:border-amber-700",
            (!t.type || t.type === "info") && "bg-neutral-900/90 text-neutral-100 border-neutral-800 dark:bg-neutral-900 dark:border-neutral-700"
          )}
        >
          <div className="flex items-start space-x-3">
            <div className="mt-0.5 shrink-0">
              {t.type === "success" && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
              {t.type === "error" && <AlertCircle className="h-4 w-4 text-rose-400" />}
              {t.type === "warning" && <AlertTriangle className="h-4 w-4 text-amber-400" />}
              {(!t.type || t.type === "info") && <Info className="h-4 w-4 text-blue-400" />}
            </div>
            <div>
              <h5 className="font-bold text-xs">{t.title}</h5>
              {t.description && <p className="text-[11px] opacity-80 mt-0.5 leading-normal">{t.description}</p>}
            </div>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="ml-4 shrink-0 rounded p-1 opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
