// app/notifications/page.tsx
"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Receipt, Sparkles, Users, BellRing, Check, X } from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import {
  BG_2,
  LINE,
  LINE_2,
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
  { color: string; bg: string; Icon: typeof Bell; label: string }
> = {
  filing: {
    color: VIOLET_2,
    bg: "rgba(124,95,255,0.14)",
    Icon: Receipt,
    label: "Filing",
  },
  ai: {
    color: "#F0B429",
    bg: "rgba(240,180,41,0.14)",
    Icon: Sparkles,
    label: "AI mind",
  },
  consensus: {
    color: "#4ADE80",
    bg: "rgba(74,222,128,0.14)",
    Icon: Users,
    label: "Consensus",
  },
  alert: {
    color: "#60A5FA",
    bg: "rgba(96,165,250,0.14)",
    Icon: BellRing,
    label: "Alert",
  },
};

export default function NotificationsPage() {
  const router = useRouter();
  const { items, hydrated, unreadCount, markRead, markAllRead, remove } =
    useNotifications();

  return (
    <DeskShell breadcrumb="Notifications">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: TEXT_HI }}>
            Notifications
          </h1>
          <p className="text-[13px] mt-1" style={{ color: TEXT_MID }}>
            {hydrated
              ? `${items.length} total · ${unreadCount} unread`
              : "Loading…"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={markAllRead}
            disabled={unreadCount === 0}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors hover:bg-white/[0.06] disabled:opacity-40"
            style={{ border: `1px solid ${LINE_2}`, color: TEXT_MID }}
          >
            <Check size={12} /> Mark all read
          </button>
          <Link
            href="/settings"
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] transition-colors hover:bg-white/[0.06]"
            style={{ border: `1px solid ${LINE_2}`, color: TEXT_MID }}
          >
            Preferences
          </Link>
        </div>
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: BG_2,
          border: `1px solid ${LINE_2}`,
        }}
      >
        {hydrated && items.length === 0 ? (
          <div className="px-6 py-20 text-center">
            <div
              className="mx-auto inline-flex items-center justify-center w-12 h-12 rounded-full mb-4"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: `1px solid ${LINE_2}`,
                color: TEXT_LOW,
              }}
            >
              <Bell size={18} />
            </div>
            <div className="text-[15px]" style={{ color: TEXT_HI }}>
              No notifications yet
            </div>
            <p className="mt-1.5 text-[12.5px] max-w-xs mx-auto" style={{ color: TEXT_LOW }}>
              Filings, AI rotations, consensus shifts, and your alerts will land here.
            </p>
          </div>
        ) : (
          <ul role="list">
            <AnimatePresence initial={false}>
              {items.map((n) => (
                <motion.li
                  key={n.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    height: 0,
                    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
                  }}
                  style={{ overflow: "hidden" }}
                >
                  <Row
                    n={n}
                    onOpen={() => {
                      markRead(n.id);
                      if (n.href) router.push(n.href);
                    }}
                    onDismiss={() => remove(n.id)}
                  />
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>
    </DeskShell>
  );
}

function Row({
  n,
  onOpen,
  onDismiss,
}: {
  n: Notification;
  onOpen: () => void;
  onDismiss: () => void;
}) {
  const s = TYPE_STYLE[n.type];
  const Icon = s.Icon;
  return (
    <div
      className="group flex items-start gap-4 px-5 py-4 transition-colors hover:bg-white/[0.025]"
      style={{ borderBottom: `1px solid ${LINE}` }}
    >
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
        style={{
          background: s.bg,
          color: s.color,
          border: `1px solid ${s.color}33`,
        }}
      >
        <Icon size={15} />
      </span>
      <button
        type="button"
        onClick={onOpen}
        className="flex-1 min-w-0 text-left"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-sm"
            style={{ background: s.bg, color: s.color }}
          >
            {s.label}
          </span>
          <span className="text-[13.5px] font-medium" style={{ color: TEXT_HI }}>
            {n.title}
          </span>
          {!n.read && (
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: VIOLET }}
            />
          )}
        </div>
        <div className="text-[12.5px] mt-1 leading-relaxed" style={{ color: TEXT_MID }}>
          {n.body}
        </div>
        <div
          className="font-mono text-[10px] uppercase tracking-[0.14em] mt-1.5"
          style={{ color: TEXT_LOW }}
        >
          {relativeTime(n.createdAt)}
        </div>
      </button>
      <button
        onClick={onDismiss}
        aria-label="Dismiss"
        className="shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white/5"
        style={{ color: TEXT_LOW }}
      >
        <X size={13} />
      </button>
    </div>
  );
}
