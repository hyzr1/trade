// components/desk/DeskShell.tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  Bell,
  Bookmark,
  CalendarDays,
  GitCompareArrows,
  LayoutGrid,
  LineChart,
  Menu,
  MessageSquare,
  Radar as RadarIcon,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Telescope,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/lib/auth-stub";
import { useWatchlist } from "@/lib/watchlist";
import { useSavedSearches, filtersToQueryString, summarizeFilters } from "@/lib/saved-searches";
import { CommandPalette } from "@/components/desk/CommandPalette";
import { MobileDrawer, MobileTabBar } from "@/components/desk/MobileNav";
import { NotificationCenter } from "@/components/desk/NotificationCenter";
import { MarketStatus } from "@/components/desk/MarketStatus";
import { FloatingChatButton } from "@/components/ai/FloatingChatButton";
import { OnboardingGate } from "@/components/auth/OnboardingGate";
import { PageTransition } from "@/components/ui/PageTransition";
import {
  BG,
  BG_2,
  LINE,
  LINE_2,
  POSITIVE,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
} from "@/lib/theme";

type DeskShellProps = {
  breadcrumb: string;
  children: React.ReactNode;
};

const POLITICIANS = [
  { slug: "pelosi", name: "Nancy Pelosi" },
  { slug: "greene", name: "M.T. Greene" },
  { slug: "gottheimer", name: "Josh Gottheimer" },
  { slug: "hern", name: "Kevin Hern" },
];

const LLMS = [
  { slug: "gpt", name: "GPT-5" },
  { slug: "claude", name: "Claude" },
];

const DEEP = [
  { href: "/terminal#leaderboard", label: "Leaderboard" },
  { href: "/terminal#movers", label: "Top movers" },
  { href: "/terminal#hot", label: "Hot tickers" },
  { href: "/terminal#ai", label: "AI consensus" },
];

const MARKETS = [
  { href: "/ticker/NVDA", label: "NVDA", trending: true },
  { href: "/ticker/MSFT", label: "MSFT", trending: true },
  { href: "/sector/Tech", label: "Tech sector", trending: false },
  { href: "/sector/Defense", label: "Defense sector", trending: true },
];

export function DeskShell({ breadcrumb, children }: DeskShellProps) {
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <div
      className="min-h-screen flex"
      style={{ background: BG, color: TEXT_HI, fontFamily: "var(--font-sans)" }}
    >
      {/* Skip link — invisible until keyboard-focused, jumps to main content. */}
      <a href="#main-content" className="skip-to-content">
        Skip to main content
      </a>
      <OnboardingGate />
      <Sidebar />
      <div className="flex-1 min-w-0 flex flex-col">
        <TopBar
          breadcrumb={breadcrumb}
          onOpenPalette={() => setPaletteOpen(true)}
          onOpenDrawer={() => setDrawerOpen(true)}
        />
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8 pb-20 md:pb-8"
        >
          <div className="max-w-[1400px] mx-auto space-y-6">
            <PageTransition>{children}</PageTransition>
          </div>
        </main>
      </div>
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <MobileTabBar onOpenSearch={() => setPaletteOpen(true)} />
      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
      <FloatingChatButton />
    </div>
  );
}

/* ───────────────────────── Sidebar ───────────────────────── */

function Sidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <aside
      className="hidden md:flex flex-col w-[260px] shrink-0 sticky self-start"
      style={{
        top: 0,
        height: "100vh",
        maxHeight: "100vh",
        overflowY: "auto",
        background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
        borderRight: `1px solid ${LINE}`,
      }}
    >
      {/* Logo */}
      <Link
        href="/terminal"
        className="flex items-center gap-2.5 px-5 h-14 shrink-0"
        style={{ borderBottom: `1px solid ${LINE}` }}
      >
        <Logo />
        <span className="text-[14px] font-medium" style={{ color: TEXT_HI }}>
          autotrade
        </span>
        <span
          className="ml-auto font-mono text-[9.5px] uppercase tracking-[0.18em]"
          style={{ color: TEXT_LOW }}
        >
          v0.4
        </span>
      </Link>

      <div className="flex-1 px-3 py-4 overflow-y-auto">
        <Section label="Home" />
        <NavItem
          href="/terminal"
          label="Desk"
          icon={<LayoutGrid size={13} />}
          active={pathname === "/terminal"}
        />

        <Section label="You" />
        <NavItem
          href="/watchlist"
          label="Watchlist"
          icon={<Star size={13} />}
          active={pathname === "/watchlist"}
        />
        <NavItem
          href="/alerts"
          label="Alerts"
          icon={<Bell size={13} />}
          active={pathname === "/alerts"}
        />
        <NavItem
          href="/saved"
          label="Saved"
          icon={<Bookmark size={13} />}
          active={pathname === "/saved"}
        />
        <SavedSearchQuickLinks />
        <NavItem
          href="/chat"
          label="Ask"
          icon={<MessageSquare size={13} />}
          active={pathname === "/chat"}
        />
        <NavItem
          href="/insights"
          label="Insights"
          icon={<Telescope size={13} />}
          active={pathname === "/insights"}
        />
        <NavItem
          href="/calendar"
          label="Calendar"
          icon={<CalendarDays size={13} />}
          active={pathname === "/calendar"}
        />
        <NavItem
          href="/settings"
          label="Settings"
          icon={<SettingsIcon size={13} />}
          active={pathname === "/settings"}
        />

        <Section label="Portfolios" icon={<Users size={11} />} />
        {POLITICIANS.map((p) => (
          <PortfolioNavItem
            key={p.slug}
            href={`/${p.slug}`}
            slug={p.slug}
            label={p.name}
            active={pathname === `/${p.slug}`}
          />
        ))}

        <Section label="Minds" icon={<Sparkles size={11} />} />
        {LLMS.map((p) => (
          <PortfolioNavItem
            key={p.slug}
            href={`/${p.slug}`}
            slug={p.slug}
            label={p.name}
            active={pathname === `/${p.slug}`}
          />
        ))}

        <Section label="Markets" icon={<TrendingUp size={11} />} />
        {MARKETS.map((m) => (
          <NavItem
            key={m.href}
            href={m.href}
            label={m.label}
            active={pathname === m.href}
            trending={m.trending}
          />
        ))}

        <Section label="Tools" icon={<Wrench size={11} />} />
        <NavItem
          href="/compare"
          label="Compare"
          icon={<GitCompareArrows size={13} />}
          active={pathname === "/compare"}
        />
        <NavItem
          href="/backtest"
          label="Backtest"
          icon={<LineChart size={13} />}
          active={pathname === "/backtest"}
        />
        <NavItem
          href="/radar"
          label="Radar"
          icon={<RadarIcon size={13} />}
          active={pathname === "/radar"}
        />

        <Section label="Deep" />
        {DEEP.map((d) => (
          <NavItem key={d.href} href={d.href} label={d.label} active={false} dim />
        ))}
      </div>

      <div
        className="px-5 py-3 shrink-0"
        style={{ borderTop: `1px solid ${LINE}` }}
      >
        <div className="flex items-center gap-2">
          <PulseDot />
          <div
            className="font-mono text-[10px] uppercase tracking-[0.16em]"
            style={{ color: TEXT_LOW }}
          >
            Live · sub-30s · 538 lawmakers
          </div>
        </div>
      </div>
    </aside>
  );
}

/* Last 3 saved searches — shown indented under "You" section. Truncates to a
 *  single line; clicking deep-links into the firehose with filters applied. */
function SavedSearchQuickLinks() {
  const { items, hydrated } = useSavedSearches();
  if (!hydrated) return null;
  const top = items.slice(0, 3);
  if (top.length === 0) return null;
  return (
    <div className="mt-0.5 mb-1.5 space-y-0.5">
      {top.map((s) => {
        const qs = filtersToQueryString(s.filters);
        const href = qs ? `/terminal?${qs}#firehose` : "/terminal#firehose";
        return (
          <Link
            key={s.id}
            href={href}
            className="group flex items-center gap-2 pl-8 pr-3 py-1 rounded-md text-[11.5px] transition-colors hover:bg-white/[0.03]"
            style={{ color: TEXT_LOW }}
            title={summarizeFilters(s.filters)}
          >
            <span
              className="w-1 h-1 rounded-full"
              style={{ background: VIOLET_2 }}
            />
            <span className="truncate group-hover:text-white transition-colors">
              {s.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
}

/* Star toggle on sidebar portfolio rows (client-only). */
function PortfolioNavItem({
  href,
  slug,
  label,
  active,
}: {
  href: string;
  slug: string;
  label: string;
  active: boolean;
}) {
  const { has, toggle, hydrated } = useWatchlist();
  const watched = hydrated && has("portfolio", slug);
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="focus-ring group relative flex items-center pl-4 pr-2 py-1.5 rounded-md text-[13px] transition-colors hover:bg-white/[0.04]"
      style={{
        color: active ? TEXT_HI : TEXT_MID,
        background: active ? "rgba(124,95,255,0.10)" : "transparent",
      }}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r"
          style={{ background: VIOLET }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-[1px] rounded-r origin-center opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: `${VIOLET}AA` }}
        />
      )}
      <span className="flex-1 truncate transition-colors group-hover:text-white">
        {label}
      </span>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggle("portfolio", slug);
        }}
        aria-label={watched ? `Unwatch ${label}` : `Watch ${label}`}
        className={`shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-md transition-opacity ${
          watched ? "opacity-100" : "opacity-0 group-hover:opacity-100"
        }`}
        style={{ color: watched ? VIOLET_2 : TEXT_LOW }}
      >
        <Star size={11} fill={watched ? VIOLET : "transparent"} />
      </button>
    </Link>
  );
}

