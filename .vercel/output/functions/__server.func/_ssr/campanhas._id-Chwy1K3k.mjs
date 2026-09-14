import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { r as Route$1 } from "./router-Qcf6f3NG.mjs";
import { i as getCampaign } from "./ops-Dp9zSX-z.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { n as dispatchCampaign } from "./lost-money-BN_ew2BT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/campanhas._id-Chwy1K3k.js
var import_jsx_runtime = require_jsx_runtime();
function CampaignDetail() {
	const { id } = Route$1.useParams();
	const q = useQuery({
		queryKey: ["campaign", id],
		queryFn: () => getCampaign({ data: { id } })
	});
	const qc = useQueryClient();
	const send = useMutation({
		mutationFn: () => dispatchCampaign({ data: { campaignId: id } }),
		onSuccess: async (res) => {
			if (res.needsConfig) toast.message("Configuração necessária para enviar pelo WhatsApp.");
			else toast.success(`Fila: ${res.queued}. Bloqueados: ${res.blocked}.`);
			await qc.invalidateQueries({ queryKey: ["campaign", id] });
		}
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-48" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-rust",
		children: "Campanha não encontrada nesta empresa."
	});
	const c = q.data.campaign;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: String(c.name)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: String(c.status) }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
					tone: "muted",
					children: String(c.channel)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Mensagem"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 whitespace-pre-wrap text-sm",
				children: String(c.message)
			})] }),
			!q.data.whatsapp ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "rounded-[var(--radius-md)] border border-line bg-paper px-4 py-3 text-sm",
				children: "Configuração necessária: WhatsApp Business API. O botão abaixo registra a tentativa e não finge envio."
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => send.mutate(),
				disabled: send.isPending,
				children: send.isPending ? "Processando…" : "Tentar envio"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "Destinatários"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: q.data.recipients.map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
						r.name,
						" ",
						r.consent ? "" : "· sem consentimento"
					] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "tabular-nums text-muted",
						children: [
							r.status,
							" · ",
							formatBRL(r.estimated_value)
						]
					})]
				}, r.id))
			})] })
		]
	});
}
//#endregion
export { CampaignDetail as component };
