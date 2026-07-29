// components/auth/OnboardingGate.tsx — redirects first-time signed-in users to /welcome.
"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-stub";
import { isOnboarded } from "@/lib/onboarding";

const EXEMPT_PREFIXES = ["/welcome", "/api"];

export function OnboardingGate() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.email) return;
    if (EXEMPT_PREFIXES.some((p) => pathname.startsWith(p))) return;
    if (isOnboarded(user.email)) return;
    router.replace("/welcome");
  }, [user?.email, pathname, router]);

  return null;
}
