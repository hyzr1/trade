// app/digest/page.tsx
"use client";
import { useState } from "react";
import {
  Mail,
  Send,
  Calendar,
  Sparkles,
  Users,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { useToast } from "@/components/ui/Toaster";
import {
  BG_2,
  LINE,
  LINE_2,
  NEGATIVE,
  POSITIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";

export default function DigestPage() {
  const { toast } = useToast();
  const [subscribed, setSubscribed] = useState(false);

  const sendToMyInbox = () => {
    toast("Sent! Check demo@autotrade.app", {
      variant: "success",
      description: "Delivery confirmed. Live email goes out at 7am ET daily.",
    });
  };

  return (
    <DeskShell breadcrumb="Daily digest">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: TEXT_HI }}>
            Daily digest
          </h1>
          <p className="text-[13px] mt-1" style={{ color: TEXT_MID }}>
            Preview tomorrow morning&apos;s edition.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 cursor-pointer transition-colors hover:bg-white/[0.04]"
            style={{ border: `1px solid ${LINE_2}` }}
          >
            <input
              type="checkbox"
              checked={subscribed}
              onChange={(e) => setSubscribed(e.target.checked)}
              className="sr-only"
            />
            <span
              className="relative inline-flex items-center w-7 h-4 rounded-full transition-colors"
              style={{
                background: subscribed ? VIOLET : "rgba(255,255,255,0.10)",
                border: `1px solid ${subscribed ? "rgba(124,95,255,0.6)" : LINE_2}`,
              }}
            >
              <span
                className="absolute top-[1px] w-3 h-3 rounded-full transition-all"
                style={{
                  left: subscribed ? "calc(100% - 14px)" : "1px",
                  background: "#fff",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
                }}
              />
            </span>
            <span className="text-[12.5px]" style={{ color: TEXT_MID }}>
              Subscribe to daily
            </span>
          </label>
          <button
            onClick={sendToMyInbox}
            className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-1.5 text-[12.5px] font-medium transition-all hover:brightness-110"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
              color: "#fff",
              boxShadow:
                "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            <Send size={13} /> Send to my inbox
          </button>
        </div>
      </div>

      {/* Email mockup */}
      <div className="max-w-2xl mx-auto">
        <EmailCard />
      </div>

      {/* Below explainer */}
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <p className="text-[13.5px] leading-relaxed" style={{ color: TEXT_MID }}>
          What you get every morning at <span className="font-mono" style={{ color: TEXT_HI }}>7:00am ET</span>.
          Free for now. Stays free for everyone on Reader. Pros get the dispatch <span style={{ color: VIOLET_2 }}>30 minutes earlier</span>.
        </p>
      </div>
    </DeskShell>
  );
}

/* ───────────────────────── Email card ───────────────────────── */

