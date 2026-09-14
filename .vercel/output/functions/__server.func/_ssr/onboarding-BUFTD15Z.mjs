import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { x as useNavigate } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as require_jsx_runtime } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { r as Skeleton } from "./card-BZiBSVt0.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { n as createCompany, t as completeOnboarding } from "./session-Y8nXp4Kx.mjs";
import { t as useSessionContext } from "./use-session-context-DSc0c_-p.mjs";
import { n as useCurrentUserState } from "./use-current-user-DG6UNzh9.mjs";
import { t as RedirectToSignIn } from "./gates-Dm5lJ9lE.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/onboarding-BUFTD15Z.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SEGMENTS = [
	"Clínica e saúde",
	"Comércio",
	"Serviços",
	"Alimentação",
	"Educação",
	"Indústria",
	"Outro"
];
function Onboarding() {
	const { user, isPending } = useCurrentUserState();
	const session = useSessionContext();
	const navigate = useNavigate();
	const [step, setStep] = (0, import_react.useState)(0);
	const [name, setName] = (0, import_react.useState)("");
	const [segment, setSegment] = (0, import_react.useState)(SEGMENTS[0]);
	const [approx, setApprox] = (0, import_react.useState)("80");
	const [currency, setCurrency] = (0, import_react.useState)("BRL");
	const [seedDemo, setSeedDemo] = (0, import_react.useState)(true);
	const [error, setError] = (0, import_react.useState)(null);
	const [busy, setBusy] = (0, import_react.useState)(false);
	if (isPending || session.isLoading) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "grid min-h-screen place-items-center",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-64 w-full max-w-lg" })
	});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RedirectToSignIn, {});
	if (session.data?.hasCompany && session.data.tenant?.onboardingCompleted) navigate({ to: "/app" });
	async function finish() {
		setBusy(true);
		setError(null);
		try {
			if (!session.data?.hasCompany) await createCompany({ data: {
				name,
				segment,
				approxCustomers: Number(approx) || 0,
				currency,
				seedDemo
			} });
			await completeOnboarding();
			window.location.href = "/app";
		} catch {
			setError("Não foi possível concluir. Tente de novo.");
			setBusy(false);
		}
	}
	const steps = [
		{
			title: "Nome da empresa",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "company",
					children: "Como sua empresa é chamada?"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "company",
					value: name,
					onChange: (e) => setName(e.target.value),
					placeholder: "Clínica Norte"
				})]
			})
		},
		{
			title: "Segmento",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "grid grid-cols-2 gap-2",
				children: SEGMENTS.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					onClick: () => setSegment(s),
					className: `min-h-11 rounded-[var(--radius-sm)] border px-3 text-sm ${segment === s ? "border-forest bg-forest/10" : "border-line bg-paper"}`,
					children: s
				}, s))
			})
		},
		{
			title: "Escala",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-1",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
					htmlFor: "approx",
					children: "Número aproximado de clientes"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					id: "approx",
					type: "number",
					min: 0,
					value: approx,
					onChange: (e) => setApprox(e.target.value)
				})]
			})
		},
		{
			title: "Moeda",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
				className: "h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3",
				value: currency,
				onChange: (e) => setCurrency(e.target.value),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "BRL",
						children: "Real (BRL)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "USD",
						children: "Dólar (USD)"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
						value: "EUR",
						children: "Euro (EUR)"
					})
				]
			})
		},
		{
			title: "Dados de demonstração",
			body: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
				className: "flex items-start gap-3 rounded-[var(--radius-md)] border border-line bg-canvas p-4 text-sm",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					type: "checkbox",
					checked: seedDemo,
					onChange: (e) => setSeedDemo(e.target.checked),
					className: "mt-1"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Carregar um conjunto de exemplo (clientes, orçamentos, cobranças) para ver o Dinheiro perdido funcionando. Sem este passo, o painel abre vazio — o correto para uma empresa nova." })]
			})
		}
	];
	const current = steps[step];
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-display text-3xl",
				children: "REVIVA"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "mt-2 text-xs uppercase tracking-[0.18em] text-muted",
				children: [
					"Passo ",
					step + 1,
					" de ",
					steps.length
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-3 font-display text-3xl",
				children: current.title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-6",
				children: current.body
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-rust",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-8 flex gap-3",
				children: [step > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					variant: "secondary",
					onClick: () => setStep((s) => s - 1),
					children: "Voltar"
				}) : null, step < steps.length - 1 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => {
						if (step === 0 && name.trim().length < 2) {
							setError("Informe o nome da empresa.");
							return;
						}
						setError(null);
						setStep((s) => s + 1);
					},
					children: "Continuar"
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => void finish(),
					disabled: busy,
					children: busy ? "Preparando…" : "Abrir o painel"
				})]
			})
		]
	});
}
//#endregion
export { Onboarding as component };
