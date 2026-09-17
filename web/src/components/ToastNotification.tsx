"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Loader2, CheckCircle2, AlertCircle, UploadCloud } from "lucide-react";

interface Toast {
  id: string;
  type: "loading" | "success" | "error" | "uploading";
  message: string;
}

interface ToastContextType {
  showLoading: (message?: string) => string;
  showUploading: (message?: string) => string;
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  hideToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType>({
  showLoading: () => "",
  showUploading: () => "",
  showSuccess: () => {},
  showError: () => {},
  hideToast: () => {},
});

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (type: Toast["type"], message: string): string => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, message }]);
    return id;
  };

  const hideToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const showLoading = (message = "Chargement en cours...") => {
    return addToast("loading", message);
  };

  const showUploading = (message = "Traitement de l'image en cours...") => {
    return addToast("uploading", message);
  };

  const showSuccess = (message: string) => {
    const id = addToast("success", message);
    setTimeout(() => hideToast(id), 3000);
  };

  const showError = (message: string) => {
    const id = addToast("error", message);
    setTimeout(() => hideToast(id), 4000);
  };

  return (
    <ToastContext.Provider value={{ showLoading, showUploading, showSuccess, showError, hideToast }}>
      {children}

      {/* Popups & Toasts Flottants Centrés / En haut */}
      <div className="fixed inset-0 pointer-events-none z-[100] flex flex-col items-center justify-start pt-16 px-4 gap-3">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-md transition-all animate-in fade-in slide-in-from-top-4 duration-300 border ${
              toast.type === "loading"
                ? "bg-primary text-white border-primary/20"
                : toast.type === "uploading"
                ? "bg-accent text-white border-accent/20"
                : toast.type === "success"
                ? "bg-green-700 text-white border-green-600"
                : "bg-red-700 text-white border-red-600"
            }`}
          >
            {toast.type === "loading" && (
              <Loader2 className="h-5 w-5 animate-spin text-white shrink-0" />
            )}
            {toast.type === "uploading" && (
              <UploadCloud className="h-5 w-5 animate-bounce text-white shrink-0" />
            )}
            {toast.type === "success" && (
              <CheckCircle2 className="h-5 w-5 text-white shrink-0" />
            )}
            {toast.type === "error" && (
              <AlertCircle className="h-5 w-5 text-white shrink-0" />
            )}

            <span className="text-sm font-semibold tracking-wide">{toast.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
