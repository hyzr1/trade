// app/alerts/page.tsx
"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Bell, Plus, Trash2, X, Users, Sparkles, TrendingUp, Mail } from "lucide-react";
import { useToast } from "@/components/ui/Toaster";
import { Toggle } from "@/components/ui/Toggle";
import { DeskShell } from "@/components/desk/DeskShell";
import {
  useAlerts,
  describeAlert,
  type Alert,
  type AlertKind,
} from "@/lib/alerts";
import {
  BG_2,
  LINE,
  LINE_2,
  POSITIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
  YELLOW,
} from "@/lib/theme";

type Politician = { slug: string; name: string };

export default function AlertsPage() {
  const { alerts, remove, setEnabled, hydrated, create } = useAlerts();
  const [modalOpen, setModalOpen] = useState(false);
  const [politicians, setPoliticians] = useState<Politician[]>([]);

  useEffect(() => {
    fetch("/api/search")
      .then((r) => r.json())
      .then((j: { portfolios: { slug: string; name: string; kind: string }[] }) => {
        setPoliticians(j.portfolios ?? []);
      })
      .catch(() => setPoliticians([]));
  }, []);

  const nameForSlug = (slug: string) =>
    politicians.find((p) => p.slug === slug)?.name ?? slug;

  return (
    <DeskShell breadcrumb="Alerts">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight" style={{ color: TEXT_HI }}>
            Alerts
          </h1>
          <p className="text-[13px] mt-1" style={{ color: TEXT_MID }}>
            {alerts.length} rule{alerts.length === 1 ? "" : "s"} configured
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-[13px] font-medium transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
            color: "#fff",
            boxShadow:
              "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
          }}
        >
          <Plus size={14} /> New alert
        </button>
      </div>

      {hydrated && alerts.length === 0 ? (
        <EmptyState
          onCreate={() => setModalOpen(true)}
          onQuickAdd={(kind, params) => create(kind, params)}
        />
      ) : (
        <div className="space-y-3">
          <AnimatePresence initial={false}>
            {alerts.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  height: 0,
                  marginTop: 0,
                  paddingTop: 0,
                  paddingBottom: 0,
                  transition: { duration: 0.24, ease: [0.22, 1, 0.36, 1] },
                }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                style={{ overflow: "hidden" }}
              >
                <AlertCard
                  alert={a}
                  describe={() => describeAlert(a, nameForSlug)}
                  onToggle={(en) => setEnabled(a.id, en)}
                  onRemove={() => remove(a.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {modalOpen && (
        <NewAlertModal
          politicians={politicians}
          onClose={() => setModalOpen(false)}
          onCreate={(kind, params) => {
            create(kind, params);
            setModalOpen(false);
          }}
        />
      )}
    </DeskShell>
  );
}
/* ───────────────────────── Alert Card ───────────────────────── */

function AlertCard({
  alert,
  describe,
  onToggle,
  onRemove,
}: {
  alert: Alert;
  describe: () => string;
  onToggle: (en: boolean) => void;
  onRemove: () => void;
}) {
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-5 transition-colors hover:bg-white/[0.02]"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
        opacity: alert.enabled ? 1 : 0.55,
      }}
    >
      <KindIcon kind={alert.kind} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <KindBadge kind={alert.kind} />
          {alert.channels.email && (
            <span
              className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.04)", color: TEXT_MID }}
            >
              <Mail size={9} /> Email
            </span>
          )}
        </div>
        <div className="text-[14px] mt-1.5 font-medium" style={{ color: TEXT_HI }}>
          {describe()}
        </div>
        <div className="text-[11px] mt-1 font-mono" style={{ color: TEXT_LOW }}>
          {alert.lastTriggered
            ? `Last triggered ${fmtRel(alert.lastTriggered)}`
            : "Never triggered"}{" "}
          · Created {fmtRel(alert.createdAt)}
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <Toggle on={alert.enabled} onChange={onToggle} />
        <button
          onClick={onRemove}
          aria-label="Delete alert"
          className="inline-flex items-center justify-center w-8 h-8 rounded-full transition-colors hover:bg-white/[0.06]"
          style={{ color: TEXT_MID }}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

function KindIcon({ kind }: { kind: AlertKind }) {
  const cfg = KIND_META[kind];
  const Icon = cfg.icon;
  return (
    <span
      className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, color: cfg.fg }}
    >
      <Icon size={16} />
    </span>
  );
}

