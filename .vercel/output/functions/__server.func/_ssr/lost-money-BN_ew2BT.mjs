import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { t as AppError } from "./errors-nQop9poO.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lost-money-BN_ew2BT.js
var getLostMoney = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("6099bf0e08535cb6a675c58cdd8a32256446d022eb3d82a3041b149ce0f89455"));
var createRecoveryCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	const message = input.message?.trim();
	if (!name) throw new AppError("VALIDATION", "Dê um nome à campanha.");
	if (!message) throw new AppError("VALIDATION", "Escreva a mensagem.");
	if (!input.itemIds?.length) throw new AppError("VALIDATION", "Selecione pelo menos um contato.");
	return {
		name,
		category: input.category,
		message,
		channel: input.channel,
		itemIds: input.itemIds.slice(0, 200)
	};
}).handler(createSsrRpc("9d35d7219eec754ee5907ba3e11ed70ad22f323edcef869b2be05a3ea4fcf978"));
var dispatchCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.campaignId) throw new AppError("VALIDATION", "Campanha inválida.");
	return input;
}).handler(createSsrRpc("5f486a4bee283e3882f40e8924a745edea2c814c22fb97a09377bbd2588fc8db"));
//#endregion
export { dispatchCampaign as n, getLostMoney as r, createRecoveryCampaign as t };
