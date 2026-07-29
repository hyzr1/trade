// components/auth/SignInModal.tsx
"use client";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-stub";
import { BG_2, LINE_2, TEXT_HI, TEXT_MID, VIOLET_GRAD } from "@/lib/theme";

export function SignInModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn } = useAuth();
  // Esc closes the modal.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;

  const handleStubSignIn = () => {
    signIn();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
      role="presentation"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="signin-modal-title"
        className="w-full max-w-md rounded-2xl p-7"
        style={{
          background: BG_2,
          border: `1px solid ${LINE_2}`,
          boxShadow: "0 60px 140px -30px rgba(0,0,0,0.9)",
        }}
      >
        <div
          id="signin-modal-title"
          className="text-[20px] font-semibold tracking-tight mb-1"
          style={{ color: TEXT_HI }}
        >
          Sign in to autotrade
        </div>
        <div className="text-[13px] mb-6" style={{ color: TEXT_MID }}>
          Free tier. Upgrade later for full depth.
        </div>

        <button
          onClick={handleStubSignIn}
          className="w-full inline-flex items-center justify-center gap-3 rounded-full px-4 py-3 text-[14px] font-medium mb-2"
          style={{ background: "#fff", color: "#0a0a14" }}
        >
          <GoogleG /> Continue with Google
        </button>
        <button
          onClick={handleStubSignIn}
          className="w-full inline-flex items-center justify-center gap-3 rounded-full px-4 py-3 text-[14px] font-medium mb-4"
          style={{ background: "#fff", color: "#0a0a14" }}
        >
           Continue with Apple
        </button>

        <div className="flex items-center gap-3 my-4 text-[11px] uppercase tracking-[0.18em]" style={{ color: TEXT_MID }}>
          <div className="flex-1 h-px" style={{ background: LINE_2 }} />
          or
          <div className="flex-1 h-px" style={{ background: LINE_2 }} />
        </div>

        <input
          type="email"
          placeholder="you@example.com"
          aria-label="Email address"
          className="focus-ring w-full rounded-lg px-3 py-2.5 text-[13.5px] mb-3"
          style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${LINE_2}`, color: TEXT_HI }}
        />
        <button
          onClick={handleStubSignIn}
          className="w-full inline-flex items-center justify-center rounded-full px-4 py-3 text-[14px] font-medium"
          style={{ background: VIOLET_GRAD, color: "#fff" }}
        >
          Continue with email
        </button>

        <div className="mt-5 text-[11px] text-center" style={{ color: TEXT_MID }}>
          By continuing you agree to autotrade&rsquo;s Terms.
        </div>
      </div>
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.6 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3l5.7-5.7C34 6.6 29.3 4.7 24 4.7c-7.7 0-14.4 4.4-17.7 10z"/>
      <path fill="#4CAF50" d="M24 44c5.3 0 10-2 13.6-5.4l-6.3-5.3C29.3 35 26.8 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.6 39.6 16.3 44 24 44z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.3 5.3C40.4 35.7 44 30.3 44 24c0-1.3-.1-2.4-.4-3.5z"/>
    </svg>
  );
}
