// app/global-error.tsx — top-level error boundary (no app providers / fonts).
"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          background: "#08060F",
          color: "rgba(255,255,255,0.95)",
          fontFamily:
            'ui-sans-serif, system-ui, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif',
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
        }}
      >
        <div style={{ maxWidth: 520, width: "100%", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: "rgba(248,113,113,0.10)",
              border: "1px solid rgba(248,113,113,0.30)",
              color: "#F87171",
              marginBottom: 18,
            }}
            aria-hidden
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div
            style={{
              fontFamily: "ui-monospace, monospace",
              fontSize: 11,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.45)",
            }}
          >
            Critical error
          </div>
          <h1
            style={{
              marginTop: 12,
              fontSize: 36,
              lineHeight: 1.05,
              fontWeight: 400,
              fontFamily: '"Fraunces", Georgia, serif',
            }}
          >
            The desk is offline.
          </h1>
          <p
            style={{
              marginTop: 12,
              fontSize: 14,
              color: "rgba(255,255,255,0.65)",
            }}
          >
            Something failed at the root of the app. Refreshing usually fixes
            it; if not, try again in a minute.
          </p>
          {error?.digest && (
            <div
              style={{
                marginTop: 18,
                display: "inline-block",
                fontFamily: "ui-monospace, monospace",
                fontSize: 11,
                padding: "4px 10px",
                borderRadius: 6,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "rgba(255,255,255,0.45)",
              }}
            >
              ref · {error.digest}
            </div>
          )}
          <div style={{ marginTop: 26, display: "flex", justifyContent: "center", gap: 10 }}>
            <button
              onClick={() => reset()}
              style={{
                appearance: "none",
                cursor: "pointer",
                padding: "10px 18px",
                fontSize: 13,
                fontWeight: 500,
                color: "#fff",
                borderRadius: 999,
                border: "1px solid transparent",
                background:
                  "linear-gradient(135deg, #7C5FFF 0%, #4F39D8 100%)",
                boxShadow:
                  "0 14px 36px -10px rgba(124,95,255,0.55), inset 0 1px 0 rgba(255,255,255,0.20)",
              }}
            >
              Refresh
            </button>
            <a
              href="/terminal"
              style={{
                appearance: "none",
                padding: "10px 18px",
                fontSize: 13,
                color: "rgba(255,255,255,0.95)",
                textDecoration: "none",
                borderRadius: 999,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid rgba(255,255,255,0.10)",
              }}
            >
              Go home
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
