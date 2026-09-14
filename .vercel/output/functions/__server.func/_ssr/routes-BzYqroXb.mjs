import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { d as ArrowRight } from "../_libs/lucide-react.mjs";
import { t as useSessionContext } from "./use-session-context-DSc0c_-p.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { i as UserButton, n as SignedIn, r as SignedOut } from "./gates-Dm5lJ9lE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-BzYqroXb.js
var import_jsx_runtime = require_jsx_runtime();
function Home() {
	const { isPending } = useCurrentUserState();
	const appHref = useSessionContext().data?.hasCompany ? "/app" : "/onboarding";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-canvas",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "mx-auto flex max-w-6xl items-center justify-between px-5 py-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-display text-2xl tracking-tight",
				children: "REVIVA"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-3",
				children: [
					isPending ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "h-8 w-8 animate-pulse rounded-full bg-line" }) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedOut, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/login",
						className: "text-sm text-muted hover:text-ink",
						children: "Entrar"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/cadastro",
							children: "Começar"
						})
					})] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SignedIn, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: appHref,
							children: "Abrir painel"
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})] })
				]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
			className: "mx-auto max-w-6xl px-5 pb-24 pt-10 md:pt-16",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.22em] text-muted",
					children: "Receita encontrada"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-4 max-w-3xl font-display text-4xl leading-[1.1] tracking-[-0.03em] md:text-6xl",
					children: "Quanto dinheiro sua empresa está deixando escapar — e o que fazer agora."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-6 max-w-xl text-lg text-muted",
					children: "REVIVA encontra clientes inativos, orçamentos sem resposta, leads parados e cobranças vencidas. Depois monta a recuperação. Sem inventar métrica. Sem disparo fantasma."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-8 flex flex-wrap gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/cadastro",
							children: ["Recuperar agora ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "size-4" })]
						})
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						asChild: true,
						size: "lg",
						variant: "secondary",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
							to: "/login",
							children: "Já tenho conta"
						})
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("section", {
					className: "mt-16 grid gap-4 md:grid-cols-4",
					children: [
						{
							k: "Clientes inativos",
							d: "Quem parou de comprar e quanto isso representa."
						},
						{
							k: "Orçamentos",
							d: "Propostas enviadas que esfriaram no silêncio."
						},
						{
							k: "Leads parados",
							d: "Fila de conversa sem dono e sem próximo passo."
						},
						{
							k: "Cobranças",
							d: "Valores vencidos, prontos para um lembrete correto."
						}
					].map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
						className: "rounded-[var(--radius-lg)] border border-line bg-paper p-5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-xl",
							children: item.k
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 text-sm text-muted",
							children: item.d
						})]
					}, item.k))
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-16 rounded-[var(--radius-xl)] bg-sidebar px-6 py-10 text-sidebar-fg md:px-12",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs uppercase tracking-[0.18em] text-sidebar-muted",
						children: "O ciclo"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-6 grid gap-6 md:grid-cols-4",
						children: [
							"Identificar",
							"Priorizar",
							"Executar",
							"Medir"
						].map((step, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-xs tabular-nums text-sidebar-muted",
							children: ["0", i + 1]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-2 font-display text-2xl",
							children: step
						})] }, step))
					})]
				})
			]
		})]
	});
}
//#endregion
export { Home as component };
