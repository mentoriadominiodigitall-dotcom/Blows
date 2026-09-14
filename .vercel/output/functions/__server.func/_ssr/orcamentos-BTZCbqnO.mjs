import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { n as listQuotes, r as updateQuoteStatus } from "./catalog-DOjk-l7u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/orcamentos-BTZCbqnO.js
var import_jsx_runtime = require_jsx_runtime();
var NEXT = {
	draft: "sent",
	sent: "viewed",
	viewed: "accepted"
};
function QuotesPage() {
	const q = useQuery({
		queryKey: ["quotes"],
		queryFn: () => listQuotes()
	});
	const qc = useQueryClient();
	const upd = useMutation({
		mutationFn: (input) => updateQuoteStatus({ data: input }),
		onSuccess: () => {
			toast.success("Status atualizado.");
			qc.invalidateQueries({ queryKey: ["quotes"] });
		}
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48" });
	if (!q.data?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Nenhum orçamento",
		body: "Crie propostas para medir abandono no Dinheiro perdido."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
			className: "font-display text-4xl",
			children: "Orçamentos"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
			className: "overflow-x-auto p-0",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
				className: "w-full min-w-[700px] text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
					className: "text-xs uppercase text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "px-4 py-3 text-left",
							children: "Nº"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Cliente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Status"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
							className: "text-left",
							children: "Total"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {})
					] })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: q.data.map((quote) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
					className: "border-t border-line",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
							className: "px-4 py-3 tabular-nums",
							children: ["#", quote.number]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: quote.customer_name ?? "—" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: quote.status === "expired" || quote.status === "rejected" ? "rust" : "muted",
							children: quote.status
						}) }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
							className: "tabular-nums",
							children: formatBRL(quote.total)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: NEXT[quote.status] ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
							size: "sm",
							variant: "secondary",
							onClick: () => upd.mutate({
								id: quote.id,
								status: NEXT[quote.status]
							}),
							children: ["Marcar ", NEXT[quote.status]]
						}) : null })
					]
				}, quote.id)) })]
			})
		})]
	});
}
//#endregion
export { QuotesPage as component };
