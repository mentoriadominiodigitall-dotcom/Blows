import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { r as Skeleton } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { t as Input } from "./input-CM-BkE29.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { t as AppError } from "./errors-nQop9poO.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/funil-B-8iLP5A.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var getPipeline = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("eedd7b9a51e93fb22bc2598d74b0ae462a5711bc1979915948e5ba2b74e8cd4a"));
var moveDeal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.dealId || !input.stageId) throw new AppError("VALIDATION", "Oportunidade inválida.");
	return input;
}).handler(createSsrRpc("22b7e70a406740e05cfd980b07e03ad2e51de77713834e4e5eb80c656984504f"));
var upsertDeal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = input.title?.trim();
	if (!title) throw new AppError("VALIDATION", "Informe o título.");
	return {
		title,
		value: num(input.value),
		stageId: input.stageId,
		notes: input.notes?.trim() || null
	};
}).handler(createSsrRpc("b559070a69a5633d2115f8cad42034e9f4352604e1a22b0d47629b5a3005e2a5"));
function FunilPage() {
	const q = useQuery({
		queryKey: ["pipeline"],
		queryFn: () => getPipeline()
	});
	const qc = useQueryClient();
	const [title, setTitle] = (0, import_react.useState)("");
	const [value, setValue] = (0, import_react.useState)("0");
	const move = useMutation({
		mutationFn: (input) => moveDeal({ data: input }),
		onSuccess: () => qc.invalidateQueries({ queryKey: ["pipeline"] }),
		onError: () => toast.error("Não foi possível mover.")
	});
	const create = useMutation({
		mutationFn: () => upsertDeal({ data: {
			title,
			value: Number(value)
		} }),
		onSuccess: async () => {
			setTitle("");
			await qc.invalidateQueries({ queryKey: ["pipeline"] });
		}
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-rust",
		children: "Funil indisponível."
	});
	if (q.data.deals.length === 0) {}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-end justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Funil"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "flex flex-wrap gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						create.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							placeholder: "Nova oportunidade",
							value: title,
							onChange: (e) => setTitle(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							className: "w-28",
							type: "number",
							value,
							onChange: (e) => setValue(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Adicionar"
						})
					]
				})]
			}),
			q.data.deals.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Funil vazio",
				body: "Crie uma oportunidade para acompanhar conversão entre etapas."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex gap-3 overflow-x-auto pb-4",
				children: q.data.stages.map((stage) => {
					const deals = q.data.deals.filter((d) => d.stage_id === stage.id);
					const conv = q.data.conversion.find((c) => c.stageId === stage.id)?.rate ?? 0;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
						className: "w-64 shrink-0 rounded-[var(--radius-lg)] border border-line bg-paper p-3",
						onDragOver: (e) => e.preventDefault(),
						onDrop: (e) => {
							const dealId = e.dataTransfer.getData("text/deal");
							if (dealId) move.mutate({
								dealId,
								stageId: stage.id
							});
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
							className: "mb-3 flex items-baseline justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-sm font-medium",
								children: stage.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-xs tabular-nums text-muted",
								children: [conv.toFixed(0), "%"]
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "space-y-2",
							children: deals.map((deal) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								draggable: true,
								onDragStart: (e) => e.dataTransfer.setData("text/deal", deal.id),
								className: "cursor-grab rounded-[var(--radius-md)] border border-line bg-canvas p-3 active:cursor-grabbing",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm font-medium",
									children: deal.title
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm tabular-nums text-muted",
									children: formatBRL(num(deal.value))
								})]
							}, deal.id))
						})]
					}, stage.id);
				})
			})
		]
	});
}
//#endregion
export { FunilPage as component };
