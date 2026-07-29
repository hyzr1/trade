// app/pricing/page.tsx
//
// Dedicated pricing page. Three tiers, full feature comparison table,
// pricing FAQ, and a big final CTA. Mirrors the landing page's pricing
// section but goes deeper.

import Link from "next/link";
import {
  Database, Bell, Zap, Code, Users, Check, Minus, ShieldCheck,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { TierCard, type Tier } from "@/components/marketing/TierCard";
import {
  BG, BG_2, VIOLET, VIOLET_2, VIOLET_GRAD, VIOLET_GLOW, YELLOW,
  TEXT_HI, TEXT_MID, TEXT_LOW, LINE, LINE_2,
} from "@/lib/theme";

export const revalidate = 3600;

/* ─── Data ────────────────────────────────────────────────────────────── */
const TIERS: Tier[] = [
  {
    name: "Reader", price: "$0", cadence: "always free", tag: "For the curious.",
    perks: [
      "Today's filings + consensus",
      "All 538 lawmakers, last 30 days",
      "Source-linked PTR PDFs",
      "Public roster pages",
    ],
    featured: false,
    cta: { label: "Start reading", href: "/terminal" },
  },
  {
    name: "Professional", price: "$39", cadence: "per month", tag: "For traders, researchers, journalists.",
    perks: [
      "Everything in Reader",
      "Full archive (2014 — present)",
      "CSV / Parquet exports",
      "Webhooks + email alerts",
      "Filing-date-basis backtester",
      "Priority sub-30s feed",
    ],
    featured: true,
    cta: { label: "Start Pro — 7 days money back", href: "/terminal" },
  },
  {
    name: "Institutional", price: "$129", cadence: "per seat / month", tag: "For desks and newsrooms with 5+.",
    perks: [
      "Everything in Professional",
      "Team seats + SAML SSO",
      "API access · 10K req/day",
      "Custom roster lists",
      "Dedicated Slack channel",
      "SLA & invoicing",
    ],
    featured: false,
    cta: { label: "Talk to sales", href: "mailto:sales@autotrade.app" },
  },
];

/* Feature comparison rows. Each cell is true / false / string. */
type Cell = true | false | string;
type Row = {
  icon: React.ReactNode;
  feature: string;
  detail?: string;
  cells: [Cell, Cell, Cell]; // Reader, Pro, Institutional
};

const COMPARE_GROUPS: { title: string; rows: Row[] }[] = [
  {
    title: "Data access",
    rows: [
      { icon: <Database size={14} />, feature: "Lawmakers indexed",          cells: ["538 / partial Senate", "All 538", "All 538"] },
      { icon: <Database size={14} />, feature: "Historical archive",          cells: ["Last 30 days", "2014 — present", "2014 — present"] },
      { icon: <Database size={14} />, feature: "Source-linked PTRs",         cells: [true, true, true] },
      { icon: <Database size={14} />, feature: "Bulk CSV / Parquet exports", cells: [false, true, true] },
      { icon: <Database size={14} />, feature: "Custom roster lists",         cells: [false, false, true] },
    ],
  },
  {
    title: "Alerts & monitoring",
    rows: [
      { icon: <Bell size={14} />, feature: "Email alerts on concurrence",     cells: [false, true, true] },
      { icon: <Bell size={14} />, feature: "Webhooks (signed)",                cells: [false, true, true] },
      { icon: <Bell size={14} />, feature: "Slack notifications",              cells: [false, true, true] },
      { icon: <Bell size={14} />, feature: "Dedicated Slack channel",          cells: [false, false, true] },
    ],
  },
  {
    title: "Latency & throughput",
    rows: [
      { icon: <Zap size={14} />, feature: "Filing-to-feed latency",            cells: ["< 5 min", "< 30 sec", "< 30 sec"] },
      { icon: <Zap size={14} />, feature: "Firehose WebSocket",                cells: [false, "Read-only", "Full"] },
      { icon: <Zap size={14} />, feature: "API rate limit",                    cells: ["—", "1K req/day", "10K req/day"] },
    ],
  },
  {
    title: "Developer",
    rows: [
      { icon: <Code size={14} />, feature: "REST API access",                  cells: [false, true, true] },
      { icon: <Code size={14} />, feature: "Filing-date-basis backtester",     cells: [false, true, true] },
      { icon: <Code size={14} />, feature: "Sandbox environment",              cells: [false, true, true] },
    ],
  },
  {
    title: "Team & support",
    rows: [
      { icon: <Users size={14} />, feature: "Seats included",                  cells: ["1", "1", "5+"] },
      { icon: <Users size={14} />, feature: "SAML / Okta SSO",                 cells: [false, false, true] },
      { icon: <Users size={14} />, feature: "Audit log",                       cells: [false, false, true] },
      { icon: <Users size={14} />, feature: "SLA & invoicing",                 cells: [false, false, true] },
    ],
  },
];

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "Is there a free trial of Professional?",
    a: "Yes — Professional ships with a 7-day money-back guarantee. Charge first, refund any time inside the first week, no questions asked.",
  },
  {
    q: "Do I have to commit annually?",
    a: "No. Both Professional and Institutional bill monthly by default. We offer 20% off when you switch to annual billing.",
  },
  {
    q: "Can I switch tiers later?",
    a: "Upgrade or downgrade any time from Settings → Billing. Upgrades are pro-rated to the current cycle; downgrades take effect at the next renewal.",
  },
  {
    q: "What forms of payment do you take?",
    a: "All major cards via Stripe. Institutional plans can pay by ACH or invoiced wire — net-30 with a signed order form.",
  },
  {
    q: "Do you offer a student or journalist discount?",
    a: "50% off Professional for verified .edu emails. Comped Professional for full-time journalists at recognized publications — write to press@autotrade.app.",
  },
  {
    q: "What happens to my data if I cancel?",
    a: "Your account is preserved for 30 days in case you come back. After 30 days we hard-delete personal data. Exports remain downloadable until cancellation takes effect.",
  },
];

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function PricingPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <PublicHeader />

      {/* HERO */}
      <section className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[460px] rounded-full blur-[110px] opacity-50"
            style={{ background: `radial-gradient(circle, ${VIOLET}66, transparent 60%)` }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 pt-20 sm:pt-28 pb-8 text-center">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
            Plans · billed in USD
          </div>
          <h1
            className="mt-5 font-semibold tracking-[-0.04em] leading-[0.97] text-[44px] sm:text-[64px] lg:text-[80px]"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}
          >
            Simple pricing.
          </h1>
          <p className="mt-6 max-w-xl mx-auto text-[16.5px] leading-[1.6]" style={{ color: TEXT_MID }}>
            Three tiers. No hidden quotas. No long-term commits. Cancel any time.
          </p>
        </div>
      </section>

      {/* TIER CARDS */}
      <section className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-10 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {TIERS.map((t) => <TierCard key={t.name} tier={t} />)}
        </div>
      </section>

      {/* COMPARE */}
      <section
        id="compare"
        className="scroll-mt-24"
        style={{ borderTop: `1px solid ${LINE}`, background: BG_2 }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-16 sm:py-24">
          <div className="text-center mb-12">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
              Detailed comparison
            </div>
            <h2
              className="mt-4 font-semibold tracking-[-0.03em] text-[32px] sm:text-[48px]"
              style={{ fontFamily: "var(--font-display)", color: "#fff" }}
            >
              Everything, side by side.
            </h2>
          </div>

          <div
            className="rounded-2xl overflow-hidden"
            style={{ background: BG, border: `1px solid ${LINE_2}` }}
          >
            {/* Header row */}
            <div
              className="grid grid-cols-[1fr_90px_90px_110px] sm:grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 sm:px-6 py-4 items-baseline"
              style={{ background: "rgba(255,255,255,0.025)", borderBottom: `1px solid ${LINE}` }}
            >
              <div className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
                Feature
              </div>
              <div className="text-center font-semibold text-[13px] sm:text-[15px]" style={{ color: "#fff" }}>Reader</div>
              <div className="text-center font-semibold text-[13px] sm:text-[15px]" style={{ color: "#fff" }}>
                Pro
                <span className="ml-2 hidden sm:inline-flex items-center font-mono text-[9.5px] uppercase tracking-widest rounded-sm px-1.5 py-0.5"
                  style={{ background: `${VIOLET}30`, color: VIOLET_2, border: `1px solid ${VIOLET}50` }}>★</span>
              </div>
              <div className="text-center font-semibold text-[13px] sm:text-[15px]" style={{ color: "#fff" }}>Institutional</div>
            </div>

            {COMPARE_GROUPS.map((g, gi) => (
              <div key={g.title}>
                <div
                  className="px-4 sm:px-6 py-2.5 font-mono text-[10.5px] uppercase tracking-[0.18em]"
                  style={{ background: "rgba(255,255,255,0.012)", color: VIOLET_2, borderTop: gi > 0 ? `1px solid ${LINE}` : "none" }}
                >
                  {g.title}
                </div>
                {g.rows.map((r, ri) => (
                  <div
                    key={r.feature}
                    className="grid grid-cols-[1fr_90px_90px_110px] sm:grid-cols-[2fr_1fr_1fr_1fr] gap-2 px-4 sm:px-6 py-3.5 items-center text-[13.5px]"
                    style={{ borderTop: ri > 0 ? `1px solid ${LINE}` : "none" }}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span style={{ color: TEXT_LOW }}>{r.icon}</span>
                      <span className="truncate" style={{ color: "#fff" }}>{r.feature}</span>
                    </div>
                    <CellRender value={r.cells[0]} />
                    <CellRender value={r.cells[1]} highlight />
                    <CellRender value={r.cells[2]} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING FAQ */}
      <section style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16 sm:py-24">
          <div className="text-center mb-10">
            <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
              Pricing FAQ
            </div>
            <h2 className="mt-4 font-semibold tracking-[-0.03em] text-[30px] sm:text-[42px]"
              style={{ fontFamily: "var(--font-display)", color: "#fff" }}>
              Quick answers.
            </h2>
          </div>

          <ul className="space-y-3">
            {FAQ_ITEMS.map((f) => (
              <li
                key={f.q}
                className="rounded-xl p-5"
                style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE_2}` }}
              >
                <div className="font-semibold text-[15.5px] tracking-tight" style={{ color: "#fff" }}>{f.q}</div>
                <p className="mt-2 text-[14.5px] leading-[1.6]" style={{ color: TEXT_MID }}>{f.a}</p>
              </li>
            ))}
          </ul>

          <div className="mt-8 text-center text-[13px]" style={{ color: TEXT_MID }}>
            More questions?{" "}
            <Link href="/faq" className="underline underline-offset-2 hover:text-white" style={{ color: "#fff" }}>
              Full FAQ
            </Link>
            {" "}·{" "}
            <a href="mailto:hello@autotrade.app" className="underline underline-offset-2 hover:text-white" style={{ color: "#fff" }}>
              hello@autotrade.app
            </a>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative overflow-hidden" style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full blur-[140px] opacity-40"
            style={{ background: `radial-gradient(circle, ${VIOLET}66, transparent 60%)` }}
          />
        </div>
        <div className="relative max-w-[1100px] mx-auto px-6 lg:px-12 py-20 sm:py-28 text-center">
          <h2
            className="font-semibold tracking-[-0.03em] text-[40px] sm:text-[64px] leading-[1.02]"
            style={{ fontFamily: "var(--font-display)", color: "#fff" }}
          >
            Start Pro.
          </h2>
          <p className="mt-4 text-[16.5px]" style={{ color: TEXT_MID }}>
            Seven days money back. One click cancel. Real-money execution coming late 2026.
          </p>
          <div className="mt-9 flex flex-wrap gap-3 justify-center">
            <Link
              href="/terminal"
              className="inline-flex items-center gap-1.5 rounded-full px-6 py-3.5 text-[14px] font-medium tracking-tight"
              style={{ background: VIOLET_GRAD, color: "#fff", boxShadow: VIOLET_GLOW }}
            >
              Start Pro — 7 days money back <span aria-hidden>→</span>
            </Link>
            <Link
              href="/docs"
              className="inline-flex items-center gap-1.5 rounded-full px-6 py-3.5 text-[14px] font-medium"
              style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: `1px solid ${LINE_2}` }}
            >
              Read the docs
            </Link>
          </div>
          <div className="mt-7 inline-flex items-center gap-2 text-[12px]" style={{ color: TEXT_LOW }}>
            <ShieldCheck size={14} style={{ color: VIOLET_2 }} />
            Backed by Stripe. SOC 2 in progress. No data sharing, ever.
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

/* ─── CellRender ──────────────────────────────────────────────────────── */
function CellRender({ value, highlight }: { value: Cell; highlight?: boolean }) {
  if (value === true) {
    return (
      <div className="flex justify-center">
        <Check size={16} style={{ color: highlight ? YELLOW : "#4ADE80" }} />
      </div>
    );
  }
  if (value === false) {
    return (
      <div className="flex justify-center">
        <Minus size={16} style={{ color: TEXT_LOW }} />
      </div>
    );
  }
  return (
    <div className="text-center font-mono text-[11.5px] tabular-nums" style={{ color: highlight ? "#fff" : TEXT_MID }}>
      {value}
    </div>
  );
}
