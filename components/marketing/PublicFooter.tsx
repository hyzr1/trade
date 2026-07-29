// components/marketing/PublicFooter.tsx
//
// Shared footer (Colophon) for every public page. Mirrors the landing-page
// columnar layout but routes each link to a real destination now that
// /methodology, /faq, /docs, /changelog, /pricing, /about exist.

import Link from "next/link";
import { LINE, BG } from "@/lib/theme";

const COLUMNS: { t: string; l: { label: string; href: string; external?: boolean }[] }[] = [
  {
    t: "Product",
    l: [
      { label: "Desk",       href: "/terminal" },
      { label: "Backtester", href: "/backtest" },
      { label: "Compare",    href: "/compare" },
      { label: "Insider radar", href: "/radar" },
    ],
  },
  {
    t: "The Paper",
    l: [
      { label: "Daily digest", href: "/digest" },
      { label: "Methodology",  href: "/methodology" },
      { label: "House Clerk",  href: "https://disclosures-clerk.house.gov", external: true },
      { label: "Senate eFD",   href: "https://efdsearch.senate.gov", external: true },
      { label: "Changelog",    href: "/changelog" },
    ],
  },
  {
    t: "Plans",
    l: [
      { label: "Reader",        href: "/pricing" },
      { label: "Professional",  href: "/pricing" },
      { label: "Institutional", href: "/pricing" },
      { label: "Compare tiers", href: "/pricing#compare" },
    ],
  },
  {
    t: "Company",
    l: [
      { label: "About",   href: "/about" },
      { label: "Docs",    href: "/docs" },
      { label: "FAQ",     href: "/faq" },
      { label: "Press",   href: "/about#press" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer style={{ borderTop: `1px solid ${LINE}`, background: BG }}>
      <div className="max-w-[1280px] mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-y-8 gap-x-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2.5">
              <BrandMark />
              <span className="text-[16px] font-medium tracking-tight text-white">autotrade</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/40 border-l border-white/10 pl-2.5 ml-1">
                terminal
              </span>
            </div>
            <p className="mt-4 text-[12.5px] max-w-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.55)" }}>
              The real-time desk for US Congressional disclosures, weighed against four frontier AI minds.
            </p>
          </div>

          {COLUMNS.map((g) => (
            <div key={g.t}>
              <div className="text-[10px] uppercase tracking-[0.18em]" style={{ color: "rgba(255,255,255,0.40)" }}>
                {g.t}
              </div>
              <ul className="mt-4 space-y-2.5 text-[13px]" style={{ color: "rgba(255,255,255,0.80)" }}>
                {g.l.map((i) => (
                  <li key={`${g.t}-${i.label}`}>
                    {i.external ? (
                      <a href={i.href} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                        {i.label}
                      </a>
                    ) : (
                      <Link href={i.href} className="hover:text-white transition-colors">
                        {i.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="mt-12 pt-6 flex flex-wrap items-center justify-between gap-y-3 text-[11px]"
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.45)" }}
        >
          <span>© 2026 autotrade. Not investment advice.</span>
          <div className="flex items-center gap-4 font-mono">
            <Link href="/about#terms" className="hover:text-white">Terms</Link>
            <Link href="/about#privacy" className="hover:text-white">Privacy</Link>
            <Link href="/methodology#limits" className="hover:text-white">Disclaimer</Link>
          </div>
        </div>
      </div>
    </footer>
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
