// components/ai/ChatPanel.tsx
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUp, Paperclip, Sparkles, User as UserIcon, ChevronDown } from "lucide-react";
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
  makeId,
  replyFor,
  TYPING_DELAY_MS,
  type ChatMessage,
} from "@/lib/chat-mock";

type Model = "claude" | "gpt" | "gemini";
const MODELS: { id: Model; label: string }[] = [
  { id: "claude", label: "Claude" },
  { id: "gpt", label: "GPT-5" },
  { id: "gemini", label: "Gemini" },
];

export function ChatPanel({
  variant = "page",
  initialMessages,
  onSendOverride,
  hideHeader = false,
  className = "",
}: {
  variant?: "page" | "drawer";
  initialMessages?: ChatMessage[];
  /** Optional: override the assistant reply (for stub experiments). */
  onSendOverride?: (prompt: string) => string;
  hideHeader?: boolean;
  className?: string;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages ?? []);
  const [draft, setDraft] = useState("");
  const [typing, setTyping] = useState(false);
  const [model, setModel] = useState<Model>("claude");
  const [modelOpen, setModelOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Keep view pinned to bottom on new messages.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  // Close model picker on outside click.
  const modelPickerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (!modelOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (modelPickerRef.current && !modelPickerRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [modelOpen]);

  // Listen for suggested-prompt events from the side rail.
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (typeof detail === "string") send(detail);
    };
    window.addEventListener("autotrade.chat.suggest", handler);
    return () => window.removeEventListener("autotrade.chat.suggest", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [typing, onSendOverride]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text || typing) return;
    const userMsg: ChatMessage = {
      id: makeId(),
      role: "user",
      content: text,
      createdAt: Date.now(),
    };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setTyping(true);
    const reply = onSendOverride ? onSendOverride(text) : replyFor(text);
    window.setTimeout(() => {
      setMessages((m) => [
        ...m,
        {
          id: makeId(),
          role: "assistant",
          content: reply,
          createdAt: Date.now(),
        },
      ]);
      setTyping(false);
      // Refocus the textarea so the user can keep typing.
      inputRef.current?.focus();
    }, TYPING_DELAY_MS);
  };

  const isDrawer = variant === "drawer";

  return (
    <div className={`flex flex-col min-h-0 ${className}`}>
      {!hideHeader && (
        <div
          className="flex items-center gap-2.5 px-4 h-11 shrink-0"
          style={{ borderBottom: `1px solid ${LINE}` }}
        >
          <span
            className="inline-flex items-center justify-center w-6 h-6 rounded-md"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
              color: "#fff",
            }}
          >
            <Sparkles size={12} />
          </span>
          <span className="text-[13px] font-medium" style={{ color: TEXT_HI }}>
            Ask autotrade
          </span>
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
            style={{
              background: "rgba(124,95,255,0.18)",
              color: VIOLET_2,
            }}
          >
            Beta
          </span>
        </div>
      )}

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-5"
        style={{ minHeight: 0 }}
      >
        {messages.length === 0 ? (
          <EmptyHero onPick={send} compact={isDrawer} />
        ) : (
          <div className="space-y-5 pb-2">
            {messages.map((m) => (
              <Bubble key={m.id} message={m} compact={isDrawer} />
            ))}
            <AnimatePresence>
              {typing && <TypingBubble compact={isDrawer} />}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Composer */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(draft);
        }}
        className="shrink-0 p-3 sm:p-4"
        style={{ borderTop: `1px solid ${LINE}` }}
      >
        <div
          className="rounded-2xl p-2 flex flex-col gap-2"
          style={{
            background: "rgba(255,255,255,0.025)",
            border: `1px solid ${LINE_2}`,
          }}
        >
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(draft);
              }
            }}
            placeholder="Ask about a filing, ticker, or portfolio…"
            rows={isDrawer ? 2 : 3}
            className="w-full resize-none bg-transparent outline-none px-2 py-1.5 text-[13.5px] placeholder:opacity-50"
            style={{ color: TEXT_HI }}
          />
          <div className="flex items-center gap-2">
            {/* Model picker */}
            <div className="relative" ref={modelPickerRef}>
              <button
                type="button"
                onClick={() => setModelOpen((v) => !v)}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] transition-colors hover:bg-white/[0.05]"
                style={{
                  background: "rgba(124,95,255,0.10)",
                  border: `1px solid rgba(124,95,255,0.30)`,
                  color: VIOLET_2,
                }}
              >
                <Sparkles size={10} />
                {MODELS.find((m) => m.id === model)?.label}
                <ChevronDown size={10} />
              </button>
              {modelOpen && (
                <div
                  className="absolute bottom-full mb-2 left-0 w-32 rounded-lg p-1 z-10"
                  style={{
                    background: BG_2,
                    border: `1px solid ${LINE_2}`,
                    boxShadow: "0 20px 60px -10px rgba(0,0,0,0.7)",
                  }}
                >
                  {MODELS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        setModel(m.id);
                        setModelOpen(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded text-[12px] transition-colors hover:bg-white/5"
                      style={{
                        color: model === m.id ? VIOLET_2 : TEXT_MID,
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Attach */}
            <button
              type="button"
              aria-label="Attach file"
              className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:bg-white/[0.05]"
              style={{ color: TEXT_LOW }}
            >
              <Paperclip size={13} />
            </button>

            <div className="ml-auto flex items-center gap-2">
              <span
                className="hidden sm:inline font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: TEXT_LOW }}
              >
                Enter to send
              </span>
              <button
                type="submit"
                disabled={!draft.trim() || typing}
                aria-label="Send message"
                className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                style={{
                  background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
                  color: "#fff",
                  boxShadow: "0 8px 24px -8px rgba(124,95,255,0.55)",
                }}
              >
                <ArrowUp size={14} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

/* ───────────────────────── Bubble ───────────────────────── */

function Bubble({
  message,
  compact = false,
}: {
  message: ChatMessage;
  compact?: boolean;
}) {
  const isUser = message.role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
      className={`flex gap-3 ${isUser ? "justify-end" : ""}`}
    >
      {!isUser && <Avatar role="assistant" />}
      <div
        className={`max-w-[88%] sm:max-w-[78%] rounded-2xl px-4 py-3 ${
          compact ? "text-[12.5px]" : "text-[13.5px]"
        } leading-relaxed`}
        style={{
          background: isUser
            ? "rgba(124,95,255,0.12)"
            : "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)",
          border: `1px solid ${isUser ? "rgba(124,95,255,0.28)" : LINE_2}`,
          color: TEXT_HI,
          borderTopLeftRadius: isUser ? 16 : 6,
          borderTopRightRadius: isUser ? 6 : 16,
        }}
      >
        <Markdown text={message.content} />
      </div>
      {isUser && <Avatar role="user" />}
    </motion.div>
  );
}

function TypingBubble({ compact = false }: { compact?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.14 } }}
      className="flex gap-3"
    >
      <Avatar role="assistant" />
      <div
        className={`inline-flex items-center gap-1.5 rounded-2xl px-4 py-3 ${
          compact ? "text-[12.5px]" : "text-[13.5px]"
        }`}
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.02) 100%)",
          border: `1px solid ${LINE_2}`,
          borderTopLeftRadius: 6,
        }}
        aria-label="Thinking"
      >
        <Dot delay={0} />
        <Dot delay={0.18} />
        <Dot delay={0.36} />
      </div>
    </motion.div>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="inline-block w-1.5 h-1.5 rounded-full"
      style={{ background: VIOLET_2 }}
      animate={{
        y: [0, -4, 0],
        opacity: [0.35, 1, 0.35],
        scale: [0.85, 1, 0.85],
      }}
      transition={{
        duration: 1.05,
        repeat: Infinity,
        ease: [0.45, 0, 0.55, 1],
        delay,
      }}
    />
  );
}

