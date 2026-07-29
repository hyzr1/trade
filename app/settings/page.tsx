// app/settings/page.tsx
"use client";
import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  Bell,
  Camera,
  Code,
  CreditCard,
  ExternalLink,
  User,
  Copy,
  Check,
  Trash2,
  Download,
  ChevronDown,
  Mail,
} from "lucide-react";
import { DeskShell } from "@/components/desk/DeskShell";
import { Toggle } from "@/components/ui/Toggle";
import { useAuth } from "@/lib/auth-stub";
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

type TabId = "profile" | "notifications" | "billing" | "api" | "danger";

const TABS: { id: TabId; label: string; icon: React.ComponentType<{ size?: number }> }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "api", label: "API & Webhooks", icon: Code },
  { id: "danger", label: "Danger Zone", icon: AlertTriangle },
];

export default function SettingsPage() {
  const { user, signIn } = useAuth();
  const [tab, setTab] = useState<TabId>("profile");

  if (!user) {
    return (
      <DeskShell breadcrumb="Settings">
        <SignedOutHero onSignIn={signIn} />
      </DeskShell>
    );
  }

  return (
    <DeskShell breadcrumb="Settings">
      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <div
            className="rounded-2xl p-2 sticky top-[72px]"
            style={{
              background:
                "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
              border: `1px solid ${LINE_2}`,
            }}
          >
            <div
              className="px-3 pt-2 pb-3 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_LOW }}
            >
              Settings
            </div>
            <nav className="flex flex-col gap-0.5">
              {TABS.map((t) => (
                <TabButton
                  key={t.id}
                  active={tab === t.id}
                  onClick={() => setTab(t.id)}
                  icon={<t.icon size={14} />}
                  label={t.label}
                  danger={t.id === "danger"}
                />
              ))}
            </nav>
          </div>
        </aside>

        <main className="col-span-12 lg:col-span-9">
          {tab === "profile" && <ProfileTab email={user.email} />}
          {tab === "notifications" && <NotificationsTab />}
          {tab === "billing" && <BillingTab />}
          {tab === "api" && <ApiTab />}
          {tab === "danger" && <DangerTab email={user.email} />}
        </main>
      </div>
    </DeskShell>
  );
}

/* ───────────────────────── Tab Rail ───────────────────────── */

function TabButton({
  active,
  onClick,
  icon,
  label,
  danger,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="group relative flex items-center gap-2.5 pl-4 pr-3 py-2 rounded-md text-[13px] transition-colors text-left"
      style={{
        color: active ? TEXT_HI : danger ? "rgba(248,113,113,0.7)" : TEXT_MID,
        background: active ? "rgba(124,95,255,0.10)" : "transparent",
      }}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r"
          style={{ background: danger ? NEGATIVE : VIOLET }}
        />
      )}
      <span
        className="opacity-70"
        style={{ color: danger && !active ? NEGATIVE : undefined }}
      >
        {icon}
      </span>
      <span className="truncate">{label}</span>
    </button>
  );
}

/* ───────────────────────── Shared ───────────────────────── */

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-2xl ${className}`}
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.025) 0%, rgba(255,255,255,0.005) 100%)",
        border: `1px solid ${LINE_2}`,
      }}
    >
      {children}
    </div>
  );
}

function CardHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="px-6 py-4 border-b" style={{ borderColor: LINE }}>
      <h2 className="text-[16px] font-semibold" style={{ color: TEXT_HI }}>
        {title}
      </h2>
      {subtitle && (
        <p className="text-[12.5px] mt-1" style={{ color: TEXT_MID }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="px-6 py-4 grid grid-cols-12 gap-4 items-start border-b last:border-b-0" style={{ borderColor: LINE }}>
      <div className="col-span-12 md:col-span-4">
        <div className="text-[13px] font-medium" style={{ color: TEXT_HI }}>
          {label}
        </div>
        {hint && (
          <div className="text-[12px] mt-0.5" style={{ color: TEXT_LOW }}>
            {hint}
          </div>
        )}
      </div>
      <div className="col-span-12 md:col-span-8">{children}</div>
    </div>
  );
}

function Input({
  value,
  onChange,
  readOnly,
  placeholder,
  type = "text",
  ariaLabel,
}: {
  value: string;
  onChange?: (v: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  type?: string;
  ariaLabel?: string;
}) {
  return (
    <input
      type={type}
      value={value}
      readOnly={readOnly}
      onChange={(e) => onChange?.(e.target.value)}
      placeholder={placeholder}
      aria-label={ariaLabel ?? placeholder}
      className="focus-ring w-full px-3.5 py-2 rounded-lg text-[13px] outline-none transition-colors"
      style={{
        background: readOnly ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${LINE_2}`,
        color: readOnly ? TEXT_MID : TEXT_HI,
      }}
    />
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2 pr-9 rounded-lg text-[13px] outline-none appearance-none cursor-pointer"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${LINE_2}`,
          color: TEXT_HI,
        }}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value} style={{ background: BG_2, color: TEXT_HI }}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
        style={{ color: TEXT_LOW }}
      />
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-1.5 text-[12.5px] font-medium transition-all hover:brightness-110"
      style={{
        background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
        color: "#fff",
        boxShadow:
          "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
      }}
    >
      {children}
    </button>
  );
}

