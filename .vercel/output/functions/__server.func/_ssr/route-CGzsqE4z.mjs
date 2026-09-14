import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { b as Navigate, f as useRouterState, h as Outlet, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, n as useQuery } from "../_libs/react+tanstack__react-query.mjs";
import { t as cn } from "./utils-Db4STYG5.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { r as Skeleton } from "./card-BZiBSVt0.mjs";
import { a as Menu, c as ChevronRight, i as Sparkles, l as Calendar, n as Users, o as LayoutDashboard, s as CircleDollarSign, t as X, u as Bell } from "../_libs/lucide-react.mjs";
import { n as formatCompact } from "./money-Dh9YlPV6.mjs";
import { r as getLostMoney } from "./lost-money-BN_ew2BT.mjs";
import { t as useSessionContext } from "./use-session-context-DSc0c_-p.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { i as UserButton, t as RedirectToSignIn } from "./gates-Dm5lJ9lE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/route-CGzsqE4z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var NAV = [
	{
		href: "/app",
		label: "Visão geral",
		icon: LayoutDashboard
	},
	{
		href: "/app/dinheiro-perdido",
		label: "Dinheiro perdido",
		icon: CircleDollarSign,
		highlight: true
	},
	{
		href: "/app/clientes",
		label: "Clientes"
	},
	{
		href: "/app/leads",
		label: "Leads"
	},
	{
		href: "/app/funil",
		label: "Funil"
	},
	{
		href: "/app/orcamentos",
		label: "Orçamentos"
	},
	{
		href: "/app/financeiro",
		label: "Financeiro"
	},
	{
		href: "/app/produtos",
		label: "Estoque"
	},
	{
		href: "/app/campanhas",
		label: "Campanhas"
	},
	{
		href: "/app/automacoes",
		label: "Automações"
	},
	{
		href: "/app/agenda",
		label: "Agenda",
		icon: Calendar
	},
	{
		href: "/app/ia",
		label: "IA",
		icon: Sparkles
	},
	{
		href: "/app/equipe",
		label: "Equipe",
		icon: Users
	},
	{
		href: "/app/fidelidade",
		label: "Fidelidade"
	},
	{
		href: "/app/auditoria",
		label: "Auditoria"
	},
	{
		href: "/app/assinatura",
		label: "Assinatura"
	},
	{
		href: "/app/configuracoes",
		label: "Configurações"
	}
];
function AppShell() {
	const { user, isPending } = useCurrentUserState();
	const session = useSessionContext();
	const [open, setOpen] = (0, import_react.useState)(false);
	if (isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-canvas",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden w-64 bg-sidebar md:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex-1 p-8",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "mt-6 h-40 w-full" })]
		})]
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (session.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex min-h-screen bg-canvas",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hidden w-64 bg-sidebar md:block" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "flex-1 p-8",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-8 w-48" })
		})]
	});
	if (session.data && !session.data.hasCompany) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Navigate, { to: "/onboarding" });
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-canvas md:flex",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
				className: cn("fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-fg transition-transform md:static md:translate-x-0", open ? "translate-x-0" : "-translate-x-full md:translate-x-0"),
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex h-full flex-col",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between px-5 py-5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
								to: "/app",
								className: "font-display text-2xl tracking-tight text-sidebar-fg",
								children: "REVIVA"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								className: "md:hidden",
								onClick: () => setOpen(false),
								"aria-label": "Fechar menu",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-5" })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LostRail, {}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
							className: "flex-1 space-y-0.5 overflow-y-auto px-3 pb-6",
							children: NAV.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavItem, {
								href: item.href,
								onClick: () => setOpen(false),
								highlight: item.highlight,
								children: item.label
							}, item.href))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "border-t border-white/10 px-4 py-4 text-xs text-sidebar-muted",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "truncate text-sidebar-fg",
								children: session.data?.tenant?.companyName
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: session.data?.tenant?.roleLabel })]
						})
					]
				})
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				className: "fixed inset-0 z-30 bg-ink/40 md:hidden",
				"aria-label": "Fechar",
				onClick: () => setOpen(false)
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "min-w-0 flex-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
					className: "sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur md:px-8",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							variant: "ghost",
							size: "icon",
							className: "md:hidden",
							onClick: () => setOpen(true),
							"aria-label": "Menu",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Menu, { className: "size-5" })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Breadcrumb, {})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
							to: "/app/notificacoes",
							className: "relative grid size-11 place-items-center rounded-[var(--radius-sm)] hover:bg-ink/5",
							"aria-label": "Notificações",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bell, { className: "size-4" }), (session.data?.unreadNotifications ?? 0) > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: "absolute right-2 top-2 size-2 rounded-full bg-rust" }) : null]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
					className: "px-4 py-6 md:px-8 md:py-8",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})
				})]
			})
		]
	});
}
function NavItem({ href, children, onClick, highlight }) {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
		to: href,
		onClick,
		className: cn("flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm transition-colors", active ? "bg-white/10 text-sidebar-fg" : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-fg", highlight && !active && "text-sidebar-fg"),
		children
	});
}
function LostRail() {
	const q = useQuery({
		queryKey: ["lost-money-rail"],
		queryFn: () => getLostMoney(),
		staleTime: 3e4
	});
	const total = q.data?.total ?? 0;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
		to: "/app/dinheiro-perdido",
		className: "mx-3 mb-4 block rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-3 py-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-[11px] uppercase tracking-[0.14em] text-sidebar-muted",
				children: "Dinheiro perdido"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 font-display text-2xl tabular-nums text-sidebar-fg",
				children: q.isLoading ? "—" : formatCompact(total)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-1 flex items-center gap-1 text-xs text-sidebar-muted",
				children: ["Recuperar agora ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronRight, { className: "size-3" })]
			})
		]
	});
}
function Breadcrumb() {
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const current = NAV.find((n) => n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href));
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "text-sm text-muted",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "REVIVA" }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "mx-2",
				children: "/"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-ink",
				children: current?.label ?? "Painel"
			})
		]
	});
}
var SplitComponent = AppShell;
//#endregion
export { SplitComponent as component };
