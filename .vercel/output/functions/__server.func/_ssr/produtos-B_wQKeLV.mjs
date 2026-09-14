import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { i as upsertProduct, t as listProducts } from "./catalog-DOjk-l7u.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/produtos-B_wQKeLV.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function ProductsPage() {
	const q = useQuery({
		queryKey: ["products"],
		queryFn: () => listProducts()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		name: "",
		sku: "",
		price: 0,
		cost: 0,
		quantity: 0,
		minQuantity: 0
	});
	const qc = useQueryClient();
	const save = useMutation({
		mutationFn: () => upsertProduct({ data: form }),
		onSuccess: async () => {
			toast.success("Produto salvo.");
			setOpen(false);
			await qc.invalidateQueries({ queryKey: ["products"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Estoque"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setOpen(true),
					children: "Novo item"
				})]
			}),
			q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }) : null,
			q.data && q.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Sem produtos",
				body: "Cadastre serviços ou produtos com preço, custo e estoque mínimo."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, {
				className: "overflow-x-auto p-0",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[720px] text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs uppercase text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "px-4 py-3 text-left",
								children: "Item"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "SKU"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Preço"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Custo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Margem"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
								className: "text-left",
								children: "Qtd"
							})
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: q.data?.map((p) => {
						const margin = num(p.price) === 0 ? 0 : (num(p.price) - num(p.cost)) / num(p.price) * 100;
						const low = num(p.quantity) <= num(p.min_quantity);
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
							className: "border-t border-line",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "px-4 py-3",
									children: p.name
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "text-muted",
									children: p.sku ?? "—"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "tabular-nums",
									children: formatBRL(p.price)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
									className: "tabular-nums",
									children: formatBRL(p.cost)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
									className: "tabular-nums",
									children: [margin.toFixed(0), "%"]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: low ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
									tone: "rust",
									children: ["baixo · ", p.quantity]
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "tabular-nums",
									children: p.quantity
								}) })
							]
						}, p.id);
					}) })]
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
							children: "Produto"
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
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "SKU" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: form.sku,
							onChange: (e) => setForm({
								...form,
								sku: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Preço" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: form.price,
							onChange: (e) => setForm({
								...form,
								price: Number(e.target.value)
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Custo" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							value: form.cost,
							onChange: (e) => setForm({
								...form,
								cost: Number(e.target.value)
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
export { ProductsPage as component };
