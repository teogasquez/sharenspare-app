"use client";

import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { CheckCircle, X, Bell, AlertCircle } from "lucide-react";

type ToastType = "success" | "info" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType) => void;
  unreadCount: number;
  clearUnread: () => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addToast = useCallback((message: string, type: ToastType = "info") => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, message, type }]);
    setUnreadCount(c => c + 1);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 6000);
  }, []);

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  const remove = (id: string) => setToasts(prev => prev.filter(t => t.id !== id));

  const icons: Record<ToastType, typeof Bell> = { success: CheckCircle, info: Bell, error: AlertCircle };
  const colors: Record<ToastType, string> = {
    success: "bg-green-primary text-white border-green-700",
    info: "bg-gray-900 text-white border-gray-700",
    error: "bg-red-600 text-white border-red-700",
  };

  return (
    <ToastContext.Provider value={{ addToast, unreadCount, clearUnread }}>
      {children}
      <div className="fixed bottom-6 right-6 z-200 flex flex-col gap-3 pointer-events-none" style={{ width: "340px" }}>
        {toasts.map(toast => {
          const Icon = icons[toast.type];
          return (
            <div
              key={toast.id}
              style={{ pointerEvents: "auto" }}
              className={`flex items-start gap-3 px-4 py-3 rounded-xl border shadow-2xl ${colors[toast.type]}`}
            >
              <Icon className="w-5 h-5 shrink-0 mt-0.5" />
              <p className="text-sm font-medium flex-1 leading-snug">{toast.message}</p>
              <button onClick={() => remove(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity flex-shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