function KindBadge({ kind }: { kind: AlertKind }) {
  const cfg = KIND_META[kind];
  return (
    <span
      className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
      style={{ background: cfg.bg, color: cfg.fg }}
    >
      {cfg.label}
    </span>
  );
}

const KIND_META: Record<
  AlertKind,
  { label: string; icon: React.ComponentType<{ size?: number }>; bg: string; fg: string; border: string }
> = {
  politician_trades: {
    label: "Politician",
    icon: Users,
    bg: "rgba(124,95,255,0.14)",
    fg: "#A78BFA",
    border: "rgba(124,95,255,0.30)",
  },
  ticker_trades: {
    label: "Ticker",
    icon: TrendingUp,
    bg: "rgba(240,180,41,0.10)",
    fg: "#F0B429",
    border: "rgba(240,180,41,0.30)",
  },
  ai_consensus: {
    label: "AI",
    icon: Sparkles,
    bg: "rgba(74,222,128,0.10)",
    fg: "#4ADE80",
    border: "rgba(74,222,128,0.28)",
  },
  daily_digest: {
    label: "Digest",
    icon: Mail,
    bg: "rgba(255,255,255,0.04)",
    fg: "#fff",
    border: "rgba(255,255,255,0.10)",
  },
};

/* ───────────────────────── New Alert Modal ───────────────────────── */

type NewAlertParams = { portfolioSlug?: string; ticker?: string };

