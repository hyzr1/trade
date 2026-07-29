// components/ui/Toaster.tsx — global toast system with framer-motion.
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, Info, X, Bell } from "lucide-react";
import { BG_2, LINE_2, NEGATIVE, POSITIVE, TEXT_HI, TEXT_LOW, TEXT_MID, VIOLET, VIOLET_2 } from "@/lib/theme";

export type ToastVariant = "default" | "success" | "error" | "info";

export type ToastOptions = {
  variant?: ToastVariant;
  duration?: number; // ms, 0 to disable auto-dismiss
  description?: string;
};

type Toast = {
  id: number;
  message: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
};

type Ctx = {
  toast: (message: string, opts?: ToastOptions) => number;
  dismiss: (id?: number) => void;
};

const ToastContext = createContext<Ctx | null>(null);

const MAX_VISIBLE = 3;
const DEFAULT_DURATION = 4000;

export function useToast(): Ctx {
  const ctx = useContext(ToastContext);
  if (ctx) return ctx;
  // Soft fallback so component code doesn't crash if Toaster isn't mounted
  // (e.g. in tests or storybook). Calls become no-ops.
  return {
    toast: () => 0,
    dismiss: () => undefined,
  };
}

export function Toaster({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(1);
  const timeouts = useRef(new Map<number, ReturnType<typeof setTimeout>>());

  const dismiss = useCallback((id?: number) => {
    setToasts((curr) => {
      if (id == null) {
        // dismiss all
        timeouts.current.forEach((t) => clearTimeout(t));
        timeouts.current.clear();
        return [];
      }
      const t = timeouts.current.get(id);
      if (t) {
        clearTimeout(t);
        timeouts.current.delete(id);
      }
      return curr.filter((x) => x.id !== id);
    });
  }, []);

  const toast = useCallback(
    (message: string, opts: ToastOptions = {}) => {
      const id = idRef.current++;
      const next: Toast = {
        id,
        message,
        description: opts.description,
        variant: opts.variant ?? "default",
        duration: opts.duration ?? DEFAULT_DURATION,
      };
      setToasts((curr) => {
        const merged = [...curr, next];
        // Cap stack length — drop oldest so the latest is always shown.
        if (merged.length > MAX_VISIBLE) {
          const dropped = merged.slice(0, merged.length - MAX_VISIBLE);
          dropped.forEach((d) => {
            const t = timeouts.current.get(d.id);
            if (t) {
              clearTimeout(t);
              timeouts.current.delete(d.id);
            }
          });
          return merged.slice(-MAX_VISIBLE);
        }
        return merged;
      });
      if (next.duration > 0) {
        const t = setTimeout(() => dismiss(id), next.duration);
        timeouts.current.set(id, t);
      }
      return id;
    },
    [dismiss],
  );

  // Dev shortcut: window event so people can fire toasts from devtools.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail as
        | { message?: string; variant?: ToastVariant; description?: string }
        | undefined;
      if (!detail?.message) return;
      toast(detail.message, { variant: detail.variant, description: detail.description });
    };
    window.addEventListener("autotrade.toast", handler);
    return () => window.removeEventListener("autotrade.toast", handler);
  }, [toast]);

  // Cleanup on unmount.
  useEffect(() => {
    const map = timeouts.current;
    return () => {
      map.forEach((t) => clearTimeout(t));
      map.clear();
    };
  }, []);

  const value = useMemo<Ctx>(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed z-[100] bottom-4 right-4 sm:bottom-6 sm:right-6 flex flex-col gap-2 items-end max-w-[calc(100vw-1rem)]"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} toast={t} onDismiss={() => onDismiss(t.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const { Icon, accent } = variantStyle(toast.variant);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 24, scale: 0.96, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 360, damping: 32 }}
      className="pointer-events-auto w-[340px] max-w-full rounded-xl p-3 pr-2 flex items-start gap-3"
      style={{
        background: BG_2,
        border: `1px solid ${LINE_2}`,
        boxShadow:
          "0 30px 80px -20px rgba(0,0,0,0.7), 0 12px 28px -10px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
        color: TEXT_HI,
      }}
      role="status"
    >
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
        style={{ background: `${accent}1A`, color: accent, border: `1px solid ${accent}33` }}
      >
        <Icon size={14} />
      </span>
      <div className="flex-1 min-w-0 pt-0.5">
        <div className="text-[13px] leading-snug font-medium truncate" style={{ color: TEXT_HI }}>
          {toast.message}
        </div>
        {toast.description && (
          <div className="text-[11.5px] mt-0.5 leading-snug" style={{ color: TEXT_MID }}>
            {toast.description}
          </div>
        )}
      </div>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md transition-colors hover:bg-white/5"
        style={{ color: TEXT_LOW }}
      >
        <X size={12} />
      </button>
    </motion.div>
  );
}

function variantStyle(v: ToastVariant): { Icon: typeof Bell; accent: string } {
  switch (v) {
    case "success":
      return { Icon: CheckCircle2, accent: POSITIVE };
    case "error":
      return { Icon: AlertCircle, accent: NEGATIVE };
    case "info":
      return { Icon: Info, accent: VIOLET_2 };
    default:
      return { Icon: Bell, accent: VIOLET };
  }
}
