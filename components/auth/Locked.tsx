// components/auth/Locked.tsx
"use client";
import { useState } from "react";
import { useAuth, isPro } from "@/lib/auth-stub";
import { SignInModal } from "./SignInModal";
import { VIOLET_GRAD, VIOLET_GLOW, BG, LINE_2, TEXT_HI, TEXT_MID, YELLOW } from "@/lib/theme";

export function Locked({
  tier = "pro",
  reason,
  children,
}: {
  tier?: "pro";
  reason: string;
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  if (isPro(user)) return <>{children}</>;

  return (
    <div className="relative">
      <div style={{ filter: "blur(8px)", pointerEvents: "none", userSelect: "none" }}>
        {children}
      </div>
      <div
        className="absolute inset-0 flex items-center justify-center"
        style={{
          background: `radial-gradient(ellipse 70% 60% at 50% 50%, rgba(8,6,15,0.92) 0%, rgba(8,6,15,0.75) 60%, transparent 100%)`,
        }}
      >
        <div
          className="rounded-2xl p-6 max-w-sm text-center"
          style={{
            background: `linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)`,
            border: `1px solid ${LINE_2}`,
            boxShadow: `0 30px 60px -20px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.06)`,
          }}
        >
          <div
            className="inline-flex items-center gap-1 px-2 py-0.5 mb-3 font-mono text-[9.5px] uppercase tracking-[0.18em] rounded-sm"
            style={{ background: YELLOW, color: BG }}
          >
            {tier}
          </div>
          <div className="text-[14px] font-medium mb-1" style={{ color: TEXT_HI }}>
            {reason}
          </div>
          <div className="text-[12px] mb-5" style={{ color: TEXT_MID }}>
            Sign in to unlock full access.
          </div>
          <button
            onClick={() => setOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-[13px] font-medium w-full"
            style={{ background: VIOLET_GRAD, color: "#fff", boxShadow: VIOLET_GLOW }}
          >
            Continue with Google →
          </button>
          <a
            href="/#pricing"
            className="block mt-3 text-[11.5px]"
            style={{ color: TEXT_MID }}
          >
            See pricing
          </a>
        </div>
      </div>
      <SignInModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
