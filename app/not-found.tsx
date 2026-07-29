// app/not-found.tsx — branded 404.
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowUpRight,
  FileSearch,
  Search,
  Sparkles,
} from "lucide-react";
import {
  BG,
  LINE_2,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  VIOLET_DEEP,
  YELLOW,
} from "@/lib/theme";

const POPULAR = [
  { href: "/terminal", label: "Desk" },
  { href: "/pelosi", label: "Pelosi" },
  { href: "/#pricing", label: "Pricing" },
];

const DID_YOU_MEAN = [
  { href: "/pelosi", label: "/pelosi" },
  { href: "/terminal", label: "/terminal" },
  { href: "/insights", label: "/insights" },
];

export default function NotFound() {
  const router = useRouter();
  const [q, setQ] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = q.trim();
    if (!trimmed) {
      router.push("/terminal");
      return;
    }
    router.push(`/terminal?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <main
      className="min-h-screen relative flex flex-col items-center justify-center px-6 overflow-hidden"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <BgGlow />
      <Scanlines />

      <Link
        href="/terminal"
        className="absolute top-6 left-6 inline-flex items-center gap-2 text-[12.5px] transition-colors hover:text-white"
        style={{ color: TEXT_LOW }}
      >
        <ArrowLeft size={13} />
        Back to desk
      </Link>

      <div className="relative z-10 w-full max-w-xl mx-auto text-center">
        {/* FileSearch icon hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-7"
          style={{
            background: "rgba(124,95,255,0.10)",
            border: `1px solid rgba(124,95,255,0.30)`,
            boxShadow:
              "0 14px 36px -10px rgba(124,95,255,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
          }}
        >
          <FileSearch size={26} style={{ color: VIOLET_2 }} />
        </motion.div>

        {/* 404 number with subtitle */}
        <motion.div
          aria-hidden
          className="display select-none relative"
          initial={{ opacity: 0, y: 18 }}
          animate={{
            opacity: 1,
            y: [0, -8, 0],
          }}
          transition={{
            opacity: { duration: 0.5 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", repeatType: "loop", delay: 0.3 },
          }}
          style={{
            fontSize: "clamp(110px, 22vw, 200px)",
            lineHeight: 0.85,
            background: `linear-gradient(180deg, ${TEXT_HI} 0%, rgba(255,255,255,0.12) 100%)`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            letterSpacing: "-0.04em",
          }}
        >
          404
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.5 }}
          className="-mt-2"
        >
          <div
            className="display-italic text-[24px] sm:text-[28px]"
            style={{
              color: TEXT_HI,
              lineHeight: 1.1,
              fontFamily: "var(--font-display), Fraunces, serif",
            }}
          >
            Filing not found.
          </div>
          <div
            className="mt-3 inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em]"
            style={{ color: TEXT_LOW }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: YELLOW }}
            />
            Filed by · the void · 404
          </div>
          <p className="mt-4 text-[13.5px] leading-relaxed max-w-md mx-auto" style={{ color: TEXT_MID }}>
            The URL probably moved, or the disclosure was redacted. Try a search,
            or jump to one of these pages.
          </p>
        </motion.div>

        <motion.form
          onSubmit={submit}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28, duration: 0.5 }}
          className="mt-7 mx-auto flex items-center max-w-md rounded-full pl-4 pr-1.5 py-1.5"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: `1px solid ${LINE_2}`,
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          <Search size={14} style={{ color: TEXT_LOW }} />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search ticker, member, or filing…"
            className="ml-2.5 flex-1 bg-transparent outline-none text-[13px] py-1.5"
            style={{ color: TEXT_HI }}
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] font-medium transition-all hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_DEEP} 100%)`,
              color: "#fff",
              boxShadow:
                "0 10px 24px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            Search
          </button>
        </motion.form>

        {/* Did you mean */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.40, duration: 0.5 }}
          className="mt-6"
        >
          <div
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] mb-2"
            style={{ color: TEXT_LOW }}
          >
            <Sparkles size={10} style={{ color: VIOLET_2 }} />
            Did you mean
          </div>
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            {DID_YOU_MEAN.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 font-mono text-[11.5px] transition-colors hover:bg-white/[0.08]"
                style={{
                  background: "rgba(124,95,255,0.08)",
                  border: `1px solid rgba(124,95,255,0.22)`,
                  color: VIOLET_2,
                }}
              >
                {p.label}
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.50, duration: 0.5 }}
          className="mt-6 flex flex-wrap items-center justify-center gap-2"
        >
          {POPULAR.map((p) => (
            <Link
              key={p.href}
              href={p.href}
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[12px] transition-colors hover:bg-white/[0.06]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${LINE_2}`,
                color: TEXT_HI,
              }}
            >
              {p.label}
              <ArrowUpRight size={11} style={{ color: TEXT_LOW }} />
            </Link>
          ))}
        </motion.div>

        <div
          className="mt-10 font-mono text-[10.5px] uppercase tracking-[0.18em]"
          style={{ color: TEXT_LOW }}
        >
          <span style={{ color: YELLOW }}>autotrade</span> · the disclosure · issue 04
        </div>
      </div>
    </main>
  );
}

function BgGlow() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(800px 460px at 20% -10%, rgba(124,95,255,0.18), transparent 60%),
            radial-gradient(720px 460px at 100% 20%, rgba(247,210,74,0.05), transparent 55%),
            radial-gradient(900px 600px at 50% 120%, rgba(79,57,216,0.18), transparent 60%)
          `,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.6) 0%, transparent 70%)",
        }}
      />
    </>
  );
}

function Scanlines() {
  return (
    <div
      aria-hidden
      className="absolute inset-0 pointer-events-none opacity-[0.06]"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, rgba(255,255,255,0.5) 0px, rgba(255,255,255,0.5) 1px, transparent 1px, transparent 3px)",
        maskImage:
          "radial-gradient(ellipse at 50% 30%, rgba(0,0,0,0.5) 0%, transparent 75%)",
      }}
    />
  );
}
