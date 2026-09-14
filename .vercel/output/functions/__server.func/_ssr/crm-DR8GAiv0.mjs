import { r as createServerFn } from "./ssr.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { t as AppError } from "./errors-nQop9poO.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crm-DR8GAiv0.js
var listCustomers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	query: input?.query?.trim() ?? "",
	page: Math.max(0, input?.page ?? 0)
})).handler(createSsrRpc("cd12a84573a8d0aa74ef392c1704f0c3759129ee7b78cddf21e44a7264eaa61a"));
var getCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.id) throw new AppError("VALIDATION", "Cliente inválido.");
	return input;
}).handler(createSsrRpc("35971f299bb653279be97085226a50e456da075c8e2eb3ea373fcdc64e2318c8"));
var upsertCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name) throw new AppError("VALIDATION", "Informe o nome.");
	return {
		id: input.id,
		name,
		email: input.email?.trim() || null,
		phone: input.phone?.trim() || null,
		companyName: input.companyName?.trim() || null,
		source: input.source?.trim() || null,
		consentWhatsapp: Boolean(input.consentWhatsapp),
		creditLimit: num(input.creditLimit)
	};
}).handler(createSsrRpc("4211db61e4296230a855ce647cd1aadfbcef8d2b64a8b456cf671bfa42a9bd6f"));
var addCustomerNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input.body?.trim();
	if (!body) throw new AppError("VALIDATION", "Escreva a nota.");
	return {
		customerId: input.customerId,
		body
	};
}).handler(createSsrRpc("7933b8b9c80f1e30123d7d3356c4e700a5d63afc19c7e18c38fc4279bb4701af"));
var listLeads = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("1ccf55995d7ad40b7d1f033935a65960c0b3be08c51eac67437f895ed83cad7c"));
var upsertLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name) throw new AppError("VALIDATION", "Informe o nome do lead.");
	return {
		id: input.id,
		name,
		email: input.email?.trim() || null,
		phone: input.phone?.trim() || null,
		source: input.source?.trim() || null,
		estimatedValue: num(input.estimatedValue)
	};
}).handler(createSsrRpc("643b6d5ab0ef03a4aec393cf615cf15c972c2d7f88318a02de6ab61ee1d0d101"));
//#endregion
export { upsertCustomer as a, listLeads as i, getCustomer as n, upsertLead as o, listCustomers as r, addCustomerNote as t };
