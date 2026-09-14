import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-Db4STYG5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/card-BZiBSVt0.js
var import_jsx_runtime = require_jsx_runtime();
function Card({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("rounded-[var(--radius-lg)] border border-line bg-paper p-5 shadow-[0_1px_0_rgba(26,24,20,0.04)]", className),
		...props
	});
}
function Badge({ className, tone = "muted", ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", {
			muted: "bg-canvas text-muted",
			forest: "bg-forest/10 text-forest",
			rust: "bg-rust/10 text-rust",
			ok: "bg-ok/10 text-ok",
			warn: "bg-warn/10 text-warn"
		}[tone], className),
		...props
	});
}
function Skeleton({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("animate-pulse rounded-md bg-line/80", className),
		...props
	});
}
//#endregion
export { Card as n, Skeleton as r, Badge as t };
