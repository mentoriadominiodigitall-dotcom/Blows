import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { a as getTeam } from "./ops-Dp9zSX-z.mjs";
import { t as formatBRL } from "./money-Dh9YlPV6.mjs";
import { n as ROLE_SLUGS, t as ROLE_LABELS } from "./permissions-6R54wWQh.mjs";
import { i as inviteMember } from "./session-Y8nXp4Kx.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/equipe-DPOtbTti.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function TeamPage() {
	const q = useQuery({
		queryKey: ["team"],
		queryFn: () => getTeam()
	});
	const [email, setEmail] = (0, import_react.useState)("");
	const [role, setRole] = (0, import_react.useState)("seller");
	const qc = useQueryClient();
	const invite = useMutation({
		mutationFn: () => inviteMember({ data: {
			email,
			role
		} }),
		onSuccess: async (res) => {
			toast.success(`Convite gerado. Token interno: ${res.token.slice(0, 8)}…`);
			setEmail("");
			await qc.invalidateQueries({ queryKey: ["team"] });
		},
		onError: () => toast.error("Não foi possível convidar.")
	});
	if (q.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" });
	if (!q.data) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-rust",
		children: "Sem permissão ou falha ao carregar."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Equipe"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: q.data.members.map((m) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: m.full_name ?? m.user_id.slice(0, 8)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: m.roleLabel
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm tabular-nums",
						children: [
							m.salesCount,
							" vendas · ",
							formatBRL(m.sales)
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						className: "mt-2",
						children: m.status
					})
				] }, m.user_id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl",
					children: "Convidar"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "mt-3 flex flex-wrap gap-2",
					onSubmit: (e) => {
						e.preventDefault();
						invite.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
							className: "sr-only",
							children: "E-mail"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "email",
							required: true,
							placeholder: "email@empresa.com",
							value: email,
							onChange: (e) => setEmail(e.target.value)
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
							className: "h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-3 text-sm",
							value: role,
							onChange: (e) => setRole(e.target.value),
							children: ROLE_SLUGS.filter((r) => r !== "owner").map((r) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
								value: r,
								children: ROLE_LABELS[r]
							}, r))
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "submit",
							children: "Convidar"
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-xs text-muted",
					children: "O e-mail transacional exige provedor configurado. O convite fica registrado com token e validade de 7 dias."
				})
			] })
		]
	});
}
//#endregion
export { TeamPage as component };
