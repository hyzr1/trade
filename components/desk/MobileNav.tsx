// components/desk/MobileNav.tsx
"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Bookmark,
  CalendarDays,
  GitCompareArrows,
  LayoutGrid,
  LineChart,
  MessageSquare,
  Radar as RadarIcon,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Telescope,
  Users,
  Wrench,
  X,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth-stub";
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

/* ─────────────────── Drawer ─────────────────── */

export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const pathname = usePathname() ?? "/";

  // Close on escape, lock body scroll
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="mobile-drawer-root"
          className="fixed inset-0 z-[100] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <motion.button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Drawer panel */}
          <motion.aside
            initial={{ x: -260 }}
            animate={{ x: 0 }}
            exit={{ x: -260 }}
            transition={{ duration: 0.24, ease: [0.33, 1, 0.68, 1] }}
            className="absolute left-0 top-0 bottom-0 w-[260px] flex flex-col"
            style={{
              background: `linear-gradient(180deg, ${BG_2} 0%, ${BG} 100%)`,
              borderRight: `1px solid ${LINE}`,
              boxShadow: "20px 0 60px -20px rgba(0,0,0,0.8)",
            }}
            role="dialog"
            aria-label="Navigation"
          >
            {/* Header */}
            <div
              className="flex items-center gap-2.5 px-5 h-14 shrink-0"
              style={{ borderBottom: `1px solid ${LINE}` }}
            >
              <Logo />
              <span
                className="text-[14px] font-medium"
                style={{ color: TEXT_HI }}
              >
                autotrade
              </span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors hover:bg-white/5 select-none"
                style={{ color: TEXT_MID }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Nav content (taller tap targets via py-3) */}
            <div className="flex-1 px-3 py-4 overflow-y-auto">
              <Section label="Home" />
              <MobileNavItem
                href="/terminal"
                label="Desk"
                icon={<LayoutGrid size={15} />}
                active={pathname === "/terminal"}
                onNavigate={onClose}
              />

              <Section label="You" />
              <MobileNavItem
                href="/watchlist"
                label="Watchlist"
                icon={<Star size={15} />}
                active={pathname === "/watchlist"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/alerts"
                label="Alerts"
                icon={<Bell size={15} />}
                active={pathname === "/alerts"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/saved"
                label="Saved"
                icon={<Bookmark size={15} />}
                active={pathname === "/saved"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/chat"
                label="Ask"
                icon={<MessageSquare size={15} />}
                active={pathname === "/chat"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/insights"
                label="Insights"
                icon={<Telescope size={15} />}
                active={pathname === "/insights"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/calendar"
                label="Calendar"
                icon={<CalendarDays size={15} />}
                active={pathname === "/calendar"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/settings"
                label="Settings"
                icon={<SettingsIcon size={15} />}
                active={pathname === "/settings"}
                onNavigate={onClose}
              />

              <Section label="Portfolios" icon={<Users size={11} />} />
              {POLITICIANS.map((p) => (
                <MobileNavItem
                  key={p.slug}
                  href={`/${p.slug}`}
                  label={p.name}
                  active={pathname === `/${p.slug}`}
                  onNavigate={onClose}
                />
              ))}

              <Section label="Minds" icon={<Sparkles size={11} />} />
              {LLMS.map((p) => (
                <MobileNavItem
                  key={p.slug}
                  href={`/${p.slug}`}
                  label={p.name}
                  active={pathname === `/${p.slug}`}
                  onNavigate={onClose}
                />
              ))}

              <Section label="Tools" icon={<Wrench size={11} />} />
              <MobileNavItem
                href="/compare"
                label="Compare"
                icon={<GitCompareArrows size={15} />}
                active={pathname === "/compare"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/backtest"
                label="Backtest"
                icon={<LineChart size={15} />}
                active={pathname === "/backtest"}
                onNavigate={onClose}
              />
              <MobileNavItem
                href="/radar"
                label="Radar"
                icon={<RadarIcon size={15} />}
                active={pathname === "/radar"}
                onNavigate={onClose}
              />
            </div>

            {/* Footer */}
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
                  Live · sub-30s
                </div>
              </div>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function MobileNavItem({
  href,
  label,
  active,
  icon,
  onNavigate,
}: {
  href: string;
  label: string;
  active: boolean;
  icon?: React.ReactNode;
  onNavigate: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="group relative flex items-center gap-3 pl-4 pr-3 py-3 rounded-md text-[14px] transition-colors select-none active:scale-[0.99]"
      style={{
        color: active ? TEXT_HI : TEXT_MID,
        background: active ? "rgba(124,95,255,0.10)" : "transparent",
        minHeight: 44,
      }}
    >
      {active && (
        <span
          aria-hidden
          className="absolute left-0 top-2 bottom-2 w-[2px] rounded-r"
          style={{ background: VIOLET }}
        />
      )}
      {icon && (
        <span
          className="opacity-80"
          style={{ color: active ? VIOLET_2 : undefined }}
        >
          {icon}
        </span>
      )}
      <span className="truncate" style={{ color: active ? TEXT_HI : undefined }}>
        {label}
      </span>
    </Link>
  );
}

function Section({ label, icon }: { label: string; icon?: React.ReactNode }) {
  return (
    <div
      className="px-3 mt-5 mb-1.5 font-mono text-[10px] uppercase tracking-[0.18em] flex items-center gap-1.5 select-none"
      style={{ color: TEXT_LOW }}
    >
      {icon && <span className="opacity-70">{icon}</span>}
      {label}
    </div>
  );
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

/* ─────────────────── Bottom Tab Bar ─────────────────── */

type TabKey = "desk" | "watchlist" | "search" | "alerts" | "profile";

export function MobileTabBar({
  onOpenSearch,
}: {
  onOpenSearch: () => void;
}) {
  const pathname = usePathname() ?? "/";
  const router = useRouter();
  const { user } = useAuth();

  const active: TabKey =
    pathname === "/terminal" || pathname === "/"
      ? "desk"
      : pathname === "/watchlist"
        ? "watchlist"
        : pathname === "/alerts"
          ? "alerts"
          : pathname === "/settings"
            ? "profile"
            : "desk";

  const tabs: {
    key: TabKey;
    label: string;
    icon: React.ReactNode;
    onPress: () => void;
  }[] = [
    {
      key: "desk",
      label: "Desk",
      icon: <LayoutGrid size={18} />,
      onPress: () => router.push("/terminal"),
    },
    {
      key: "watchlist",
      label: "Watchlist",
      icon: <Star size={18} />,
      onPress: () => router.push("/watchlist"),
    },
    {
      key: "search",
      label: "Search",
      icon: <Search size={18} />,
      onPress: onOpenSearch,
    },
    {
      key: "alerts",
      label: "Alerts",
      icon: <Bell size={18} />,
      onPress: () => router.push("/alerts"),
    },
    {
      key: "profile",
      label: user ? "Account" : "Sign in",
      icon: <UserIcon size={18} />,
      onPress: () => router.push("/settings"),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-14 z-40 md:hidden flex items-stretch select-none"
      style={{
        background: "rgba(14,11,26,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: `1px solid ${LINE_2}`,
        boxShadow: "0 -8px 24px -12px rgba(0,0,0,0.6)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
      aria-label="Primary"
    >
      {tabs.map((t) => {
        const isActive = active === t.key;
        return (
          <button
            key={t.key}
            type="button"
            onClick={t.onPress}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:bg-white/[0.04]"
            style={{
              color: isActive ? VIOLET_2 : TEXT_MID,
              minHeight: 44,
            }}
            aria-current={isActive ? "page" : undefined}
            aria-label={t.label}
          >
            {t.icon}
            <span
              className="font-mono text-[9.5px] uppercase tracking-[0.14em]"
              style={{ color: isActive ? VIOLET_2 : TEXT_LOW }}
            >
              {t.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
