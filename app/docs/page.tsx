// app/docs/page.tsx
//
// Three-column docs: sticky TOC (left), content (center), code samples (right).
// On narrower viewports collapses to single column with code blocks inline.
// Skeleton content only — real reference will follow.

"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BookOpen, KeyRound, Server, Radio, Webhook, Package,
} from "lucide-react";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { CodeBlock, Tok } from "@/components/marketing/CodeBlock";
import {
  BG, VIOLET, VIOLET_2, YELLOW,
  TEXT_HI, TEXT_MID, TEXT_LOW, LINE, LINE_2,
} from "@/lib/theme";

/* ─── TOC structure ───────────────────────────────────────────────────── */
type TocSection = { id: string; label: string; items: { id: string; label: string }[] };

const TOC: TocSection[] = [
  {
    id: "start", label: "Getting started", items: [
      { id: "auth",   label: "Authentication" },
      { id: "keys",   label: "API keys" },
      { id: "base",   label: "Base URL" },
    ],
  },
  {
    id: "ref", label: "Reference", items: [
      { id: "ref-portfolios",       label: "GET /v1/portfolios" },
      { id: "ref-portfolios-slug",  label: "GET /v1/portfolios/[slug]" },
      { id: "ref-transactions",     label: "GET /v1/transactions" },
      { id: "ref-tickers",          label: "GET /v1/tickers/[ticker]" },
      { id: "ref-firehose",         label: "WS  /v1/firehose" },
    ],
  },
  {
    id: "hooks", label: "Webhooks", items: [
      { id: "hook-sig",     label: "Signing & verification" },
      { id: "hook-payload", label: "Payload schemas" },
      { id: "hook-retry",   label: "Retry policy" },
    ],
  },
  {
    id: "sdk", label: "SDKs", items: [
      { id: "sdk-node",    label: "Node" },
      { id: "sdk-python",  label: "Python" },
      { id: "sdk-ruby",    label: "Ruby" },
    ],
  },
];

/* ─── Page ────────────────────────────────────────────────────────────── */
export default function DocsPage() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <PublicHeader />

      {/* HERO STRIP */}
      <section className="border-b" style={{ borderColor: LINE }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-12 pt-16 pb-12">
          <div className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
            Docs · v0.4
          </div>
          <h1
            className="mt-4 font-semibold tracking-[-0.04em] leading-[1] text-[40px] sm:text-[56px]"
            style={{ fontFamily: "var(--font-display)", color: "#fff" }}
          >
            Build with the desk.
          </h1>
          <p className="mt-5 max-w-2xl text-[16px] leading-[1.6]" style={{ color: TEXT_MID }}>
            REST endpoints, a low-latency WebSocket firehose, and signed webhooks. The full reference
            is in flight; this skeleton tells you the shape. Email{" "}
            <a className="underline underline-offset-2 hover:text-white" href="mailto:dev@autotrade.app">dev@autotrade.app</a>{" "}
            for early access keys.
          </p>
        </div>
      </section>

      {/* 3-COL LAYOUT */}
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[200px_minmax(0,1fr)_320px] gap-x-10 gap-y-8">
          {/* TOC */}
          <aside className="lg:sticky lg:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <TocBlock />
          </aside>

          {/* CONTENT */}
          <div className="min-w-0 space-y-16">
            <GettingStarted />
            <Reference />
            <Webhooks />
            <Sdks />
          </div>

          {/* SAMPLES (right-rail terminal columns) */}
          <aside className="hidden lg:block lg:sticky lg:top-20 self-start max-h-[calc(100vh-6rem)] overflow-y-auto">
            <SampleRail />
          </aside>
        </div>
      </div>

      <PublicFooter />
    </main>
  );
}

