import { t as env } from "./env.server-wS9zOhV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/stripe-DI3aYGD-.js
function aiConfigured() {
	return Boolean(env("XAI_API_KEY"));
}
/**
* Isolated AI layer. Callers must pass an already-redacted prompt assembled
* from a dedicated data service — this module never receives a SQL handle.
*/
async function completeJsonPrompt(system, user) {
	const apiKey = env("XAI_API_KEY");
	if (!apiKey) return {
		ok: false,
		reason: "not_configured"
	};
	const res = await fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify({
			model: "grok-4.5",
			max_tokens: 700,
			temperature: .3,
			messages: [{
				role: "system",
				content: system
			}, {
				role: "user",
				content: user
			}]
		})
	});
	if (!res.ok) return {
		ok: false,
		reason: "provider_error"
	};
	const text = (await res.json()).choices?.[0]?.message?.content?.trim() ?? "";
	if (!text) return {
		ok: false,
		reason: "empty"
	};
	return {
		ok: true,
		text,
		model: "grok-4.5"
	};
}
/**
* Billing adapter. Never called from the client. Real Stripe only when
* STRIPE_SECRET_KEY is present — otherwise the UI must show configuration needed.
*/
function stripeConfigured() {
	return Boolean(env("STRIPE_SECRET_KEY"));
}
//#endregion
export { completeJsonPrompt as n, stripeConfigured as r, aiConfigured as t };
