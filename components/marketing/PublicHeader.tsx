// components/marketing/PublicHeader.tsx
//
// Shared chrome for public marketing pages (/methodology, /faq, /docs,
// /changelog, /pricing, /about, /). Matches the visual language of the
// landing-page Masthead: sticky, blurred dark surface, brand mark on the
// left, mid-weight nav links centered, and a violet CTA + sign-in on the
// right. On mobile, the nav collapses to a hamburger drawer.

"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { signIn } from "next-auth/react";
import { BG, BG_2, LINE, LINE_2, TEXT_HI, TEXT_MID, VIOLET, VIOLET_GRAD } from "@/lib/theme";

const NAV_LINKS = [
  { label: "Methodology", href: "/methodology" },
  { label: "Pricing",     href: "/pricing" },
  { label: "Docs",        href: "/docs" },
  { label: "FAQ",         href: "/faq" },
  { label: "About",       href: "/about" },
] as const;

export function PublicHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className="sticky top-0 z-40 backdrop-blur-xl"
        style={{ background: "rgba(8,6,15,0.72)", borderBottom: `1px solid ${LINE}` }}
      >
        <div className="max-w-[1280px] mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-12 h-14 gap-3">
          <Link href="/" className="flex items-center gap-2.5 font-medium tracking-tight min-w-0">
            <BrandMark />
            <span className="text-[14px] text-white">autotrade</span>
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.18em] text-white/40 border-l border-white/10 pl-2.5 ml-1">
              terminal
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-[13px] text-white/60">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-white transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <button
              type="button"
              onClick={() => signIn("google", { callbackUrl: "/terminal" })}
              className="hidden sm:inline-flex text-[13px] text-white/60 hover:text-white transition-colors select-none"
            >
              Sign in
            </button>
            <Link
              href="/terminal"
              className="inline-flex items-center gap-1.5 rounded-full px-3.5 sm:px-4 py-1.5 text-[12.5px] font-medium tracking-tight transition-all active:scale-[0.99] select-none"
              style={{
                background: VIOLET_GRAD,
                color: "#fff",
                boxShadow: `0 10px 30px -10px ${VIOLET}99, inset 0 1px 0 rgba(255,255,255,0.20)`,
                minHeight: 36,
              }}
            >
              <span className="sm:inline">Open Terminal</span>
              <span aria-hidden>→</span>
            </Link>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={open}
              aria-controls="marketing-drawer"
              className="md:hidden inline-flex items-center justify-center w-11 h-11 -mr-2 rounded-md transition-colors hover:bg-white/5 active:bg-white/10 text-white/80 select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <MarketingDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
}

function MarketingDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
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
          key="marketing-drawer-root"
          className="fixed inset-0 z-[100] md:hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <motion.button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
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
            aria-label="Marketing navigation"
            id="marketing-drawer"
          >
            <div
              className="flex items-center gap-2.5 px-5 h-14 shrink-0"
              style={{ borderBottom: `1px solid ${LINE}` }}
            >
              <BrandMark />
              <span className="text-[14px] font-medium text-white">autotrade</span>
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="ml-auto inline-flex items-center justify-center w-9 h-9 rounded-md transition-colors hover:bg-white/5 select-none"
                style={{ color: TEXT_MID }}
              >
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={onClose}
                  className="flex items-center px-4 py-3 rounded-md text-[14px] transition-colors hover:bg-white/5 select-none active:scale-[0.99]"
                  style={{ color: TEXT_HI, minHeight: 44 }}
                >
                  {l.label}
                </Link>
              ))}
              <div className="my-3" style={{ borderTop: `1px solid ${LINE}` }} />
              <button
                onClick={() => {
                  onClose();
                  signIn("google", { callbackUrl: "/terminal" });
                }}
                className="w-full text-left flex items-center px-4 py-3 rounded-md text-[14px] transition-colors hover:bg-white/5 select-none active:scale-[0.99]"
                style={{ color: TEXT_MID, minHeight: 44 }}
              >
                Sign in with Google
              </button>
              <Link
                href="/terminal"
                onClick={onClose}
                className="mt-2 mx-1 flex items-center justify-center gap-1.5 rounded-full px-4 py-3 text-[13px] font-medium tracking-tight active:scale-[0.99] select-none"
                style={{
                  background: VIOLET_GRAD,
                  color: "#fff",
                  boxShadow: `0 10px 30px -10px ${VIOLET}99, inset 0 1px 0 rgba(255,255,255,0.20)`,
                  minHeight: 44,
                }}
              >
                Open Terminal <span aria-hidden>→</span>
              </Link>
            </nav>
            <div
              className="px-5 py-3 shrink-0 text-[10px] uppercase tracking-[0.18em]"
              style={{ borderTop: `1px solid ${LINE}`, color: "rgba(255,255,255,0.40)" }}
            >
              autotrade · v0.4
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BrandMark() {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-md"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M4 18 L12 4 L20 18 M7.5 13.5 L16.5 13.5"
          stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

// Keep tree-shake happy
void LINE_2;
