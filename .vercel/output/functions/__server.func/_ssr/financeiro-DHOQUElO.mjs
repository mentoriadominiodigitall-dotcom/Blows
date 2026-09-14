import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { t as AppError } from "./errors-nQop9poO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { t as Money } from "./format-CxzEAOeq.mjs";
import { c as Tooltip, i as XAxis, n as BarChart, o as Bar, r as YAxis, s as ResponsiveContainer } from "../_libs/recharts+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/financeiro-DHOQUElO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getFinanceOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("5f0e243f4422070826ac47962eb8a8b70cf1b73b7dcef278ec7b840effab095d"));
var addTransaction = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const description = input.description?.trim();
	if (!description) throw new AppError("VALIDATION", "Informe a descrição.");
	const amount = num(input.amount);
	if (amount <= 0) throw new AppError("VALIDATION", "Valor inválido.");
	return {
		kind: input.kind,
		amount,
		description,
		occurredAt: input.occurredAt,
		status: input.status ?? "paid",
		categoryId: input.categoryId || null
	};
}).handler(createSsrRpc("dc397eda079a4b30bc0c5d76f58da53864aa941988bd8e0b3a49447d78b23517"));
function FinancePage() {
	const q = useQuery({
		queryKey: ["finance"],
		queryFn: () => getFinanceOverview()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		kind: "income",
		amount: "",
		description: "",
		occurredAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10)
	});
	const qc = useQueryClient();
	const save = useMutation({
		mutationFn: () => addTransaction({ data: {
			kind: form.kind,
			amount: Number(form.amount),
			description: form.description,
			occurredAt: form.occurredAt,
			status: "paid"
		} }),
		onSuccess: async () => {
			toast.success("Lançamento registrado.");
			setOpen(false);
			await qc.invalidateQueries({ queryKey: ["finance"] });
		}
	});
	function exportCsv() {
		if (!q.data) return;
		const lines = ["mes,receita,despesa", ...q.data.series.map((s) => `${s.month},${s.income},${s.expense}`)];
		const blob = new Blob([lines.join("\n")], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "fluxo-caixa.csv";
		a.click();
		URL.revokeObjectURL(url);
	}
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-rust",
		children: "Financeiro indisponível."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Financeiro"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						variant: "secondary",
						onClick: exportCsv,
						children: "Exportar CSV"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						onClick: () => setOpen(true),
						children: "Novo lançamento"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid gap-3 md:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Receita"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { value: q.data.income })
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Despesas"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-display text-2xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { value: q.data.expense })
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "Lucro / margem"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { value: q.data.profit })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-muted",
							children: [q.data.margin.toFixed(1), "%"]
						})
					] })
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Fluxo de caixa"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 h-56",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ResponsiveContainer, {
					width: "100%",
					height: "100%",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(BarChart, {
						data: q.data.series,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(XAxis, {
								dataKey: "month",
								tick: { fontSize: 11 }
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(YAxis, { tick: { fontSize: 11 } }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Tooltip, {}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "income",
								fill: "var(--color-forest)"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bar, {
								dataKey: "expense",
								fill: "var(--color-rust)"
							})
						]
					})
				})
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "Faturas"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: q.data.invoices.map((i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						"#",
						i.number,
						" · ",
						i.description ?? "Fatura"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
							tone: i.status === "overdue" ? "rust" : "muted",
							children: i.status
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "tabular-nums",
							children: formatBRL(i.amount)
						})]
					})]
				}, i.id))
			})] }),
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
							children: "Lançamento"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
							className: "h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3",
							value: form.kind,
							onChange: (e) => setForm({
								...form,
								kind: e.target.value
							}),
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "income",
								children: "Receita"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: "expense",
								children: "Despesa"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Valor" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "number",
							required: true,
							value: form.amount,
							onChange: (e) => setForm({
								...form,
								amount: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Descrição" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.description,
							onChange: (e) => setForm({
								...form,
								description: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Data" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "date",
							value: form.occurredAt,
							onChange: (e) => setForm({
								...form,
								occurredAt: e.target.value
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
export { FinancePage as component };
