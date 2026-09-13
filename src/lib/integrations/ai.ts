import { env } from "@/lib/env.server";

export function aiConfigured(): boolean {
  return Boolean(env("XAI_API_KEY"));
}

export type AiSuccess = { ok: true; text: string; model: string };
export type AiFailure = { ok: false; reason: "not_configured" | "provider_error" | "empty" };
export type AiResult = AiSuccess | AiFailure;

/**
 * Isolated AI layer. Callers must pass an already-redacted prompt assembled
 * from a dedicated data service — this module never receives a SQL handle.
 */
export async function completeJsonPrompt(system: string, user: string): Promise<AiResult> {
  const apiKey = env("XAI_API_KEY");
  if (!apiKey) return { ok: false, reason: "not_configured" };

  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      max_tokens: 700,
      temperature: 0.3,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) return { ok: false, reason: "provider_error" };
  const body = (await res.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const text = body.choices?.[0]?.message?.content?.trim() ?? "";
  if (!text) return { ok: false, reason: "empty" };
  return { ok: true, text, model: "grok-4.5" };
}
