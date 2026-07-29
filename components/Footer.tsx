// components/Footer.tsx
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <Section title="Platform" items={[
            { href: "/", label: "Home" },
            { href: "/#portfolios", label: "Portfolios" },
            { href: "/about", label: "Methodology" },
          ]} />
          <Section title="Sources" items={[
            { href: "https://disclosures-clerk.house.gov", label: "House Clerk", external: true },
            { href: "https://efdsearch.senate.gov", label: "Senate eFD", external: true },
            { href: "https://finance.yahoo.com", label: "Yahoo Finance", external: true },
          ]} />
          <Section title="Models" items={[
            { href: "/gpt", label: "GPT Portfolio" },
            { href: "/claude", label: "Claude Portfolio" },
          ]} />
          <Section title="Legal" items={[
            { href: "/about", label: "Disclaimer" },
            { href: "/about#sources", label: "Data sources" },
          ]} />
        </div>

        <div className="mt-12 pt-8 border-t border-white/[0.05] flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex w-5 h-5 items-center justify-center rounded bg-white/[0.04] border border-white/[0.08]">
              <svg className="w-3 h-3 text-zinc-300" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M4 18 L12 4 L20 18 M7.5 13.5 L16.5 13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-[12px] text-zinc-500">autotrade · educational use only</span>
          </div>
          <div className="text-[11px] text-zinc-600 max-w-md text-right">
            Not investment advice. Not affiliated with any politician, agency, or model provider.
          </div>
        </div>
      </div>
    </footer>
  );
}

function Section({ title, items }: { title: string; items: { href: string; label: string; external?: boolean }[] }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.14em] text-zinc-500 font-medium mb-3.5">{title}</div>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i.href}>
            {i.external ? (
              <a href={i.href} target="_blank" rel="noopener noreferrer" className="text-[13px] text-zinc-400 hover:text-zinc-100 transition-colors">
                {i.label}
              </a>
            ) : (
              <Link href={i.href} className="text-[13px] text-zinc-400 hover:text-zinc-100 transition-colors">
                {i.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