function EmailCard() {
  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: "#fff",
        color: "#1a1530",
        boxShadow: "0 60px 160px -30px rgba(0,0,0,0.85), 0 0 0 1px rgba(255,255,255,0.06)",
      }}
    >
      {/* Email client chrome */}
      <EmailHeader />

      {/* Email body */}
      <div className="p-6 sm:p-10">
        {/* Brand bar */}
        <div
          className="flex items-center gap-2.5 mb-7 pb-4"
          style={{ borderBottom: "1px solid rgba(8,6,15,0.06)" }}
        >
          <span className="flex flex-col">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.22em]"
              style={{ color: "rgba(8,6,15,0.45)" }}
            >
              The Disclosure
            </span>
            <span
              className="text-[16px] font-semibold tracking-tight leading-none mt-0.5"
              style={{
                color: "#08060F",
                fontFamily: "var(--font-display), Fraunces, serif",
              }}
            >
              Issue №<span className="tabular-nums">04</span>
            </span>
          </span>
          <span
            className="ml-auto inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "rgba(8,6,15,0.50)" }}
          >
            <Calendar size={10} />
            Wed, Jan 22
          </span>
        </div>

        {/* Editorial headline */}
        <h1
          className="text-[28px] sm:text-[32px] font-semibold leading-[1.12] tracking-tight"
          style={{
            color: "#08060F",
            fontFamily: "var(--font-display), Fraunces, serif",
          }}
        >
          Pelosi loaded <span style={{ color: VIOLET }}>$5M of NVDA</span>.
          <br />
          Three of four minds agreed.
        </h1>
        <p
          className="mt-4 text-[14.5px] leading-relaxed"
          style={{ color: "rgba(8,6,15,0.65)" }}
        >
          Your Wednesday dispatch — what Congress traded yesterday, who the AI
          minds rotated with, and one anomaly worth your attention.
        </p>

        {/* Cover illustration */}
        <CapitolIllustration />

        {/* TODAY'S BIG MOVES */}
        <SectionLabel label="Today's big moves" icon={<Users size={11} />} />
        <div className="mt-3 space-y-2.5">
          <FilingRow
            avatar="NP"
            name="Nancy Pelosi"
            party="D"
            chamber="House"
            side="buy"
            ticker="NVDA"
            bracket="$5M – $25M"
          />
          <FilingRow
            avatar="JG"
            name="Josh Gottheimer"
            party="D"
            chamber="House"
            side="buy"
            ticker="LMT"
            bracket="$50K – $100K"
          />
          <FilingRow
            avatar="KH"
            name="Kevin Hern"
            party="R"
            chamber="House"
            side="sell"
            ticker="META"
            bracket="$15K – $50K"
          />
        </div>

        {/* AI CONSENSUS */}
        <SectionLabel label="AI consensus" icon={<Sparkles size={11} />} />
        <ConsensusCard />

        {/* QUICK STATS */}
        <SectionLabel label="Quick stats" />
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3">
          <StatTile label="Filings" value="14" sub="today" />
          <StatTile label="Buy / Sell" value="9 / 5" sub="ratio" />
          <StatTile label="Avg lag" value="32d" sub="disclosure" />
          <StatTile label="Beats SPY" value="5 / 7" sub="leaderboard" />
        </div>

        {/* ANOMALIES */}
        <SectionLabel label="Anomalies" icon={<AlertTriangle size={11} />} />
        <div className="mt-3 space-y-2.5">
          <AnomalyRow
            tag="Cluster"
            title="Defense sector: 5 senators filed within 72h"
            body="LMT, RTX, GD all received bipartisan buys after the Pentagon supplemental announcement. Score 2.4σ above baseline."
            href="/radar"
          />
          <AnomalyRow
            tag="Drift"
            title="Greene's small-caps disclosed 47 days late"
            body="MTG's energy and materials buys averaged 47 days from trade to disclosure — 13 days above her 6-month average."
            href="/greene"
          />
        </div>

        {/* CTA */}
        <div
          className="mt-8 p-5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(124,95,255,0.08) 0%, rgba(167,139,250,0.04) 100%)",
            border: "1px solid rgba(124,95,255,0.18)",
          }}
        >
          <div className="text-[13px] font-medium" style={{ color: "#08060F" }}>
            Read the full edition on the desk.
          </div>
          <div
            className="mt-1 text-[12.5px]"
            style={{ color: "rgba(8,6,15,0.60)" }}
          >
            Charts, AI grids, holdings tables, and the firehose — all live, all sub-30s.
          </div>
          <div
            className="mt-3 inline-flex items-center gap-1.5 text-[12.5px] font-medium"
            style={{ color: VIOLET }}
          >
            Open the desk <ChevronRight size={12} />
          </div>
        </div>

        {/* Footer */}
        <div
          className="mt-10 pt-6 text-center"
          style={{ borderTop: "1px solid rgba(8,6,15,0.08)" }}
        >
          <div className="inline-flex items-center justify-center gap-2 mb-3">
            <span
              className="inline-flex items-center justify-center w-6 h-6 rounded-md"
              style={{ background: "#08060F" }}
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path
                  d="M4 18 L12 4 L20 18 M7.5 13.5 L16.5 13.5"
                  stroke="#fff"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: "rgba(8,6,15,0.50)" }}
            >
              autotrade · the disclosure
            </span>
          </div>

          {/* Social row */}
          <div className="flex items-center justify-center gap-2 mb-4">
            {[
              { label: "X", path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.815L4.99 21.75H1.68l7.731-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.083 4.126H5.117l11.966 15.644Z" },
              { label: "LI", path: "M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.05-1.86-3.05-1.86 0-2.15 1.45-2.15 2.95v5.67H9.34V9h3.41v1.56h.05c.48-.9 1.64-1.86 3.38-1.86 3.61 0 4.28 2.38 4.28 5.47v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z" },
            ].map((s) => (
              <a
                key={s.label}
                href="#"
                className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:opacity-100"
                style={{
                  background: "rgba(8,6,15,0.06)",
                  color: "rgba(8,6,15,0.55)",
                  opacity: 0.8,
                }}
                aria-label={s.label}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d={s.path} />
                </svg>
              </a>
            ))}
            <a
              href="#"
              className="inline-flex items-center justify-center w-7 h-7 rounded-full transition-colors hover:opacity-100"
              style={{
                background: "rgba(8,6,15,0.06)",
                color: "rgba(8,6,15,0.55)",
                opacity: 0.8,
              }}
              aria-label="Web"
            >
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
                <circle cx="12" cy="12" r="9" />
                <path d="M3 12h18M12 3a14 14 0 010 18M12 3a14 14 0 000 18" />
              </svg>
            </a>
          </div>

          <p
            className="text-[11.5px] leading-relaxed max-w-md mx-auto"
            style={{ color: "rgba(8,6,15,0.55)" }}
          >
            You&apos;re receiving this because you subscribed at autotrade.app. Not
            investment advice. Filings sourced from the House Clerk and Senate eFD.
          </p>
          <div
            className="mt-2.5 text-[10.5px]"
            style={{ color: "rgba(8,6,15,0.40)" }}
          >
            autotrade, inc · 548 Market St #87432 · San Francisco, CA 94104
          </div>
          <div
            className="mt-3 flex items-center justify-center gap-3 text-[11px]"
            style={{ color: "rgba(8,6,15,0.55)" }}
          >
            <a href="#" className="hover:underline" style={{ color: "rgba(8,6,15,0.65)" }}>Unsubscribe</a>
            <span style={{ color: "rgba(8,6,15,0.25)" }}>·</span>
            <a href="#" className="hover:underline" style={{ color: "rgba(8,6,15,0.65)" }}>Update preferences</a>
            <span style={{ color: "rgba(8,6,15,0.25)" }}>·</span>
            <a href="#" className="hover:underline" style={{ color: "rgba(8,6,15,0.65)" }}>View in browser</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailHeader() {
  return (
    <div style={{ background: "#F7F5F0", borderBottom: "1px solid rgba(8,6,15,0.08)" }}>
      {/* Top toolbar — fake Gmail-style chrome */}
      <div
        className="px-5 sm:px-7 py-2.5 flex items-center gap-2 text-[11px]"
        style={{
          borderBottom: "1px solid rgba(8,6,15,0.06)",
          color: "rgba(8,6,15,0.45)",
        }}
      >
        <span className="inline-flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "#16a34a" }} />
          Inbox
        </span>
        <span style={{ color: "rgba(8,6,15,0.30)" }}>·</span>
        <span style={{ color: "rgba(8,6,15,0.55)" }}>autotrade morning</span>
        <span className="ml-auto font-mono tabular-nums" style={{ color: "rgba(8,6,15,0.40)" }}>
          Wed, Jan 22 · 7:00 AM
        </span>
      </div>

      <div className="px-5 sm:px-7 py-4 flex items-start gap-3">
        {/* Sender avatar */}
        <span
          className="inline-flex items-center justify-center w-10 h-10 rounded-full shrink-0"
          style={{
            background: "#08060F",
            color: "#fff",
            boxShadow: "0 4px 12px -4px rgba(8,6,15,0.4)",
          }}
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path
              d="M4 18 L12 4 L20 18 M7.5 13.5 L16.5 13.5"
              stroke="#fff"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-[13.5px] font-semibold" style={{ color: "#08060F" }}>
              autotrade
            </span>
            <span className="text-[11.5px]" style={{ color: "rgba(8,6,15,0.50)" }}>
              &lt;morning@autotrade.app&gt;
            </span>
            <span
              className="ml-auto font-mono text-[10px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{
                background: "rgba(124,95,255,0.10)",
                color: "#5b3fd4",
              }}
            >
              Newsletter
            </span>
          </div>
          <div className="text-[15px] font-semibold mt-1 leading-tight" style={{ color: "#08060F" }}>
            What Congress traded yesterday · Jan 22
          </div>
          <div className="text-[12px] mt-0.5" style={{ color: "rgba(8,6,15,0.55)" }}>
            to <span style={{ color: "#08060F" }}>you@example.com</span>
          </div>
          <div className="text-[11.5px] mt-1.5 italic line-clamp-1" style={{ color: "rgba(8,6,15,0.55)" }}>
            Pelosi loaded $5M of NVDA. Three of four AI minds agreed. Plus a defense cluster…
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({
  label,
  icon,
}: {
  label: string;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="mt-8 flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.22em]"
      style={{ color: "rgba(8,6,15,0.55)" }}
    >
      {icon && <span style={{ color: VIOLET }}>{icon}</span>}
      {label}
      <span
        className="flex-1 ml-2 h-px"
        style={{ background: "rgba(8,6,15,0.08)" }}
      />
    </div>
  );
}

function FilingRow({
  avatar,
  name,
  party,
  chamber,
  side,
  ticker,
  bracket,
}: {
  avatar: string;
  name: string;
  party: "D" | "R" | "I";
  chamber: string;
  side: "buy" | "sell";
  ticker: string;
  bracket: string;
}) {
  const partyColor = party === "D" ? "#3b82f6" : party === "R" ? "#ef4444" : "#a3a3a3";
  const sideColor = side === "buy" ? "#16a34a" : "#dc2626";
  const sideBg = side === "buy" ? "rgba(22,163,74,0.10)" : "rgba(220,38,38,0.10)";
  return (
    <div
      className="flex items-center gap-3 p-3 rounded-lg"
      style={{
        background: "#fafafa",
        border: "1px solid rgba(8,6,15,0.06)",
      }}
    >
      <span
        className="inline-flex items-center justify-center w-9 h-9 rounded-full font-semibold text-[12px] shrink-0"
        style={{
          background: `${partyColor}1A`,
          color: partyColor,
          border: `1px solid ${partyColor}40`,
        }}
      >
        {avatar}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[13.5px] font-semibold" style={{ color: "#08060F" }}>
            {name}
          </span>
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-sm"
            style={{ background: `${partyColor}1A`, color: partyColor }}
          >
            {party} · {chamber}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2 flex-wrap text-[12px]">
          <span
            className="font-mono uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-sm font-semibold"
            style={{ background: sideBg, color: sideColor, fontSize: 10 }}
          >
            {side}
          </span>
          <span className="font-mono font-semibold" style={{ color: "#08060F" }}>
            {ticker}
          </span>
          <span style={{ color: "rgba(8,6,15,0.50)" }}>·</span>
          <span style={{ color: "rgba(8,6,15,0.65)" }}>{bracket}</span>
        </div>
      </div>
    </div>
  );
}

function ConsensusCard() {
  const minds = [
    { name: "GPT-5", holds: true },
    { name: "Claude", holds: true },
    { name: "Gemini", holds: true },
    { name: "Grok", holds: false },
  ];
  return (
    <div
      className="mt-3 p-4 rounded-lg"
      style={{
        background:
          "linear-gradient(135deg, rgba(124,95,255,0.05) 0%, rgba(167,139,250,0.02) 100%)",
        border: "1px solid rgba(124,95,255,0.18)",
      }}
    >
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="text-[14px] font-semibold" style={{ color: "#08060F" }}>
          NVDA
        </span>
        <span className="text-[12.5px]" style={{ color: "rgba(8,6,15,0.65)" }}>
          — 3 of 4 minds hold this name
        </span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {minds.map((m) => (
          <span
            key={m.name}
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px]"
            style={{
              background: m.holds ? "rgba(22,163,74,0.10)" : "rgba(8,6,15,0.06)",
              color: m.holds ? "#16a34a" : "rgba(8,6,15,0.55)",
              border: `1px solid ${m.holds ? "rgba(22,163,74,0.30)" : "rgba(8,6,15,0.10)"}`,
            }}
          >
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: m.holds ? "#16a34a" : "#cbd5e0" }}
            />
            {m.name}
          </span>
        ))}
      </div>
      <div
        className="mt-3 text-[12px] leading-relaxed"
        style={{ color: "rgba(8,6,15,0.65)" }}
      >
        Pelosi&apos;s buy aligns with the running AI consensus. Grok 4 has trimmed
        semis exposure 6pp this month and dissents.
      </div>
    </div>
  );
}

