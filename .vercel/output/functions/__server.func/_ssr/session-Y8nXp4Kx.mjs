import { r as createServerFn } from "./ssr.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { t as AppError } from "./errors-nQop9poO.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-Y8nXp4Kx.js
var getSessionContext = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8f03ce50440f4c1f1e189ab610e092cbba4517a8cb146a3b73a90c710b489500"));
var createCompany = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name || name.length < 2) throw new AppError("VALIDATION", "Informe o nome da empresa.");
	const approx = Number(input.approxCustomers) || 0;
	const currency = (input.currency || "BRL").toUpperCase();
	return {
		name,
		segment: (input.segment || "").trim(),
		approxCustomers: approx,
		currency,
		seedDemo: Boolean(input.seedDemo)
	};
}).handler(createSsrRpc("e6bfa02d642029ed533c5b72474ad06f42570409d7b65c2fc0e8682b21038a63"));
var completeOnboarding = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("0bf76cc27c1665833bfcefcf0538dbfc049f4c89d75d5c480d8dfa5bc93894fb"));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("8a7fd8130734c9f5e1d206ce545a5e6af6f4e67c0180fe6e44315a635d4c6bd8"));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("13c232ad2bb2f647b129b0d0c872b1019e082d814f19ba317a9dadb6a825095d"));
var inviteMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const email = input.email?.trim().toLowerCase();
	if (!email || !email.includes("@")) throw new AppError("VALIDATION", "E-mail inválido.");
	return {
		email,
		role: input.role
	};
}).handler(createSsrRpc("40bb63b73406f12cc2649ae55e0733e417ef484b75d51d4ba0e58aa6271d667e"));
//#endregion
export { listNotifications as a, inviteMember as i, createCompany as n, markNotificationsRead as o, getSessionContext as r, completeOnboarding as t };