function GhostButton({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-1.5 text-[12.5px] font-medium transition-colors hover:bg-white/[0.04]"
      style={{
        background: "transparent",
        border: `1px solid ${danger ? "rgba(248,113,113,0.35)" : LINE_2}`,
        color: danger ? NEGATIVE : TEXT_HI,
      }}
    >
      {children}
    </button>
  );
}

/* ───────────────────────── Tabs ───────────────────────── */

function ProfileTab({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [defaultLanding, setDefaultLanding] = useState("desk");
  const [timezone, setTimezone] = useState("America/New_York");

  return (
    <Card>
      <CardHeader title="Profile" subtitle="Public-facing details and personal defaults." />
      <Row label="Avatar" hint="Shown next to your name on shared portfolios.">
        <div className="flex items-center gap-4">
          <div
            className="relative inline-flex items-center justify-center w-14 h-14 rounded-full shrink-0 select-none"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
              color: "#fff",
              fontFamily: "var(--font-display), Fraunces, serif",
              fontSize: 22,
              fontWeight: 600,
              boxShadow:
                "0 10px 24px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
            }}
            aria-hidden
          >
            {email[0]?.toUpperCase() ?? "A"}
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-1.5 text-[12.5px] transition-colors hover:bg-white/[0.06]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: `1px solid ${LINE_2}`,
              color: TEXT_HI,
            }}
          >
            <Camera size={13} />
            Change avatar
          </button>
          <span className="text-[11.5px]" style={{ color: TEXT_LOW }}>
            PNG or JPG · 1 MB max
          </span>
        </div>
      </Row>
      <Row label="Name" hint="Pulled from your Google account.">
        <Input value={name || email.split("@")[0]} onChange={setName} readOnly />
      </Row>
      <Row label="Email">
        <Input value={email} readOnly />
      </Row>
      <Row label="Default landing page" hint="Where /signin sends you after login.">
        <Select
          value={defaultLanding}
          onChange={setDefaultLanding}
          options={[
            { value: "desk", label: "Desk" },
            { value: "pelosi", label: "Pelosi" },
            { value: "last", label: "Last visited" },
          ]}
        />
      </Row>
      <Row label="Timezone" hint="Used to render filing timestamps.">
        <Select
          value={timezone}
          onChange={setTimezone}
          options={[
            { value: "America/New_York", label: "New York (UTC-5)" },
            { value: "America/Chicago", label: "Chicago (UTC-6)" },
            { value: "America/Denver", label: "Denver (UTC-7)" },
            { value: "America/Los_Angeles", label: "Los Angeles (UTC-8)" },
            { value: "Europe/London", label: "London (UTC+0)" },
            { value: "Asia/Tokyo", label: "Tokyo (UTC+9)" },
          ]}
        />
      </Row>
      <Row label="Theme" hint="More themes coming.">
        <div className="flex items-center gap-3">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12.5px]"
            style={{ background: "rgba(124,95,255,0.10)", border: `1px solid rgba(124,95,255,0.30)`, color: VIOLET_2 }}
          >
            <span className="w-3 h-3 rounded-sm" style={{ background: "linear-gradient(135deg, #08060F, #1a1530)" }} />
            Dark
          </div>
          <span className="text-[12px]" style={{ color: TEXT_LOW }}>
            Light + Solarized coming soon
          </span>
        </div>
      </Row>
      <div className="px-6 py-4 flex justify-end" style={{ borderTop: `1px solid ${LINE}` }}>
        <PrimaryButton>Save changes</PrimaryButton>
      </div>
    </Card>
  );
}

