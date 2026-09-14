import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/format-CxzEAOeq.js
var import_jsx_runtime = require_jsx_runtime();
function Money({ value, className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: `tabular-nums ${className ?? ""}`,
		children: formatBRL(value)
	});
}
//#endregion
export { Money as t };