function NewAlertModal({
  politicians,
  onClose,
  onCreate,
}: {
  politicians: Politician[];
  onClose: () => void;
  onCreate: (kind: AlertKind, params: NewAlertParams) => void;
}) {
  const [kind, setKind] = useState<AlertKind | null>(null);
  const [portfolioSlug, setPortfolioSlug] = useState(politicians[0]?.slug ?? "");
  const [ticker, setTicker] = useState("");

  useEffect(() => {
    if (!portfolioSlug && politicians.length > 0) setPortfolioSlug(politicians[0].slug);
  }, [politicians, portfolioSlug]);

  const canCreate = (() => {
    if (!kind) return false;
    if (kind === "politician_trades") return Boolean(portfolioSlug);
    if (kind === "ticker_trades" || kind === "ai_consensus") return ticker.trim().length > 0;
    return true;
  })();

  const submit = () => {
    if (!kind) return;
    onCreate(kind, {
      portfolioSlug: kind === "politician_trades" ? portfolioSlug : undefined,
      ticker:
        kind === "ticker_trades" || kind === "ai_consensus"
          ? ticker.trim().toUpperCase()
          : undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(4,2,10,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          background: BG_2,
          border: `1px solid ${LINE_2}`,
          boxShadow: "0 60px 160px -30px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${LINE}` }}
        >
          <div>
            <div className="text-[14px] font-semibold" style={{ color: TEXT_HI }}>
              New alert
            </div>
            <div className="text-[12px]" style={{ color: TEXT_LOW }}>
              Pick a trigger, configure the details, save.
            </div>
          </div>
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center w-7 h-7 rounded-full hover:bg-white/[0.06]"
            style={{ color: TEXT_MID }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          <div
            className="font-mono text-[10px] uppercase tracking-[0.18em]"
            style={{ color: TEXT_LOW }}
          >
            Trigger
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <KindOption
              kind="politician_trades"
              active={kind === "politician_trades"}
              onClick={() => setKind("politician_trades")}
              title="When a politician trades"
              desc="Any ticker, just pick the lawmaker."
            />
            <KindOption
              kind="ticker_trades"
              active={kind === "ticker_trades"}
              onClick={() => setKind("ticker_trades")}
              title="When anyone trades a ticker"
              desc="Get pinged on any disclosure for a symbol."
            />
            <KindOption
              kind="ai_consensus"
              active={kind === "ai_consensus"}
              onClick={() => setKind("ai_consensus")}
              title="When AI consensus shifts"
              desc="Models agreeing or splitting on a stock."
            />
            <KindOption
              kind="daily_digest"
              active={kind === "daily_digest"}
              onClick={() => setKind("daily_digest")}
              title="Daily digest"
              desc="One email per day with everything."
            />
          </div>

          {kind === "politician_trades" && (
            <div className="pt-3">
              <Label>Pick a portfolio</Label>
              <select
                value={portfolioSlug}
                onChange={(e) => setPortfolioSlug(e.target.value)}
                className="mt-1.5 w-full px-3.5 py-2 rounded-lg text-[13px] outline-none cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${LINE_2}`,
                  color: TEXT_HI,
                }}
              >
                {politicians.map((p) => (
                  <option key={p.slug} value={p.slug} style={{ background: BG_2, color: TEXT_HI }}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(kind === "ticker_trades" || kind === "ai_consensus") && (
            <div className="pt-3">
              <Label>Ticker symbol</Label>
              <input
                value={ticker}
                onChange={(e) => setTicker(e.target.value.toUpperCase())}
                placeholder="e.g. NVDA"
                className="mt-1.5 w-full px-3.5 py-2 rounded-lg text-[13px] outline-none font-mono uppercase"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: `1px solid ${LINE_2}`,
                  color: YELLOW,
                }}
              />
            </div>
          )}
        </div>

        <div
          className="px-6 py-4 flex items-center justify-between"
          style={{ borderTop: `1px solid ${LINE}` }}
        >
          <span className="text-[12px]" style={{ color: TEXT_LOW }}>
            Delivered to your account email.
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="inline-flex items-center rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-white/[0.04]"
              style={{
                background: "transparent",
                border: `1px solid ${LINE_2}`,
                color: TEXT_HI,
              }}
            >
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!canCreate}
              className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-1.5 text-[12.5px] font-medium transition-all"
              style={{
                background: canCreate
                  ? `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`
                  : "rgba(124,95,255,0.18)",
                color: "#fff",
                opacity: canCreate ? 1 : 0.5,
                cursor: canCreate ? "pointer" : "not-allowed",
                boxShadow: canCreate
                  ? "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)"
                  : "none",
              }}
            >
              Create alert
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KindOption({
  kind,
  active,
  onClick,
  title,
  desc,
}: {
  kind: AlertKind;
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
}) {
  const cfg = KIND_META[kind];
  const Icon = cfg.icon;
  return (
    <button
      onClick={onClick}
      className="text-left rounded-xl p-3 transition-all"
      style={{
        background: active ? "rgba(124,95,255,0.10)" : "rgba(255,255,255,0.02)",
        border: `1px solid ${active ? "rgba(124,95,255,0.45)" : LINE_2}`,
      }}
    >
      <div className="flex items-start gap-2.5">
        <span
          className="inline-flex items-center justify-center w-7 h-7 rounded-lg shrink-0 mt-0.5"
          style={{ background: cfg.bg, color: cfg.fg, border: `1px solid ${cfg.border}` }}
        >
          <Icon size={13} />
        </span>
        <div className="min-w-0">
          <div className="text-[13px] font-medium" style={{ color: TEXT_HI }}>
            {title}
          </div>
          <div className="text-[11.5px] mt-0.5" style={{ color: TEXT_MID }}>
            {desc}
          </div>
        </div>
      </div>
    </button>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="font-mono text-[10px] uppercase tracking-[0.18em]"
      style={{ color: TEXT_LOW }}
    >
      {children}
    </div>
  );
}

/* ───────────────────────── Bits ───────────────────────── */

function EmptyState({
  onCreate,
  onQuickAdd,
}: {
  onCreate: () => void;
  onQuickAdd: (kind: AlertKind, params: { portfolioSlug?: string; ticker?: string }) => void;
}) {
  const { toast } = useToast();

  const quickAdds: {
    kind: AlertKind;
    params: { portfolioSlug?: string; ticker?: string };
    label: string;
    sub: string;
    icon: React.ComponentType<{ size?: number }>;
    accent: string;
    accentBg: string;
    accentBorder: string;
  }[] = [
    {
      kind: "politician_trades",
      params: { portfolioSlug: "pelosi" },
      label: "Pelosi files",
      sub: "Any new disclosure",
      icon: Users,
      accent: VIOLET_2,
      accentBg: "rgba(124,95,255,0.12)",
      accentBorder: "rgba(124,95,255,0.30)",
    },
    {
      kind: "ticker_trades",
      params: { ticker: "NVDA" },
      label: "NVDA trades",
      sub: "Anyone, any size",
      icon: TrendingUp,
      accent: "#F0B429",
      accentBg: "rgba(240,180,41,0.10)",
      accentBorder: "rgba(240,180,41,0.30)",
    },
    {
      kind: "daily_digest",
      params: {},
      label: "Daily digest",
      sub: "7am ET roll-up",
      icon: Mail,
      accent: "#fff",
      accentBg: "rgba(255,255,255,0.05)",
      accentBorder: "rgba(255,255,255,0.14)",
    },
  ];

  const handleQuick = (
    kind: AlertKind,
    params: { portfolioSlug?: string; ticker?: string },
    label: string,
  ) => {
    onQuickAdd(kind, params);
    toast(`Alert created: ${label}`, {
      variant: "success",
      description: "We'll email you the moment it triggers.",
    });
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center py-12">
      <div className="max-w-xl text-center">
        <EmptyAlertsSVG />
        <h2 className="text-[24px] font-semibold tracking-tight mt-6" style={{ color: TEXT_HI }}>
          Catch every filing the moment it lands.
        </h2>
        <p className="mt-3 text-[14px] leading-relaxed max-w-md mx-auto" style={{ color: TEXT_MID }}>
          Build precise rules: a single politician, a ticker, AI consensus shifts, or a
          daily roll-up. Email today, push tomorrow.
        </p>

        {/* Quick-add presets */}
        <div className="mt-6">
          <div
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] mb-3"
            style={{ color: TEXT_LOW }}
          >
            <Sparkles size={10} style={{ color: VIOLET_2 }} />
            One-tap presets
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {quickAdds.map((q) => {
              const Icon = q.icon;
              return (
                <button
                  key={q.label}
                  onClick={() => handleQuick(q.kind, q.params, q.label)}
                  className="group flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all hover:bg-white/[0.04]"
                  style={{
                    background: "rgba(255,255,255,0.02)",
                    border: `1px solid ${LINE_2}`,
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-8 h-8 rounded-lg shrink-0 transition-transform group-hover:scale-105"
                    style={{
                      background: q.accentBg,
                      border: `1px solid ${q.accentBorder}`,
                      color: q.accent,
                    }}
                  >
                    <Icon size={14} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-[12.5px] font-medium truncate" style={{ color: TEXT_HI }}>
                      {q.label}
                    </div>
                    <div className="text-[11px] truncate" style={{ color: TEXT_LOW }}>
                      {q.sub}
                    </div>
                  </div>
                  <Plus
                    size={13}
                    className="shrink-0 opacity-40 group-hover:opacity-100 transition-opacity"
                    style={{ color: VIOLET_2 }}
                  />
                </button>
              );
            })}
          </div>
        </div>

        {/* Divider with 'or' */}
        <div className="mt-7 flex items-center gap-3 max-w-xs mx-auto">
          <span className="flex-1 h-px" style={{ background: LINE_2 }} />
          <span
            className="font-mono text-[9.5px] uppercase tracking-[0.20em]"
            style={{ color: TEXT_LOW }}
          >
            or
          </span>
          <span className="flex-1 h-px" style={{ background: LINE_2 }} />
        </div>

        <button
          onClick={onCreate}
          className="mt-5 inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-2 text-[13px] font-medium transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
            color: "#fff",
            boxShadow:
              "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
          }}
        >
          <Plus size={14} /> Custom alert
        </button>

        {/* Sample preview — 'what your alert will look like' */}
        <div className="mt-10">
          <div
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] mb-3"
            style={{ color: TEXT_LOW }}
          >
            <Bell size={10} style={{ color: YELLOW }} />
            Preview · what triggers
          </div>
          <SampleAlertPreview />
        </div>
      </div>
    </div>
  );
}

function SampleAlertPreview() {
  return (
    <div
      className="relative max-w-md mx-auto rounded-2xl p-4 text-left overflow-hidden"
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      {/* Sample ribbon */}
      <span
        className="absolute top-2 right-2 font-mono text-[9px] uppercase tracking-[0.20em] px-1.5 py-0.5 rounded-sm"
        style={{
          background: "rgba(247,210,74,0.10)",
          color: YELLOW,
          border: "1px solid rgba(247,210,74,0.25)",
        }}
      >
        Sample
      </span>
      <div className="flex items-start gap-3">
        <span
          className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
          style={{
            background: "rgba(124,95,255,0.14)",
            border: `1px solid rgba(124,95,255,0.30)`,
            color: VIOLET_2,
          }}
        >
          <Users size={16} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{ background: "rgba(124,95,255,0.14)", color: VIOLET_2 }}
            >
              Politician
            </span>
            <span
              className="inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{ background: "rgba(255,255,255,0.04)", color: TEXT_MID }}
            >
              <Mail size={9} /> Email
            </span>
          </div>
          <div className="text-[13.5px] mt-1.5 font-medium" style={{ color: TEXT_HI }}>
            When <span style={{ color: VIOLET_2 }}>Nancy Pelosi</span> files a trade
          </div>
          <div className="text-[11.5px] mt-1.5 leading-relaxed" style={{ color: TEXT_MID }}>
            <span className="font-mono" style={{ color: "#F0B429" }}>NVDA</span>{" "}
            <span className="font-mono uppercase text-[10px] tracking-[0.12em] px-1 py-0.5 rounded-sm" style={{ background: "rgba(74,222,128,0.10)", color: POSITIVE }}>BUY</span>{" "}
            · $5M–$25M · disclosed 32d after trade
          </div>
        </div>
      </div>
    </div>
  );
}

function EmptyAlertsSVG() {
  return (
    <div className="relative mx-auto" style={{ width: 160, height: 130 }}>
      {/* Sound waves */}
      <svg
        width="160"
        height="130"
        viewBox="0 0 160 130"
        fill="none"
        aria-hidden
        className="absolute inset-0"
      >
        <defs>
          <radialGradient id="bell-halo" cx="50%" cy="55%" r="55%">
            <stop offset="0%" stopColor="#7C5FFF" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#7C5FFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <ellipse cx="80" cy="68" rx="68" ry="50" fill="url(#bell-halo)" />

        {/* Sound waves — pulse anim */}
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <path
              d={`M ${36 - i * 6} 56 Q ${30 - i * 8} 68 ${36 - i * 6} 80`}
              fill="none"
              stroke="rgba(167,139,250,0.5)"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity={0.7 - i * 0.18}
            >
              <animate
                attributeName="opacity"
                values={`${0.7 - i * 0.18};0;${0.7 - i * 0.18}`}
                dur="2.4s"
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
              />
            </path>
            <path
              d={`M ${124 + i * 6} 56 Q ${130 + i * 8} 68 ${124 + i * 6} 80`}
              fill="none"
              stroke="rgba(167,139,250,0.5)"
              strokeWidth="1.4"
              strokeLinecap="round"
              opacity={0.7 - i * 0.18}
            >
              <animate
                attributeName="opacity"
                values={`${0.7 - i * 0.18};0;${0.7 - i * 0.18}`}
                dur="2.4s"
                begin={`${i * 0.35}s`}
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}

        {/* Bell body */}
        <path
          d="M 60 78 C 60 60 68 50 80 50 C 92 50 100 60 100 78 L 104 86 L 56 86 Z"
          fill="rgba(124,95,255,0.14)"
          stroke="rgba(167,139,250,0.65)"
          strokeWidth="1.6"
          strokeLinejoin="round"
        />
        {/* Bell clapper */}
        <path
          d="M 73 92 C 73 96 76 98 80 98 C 84 98 87 96 87 92"
          fill="none"
          stroke="rgba(167,139,250,0.65)"
          strokeWidth="1.6"
          strokeLinecap="round"
        />
        {/* Bell handle */}
        <circle cx="80" cy="46" r="3.5" fill="rgba(167,139,250,0.85)" />
        <line x1="80" y1="36" x2="80" y2="44" stroke="rgba(167,139,250,0.85)" strokeWidth="1.6" strokeLinecap="round" />

        {/* Notification dot */}
        <circle cx="108" cy="48" r="8" fill="rgba(248,113,113,0.20)" stroke="rgba(248,113,113,0.65)" strokeWidth="1.2" />
        <text
          x="108"
          y="51.5"
          textAnchor="middle"
          fontSize="8.5"
          fontFamily="ui-monospace, monospace"
          fontWeight="700"
          fill="#F87171"
        >
          3
        </text>

        {/* Decoration stars */}
        <circle cx="22" cy="20" r="1.4" fill="rgba(247,210,74,0.65)" />
        <circle cx="142" cy="108" r="1.6" fill="rgba(247,210,74,0.5)" />
        <circle cx="14" cy="100" r="1.4" fill="rgba(167,139,250,0.50)" />
      </svg>
    </div>
  );
}

function fmtRel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const diff = Date.now() - d.getTime();
  const sec = Math.round(diff / 1000);
  if (sec < 60) return `${sec}s ago`;
  const min = Math.round(sec / 60);
  if (min < 60) return `${min}m ago`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.round(hr / 24);
  if (day < 30) return `${day}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
