// app/welcome/page.tsx — first-run onboarding flow.
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bot,
  Briefcase,
  Check,
  ChevronRight,
  Cpu,
  HeartPulse,
  LandPlot,
  Landmark,
  Mail,
  ShoppingBag,
  Sparkles,
  Zap,
} from "lucide-react";
import { useAuth } from "@/lib/auth-stub";
import { useToast } from "@/components/ui/Toaster";
import { Toggle as UIToggle } from "@/components/ui/Toggle";
import {
  firstNameFromEmail,
  isOnboarded,
  loadAlertPrefs,
  loadPriorities,
  markOnboarded,
  saveAlertPrefs,
  savePriorities,
  type AlertPrefs,
  type Priorities,
} from "@/lib/onboarding";
import {
  BG,
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
  VIOLET_DEEP,
  VIOLET_GRAD,
  YELLOW,
} from "@/lib/theme";

type StepKey = 0 | 1 | 2;

const SECTORS = [
  { id: "Tech", icon: Cpu },
  { id: "Defense", icon: LandPlot },
  { id: "Healthcare", icon: HeartPulse },
  { id: "Finance", icon: Briefcase },
  { id: "Energy", icon: Zap },
  { id: "Consumer", icon: ShoppingBag },
];

const POLITICIANS = [
  { slug: "pelosi", name: "Nancy Pelosi", party: "D", note: "Speaker emeritus, CA-11" },
  { slug: "greene", name: "M.T. Greene", party: "R", note: "Rep. GA-14" },
  { slug: "gottheimer", name: "Josh Gottheimer", party: "D", note: "Rep. NJ-05" },
  { slug: "hern", name: "Kevin Hern", party: "R", note: "Rep. OK-01" },
];

const MINDS = [
  { slug: "gpt", name: "GPT-5", note: "Trades the consensus call" },
  { slug: "claude", name: "Claude", note: "Trades only the high-conviction ones" },
];

// Shared container width — matches PublicHeader/PublicFooter so /welcome
// sits in the same visual rail as every other marketing page.
const CONTAINER = "max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12";