function NotificationsTab() {
  const [digest, setDigest] = useState<"daily" | "weekly" | "off">("daily");
  const [filings, setFilings] = useState(true);
  const [pushOn, setPushOn] = useState(false);
  const [deliveryTime, setDeliveryTime] = useState("08:00");

  return (
    <Card>
      <CardHeader title="Notifications" subtitle="Get pinged the moment a politician files." />

      {/* Top-priority: daily digest */}
      <div
        className="px-6 py-5"
        style={{
          borderBottom: `1px solid ${LINE}`,
          background:
            "linear-gradient(135deg, rgba(124,95,255,0.06) 0%, rgba(167,139,250,0.02) 100%)",
        }}
      >
        <div className="flex items-start gap-4 flex-wrap">
          <span
            className="inline-flex items-center justify-center w-10 h-10 rounded-xl shrink-0"
            style={{
              background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
              color: "#fff",
              boxShadow: "0 10px 24px -10px rgba(124,95,255,0.55)",
            }}
          >
            <Mail size={16} />
          </span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[14px] font-semibold" style={{ color: TEXT_HI }}>
                Daily digest
              </span>
              <span
                className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
                style={{ background: "rgba(124,95,255,0.18)", color: VIOLET_2 }}
              >
                Recommended
              </span>
            </div>
            <p className="text-[12.5px] mt-1 leading-relaxed" style={{ color: TEXT_MID }}>
              7am ET, every weekday. Big moves, AI consensus, and one anomaly.
            </p>
            <div className="mt-3 flex items-center gap-2 flex-wrap">
              {(["daily", "weekly", "off"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setDigest(opt)}
                  className="px-3 py-1.5 rounded-full text-[12px] capitalize transition-colors"
                  style={{
                    background: digest === opt ? "rgba(124,95,255,0.18)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${digest === opt ? "rgba(124,95,255,0.45)" : LINE_2}`,
                    color: digest === opt ? VIOLET_2 : TEXT_MID,
                  }}
                >
                  {opt}
                </button>
              ))}
              <Link
                href="/digest"
                className="ml-1 inline-flex items-center gap-1 text-[11.5px] transition-colors hover:text-white"
                style={{ color: VIOLET_2 }}
              >
                Preview <ExternalLink size={10} />
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Row label="Filing alerts" hint="Real-time emails when a watched portfolio files.">
        <div className="flex items-center justify-between">
          <span className="text-[12.5px]" style={{ color: TEXT_MID }}>
            {filings ? "On" : "Off"}
          </span>
          <Toggle on={filings} onChange={setFilings} />
        </div>
      </Row>
      <Row label="Push notifications" hint="Browser push, iOS/Android coming soon.">
        <div className="flex items-center justify-between">
          <span
            className="text-[10.5px] uppercase tracking-[0.16em] font-mono"
            style={{ color: YELLOW }}
          >
            Coming soon
          </span>
          <Toggle on={pushOn} onChange={setPushOn} />
        </div>
      </Row>
      <Row label="Preferred delivery time" hint="When your digest lands (your timezone).">
        <Input type="time" value={deliveryTime} onChange={setDeliveryTime} />
      </Row>
      <div className="px-6 py-4 flex justify-end" style={{ borderTop: `1px solid ${LINE}` }}>
        <PrimaryButton>Save preferences</PrimaryButton>
      </div>
    </Card>
  );
}

