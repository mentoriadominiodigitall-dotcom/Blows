import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card } from "./card-BZiBSVt0.mjs";
import { f as runAi } from "./ops-Dp9zSX-z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ia-C9_tR2wS.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var KINDS = [
	{
		id: "recovery",
		title: "IA de recuperação",
		body: "Quem contactar primeiro, com justificativa."
	},
	{
		id: "sales",
		title: "IA de vendas",
		body: "Leitura do funil a partir das etapas reais."
	},
	{
		id: "finance",
		title: "IA financeira",
		body: "Receita, despesa e margem do mês."
	},
	{
		id: "management",
		title: "IA de gestão",
		body: "Resumo executivo curto."
	},
	{
		id: "campaign",
		title: "IA de campanhas",
		body: "Sugestão de mensagem para inativos."
	},
	{
		id: "forecast",
		title: "IA de previsão",
		body: "Estimativa conservadora com os dados atuais."
	}
];
function AiPage() {
	const [kind, setKind] = (0, import_react.useState)("recovery");
	const [text, setText] = (0, import_react.useState)(null);
	const run = useMutation({
		mutationFn: () => runAi({ data: { kind } }),
		onSuccess: (res) => {
			if (!res.ok) {
				setText(res.reason === "not_configured" ? "IA indisponível neste ambiente. A chave do provedor não está configurada — nada foi inventado." : "O provedor de IA retornou erro. Tente de novo em instantes.");
				return;
			}
			setText(res.text);
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl",
				children: "IA"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-2xl text-sm text-muted",
				children: "A IA não consulta o banco diretamente. Cada botão envia um recorte já filtrado pela sua empresa. Nada é executado automaticamente."
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid gap-3 md:grid-cols-2",
				children: KINDS.map((k) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => {
						setKind(k.id);
						setText(null);
					},
					className: `rounded-[var(--radius-lg)] border p-4 text-left ${kind === k.id ? "border-ink bg-paper" : "border-line bg-paper/70"}`,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: k.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-sm text-muted",
						children: k.body
					})]
				}, k.id))
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
				onClick: () => run.mutate(),
				disabled: run.isPending,
				children: run.isPending ? "Analisando…" : "Gerar recomendação"
			}),
			text ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Card, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "whitespace-pre-wrap font-sans text-sm leading-relaxed",
				children: text
			}) }) : null
		]
	});
}
//#endregion
export { AiPage as component };