function Section({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div
      className="px-3 mt-6 mb-2 font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-1.5"
      style={{ color: TEXT_LOW }}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {label}
    </div>
  );
}

function NavItem({
  href,
  label,
  active,
  icon,
  dim = false,
  trending = false,
}: {
  href: string;
  label: string;
  active: boolean;
  icon?: React.ReactNode;
  dim?: boolean;
  trending?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className="focus-ring group relative flex items-center gap-2.5 pl-4 pr-3 py-1.5 rounded-md text-[13px] transition-colors hover:bg-white/[0.04]"
      style={{
        color: active ? TEXT_HI : dim ? TEXT_LOW : TEXT_MID,
        background: active ? "rgba(124,95,255,0.10)" : "transparent",
      }}
    >
      {active ? (
        <span
          aria-hidden
          className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-r"
          style={{ background: VIOLET }}
        />
      ) : (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-[1px] rounded-r opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          style={{ background: `${VIOLET}AA` }}
        />
      )}
      {icon && (
        <span
          className="opacity-70"
          style={{ color: active ? VIOLET_2 : undefined }}
        >
          {icon}
        </span>
      )}
      <span
        className="flex-1 truncate transition-colors group-hover:text-white"
        style={{ color: active ? TEXT_HI : undefined }}
      >
        {label}
      </span>
      {trending && (
        <span
          aria-hidden
          title="trending"
          className="inline-flex w-1.5 h-1.5 rounded-full pulse-dot shrink-0"
          style={{ background: "#F0B429", boxShadow: "0 0 8px rgba(240,180,41,0.6)" }}
        />
      )}
    </Link>
  );
}

function Logo() {
  const reduced = useReducedMotion();
  return (
    <motion.span
      initial={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
      animate={reduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: reduced ? 0.18 : 0.3, ease: [0.22, 1, 0.36, 1] }}
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
    </motion.span>
  );
}

/* ───────────────────────── Top Bar ───────────────────────── */

function TopBar({
  breadcrumb,
  onOpenPalette,
  onOpenDrawer,
}: {
  breadcrumb: string;
  onOpenPalette: () => void;
  onOpenDrawer: () => void;
}) {
  const [ts, setTs] = useState("");
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      const ss = String(d.getSeconds()).padStart(2, "0");
      setTs(`${hh}:${mm}:${ss}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <header
      className="sticky top-0 z-40 h-14 flex items-center px-4 sm:px-6 lg:px-10 backdrop-blur-xl gap-3"
      style={{
        background: "rgba(8,6,15,0.72)",
        borderBottom: `1px solid ${LINE}`,
      }}
    >
      {/* Hamburger (mobile only) */}
      <button
        type="button"
        onClick={onOpenDrawer}
        aria-label="Open navigation menu"
        className="md:hidden inline-flex items-center justify-center w-11 h-11 -ml-2 rounded-md transition-colors hover:bg-white/5 active:bg-white/10 select-none"
        style={{ color: TEXT_HI }}
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2 text-[12.5px] min-w-0 truncate">
        <span className="hidden sm:inline" style={{ color: TEXT_LOW }}>
          Terminal
        </span>
        <span className="hidden sm:inline" style={{ color: TEXT_LOW }}>
          ·
        </span>
        <span
          className="font-medium truncate"
          style={{ color: TEXT_HI }}
        >
          {breadcrumb}
        </span>
      </div>

      <div className="ml-auto flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2">
          <PulseDot />
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: TEXT_MID }}
          >
            LIVE {ts}
          </span>
        </div>
        <MarketStatus />
        <NotificationCenter />
        <button
          onClick={onOpenPalette}
          aria-label="Open search"
          className="hidden md:inline-flex items-center gap-2.5 rounded-full pl-3 pr-2 py-1.5 transition-colors hover:bg-white/[0.06]"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${LINE_2}`,
            color: TEXT_MID,
          }}
        >
          <Search size={13} />
          <span className="text-[12px]">Search</span>
          <span
            className="font-mono text-[10px] px-1.5 py-0.5 rounded"
            style={{ background: "rgba(255,255,255,0.06)", color: TEXT_LOW }}
          >
            ⌘K
          </span>
        </button>
        <UserChip />
      </div>
    </header>
  );
}