function StatTile({
  label,
  value,
  sub,
}: {
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div
      className="p-3 rounded-lg text-center"
      style={{
        background: "#fafafa",
        border: "1px solid rgba(8,6,15,0.06)",
      }}
    >
      <div
        className="font-mono text-[9.5px] uppercase tracking-[0.18em]"
        style={{ color: "rgba(8,6,15,0.45)" }}
      >
        {label}
      </div>
      <div
        className="mt-1 text-[20px] font-semibold tabular-nums tracking-tight"
        style={{ color: "#08060F" }}
      >
        {value}
      </div>
      <div className="text-[11px] mt-0.5" style={{ color: "rgba(8,6,15,0.50)" }}>
        {sub}
      </div>
    </div>
  );
}

function AnomalyRow({
  tag,
  title,
  body,
}: {
  tag: string;
  title: string;
  body: string;
  href: string;
}) {
  return (
    <div
      className="p-4 rounded-lg flex items-start gap-3"
      style={{
        background: "#fff",
        border: "1px solid rgba(247,210,74,0.30)",
        boxShadow: "0 0 0 1px rgba(247,210,74,0.10) inset",
      }}
    >
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm shrink-0 mt-0.5"
        style={{
          background: "rgba(247,210,74,0.18)",
          color: "#9a6a00",
          border: "1px solid rgba(247,210,74,0.35)",
        }}
      >
        {tag}
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold" style={{ color: "#08060F" }}>
          {title}
        </div>
        <div
          className="mt-1 text-[12px] leading-relaxed"
          style={{ color: "rgba(8,6,15,0.60)" }}
        >
          {body}
        </div>
      </div>
    </div>
  );
}

