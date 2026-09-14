import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { t as Money } from "./format-CxzEAOeq.mjs";
import { a as upsertCustomer, r as listCustomers } from "./crm-DR8GAiv0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/clientes-D5DIHS75.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ClientesPage() {
	const [query, setQuery] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const list = useQuery({
		queryKey: ["customers", query],
		queryFn: () => listCustomers({ data: {
			query,
			page: 0
		} })
	});
	const qc = useQueryClient();
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		email: "",
		phone: "",
		consentWhatsapp: true
	});
	const save = useMutation({
		mutationFn: () => upsertCustomer({ data: form }),
		onSuccess: async () => {
			toast.success("Cliente salvo.");
			setOpen(false);
			setForm({
				name: "",
				email: "",
				phone: "",
				consentWhatsapp: true
			});
			await qc.invalidateQueries({ queryKey: ["customers"] });
		},
		onError: () => toast.error("Não foi possível salvar.")
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Clientes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setOpen(true),
					children: "Novo cliente"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
				placeholder: "Buscar nome, e-mail ou telefone",
				value: query,
				onChange: (e) => setQuery(e.target.value)
			}),
			list.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48" }) : null,
			list.data && list.data.rows.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Nenhum cliente",
				body: "Cadastre o primeiro cliente para o CRM e o dinheiro perdido começarem a trabalhar."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[720px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs uppercase text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3",
								children: "Nome"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Contato" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Classe" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Total" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Ticket" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: list.data?.rows.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "px-4 py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
									to: "/app/clientes/$id",
									params: { id: c.id },
									className: "font-medium hover:underline",
									children: c.name
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-muted",
								children: c.phone ?? c.email ?? "—"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: c.classification }) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular-nums",
								children: formatBRL(c.total_spent)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular-nums",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { value: c.avg_ticket })
							})
						]
					}, c.id)) })]
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
							children: "Novo cliente"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Nome" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								required: true,
								value: form.name,
								onChange: (e) => setForm({
									...form,
									name: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "E-mail" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								type: "email",
								value: form.email,
								onChange: (e) => setForm({
									...form,
									email: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Telefone" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								value: form.phone,
								onChange: (e) => setForm({
									...form,
									phone: e.target.value
								})
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "flex items-center gap-2 text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "checkbox",
								checked: form.consentWhatsapp,
								onChange: (e) => setForm({
									...form,
									consentWhatsapp: e.target.checked
								})
							}), "Consentimento WhatsApp"]
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
								disabled: save.isPending,
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
export { ClientesPage as component };