function PulseDot() {
  return (
    <span className="relative inline-flex w-2 h-2">
      <span
        className="absolute inset-0 rounded-full animate-ping"
        style={{ background: POSITIVE, opacity: 0.5 }}
      />
      <span
        className="relative inline-flex w-2 h-2 rounded-full"
        style={{ background: POSITIVE }}
      />
    </span>
  );
}

function UserChip() {
  const { user, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  if (!user) {
    return (
      <button
        onClick={() => signIn()}
        className="inline-flex items-center gap-2 rounded-full pl-3 pr-3.5 py-1.5 text-[12.5px] font-medium transition-all hover:brightness-110"
        style={{
          background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
          color: "#fff",
          boxShadow: "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
        }}
      >
        <svg width="14" height="14" viewBox="0 0 48 48" aria-hidden>
          <path fill="#fff" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" opacity="0.95"/>
        </svg>
        Sign in
      </button>
    );
  }

  const email = user.email;
  const initial = email[0]?.toUpperCase() ?? "·";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-full transition-colors"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: `1px solid ${LINE_2}`,
          color: TEXT_HI,
        }}
      >
        <span
          className="inline-flex items-center justify-center w-6 h-6 rounded-full font-mono text-[11px] font-semibold"
          style={{
            background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
            color: "#fff",
          }}
        >
          {initial}
        </span>
        <span
          className="hidden sm:inline font-mono text-[11.5px]"
          style={{ color: TEXT_MID }}
        >
          {email}
        </span>
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          aria-hidden
          style={{ color: TEXT_LOW, transform: open ? "rotate(180deg)" : "none", transition: "transform .15s" }}
        >
          <path d="M2 4 L5 7 L8 4" stroke="currentColor" strokeWidth="1.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 mt-2 w-56 rounded-xl p-2 z-50"
          style={{
            background: BG_2,
            border: `1px solid ${LINE_2}`,
            boxShadow: "0 30px 80px -20px rgba(0,0,0,0.8)",
          }}
        >
          <div className="px-3 py-2">
            <div
              className="font-mono text-[10px] uppercase tracking-[0.16em]"
              style={{ color: TEXT_LOW }}
            >
              Signed in as
            </div>
            <div className="text-[12.5px] truncate" style={{ color: TEXT_HI }}>
              {email}
            </div>
            <div className="mt-1 inline-flex items-center gap-1 font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
              style={{ background: "rgba(124,95,255,0.18)", color: VIOLET_2 }}>
              Pro
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${LINE}` }} className="my-1" />
          <Link
            href="/settings"
            className="block px-3 py-1.5 rounded-md text-[12.5px] hover:bg-white/5 transition-colors"
            style={{ color: TEXT_MID }}
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <Link
            href="/about"
            className="block px-3 py-1.5 rounded-md text-[12.5px] hover:bg-white/5 transition-colors"
            style={{ color: TEXT_MID }}
            onClick={() => setOpen(false)}
          >
            About
          </Link>
          <Link
            href="/#pricing"
            className="block px-3 py-1.5 rounded-md text-[12.5px] hover:bg-white/5 transition-colors"
            style={{ color: TEXT_MID }}
            onClick={() => setOpen(false)}
          >
            Pricing
          </Link>
          <button
            onClick={() => {
              signOut();
              setOpen(false);
            }}
            className="w-full text-left px-3 py-1.5 rounded-md text-[12.5px] hover:bg-white/5 transition-colors"
            style={{ color: TEXT_MID }}
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
