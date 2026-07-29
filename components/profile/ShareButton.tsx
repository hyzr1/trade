// components/profile/ShareButton.tsx
"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Share2,
  Link as LinkIcon,
  Mail,
  X,
  Copy,
  Check,
  Code,
} from "lucide-react";
import {
  BG_2,
  LINE,
  LINE_2,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
} from "@/lib/theme";
import { useToast } from "@/components/ui/Toaster";

export type ShareButtonProps = {
  slug: string;
  title: string;
  /** Optional one-line teaser used in X / email share text. */
  tagline?: string;
  /** Compact mode renders an icon-only button (used in tight headers). */
  compact?: boolean;
};

export function ShareButton({
  slug,
  title,
  tagline,
  compact = false,
}: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [embedOpen, setEmbedOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);
  const { toast } = useToast();

  // Anchor URLs at runtime so we don't have to guess origin at build time.
  const profileUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/${slug}`
      : `/${slug}`;
  const embedSrc =
    typeof window !== "undefined"
      ? `${window.location.origin}/embed/${slug}`
      : `/embed/${slug}`;

  const teaser =
    tagline ??
    `Just saw ${title}'s portfolio on @autotrade — congressional disclosures + AI consensus, sub-30s.`;

  // Close on outside click / Escape.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(profileUrl);
      toast("Link copied", { variant: "success", description: profileUrl });
      setOpen(false);
    } catch {
      toast("Couldn't copy", { variant: "error" });
    }
  };

  const shareX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      teaser,
    )}&url=${encodeURIComponent(profileUrl)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    setOpen(false);
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(`${title} on autotrade`);
    const body = encodeURIComponent(`${teaser}\n\n${profileUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    setOpen(false);
  };

  const openEmbed = () => {
    setOpen(false);
    setEmbedOpen(true);
  };

  return (
    <>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Share this portfolio"
          aria-expanded={open}
          className={
            compact
              ? "inline-flex items-center justify-center w-10 h-10 rounded-full select-none active:scale-[0.99] transition-colors hover:bg-white/[0.06]"
              : "inline-flex items-center justify-center gap-1.5 rounded-full px-5 py-2.5 text-[13px] select-none active:scale-[0.99] transition-colors hover:bg-white/[0.06]"
          }
          style={
            compact
              ? { background: "rgba(255,255,255,0.04)", border: `1px solid ${LINE_2}`, color: TEXT_HI, minHeight: 44 }
              : { background: "rgba(255,255,255,0.05)", border: `1px solid ${LINE_2}`, color: TEXT_HI, minHeight: 44 }
          }
        >
          <Share2 size={compact ? 14 : 14} />
          {!compact && <span>Share</span>}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              key="share-pop"
              initial={{ opacity: 0, y: -6, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.985, transition: { duration: 0.14 } }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="absolute right-0 mt-2 rounded-2xl overflow-hidden z-50 origin-top-right"
              style={{
                width: 240,
                background: BG_2,
                border: `1px solid ${LINE_2}`,
                boxShadow:
                  "0 40px 100px -20px rgba(0,0,0,0.85), 0 10px 24px -8px rgba(0,0,0,0.5)",
              }}
              role="menu"
            >
              <div
                className="px-3 py-2.5 font-mono text-[10px] uppercase tracking-[0.18em]"
                style={{ color: TEXT_LOW, borderBottom: `1px solid ${LINE}` }}
              >
                Share
              </div>
              <ShareItem icon={<LinkIcon size={13} />} label="Copy link" onClick={copyLink} />
              <ShareItem icon={<XIcon size={13} />} label="Share to X" onClick={shareX} />
              <ShareItem icon={<Mail size={13} />} label="Email" onClick={shareEmail} />
              <div
                style={{ borderTop: `1px solid ${LINE}` }}
                className="my-1"
              />
              <ShareItem icon={<Code size={13} />} label="Embed on your site" onClick={openEmbed} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {embedOpen && (
        <EmbedModal
          embedSrc={embedSrc}
          title={title}
          onClose={() => setEmbedOpen(false)}
        />
      )}
    </>
  );
}

function ShareItem({
  icon,
  label,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      role="menuitem"
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2 text-[13px] transition-colors hover:bg-white/[0.04]"
      style={{ color: TEXT_HI }}
    >
      <span
        className="inline-flex items-center justify-center w-7 h-7 rounded-md shrink-0"
        style={{
          background: "rgba(124,95,255,0.10)",
          color: VIOLET_2,
          border: `1px solid rgba(124,95,255,0.25)`,
        }}
      >
        {icon}
      </span>
      <span>{label}</span>
    </button>
  );
}

function XIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.815L4.99 21.75H1.68l7.731-8.835L1.254 2.25H8.08l4.713 6.231 5.451-6.231Zm-1.161 17.52h1.833L7.083 4.126H5.117l11.966 15.644Z" />
    </svg>
  );
}

/* ───────────────────────── Embed modal ───────────────────────── */

type EmbedSize = { w: number; h: number; label: string };
const EMBED_SIZES: EmbedSize[] = [
  { w: 480, h: 320, label: "Compact" },
  { w: 600, h: 400, label: "Standard" },
  { w: 720, h: 480, label: "Wide" },
];

function EmbedModal({
  embedSrc,
  title,
  onClose,
}: {
  embedSrc: string;
  title: string;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(1);
  const size = EMBED_SIZES[sizeIdx];

  const iframe = `<iframe
  src="${embedSrc}"
  width="${size.w}"
  height="${size.h}"
  frameborder="0"
  loading="lazy"
  style="border-radius:12px;background:#08060F;"
  title="${title} on autotrade"
></iframe>`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(iframe);
      setCopied(true);
      toast("Embed code copied", { variant: "success" });
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast("Couldn't copy", { variant: "error" });
    }
  };

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
      style={{ background: "rgba(4,2,10,0.65)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 8 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-2xl rounded-2xl overflow-hidden"
        style={{
          background: BG_2,
          border: `1px solid ${LINE_2}`,
          boxShadow: "0 60px 160px -30px rgba(0,0,0,0.85)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: `1px solid ${LINE}` }}
        >
          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center justify-center w-8 h-8 rounded-md"
              style={{
                background: "rgba(124,95,255,0.18)",
                color: VIOLET_2,
                border: `1px solid rgba(124,95,255,0.30)`,
              }}
            >
              <Code size={14} />
            </span>
            <div>
              <div className="text-[13.5px] font-semibold" style={{ color: TEXT_HI }}>
                Embed {title}
              </div>
              <div className="text-[11.5px]" style={{ color: TEXT_LOW }}>
                Drop this anywhere — newsletter, blog, Notion.
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/5"
            style={{ color: TEXT_LOW }}
          >
            <X size={14} />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4">
          {/* Size selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_LOW }}
            >
              Size
            </span>
            <div className="inline-flex items-center rounded-full p-0.5" style={{ border: `1px solid ${LINE_2}` }}>
              {EMBED_SIZES.map((s, i) => (
                <button
                  key={s.label}
                  onClick={() => setSizeIdx(i)}
                  className="px-3 py-1 text-[11.5px] rounded-full transition-colors"
                  style={{
                    background: i === sizeIdx ? "rgba(124,95,255,0.18)" : "transparent",
                    color: i === sizeIdx ? VIOLET_2 : TEXT_MID,
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <span
              className="ml-auto font-mono text-[10.5px] tabular-nums"
              style={{ color: TEXT_LOW }}
            >
              {size.w} × {size.h}
            </span>
          </div>

          {/* Live preview */}
          <div
            className="rounded-xl p-5 flex items-center justify-center"
            style={{
              background:
                "radial-gradient(circle at 50% 0%, rgba(124,95,255,0.06), transparent 60%), rgba(8,6,15,0.45)",
              border: `1px solid ${LINE_2}`,
              minHeight: 220,
            }}
          >
            <div
              className="rounded-xl overflow-hidden transition-all"
              style={{
                width: Math.min(size.w, 520),
                aspectRatio: `${size.w} / ${size.h}`,
                background: "#08060F",
                border: `1px solid ${LINE_2}`,
                boxShadow: "0 30px 60px -20px rgba(0,0,0,0.7)",
              }}
            >
              <iframe
                src={embedSrc}
                width="100%"
                height="100%"
                title={`Embed preview · ${title}`}
                style={{ border: 0, display: "block", width: "100%", height: "100%" }}
                loading="lazy"
              />
            </div>
          </div>

          {/* Code block */}
          <div
            className="rounded-xl p-4"
            style={{
              background: "rgba(8,6,15,0.6)",
              border: `1px solid ${LINE_2}`,
            }}
          >
            <div
              className="flex items-center justify-between mb-2 font-mono text-[10px] uppercase tracking-[0.18em]"
              style={{ color: TEXT_LOW }}
            >
              <span>HTML</span>
              <span>{iframe.split("\n").length} lines</span>
            </div>
            <pre
              className="text-[11.5px] leading-relaxed font-mono whitespace-pre-wrap break-words"
              style={{ color: TEXT_HI }}
            >
              {iframe}
            </pre>
          </div>

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div className="text-[11.5px]" style={{ color: TEXT_LOW }}>
              Responsive · lazy-loaded · loads autotrade&apos;s embed view
            </div>
            <button
              onClick={copy}
              className="inline-flex items-center gap-2 rounded-full pl-3 pr-4 py-1.5 text-[12.5px] font-medium transition-all hover:brightness-110"
              style={{
                background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
                color: "#fff",
                boxShadow:
                  "0 10px 30px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {copied ? "Copied" : "Copy code"}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
