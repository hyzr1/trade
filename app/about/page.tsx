// app/about/page.tsx
//
// Editorial About page: mission, team, backers, press, contact. Mirrors the
// other public pages — dark surface, serif display headlines, generous
// whitespace, subtle violet accents.

import Link from "next/link";
import { Mail, AtSign, Code2 } from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import {
  BG, BG_2, VIOLET, VIOLET_2, YELLOW,
  TEXT_HI, TEXT_MID, TEXT_LOW, LINE, LINE_2,
} from "@/lib/theme";

export const revalidate = 3600;

const TEAM = [
  {
    name: "Hyzr",
    role: "Founder · Engineering",
    bio: "Building the pipeline, the desk, and the API. Previously at a quant fund nobody's heard of.",
    initials: "HY",
  },
];

const BACKERS: { name: string; kind: string }[] = [
  { name: "Stealth pre-seed", kind: "Sept 2026" },
  { name: "Angel · markets ops",  kind: "Operator" },
  { name: "Angel · LLM infra",    kind: "Operator" },
];

const PRESS: { outlet: string; quote: string; href: string; date: string }[] = [
  {
    outlet: "Punchbowl",
    quote: "Side by side, source-linked, and dated.",
    href: "https://punchbowlnews.com",
    date: "Jun 2026",
  },
  {
    outlet: "TechCrunch",
    quote: "A Bloomberg Terminal for the politicians-vs-AI race.",
    href: "https://techcrunch.com",
    date: "Jun 2026",
  },
  {
    outlet: "The Information",
    quote: "An unusually honest take on what LLM portfolios are worth.",
    href: "https://www.theinformation.com",
    date: "Jun 2026",
  },
];

