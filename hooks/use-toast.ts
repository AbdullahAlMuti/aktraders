import { useState } from "react";

export interface ToastMessage {
  id: string;
  title?: string;
  description: string;
  type: "success" | "error" | "info" | "warning";
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const toast = ({ title, description, type = "info" }: Omit<ToastMessage, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, title, description, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return { toasts, toast, removeToast };
}
