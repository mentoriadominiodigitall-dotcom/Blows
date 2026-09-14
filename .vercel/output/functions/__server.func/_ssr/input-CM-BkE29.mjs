import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-Db4STYG5.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/input-CM-BkE29.js
var import_jsx_runtime = require_jsx_runtime();
function Input({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		className: cn("flex h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30", className),
		...props
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-28 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30", className),
		...props
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-ink", className),
		...props
	});
}
//#endregion
export { Label as n, Textarea as r, Input as t };
