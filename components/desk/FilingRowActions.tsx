// components/desk/FilingRowActions.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  MoreHorizontal,
  User,
  Hash,
  BookmarkPlus,
  BookmarkCheck,
  BellPlus,
  Link2,
  Share2,
  Check,
} from "lucide-react";
import {
  BG_2,
  LINE,
  LINE_2,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";
import { useWatchlist } from "@/lib/watchlist";
import { useAlerts } from "@/lib/alerts";
import { useToast } from "@/components/ui/Toaster";
import type { FirehoseRow } from "@/lib/queries";

const EASE = [0.22, 1, 0.36, 1] as const;

export function FilingRowActions({
  row,
  visible,
}: {
  row: FirehoseRow;
  visible: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const { has: isWatched, toggle: toggleWatch } = useWatchlist();
  const { create: createAlert } = useAlerts();

  const watched = isWatched("ticker", row.ticker);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
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

  const stop = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
  };

  const onMember = (e: React.MouseEvent) => {
    stop(e);
    setOpen(false);
    router.push(`/${row.slug}`);
  };

  const onTicker = (e: React.MouseEvent) => {
    stop(e);
    setOpen(false);
    router.push(`/ticker/${row.ticker}`);
  };

  const onWatch = (e: React.MouseEvent) => {
    stop(e);
    const nowWatched = toggleWatch("ticker", row.ticker);
    toast(
      nowWatched
        ? `Added ${row.ticker} to watchlist`
        : `Removed ${row.ticker} from watchlist`,
      { variant: nowWatched ? "success" : "info" },
    );
  };

  const onAlert = (e: React.MouseEvent) => {
    stop(e);
    createAlert("politician_trades", { portfolioSlug: row.slug });
    toast(`Alert created for ${row.portfolioName}`, {
      variant: "success",
      description: "Manage in /alerts",
    });
    setOpen(false);
  };

  const onCopyUrl = async (e: React.MouseEvent) => {
    stop(e);
    const url = row.sourceUrl ?? `${window.location.origin}/${row.slug}#${row.txId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast("Filing URL copied", { variant: "success" });
    } catch {
      toast("Couldn't copy — try again", { variant: "error" });
    }
  };

  const onShare = async (e: React.MouseEvent) => {
    stop(e);
    const url = `${window.location.origin}/${row.slug}`;
    const text = `${row.portfolioName} ${row.action.toUpperCase()} ${row.ticker} — autotrade`;
    if (typeof navigator !== "undefined" && (navigator as Navigator & { share?: (data: ShareData) => Promise<void> }).share) {
      try {
        await (navigator as Navigator & { share: (data: ShareData) => Promise<void> }).share({ title: text, url });
        setOpen(false);
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1400);
    } catch {
      toast("Couldn't copy share link", { variant: "error" });
    }
  };

  return (
    <div className="relative" ref={ref} onClick={stop} onKeyDown={stop}>
      <button
        type="button"
        aria-label={`Quick actions for ${row.portfolioName}`}
        aria-expanded={open}
        onClick={(e) => {
          stop(e);
          setOpen((v) => !v);
        }}
        className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-white/[0.08] focus:opacity-100"
        style={{
          color: open ? TEXT_HI : TEXT_LOW,
          opacity: visible || open ? 1 : 0,
          transition: "opacity 120ms ease, color 120ms ease",
        }}
      >
        <MoreHorizontal size={14} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.16, ease: EASE }}
            role="menu"
            className="absolute right-0 top-full mt-1 z-50 rounded-xl p-1.5 w-[252px]"
            style={{
              background: BG_2,
              border: `1px solid ${LINE_2}`,
              boxShadow:
                "0 30px 80px -20px rgba(0,0,0,0.85), inset 0 1px 0 rgba(255,255,255,0.06)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <MenuItem
              icon={<User size={12} />}
              onClick={onMember}
              label={
                <>
                  View <span style={{ color: TEXT_HI }}>{row.portfolioName}</span>
                </>
              }
              accent={VIOLET_2}
            />
            <MenuItem
              icon={<Hash size={12} />}
              onClick={onTicker}
              label={
                <>
                  View ticker{" "}
                  <span className="font-mono" style={{ color: YELLOW }}>
                    {row.ticker}
                  </span>
                </>
              }
              accent={YELLOW}
            />
            <Divider />
            <MenuItem
              icon={watched ? <BookmarkCheck size={12} /> : <BookmarkPlus size={12} />}
              onClick={onWatch}
              label={
                watched ? (
                  <>
                    Remove{" "}
                    <span className="font-mono" style={{ color: YELLOW }}>
                      {row.ticker}
                    </span>{" "}
                    from watchlist
                  </>
                ) : (
                  <>
                    Watch{" "}
                    <span className="font-mono" style={{ color: YELLOW }}>
                      {row.ticker}
                    </span>
                  </>
                )
              }
              accent={watched ? VIOLET_2 : TEXT_MID}
            />
            <MenuItem
              icon={<BellPlus size={12} />}
              onClick={onAlert}
              label={
                <>
                  Alert when{" "}
                  <span style={{ color: TEXT_HI }}>{row.portfolioName}</span>{" "}
                  trades
                </>
              }
              accent={TEXT_MID}
            />
            <Divider />
            <MenuItem
              icon={<Link2 size={12} />}
              onClick={onCopyUrl}
              label="Copy filing URL"
              accent={TEXT_MID}
            />
            <MenuItem
              icon={shareCopied ? <Check size={12} /> : <Share2 size={12} />}
              onClick={onShare}
              label={shareCopied ? "Copied to clipboard" : "Share"}
              accent={shareCopied ? "#4ADE80" : TEXT_MID}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MenuItem({
  icon,
  label,
  onClick,
  accent,
}: {
  icon: React.ReactNode;
  label: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  accent: string;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-[12px] transition-colors hover:bg-white/[0.05] text-left"
      style={{ color: TEXT_MID }}
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-md shrink-0"
        style={{
          color: accent,
          background: "rgba(255,255,255,0.04)",
        }}
      >
        {icon}
      </span>
      <span className="flex-1 min-w-0 truncate">{label}</span>
    </button>
  );
}

function Divider() {
  return (
    <div
      className="my-1 mx-1.5"
      style={{ borderTop: `1px solid ${LINE}` }}
    />
  );
}

// Silence "imported but unused" if a future split moves VIOLET out.
void VIOLET;
