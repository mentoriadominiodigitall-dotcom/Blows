import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { u as listLoyalty } from "./ops-Dp9zSX-z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/fidelidade-DZ2BEzGK.js
var import_jsx_runtime = require_jsx_runtime();
function LoyaltyPage() {
	const q = useQuery({
		queryKey: ["loyalty"],
		queryFn: () => listLoyalty()
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	if (!q.data?.accounts.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Sem contas de fidelidade",
		body: "Pontos nascem das compras registradas."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Fidelidade"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: q.data.rewards.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-medium",
					children: r.name
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [r.points_cost, " pontos"]
				})] }, r.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "Ranking"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: q.data.accounts.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: a.customer_name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: a.tier }),
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "tabular-nums",
							children: [a.points, " pts"]
						})
					] })]
				}, a.id))
			})] })
		]
	});
}
//#endregion
export { LoyaltyPage as component };
