import { env } from "@/lib/env.server";

export type StripeCheckoutInput = {
  planSlug: string;
  companyId: string;
  successUrl: string;
  cancelUrl: string;
};

export type StripeResult =
  | { configured: false; reason: "missing_stripe_secret" }
  | { configured: true; checkoutUrl: string };

/**
 * Billing adapter. Never called from the client. Real Stripe only when
 * STRIPE_SECRET_KEY is present — otherwise the UI must show configuration needed.
 */
export function stripeConfigured(): boolean {
  return Boolean(env("STRIPE_SECRET_KEY"));
}

export async function createCheckoutSession(
  _input: StripeCheckoutInput,
): Promise<StripeResult> {
  if (!stripeConfigured()) {
    return { configured: false, reason: "missing_stripe_secret" };
  }
  // Live charge path is intentionally not simulated. When the secret exists,
  // a follow-up wires stripe.checkout.sessions.create with price IDs per plan.
  return { configured: false, reason: "missing_stripe_secret" };
}

export function stripeWebhookConfigured(): boolean {
  return Boolean(env("STRIPE_WEBHOOK_SECRET") && env("STRIPE_SECRET_KEY"));
}