function BillingTab() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="Plan" subtitle="Manage your subscription and billing details." />
        <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span
                className="font-mono text-[10px] uppercase tracking-[0.18em] px-2 py-1 rounded-sm"
                style={{ background: "rgba(124,95,255,0.18)", color: VIOLET_2 }}
              >
                Pro
              </span>
              <span
                className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em]"
                style={{ color: POSITIVE }}
              >
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{ background: POSITIVE, boxShadow: `0 0 6px ${POSITIVE}` }}
                />
                Active
              </span>
            </div>
            <div className="text-[28px] font-semibold tracking-tight" style={{ color: TEXT_HI }}>
              $39<span className="text-[14px] font-normal" style={{ color: TEXT_MID }}> / month</span>
            </div>
            <div className="text-[12px] mt-1" style={{ color: TEXT_LOW }}>
              Renews <span style={{ color: TEXT_MID }}>Jan 28, 2026</span> · cancel anytime
            </div>
          </div>
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-lg px-3.5 py-2 text-[12.5px] font-medium transition-all hover:brightness-110"
            style={{
              background: "#635BFF",
              color: "#fff",
              boxShadow:
                "0 10px 24px -10px rgba(99,91,255,0.55), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <StripeWordmark />
            Manage in Stripe
            <ExternalLink size={12} />
          </a>
        </div>
      </Card>

      <Card>
        <CardHeader title="Payment method" subtitle="Securely stored by Stripe." />
        <div className="px-6 py-5 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3.5">
            <div
              className="inline-flex items-center justify-center w-10 h-7 rounded-md text-[10px] font-semibold tracking-wider"
              style={{
                background: "linear-gradient(135deg, #1a1f4d 0%, #0a0e2a 100%)",
                color: "#fff",
                border: `1px solid ${LINE_2}`,
              }}
            >
              VISA
            </div>
            <div>
              <div className="text-[13px] font-medium tabular-nums" style={{ color: TEXT_HI }}>
                •••• •••• •••• 4242
              </div>
              <div className="text-[11.5px]" style={{ color: TEXT_LOW }}>
                Expires 11 / 28
              </div>
            </div>
          </div>
          <GhostButton>Update</GhostButton>
        </div>
      </Card>

      <Card>
        <CardHeader title="Invoice history" />
        <div className="px-6 py-12 flex flex-col items-center justify-center text-center">
          <InvoiceEmptySVG />
          <div className="mt-5 text-[14px] font-medium" style={{ color: TEXT_HI }}>
            No invoices yet
          </div>
          <div className="mt-1.5 text-[12.5px] max-w-sm" style={{ color: TEXT_LOW }}>
            Your first invoice will appear here on Jan 28, 2026. We&apos;ll also email a copy.
          </div>
        </div>
      </Card>
    </div>
  );
}

function StripeWordmark() {
  // Stripe wordmark "S" mark — simplified abstract.
  return (
    <svg width="14" height="14" viewBox="0 0 60 25" fill="none" aria-hidden>
      <path
        d="M59.64 14.28h-8.06c.19 1.93 1.6 2.55 3.2 2.55 1.64 0 2.96-.37 4.05-.95v3.32a8.33 8.33 0 0 1-4.56 1.1c-4.01 0-6.83-2.5-6.83-7.48 0-4.19 2.39-7.52 6.3-7.52 3.92 0 5.96 3.28 5.96 7.5 0 .4-.04 1.26-.06 1.48zm-5.92-5.62c-1.03 0-2.17.73-2.17 2.58h4.25c0-1.85-1.07-2.58-2.08-2.58zM40.95 20.3c-1.44 0-2.32-.6-2.9-1.04l-.02 4.63-4.12.88V5.57h3.76l.08 1.02a4.7 4.7 0 0 1 3.23-1.29c2.9 0 5.62 2.6 5.62 7.4 0 5.23-2.7 7.6-5.65 7.6zM40 8.95c-.95 0-1.54.34-1.97.81l.02 6.12c.4.44.98.78 1.95.78 1.52 0 2.54-1.65 2.54-3.87 0-2.15-1.04-3.84-2.54-3.84zM28.24 5.57h4.13v14.44h-4.13V5.57zm0-4.7L32.37 0v3.36l-4.13.88V.88zm-4.32 9.35v9.79H19.8V5.57h3.7l.12 1.22c1-1.77 3.07-1.41 3.62-1.22v3.79c-.52-.17-2.29-.43-3.32.86zm-8.55 4.72c0 2.43 2.6 1.68 3.12 1.46v3.36c-.55.3-1.54.54-2.89.54a4.15 4.15 0 0 1-4.27-4.24l.01-13.17 4.02-.86v3.54h3.14V9h-3.14l.01 5.93zm-4.91.7c0 2.97-2.31 4.66-5.73 4.66a11.2 11.2 0 0 1-4.46-.93v-3.93c1.38.75 3.1 1.31 4.46 1.31.92 0 1.59-.24 1.59-1C6.32 13.94 0 14.83 0 10.2 0 7.29 2.16 5.5 5.5 5.5c1.32 0 2.64.2 3.96.73v3.88a9.3 9.3 0 0 0-3.97-1.03c-.86 0-1.4.25-1.4.92 0 1.65 6.34.86 6.34 5.65z"
        fill="currentColor"
      />
    </svg>
  );
}

