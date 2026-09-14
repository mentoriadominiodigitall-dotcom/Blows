import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { l as listCampaigns } from "./ops-Dp9zSX-z.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/campanhas-DdUz1bFK.js
var import_jsx_runtime = require_jsx_runtime();
function CampaignsPage() {
	const q = useQuery({
		queryKey: ["campaigns"],
		queryFn: () => listCampaigns()
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	const rows = q.data?.rows ?? [];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Campanhas"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					asChild: true,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/app/dinheiro-perdido",
						children: "Nova a partir do radar"
					})
				})]
			}),
			!q.data?.whatsapp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-[var(--radius-md)] border border-line bg-paper px-4 py-3 text-sm text-muted",
				children: "WhatsApp Business API: configuração necessária. Campanhas podem ser criadas, mas o envio não é simulado."
			}) : null,
			rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nenhuma campanha",
				body: "Use Recuperar agora no Dinheiro perdido para gerar a primeira."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs uppercase text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left",
								children: "Nome"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Canal"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Recuperado"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app/campanhas/$id",
									params: { id: c.id },
									className: "hover:underline",
									children: c.name
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: c.channel }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: c.status === "needs_config" ? "warn" : "muted",
								children: c.status
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular-nums",
								children: formatBRL(c.recovered_amount)
							})
						]
					}, c.id)) })]
				})
			})
		]
	});
}
//#endregion
export { CampaignsPage as component };
