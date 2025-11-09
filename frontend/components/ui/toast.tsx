"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { AlertCircle, CheckCircle2, Info, X } from "lucide-react";

import { cn } from "@/lib/utils";

export type ToastVariant = "info" | "success" | "error";

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
  id?: number;
}

interface ToastMessage extends Required<Pick<ToastOptions, "title">> {
  id: number;
  description?: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  toast: (options: ToastOptions) => number;
  dismiss: (id?: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_DURATION = 4800;

function getIcon(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return <CheckCircle2 className="h-4 w-4" aria-hidden />;
    case "error":
      return <AlertCircle className="h-4 w-4" aria-hidden />;
    default:
      return <Info className="h-4 w-4" aria-hidden />;
  }
}

function getToneClasses(variant: ToastVariant) {
  switch (variant) {
    case "success":
      return "border-[color-mix(in srgb,var(--color-success) 80%,transparent)] bg-[color-mix(in srgb,var(--color-success) 18%,white 82%)] text-[var(--color-success)]";
    case "error":
      return "border-[color-mix(in srgb,var(--color-danger) 80%,transparent)] bg-[color-mix(in srgb,var(--color-danger) 18%,white 82%)] text-[var(--color-danger)]";
    default:
      return "border-[color-mix(in srgb,var(--color-accent) 60%,transparent)] bg-[color-mix(in srgb,var(--color-accent-soft) 80%,white 20%)] text-[var(--color-foreground)]";
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<number, number>>(new Map());

  useEffect(() => {
    const map = timers.current;
    return () => {
      map.forEach((timer) => window.clearTimeout(timer));
      map.clear();
    };
  }, []);

  const dismiss = useCallback((id?: number) => {
    setToasts((prev) => {
      if (id === undefined) {
        return [];
      }
      return prev.filter((toast) => toast.id !== id);
    });

    if (id !== undefined) {
      const timeoutId = timers.current.get(id);
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timers.current.delete(id);
      }
    } else {
      timers.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timers.current.clear();
    }
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "info", duration = DEFAULT_DURATION, id }: ToastOptions) => {
      const toastId = id ?? Date.now() + Math.floor(Math.random() * 1000);

      setToasts((prev) => [
        ...prev,
        {
          id: toastId,
          title,
          description,
          variant,
        },
      ]);

      const timeoutId = window.setTimeout(() => {
        setToasts((prev) => prev.filter((toastMessage) => toastMessage.id !== toastId));
        timers.current.delete(toastId);
      }, duration);

      timers.current.set(toastId, timeoutId);

      return toastId;
    },
    [],
  );

  const value = useMemo(
    () => ({
      toast,
      dismiss,
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}

interface ToastViewportProps {
  toasts: ToastMessage[];
  onDismiss: (id?: number) => void;
}

function ToastViewport({ toasts, onDismiss }: ToastViewportProps) {
  if (toasts.length === 0) {
    return null;
  }

  return (
    <div
      className="pointer-events-none fixed inset-x-4 top-4 z-[60] flex flex-col gap-3 md:right-4 md:left-auto md:w-80"
      role="region"
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => {
        const toneClasses = getToneClasses(toast.variant);
        const role = toast.variant === "error" ? "alert" : "status";

        return (
          <div
            key={toast.id}
            role={role}
            className={cn(
              "pointer-events-auto flex items-start gap-3 rounded-[var(--radius-md)] border px-4 py-3 shadow-lg backdrop-blur",
              toneClasses,
            )}
          >
            <span className="mt-0.5 text-[var(--color-foreground)]">{getIcon(toast.variant)}</span>
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-[var(--color-foreground)]">{toast.title}</p>
              {toast.description ? (
                <p className="text-xs text-[var(--color-muted-foreground)]">{toast.description}</p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              className="ml-2 rounded-full p-1 text-[var(--color-muted-foreground)] transition hover:bg-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>
        );
      })}
    </div>
  );
}