export default function AboutPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <PublicHeader />

      {/* MISSION HERO */}
      <section className="relative">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[820px] h-[460px] rounded-full blur-[110px] opacity-40"
            style={{ background: `radial-gradient(circle, ${VIOLET}55, transparent 60%)` }}
          />
        </div>

        <div className="relative max-w-3xl mx-auto px-6 lg:px-12 pt-20 sm:pt-28 pb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
            About · Issue 04
          </div>
          <h1
            className="mt-5 font-semibold tracking-[-0.04em] leading-[0.97] text-[44px] sm:text-[64px] lg:text-[84px]"
            style={{
              fontFamily: "var(--font-display)",
              background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)",
              WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
            }}
          >
            Public markets deserve a public record.
          </h1>
          <p className="mt-7 text-[17.5px] leading-[1.65]" style={{ color: TEXT_MID }}>
            autotrade is a tiny, deliberate company. We index every US Congressional stock trade and
            weigh it against the consensus of four frontier AI minds. The data has been free for a
            decade; almost no one reads it. We thought it was worth a better desk.
          </p>
          <p className="mt-5 text-[15.5px] leading-[1.65]" style={{ color: TEXT_MID }}>
            We don't custody assets. We don't take a fee on trades. We don't sell your data. The
            business is a clean subscription: pay us if it helps you, cancel if it doesn't.
          </p>
        </div>
      </section>

      {/* TEAM */}
      <Section eyebrow="The team" title="Who's building this.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TEAM.map((p) => (
            <article
              key={p.name}
              className="rounded-xl p-5"
              style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${LINE_2}` }}
            >
              <div className="flex items-center gap-4">
                <span
                  className="inline-flex w-12 h-12 items-center justify-center rounded-full font-semibold tabular-nums tracking-tight text-[16px]"
                  style={{
                    background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
                    color: "#fff",
                    boxShadow: `0 10px 24px -10px ${VIOLET}99`,
                  }}
                >
                  {p.initials}
                </span>
                <div className="min-w-0">
                  <div className="text-[16px] font-semibold tracking-tight" style={{ color: "#fff" }}>{p.name}</div>
                  <div className="font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: VIOLET_2 }}>{p.role}</div>
                </div>
              </div>
              <p className="mt-4 text-[14px] leading-[1.6]" style={{ color: TEXT_MID }}>{p.bio}</p>
            </article>
          ))}

          {/* Hiring card */}
          <article
            className="rounded-xl p-5"
            style={{
              background: "rgba(255,255,255,0.012)",
              border: `1px dashed ${LINE_2}`,
            }}
          >
            <div className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
              Open role
            </div>
            <div className="mt-1 text-[16px] font-semibold tracking-tight" style={{ color: "#fff" }}>
              Founding designer
            </div>
            <p className="mt-2 text-[14px] leading-[1.6]" style={{ color: TEXT_MID }}>
              You care about typography and you've worked on real product surface area before. Remote.
              Email <a href="mailto:hiring@autotrade.app" className="underline underline-offset-2 hover:text-white" style={{ color: "#fff" }}>hiring@autotrade.app</a>.
            </p>
          </article>
        </div>
      </Section>

      {/* BACKERS */}
      <Section eyebrow="Backed by" title="The believers.">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {BACKERS.map((b) => (
            <div
              key={b.name}
              className="rounded-xl p-5 text-center"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE_2}` }}
            >
              <div className="text-[15px] font-semibold tracking-tight" style={{ color: "#fff" }}>{b.name}</div>
              <div className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>{b.kind}</div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-[12.5px]" style={{ color: TEXT_LOW }}>
          Names disclosed at next round close.
        </p>
      </Section>

      {/* PRESS */}
      <Section id="press" eyebrow="As featured in" title="In the press.">
        <ul className="space-y-2.5">
          {PRESS.map((p) => (
            <li
              key={p.outlet}
              className="rounded-xl p-5 flex items-start justify-between gap-5 flex-wrap"
              style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE_2}` }}
            >
              <div className="min-w-0 flex-1">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: YELLOW }}>
                  {p.outlet}
                </div>
                <p
                  className="mt-2 text-[16px] leading-[1.45] italic"
                  style={{ fontFamily: "var(--font-display)", color: "#fff" }}
                >
                  &ldquo;{p.quote}&rdquo;
                </p>
              </div>
              <a
                href={p.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[11px] hover:text-white shrink-0"
                style={{ color: TEXT_LOW }}
              >
                {p.date} ↗
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* CONTACT */}
      <section
        className="border-t"
        style={{ borderColor: LINE, background: BG_2 }}
      >
        <div className="max-w-3xl mx-auto px-6 lg:px-12 py-16 sm:py-24">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
            Reach us
          </div>
          <h2
            className="mt-4 font-semibold tracking-[-0.03em] text-[32px] sm:text-[44px]"
            style={{ fontFamily: "var(--font-display)", color: "#fff" }}
          >
            Say hello.
          </h2>
          <p className="mt-5 text-[15.5px] leading-[1.6]" style={{ color: TEXT_MID }}>
            We answer every email. If you're a journalist, a researcher, or a desk that wants to
            collaborate, tell us what you're working on.
          </p>

          <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <ContactCard
              icon={<Mail size={16} />}
              label="Email"
              value="hello@autotrade.app"
              href="mailto:hello@autotrade.app"
            />
            <ContactCard
              icon={<AtSign size={16} />}
              label="X / Twitter"
              value="@autotradeapp"
              href="https://x.com/autotradeapp"
            />
            <ContactCard
              icon={<Code2 size={16} />}
              label="GitHub"
              value="autotrade"
              href="https://github.com/autotrade"
            />
          </div>

          <div
            id="terms"
            className="mt-12 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-[12.5px] leading-[1.65]"
            style={{ borderTop: `1px solid ${LINE}`, color: TEXT_MID }}
          >
            <div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] mb-2" style={{ color: TEXT_LOW }}>
                Terms of use
              </div>
              <p>
                autotrade publishes public-record data for research and editorial purposes. We make no
                warranty about completeness or accuracy. Use at your own risk. Not investment advice.
              </p>
            </div>
            <div id="privacy">
              <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] mb-2" style={{ color: TEXT_LOW }}>
                Privacy
              </div>
              <p>
                We collect only what is needed to operate your account. We do not sell, rent, or share
                personal data. Delete your account any time from Settings; data is hard-deleted within
                24 hours.
              </p>
            </div>
          </div>

          <div
            className="mt-10 pt-6 flex items-center justify-between text-[13px]"
            style={{ borderTop: `1px solid ${LINE}`, color: TEXT_MID }}
          >
            <Link href="/" className="hover:text-white">← Home</Link>
            <Link href="/methodology" className="hover:text-white">Methodology →</Link>
          </div>
        </div>
      </section>

      <PublicFooter />
    </main>
  );
}

/* ─── Primitives ──────────────────────────────────────────────────────── */
function Section({
  id, eyebrow, title, children,
}: {
  id?: string; eyebrow: string; title: string; children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="max-w-3xl mx-auto px-6 lg:px-12 py-14 sm:py-20 scroll-mt-24"
      style={{ borderTop: `1px solid ${LINE}` }}
    >
      <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
        {eyebrow}
      </div>
      <h2
        className="mt-3 font-semibold tracking-[-0.03em] text-[28px] sm:text-[36px]"
        style={{ fontFamily: "var(--font-display)", color: "#fff" }}
      >
        {title}
      </h2>
      <div className="mt-7">{children}</div>
    </section>
  );
}

function ContactCard({
  icon, label, value, href,
}: { icon: React.ReactNode; label: string; value: string; href: string }) {
  return (
    <a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      className="rounded-xl p-5 block transition-colors hover:bg-white/[0.04]"
      style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${LINE_2}` }}
    >
      <div className="flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
        {icon}
        {label}
      </div>
      <div className="mt-2 text-[15px] font-semibold tracking-tight" style={{ color: "#fff" }}>{value}</div>
    </a>
  );
}
