// app/chat/page.tsx
"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  MessageSquare,
  Plus,
  Sparkles,
  Clock,
  ChevronRight,
  Hash,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { ChatPanel } from "@/components/ai/ChatPanel";
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
  seedThreads,
  SUGGESTED_PROMPTS,
  type ChatThread,
} from "@/lib/chat-mock";

function fmtRelHistory(ms: number) {
  const diff = Date.now() - ms;
  const min = Math.round(diff / 60_000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}d`;
  return new Date(ms).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ChatPage() {
  const [threads] = useState<ChatThread[]>(() => seedThreads());
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

  const activeThread = useMemo(
    () => (activeThreadId ? threads.find((t) => t.id === activeThreadId) ?? null : null),
    [threads, activeThreadId],
  );

  const newChat = () => setActiveThreadId(null);

  return (
    <DeskShell breadcrumb="Ask">
      <div className="grid grid-cols-12 gap-4 lg:gap-6">
        {/* Left rail — threads */}
        <aside className="col-span-12 lg:col-span-3">
          <ThreadRail
            threads={threads}
            activeId={activeThreadId}
            onSelect={setActiveThreadId}
            onNew={newChat}
          />
        </aside>

        {/* Center — chat thread */}
        <section className="col-span-12 lg:col-span-6">
          <div
            className="rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: BG_2,
              border: `1px solid ${LINE_2}`,
              height: "calc(100vh - 9rem)",
              minHeight: 520,
            }}
          >
            <ChatPanel
              key={activeThread?.id ?? "new"}
              variant="page"
              initialMessages={activeThread?.messages ?? []}
            />
          </div>
        </section>

        {/* Right rail — suggested prompts */}
        <aside className="col-span-12 lg:col-span-3">
          <SuggestionsRail prompts={SUGGESTED_PROMPTS} />
        </aside>
      </div>
    </DeskShell>
  );
}

function ThreadRail({
  threads,
  activeId,
  onSelect,
  onNew,
}: {
  threads: ChatThread[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div
        className="flex items-center justify-between px-4 h-11"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <div
          className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: TEXT_LOW }}
        >
          <Clock size={11} />
          History
          <span
            className="ml-0.5 inline-flex items-center justify-center rounded-full px-1.5 min-w-[18px] h-[14px] tabular-nums"
            style={{
              background: "rgba(255,255,255,0.06)",
              color: TEXT_MID,
              fontSize: 9.5,
              letterSpacing: 0,
            }}
          >
            {threads.length}
          </span>
        </div>
        <button
          type="button"
          onClick={onNew}
          aria-label="New chat"
          className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11.5px] font-medium transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
            color: "#fff",
            boxShadow: "0 6px 18px -8px rgba(124,95,255,0.55)",
          }}
        >
          <Plus size={11} />
          New
        </button>
      </div>
      <ul role="list" className="p-2 space-y-0.5 max-h-[60vh] overflow-y-auto">
        {threads.map((t) => {
          const active = t.id === activeId;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => onSelect(t.id)}
                className="group relative w-full text-left px-3 py-2 rounded-lg transition-colors hover:bg-white/[0.04]"
                style={{
                  background: active ? "rgba(124,95,255,0.10)" : "transparent",
                  color: active ? TEXT_HI : TEXT_MID,
                }}
              >
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r"
                    style={{ background: VIOLET }}
                  />
                )}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0 flex-1">
                    <Hash
                      size={10}
                      className="shrink-0"
                      style={{ color: active ? VIOLET_2 : TEXT_LOW }}
                    />
                    <span
                      className="text-[12.5px] font-medium truncate"
                      style={{ color: TEXT_HI }}
                    >
                      {t.title}
                    </span>
                  </div>
                  <span
                    className="font-mono text-[9.5px] shrink-0 tabular-nums"
                    style={{ color: TEXT_LOW }}
                  >
                    {fmtRelHistory(t.updatedAt)}
                  </span>
                </div>
                <div
                  className="text-[11px] truncate mt-1 ml-4"
                  style={{ color: TEXT_LOW }}
                >
                  {t.preview}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SuggestionsRail({ prompts }: { prompts: string[] }) {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div
        className="flex items-center gap-2 px-4 h-11"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <Sparkles size={11} style={{ color: VIOLET_2 }} />
        <span
          className="font-mono text-[10px] uppercase tracking-[0.18em]"
          style={{ color: TEXT_LOW }}
        >
          Suggested prompts
        </span>
      </div>
      <ul role="list" className="p-2 space-y-1 max-h-[60vh] overflow-y-auto">
        {prompts.map((p, i) => (
          <motion.li
            key={p}
            initial={{ opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.22, delay: 0.04 * i }}
          >
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(
                  new CustomEvent("autotrade.chat.suggest", { detail: p }),
                );
              }}
              className="group w-full text-left px-3 py-2.5 rounded-lg text-[12px] leading-snug transition-all hover:bg-white/[0.05]"
              style={{
                background: "rgba(255,255,255,0.02)",
                color: TEXT_MID,
                border: `1px solid ${LINE_2}`,
              }}
            >
              <div className="flex items-start gap-2">
                <MessageSquare
                  size={11}
                  className="mt-0.5 shrink-0 transition-colors group-hover:text-white/80"
                  style={{ color: TEXT_LOW }}
                />
                <span className="flex-1" style={{ color: TEXT_HI }}>{p}</span>
                <ChevronRight
                  size={11}
                  className="mt-0.5 shrink-0 opacity-40 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
                  style={{ color: VIOLET_2 }}
                />
              </div>
            </button>
          </motion.li>
        ))}
      </ul>
      <div
        className="px-4 py-3 text-[11px] leading-snug flex items-start gap-2"
        style={{ borderTop: `1px solid ${LINE}`, color: TEXT_LOW }}
      >
        <Sparkles size={10} className="mt-0.5 shrink-0" style={{ color: VIOLET_2 }} />
        <span>
          Replies use autotrade&apos;s filing record and AI-mind portfolios. Not investment advice.
        </span>
      </div>
    </div>
  );
}
