import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { n as Card, r as Skeleton } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { s as listAudit } from "./ops-Dp9zSX-z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/auditoria-D7ccqfA3.js
var import_jsx_runtime = require_jsx_runtime();
function AuditPage() {
	const q = useQuery({
		queryKey: ["audit"],
		queryFn: () => listAudit()
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	if (!q.data?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Sem eventos ainda",
		body: "Criações, alterações financeiras e convites aparecem aqui. Logs não podem ser apagados pelo usuário comum."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Auditoria"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-x-auto p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[720px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs uppercase text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left",
							children: "Quando"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Ação"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Entidade"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Campo"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Antes → Depois"
						})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: q.data.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "px-4 py-3 text-xs text-muted",
							children: new Date(row.created_at).toLocaleString("pt-BR")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.action }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [
							row.entity,
							" ",
							row.entity_id ? `· ${row.entity_id.slice(0, 8)}` : ""
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: row.field ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "text-muted",
							children: [
								row.before_value ?? "—",
								" → ",
								row.after_value ?? "—"
							]
						})
					]
				}, row.id)) })]
			})
		})]
	});
}
//#endregion
export { AuditPage as component };