export default function WelcomePage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<StepKey>(0);
  const [priorities, setPriorities] = useState<Priorities>({ sectors: [], politicians: [], minds: [] });
  const [alerts, setAlerts] = useState<AlertPrefs>({
    digestDaily: true,
    whenWatchedTrade: true,
    whenConsensusShifts: false,
    whenClusterDetected: true,
  });
  const [mounted, setMounted] = useState(false);

  // Hydrate stored prefs on mount.
  useEffect(() => {
    setPriorities(loadPriorities());
    setAlerts(loadAlertPrefs());
    setMounted(true);
  }, []);

  // If the user is already onboarded, send them to /terminal so /welcome is
  // not a sticky page they can wander back to.
  useEffect(() => {
    if (!mounted) return;
    if (user?.email && isOnboarded(user.email)) {
      router.replace("/terminal");
    }
  }, [user?.email, mounted, router]);

  const name = useMemo(() => firstNameFromEmail(user?.email ?? ""), [user?.email]);

  const next = () => {
    if (step < 2) setStep((s) => (s + 1) as StepKey);
    else finish();
  };
  const back = () => {
    if (step > 0) setStep((s) => (s - 1) as StepKey);
  };

  const finish = () => {
    savePriorities(priorities);
    saveAlertPrefs(alerts);
    if (user?.email) markOnboarded(user.email);
    toast(`Welcome aboard, ${name}`, {
      variant: "success",
      description: "Your desk is ready. The firehose is live.",
    });
    router.replace("/terminal");
  };

  const skip = () => {
    if (user?.email) markOnboarded(user.email);
    router.replace("/terminal");
  };

  return (
    <main
      className="min-h-screen relative overflow-hidden flex flex-col"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      <AtmosBackground />

      {/* Header — mirrors PublicHeader chrome (sticky, blurred, h-14, 1px border). */}
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: "rgba(8,6,15,0.72)", borderBottom: `1px solid ${LINE}` }}
      >
        <div className={`${CONTAINER} flex items-center justify-between h-14 gap-3`}>
          <a href="/terminal" className="flex items-center gap-2.5 font-medium tracking-tight min-w-0">
            <Logo />
            <span className="text-[14px] text-white">autotrade</span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.18em] text-white/40 border-l border-white/10 pl-2.5 ml-1">
              setup
            </span>
          </a>

          <div className="flex items-center gap-4 sm:gap-5">
            <Stepper current={step} />
            <button
              onClick={skip}
              className="text-[12.5px] transition-colors hover:text-white"
              style={{ color: TEXT_LOW }}
            >
              Skip for now
            </button>
          </div>
        </div>
      </header>

      {/* Centered content — flex-1 fills the viewport so there's no dead space
          below the hero. Each step is responsible for its own internal rhythm. */}
      <div className={`${CONTAINER} relative z-10 flex-1 flex flex-col py-8 sm:py-10`}>
        <AnimatePresence mode="wait">
          {step === 0 && (
            <motion.div
              key="hero"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col justify-center"
            >
              <StepHero name={name} onNext={next} />
            </motion.div>
          )}
          {step === 1 && (
            <motion.div
              key="priorities"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <StepPriorities
                priorities={priorities}
                setPriorities={setPriorities}
                onNext={next}
                onBack={back}
              />
            </motion.div>
          )}
          {step === 2 && (
            <motion.div
              key="alerts"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
              className="flex-1 flex flex-col"
            >
              <StepAlerts
                alerts={alerts}
                setAlerts={setAlerts}
                onNext={next}
                onBack={back}
                email={user?.email ?? "you@autotrade.app"}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer — grounds the bottom of every step. Progress on the left, legal
          on the right. Matches the visual gravity of PublicFooter without the
          full columnar marketing chrome (this is an onboarding page, not a
          marketing destination). */}
      <footer
        className="relative z-10 mt-auto"
        style={{ borderTop: `1px solid ${LINE}`, background: "rgba(8,6,15,0.72)" }}
      >
        <div
          className={`${CONTAINER} flex flex-wrap items-center justify-between gap-3 py-4 text-[11.5px]`}
          style={{ color: TEXT_LOW }}
        >
          <div className="flex items-center gap-3">
            <span className="font-mono uppercase tracking-[0.18em]">
              Step {step + 1} of 3
            </span>
            <span aria-hidden>·</span>
            <span>
              {step === 0 ? "Welcome" : step === 1 ? "Priorities" : "Alerts"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span>By continuing, you agree to our Terms &amp; Privacy.</span>
            <a href="/about#terms" className="font-mono hover:text-white transition-colors">
              Terms
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

/* ───────────────────────── Stepper + atmos ───────────────────────── */

function Stepper({ current }: { current: StepKey }) {
  const labels = ["Welcome", "Priorities", "Alerts"];
  return (
    <div className="hidden sm:flex items-center gap-2.5">
      {[0, 1, 2].map((i) => {
        const active = i === current;
        const done = i < current;
        return (
          <span key={i} className="inline-flex items-center gap-2">
            <span
              className="rounded-full transition-all"
              style={{
                width: active ? 22 : 7,
                height: 7,
                background: active ? VIOLET_2 : done ? VIOLET : "rgba(255,255,255,0.18)",
                boxShadow: active ? "0 0 12px rgba(167,139,250,0.5)" : "none",
              }}
            />
            {active && (
              <span
                className="text-[11.5px] font-medium hidden md:inline"
                style={{ color: TEXT_HI }}
              >
                {labels[i]}
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function AtmosBackground() {
  return (
    <>
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `
            radial-gradient(900px 520px at 15% -10%, rgba(124,95,255,0.28), transparent 60%),
            radial-gradient(700px 480px at 110% 0%, rgba(247,210,74,0.10), transparent 55%),
            radial-gradient(1100px 700px at 80% 60%, rgba(124,95,255,0.18), transparent 60%),
            radial-gradient(900px 600px at 20% 110%, rgba(79,57,216,0.22), transparent 60%)
          `,
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at 50% 40%, rgba(0,0,0,0.7) 0%, transparent 75%)",
        }}
      />
    </>
  );
}

/* ───────────────────────── Step 1 — Hero ───────────────────────── */

function StepHero({ name, onNext }: { name: string; onNext: () => void }) {
  return (
    <div className="grid grid-cols-12 gap-8 lg:gap-12 items-stretch">
      <div className="col-span-12 lg:col-span-7 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="eyebrow"
          style={{ color: TEXT_LOW }}
        >
          <span style={{ color: VIOLET_2 }}>Welcome, {name}</span>
          <span className="ml-2">·</span>
          <span className="ml-2">Let&apos;s set up your desk</span>
        </motion.div>

        <h1
          className="display mt-5 text-[44px] sm:text-[56px] md:text-[68px] lg:text-[76px] tracking-[-0.02em]"
          style={{ color: TEXT_HI, lineHeight: 1.02 }}
        >
          See what Congress is{" "}
          <span style={{ color: YELLOW }}>buying</span>.
          <br />
          Weighed by four AI minds.
        </h1>

        <p
          className="mt-5 max-w-xl text-[14.5px] leading-relaxed"
          style={{ color: TEXT_MID }}
        >
          Every disclosed trade from 538 lawmakers, ranked against the consensus
          of GPT-5, Claude, Gemini, and Grok. We&apos;ll set up your desk in
          three steps.
        </p>

        <div className="mt-7 flex items-center gap-3 flex-wrap">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 rounded-full pl-5 pr-4 py-2.5 text-[13.5px] font-medium transition-all hover:brightness-110"
            style={{
              background: VIOLET_GRAD,
              color: "#fff",
              boxShadow:
                "0 18px 50px -14px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
          >
            Get started
            <ArrowRight size={14} />
          </button>
          <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
            Takes about 60s
          </span>
        </div>

        <div className="mt-6 flex items-center gap-5 text-[11.5px]" style={{ color: TEXT_LOW }}>
          <span className="inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: POSITIVE }} />
            Live · sub-30s
          </span>
          <span>·</span>
          <span>538 lawmakers</span>
          <span>·</span>
          <span>4 minds</span>
        </div>

        <BenefitsRow />
      </div>

      <div className="col-span-12 lg:col-span-5 flex flex-col justify-center">
        <SplitHero />
      </div>
    </div>
  );
}

function BenefitsRow() {
  const items = [
    { icon: Bell, label: "Real-time filings", note: "Sub-30s from House Clerk" },
    { icon: Sparkles, label: "AI consensus", note: "Four minds, every Monday" },
    { icon: Briefcase, label: "Deep profiles", note: "Holdings + history per rep" },
  ];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.5 }}
      className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl"
    >
      {items.map((b) => {
        const Icon = b.icon;
        return (
          <div
            key={b.label}
            className="rounded-xl p-3.5"
            style={{
              background: "rgba(255,255,255,0.025)",
              border: `1px solid ${LINE_2}`,
            }}
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center justify-center w-6 h-6 rounded-lg"
                style={{ background: "rgba(124,95,255,0.18)", color: VIOLET_2 }}
              >
                <Icon size={12} />
              </span>
              <span className="text-[12.5px] font-medium" style={{ color: TEXT_HI }}>
                {b.label}
              </span>
            </div>
            <div className="mt-1.5 text-[11px]" style={{ color: TEXT_MID }}>
              {b.note}
            </div>
          </div>
        );
      })}
    </motion.div>
  );
}

function SplitHero() {
  return (
    <div className="relative w-full flex flex-col gap-4">
      {/* Filing card — clean monogram, no rotation */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl overflow-hidden"
        style={{
          background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
          border: `1px solid ${LINE_2}`,
          boxShadow: "0 30px 80px -20px rgba(0,0,0,0.7)",
        }}
      >
        <div
          className="px-4 py-2.5 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${LINE}` }}
        >
          <span
            className="inline-flex items-center justify-center w-1.5 h-1.5 rounded-full"
            style={{ background: POSITIVE, boxShadow: `0 0 6px ${POSITIVE}` }}
          />
          <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
            New filing · 2m ago
          </span>
          <span className="ml-auto font-mono text-[10px] tabular-nums" style={{ color: TEXT_LOW }}>
            PTR-13884
          </span>
        </div>
        <div className="px-4 py-4 flex items-center gap-3.5">
          <span
            className="inline-flex items-center justify-center w-11 h-11 rounded-xl font-mono text-[14px] font-semibold shrink-0"
            style={{
              background: "linear-gradient(135deg, rgba(247,210,74,0.18), rgba(247,210,74,0.04))",
              border: `1px solid ${LINE_2}`,
              color: TEXT_HI,
            }}
          >
            NP
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-semibold truncate" style={{ color: TEXT_HI }}>
                Nancy Pelosi
              </span>
              <span
                className="font-mono text-[9.5px] px-1.5 py-0.5 rounded"
                style={{ color: "#60A5FA", border: `1px solid ${LINE_2}` }}
              >
                D
              </span>
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: TEXT_MID }}>
              Bought NVDA · Jan 18
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="font-mono text-[11px]" style={{ color: TEXT_LOW }}>Bracket</div>
            <div className="font-mono text-[12.5px] font-semibold tabular-nums" style={{ color: POSITIVE }}>
              $1M–$5M
            </div>
          </div>
        </div>
      </motion.div>

      {/* AI consensus card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, delay: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="rounded-2xl overflow-hidden relative"
        style={{
          background: "linear-gradient(160deg, rgba(124,95,255,0.16) 0%, rgba(79,57,216,0.06) 60%, rgba(255,255,255,0.01) 100%)",
          border: `1px solid rgba(124,95,255,0.30)`,
          boxShadow: `0 30px 80px -20px ${VIOLET}55, inset 0 1px 0 rgba(255,255,255,0.06)`,
        }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(120% 80% at 0% 0%, rgba(255,255,255,0.10) 0%, transparent 60%)" }}
        />
        <div className="relative">
          <div
            className="px-4 py-2.5 flex items-center gap-2"
            style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-md"
              style={{ background: "rgba(124,95,255,0.20)", color: VIOLET_2 }}
            >
              <Sparkles size={11} />
            </span>
            <span className="font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: VIOLET_2 }}>
              AI consensus
            </span>
            <span className="ml-auto inline-flex items-center px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider rounded-sm"
              style={{ background: YELLOW, color: BG }}>
              Pick
            </span>
          </div>
          <div className="px-4 pt-4 pb-2 flex items-baseline justify-between">
            <span
              className="font-mono text-[30px] font-semibold leading-none tabular-nums tracking-[-0.02em]"
              style={{ color: "#fff", textShadow: `0 0 24px ${VIOLET}66` }}
            >
              NVDA
            </span>
            <span className="font-mono text-[11px] tabular-nums" style={{ color: POSITIVE }}>
              3 / 4 agree
            </span>
          </div>
          <div className="px-4 pt-2 pb-3">
            <div className="flex gap-1">
              {[true, true, true, false].map((agrees, i) => (
                <div
                  key={i}
                  className="flex-1 h-2 rounded-sm"
                  style={{
                    background: agrees ? POSITIVE : "rgba(255,255,255,0.10)",
                    boxShadow: agrees ? `0 0 8px ${POSITIVE}80` : "none",
                  }}
                />
              ))}
            </div>
            <div className="mt-2 grid grid-cols-4 gap-1 text-center text-[9px] font-mono uppercase tracking-wider">
              {[
                { name: "GPT-5", agrees: true },
                { name: "Claude", agrees: true },
                { name: "Gemini", agrees: true },
                { name: "Grok", agrees: false },
              ].map((m) => (
                <div key={m.name} style={{ color: m.agrees ? TEXT_MID : NEGATIVE }}>
                  {m.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Small "what you'll see next" caption — anchors the right column so both
          sides finish at roughly the same baseline. */}
      <div
        className="mt-2 px-1 text-[11px] flex items-center gap-2"
        style={{ color: TEXT_LOW }}
      >
        <span className="font-mono uppercase tracking-[0.18em]">Sample</span>
        <span>·</span>
        <span>This is what every filing looks like on your desk.</span>
      </div>
    </div>
  );
}

/* ───────────────────────── Step 2 — Priorities ───────────────────────── */

function StepPriorities({
  priorities,
  setPriorities,
  onNext,
  onBack,
}: {
  priorities: Priorities;
  setPriorities: (p: Priorities) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const togSector = (id: string) =>
    setPriorities({
      ...priorities,
      sectors: priorities.sectors.includes(id)
        ? priorities.sectors.filter((s) => s !== id)
        : [...priorities.sectors, id],
    });
  const togPol = (slug: string) =>
    setPriorities({
      ...priorities,
      politicians: priorities.politicians.includes(slug)
        ? priorities.politicians.filter((s) => s !== slug)
        : [...priorities.politicians, slug],
    });
  const togMind = (slug: string) =>
    setPriorities({
      ...priorities,
      minds: priorities.minds.includes(slug)
        ? priorities.minds.filter((s) => s !== slug)
        : [...priorities.minds, slug],
    });

  const totalPicks =
    priorities.sectors.length + priorities.politicians.length + priorities.minds.length;
  const reduced = useReducedMotion();
  const stagger = (i: number) => ({
    initial: reduced ? { opacity: 0 } : { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    transition: { delay: reduced ? 0 : 0.05 + i * 0.035, duration: 0.28, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  });

  return (
    <div className="flex-1 flex flex-col">
      <Heading
        eyebrow={`Priorities${totalPicks > 0 ? ` · ${totalPicks} picked` : ""}`}
        title="What should we tune your desk for?"
        sub="Pick the lanes you care about. You can change this any time from Settings."
      />

      <div className="mt-8 grid grid-cols-12 gap-6 flex-1">
        <div className="col-span-12 lg:col-span-7 space-y-4">
          <Card
            title="Sectors of interest"
            subtitle="Used to weigh the AI consensus."
            count={priorities.sectors.length}
          >
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(({ id, icon: Icon }, i) => {
                const on = priorities.sectors.includes(id);
                return (
                  <motion.button
                    key={id}
                    {...stagger(i)}
                    onClick={() => togSector(id)}
                    aria-pressed={on}
                    className="focus-ring inline-flex items-center gap-2 rounded-full pl-3 pr-3.5 py-2 text-[13px] font-medium transition-all hover:-translate-y-0.5"
                    style={chipStyle(on)}
                  >
                    <Icon size={13} />
                    {id}
                    {on && (
                      <Check size={12} style={{ color: "#fff", marginLeft: 2 }} />
                    )}
                  </motion.button>
                );
              })}
            </div>
            {priorities.sectors.length === 0 && (
              <div className="mt-3 text-[11.5px]" style={{ color: TEXT_LOW }}>
                We&apos;ll show you everything until you pick favorites.
              </div>
            )}
          </Card>

          <Card
            title="Politicians to watch"
            subtitle="We'll surface their filings first."
            count={priorities.politicians.length}
          >
            <div className="grid grid-cols-2 gap-2">
              {POLITICIANS.map((p, i) => {
                const on = priorities.politicians.includes(p.slug);
                return (
                  <motion.button
                    key={p.slug}
                    {...stagger(i)}
                    onClick={() => togPol(p.slug)}
                    aria-pressed={on}
                    className="focus-ring flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:-translate-y-0.5"
                    style={rowStyle(on)}
                  >
                    <CheckBox on={on} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium" style={{ color: TEXT_HI }}>
                        {p.name}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: TEXT_MID }}>
                        {p.note}
                      </div>
                    </div>
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
                      style={{
                        background: p.party === "D" ? "rgba(59,130,246,0.18)" : "rgba(239,68,68,0.18)",
                        color: p.party === "D" ? "#60A5FA" : "#FCA5A5",
                      }}
                    >
                      {p.party}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Card>

          <Card
            title="Favorite AI minds"
            subtitle="Side-by-side scoring on every filing."
            count={priorities.minds.length}
          >
            <div className="grid grid-cols-2 gap-2">
              {MINDS.map((m, i) => {
                const on = priorities.minds.includes(m.slug);
                return (
                  <motion.button
                    key={m.slug}
                    {...stagger(i)}
                    onClick={() => togMind(m.slug)}
                    aria-pressed={on}
                    className="focus-ring flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left hover:-translate-y-0.5"
                    style={rowStyle(on)}
                  >
                    <CheckBox on={on} />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium" style={{ color: TEXT_HI }}>
                        {m.name}
                      </div>
                      <div className="text-[11px] mt-0.5" style={{ color: TEXT_MID }}>
                        {m.note}
                      </div>
                    </div>
                    <span
                      className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
                      style={{ background: "rgba(247,210,74,0.14)", color: YELLOW }}
                    >
                      AI
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </Card>
        </div>

        <aside className="col-span-12 lg:col-span-5">
          <div
            className="rounded-2xl p-5 sticky top-20"
            style={{
              background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
              border: `1px solid ${LINE_2}`,
            }}
          >
            <div className="eyebrow" style={{ color: TEXT_LOW }}>
              Your desk · preview
            </div>
            <div
              className="display mt-3 text-[24px] leading-tight"
              style={{ color: TEXT_HI }}
            >
              {priorities.sectors.length > 0
                ? priorities.sectors.slice(0, 2).join(" + ") + " bias"
                : "Balanced desk"}
            </div>
            <div className="mt-1 text-[12.5px]" style={{ color: TEXT_MID }}>
              {priorities.politicians.length + priorities.minds.length} pinned ·{" "}
              {priorities.sectors.length} sector
              {priorities.sectors.length === 1 ? "" : "s"}
            </div>

            <div className="mt-5 space-y-2">
              {priorities.politicians.length === 0 &&
                priorities.minds.length === 0 && (
                  <div
                    className="rounded-xl p-3 text-[11.5px]"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: `1px dashed ${LINE_2}`,
                      color: TEXT_LOW,
                    }}
                  >
                    Pick at least one to pin. We&apos;ll prioritize their filings
                    on your desk.
                  </div>
                )}
              {[...priorities.politicians, ...priorities.minds].slice(0, 4).map((slug) => {
                const meta =
                  POLITICIANS.find((p) => p.slug === slug) ||
                  MINDS.find((m) => m.slug === slug);
                if (!meta) return null;
                return (
                  <div
                    key={slug}
                    className="flex items-center gap-2 text-[12.5px] py-1.5"
                  >
                    <Landmark size={12} style={{ color: VIOLET_2 }} />
                    <span style={{ color: TEXT_HI }}>{meta.name}</span>
                    <span className="ml-auto" style={{ color: TEXT_LOW }}>
                      pinned
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>
      </div>

      <NavRow onNext={onNext} onBack={onBack} ctaLabel="Continue" />
    </div>
  );
}

/* ───────────────────────── Step 3 — Alerts ───────────────────────── */

function StepAlerts({
  alerts,
  setAlerts,
  onNext,
  onBack,
  email,
}: {
  alerts: AlertPrefs;
  setAlerts: (a: AlertPrefs) => void;
  onNext: () => void;
  onBack: () => void;
  email: string;
}) {
  const items: { key: keyof AlertPrefs; label: string; note: string; icon: React.ElementType }[] = [
    {
      key: "digestDaily",
      label: "Daily digest",
      note: "A single morning email with the day's standout filings.",
      icon: Mail,
    },
    {
      key: "whenWatchedTrade",
      label: "When my watched politicians trade",
      note: "Real-time push the moment a filing hits the wire.",
      icon: Landmark,
    },
    {
      key: "whenConsensusShifts",
      label: "When AI consensus shifts",
      note: "We'll ping you when 3+ minds change their stance.",
      icon: Bot,
    },
    {
      key: "whenClusterDetected",
      label: "Unusual cluster activity",
      note: "Multiple lawmakers buying the same ticker in 48h.",
      icon: Bell,
    },
  ];

  const tog = (k: keyof AlertPrefs) => setAlerts({ ...alerts, [k]: !alerts[k] });
  const reduced = useReducedMotion();
  const digest = items.find((it) => it.key === "digestDaily")!;
  const otherItems = items.filter((it) => it.key !== "digestDaily");
  const activeCount =
    (alerts.digestDaily ? 1 : 0) +
    (alerts.whenWatchedTrade ? 1 : 0) +
    (alerts.whenConsensusShifts ? 1 : 0) +
    (alerts.whenClusterDetected ? 1 : 0);

  return (
    <div className="flex-1 flex flex-col">
      <Heading
        eyebrow={`Alerts${activeCount > 0 ? ` · ${activeCount} on` : ""}`}
        title="How should we keep you in the loop?"
        sub="Email + push notifications. Quiet hours and frequency live in Settings."
      />

      <div className="mt-8 grid grid-cols-12 gap-6 flex-1">
        <div className="col-span-12 lg:col-span-7 space-y-4">
          {/* Hero: Daily digest — the prominent recommended option */}
          <DigestHero
            on={alerts.digestDaily}
            label={digest.label}
            note={digest.note}
            onToggle={() => tog("digestDaily")}
          />

          <div className="space-y-2">
            {otherItems.map(({ key, label, note, icon: Icon }, i) => {
              const on = alerts[key];
              return (
                <motion.div
                  key={key}
                  role="group"
                  initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    delay: reduced ? 0 : 0.08 + i * 0.04,
                    duration: 0.28,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  onClick={(e) => {
                    // Ignore clicks that originated on the inner toggle button.
                    if ((e.target as HTMLElement).closest('[role="switch"]')) return;
                    tog(key);
                  }}
                  className="focus-ring w-full flex items-center gap-4 px-4 py-3.5 rounded-xl text-left transition-all hover:-translate-y-0.5 cursor-pointer"
                  style={rowStyle(on)}
                >
                  <span
                    className="inline-flex items-center justify-center w-9 h-9 rounded-xl shrink-0"
                    style={{
                      background: on ? "rgba(124,95,255,0.16)" : "rgba(255,255,255,0.03)",
                      color: on ? VIOLET_2 : TEXT_MID,
                      border: `1px solid ${on ? "rgba(124,95,255,0.30)" : LINE_2}`,
                    }}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="text-[13.5px] font-medium" style={{ color: TEXT_HI }}>
                      {label}
                    </div>
                    <div className="text-[11.5px] mt-0.5" style={{ color: TEXT_MID }}>
                      {note}
                    </div>
                  </div>
                  <UIToggle on={on} onChange={() => tog(key)} ariaLabel={label} />
                </motion.div>
              );
            })}
          </div>

          {activeCount === 0 && (
            <div
              className="mt-2 rounded-xl px-3 py-2.5 text-[11.5px]"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px dashed ${LINE_2}`,
                color: TEXT_LOW,
              }}
            >
              You&apos;ll receive nothing right now. Pick at least the daily digest to stay current.
            </div>
          )}
        </div>

        <aside className="col-span-12 lg:col-span-5">
          <EmailPreview email={email} alerts={alerts} />
        </aside>
      </div>

      <NavRow onNext={onNext} onBack={onBack} ctaLabel="Finish" />
    </div>
  );
}

function DigestHero({
  on,
  label,
  note,
  onToggle,
}: {
  on: boolean;
  label: string;
  note: string;
  onToggle: () => void;
}) {
  return (
    <div
      role="group"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest('[role="switch"]')) return;
        onToggle();
      }}
      className="focus-ring w-full text-left rounded-2xl p-5 transition-all hover:-translate-y-0.5 cursor-pointer"
      style={{
        background: on
          ? "linear-gradient(160deg, rgba(124,95,255,0.18) 0%, rgba(79,57,216,0.06) 60%, rgba(255,255,255,0.01) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.01) 100%)",
        border: `1px solid ${on ? "rgba(124,95,255,0.32)" : LINE_2}`,
        boxShadow: on
          ? `0 22px 60px -22px ${VIOLET}55, inset 0 1px 0 rgba(255,255,255,0.06)`
          : "none",
      }}
    >
      <div className="flex items-start gap-4">
        <span
          className="inline-flex items-center justify-center w-11 h-11 rounded-xl shrink-0"
          style={{
            background: on ? "rgba(124,95,255,0.18)" : "rgba(255,255,255,0.04)",
            color: on ? VIOLET_2 : TEXT_MID,
            border: `1px solid ${on ? "rgba(124,95,255,0.30)" : LINE_2}`,
          }}
        >
          <Mail size={18} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[15px] font-semibold" style={{ color: TEXT_HI }}>
              {label}
            </span>
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{ background: YELLOW, color: BG }}
            >
              Recommended
            </span>
          </div>
          <div className="mt-1 text-[12.5px]" style={{ color: TEXT_MID }}>
            {note}
          </div>
        </div>
        <UIToggle on={on} onChange={onToggle} ariaLabel={label} />
      </div>
    </div>
  );
}

function EmailPreview({ email, alerts }: { email: string; alerts: AlertPrefs }) {
  return (
    <div
      className="rounded-2xl overflow-hidden sticky top-20"
      style={{
        background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <Mail size={12} style={{ color: TEXT_LOW }} />
        <span className="font-mono text-[10.5px] uppercase tracking-[0.18em]" style={{ color: TEXT_LOW }}>
          Preview
        </span>
        <span className="ml-auto font-mono text-[10px]" style={{ color: TEXT_LOW }}>
          autotrade-desk@autotrade.app
        </span>
      </div>
      <div className="p-5" style={{ background: "#FAF7EE", color: "#111" }}>
        <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "#666" }}>
          Issue · {todayShort()}
        </div>
        <div
          className="display mt-2 text-[22px] leading-tight"
          style={{ color: "#111" }}
        >
          The Disclosure — your morning brief
        </div>
        <div className="mt-1 text-[12px]" style={{ color: "#555" }}>
          To {email}
        </div>
        <hr className="my-3" style={{ borderColor: "rgba(0,0,0,0.10)" }} />
        <div className="space-y-2.5 text-[12.5px]" style={{ color: "#222" }}>
          {alerts.digestDaily && (
            <div className="flex items-start gap-2">
              <ChevronRight size={12} className="mt-1" />
              <span>
                <b>Daily digest:</b> 12 new filings overnight, 4 above your sector floor.
              </span>
            </div>
          )}
          {alerts.whenWatchedTrade && (
            <div className="flex items-start gap-2">
              <ChevronRight size={12} className="mt-1" />
              <span>
                <b>Pelosi filed:</b> NVDA call options · 6d before market open.
              </span>
            </div>
          )}
          {alerts.whenConsensusShifts && (
            <div className="flex items-start gap-2">
              <ChevronRight size={12} className="mt-1" />
              <span>
                <b>Consensus shift:</b> 3 minds flipped to BUY on PLTR overnight.
              </span>
            </div>
          )}
          {alerts.whenClusterDetected && (
            <div className="flex items-start gap-2">
              <ChevronRight size={12} className="mt-1" />
              <span>
                <b>Cluster alert:</b> 4 lawmakers bought MSFT inside 48h.
              </span>
            </div>
          )}
          {!alerts.digestDaily &&
            !alerts.whenWatchedTrade &&
            !alerts.whenConsensusShifts &&
            !alerts.whenClusterDetected && (
              <div className="italic" style={{ color: "#888" }}>
                Pick at least one alert to see what we&apos;d send.
              </div>
            )}
        </div>
        <hr className="my-3" style={{ borderColor: "rgba(0,0,0,0.10)" }} />
        <div className="text-[10.5px]" style={{ color: "#666" }}>
          Edit anytime in Settings → Alerts.
        </div>
      </div>
    </div>
  );
}

function todayShort() {
  const d = new Date();
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/* ───────────────────────── Building blocks ───────────────────────── */

function Heading({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="max-w-2xl">
      <div className="eyebrow" style={{ color: VIOLET_2 }}>
        {eyebrow}
      </div>
      <h1
        className="display mt-3 text-[36px] sm:text-[44px]"
        style={{ color: TEXT_HI, lineHeight: 1.0 }}
      >
        {title}
      </h1>
      <p className="mt-3 text-[14px]" style={{ color: TEXT_MID }}>
        {sub}
      </p>
    </div>
  );
}

function Card({
  title,
  subtitle,
  count,
  children,
}: {
  title: string;
  subtitle?: string;
  count?: number;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-2xl p-5"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[13.5px] font-semibold" style={{ color: TEXT_HI }}>
            {title}
          </div>
          {subtitle && (
            <div className="text-[11.5px] mt-0.5" style={{ color: TEXT_MID }}>
              {subtitle}
            </div>
          )}
        </div>
        {typeof count === "number" && count > 0 && (
          <span
            className="font-mono text-[10px] uppercase tracking-[0.16em] px-1.5 py-0.5 rounded-sm shrink-0"
            style={{
              background: "rgba(124,95,255,0.18)",
              color: VIOLET_2,
              border: `1px solid rgba(124,95,255,0.30)`,
            }}
          >
            {count} picked
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

function NavRow({
  onBack,
  onNext,
  ctaLabel,
}: {
  onBack?: () => void;
  onNext: () => void;
  ctaLabel: string;
}) {
  return (
    <div className="mt-8 flex items-center">
      {onBack ? (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[12.5px] transition-colors hover:bg-white/5"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${LINE_2}`,
            color: TEXT_MID,
          }}
        >
          <ArrowLeft size={13} />
          Back
        </button>
      ) : (
        <span />
      )}
      <button
        onClick={onNext}
        className="ml-auto inline-flex items-center gap-2 rounded-full pl-5 pr-4 py-2.5 text-[13px] font-medium transition-all hover:brightness-110"
        style={{
          background: VIOLET_GRAD,
          color: "#fff",
          boxShadow:
            "0 18px 50px -14px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
        }}
      >
        {ctaLabel}
        <ArrowRight size={14} />
      </button>
    </div>
  );
}

function CheckBox({ on }: { on: boolean }) {
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-md shrink-0 transition-colors"
      style={{
        background: on ? VIOLET : "rgba(255,255,255,0.04)",
        border: `1px solid ${on ? VIOLET : LINE_2}`,
      }}
    >
      {on && <Check size={11} color="#fff" strokeWidth={3} />}
    </span>
  );
}

function chipStyle(on: boolean) {
  return {
    background: on
      ? `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_DEEP} 100%)`
      : "rgba(255,255,255,0.03)",
    color: on ? "#fff" : TEXT_HI,
    border: `1px solid ${on ? "transparent" : LINE_2}`,
    boxShadow: on
      ? "0 14px 32px -10px rgba(124,95,255,0.55), 0 0 0 1px rgba(167,139,250,0.25), inset 0 1px 0 rgba(255,255,255,0.22)"
      : "none",
  };
}

function rowStyle(on: boolean) {
  return {
    background: on
      ? "linear-gradient(180deg, rgba(124,95,255,0.12) 0%, rgba(124,95,255,0.04) 100%)"
      : "rgba(255,255,255,0.025)",
    border: `1px solid ${on ? "rgba(124,95,255,0.32)" : LINE_2}`,
  };
}

function Logo() {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-md"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 18 L12 4 L20 18 M7.5 13.5 L16.5 13.5"
          stroke="#fff"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
