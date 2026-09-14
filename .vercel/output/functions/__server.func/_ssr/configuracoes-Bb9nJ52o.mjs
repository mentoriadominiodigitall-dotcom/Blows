import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { r as createServerFn } from "./ssr.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card } from "./card-BZiBSVt0.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { i as createSsrRpc } from "./router-Qcf6f3NG.mjs";
import { t as authClient } from "./client-B40BzJxt.mjs";
import { t as useSessionContext } from "./use-session-context-DSc0c_-p.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/configuracoes-Bb9nJ52o.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Creates a throwaway company + customer, then attempts the same scoped
* lookups used by the CRM API. Must return isolated: true.
*/
var probeTenantIsolation = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("9f2275ec2ed6ebad52aea273650517414e5b985fe3d6400bd26cf1612c683086"));
function SettingsPage() {
	const session = useSessionContext();
	const [currentPassword, setCurrentPassword] = (0, import_react.useState)("");
	const [newPassword, setNewPassword] = (0, import_react.useState)("");
	const probe = useMutation({
		mutationFn: () => probeTenantIsolation(),
		onSuccess: (res) => {
			if (res.isolated) toast.success("Isolamento entre empresas confirmado.");
			else toast.error("Falha de isolamento.");
		},
		onError: () => toast.error("Não foi possível executar o teste.")
	});
	const t = session.data?.tenant;
	const i = session.data?.integrations;
	async function changePassword(e) {
		e.preventDefault();
		const { error } = await authClient.changePassword({
			currentPassword,
			newPassword
		});
		if (error) {
			toast.error("Não foi possível alterar a senha.");
			return;
		}
		toast.success("Senha alterada.");
		setCurrentPassword("");
		setNewPassword("");
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "Configurações"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs uppercase tracking-[0.14em] text-muted",
					children: "Empresa"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 font-display text-2xl",
					children: t?.companyName
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "text-sm text-muted",
					children: [
						t?.segment ?? "Segmento não informado",
						" · ",
						t?.currency,
						" · plano ",
						t?.planSlug
					]
				})
			] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "Integrações"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
				className: "mt-3 space-y-2 text-sm",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["WhatsApp Business API — ", i?.whatsapp ? "configurado" : "configuração necessária"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["Stripe — ", i?.stripe ? "configurado" : "configuração necessária"] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: ["IA (xAI) — ", i?.ai ? "configurada" : "configuração necessária"] })
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-xl",
				children: "Alterar senha"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "mt-3 max-w-sm space-y-2",
				onSubmit: changePassword,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "current",
						children: "Senha atual"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "current",
						type: "password",
						value: currentPassword,
						onChange: (e) => setCurrentPassword(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
						htmlFor: "next",
						children: "Nova senha"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
						id: "next",
						type: "password",
						minLength: 8,
						value: newPassword,
						onChange: (e) => setNewPassword(e.target.value),
						required: true
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "submit",
						children: "Salvar senha"
					})
				]
			})] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, { children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "font-display text-xl",
					children: "Segurança"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted",
					children: "Teste de isolamento: cria um cliente em outra empresa e tenta lê-lo com a sessão atual. Deve falhar."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					className: "mt-4",
					variant: "secondary",
					onClick: () => probe.mutate(),
					disabled: probe.isPending,
					children: probe.isPending ? "Testando…" : "Rodar teste de isolamento"
				}),
				t?.isPlatformAdmin ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-sm",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/plataforma",
						className: "underline-offset-4 hover:underline",
						children: "Abrir painel da plataforma"
					})
				}) : null
			] })
		]
	});
}
//#endregion
export { SettingsPage as component };