function Avatar({ role }: { role: "user" | "assistant" }) {
  if (role === "assistant") {
    return (
      <span
        className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full"
        style={{
          background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
          color: "#fff",
          boxShadow: "0 6px 18px -8px rgba(124,95,255,0.55)",
        }}
        aria-hidden
      >
        <Sparkles size={13} />
      </span>
    );
  }
  return (
    <span
      className="shrink-0 inline-flex items-center justify-center w-8 h-8 rounded-full"
      style={{
        background: "rgba(255,255,255,0.06)",
        border: `1px solid ${LINE_2}`,
        color: TEXT_MID,
      }}
      aria-hidden
    >
      <UserIcon size={13} />
    </span>
  );
}

/* ───────────────────────── Markdown ───────────────────────── */

/** Bare-minimum Markdown renderer that handles **bold**, `code`, "- " bullets,
 *  "> " blockquotes, fenced code blocks, and double-newline paragraph breaks. */
function Markdown({ text }: { text: string }) {
  // Split paragraphs on blank lines.
  const paragraphs = text.split(/\n\n+/);
  return (
    <div className="space-y-2.5">
      {paragraphs.map((p, i) => {
        const trimmed = p.trim();
        // Fenced code block: ```language\n...\n```
        if (trimmed.startsWith("```") && trimmed.endsWith("```")) {
          const inner = trimmed.replace(/^```\w*\n?/, "").replace(/\n?```$/, "");
          return (
            <pre
              key={i}
              className="rounded-lg p-3 font-mono text-[12px] leading-relaxed overflow-x-auto"
              style={{
                background: "rgba(8,6,15,0.55)",
                border: `1px solid ${LINE_2}`,
                color: TEXT_HI,
              }}
            >
              {inner}
            </pre>
          );
        }
        const lines = p.split(/\n/);
        const allBullets = lines.every((l) => l.trim().startsWith("- "));
        const allQuote = lines.every((l) => l.trim().startsWith("> "));
        if (allBullets) {
          return (
            <ul key={i} className="space-y-1 ml-0.5" style={{ color: TEXT_MID }}>
              {lines.map((l, j) => (
                <li
                  key={j}
                  className="leading-relaxed flex items-start gap-2"
                >
                  <span
                    aria-hidden
                    className="inline-block w-1 h-1 rounded-full shrink-0 mt-[8px]"
                    style={{ background: VIOLET_2 }}
                  />
                  <span className="flex-1">
                    <InlineFmt text={l.replace(/^-\s+/, "")} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }
        if (allQuote) {
          return (
            <blockquote
              key={i}
              className="pl-3 py-1 italic leading-relaxed"
              style={{
                borderLeft: `2px solid ${VIOLET_2}`,
                color: TEXT_MID,
              }}
            >
              {lines.map((l, j) => (
                <div key={j}>
                  <InlineFmt text={l.replace(/^>\s+/, "")} />
                </div>
              ))}
            </blockquote>
          );
        }
        return (
          <p key={i} className="leading-relaxed" style={{ color: TEXT_HI }}>
            <InlineFmt text={p} />
          </p>
        );
      })}
    </div>
  );
}

function InlineFmt({ text }: { text: string }) {
  // Bold **x**, code `x`. Iterate, preserve order.
  const parts: { kind: "text" | "bold" | "code"; v: string }[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) parts.push({ kind: "text", v: text.slice(last, m.index) });
    const tok = m[0];
    if (tok.startsWith("**")) parts.push({ kind: "bold", v: tok.slice(2, -2) });
    else parts.push({ kind: "code", v: tok.slice(1, -1) });
    last = m.index + tok.length;
  }
  if (last < text.length) parts.push({ kind: "text", v: text.slice(last) });
  return (
    <>
      {parts.map((p, i) => {
        if (p.kind === "bold") {
          return (
            <strong
              key={i}
              className="font-semibold"
              style={{ color: TEXT_HI }}
            >
              {p.v}
            </strong>
          );
        }
        if (p.kind === "code") {
          return (
            <code
              key={i}
              className="font-mono text-[12px] px-1 py-0.5 rounded"
              style={{
                background: "rgba(124,95,255,0.10)",
                color: VIOLET_2,
              }}
            >
              {p.v}
            </code>
          );
        }
        return <span key={i}>{p.v}</span>;
      })}
    </>
  );
}

/* ───────────────────────── Empty hero ───────────────────────── */

function EmptyHero({
  onPick,
  compact = false,
}: {
  onPick: (prompt: string) => void;
  compact?: boolean;
}) {
  const tips = useMemo(
    () => [
      "What did Pelosi buy this month?",
      "Compare Hern vs Gottheimer",
      "Which AI minds agreed on NVDA?",
      "Find anomalous cluster trades",
    ],
    [],
  );
  return (
    <div className="h-full flex flex-col items-center justify-center text-center px-2 py-6">
      <span
        className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
        style={{
          background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
          color: "#fff",
          boxShadow: "0 14px 36px -10px rgba(124,95,255,0.55)",
        }}
      >
        <Sparkles size={18} />
      </span>
      <h2
        className={`font-semibold tracking-tight ${
          compact ? "text-[16px]" : "text-[22px]"
        }`}
        style={{ color: TEXT_HI }}
      >
        Ask autotrade
      </h2>
      <p
        className="mt-2 text-[12.5px] max-w-sm leading-relaxed"
        style={{ color: TEXT_MID }}
      >
        Ask about filings, portfolios, AI consensus, or anomalies. Replies use real autotrade data.
      </p>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-md">
        {tips.map((t) => (
          <button
            key={t}
            onClick={() => onPick(t)}
            className="rounded-full px-3 py-1.5 text-[11.5px] transition-colors hover:bg-white/[0.05]"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${LINE_2}`,
              color: TEXT_MID,
            }}
          >
            {t}
          </button>
        ))}
      </div>
    </div>
  );
}
