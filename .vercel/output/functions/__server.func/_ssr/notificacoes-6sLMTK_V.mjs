import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { a as listNotifications, o as markNotificationsRead } from "./session-Y8nXp4Kx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/notificacoes-6sLMTK_V.js
var import_jsx_runtime = require_jsx_runtime();
function NotificationsPage() {
	const q = useQuery({
		queryKey: ["notifications"],
		queryFn: () => listNotifications()
	});
	const qc = useQueryClient();
	const read = useMutation({
		mutationFn: () => markNotificationsRead(),
		onSuccess: () => {
			qc.invalidateQueries({ queryKey: ["notifications"] });
			qc.invalidateQueries({ queryKey: ["session-context"] });
		}
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	if (!q.data?.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
		title: "Tudo em dia",
		body: "Avisos de leads, estoque, cobranças e recuperação aparecem aqui."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Notificações"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				variant: "secondary",
				onClick: () => read.mutate(),
				children: "Marcar lidas"
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: q.data.map((n) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: n.title
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: n.body
					}),
					n.href ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: n.href,
						className: "mt-2 inline-block text-sm underline-offset-4 hover:underline",
						children: "Abrir"
					}) : null
				]
			}, n.id))
		})]
	});
}
//#endregion
export { NotificationsPage as component };
