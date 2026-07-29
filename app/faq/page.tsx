// app/faq/page.tsx
//
// FAQ — section-grouped Q&A with smooth height-animated accordion.
// Editorial layout: single column, serif headlines, generous whitespace.

"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Database, Brain, Repeat, CreditCard, Lock } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import {
  BG, VIOLET, VIOLET_2,
  TEXT_HI, TEXT_MID, TEXT_LOW, LINE, LINE_2,
} from "@/lib/theme";

type QA = { q: string; a: React.ReactNode };
type Group = { title: string; icon: React.ReactNode; eyebrow: string; items: QA[] };

const GROUPS: Group[] = [
  {
    eyebrow: "Section I",
    title: "About the data",
    icon: <Database size={18} />,
    items: [
      {
        q: "Where does the trade data come from?",
        a: (
          <>
            Every row originates in a Periodic Transaction Report (PTR) filed with the Clerk of the
            House or the Senate's Office of Public Records under the STOCK Act. We never enrich, we
            never synthesize. The original PDF is one click away from any filing on the desk.
          </>
        ),
      },
      {
        q: "How often is it updated?",
        a: (
          <>
            We pull the House Clerk's daily ZIP every 15 minutes during business hours and once
            hourly overnight and on weekends. New filings show up on the desk within ~30 seconds of
            the ZIP refresh.
          </>
        ),
      },
      {
        q: "Why is there a delay between the trade and the filing?",
        a: (
          <>
            The STOCK Act gives lawmakers 45 days from trade-execution to disclose. The median is
            roughly two weeks. We replicate trades from the <em>filing</em> date to avoid look-ahead
            bias — see <Link href="/methodology" className="underline underline-offset-2 hover:text-white">Methodology §05</Link>.
          </>
        ),
      },
      {
        q: "Do you cover senators?",
        a: (
          <>
            Partially. The Senate's eFD portal sits behind a privacy-acknowledgment cookie our
            scraper does not currently negotiate. House coverage is complete; Senate is a known gap.
          </>
        ),
      },
      {
        q: "Why are some filings missing tickers?",
        a: (
          <>
            Some older PTRs are scanned image PDFs without a text layer. We silently skip them
            rather than risk OCR fabrication. You'll see "ineligible" in our internal counts but
            never a guess in a row.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Section II",
    title: "About the AI minds",
    icon: <Brain size={18} />,
    items: [
      {
        q: "Which models are in the rotation?",
        a: (
          <>
            GPT-5 (OpenAI), Claude Opus 4.8 (Anthropic), Gemini 2.5 Pro (Google), and Grok 4 (xAI).
            We will rotate as the frontier moves. Every change is announced in the
            {" "}<Link href="/changelog" className="underline underline-offset-2 hover:text-white">changelog</Link>.
          </>
        ),
      },
      {
        q: "Why these four specifically?",
        a: (
          <>
            They are the four most capable general-purpose frontier models with stable, billable APIs
            as of June 2026. We aren't running open-source models because their weights vary by host
            and a leaderboard of hosted endpoints would be misleading.
          </>
        ),
      },
      {
        q: "How is the prompt versioned?",
        a: (
          <>
            One file in git, semantically versioned. We are currently on v3, sealed January 2026.
            When the prompt changes we bump the version and start a new lineage — we do not re-run
            old portfolios against new prompts.
          </>
        ),
      },
      {
        q: "What if a model refuses to answer?",
        a: (
          <>
            We log the refusal verbatim and roll forward the prior week's portfolio unchanged. The
            event shows up in the changelog so you can see when a model declined.
          </>
        ),
      },
      {
        q: "Are you backtesting the models?",
        a: (
          <>
            No. Every model's portfolio starts the clock at its first snapshot. We do not claim
            historical performance for a model that didn't exist last year.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Section III",
    title: "About copy-trading",
    icon: <Repeat size={18} />,
    items: [
      {
        q: "Can I auto-execute these trades from my brokerage?",
        a: (
          <>
            Not yet. autotrade is a research and intelligence product today. Brokerage connections
            (Robinhood, Schwab, Fidelity, IBKR via Plaid) are on the roadmap, with a waitlist
            available from the desk.
          </>
        ),
      },
      {
        q: "When will real-money execution ship?",
        a: (
          <>
            We are targeting late 2026 for a limited beta. The work involves becoming a registered
            investment adviser, building broker integrations, and reconciling fills — none of which
            we are rushing.
          </>
        ),
      },
      {
        q: "Will you support fractional shares?",
        a: (
          <>
            Yes. Bracket reconstruction maps fine into fractional weights, which is how most retail
            copy-trading works anyway.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Section IV",
    title: "Pricing & billing",
    icon: <CreditCard size={18} />,
    items: [
      {
        q: "What does Professional include?",
        a: (
          <>
            Full archive (2014–present), CSV/Parquet exports, webhooks + email alerts, a
            filing-date-basis backtester, and priority sub-30-second feed access. See the
            {" "}<Link href="/pricing" className="underline underline-offset-2 hover:text-white">pricing page</Link>
            {" "}for the comparison.
          </>
        ),
      },
      {
        q: "Do you offer a refund?",
        a: (
          <>
            Within seven days of your first charge, no questions asked. Email us and you'll see the
            refund the same business day.
          </>
        ),
      },
      {
        q: "Can I cancel anytime?",
        a: (
          <>
            Yes. One click in Settings. Your access continues to the end of the current billing
            period; we do not pro-rate.
          </>
        ),
      },
      {
        q: "Do you have student or non-profit pricing?",
        a: (
          <>
            For verified .edu addresses, Professional is 50% off. Working journalists at recognized
            outlets get Professional comped — email press@autotrade.app.
          </>
        ),
      },
    ],
  },
  {
    eyebrow: "Section V",
    title: "Account & security",
    icon: <Lock size={18} />,
    items: [
      {
        q: "How is my data stored?",
        a: (
          <>
            Account data lives in Postgres on Vercel's managed infrastructure, encrypted at rest.
            We do not sell, rent, or share user data with anyone, ever.
          </>
        ),
      },
      {
        q: "Can I delete my account?",
        a: (
          <>
            Yes. Settings → Danger zone → Delete account. Your row is hard-deleted from our
            database within 24 hours. Stripe retains billing records as required by law.
          </>
        ),
      },
      {
        q: "Do you offer SSO?",
        a: (
          <>
            Google OAuth today. SAML/Okta for Institutional seats — included in the seat price.
          </>
        ),
      },
    ],
  },
];

export default function FaqPage() {
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
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[100px] opacity-35"
            style={{ background: `radial-gradient(circle, ${VIOLET}55, transparent 60%)` }}
          />
        </div>
        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
            Frequently asked
          </div>
          <h1
            className="mt-5 font-semibold tracking-[-0.04em] leading-[0.97] text-[44px] sm:text-[64px] lg:text-[72px]"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}
          >
            Questions, answered.
          </h1>
          <p className="mt-6 text-[16.5px] leading-[1.6]" style={{ color: TEXT_MID }}>
            Straight answers about the data, the models, the pricing, and what we do not do.
            Email <a href="mailto:hello@autotrade.app" className="underline underline-offset-2 hover:text-white">hello@autotrade.app</a> if your question isn't here.
          </p>
        </div>
      </section>

      {/* GROUPS */}
      <section className="max-w-3xl mx-auto px-6 lg:px-12 pb-24">
        {GROUPS.map((g, gi) => (
          <FaqGroup key={g.title} group={g} groupIndex={gi} />
        ))}

        <div
          className="mt-16 pt-6 flex items-center justify-between text-[13px]"
          style={{ borderTop: `1px solid ${LINE}`, color: TEXT_MID }}
        >
          <Link href="/methodology" className="hover:text-white">← Methodology</Link>
          <Link href="/pricing" className="hover:text-white">Pricing →</Link>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

function FaqGroup({ group, groupIndex }: { group: Group; groupIndex: number }) {
  return (
    <div className="mt-14 first:mt-0">
      <header className="flex items-center gap-3 mb-5">
        <span
          className="inline-flex w-9 h-9 items-center justify-center rounded-lg"
          style={{
            background: `linear-gradient(180deg, rgba(124,95,255,0.18) 0%, rgba(124,95,255,0.04) 100%)`,
            border: `1px solid rgba(124,95,255,0.35)`,
            color: VIOLET_2,
          }}
        >
          {group.icon}
        </span>
        <div>
          <div className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
            {group.eyebrow}
          </div>
          <h2
            className="font-semibold tracking-[-0.025em] text-[24px] sm:text-[28px]"
            style={{ fontFamily: "var(--font-display)", color: "#fff" }}
          >
            {group.title}
          </h2>
        </div>
      </header>

      <ul className="space-y-2.5">
        {group.items.map((qa, i) => (
          <FaqItem key={qa.q} qa={qa} startOpen={groupIndex === 0 && i === 0} />
        ))}
      </ul>
    </div>
  );
}

function FaqItem({ qa, startOpen }: { qa: QA; startOpen?: boolean }) {
  const [open, setOpen] = useState(Boolean(startOpen));
  return (
    <li
      className="rounded-xl overflow-hidden"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE_2}` }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-white/[0.03]"
      >
        <span className="text-[15.5px] font-semibold tracking-tight" style={{ color: "#fff" }}>
          {qa.q}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="shrink-0"
          style={{ color: TEXT_LOW }}
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            style={{ overflow: "hidden" }}
          >
            <div
              className="px-5 pb-5 text-[14.5px] leading-[1.65]"
              style={{ color: TEXT_MID, borderTop: `1px solid ${LINE}` }}
            >
              <div className="pt-4">{qa.a}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}
