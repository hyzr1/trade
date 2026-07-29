// app/page.tsx
//
// "THE TERMINAL" — landing page.
// Bloomberg-Terminal-meets-Alltra. Warm-black surfaces, violet+yellow accent
// system, sans-only, browser-chrome dashboard mockups.

import Link from "next/link";
import {
  BG, BG_2, VIOLET, VIOLET_2, VIOLET_DEEP, YELLOW, YELLOW_DIM,
  POSITIVE, NEGATIVE, TICKER_AMBER,
  TEXT_HI, TEXT_MID, TEXT_LOW, TEXT_DIM, LINE, LINE_2,
  VIOLET_GRAD, VIOLET_GLOW,
} from "@/lib/theme";
import { PublicFooter } from "@/components/marketing/PublicFooter";
import { PublicHeader } from "@/components/marketing/PublicHeader";
import { HeroHeadline, ScrollReveal, HoverLift } from "@/components/marketing/HeroHeadline";
import { LivePulse } from "@/components/marketing/LivePulse";

export default function DarkLanding() {
  return (
    <main
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <DarkNav />
      {/* Hero stays unwrapped — it's above the fold and uses its own CSS
          fade-in via HeroHeadline. */}
      <DarkHero />
      {/* Every below-the-fold section fades in on scroll. ScrollReveal is
          SSR-safe (renders visible, then re-hides briefly client-side only if
          the element is genuinely below the viewport at mount). */}
      <ScrollReveal><DarkBrokers /></ScrollReveal>
      <ScrollReveal><DarkTicker /></ScrollReveal>
      <ScrollReveal><DarkFourMinds /></ScrollReveal>
      <ScrollReveal><DarkRoster /></ScrollReveal>
      <ScrollReveal><DarkStats /></ScrollReveal>
      <ScrollReveal><DarkTestimonial /></ScrollReveal>
      <ScrollReveal><DarkPricing /></ScrollReveal>
      <ScrollReveal><DarkFinalCTA /></ScrollReveal>
      <PublicFooter />
    </main>
  );
}

/* ============================================================================
   DARK BACKGROUND — "Premium Stripe Ribbon" (dark-mode edition)

   What the previous ribbon attempt got wrong (user feedback "looks cheap"):
     - YELLOW counter-ribbon crossing the spine → highlighter-stripe look
     - Rainbow palette w/ 6 stops (yellow→pink→magenta→violet→indigo→cyan)
       too many color shifts compounded into solid bands
     - Opacities up to 0.85–1.0 → bands felt opaque, not atmospheric
     - Two perpendicular ribbons created visual noise

   What this version does differently:
     - SINGLE direction per variant (no crossing ribbons)
     - ANALOGOUS palette only: deep violet → magenta → coral pink → soft peach
       (no yellow, no cyan, no green — every stop sits within a 90° arc of hue)
     - Max color opacity 0.40 — outer halos are 0.18 (much more atmospheric)
     - Heavy outer blur (50px+) — outer layers truly read as light, not paint
     - White "silk reflection" spine at 0.30 opacity gives the ribbon material feel
     - mix-blend-mode: screen — additive light against dark, never muddy
     - Heavy SVG turbulence grain underneath kills banding and adds film texture
     - Deep base wash with vertical tonal shift so the dark surface has depth
   ========================================================================== */
type BgVariant = "hero" | "minds" | "cta";