/* ─── TOC ─────────────────────────────────────────────────────────────── */
function TocBlock() {
  return (
    <nav className="text-[13px]">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em] mb-4" style={{ color: TEXT_LOW }}>
        Contents
      </div>
      <ul className="space-y-5">
        {TOC.map((sec) => (
          <li key={sec.id}>
            <a
              href={`#${sec.id}`}
              className="font-semibold tracking-tight hover:text-white transition-colors"
              style={{ color: TEXT_HI }}
            >
              {sec.label}
            </a>
            <ul className="mt-2 space-y-1.5 pl-3 border-l" style={{ borderColor: LINE_2 }}>
              {sec.items.map((it) => (
                <li key={it.id}>
                  <a
                    href={`#${it.id}`}
                    className="block py-0.5 text-[12.5px] hover:text-white transition-colors"
                    style={{ color: TEXT_MID }}
                  >
                    {it.label}
                  </a>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/* ─── Getting Started ─────────────────────────────────────────────────── */
function GettingStarted() {
  return (
    <section id="start" className="scroll-mt-20">
      <DocsSectionHeader icon={<BookOpen size={18} />} eyebrow="Getting started" no="01">
        From key to first request in a minute.
      </DocsSectionHeader>

      <DocsBlock id="auth" title="Authentication">
        <p>
          autotrade uses bearer tokens scoped to your account. Generate keys in{" "}
          <Link href="/settings" className="underline underline-offset-2 hover:text-white">Settings → API</Link>.
          Every request must include an <code>Authorization: Bearer …</code> header.
        </p>
        <p>
          Keys are environment-scoped — separate prefixes for <code>live_</code> and{" "}
          <code>test_</code>. Test keys hit a sandbox that mirrors production schemas with seed
          fixtures, so you can build without burning quota.
        </p>
      </DocsBlock>

      <DocsBlock id="keys" title="API keys" icon={<KeyRound size={16} />}>
        <p>
          Up to five keys per account, each with optional read/write scopes. Rotate any key from
          the dashboard without downtime — new keys are valid the moment they're issued, old keys
          remain valid until you revoke them.
        </p>
      </DocsBlock>

      <DocsBlock id="base" title="Base URL" icon={<Server size={16} />}>
        <p>
          All HTTP endpoints sit on <code>https://api.autotrade.app/v1</code>. The WebSocket firehose
          uses <code>wss://stream.autotrade.app/v1</code>. Both honor strict TLS 1.3.
        </p>
      </DocsBlock>
    </section>
  );
}

/* ─── Reference ───────────────────────────────────────────────────────── */
function Reference() {
  return (
    <section id="ref" className="scroll-mt-20">
      <DocsSectionHeader icon={<Server size={18} />} eyebrow="Reference" no="02">
        REST + WebSocket endpoints.
      </DocsSectionHeader>

      <EndpointCard
        id="ref-portfolios"
        method="GET"
        path="/v1/portfolios"
        summary="List every public portfolio (lawmakers + AI minds) with current return numbers."
        params={[
          { name: "kind",   type: "string",  desc: "Filter to ‘member’ or ‘ai’." },
          { name: "limit",  type: "integer", desc: "Default 50, max 200." },
          { name: "cursor", type: "string",  desc: "Cursor returned from the previous page." },
        ]}
      />

      <EndpointCard
        id="ref-portfolios-slug"
        method="GET"
        path="/v1/portfolios/[slug]"
        summary="Full profile: holdings, transaction history, sparkline series, and AI scorecard."
        params={[
          { name: "since",  type: "ISO-8601", desc: "Truncate transactions to this date." },
        ]}
      />

      <EndpointCard
        id="ref-transactions"
        method="GET"
        path="/v1/transactions"
        summary="Every disclosed transaction across the entire roster, filterable by member, ticker, side, or bracket."
        params={[
          { name: "member", type: "string",  desc: "Repeated. Member slug or bioguide id." },
          { name: "ticker", type: "string",  desc: "Repeated. Equity ticker." },
          { name: "side",   type: "enum",    desc: "‘buy’ or ‘sell’." },
        ]}
      />

      <EndpointCard
        id="ref-tickers"
        method="GET"
        path="/v1/tickers/[ticker]"
        summary="Per-ticker rollup: who's filing it, AI consensus, and the rolling 30-day price overlay."
      />

      <EndpointCard
        id="ref-firehose"
        method="WS"
        path="/v1/firehose"
        summary="Push channel for new filings within ~30 seconds of ZIP refresh. Authenticate via the same bearer token in a connection-init message."
      />
    </section>
  );
}

/* ─── Webhooks ────────────────────────────────────────────────────────── */
function Webhooks() {
  return (
    <section id="hooks" className="scroll-mt-20">
      <DocsSectionHeader icon={<Webhook size={18} />} eyebrow="Webhooks" no="03">
        Subscribe to the events that move your desk.
      </DocsSectionHeader>

      <DocsBlock id="hook-sig" title="Signing & verification">
        <p>
          Every webhook delivery includes <code>x-autotrade-signature</code>, an HMAC-SHA256
          of the raw body using your endpoint's signing secret. Always verify before processing.
          Sample verification logic ships in our SDK packages.
        </p>
      </DocsBlock>

      <DocsBlock id="hook-payload" title="Payload schemas" icon={<Radio size={16} />}>
        <p>
          The two stable event types today: <code>filing.created</code> (a fresh PTR has been
          parsed and replayed) and <code>consensus.changed</code> (concurrence on a ticker just
          crossed the 3-of-4 threshold). JSON schemas are published next to this docs page.
        </p>
      </DocsBlock>

      <DocsBlock id="hook-retry" title="Retry policy">
        <p>
          Failed deliveries (non-2xx, timeout, or refused) are retried with exponential backoff for
          24 hours. After 24h the event is parked in a dead-letter list you can replay from the
          dashboard. We never silently drop.
        </p>
      </DocsBlock>
    </section>
  );
}

/* ─── SDKs ────────────────────────────────────────────────────────────── */
function Sdks() {
  return (
    <section id="sdk" className="scroll-mt-20">
      <DocsSectionHeader icon={<Package size={18} />} eyebrow="SDKs" no="04">
        Official client libraries.
      </DocsSectionHeader>
      <p className="text-[14.5px] leading-[1.65]" style={{ color: TEXT_MID }}>
        Wrappers around the REST and WebSocket APIs with typed responses and signed-webhook
        helpers. Tracking GA at the end of summer 2026.
      </p>

      <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SdkCard id="sdk-node"   name="Node"   stack="@autotrade/node"   status="Coming soon" />
        <SdkCard id="sdk-python" name="Python" stack="autotrade"         status="Coming soon" />
        <SdkCard id="sdk-ruby"   name="Ruby"   stack="autotrade-ruby"    status="Coming soon" />
      </div>
    </section>
  );
}

/* ─── Right rail of always-on samples ────────────────────────────────── */
function SampleRail() {
  const [tab, setTab] = useState<"curl" | "js">("curl");
  return (
    <div className="space-y-4">
      <div className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
        Try it
      </div>

      <div className="flex gap-1 rounded-full p-1" style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${LINE_2}` }}>
        {(["curl", "js"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className="flex-1 rounded-full px-3 py-1.5 text-[11px] uppercase tracking-[0.16em] font-mono transition-colors"
            style={{
              background: tab === t ? "rgba(124,95,255,0.18)" : "transparent",
              color:      tab === t ? "#fff" : TEXT_MID,
              border:     tab === t ? "1px solid rgba(124,95,255,0.35)" : "1px solid transparent",
            }}
          >
            {t === "curl" ? "curl" : "JavaScript"}
          </button>
        ))}
      </div>

      {tab === "curl" ? (
        <CodeBlock raw={SAMPLE_CURL} title="GET /v1/portfolios">
          <Tok.Fn>curl</Tok.Fn> <Tok.Str>https://api.autotrade.app/v1/portfolios</Tok.Str>{" "}\<br/>
          {"  "}<Tok.Kw>-H</Tok.Kw> <Tok.Str>&quot;Authorization: Bearer $AUTOTRADE_KEY&quot;</Tok.Str>{" "}\<br/>
          {"  "}<Tok.Kw>-H</Tok.Kw> <Tok.Str>&quot;Accept: application/json&quot;</Tok.Str>
        </CodeBlock>
      ) : (
        <CodeBlock raw={SAMPLE_JS} title="portfolios.list()" language="JavaScript">
          <Tok.Kw>const</Tok.Kw> client <Tok.Op>=</Tok.Op> <Tok.Kw>new</Tok.Kw> <Tok.Fn>Autotrade</Tok.Fn>(<Tok.Op>{`{`}</Tok.Op><br/>
          {"  "}<Tok.Key>apiKey</Tok.Key>: <Tok.Fn>process</Tok.Fn>.env.AUTOTRADE_KEY,<br/>
          <Tok.Op>{`}`}</Tok.Op>);<br/>
          <br/>
          <Tok.Kw>const</Tok.Kw> portfolios <Tok.Op>=</Tok.Op> <Tok.Kw>await</Tok.Kw> client.portfolios.<Tok.Fn>list</Tok.Fn>(<Tok.Op>{`{`}</Tok.Op><br/>
          {"  "}<Tok.Key>kind</Tok.Key>: <Tok.Str>&quot;member&quot;</Tok.Str>,<br/>
          {"  "}<Tok.Key>limit</Tok.Key>: <Tok.Num>50</Tok.Num>,<br/>
          <Tok.Op>{`}`}</Tok.Op>);
        </CodeBlock>
      )}

      <div
        className="rounded-xl px-4 py-3.5 text-[12px]"
        style={{ background: "rgba(124,95,255,0.07)", border: "1px solid rgba(124,95,255,0.30)", color: TEXT_HI }}
      >
        <div className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
          Early access
        </div>
        <p className="mt-1 leading-[1.55]" style={{ color: TEXT_MID }}>
          API keys are gated on Professional and Institutional. Email{" "}
          <a href="mailto:dev@autotrade.app" className="text-white underline underline-offset-2">dev@autotrade.app</a>
          {" "}with your use case and we'll provision the same day.
        </p>
      </div>
    </div>
  );
}

/* ─── Primitives ──────────────────────────────────────────────────────── */
function DocsSectionHeader({
  no, eyebrow, icon, children,
}: { no: string; eyebrow: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <header className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <span
          className="inline-flex w-8 h-8 items-center justify-center rounded-lg"
          style={{ background: "rgba(124,95,255,0.14)", border: "1px solid rgba(124,95,255,0.32)", color: VIOLET_2 }}
        >
          {icon}
        </span>
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
          §{no} · {eyebrow}
        </span>
      </div>
      <h2
        className="font-semibold tracking-[-0.025em] text-[26px] sm:text-[34px]"
        style={{ fontFamily: "var(--font-display)", color: "#fff" }}
      >
        {children}
      </h2>
    </header>
  );
}

function DocsBlock({
  id, title, icon, children,
}: { id: string; title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div id={id} className="mt-8 scroll-mt-20 first:mt-0">
      <h3 className="flex items-center gap-2 text-[16px] font-semibold tracking-tight" style={{ color: "#fff" }}>
        {icon && <span style={{ color: VIOLET_2 }}>{icon}</span>}
        {title}
      </h3>
      <div className="mt-2 text-[14.5px] leading-[1.7] space-y-3" style={{ color: TEXT_MID }}>
        {children}
      </div>
    </div>
  );
}

function EndpointCard({
  id, method, path, summary, params,
}: {
  id: string;
  method: "GET" | "POST" | "PATCH" | "DELETE" | "WS";
  path: string;
  summary: string;
  params?: { name: string; type: string; desc: string }[];
}) {
  const methodColor =
    method === "GET" ? POSITIVE_C :
    method === "POST" ? VIOLET_2 :
    method === "WS" ? YELLOW : "#fff";
  return (
    <div
      id={id}
      className="mt-6 rounded-xl p-5 scroll-mt-20 first:mt-0"
      style={{ background: "rgba(255,255,255,0.02)", border: `1px solid ${LINE_2}` }}
    >
      <div className="flex items-center gap-3 flex-wrap">
        <span
          className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] rounded-md px-2 py-0.5"
          style={{ background: `${methodColor}1A`, color: methodColor, border: `1px solid ${methodColor}55` }}
        >
          {method}
        </span>
        <span className="font-mono text-[14px]" style={{ color: "#fff" }}>{path}</span>
      </div>
      <p className="mt-3 text-[14px] leading-[1.6]" style={{ color: TEXT_MID }}>{summary}</p>

      {params && params.length > 0 && (
        <div className="mt-4 rounded-lg overflow-hidden" style={{ border: `1px solid ${LINE}` }}>
          <div
            className="px-3 py-2 font-mono text-[10.5px] uppercase tracking-[0.16em]"
            style={{ background: "rgba(255,255,255,0.02)", color: TEXT_LOW, borderBottom: `1px solid ${LINE}` }}
          >
            Query parameters
          </div>
          <ul>
            {params.map((p, i) => (
              <li
                key={p.name}
                className="px-3 py-2.5 text-[13px] grid grid-cols-[120px_90px_1fr] gap-3 items-baseline"
                style={{ borderBottom: i < params.length - 1 ? `1px solid ${LINE}` : "none" }}
              >
                <span className="font-mono" style={{ color: YELLOW }}>{p.name}</span>
                <span className="font-mono text-[11.5px]" style={{ color: TEXT_LOW }}>{p.type}</span>
                <span style={{ color: TEXT_MID }}>{p.desc}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function SdkCard({
  id, name, stack, status,
}: { id: string; name: string; stack: string; status: string }) {
  return (
    <div
      id={id}
      className="rounded-xl p-4 scroll-mt-20"
      style={{ background: "rgba(255,255,255,0.025)", border: `1px solid ${LINE_2}` }}
    >
      <div className="text-[14.5px] font-semibold tracking-tight" style={{ color: "#fff" }}>{name}</div>
      <div className="mt-1 font-mono text-[11.5px]" style={{ color: TEXT_LOW }}>{stack}</div>
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em]"
        style={{ background: `${YELLOW}1A`, color: YELLOW, border: `1px solid ${YELLOW}55` }}>
        <span className="w-1 h-1 rounded-full" style={{ background: YELLOW }} />
        {status}
      </div>
    </div>
  );
}

/* ─── Samples (raw strings for clipboard) ─────────────────────────────── */
const SAMPLE_CURL = `curl https://api.autotrade.app/v1/portfolios \\
  -H "Authorization: Bearer $AUTOTRADE_KEY" \\
  -H "Accept: application/json"`;

const SAMPLE_JS = `const client = new Autotrade({
  apiKey: process.env.AUTOTRADE_KEY,
});

const portfolios = await client.portfolios.list({
  kind: "member",
  limit: 50,
});`;

const POSITIVE_C = "#4ADE80";
