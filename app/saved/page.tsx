// app/saved/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Bookmark,
  BookmarkPlus,
  ChevronRight,
  Filter,
  Trash2,
  Pencil,
  Check,
  X,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import {
  LINE,
  LINE_2,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";
import {
  filtersToQueryString,
  summarizeFilters,
  useSavedSearches,
  type SavedSearch,
} from "@/lib/saved-searches";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toaster";

export default function SavedSearchesPage() {
  const { items, remove, rename, hydrated } = useSavedSearches();
  const router = useRouter();
  const { toast } = useToast();

  const openSearch = (s: SavedSearch) => {
    const qs = filtersToQueryString(s.filters);
    router.push(qs ? `/terminal?${qs}#firehose` : "/terminal#firehose");
  };

  return (
    <DeskShell breadcrumb="Saved">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <Bookmark size={20} style={{ color: VIOLET_2 }} />
          <div>
            <h1
              className="text-[22px] sm:text-[26px] font-semibold tracking-tight"
              style={{ color: TEXT_HI }}
            >
              Saved searches
            </h1>
            <p className="text-[13px] mt-0.5" style={{ color: TEXT_MID }}>
              One click to re-run a firehose filter
            </p>
          </div>
        </div>
        <div
          className="font-mono text-[10.5px] uppercase tracking-[0.16em]"
          style={{ color: TEXT_LOW }}
        >
          {hydrated ? `${items.length} saved` : ""}
        </div>
      </div>

      {hydrated && items.length === 0 ? (
        <section
          className="rounded-2xl"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
            border: `1px solid ${LINE_2}`,
          }}
        >
          <EmptyState
            icon={<BookmarkPlus size={20} />}
            headline="No saved searches yet"
            body="Open the filings firehose, set a filter (party, side, ticker…), then hit Save search."
            cta={{
              label: "Open firehose",
              onClick: () => router.push("/terminal#firehose"),
            }}
          />
        </section>
      ) : (
        <section
          className="rounded-2xl overflow-hidden"
          style={{
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
            border: `1px solid ${LINE_2}`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
          }}
        >
          <AnimatePresence initial={false}>
            {items.map((s, i) => (
              <SavedRow
                key={s.id}
                s={s}
                isLast={i === items.length - 1}
                onOpen={() => openSearch(s)}
                onDelete={() => {
                  remove(s.id);
                  toast("Deleted saved search", { variant: "info" });
                }}
                onRename={(n) => rename(s.id, n)}
              />
            ))}
          </AnimatePresence>
        </section>
      )}

      {/* Footnote */}
      <div
        className="rounded-2xl px-5 py-3 flex items-center gap-3"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.005) 100%)",
          border: `1px solid ${LINE_2}`,
        }}
      >
        <Filter size={13} style={{ color: TEXT_LOW }} />
        <div className="text-[12px]" style={{ color: TEXT_MID }}>
          Stored locally in your browser. They follow this device — they don&apos;t sync across machines yet.
        </div>
      </div>
    </DeskShell>
  );
}

/* ───────────────────────── Row ───────────────────────── */

function SavedRow({
  s,
  isLast,
  onOpen,
  onDelete,
  onRename,
}: {
  s: SavedSearch;
  isLast: boolean;
  onOpen: () => void;
  onDelete: () => void;
  onRename: (name: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(s.name);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
      className="group flex items-center gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-white/[0.025]"
      style={{
        borderBottom: isLast ? "none" : `1px solid ${LINE}`,
      }}
      onClick={editing ? undefined : onOpen}
      role="button"
      tabIndex={editing ? -1 : 0}
      onKeyDown={(e) => {
        if (editing) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
    >
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-md shrink-0"
        style={{
          background: "rgba(124,95,255,0.12)",
          color: VIOLET_2,
          border: `1px solid rgba(124,95,255,0.25)`,
        }}
      >
        <Bookmark size={14} />
      </span>

      <div className="flex-1 min-w-0">
        {editing ? (
          <input
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") {
                onRename(draft.trim() || s.name);
                setEditing(false);
              } else if (e.key === "Escape") {
                setDraft(s.name);
                setEditing(false);
              }
            }}
            className="w-full bg-transparent border rounded-md px-2 py-1 text-[13.5px] outline-none"
            style={{ borderColor: LINE_2, color: TEXT_HI }}
          />
        ) : (
          <div
            className="text-[14px] font-medium truncate"
            style={{ color: TEXT_HI }}
          >
            {s.name}
          </div>
        )}
        <div className="mt-0.5 flex items-center gap-2 flex-wrap text-[11.5px]" style={{ color: TEXT_MID }}>
          <span style={{ color: TEXT_LOW }}>
            {fmtDate(s.createdAt)}
          </span>
          <span style={{ color: TEXT_LOW }}>·</span>
          <span>{summarizeFilters(s.filters)}</span>
          {s.filters.ticker && (
            <span
              className="px-1.5 py-0.5 font-mono rounded-sm"
              style={{
                background: "rgba(247,210,74,0.12)",
                color: YELLOW,
                fontSize: 10.5,
              }}
            >
              {s.filters.ticker}
            </span>
          )}
        </div>
      </div>

      <div
        className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        {editing ? (
          <>
            <IconBtn
              label="Save name"
              onClick={() => {
                onRename(draft.trim() || s.name);
                setEditing(false);
              }}
            >
              <Check size={13} />
            </IconBtn>
            <IconBtn
              label="Cancel"
              onClick={() => {
                setDraft(s.name);
                setEditing(false);
              }}
            >
              <X size={13} />
            </IconBtn>
          </>
        ) : (
          <>
            <IconBtn label="Rename" onClick={() => setEditing(true)}>
              <Pencil size={13} />
            </IconBtn>
            <IconBtn label="Delete" onClick={onDelete} danger>
              <Trash2 size={13} />
            </IconBtn>
          </>
        )}
      </div>

      <ChevronRight size={14} style={{ color: TEXT_LOW }} className="shrink-0" />
    </motion.div>
  );
}

function IconBtn({
  children,
  onClick,
  label,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      aria-label={label}
      title={label}
      onClick={onClick}
      className="inline-flex items-center justify-center w-7 h-7 rounded-md transition-colors hover:bg-white/[0.06]"
      style={{ color: danger ? "#F87171" : TEXT_MID }}
    >
      {children}
    </button>
  );
}

function fmtDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// Suppress noise about unused VIOLET (kept for theme parity in future tweaks)
void VIOLET;
