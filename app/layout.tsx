// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { Fraunces, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { SessionProviderWrapper } from "@/components/auth/SessionProviderWrapper";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display-loaded",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});
const sans = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-sans-loaded",
  display: "swap",
});
const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hyzr Trade — The Disclosure",
  description:
    "An editorial record of every US Congressional stock trade, weighed against the consensus of four frontier AI minds. Issue 04 — Jan 22, 2026.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="bg-[color:var(--color-paper)] text-[color:var(--color-ink)] antialiased selection:bg-[color:var(--color-marker)]">
        <SessionProviderWrapper>{children}</SessionProviderWrapper>
      </body>
    </html>
  );
}
