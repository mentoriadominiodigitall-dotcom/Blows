import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { r as Textarea } from "./input-CM-BkE29.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { t as Money } from "./format-CxzEAOeq.mjs";
import { r as getLostMoney, t as createRecoveryCampaign } from "./lost-money-BN_ew2BT.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dinheiro-perdido-CXA3Ez9Z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var STRATEGIES = {
	inactive: [{
		name: "Retorno cordial",
		message: "Olá {{nome}}, aqui é da {{empresa}}. Faz um tempo que você não aparece — separamos uma condição de retorno. Posso te contar em 2 minutos?"
	}, {
		name: "Oferta objetiva",
		message: "Olá {{nome}}, preparamos uma condição especial para você voltar este mês. Quer que eu envie os detalhes?"
	}],
	quotes: [{
		name: "Cobrar proposta",
		message: "Olá {{nome}}, o orçamento ainda está válido. Posso tirar alguma dúvida para avançarmos?"
	}],
	leads: [{
		name: "Retomar conversa",
		message: "Olá {{nome}}, retomando nossa conversa. Ainda faz sentido seguirmos com aquilo que você pediu?"
	}],
	overdue: [{
		name: "Lembrete de vencimento",
		message: "Olá {{nome}}, identificamos um valor em aberto. Se já pagou, desconsidere. Se não, posso te enviar o pix agora."
	}],
	repurchase: [{
		name: "Lembrete de reposição",
		message: "Olá {{nome}}, no seu ritmo usual já estaria na hora de repor. Quer que eu reserve o mesmo de sempre?"
	}]
};
function LostMoneyPage() {
	const q = useQuery({
		queryKey: ["lost-money"],
		queryFn: () => getLostMoney()
	});
	const [active, setActive] = (0, import_react.useState)("inactive");
	const [selected, setSelected] = (0, import_react.useState)({});
	const [strategy, setStrategy] = (0, import_react.useState)(0);
	const [message, setMessage] = (0, import_react.useState)("");
	const [open, setOpen] = (0, import_react.useState)(false);
	const navigate = useNavigate();
	const qc = useQueryClient();
	const category = q.data?.categories.find((c) => c.key === active);
	const items = category?.items ?? [];
	const selectedItems = items.filter((i) => selected[i.id]);
	const mutate = useMutation({
		mutationFn: async () => {
			const tpl = STRATEGIES[active][strategy] ?? STRATEGIES[active][0];
			return createRecoveryCampaign({ data: {
				name: `Recuperação · ${category?.label ?? active}`,
				category: active,
				channel: "whatsapp",
				message: message || tpl.message,
				itemIds: selectedItems.map((i) => i.id)
			} });
		},
		onSuccess: async (res) => {
			await qc.invalidateQueries({ queryKey: ["campaigns"] });
			if (res.needsConfig) toast.message("Campanha criada. Envio WhatsApp exige configuração.");
			else toast.success("Campanha criada.");
			navigate({
				to: "/app/campanhas/$id",
				params: { id: res.campaignId }
			});
		},
		onError: () => toast.error("Não foi possível criar a campanha.")
	});
	const total = q.data?.total ?? 0;
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full" });
	if (q.error) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-rust",
		children: "Falha ao calcular oportunidades."
	});
	if (!q.data || q.data.total === 0 && q.data.categories.every((c) => c.count === 0)) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Nada parado no momento",
		body: "Quando houver clientes inativos, orçamentos sem resposta, leads parados ou cobranças vencidas, o valor aparece aqui — calculado a partir dos seus dados, não de um número inventado."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "rounded-[var(--radius-xl)] border border-line bg-paper px-6 py-8 md:px-10",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.18em] text-rust",
						children: "Dinheiro perdido"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 font-display text-5xl md:text-7xl",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { value: total })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 max-w-xl text-sm text-muted",
						children: "Estimativa com base no ticket médio, valor de orçamentos, leads e faturas em atraso. Atualizado agora."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						className: "mt-6",
						variant: "rust",
						onClick: () => setOpen(true),
						children: "Recuperar agora"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2 xl:grid-cols-5",
				children: q.data.categories.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setActive(c.key);
						setSelected({});
						setStrategy(0);
					},
					className: `rounded-[var(--radius-lg)] border p-4 text-left ${active === c.key ? "border-ink bg-paper" : "border-line bg-paper/60"}`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted",
							children: c.label
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Money, { value: c.amount })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-xs text-muted",
							children: [c.count, " oportunidades"]
						})
					]
				}, c.key))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-wrap items-center justify-between gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-2xl",
					children: category?.label
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: category?.description
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					size: "sm",
					onClick: () => toggleAll(items, selected, setSelected),
					children: "Selecionar visíveis"
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4 overflow-x-auto",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
					className: "w-full min-w-[640px] text-left text-sm",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
						className: "text-xs uppercase tracking-wide text-muted",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { className: "py-2" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Quem" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Valor" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Prioridade" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", { children: "Próxima ação" })
						] })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
						className: "border-t border-line",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "py-3",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									type: "checkbox",
									checked: Boolean(selected[item.id]),
									onChange: () => setSelected((s) => ({
										...s,
										[item.id]: !s[item.id]
									})),
									"aria-label": `Selecionar ${item.name}`
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "font-medium",
								children: item.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted",
								children: item.subtitle
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "tabular-nums",
								children: formatBRL(item.amount)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
								tone: item.priority === "high" ? "rust" : item.priority === "medium" ? "warn" : "muted",
								children: item.priority === "high" ? "Alta" : item.priority === "medium" ? "Média" : "Baixa"
							}) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								className: "text-muted",
								children: item.recommendedAction
							})
						]
					}, item.id)) })]
				})
			})] }),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 md:place-items-center md:p-6",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "max-h-[92vh] w-full overflow-y-auto rounded-t-[var(--radius-xl)] bg-paper p-6 md:max-w-xl md:rounded-[var(--radius-xl)]",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Recuperar agora"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "mt-1 text-sm text-muted",
							children: [
								selectedItems.length,
								" contato(s) · ",
								formatBRL(selectedItems.reduce((s, i) => s + i.amount, 0))
							]
						}),
						selectedItems.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-4 text-sm text-rust",
							children: "Selecione ao menos um item na lista."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-medium",
								children: "Estratégia"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "mt-2 grid gap-2",
								children: STRATEGIES[active].map((s, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => {
										setStrategy(i);
										setMessage(s.message);
									},
									className: `rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm ${strategy === i ? "border-forest" : "border-line"}`,
									children: s.name
								}, s.name))
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-4 text-sm font-medium",
								children: "Mensagem"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
								className: "mt-2",
								value: message || STRATEGIES[active][strategy].message,
								onChange: (e) => setMessage(e.target.value)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-2 text-xs text-muted",
								children: "O envio só acontece com WhatsApp Business configurado e consentimento do contato. Sem isso, a campanha fica salva como rascunho."
							})
						] }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-6 flex gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "secondary",
								onClick: () => setOpen(false),
								children: "Cancelar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								variant: "rust",
								disabled: selectedItems.length === 0 || mutate.isPending,
								onClick: () => mutate.mutate(),
								children: mutate.isPending ? "Criando…" : "Criar campanha"
							})]
						})
					]
				})
			}) : null
		]
	});
}
function toggleAll(items, selected, setSelected) {
	const all = items.every((i) => selected[i.id]);
	const next = {};
	if (!all) for (const i of items) next[i.id] = true;
	setSelected(next);
}
//#endregion
export { LostMoneyPage as component };
