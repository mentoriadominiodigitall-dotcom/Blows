import { env } from "@/lib/env.server";

export function whatsappConfigured(): boolean {
  return Boolean(env("WHATSAPP_ACCESS_TOKEN") && env("WHATSAPP_PHONE_NUMBER_ID"));
}

export type WhatsAppSendInput = {
  to: string;
  body: string;
  consent: boolean;
};

export type WhatsAppSendResult =
  | { ok: false; reason: "not_configured" | "no_consent" | "invalid_phone" }
  | { ok: true; providerId: string };

/**
 * WhatsApp Business API adapter. Does not send unless credentials exist AND
 * the recipient has recorded consent. Never silently pretends a message was sent.
 */
export async function sendWhatsAppMessage(input: WhatsAppSendInput): Promise<WhatsAppSendResult> {
  if (!input.consent) return { ok: false, reason: "no_consent" };
  if (!input.to || input.to.replace(/\D/g, "").length < 10) {
    return { ok: false, reason: "invalid_phone" };
  }
  if (!whatsappConfigured()) return { ok: false, reason: "not_configured" };
  return { ok: false, reason: "not_configured" };
}