function CapitolIllustration() {
  return (
    <div
      className="mt-7 rounded-xl overflow-hidden relative"
      style={{
        background:
          "linear-gradient(180deg, #14102a 0%, #0a0815 100%)",
        border: "1px solid rgba(8,6,15,0.10)",
        aspectRatio: "16 / 7",
      }}
    >
      <svg viewBox="0 0 800 350" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <radialGradient id="halo" cx="50%" cy="62%" r="55%">
            <stop offset="0%" stopColor="#7C5FFF" stopOpacity="0.45" />
            <stop offset="55%" stopColor="#7C5FFF" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#7C5FFF" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="dome" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FAF7F2" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#7d7466" stopOpacity="0.90" />
          </linearGradient>
          <linearGradient id="chart" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F7D24A" stopOpacity="0" />
            <stop offset="50%" stopColor="#F7D24A" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#F7D24A" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chartArea" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#F7D24A" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#F7D24A" stopOpacity="0" />
          </linearGradient>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="0.5" />
          </pattern>
        </defs>

        {/* Backdrop layers */}
        <rect width="800" height="350" fill="#0a0815" />
        <rect width="800" height="350" fill="url(#grid)" />
        <ellipse cx="400" cy="220" rx="380" ry="200" fill="url(#halo)" />

        {/* Stars */}
        {[
          [120, 60, 1.4, 0.7], [180, 110, 1.0, 0.5], [620, 70, 1.6, 0.85],
          [680, 130, 1.0, 0.5], [220, 50, 1.2, 0.6], [560, 30, 1.4, 0.7],
          [720, 200, 1.0, 0.45], [80, 200, 1.2, 0.6], [740, 90, 1.4, 0.65],
          [60, 130, 1.0, 0.5], [340, 40, 1.0, 0.5], [460, 38, 1.2, 0.6],
        ].map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="#fff" opacity={o as number} />
        ))}

        {/* Soft chart "trade tape" arc behind capitol */}
        <path
          d="M 0 240 Q 200 180 400 220 T 800 200"
          fill="none"
          stroke="url(#chart)"
          strokeWidth="1.2"
          opacity="0.65"
        />
        <path
          d="M 0 240 Q 200 180 400 220 T 800 200 L 800 350 L 0 350 Z"
          fill="url(#chartArea)"
          opacity="0.6"
        />

        {/* Capitol silhouette — refined */}
        <g opacity="0.96">
          {/* Base platform */}
          <rect x="160" y="295" width="480" height="22" fill="url(#dome)" rx="1" />
          <rect x="180" y="280" width="440" height="15" fill="url(#dome)" />
          {/* Main building */}
          <rect x="200" y="240" width="400" height="40" fill="url(#dome)" />
          {/* Column shadows */}
          {Array.from({ length: 11 }).map((_, i) => (
            <rect
              key={i}
              x={210 + i * 36}
              y={244}
              width="6"
              height="32"
              fill="rgba(10,8,21,0.55)"
            />
          ))}
          {/* Center steps */}
          <polygon points="370,295 430,295 420,317 380,317" fill="rgba(10,8,21,0.45)" />
          {/* Pediment / triangular roof on center */}
          <polygon points="340,240 400,210 460,240" fill="url(#dome)" />
          {/* Drum */}
          <rect x="370" y="170" width="60" height="42" fill="url(#dome)" />
          {/* Column lines on drum */}
          {[378, 388, 398, 408, 418].map((x, i) => (
            <line key={i} x1={x} y1="174" x2={x} y2="208" stroke="rgba(10,8,21,0.45)" strokeWidth="0.8" />
          ))}
          {/* Dome */}
          <path d="M 360 170 Q 400 100 440 170 Z" fill="url(#dome)" />
          {/* Cupola */}
          <rect x="392" y="92" width="16" height="14" fill="url(#dome)" />
          <ellipse cx="400" cy="92" rx="10" ry="3" fill="url(#dome)" />
          <line x1="400" y1="70" x2="400" y2="88" stroke="#FAF7F2" strokeWidth="1.8" opacity="0.95" />
          {/* Crown / statue accent */}
          <circle cx="400" cy="68" r="3" fill="#F7D24A">
            <animate attributeName="opacity" values="0.7;1;0.7" dur="3.2s" repeatCount="indefinite" />
          </circle>
        </g>

        {/* Foreground ticker tape */}
        <g transform="translate(0, 332)" opacity="0.55">
          <text fontFamily="ui-monospace, monospace" fontSize="9" fill="#7C5FFF" letterSpacing="2">
            <tspan x="20">NVDA +2.4%</tspan>
            <tspan x="160">·</tspan>
            <tspan x="180">LMT +0.9%</tspan>
            <tspan x="290">·</tspan>
            <tspan x="310">META −1.2%</tspan>
            <tspan x="430">·</tspan>
            <tspan x="450">AVGO +1.7%</tspan>
            <tspan x="580">·</tspan>
            <tspan x="600">MSFT +0.5%</tspan>
          </text>
        </g>
      </svg>

      {/* Bottom inner shadow */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-12 pointer-events-none"
        style={{
          background: "linear-gradient(to top, rgba(10,8,21,0.85), transparent)",
        }}
      />
    </div>
  );
}
