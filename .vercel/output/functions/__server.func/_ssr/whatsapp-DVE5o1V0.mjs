import { t as env } from "./env.server-wS9zOhV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/whatsapp-DVE5o1V0.js
function whatsappConfigured() {
	return Boolean(env("WHATSAPP_ACCESS_TOKEN") && env("WHATSAPP_PHONE_NUMBER_ID"));
}
/**
* WhatsApp Business API adapter. Does not send unless credentials exist AND
* the recipient has recorded consent. Never silently pretends a message was sent.
*/
async function sendWhatsAppMessage(input) {
	if (!input.consent) return {
		ok: false,
		reason: "no_consent"
	};
	if (!input.to || input.to.replace(/\D/g, "").length < 10) return {
		ok: false,
		reason: "invalid_phone"
	};
	if (!whatsappConfigured()) return {
		ok: false,
		reason: "not_configured"
	};
	return {
		ok: false,
		reason: "not_configured"
	};
}
//#endregion
export { whatsappConfigured as n, sendWhatsAppMessage as t };
