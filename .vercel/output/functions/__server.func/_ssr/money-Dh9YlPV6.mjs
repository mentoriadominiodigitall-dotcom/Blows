import { r as num } from "./utils-Db4STYG5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/money-Dh9YlPV6.js
function formatBRL(value) {
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL"
	}).format(num(value));
}
function formatCompact(value) {
	const n = num(value);
	return new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
		maximumFractionDigits: 0
	}).format(n);
}
//#endregion
export { formatCompact as n, formatBRL as t };