function DarkBackground({ variant = "hero", intensity = 1 }: { variant?: BgVariant; intensity?: number }) {
  // Per-variant SINGLE ribbon path. Each path is one organic flowing curve —
  // no counter-ribbon, no crossing. Direction differs per section so the page
  // doesn't feel like the same artwork three times.
  const config = {
    hero: {
      // Wide diagonal sweep from off-screen top-right down to off-screen
      // bottom-left. Anchors the hero with directional momentum.
      path:   "M 1750,-100 C 1250,180 1300,480 850,580 C 400,680 450,920 -150,1100",
      spine:  "M 1730,-80  C 1240,200 1290,500 855,600 C 420,700 460,940 -130,1110",
      glow:   { x: "68%", y: "28%" },
    },
    minds: {
      // Gentle vertical-leaning S through the middle. Calmer ambient flow.
      path:   "M 1500,-100 C 900,180 1100,460 700,600 C 300,740 800,940 100,1100",
      spine:  "M 1480,-80  C 920,200 1120,480 720,620 C 320,760 820,960 120,1110",
      glow:   { x: "50%", y: "50%" },
    },
    cta: {
      // Mirror of hero — sweep from top-left to bottom-right.
      path:   "M -150,-100 C 350,180 300,480 750,580 C 1200,680 1150,920 1750,1100",
      spine:  "M -130,-80  C 360,200 310,500 745,600 C 1180,700 1140,940 1730,1110",
      glow:   { x: "32%", y: "28%" },
    },
  }[variant];

  // Per-variant grain seed for unique surface fingerprint
  const grainSeed     = variant === "hero" ? 4 : variant === "minds" ? 11 : 17;
  const grainFilterId = `dbg-grain-${variant}`;
  const id            = variant;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        background: BG,
        backgroundImage: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 55%, #05030B 100%)`,
        pointerEvents: "none",
        isolation: "isolate",
      }}
    >
      {/* LAYER 1 — Deep radial wash. Anchors the brightest mass of the ribbon
          in deep indigo before any color comes in. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(ellipse 75% 65% at ${config.glow.x} ${config.glow.y},
            rgba(79,57,216,0.32) 0%,
            rgba(50,15,90,0.16) 35%,
            transparent 75%)`,
          opacity: 0.95 * intensity,
        }}
      />

      {/* LAYER 2 — THE RIBBON. Four stacked SVG paths sharing ONE harmonious
          analogous gradient (deep violet → magenta → coral → peach). All
          mix-blend-mode: screen so they read as light, never pigment. */}
      <svg
        viewBox="0 0 1600 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        style={{ mixBlendMode: "screen" }}
      >
        <defs>
          {/* The single ribbon gradient — PURE VIOLET BRAND family.
              All stops sit on the violet/indigo axis (260°–280° hue arc).
              No magenta, no pink, no coral — just shadow indigo → VIOLET_DEEP →
              VIOLET (main brand) → VIOLET_2 → lavender highlight.
              Each stop is on-brand and feels like a single light source bending
              through curved violet glass. */}
          <linearGradient id={`dbgGrad-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#2A1B70" />{/* deep indigo shadow */}
            <stop offset="25%"  stopColor="#4F39D8" />{/* VIOLET_DEEP — brand deep */}
            <stop offset="50%"  stopColor="#7C5FFF" />{/* VIOLET — main brand */}
            <stop offset="75%"  stopColor="#A78BFA" />{/* VIOLET_2 — brand secondary */}
            <stop offset="100%" stopColor="#D4C2FF" />{/* lavender highlight */}
          </linearGradient>

          {/* Halo gradient — same family, anchored at brand-deep through brand-secondary */}
          <linearGradient id={`dbgHalo-${id}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%"   stopColor="#4F39D8" />
            <stop offset="50%"  stopColor="#7C5FFF" />
            <stop offset="100%" stopColor="#A78BFA" />
          </linearGradient>

          <filter id={`dbgBlurXL-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="55" />
          </filter>
          <filter id={`dbgBlurL-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="22" />
          </filter>
          <filter id={`dbgBlurM-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" />
          </filter>
          <filter id={`dbgBlurS-${id}`} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>

        {/* HALO — widest, softest, most atmospheric. This is the "outer glow"
            that makes the ribbon feel like it's emitting light into the space. */}
        <path
          d={config.path}
          stroke={`url(#dbgHalo-${id})`}
          strokeWidth="540"
          strokeLinecap="round"
          fill="none"
          opacity={0.18 * intensity}
          filter={`url(#dbgBlurXL-${id})`}
        />

        {/* BODY — wide, blurred, sets the color mass */}
        <path
          d={config.path}
          stroke={`url(#dbgGrad-${id})`}
          strokeWidth="280"
          strokeLinecap="round"
          fill="none"
          opacity={0.32 * intensity}
          filter={`url(#dbgBlurL-${id})`}
        />

        {/* CORE — narrower, slightly blurred, gives the ribbon definition */}
        <path
          d={config.path}
          stroke={`url(#dbgGrad-${id})`}
          strokeWidth="110"
          strokeLinecap="round"
          fill="none"
          opacity={0.40 * intensity}
          filter={`url(#dbgBlurM-${id})`}
        />

        {/* SILK SPINE — the thin bright white line that gives the ribbon its
            "satin fabric reflection" character. Slightly offset from the body
            paths (config.spine vs config.path) so it doesn't sit dead-center —
            mimics how light catches a curved fabric surface. */}
        <path
          d={config.spine}
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
          opacity={0.30 * intensity}
          filter={`url(#dbgBlurS-${id})`}
        />
      </svg>

      {/* LAYER 3 — Top/bottom edge fades so the ribbon dissolves into section
          borders cleanly instead of clipping at a hard edge. */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg,
            ${BG} 0%,
            transparent 12%,
            transparent 88%,
            ${BG} 100%)`,
        }}
      />

      {/* LAYER 4 — Film-grain texture via SVG feTurbulence. Per-variant seed
          for unique fingerprint. This is what kills the "cheap CSS gradient"
          look — real noise breaks up the smooth ribbon into something that
          reads as photographic / material. */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0.12,
          mixBlendMode: "overlay",
          pointerEvents: "none",
        }}
        aria-hidden
      >
        <defs>
          <filter id={grainFilterId}>
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.9"
              numOctaves="2"
              stitchTiles="stitch"
              seed={grainSeed}
            />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${grainFilterId})`} />
      </svg>
    </div>
  );
}

/* Legacy alias — earlier sections call <Atmosphere /> with a tint prop.
   Keep the API alive but route through DarkBackground so we don't churn calls. */
function Atmosphere({ tint, intensity = 1 }: { tint?: "blue" | "mixed" | "purple"; intensity?: number }) {
  const variant: BgVariant = tint === "mixed" ? "minds" : "hero";
  return <DarkBackground variant={variant} intensity={intensity} />;
}

/* ============================================================================
   NAV
   ========================================================================== */
function DarkNav() {
  return <PublicHeader />;
}

function DarkLogo() {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-md"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 18 L12 4 L20 18 M7.5 13.5 L16.5 13.5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

/* ============================================================================
   HERO
   ========================================================================== */
function DarkHero() {
  return (
    <section id="desk" className="relative">
      <div className="absolute inset-0 z-0"><Atmosphere tint="blue" /></div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-12 pt-10 sm:pt-16 lg:pt-24 pb-8 sm:pb-12 text-center">
        <div className="fadein flex flex-wrap items-center justify-center gap-2 mb-6 sm:mb-9">
          {/* Live chip — compact text on mobile, full on sm+ */}
          <Link
            href="/#desk"
            className="focus-ring inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-[11px] sm:text-[11.5px] backdrop-blur transition-colors hover:bg-white/[0.06]"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${LINE_2}`,
              color: TEXT_HI,
            }}
          >
            <LivePulse size={7} />
            <noscript>
              <span
                aria-hidden
                className="inline-block w-1.5 h-1.5 rounded-full"
                style={{ background: POSITIVE }}
              />
            </noscript>
            <span style={{ color: TEXT_MID }}>Live</span>
            <span style={{ color: TEXT_DIM }}>·</span>
            <span className="sm:hidden">538 reps · 4 AIs</span>
            <span className="hidden sm:inline">538 lawmakers · 4 frontier minds tracked</span>
            <span style={{ color: TEXT_LOW }}>→</span>
          </Link>

          {/* v0.4 release chip — quiet teaser that links to changelog. */}
          <Link
            href="/changelog"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-mono uppercase tracking-[0.16em] transition-colors hover:bg-[rgba(124,95,255,0.18)]"
            style={{
              background: "rgba(124,95,255,0.12)",
              border: "1px solid rgba(124,95,255,0.30)",
              color: VIOLET_2,
            }}
            title="See what shipped"
          >
            <span style={{ color: TEXT_MID }}>v0.4</span>
            <span style={{ color: "rgba(167,139,250,0.55)" }}>·</span>
            <span>AI insights</span>
          </Link>
        </div>

        {/* Headline — staggered fade per line for subtle motion on first paint. */}
        <HeroHeadline
          lines={["See every trade.", "Before anyone else."]}
          className="font-semibold tracking-[-0.045em] leading-[0.94] mx-auto max-w-[15ch] text-[42px] sm:text-[72px] lg:text-[112px]"
          style={{
            background: "linear-gradient(180deg, #FFFFFF 0%, #B9C1D3 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
          }}
        />

        <p className="fadein-3 mt-5 sm:mt-7 text-[14.5px] sm:text-[16.5px] max-w-xl mx-auto leading-relaxed" style={{ color: TEXT_MID }}>
          The real-time desk for US Congressional disclosures, weighed against{" "}
          <span style={{ color: TEXT_HI }}>4 frontier AI minds</span>. Sub-30-second filing-to-feed latency.
        </p>

        <div className="fadein-4 mt-7 sm:mt-9 flex flex-wrap items-center gap-3 sm:gap-4 justify-center">
          {/* Primary CTA — larger pad, glow shadow, the obvious target. */}
          <Link
            href="/terminal"
            className="focus-ring inline-flex items-center gap-1.5 rounded-full px-5 sm:px-6 py-3 sm:py-3.5 text-[14px] sm:text-[15px] font-medium tracking-tight transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            style={{
              background: VIOLET_GRAD,
              color: "#fff",
              boxShadow: VIOLET_GLOW,
            }}
          >
            Open Terminal <span aria-hidden>→</span>
          </Link>
          {/* Secondary — quiet text link rather than another pill. */}
          <Link
            href="/methodology"
            className="focus-ring inline-flex items-center gap-1.5 text-[13.5px] sm:text-[14px] font-medium tracking-tight transition-colors hover:text-white"
            style={{ color: TEXT_MID }}
          >
            How we read filings <span aria-hidden style={{ color: TEXT_LOW }}>→</span>
          </Link>
        </div>
      </div>

      {/* Dashboard mockup */}
      <div className="fadein-5 relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 pb-12 sm:pb-20 lg:pb-24">
        <DeskMockup />
      </div>
    </section>
  );
}

function DeskMockup() {
  const rows = [
    { who: "Pelosi (D-CA)",     a: "BUY",  amt: "$5M–$25M",   t: "NVDA", time: "14:32:01" },
    { who: "Crenshaw (R-TX)",   a: "BUY",  amt: "$15K–$50K",  t: "LMT",  time: "14:18:42" },
    { who: "Tuberville (R-AL)", a: "SELL", amt: "$50K–$100K", t: "META", time: "13:47:11" },
    { who: "Khanna (D-CA)",     a: "BUY",  amt: "$1K–$15K",   t: "GOOGL",time: "12:09:28" },
    { who: "Greene (R-GA)",     a: "BUY",  amt: "$15K–$50K",  t: "DJT",  time: "11:54:03" },
    { who: "Issa (R-CA)",       a: "BUY",  amt: "$500K–$1M",  t: "AVGO", time: "09:18:00" },
  ];
  return (
    <div
      className="relative rounded-2xl overflow-hidden"
      style={{
        background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
        boxShadow:
          "0 100px 220px -50px rgba(0,0,0,0.95), 0 40px 120px -30px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.06), inset 0 1px 0 0 rgba(255,255,255,0.06)",
      }}
    >
      {/* Browser chrome */}
      <div className="flex items-center px-4 py-3 gap-2" style={{ background: BG_2, borderBottom: `1px solid ${LINE}` }}>
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
          <div className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
        </div>
        <div
          className="flex-1 mx-3 px-3 py-1.5 rounded-md text-[11px] flex items-center justify-center gap-1.5"
          style={{ background: "rgba(0,0,0,0.55)", border: `1px solid ${LINE}`, color: TEXT_MID }}
        >
          <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 10V8a6 6 0 0 1 12 0v2" stroke="currentColor" strokeWidth="2" />
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2" />
          </svg>
          autotrade.app/desk
        </div>
        <span className="font-mono text-[10.5px] tabular-nums" style={{ color: TEXT_LOW }}>14:32 ET</span>
      </div>

      {/* Sub-header metrics strip — 2x2 on mobile, 4-col on sm+ */}
      <div
        className="grid grid-cols-2 sm:grid-cols-4 gap-y-3 px-4 sm:px-7 py-3 sm:py-4"
        style={{ background: "rgba(255,255,255,0.012)", borderBottom: `1px solid ${LINE}` }}
      >
        {[
          { l: "Indexed today",   v: "213",    accent: TEXT_HI    },
          { l: "Concurrence",     v: "67%",    accent: VIOLET_2   },
          { l: "Top dissent",     v: "Grok 4", accent: YELLOW     },
          { l: "Filing-to-feed",  v: "28s",    accent: POSITIVE   },
        ].map((s) => (
          <div key={s.l}>
            <div className="font-mono text-[9px] sm:text-[9.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>{s.l}</div>
            <div className="mt-1 font-mono text-[16px] sm:text-[18px] font-semibold tabular-nums" style={{ color: s.accent }}>{s.v}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-4 lg:gap-6 p-4 sm:p-5 lg:p-7">
        {/* LEFT: filings table — Time + Bracket columns hide on mobile */}
        <div className="col-span-12 lg:col-span-7">
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>Today&rsquo;s filings</span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em]"
                style={{
                  background: `${YELLOW}15`,
                  color: YELLOW,
                  border: `1px solid ${YELLOW}40`,
                }}
              >
                <LivePulse size={6} color={YELLOW} />
                live
              </span>
            </div>
            <div className="font-mono text-[10px] sm:text-[10.5px]" style={{ color: TEXT_MID }}>
              <span className="sm:hidden">6/213</span>
              <span className="hidden sm:inline">6 of 213 · last 24h</span>
            </div>
          </div>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: LINE }}>
            {/* Header row — uses flex so columns can be hidden cleanly per breakpoint */}
            <div
              className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 text-[10px] uppercase tracking-[0.16em]"
              style={{ background: "rgba(255,255,255,0.02)", color: TEXT_LOW, borderBottom: `1px solid ${LINE}` }}
            >
              <div className="hidden sm:block w-[68px] shrink-0">Time</div>
              <div className="flex-1 min-w-0">Member</div>
              <div className="w-10 shrink-0">Side</div>
              <div className="hidden md:block w-[100px] shrink-0">Bracket</div>
              <div className="w-14 shrink-0 text-right">Ticker</div>
            </div>
            {rows.map((f, i) => {
              const isFeatured = f.t === "NVDA" && f.a === "BUY";
              return (
                <div
                  key={i}
                  className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-2.5 sm:py-3 font-mono text-[11.5px] sm:text-[12px] relative"
                  style={{
                    borderBottom: i < rows.length - 1 ? `1px solid ${LINE}` : "none",
                    color: TEXT_HI,
                    background: isFeatured
                      ? `linear-gradient(90deg, rgba(124,95,255,0.08) 0%, transparent 100%)`
                      : undefined,
                  }}
                >
                  {isFeatured && (
                    <span
                      className="absolute left-0 top-0 bottom-0 w-[2px]"
                      style={{ background: VIOLET, boxShadow: `0 0 8px ${VIOLET}` }}
                    />
                  )}
                  <div className="hidden sm:block w-[68px] shrink-0" style={{ color: TEXT_LOW }}>{f.time}</div>
                  <div className="flex-1 min-w-0 truncate">{f.who}</div>
                  <div className="w-10 shrink-0 font-semibold" style={{ color: f.a === "BUY" ? POSITIVE : NEGATIVE }}>{f.a}</div>
                  <div className="hidden md:block w-[100px] shrink-0" style={{ color: TEXT_MID }}>{f.amt}</div>
                  <div className="w-14 shrink-0 text-right" style={{ color: YELLOW }}>{f.t}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT: consensus + sparkline */}
        <div className="col-span-12 lg:col-span-5 space-y-4">
          {/* CONSENSUS — now in a violet-gradient hero card */}
          <div
            className="relative rounded-lg p-4 sm:p-5 overflow-hidden"
            style={{
              background: "linear-gradient(160deg, rgba(124,95,255,0.18) 0%, rgba(79,57,216,0.08) 60%, rgba(255,255,255,0.01) 100%)",
              border: `1px solid rgba(124,95,255,0.30)`,
              boxShadow: `0 30px 60px -30px ${VIOLET}55, inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            {/* Inner highlight */}
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.10) 0%, transparent 60%)" }}
            />

            <div className="relative flex items-center justify-between mb-2">
              <span className="text-[10.5px] uppercase tracking-[0.16em]" style={{ color: VIOLET_2 }}>Consensus pick · today</span>
              <span
                className="inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] rounded-sm"
                style={{ background: YELLOW, color: BG }}
              >
                Trade of the day
              </span>
            </div>
            <div className="relative flex items-baseline gap-2 sm:gap-3 flex-wrap">
              <span className="font-mono text-[36px] sm:text-[44px] font-semibold leading-none tabular-nums tracking-[-0.02em]" style={{ color: TEXT_HI, textShadow: `0 0 24px ${VIOLET}66` }}>
                NVDA
              </span>
              <span className="font-mono text-[12px] sm:text-[13px] tabular-nums" style={{ color: POSITIVE }}>+2.41% today</span>
            </div>
            <div className="relative mt-5">
              <div className="flex items-center justify-between text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_MID }}>
                <span>Agreement</span><span className="font-mono tabular-nums text-white">3 / 4</span>
              </div>
              <div className="mt-2 flex gap-1">
                {[true, true, true, false].map((on, i) => (
                  <div key={i} className="flex-1 h-2.5 rounded-sm" style={{
                    background: on ? POSITIVE : "rgba(255,255,255,0.10)",
                    boxShadow: on ? `0 0 12px ${POSITIVE}80` : "none",
                  }} />
                ))}
              </div>
              <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[9.5px] font-mono uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
                {["GPT5","Claude","Gemini","Grok"].map((n, i) => (
                  <div key={n} style={{ color: i < 3 ? TEXT_MID : NEGATIVE }}>{n}</div>
                ))}
              </div>
            </div>
          </div>

          {/* SPARKLINE — now with model overlays */}
          <div className="rounded-lg p-4 sm:p-5 border" style={{ borderColor: LINE_2, background: "rgba(255,255,255,0.015)" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[10px] sm:text-[10.5px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>NVDA · 30d</div>
              <div className="font-mono text-[10px] sm:text-[10.5px]" style={{ color: TEXT_MID }}>since first filing</div>
            </div>
            <svg viewBox="0 0 320 90" className="w-full h-[90px]" aria-hidden>
              <defs>
                <linearGradient id="sparkfill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={VIOLET} stopOpacity="0.40" />
                  <stop offset="100%" stopColor={VIOLET} stopOpacity="0" />
                </linearGradient>
                <linearGradient id="sparkLine" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor={VIOLET} />
                  <stop offset="100%" stopColor={VIOLET_2} />
                </linearGradient>
              </defs>
              {/* Grid dots */}
              {[18, 36, 54, 72].map((y) => (
                <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="rgba(255,255,255,0.03)" strokeDasharray="2 4" />
              ))}
              {/* Faint ghost line — model picks before consensus */}
              <path
                d="M0 68 L 20 64 L 40 66 L 60 60 L 80 58 L 100 56 L 120 50 L 140 48 L 160 44 L 180 42 L 200 38 L 220 36 L 240 32 L 260 28 L 280 24 L 300 22 L 320 18"
                stroke={YELLOW} strokeWidth="1" fill="none" strokeOpacity="0.35" strokeDasharray="2 3"
              />
              {/* Main NVDA path */}
              <path d="M0 70 L 20 64 L 40 66 L 60 56 L 80 58 L 100 50 L 120 48 L 140 40 L 160 42 L 180 32 L 200 28 L 220 30 L 240 20 L 260 18 L 280 12 L 300 16 L 320 8 L 320 90 L 0 90 Z" fill="url(#sparkfill2)" />
              <path d="M0 70 L 20 64 L 40 66 L 60 56 L 80 58 L 100 50 L 120 48 L 140 40 L 160 42 L 180 32 L 200 28 L 220 30 L 240 20 L 260 18 L 280 12 L 300 16 L 320 8" stroke="url(#sparkLine)" strokeWidth="2" fill="none" />
              <circle cx="320" cy="8" r="3.5" fill={VIOLET_2} />
              <circle cx="320" cy="8" r="6" fill="none" stroke={VIOLET_2} strokeOpacity="0.5" />
              {/* Filing event markers */}
              <circle cx="180" cy="32" r="3" fill={YELLOW} />
              <circle cx="240" cy="20" r="3" fill={YELLOW} />
            </svg>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-[2px]" style={{ background: VIOLET_2 }} />
                <span style={{ color: TEXT_MID }}>price</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-[2px]" style={{ background: YELLOW }} />
                <span style={{ color: TEXT_MID }}>filings</span>
              </div>
              <div className="text-right" style={{ color: POSITIVE }}>+18.4% replicated</div>
            </div>
          </div>
        </div>
      </div>

      {/* Status footer */}
      <div
        className="px-5 py-3 flex items-center justify-between text-[10.5px] uppercase tracking-[0.16em] font-mono"
        style={{ background: BG_2, color: TEXT_LOW, borderTop: `1px solid ${LINE}` }}
      >
        <span>healthy · 538 lawmakers · 4 minds · sub-30s</span>
        <span style={{ color: POSITIVE }}>● live</span>
      </div>
    </div>
  );
}

/* ============================================================================
   BROKERS
   ========================================================================== */
function DarkBrokers() {
  const brokers = ["Robinhood", "Schwab", "Fidelity", "IBKR", "Webull", "TradeStation", "E*TRADE", "M1"];
  return (
    <section style={{ borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-12 py-8 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-y-6 gap-x-12 items-center">
          <div>
            <div className="text-[10px] uppercase tracking-[0.18em] font-medium" style={{ color: TEXT_LOW }}>Brokers</div>
            <p className="mt-2 text-[14.5px]" style={{ color: TEXT_MID }}>
              Connects to the brokerages <span style={{ color: VIOLET_2 }}>traders already trust</span>.
            </p>
          </div>
          <div className="grid grid-cols-4 lg:grid-cols-8 gap-x-2 gap-y-5">
            {brokers.map((b) => (
              <div key={b} className="text-center text-[12.5px] font-medium tracking-tight transition-colors hover:text-white" style={{ color: TEXT_MID }}>{b}</div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   TICKER (mono filings marquee)
   ========================================================================== */
function DarkTicker() {
  const ticks = [
    { who: "Pelosi",     a: "bought", t: "NVDA" },
    { who: "Crenshaw",   a: "bought", t: "LMT"  },
    { who: "Tuberville", a: "sold",   t: "META" },
    { who: "Khanna",     a: "bought", t: "GOOGL"},
    { who: "Greene",     a: "bought", t: "DJT"  },
    { who: "Wexton",     a: "sold",   t: "DIS"  },
    { who: "Issa",       a: "bought", t: "AVGO" },
    { who: "Schiff",     a: "bought", t: "MSFT" },
    { who: "Gottheimer", a: "bought", t: "AMD"  },
    { who: "Khanna",     a: "bought", t: "AMD"  },
  ];
  // Duplicate enough copies so the loop stays seamless on wide viewports
  const list = [...ticks, ...ticks, ...ticks];
  return (
    <div
      className="relative overflow-hidden"
      style={{
        background: BG,
        borderTop: `1px solid ${LINE}`,
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      {/* Live status pill anchored at the leading edge */}
      <div
        className="absolute top-1/2 -translate-y-1/2 left-4 z-10 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em]"
        style={{
          background: "rgba(124,95,255,0.10)",
          border: `1px solid rgba(124,95,255,0.30)`,
          color: VIOLET_2,
        }}
      >
        <span className="w-1.5 h-1.5 rounded-full pulse-dot" style={{ background: POSITIVE, boxShadow: `0 0 10px ${POSITIVE}99` }} />
        live · {ticks.length}/day
      </div>

      <div className="flex animate-[ticker_70s_linear_infinite] hover:[animation-play-state:paused] whitespace-nowrap py-3 font-mono text-[12px] pl-32">
        {list.map((tk, i) => (
          <span key={i} className="px-6 inline-flex items-center gap-2" style={{ color: TEXT_MID }}>
            <span style={{ color: TEXT_LOW }}>{tk.who}</span>
            <span style={{ color: tk.a === "bought" ? POSITIVE : NEGATIVE }}>{tk.a}</span>
            <span style={{ color: YELLOW }}>{tk.t}</span>
            <span style={{ color: TEXT_DIM }}>·</span>
          </span>
        ))}
      </div>

      {/* Edge fades use the same BG token so there's no color seam at the borders */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-40" style={{ background: `linear-gradient(to right, ${BG} 50%, transparent)` }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-40" style={{ background: `linear-gradient(to left, ${BG}, transparent)` }} />
    </div>
  );
}

/* ============================================================================
   FOUR MINDS
   ========================================================================== */
type DarkMind = {
  name: string; house: string; accent: string; dissent: boolean;
  pick: string; conf: number;
  ytd: number; spark: number[];
  topHoldings: { ticker: string; weight: number }[];
  recentPicks: { date: string; ticker: string; agree: boolean }[];
  rationale: string;
};

const DARK_MINDS: DarkMind[] = [
  {
    name: "GPT-5", house: "OpenAI", accent: "#10B981", dissent: false,
    pick: "NVDA", conf: 92, ytd: +14.2,
    spark: [50,52,51,54,56,55,58,61,60,63,66,68,70,72,75,77,80,83,85,87,89],
    topHoldings: [{ ticker: "NVDA", weight: 18 }, { ticker: "AAPL", weight: 14 }, { ticker: "MSFT", weight: 12 }],
    recentPicks: [
      { date: "Jan 22", ticker: "NVDA",  agree: true  },
      { date: "Jan 15", ticker: "AAPL",  agree: true  },
      { date: "Jan 08", ticker: "MSFT",  agree: false },
      { date: "Jan 01", ticker: "NVDA",  agree: true  },
      { date: "Dec 25", ticker: "GOOGL", agree: true  },
    ],
    rationale: "Datacenter capex up 41% QoQ. Three lawmakers added the day prior.",
  },
  {
    name: "Claude Opus 4.8", house: "Anthropic", accent: "#F59E0B", dissent: false,
    pick: "NVDA", conf: 88, ytd: +11.6,
    spark: [50,51,52,53,55,54,57,58,60,62,63,65,66,68,70,71,73,75,76,78,80],
    topHoldings: [{ ticker: "NVDA", weight: 16 }, { ticker: "GOOGL", weight: 13 }, { ticker: "AVGO", weight: 11 }],
    recentPicks: [
      { date: "Jan 22", ticker: "NVDA",  agree: true  },
      { date: "Jan 15", ticker: "GOOGL", agree: false },
      { date: "Jan 08", ticker: "MSFT",  agree: false },
      { date: "Jan 01", ticker: "NVDA",  agree: true  },
      { date: "Dec 25", ticker: "AAPL",  agree: true  },
    ],
    rationale: "Five Senate filings cluster around NVDA in the last seven trading days.",
  },
  {
    name: "Gemini 2.5", house: "Google", accent: "#3B82F6", dissent: false,
    pick: "NVDA", conf: 84, ytd: +8.4,
    spark: [50,49,50,52,51,53,52,54,55,57,56,58,60,61,62,64,65,66,68,69,70],
    topHoldings: [{ ticker: "NVDA", weight: 14 }, { ticker: "MSFT", weight: 13 }, { ticker: "META", weight: 11 }],
    recentPicks: [
      { date: "Jan 22", ticker: "NVDA",  agree: true  },
      { date: "Jan 15", ticker: "AAPL",  agree: true  },
      { date: "Jan 08", ticker: "MSFT",  agree: false },
      { date: "Jan 01", ticker: "MSFT",  agree: false },
      { date: "Dec 25", ticker: "GOOGL", agree: true  },
    ],
    rationale: "Cross-checked against twelve lawmaker filings. Confidence interval narrow.",
  },
  {
    name: "Grok 4", house: "xAI", accent: "#8B5CF6", dissent: true,
    pick: "AMD", conf: 61, ytd: -2.7,
    spark: [50,51,50,49,51,49,50,48,49,48,47,48,46,47,45,46,44,45,43,44,42],
    topHoldings: [{ ticker: "AMD", weight: 14 }, { ticker: "DJT", weight: 11 }, { ticker: "TSLA", weight: 10 }],
    recentPicks: [
      { date: "Jan 22", ticker: "AMD",  agree: false },
      { date: "Jan 15", ticker: "DJT",  agree: false },
      { date: "Jan 08", ticker: "TSLA", agree: false },
      { date: "Jan 01", ticker: "MAGA", agree: false },
      { date: "Dec 25", ticker: "AMD",  agree: false },
    ],
    rationale: "Sees inventory overhang on NVDA. Rotates to AMD on supply-side argument.",
  },
];

function DarkFourMinds() {
  return (
    <section id="minds" className="relative overflow-hidden">
      <div className="absolute inset-0 z-0"><Atmosphere tint="mixed" intensity={0.85} /></div>

      <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-12 py-14 sm:py-20 lg:py-32 text-center">
        <div className="text-[10.5px] uppercase tracking-[0.18em] font-mono" style={{ color: TEXT_LOW }}>
          Section II · The Minds
        </div>
        <h2
          className="mt-4 sm:mt-5 font-semibold tracking-[-0.04em] leading-[0.97] text-[36px] sm:text-[64px] lg:text-[92px] max-w-3xl mx-auto"
          style={{
            background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)",
            WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent",
          }}
        >
          Four frontier models. One ledger.
        </h2>
        <p className="mt-4 sm:mt-6 text-[14px] sm:text-[15.5px] max-w-2xl mx-auto" style={{ color: TEXT_MID }}>
          Same prompt. Every Monday at 09:00 ET. Their portfolios snapshotted forward — never backfilled.
        </p>

        {/* Contained panel — masks the diagonal beams so they don't bleed through the cards */}
        <div
          className="mt-10 sm:mt-14 relative rounded-2xl p-3 sm:p-5 lg:p-6"
          style={{
            background: "linear-gradient(180deg, rgba(8,9,12,0.92) 0%, rgba(5,5,8,0.96) 100%)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow:
              "0 60px 140px -40px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.05)",
          }}
        >
          {/* Inner micro-grain */}
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.04] rounded-2xl pointer-events-none"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")",
              backgroundSize: "160px 160px",
            }}
          />

          {/* MOBILE: horizontal snap carousel (Stripe/iOS pattern — one card visible, swipe to next).
              LG: 4-col grid as before. */}
          <div
            className="relative flex lg:grid lg:grid-cols-4 gap-3.5 text-left overflow-x-auto lg:overflow-visible snap-x snap-mandatory lg:snap-none -mx-3 sm:-mx-5 lg:mx-0 px-3 sm:px-5 lg:px-0 pb-2 lg:pb-0 scroll-pl-3 sm:scroll-pl-5"
            style={{ scrollbarWidth: "none" }}
          >
            {DARK_MINDS.map((m, i) => (
              <div
                key={m.name}
                className="snap-start shrink-0 lg:shrink w-[85%] sm:w-[60%] lg:w-auto"
              >
                <DarkMindCard m={m} no={i + 1} />
              </div>
            ))}
          </div>

          {/* Subtle hint that there's more to scroll on mobile */}
          <div
            className="lg:hidden mt-3 flex items-center justify-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: TEXT_LOW }}
          >
            <span>swipe</span>
            <span aria-hidden>→</span>
          </div>
        </div>
      </div>
    </section>
  );
}

function DarkMindCard({ m, no }: { m: DarkMind; no: number }) {
  const ytdColor = m.ytd >= 0 ? POSITIVE : NEGATIVE;
  return (
    <article
      className="relative rounded-2xl overflow-hidden flex flex-col transition-transform hover:-translate-y-0.5"
      style={{
        background: m.dissent
          ? "linear-gradient(180deg, rgba(239,68,68,0.06) 0%, rgba(239,68,68,0.02) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
        border: `1px solid ${m.dissent ? "rgba(239,68,68,0.35)" : LINE_2}`,
        boxShadow: m.dissent
          ? "0 0 24px -6px rgba(239,68,68,0.25)"
          : "inset 0 1px 0 rgba(255,255,255,0.04)",
      }}
    >
      {/* Header */}
      <header
        className="px-5 pt-5 pb-4 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full shrink-0"
            style={{ background: m.accent, boxShadow: `0 0 10px ${m.accent}` }}
          />
          <span className="text-[13.5px] font-semibold tracking-tight truncate" style={{ color: TEXT_HI }}>{m.name}</span>
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] shrink-0" style={{ color: TEXT_LOW }}>
          {m.house}
        </span>
      </header>

      {/* This week */}
      <div className="px-5 pt-4 pb-4">
        <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
          This week&rsquo;s pick
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-mono text-[28px] font-semibold tabular-nums tracking-[-0.02em]" style={{ color: TEXT_HI }}>{m.pick}</span>
          <span className="text-[11px] font-mono uppercase tracking-[0.16em]" style={{ color: m.dissent ? NEGATIVE : POSITIVE }}>
            {m.dissent ? "dissent" : "concurs"}
          </span>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            <span>Confidence</span>
            <span className="tabular-nums" style={{ color: TEXT_HI }}>{m.conf}%</span>
          </div>
          <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
            <div
              className="h-full rounded-full"
              style={{
                width: `${m.conf}%`,
                background: m.dissent ? NEGATIVE : `linear-gradient(90deg, ${VIOLET}, ${VIOLET_2})`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Portfolio perf — no chart, just the number as the visual anchor */}
      <div className="px-5 pt-5 pb-5" style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="flex items-baseline justify-between">
          <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            Portfolio YTD
          </div>
          <div className="font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            top · <span style={{ color: TEXT_HI }}>{m.topHoldings[0].ticker}</span>
          </div>
        </div>
        <div
          className="font-mono text-[34px] font-semibold tabular-nums mt-2 leading-none tracking-[-0.02em]"
          style={{ color: ytdColor }}
        >
          {m.ytd >= 0 ? "+" : ""}{m.ytd.toFixed(1)}%
        </div>
        <div className="mt-1.5 font-mono text-[10.5px] tabular-nums" style={{ color: TEXT_LOW }}>
          vs S&amp;P 500 <span style={{ color: TEXT_HI }}>+8.2%</span>
        </div>
      </div>

      {/* Recent picks */}
      <div className="px-5 pt-4 pb-3 flex-1" style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2" style={{ color: TEXT_LOW }}>
          Last 5 picks
        </div>
        <ul className="space-y-1.5">
          {m.recentPicks.map((p, i) => (
            <li key={i} className="flex items-center gap-2 text-[11.5px]">
              <span aria-hidden className="font-mono" style={{ color: p.agree ? POSITIVE : NEGATIVE }}>
                {p.agree ? "●" : "○"}
              </span>
              <span className="font-mono w-12 shrink-0" style={{ color: TEXT_LOW }}>{p.date}</span>
              <span className="font-mono" style={{ color: TEXT_HI }}>{p.ticker}</span>
              <span className="ml-auto font-mono text-[10px] uppercase tracking-[0.16em]" style={{ color: p.agree ? POSITIVE : NEGATIVE }}>
                {p.agree ? "concur" : "dissent"}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Rationale */}
      <p
        className="px-5 py-3 text-[12px] leading-relaxed"
        style={{
          color: TEXT_MID,
          borderTop: `1px solid ${LINE}`,
          background: "rgba(255,255,255,0.012)",
        }}
      >
        {m.rationale}
      </p>

      <div
        className="absolute top-3 right-3 font-mono text-[9.5px] tabular-nums"
        style={{ color: TEXT_DIM }}
      >
        No. 0{no}
      </div>
    </article>
  );
}

/* ============================================================================
   ROSTER
   ========================================================================== */
type DarkRep = {
  n: string; party: "D" | "R" | "I"; district: string; term: number; ytd: number; spark: number[];
  filings: number; daysSince: number;
  trades: { dir: "buy" | "sell"; ticker: string; date: string; bracket: string }[];
};

const DARK_REPS: DarkRep[] = [
  { n: "Nancy Pelosi",       party: "D", district: "CA-11", term: 19, ytd: +18.4, filings: 14, daysSince: 8,
    spark: [40,42,41,44,47,46,50,52,51,55,58,57,62,64,66,68,71,73,76,78,82],
    trades: [
      { dir: "buy",  ticker: "NVDA",  date: "Jan 14", bracket: "$5M–$25M"   },
      { dir: "buy",  ticker: "GOOGL", date: "Jan 16", bracket: "$50K–$100K" },
      { dir: "sell", ticker: "DIS",   date: "Dec 30", bracket: "$15K–$50K"  },
    ],
  },
  { n: "Dan Crenshaw",       party: "R", district: "TX-2",  term: 4,  ytd: +12.1, filings: 9, daysSince: 1,
    spark: [50,49,52,54,53,55,57,58,60,59,61,63,64,66,68,67,69,71,72,73,75],
    trades: [
      { dir: "buy",  ticker: "LMT", date: "Jan 21", bracket: "$15K–$50K"  },
      { dir: "buy",  ticker: "RTX", date: "Jan 09", bracket: "$50K–$100K" },
      { dir: "sell", ticker: "BA",  date: "Dec 28", bracket: "$1K–$15K"   },
    ],
  },
  { n: "T. Tuberville",      party: "R", district: "AL-S",  term: 2,  ytd: -3.2,  filings: 27, daysSince: 2,
    spark: [62,60,61,58,59,57,56,58,55,54,55,52,53,51,52,50,51,49,50,48,47],
    trades: [
      { dir: "sell", ticker: "META", date: "Jan 20", bracket: "$50K–$100K" },
      { dir: "buy",  ticker: "F",    date: "Jan 12", bracket: "$1K–$15K"   },
      { dir: "sell", ticker: "NFLX", date: "Jan 05", bracket: "$15K–$50K"  },
    ],
  },
  { n: "Ro Khanna",          party: "D", district: "CA-17", term: 5,  ytd: +9.7,  filings: 11, daysSince: 4,
    spark: [48,49,50,51,52,53,54,53,55,56,57,58,59,60,61,62,63,64,65,66,67],
    trades: [
      { dir: "buy", ticker: "GOOGL", date: "Jan 18", bracket: "$15K–$50K"  },
      { dir: "buy", ticker: "AMD",   date: "Jan 11", bracket: "$1K–$15K"   },
      { dir: "buy", ticker: "MSFT",  date: "Jan 03", bracket: "$50K–$100K" },
    ],
  },
  { n: "M. T. Greene",       party: "R", district: "GA-14", term: 3,  ytd: +22.0, filings: 19, daysSince: 6,
    spark: [44,46,48,47,50,52,55,57,59,62,64,67,69,72,75,78,80,83,85,87,90],
    trades: [
      { dir: "buy", ticker: "DJT",  date: "Jan 16", bracket: "$15K–$50K"  },
      { dir: "buy", ticker: "TSLA", date: "Jan 08", bracket: "$50K–$100K" },
      { dir: "buy", ticker: "MAGA", date: "Dec 21", bracket: "$1K–$15K"   },
    ],
  },
  { n: "Josh Gottheimer",    party: "D", district: "NJ-5",  term: 5,  ytd: +4.8,  filings: 7,  daysSince: 9,
    spark: [50,51,50,52,51,53,52,54,53,55,54,56,55,57,56,58,57,59,58,60,59],
    trades: [
      { dir: "buy",  ticker: "AVGO", date: "Jan 13", bracket: "$15K–$50K" },
      { dir: "buy",  ticker: "JPM",  date: "Jan 07", bracket: "$50K–$100K"},
      { dir: "sell", ticker: "GS",   date: "Dec 29", bracket: "$15K–$50K" },
    ],
  },
  { n: "Darrell Issa",       party: "R", district: "CA-48", term: 8,  ytd: +6.4,  filings: 12, daysSince: 3,
    spark: [50,51,52,53,52,54,55,54,56,57,56,58,59,58,60,61,60,62,63,62,64],
    trades: [
      { dir: "buy", ticker: "AVGO", date: "Jan 19", bracket: "$500K–$1M"   },
      { dir: "buy", ticker: "MSFT", date: "Jan 14", bracket: "$100K–$250K" },
      { dir: "buy", ticker: "NVDA", date: "Jan 06", bracket: "$50K–$100K"  },
    ],
  },
  { n: "Adam Schiff",        party: "D", district: "CA-S",  term: 1,  ytd: +2.1,  filings: 5,  daysSince: 12,
    spark: [50,50,51,51,52,52,53,53,52,52,53,53,54,54,53,53,54,54,53,53,53],
    trades: [
      { dir: "buy",  ticker: "MSFT", date: "Jan 10", bracket: "$15K–$50K"  },
      { dir: "sell", ticker: "META", date: "Jan 02", bracket: "$50K–$100K" },
      { dir: "buy",  ticker: "BRK.B",date: "Dec 24", bracket: "$15K–$50K"  },
    ],
  },
];

function DarkRoster() {
  return (
    <section id="roster" style={{ borderTop: `1px solid ${LINE}` }}>
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-12 py-14 sm:py-20 lg:py-32">
        {/* 2-col header — title left, description + filter chips right (mirrors light layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-y-8 gap-x-12 items-end mb-12">
          <div className="lg:col-span-7">
            <div className="text-[10.5px] uppercase tracking-[0.18em] font-mono" style={{ color: VIOLET_2 }}>
              Section III · The Roster
            </div>
            <h2
              className="mt-3 font-semibold tracking-[-0.04em] leading-[1.04] text-[44px] sm:text-[64px] lg:text-[76px]"
              style={{
                background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              538 lawmakers.{" "}
              <span style={{ background: "none", color: TEXT_MID, WebkitTextFillColor: TEXT_MID }}>Indexed daily.</span>
            </h2>
          </div>
          <div className="lg:col-span-5 max-w-md">
            <p className="text-[15.5px] leading-[1.6]" style={{ color: TEXT_MID }}>
              Every sitting US Representative and Senator. PTRs ingested daily from
              the official House Clerk feed and Senate eFD. Returns recalculated on close.
            </p>
            <div className="mt-5 flex flex-wrap gap-1.5">
              {[
                { l: "All 538",     active: true  },
                { l: "House",       active: false },
                { l: "Senate",      active: false },
                { l: "D",           active: false },
                { l: "R",           active: false },
                { l: "Top 1Y",      active: false },
                { l: "Most active", active: false },
              ].map((c) => (
                <span
                  key={c.l}
                  className="inline-flex items-center rounded-full px-3 py-1 text-[11.5px] font-medium cursor-pointer transition-colors"
                  style={
                    c.active
                      ? {
                          background: VIOLET_GRAD,
                          color: "#fff",
                          border: `1px solid ${VIOLET}`,
                          boxShadow: `0 8px 20px -8px ${VIOLET}99`,
                        }
                      : {
                          background: "rgba(255,255,255,0.04)",
                          color: TEXT_HI,
                          border: `1px solid ${LINE_2}`,
                        }
                  }
                >
                  {c.l}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* 2-col mobile / 4-col desktop. Just 4 cards — one row on desktop,
            two rows on mobile. Section's job is to demonstrate breadth, the
            "Open the full roster →" link below carries the depth. */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {DARK_REPS.slice(0, 4).map((p) => <DarkRepCard key={p.n} p={p} />)}
        </div>

        <div className="mt-8 sm:mt-10 flex items-center justify-between gap-3 flex-wrap" style={{ borderTop: `1px solid ${LINE}`, paddingTop: "1.25rem" }}>
          <div className="text-[11px] sm:text-[12px] font-mono" style={{ color: TEXT_LOW }}>
            4 of 538 · sorted by recency
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-[12.5px] sm:text-[13px] font-medium"
            style={{
              background: "rgba(124,95,255,0.10)",
              color: VIOLET_2,
              border: `1px solid rgba(124,95,255,0.30)`,
            }}
          >
            Open the full roster (538) <span aria-hidden>→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

function DarkRepCard({ p }: { p: DarkRep }) {
  const positive = p.ytd >= 0;
  const ytdColor = positive ? POSITIVE : NEGATIVE;
  const partyC = p.party === "D" ? "#60A5FA" : p.party === "R" ? NEGATIVE : TEXT_LOW;

  return (
    <article
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg flex flex-col"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${LINE_2}`,
        boxShadow: "0 20px 40px -28px rgba(0,0,0,0.7)",
      }}
    >
      {/* Header */}
      <header className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2.5 sm:pb-3 flex items-start justify-between gap-3" style={{ borderBottom: `1px solid ${LINE}` }}>
        <div className="min-w-0">
          <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
            {p.district} · {p.term}{ordinalSuffix(p.term)} term
          </div>
          <h3 className="text-[15px] sm:text-[18px] font-semibold tracking-tight mt-1 truncate" style={{ color: TEXT_HI }}>
            {p.n}
          </h3>
        </div>
        <span
          className="shrink-0 inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 font-mono text-[10px] sm:text-[11px] font-bold rounded-sm"
          style={{ color: partyC, border: `1px solid ${partyC}`, background: `${partyC}10` }}
          aria-label={`Party: ${p.party}`}
        >
          {p.party}
        </span>
      </header>

      {/* Performance */}
      <div className="px-3 sm:px-4 pt-3 sm:pt-4 pb-3">
        <div className="flex items-end justify-between gap-3">
          <div>
            <div className="font-mono text-[9px] sm:text-[10px] uppercase tracking-[0.16em]" style={{ color: TEXT_LOW }}>
              YTD return
            </div>
            <div
              className="font-mono text-[22px] sm:text-[28px] leading-none mt-1.5 tabular-nums tracking-[-0.02em]"
              style={{
                color: ytdColor,
                textShadow: positive ? "0 0 18px rgba(74,222,128,0.35)" : "0 0 18px rgba(248,113,113,0.30)",
              }}
            >
              {positive ? "+" : ""}{p.ytd.toFixed(1)}%
            </div>
          </div>
          <span className="font-mono text-[10.5px] sm:text-[11px] pb-1 tabular-nums" style={{ color: TEXT_LOW }}>
            {p.filings} filings
          </span>
        </div>

        {/* Sparkline visible on sm+; hidden on mobile to keep card compact */}
        <div className="mt-3 -mx-0.5 hidden sm:block">
          <DarkSparkline points={p.spark} positive={positive} />
        </div>
      </div>

      {/* Recent trades — hidden on mobile, the YTD + filings count alone is the mobile summary */}
      <div className="hidden sm:block px-3 sm:px-4 py-3 flex-1" style={{ borderTop: `1px solid ${LINE}` }}>
        <div className="font-mono text-[10px] uppercase tracking-[0.16em] mb-2.5" style={{ color: TEXT_LOW }}>
          Last filings
        </div>
        <ul className="space-y-1.5">
          {p.trades.map((t, i) => {
            const buy = t.dir === "buy";
            return (
              <li key={i} className="flex items-center gap-2 text-[11.5px]">
                <span aria-hidden className="font-mono" style={{ color: buy ? POSITIVE : NEGATIVE }}>
                  {buy ? "▲" : "▼"}
                </span>
                <span className="font-mono w-12 shrink-0" style={{ color: TEXT_HI }}>{t.ticker}</span>
                <span className="font-mono w-12 shrink-0" style={{ color: TEXT_LOW }}>{t.date}</span>
                <span className="font-mono ml-auto text-[10.5px] tabular-nums" style={{ color: TEXT_LOW }}>{t.bracket}</span>
              </li>
            );
          })}
        </ul>
      </div>

      {/* Footer */}
      <footer
        className="px-3 sm:px-4 py-2 sm:py-2.5 flex items-center justify-between text-[10px] sm:text-[10.5px] font-mono"
        style={{ borderTop: `1px solid ${LINE}`, background: "rgba(255,255,255,0.015)", color: TEXT_LOW }}
      >
        <span>filed {p.daysSince}d ago</span>
        <span className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: TEXT_HI }}>open desk →</span>
      </footer>
    </article>
  );
}

function ordinalSuffix(n: number) {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return s[(v - 20) % 10] || s[v] || s[0];
}

function DarkSparkline({ points, positive }: { points: number[]; positive: boolean }) {
  const w = 240, h = 38;
  const min = Math.min(...points), max = Math.max(...points);
  const range = max - min || 1;
  const step = w / (points.length - 1);
  const path = points
    .map((v, i) => `${i === 0 ? "M" : "L"} ${(i * step).toFixed(1)} ${(h - ((v - min) / range) * h).toFixed(1)}`)
    .join(" ");
  const last = points[points.length - 1];
  const lastY = h - ((last - min) / range) * h;
  const color = positive ? "#4ADE80" : "#F87171";
  const id = `gx${Math.floor(points[0] * 17)}-${positive ? "p" : "n"}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[38px]" aria-hidden>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={w} cy={lastY} r="2.4" fill={color} />
    </svg>
  );
}

/* ============================================================================
   STATS SLAB — Alltra ending pattern
   ========================================================================== */
function DarkStats() {
  return (
    <section style={{ background: BG_2, borderTop: `1px solid ${LINE}`, borderBottom: `1px solid ${LINE}` }}>
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-12 py-14 sm:py-18 lg:py-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="text-[12px] font-medium tracking-tight" style={{ color: VIOLET_2 }}>
            By the numbers
          </div>
          <h2
            className="mt-3 font-semibold tracking-[-0.03em] leading-[1.04] text-[36px] sm:text-[48px]"
            style={{ color: "#fff" }}
          >
            What sits behind every page.
          </h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-y-10 gap-x-6">
          {[
            { v: "538",   l: "lawmakers indexed",    s: "House + Senate" },
            { v: "4",     l: "frontier minds",        s: "Same prompt, every Monday" },
            { v: "$2.4B", l: "in disclosed trades",   s: "2024 – present" },
            { v: "<30s",  l: "filing-to-feed latency",s: "From Clerk ZIP to index" },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div
                className="font-semibold tracking-[-0.04em] tabular-nums leading-none text-[60px] sm:text-[84px]"
                style={{
                  background: "linear-gradient(180deg, #ffffff 0%, #B9B0E5 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {s.v}
              </div>
              <div className="mt-3 text-[13.5px] font-medium" style={{ color: "#fff" }}>{s.l}</div>
              <div className="mt-1 text-[11.5px]" style={{ color: TEXT_LOW }}>{s.s}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   TESTIMONIAL — dark-themed quote slab w/ glass orb visual
   ========================================================================== */
function DarkTestimonial() {
  return (
    <section className="max-w-[1280px] mx-auto px-6 lg:px-12 py-14 sm:py-20 lg:py-32 text-center relative">
      <DarkTestimonialOrb />
      <p
        className="mt-9 mx-auto max-w-3xl font-semibold tracking-[-0.02em] text-[24px] sm:text-[32px] leading-[1.25]"
        style={{ color: "#fff" }}
      >
        &ldquo;The first dataset where we can compare what our reps actually
        bought to what every leading AI thinks they should have bought —{" "}
        <span style={{ color: TEXT_MID }}>side by side, source-linked, and dated.</span>&rdquo;
      </p>
      <div className="mt-7 text-[13px]" style={{ color: TEXT_LOW }}>
        Kuro Matsuda, <span style={{ color: "#fff" }}>Markets desk at Punchbowl</span>
      </div>
      <Link
        href="/"
        className="mt-5 inline-flex items-center gap-1 text-[13px] font-medium"
        style={{ color: VIOLET_2 }}
      >
        Read the story <span aria-hidden>→</span>
      </Link>
    </section>
  );
}

/* Holographic glass orb — dark-themed variant of the light testimonial orb.
   Same construction, palette tuned to the dark page's violet/yellow accents
   with a brighter outer halo so it glows against the dark surface. */
function DarkTestimonialOrb() {
  return (
    <div className="relative w-[128px] h-[128px] mx-auto">
      {/* Outer halo — brighter so it glows against dark BG */}
      <div
        aria-hidden
        className="absolute -inset-8 rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(124,95,255,0.55) 0%, rgba(247,210,74,0.20) 40%, rgba(217,70,239,0.18) 60%, transparent 75%)",
          filter: "blur(22px)",
        }}
      />

      <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
        <defs>
          <radialGradient id="orbCoreDark" cx="35%" cy="30%" r="80%">
            <stop offset="0%"   stopColor="#FFF1D6" />
            <stop offset="18%"  stopColor="#F7D24A" />
            <stop offset="38%"  stopColor="#E63CC7" />
            <stop offset="62%"  stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#2E1F73" />
          </radialGradient>
          <radialGradient id="orbRimDark" cx="70%" cy="78%" r="60%">
            <stop offset="0%"  stopColor="#7C5FFF" stopOpacity="0.85" />
            <stop offset="80%" stopColor={BG} stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orbGlossDark" cx="36%" cy="22%" r="32%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="55%"  stopColor="#FFFFFF" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orbEdgeDark" cx="50%" cy="50%" r="50%">
            <stop offset="84%" stopColor="#FFFFFF" stopOpacity="0" />
            <stop offset="96%" stopColor="#FFFFFF" stopOpacity="0.45" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        <ellipse cx="100" cy="186" rx="60" ry="6" fill="rgba(0,0,0,0.55)" />

        <circle cx="100" cy="100" r="92" fill="url(#orbCoreDark)" />
        <circle cx="100" cy="100" r="92" fill="url(#orbRimDark)" style={{ mixBlendMode: "multiply" }} />
        <circle cx="100" cy="100" r="92" fill="url(#orbEdgeDark)" />

        <ellipse cx="78" cy="58" rx="38" ry="22" fill="url(#orbGlossDark)" />
        <circle cx="62" cy="48" r="4" fill="#FFFFFF" opacity="0.9" />

        <circle cx="100" cy="100" r="92" fill="none" stroke="rgba(255,255,255,0.50)" strokeWidth="0.6" />
      </svg>
    </div>
  );
}

function IconArchive(){return(<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 7h18M5 7v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7M9 11h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function IconBolt(){return(<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M13 3 4 14h7l-1 7 9-11h-7l1-7Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function IconChart(){return(<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M3 17 9 11l4 4 8-8M14 5h7v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}
function IconSync(){return(<svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden><path d="M21 12a9 9 0 1 1-3-6.7M21 5v5h-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>);}

/* ============================================================================
   PRICING — dark cards
   ========================================================================== */
function DarkPricing() {
  const tiers = [
    {
      name: "Reader",      price: "$0",   cadence: "always free",  tag: "For the curious.",
      perks: ["Today's filings + consensus","All 538 lawmakers, last 30 days","Source-linked PTR PDFs","Public roster pages"],
      featured: false,
    },
    {
      name: "Professional",price: "$39",  cadence: "per month",    tag: "For traders, researchers, journalists.",
      perks: ["Everything in Reader","Full archive (2014 – present)","CSV / Parquet exports","Webhooks + email alerts","Backtester (filing-date basis)","Priority sub-30s feed"],
      featured: true,
    },
    {
      name: "Institutional",price: "$129", cadence: "per seat / month",tag: "For desks and newsrooms with 5+.",
      perks: ["Everything in Professional","Team seats + SSO","API access · 10K req/day","Custom roster lists","Dedicated Slack","SLA & invoicing"],
      featured: false,
    },
  ];
  return (
    <section id="pricing" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
      <div className="max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-12 py-14 sm:py-20 lg:py-32">
        <ScrollReveal className="text-center mb-12">
          <div className="text-[10.5px] uppercase tracking-[0.18em] font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
            Section IV · Subscribe
          </div>
          <h2 className="mt-5 font-semibold tracking-[-0.04em] leading-[0.97] text-[44px] sm:text-[72px]"
            style={{ background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
            Pick the desk.
          </h2>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tiers.map((t, i) => (
            <HoverLift
              key={t.name}
              className="relative flex flex-col rounded-2xl p-7 will-change-transform"
              style={{
                ...(t.featured
                  ? {
                      background: VIOLET_GRAD,
                      border: `1px solid ${VIOLET}`,
                      boxShadow:
                        `0 50px 110px -30px ${VIOLET}99, 0 20px 50px -16px ${VIOLET}66, inset 0 1px 0 rgba(255,255,255,0.18)`,
                    }
                  : {
                      background: "rgba(255,255,255,0.02)",
                      border: `1px solid ${LINE}`,
                    }),
                animationDelay: `${i * 80}ms`,
              }}
            >
              {/* Inner highlight — contained in its own div so the parent
                  article does NOT need overflow-hidden (which was clipping the
                  badge into a yellow bar). */}
              {t.featured && (
                <div
                  aria-hidden
                  className="absolute inset-0 pointer-events-none rounded-2xl overflow-hidden"
                >
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(120% 80% at 20% 0%, rgba(255,255,255,0.18) 0%, transparent 60%)",
                    }}
                  />
                </div>
              )}

              {t.featured && (
                <div
                  className="absolute -top-3 left-7 inline-flex items-center px-2.5 py-1 text-[10px] font-mono uppercase tracking-widest rounded-sm z-10"
                  style={{
                    background: YELLOW,
                    color: BG,
                    boxShadow: `0 10px 24px -8px ${YELLOW}99`,
                  }}
                >
                  Most subscribed
                </div>
              )}

              <div className="relative flex items-baseline justify-between">
                <div className="text-[24px] font-semibold tracking-tight" style={{ color: "#fff" }}>{t.name}</div>
                <div
                  className="text-[10.5px] font-mono uppercase tracking-[0.18em]"
                  style={{ color: t.featured ? "rgba(255,255,255,0.7)" : TEXT_LOW }}
                >
                  Tier
                </div>
              </div>

              <div className="relative mt-6 flex items-baseline gap-2">
                <span className="text-[56px] leading-none font-semibold tabular-nums tracking-[-0.03em]" style={{ color: "#fff" }}>{t.price}</span>
                <span
                  className="text-[12px]"
                  style={{ color: t.featured ? "rgba(255,255,255,0.75)" : TEXT_MID }}
                >
                  {t.cadence}
                </span>
              </div>

              <p
                className="relative mt-3 text-[13px]"
                style={{ color: t.featured ? "rgba(255,255,255,0.85)" : TEXT_MID }}
              >
                {t.tag}
              </p>

              <ul className="relative mt-7 space-y-2.5 text-[13.5px] flex-1">
                {t.perks.map((p) => (
                  <li
                    key={p}
                    className="flex items-start gap-2.5"
                    style={{ color: t.featured ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.85)" }}
                  >
                    <span
                      className="mt-1.5 inline-block w-1.5 h-1.5 rounded-full"
                      style={{ background: t.featured ? YELLOW : TEXT_LOW }}
                    />
                    <span className="leading-snug">{p}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/"
                className="relative mt-8 inline-flex items-center justify-center gap-2 rounded-full py-3 text-[13.5px] font-medium transition-colors"
                style={
                  t.featured
                    ? {
                        background: "#FFFFFF",
                        color: VIOLET_DEEP,
                        boxShadow: "0 14px 36px -12px rgba(0,0,0,0.45)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        color: "#fff",
                        border: `1px solid ${LINE_2}`,
                      }
                }
              >
                Subscribe <span aria-hidden>→</span>
              </Link>
            </HoverLift>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ============================================================================
   FINAL CTA
   ========================================================================== */
function DarkFinalCTA() {
  return (
    <section className="relative overflow-hidden" style={{ borderTop: `1px solid ${LINE}` }}>
      <div className="absolute inset-0 z-0"><DarkBackground variant="cta" intensity={0.95} /></div>
      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-12 py-16 sm:py-24 lg:py-36 text-center">
        <h2 className="font-semibold tracking-[-0.04em] leading-[0.96] text-[48px] sm:text-[88px] max-w-4xl mx-auto"
          style={{ background: "linear-gradient(180deg, #fff 0%, #B9C1D3 100%)", WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }}>
          Every disclosure is in.
        </h2>
        <h2 className="font-semibold tracking-[-0.04em] leading-[0.96] text-[48px] sm:text-[88px] max-w-4xl mx-auto" style={{ color: "rgba(255,255,255,0.40)" }}>
          All that&rsquo;s left is to look.
        </h2>
        <div className="mt-12 flex flex-wrap gap-3 justify-center">
          <Link
            href="/terminal"
            className="inline-flex items-center gap-1.5 rounded-full px-6 py-3.5 text-[14px] font-medium tracking-tight"
            style={{
              background: VIOLET_GRAD,
              color: "#fff",
              boxShadow: VIOLET_GLOW,
            }}
          >
            Open the desk <span aria-hidden>→</span>
          </Link>
          <Link
            href="/#docs"
            className="inline-flex items-center gap-1.5 rounded-full px-6 py-3.5 text-[14px] font-medium"
            style={{ background: "rgba(255,255,255,0.05)", color: "#fff", border: `1px solid ${LINE_2}` }}
          >
            Read the docs
          </Link>
        </div>
      </div>
    </section>
  );
}

/* Landing now uses <PublicFooter /> from components/marketing — see top of file. */
