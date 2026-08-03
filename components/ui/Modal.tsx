import * as React from "react";
import { cn } from "@/utils/cn";
import { X } from "lucide-react";
import { Button } from "./Button";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "md",
}: ModalProps) {
  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/50 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className={cn(
          "relative w-full rounded-xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900",
          maxWidthClasses[maxWidth]
        )}
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>}
            {description && <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{description}</p>}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">{footer}</div>}
      </div>
    </div>
  );
}
