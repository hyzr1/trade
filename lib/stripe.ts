// lib/stripe.ts
//
// Placeholder. When Stripe wires in:
//   - npm install stripe
//   - Add STRIPE_SECRET_KEY + STRIPE_WEBHOOK_SECRET to .env.local
//   - Replace the throws below with the real client
//   - Wire app/api/stripe/webhook/route.ts to update user.tier from subscription events.

export const STRIPE_PRICE_IDS = {
  pro: "price_TODO_pro_monthly",
  institutional: "price_TODO_institutional_seat",
} as const;

export type Tier = "free" | "pro" | "institutional";

export async function createCheckoutSession(_args: { tier: Exclude<Tier, "free">; userEmail: string }) {
  throw new Error("Stripe not configured yet. See lib/stripe.ts.");
}

export async function getSubscriptionStatus(_userEmail: string): Promise<{ active: boolean; tier: Tier }> {
  // Once Stripe lands, query the user's subscription record here.
  return { active: false, tier: "free" };
}
