// components/Nav.tsx
import Link from "next/link";

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-black/70 border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 lg:px-12 h-14">
        <Link href="/" className="flex items-center gap-2.5 font-medium tracking-tight">
          <Logo />
          <span className="text-[14px] text-zinc-100">Hyzr Trade</span>
        </Link>
        <div className="hidden md:flex items-center gap-7 text-[13px] text-zinc-400">
          <Link href="/" className="hover:text-zinc-100 transition-colors">Portfolios</Link>
          <Link href="/about" className="hover:text-zinc-100 transition-colors">Methodology</Link>
          <Link href="/about#sources" className="hover:text-zinc-100 transition-colors">Sources</Link>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/#portfolios"
            className="inline-flex items-center gap-1.5 rounded-full bg-white text-black px-3.5 py-1.5 text-[12.5px] font-medium hover:bg-zinc-200 transition-colors"
          >
            Browse
          </Link>
        </div>
      </div>
    </nav>
  );
}

function Logo() {
  return (
    <span className="inline-flex w-6 h-6 items-center justify-center rounded-md bg-white/[0.04] border border-white/[0.08]">
      <svg className="w-3.5 h-3.5 text-zinc-200" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M4 18 L12 4 L20 18 M7.5 13.5 L16.5 13.5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}
