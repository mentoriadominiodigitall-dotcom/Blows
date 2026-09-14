import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { i as listLeads, o as upsertLead } from "./crm-DR8GAiv0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/leads-CCr3M1lN.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function LeadsPage() {
	const q = useQuery({
		queryKey: ["leads"],
		queryFn: () => listLeads()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		email: "",
		phone: "",
		source: "WhatsApp",
		estimatedValue: 0
	});
	const qc = useQueryClient();
	const save = useMutation({
		mutationFn: () => upsertLead({ data: form }),
		onSuccess: async () => {
			toast.success("Lead salvo.");
			setOpen(false);
			await qc.invalidateQueries({ queryKey: ["leads"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Leads"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setOpen(true),
					children: "Novo lead"
				})]
			}),
			q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }) : null,
			q.data && q.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nenhum lead",
				body: "Capture oportunidades para o funil e para o radar de dinheiro perdido."
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
								children: "Origem"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Status"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Valor"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: q.data?.map((l) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: l.name
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: l.source ?? "—" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: l.status }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular-nums",
								children: formatBRL(l.estimated_value)
							})
						]
					}, l.id)) })]
				})
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "w-full max-w-md space-y-3 rounded-[var(--radius-xl)] bg-paper p-6",
					onSubmit: (e) => {
						e.preventDefault();
						save.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Novo lead"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.name,
							onChange: (e) => setForm({
								...form,
								name: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Valor estimado" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: form.estimatedValue,
							onChange: (e) => setForm({
								...form,
								estimatedValue: Number(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setOpen(false),
								children: "Cancelar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Salvar"
							})]
						})
					]
				})
			}) : null
		]
	});
}
//#endregion
export { LeadsPage as component };
