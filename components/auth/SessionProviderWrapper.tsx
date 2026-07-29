// components/auth/SessionProviderWrapper.tsx
"use client";
import { SessionProvider } from "next-auth/react";
import { Toaster } from "@/components/ui/Toaster";

export function SessionProviderWrapper({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Toaster>{children}</Toaster>
    </SessionProvider>
  );
}
