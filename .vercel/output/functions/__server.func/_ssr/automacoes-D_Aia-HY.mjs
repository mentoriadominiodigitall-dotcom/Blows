import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { n as Card, r as Skeleton } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { c as listAutomations, m as toggleAutomation } from "./ops-Dp9zSX-z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/automacoes-D_Aia-HY.js
var import_jsx_runtime = require_jsx_runtime();
function AutomationsPage() {
	const q = useQuery({
		queryKey: ["automations"],
		queryFn: () => listAutomations()
	});
	const qc = useQueryClient();
	const tog = useMutation({
		mutationFn: (input) => toggleAutomation({ data: input }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] })
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	if (!q.data?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Nenhuma automação",
		body: "Regras ficam desligadas por padrão. Nenhuma ação destrutiva roda sozinha."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Automações"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Ativar apenas marca a regra. Envio de mensagem e alterações financeiras exigem confirmação humana."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-3",
				children: q.data.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: a.name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: a.trigger_key
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							checked: a.enabled,
							onChange: (e) => tog.mutate({
								id: a.id,
								enabled: e.target.checked
							})
						}), a.enabled ? "Ligada" : "Desligada"]
					})]
				}, a.id))
			})
		]
	});
}
//#endregion
export { AutomationsPage as component };