function ApiTab() {
  const [apiKey] = useState("at_live_sk_7hNqz3X2mB8K9pTfA1cR4yV6jL5wQ");
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState("");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {}
  };

  const masked = apiKey.slice(0, 11) + "•".repeat(20) + apiKey.slice(-4);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader title="API key" subtitle="Use this token to authenticate REST and webhook calls." />
        <Row label="Secret key" hint="Treat like a password — never commit to source.">
          <div className="flex items-center gap-2">
            <div
              className="flex-1 px-3.5 py-2 rounded-lg font-mono text-[12px] truncate"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${LINE_2}`,
                color: TEXT_HI,
              }}
            >
              {showKey ? apiKey : masked}
            </div>
            <GhostButton onClick={() => setShowKey((v) => !v)}>
              {showKey ? "Hide" : "Show"}
            </GhostButton>
            <GhostButton onClick={copy}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy"}
            </GhostButton>
          </div>
        </Row>
        <Row label="Rate limit" hint="Pro tier: 600 requests / minute.">
          <RateLimitBar used={142} max={600} />
        </Row>
      </Card>

      <Card>
        <CardHeader title="Webhook endpoint" subtitle="We POST every filing event to this URL." />
        <Row label="Endpoint URL">
          <div className="flex items-center gap-2">
            <Input value={webhookUrl} onChange={setWebhookUrl} placeholder="https://yourapp.com/webhooks/autotrade" />
            <GhostButton>Test</GhostButton>
          </div>
        </Row>
        <Row label="Documentation" hint="Schemas, signatures, and replay protection.">
          <a
            href="/docs"
            className="inline-flex items-center gap-2 text-[12.5px] hover:underline"
            style={{ color: VIOLET_2 }}
          >
            Read the docs <ExternalLink size={11} />
          </a>
        </Row>
      </Card>
    </div>
  );
}

function RateLimitBar({ used, max }: { used: number; max: number }) {
  const pct = (used / max) * 100;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono tabular-nums text-[12px]" style={{ color: TEXT_HI }}>
          {used} <span style={{ color: TEXT_LOW }}>/ {max} req · min</span>
        </span>
        <span className="font-mono text-[11px]" style={{ color: TEXT_LOW }}>
          resets in 42s
        </span>
      </div>
      <div
        className="h-1.5 rounded-full overflow-hidden"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: `linear-gradient(90deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
          }}
        />
      </div>
    </div>
  );
}

function DangerTab({ email }: { email: string }) {
  const [confirmOpen, setConfirmOpen] = useState(false);

  const exportData = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            user: { email },
            exportedAt: new Date().toISOString(),
            watchlist: JSON.parse(localStorage.getItem("autotrade.watchlist") ?? "[]"),
            alerts: JSON.parse(localStorage.getItem("autotrade.alerts") ?? "[]"),
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `autotrade-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Card>
        <CardHeader title="Danger zone" subtitle="Irreversible actions. Read carefully." />
        <Row label="Export your data" hint="A JSON dump of your watchlist, alerts, and account.">
          <GhostButton onClick={exportData}>
            <Download size={13} /> Export
          </GhostButton>
        </Row>
        <Row label="Delete account" hint="Cancels Pro, clears all stored data. Cannot be undone.">
          <GhostButton onClick={() => setConfirmOpen(true)} danger>
            <Trash2 size={13} /> Delete account
          </GhostButton>
        </Row>
      </Card>

      {confirmOpen && <ConfirmDeleteModal email={email} onClose={() => setConfirmOpen(false)} />}
    </>
  );
}

function ConfirmDeleteModal({ email, onClose }: { email: string; onClose: () => void }) {
  const [text, setText] = useState("");
  const matches = text === email;
  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      style={{ background: "rgba(4,2,10,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: BG_2,
          border: `1px solid ${LINE_2}`,
          boxShadow: "0 60px 160px -30px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-6 py-4 flex items-center gap-3"
          style={{ borderBottom: `1px solid ${LINE}` }}
        >
          <span
            className="inline-flex items-center justify-center w-9 h-9 rounded-full"
            style={{ background: "rgba(248,113,113,0.12)", color: NEGATIVE }}
          >
            <AlertTriangle size={16} />
          </span>
          <div>
            <div className="text-[14px] font-semibold" style={{ color: TEXT_HI }}>
              Delete account
            </div>
            <div className="text-[12px]" style={{ color: TEXT_LOW }}>
              This cannot be undone.
            </div>
          </div>
        </div>
        <div className="px-6 py-5 space-y-3">
          <p className="text-[13px] leading-relaxed" style={{ color: TEXT_MID }}>
            Your Pro subscription will be cancelled, your watchlist and alerts will be cleared, and
            your sign-in will be revoked. Type your email <span className="font-mono" style={{ color: TEXT_HI }}>{email}</span> to confirm.
          </p>
          <Input value={text} onChange={setText} placeholder={email} />
        </div>
        <div
          className="px-6 py-4 flex items-center justify-end gap-2"
          style={{ borderTop: `1px solid ${LINE}` }}
        >
          <GhostButton onClick={onClose}>Cancel</GhostButton>
          <button
            disabled={!matches}
            onClick={onClose}
            className="inline-flex items-center gap-2 rounded-full pl-3.5 pr-4 py-1.5 text-[12.5px] font-medium transition-all"
            style={{
              background: matches
                ? `linear-gradient(135deg, ${NEGATIVE} 0%, #c54545 100%)`
                : "rgba(248,113,113,0.18)",
              color: "#fff",
              cursor: matches ? "pointer" : "not-allowed",
              opacity: matches ? 1 : 0.5,
              boxShadow: matches
                ? "0 10px 30px -10px rgba(248,113,113,0.55), inset 0 1px 0 rgba(255,255,255,0.20)"
                : "none",
            }}
          >
            <Trash2 size={13} /> Delete forever
          </button>
        </div>
      </div>
    </div>
  );
}

