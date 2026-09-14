import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as getBilling, t as changePlan } from "./ops-Dp9zSX-z.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/assinatura-BbrOeFWs.js
var import_jsx_runtime = require_jsx_runtime();
function BillingPage() {
	const q = useQuery({
		queryKey: ["billing"],
		queryFn: () => getBilling()
	});
	const qc = useQueryClient();
	const change = useMutation({
		mutationFn: (planSlug) => changePlan({ data: { planSlug } }),
		onSuccess: async (res) => {
			toast.message(res.note);
			await qc.invalidateQueries({ queryKey: ["billing"] });
		}
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-rust",
		children: "Não foi possível carregar os planos."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Assinatura"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm text-muted",
				children: [
					"Plano atual: ",
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: q.data.subscription?.plan_slug }),
					" · ",
					q.data.subscription?.status
				]
			}),
			!q.data.stripe ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-[var(--radius-md)] border border-line bg-paper px-4 py-3 text-sm",
				children: "Stripe: configuração necessária. Sem chave secreta não há checkout, cobrança nem simulação de pagamento."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: q.data.plans.map((p) => {
					const features = p.features;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl",
								children: p.name
							}), q.data.subscription?.plan_slug === p.slug ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: "forest",
								children: "atual"
							}) : null]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-3xl",
							children: formatBRL(p.price_cents / 100)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: "por mês"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-muted",
							children: p.description
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 space-y-1 text-sm",
							children: features.map((f) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: f }, f))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							className: "mt-4",
							variant: "secondary",
							disabled: change.isPending || q.data.subscription?.plan_slug === p.slug,
							onClick: () => change.mutate(p.slug),
							children: "Selecionar"
						})
					] }, p.slug);
				})
			})
		]
	});
}
//#endregion
export { BillingPage as component };
