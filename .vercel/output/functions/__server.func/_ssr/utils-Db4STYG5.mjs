import { n as clsx } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/utils-Db4STYG5.js
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function slugify(value) {
	return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "").slice(0, 48);
}
function num(value) {
	if (typeof value === "number") return Number.isFinite(value) ? value : 0;
	if (typeof value === "string") {
		const n = Number(value);
		return Number.isFinite(n) ? n : 0;
	}
	return 0;
}
function daysSince(iso) {
	if (!iso) return null;
	const t = new Date(iso).getTime();
	if (Number.isNaN(t)) return null;
	return Math.max(0, Math.floor((Date.now() - t) / 864e5));
}
//#endregion
export { slugify as i, daysSince as n, num as r, cn as t };