function InvoiceEmptySVG() {
  return (
    <svg width="120" height="100" viewBox="0 0 120 100" fill="none" aria-hidden>
      <rect
        x="22"
        y="14"
        width="68"
        height="80"
        rx="6"
        fill="rgba(255,255,255,0.025)"
        stroke="rgba(255,255,255,0.10)"
      />
      <rect x="30" y="24" width="36" height="4" rx="2" fill="rgba(255,255,255,0.18)" />
      <rect x="30" y="34" width="52" height="2.5" rx="1.25" fill="rgba(255,255,255,0.08)" />
      <rect x="30" y="42" width="46" height="2.5" rx="1.25" fill="rgba(255,255,255,0.08)" />
      <rect x="30" y="50" width="50" height="2.5" rx="1.25" fill="rgba(255,255,255,0.08)" />
      <rect x="30" y="62" width="52" height="14" rx="3" fill="rgba(124,95,255,0.10)" stroke="rgba(124,95,255,0.20)" />
      <rect x="36" y="68" width="20" height="2.5" rx="1.25" fill="rgba(167,139,250,0.45)" />
      <rect x="60" y="68" width="16" height="2.5" rx="1.25" fill="rgba(167,139,250,0.30)" />
      <circle cx="92" cy="22" r="10" fill="rgba(124,95,255,0.15)" stroke="rgba(124,95,255,0.30)" />
      <path d="M88 22 L91 25 L96 19" stroke="#A78BFA" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SignedOutHero({ onSignIn }: { onSignIn: () => void }) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="max-w-md text-center">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
          style={{
            background: `linear-gradient(135deg, rgba(124,95,255,0.25) 0%, rgba(124,95,255,0.05) 100%)`,
            border: `1px solid rgba(124,95,255,0.30)`,
          }}
        >
          <User size={28} style={{ color: VIOLET_2 }} />
        </div>
        <h1 className="text-[28px] font-semibold tracking-tight" style={{ color: TEXT_HI }}>
          Sign in to access settings
        </h1>
        <p className="mt-3 text-[14px] leading-relaxed" style={{ color: TEXT_MID }}>
          Your profile, billing, API keys, and notification preferences live here once you sign in.
        </p>
        <button
          onClick={onSignIn}
          className="mt-7 inline-flex items-center gap-2.5 rounded-full pl-3 pr-5 py-2.5 text-[14px] font-medium transition-all hover:brightness-110"
          style={{
            background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
            color: "#fff",
            boxShadow:
              "0 14px 36px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
          }}
        >
          <span
            className="inline-flex items-center justify-center w-7 h-7 rounded-full"
            style={{ background: "#fff" }}
          >
            <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
              <path fill="#4285F4" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
              <path fill="#34A853" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 7 29.3 5 24 5c-7.4 0-13.7 4.4-16.6 9.7z" />
              <path fill="#FBBC05" d="M24 44c5.2 0 9.8-1.7 13.4-4.7l-6.2-5.2C29 35.7 26.6 36.5 24 36.5c-5.3 0-9.7-3.4-11.3-8.1l-6.6 5.1C9 39.6 15.9 44 24 44z" />
              <path fill="#EA4335" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.3 5.5l6.2 5.2C40.7 35.4 44 30.2 44 24c0-1.3-.1-2.7-.4-3.5z" />
            </svg>
          </span>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
