// components/desk/NotificationCenter.tsx
"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bell,
  Receipt,
  Sparkles,
  Users,
  BellRing,
  Check,
} from "lucide-react";
import {
  BG_2,
  LINE,
  LINE_2,
  NEGATIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
} from "@/lib/theme";
import {
  relativeTime,
  useNotifications,
  type Notification,
  type NotificationType,
} from "@/lib/notifications";

const TYPE_STYLE: Record<
  NotificationType,
  { color: string; bg: string; Icon: typeof Bell }
> = {
  filing: { color: VIOLET_2, bg: "rgba(124,95,255,0.14)", Icon: Receipt },
  ai: { color: "#F0B429", bg: "rgba(240,180,41,0.14)", Icon: Sparkles },
  consensus: { color: "#4ADE80", bg: "rgba(74,222,128,0.14)", Icon: Users },
  alert: { color: "#60A5FA", bg: "rgba(96,165,250,0.14)", Icon: BellRing },
};

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { items, hydrated, unreadCount, markRead, markAllRead } =
    useNotifications();
  const router = useRouter();

  // Close on outside click + Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const onRowClick = (n: Notification) => {
    markRead(n.id);
    setOpen(false);
    if (n.href) router.push(n.href);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Open notifications"
        aria-expanded={open}
        className="relative inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors hover:bg-white/[0.06]"
        style={{ color: TEXT_MID }}
      >
        <Bell size={15} />
        {hydrated && unreadCount > 0 && (
          <span
            aria-label={`${unreadCount} unread notifications`}
            className="absolute top-1.5 right-1.5 inline-flex items-center justify-center min-w-[14px] h-[14px] px-1 rounded-full font-mono text-[8.5px] font-semibold leading-none"
            style={{
              background: NEGATIVE,
              color: "#fff",
              boxShadow: `0 0 0 2px rgba(8,6,15,0.95)`,
            }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="notif-panel"
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.985, transition: { duration: 0.14 } }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            role="dialog"
            aria-label="Notifications"
            className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-50 origin-top-right"
            style={{
              width: "min(360px, calc(100vw - 24px))",
              background: BG_2,
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              border: `1px solid ${LINE_2}`,
              boxShadow:
                "0 60px 160px -30px rgba(0,0,0,0.85), 0 20px 50px -20px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 h-11"
              style={{ borderBottom: `1px solid ${LINE}` }}
            >
              <div className="flex items-center gap-2">
                <Bell size={13} style={{ color: TEXT_MID }} />
                <span className="text-[13px] font-medium" style={{ color: TEXT_HI }}>
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    className="font-mono text-[9.5px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-sm"
                    style={{
                      background: "rgba(124,95,255,0.18)",
                      color: VIOLET_2,
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              <button
                onClick={markAllRead}
                disabled={unreadCount === 0}
                className="inline-flex items-center gap-1 text-[11.5px] transition-colors disabled:opacity-40 hover:text-white"
                style={{ color: TEXT_LOW }}
              >
                <Check size={11} />
                Mark all read
              </button>
            </div>

            {/* Body */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "min(60vh, 440px)" }}
            >
              {!hydrated ? (
                <div className="px-5 py-10 text-center text-[12.5px]" style={{ color: TEXT_LOW }}>
                  Loading…
                </div>
              ) : items.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <div
                    className="mx-auto inline-flex items-center justify-center w-10 h-10 rounded-full mb-3"
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: `1px solid ${LINE_2}`,
                      color: TEXT_LOW,
                    }}
                  >
                    <Bell size={14} />
                  </div>
                  <div className="text-[13px]" style={{ color: TEXT_MID }}>
                    You&apos;re all caught up.
                  </div>
                </div>
              ) : (
                <ul role="list" className="py-1">
                  {items.map((n) => (
                    <NotificationRow key={n.id} n={n} onClick={() => onRowClick(n)} />
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            <div
              className="flex items-center justify-between px-4 h-10"
              style={{ borderTop: `1px solid ${LINE}` }}
            >
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-[11.5px] transition-colors hover:text-white"
                style={{ color: VIOLET_2 }}
              >
                View all
              </Link>
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="text-[11px] transition-colors hover:text-white"
                style={{ color: TEXT_LOW }}
              >
                Preferences
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NotificationRow({
  n,
  onClick,
}: {
  n: Notification;
  onClick: () => void;
}) {
  const style = TYPE_STYLE[n.type];
  const Icon = style.Icon;
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className="w-full text-left px-3.5 py-3 flex items-start gap-3 transition-colors hover:bg-white/[0.035]"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0"
          style={{
            background: style.bg,
            color: style.color,
            border: `1px solid ${style.color}33`,
          }}
        >
          <Icon size={13} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div
              className="text-[12.5px] font-medium truncate"
              style={{ color: TEXT_HI }}
            >
              {n.title}
            </div>
            {!n.read && (
              <span
                aria-label="Unread"
                className="inline-block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: VIOLET }}
              />
            )}
          </div>
          <div
            className="text-[11.5px] mt-0.5 leading-snug"
            style={{ color: TEXT_MID }}
          >
            {n.body}
          </div>
          <div
            className="font-mono text-[10px] uppercase tracking-[0.14em] mt-1"
            style={{ color: TEXT_LOW }}
          >
            {relativeTime(n.createdAt)}
          </div>
        </div>
      </button>
    </li>
  );
}
