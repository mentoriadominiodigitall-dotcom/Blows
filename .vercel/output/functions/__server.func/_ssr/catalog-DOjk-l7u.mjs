import { r as createServerFn } from "./ssr.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { t as AppError } from "./errors-nQop9poO.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-DOjk-l7u.js
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2f3cb902609e50ac96044f7e96228fa2f59f70d4c357ba5479010af2a225aea2"));
var upsertProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name) throw new AppError("VALIDATION", "Informe o nome.");
	return {
		id: input.id,
		name,
		sku: input.sku?.trim() || null,
		price: num(input.price),
		cost: num(input.cost),
		quantity: num(input.quantity),
		minQuantity: num(input.minQuantity)
	};
}).handler(createSsrRpc("7f62f859e64ed1146e3ffa17ef378eb3cc1b638b8a87edd607491b7b9ac16943"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const qty = num(input.quantity);
	if (qty === 0) throw new AppError("VALIDATION", "Quantidade inválida.");
	return {
		...input,
		quantity: qty,
		reason: input.reason?.trim() || "ajuste"
	};
}).handler(createSsrRpc("fb3284896370af61f4e25ec786c13174fbe72db360339f963c2472ad73693fb9"));
var listQuotes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("9df9ee268f73dc4b250a5f05ed2aeb2c4b9cd73f1a7687db5b294ae077de7e1a"));
createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.items?.length) throw new AppError("VALIDATION", "Adicione itens ao orçamento.");
	return {
		customerId: input.customerId || null,
		discount: num(input.discount),
		items: input.items.map((i) => ({
			description: i.description.trim(),
			quantity: num(i.quantity),
			unitPrice: num(i.unitPrice),
			productId: i.productId || null,
			total: num(i.quantity) * num(i.unitPrice)
		}))
	};
}).handler(createSsrRpc("b902320731d932f97b04377e0b3ec512204bedd2aa1b797c98f33d6f56715aab"));
var updateQuoteStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(createSsrRpc("ca14ee8742c3b333c643df696e887df834eb428d4d069533381437496b2362a7"));
//#endregion
export { upsertProduct as i, listQuotes as n, updateQuoteStatus as r, listProducts as t };
