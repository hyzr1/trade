// lib/auth-stub.ts — bridges the existing useAuth() API onto real NextAuth.
"use client";
import { useSession, signIn as nextSignIn, signOut as nextSignOut } from "next-auth/react";

export type AuthUser = { email: string; tier: "free" | "pro" } | null;

export function useAuth() {
  const { data: session } = useSession();
  const user: AuthUser = session?.user?.email
    ? {
        email: session.user.email,
        tier: ((session.user as { tier?: "free" | "pro" }).tier) ?? "pro",
      }
    : null;
  return {
    user,
    signIn: () => nextSignIn("google"),
    signOut: () => nextSignOut(),
  };
}

export function isPro(u: AuthUser): boolean {
  return u?.tier === "pro";
}
