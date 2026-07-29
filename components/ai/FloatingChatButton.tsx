// components/ai/FloatingChatButton.tsx
"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X, Maximize2 } from "lucide-react";
import {
  BG,
  BG_2,
  LINE,
  LINE_2,
  TEXT_HI,
  TEXT_LOW,
  TEXT_MID,
  VIOLET,
  VIOLET_2,
} from "@/lib/theme";
import { ChatPanel } from "./ChatPanel";

const HIDDEN_PATHS = new Set<string>(["/chat", "/welcome"]);

export function FloatingChatButton() {
  const pathname = usePathname() ?? "/";
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Don't render on the dedicated /chat page or on /welcome.
  if (HIDDEN_PATHS.has(pathname)) return null;
  // Public landing pages — only show in-app. Pathname check below.
  // Marketing pages start with these prefixes.
  const isPublic =
    pathname === "/" ||
    pathname === "/pricing" ||
    pathname === "/methodology" ||
    pathname === "/faq" ||
    pathname === "/docs" ||
    pathname === "/changelog" ||
    pathname === "/about" ||
    pathname.startsWith("/embed");
  if (isPublic) return null;

  return (
    <>
      {/* FAB */}
      <motion.button
        type="button"
        onClick={() => setOpen(true)}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        aria-label="Open Ask autotrade"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: open ? 0 : 1, opacity: open ? 0 : 1 }}
        transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
        whileTap={{ scale: 0.93 }}
        className="fixed z-[55] inline-flex items-center justify-center rounded-full shadow-xl select-none"
        style={{
          right: "max(1rem, env(safe-area-inset-right))",
          bottom: "calc(max(1rem, env(safe-area-inset-bottom)) + 3.75rem)",
          width: 52,
          height: 52,
          background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
          boxShadow:
            "0 18px 50px -14px rgba(124,95,255,0.65), inset 0 1px 0 rgba(255,255,255,0.30)",
          color: "#fff",
        }}
      >
        <Sparkles size={22} />
        <AnimatePresence>
          {hovered && (
            <motion.span
              initial={{ opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 6 }}
              transition={{ duration: 0.14 }}
              className="absolute right-full mr-3 whitespace-nowrap rounded-md px-2.5 py-1 text-[11.5px] font-medium pointer-events-none hidden md:block"
              style={{
                background: BG_2,
                border: `1px solid ${LINE_2}`,
                color: TEXT_HI,
                boxShadow: "0 10px 30px -10px rgba(0,0,0,0.6)",
              }}
            >
              Ask autotrade
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="fab-drawer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-[80]"
          >
            <button
              type="button"
              aria-label="Close chat"
              onClick={() => setOpen(false)}
              className="absolute inset-0"
              style={{
                background: "rgba(4,2,10,0.55)",
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
              }}
            />
            {/* Mobile: slide-up from bottom. Desktop: slide-in from right. */}
            <motion.div
              initial={{ x: 0, y: "100%" }}
              animate={{ x: 0, y: 0 }}
              exit={{ x: 0, y: "100%" }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden absolute left-0 right-0 bottom-0 flex flex-col rounded-t-2xl overflow-hidden"
              style={{
                top: "10vh",
                background: BG,
                border: `1px solid ${LINE_2}`,
                borderBottom: "none",
                boxShadow: "0 -30px 80px -20px rgba(0,0,0,0.7)",
              }}
              role="dialog"
              aria-label="Ask autotrade"
            >
              <DrawerHeader onClose={() => setOpen(false)} />
              <div className="flex-1 min-h-0 flex flex-col">
                <ChatPanel variant="drawer" hideHeader />
              </div>
            </motion.div>

            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
              className="hidden md:flex absolute right-0 top-0 bottom-0 flex-col"
              style={{
                width: 420,
                background: BG,
                borderLeft: `1px solid ${LINE_2}`,
                boxShadow: "-30px 0 80px -20px rgba(0,0,0,0.7)",
              }}
              role="dialog"
              aria-label="Ask autotrade"
            >
              <DrawerHeader onClose={() => setOpen(false)} />
              <div className="flex-1 min-h-0 flex flex-col">
                <ChatPanel variant="drawer" hideHeader />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerHeader({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex items-center gap-2.5 px-4 h-12 shrink-0"
      style={{ borderBottom: `1px solid ${LINE}` }}
    >
      <span
        className="inline-flex items-center justify-center w-6 h-6 rounded-md"
        style={{
          background: `linear-gradient(135deg, ${VIOLET} 0%, ${VIOLET_2} 100%)`,
          color: "#fff",
        }}
      >
        <Sparkles size={12} />
      </span>
      <span className="text-[13.5px] font-medium" style={{ color: TEXT_HI }}>
        Ask autotrade
      </span>
      <span
        className="font-mono text-[9.5px] uppercase tracking-[0.18em] px-1.5 py-0.5 rounded-sm"
        style={{
          background: "rgba(124,95,255,0.18)",
          color: VIOLET_2,
        }}
      >
        Beta
      </span>
      <div className="ml-auto flex items-center gap-1">
        <Link
          href="/chat"
          onClick={onClose}
          aria-label="Open full chat"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/[0.05]"
          style={{ color: TEXT_MID }}
        >
          <Maximize2 size={13} />
        </Link>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="inline-flex items-center justify-center w-8 h-8 rounded-md transition-colors hover:bg-white/[0.05]"
          style={{ color: TEXT_LOW }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
