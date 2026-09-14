import { o as __toESM } from "../_runtime.mjs";
import { n as require_react } from "../_libs/@radix-ui/react-compose-refs+[...].mjs";
import { a as require_jsx_runtime, i as useQueryClient, n as useQuery, t as useMutation } from "../_libs/react+tanstack__react-query.mjs";
import { t as Button } from "./button-Ddt5KCJ7.mjs";
import { n as Card, r as Skeleton, t as Badge } from "./card-BZiBSVt0.mjs";
import { t as EmptyState } from "./empty-CwmFszck.mjs";
import { n as Label, t as Input } from "./input-CM-BkE29.mjs";
import { n as toast } from "../_libs/sonner.mjs";
import { n as createAppointment, o as listAppointments } from "./ops-Dp9zSX-z.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/agenda-RkOFnQfP.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function AgendaPage() {
	const q = useQuery({
		queryKey: ["appointments"],
		queryFn: () => listAppointments()
	});
	const [open, setOpen] = (0, import_react.useState)(false);
	const [form, setForm] = (0, import_react.useState)({
		title: "",
		startsAt: (/* @__PURE__ */ new Date()).toISOString().slice(0, 16),
		endsAt: new Date(Date.now() + 36e5).toISOString().slice(0, 16)
	});
	const qc = useQueryClient();
	const save = useMutation({
		mutationFn: () => createAppointment({ data: {
			title: form.title,
			startsAt: new Date(form.startsAt).toISOString(),
			endsAt: new Date(form.endsAt).toISOString()
		} }),
		onSuccess: async () => {
			toast.success("Compromisso criado.");
			setOpen(false);
			await qc.invalidateQueries({ queryKey: ["appointments"] });
		}
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-4xl",
					children: "Agenda"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					onClick: () => setOpen(true),
					children: "Novo"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "Google Calendar: configuração necessária para sincronizar."
			}),
			q.isLoading ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Skeleton, { className: "h-40" }) : null,
			q.data && q.data.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, {
				title: "Agenda vazia",
				body: "Marque retornos, avaliações e visitas."
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "space-y-2",
				children: q.data?.map((a) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "flex items-center justify-between gap-3 p-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-medium",
						children: a.title
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-xs text-muted",
						children: [
							new Date(a.starts_at).toLocaleString("pt-BR"),
							" · ",
							a.customer_name ?? "interno"
						]
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, { children: a.status })]
				}, a.id))
			}),
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					className: "w-full max-w-md space-y-3 rounded-[var(--radius-xl)] bg-paper p-6",
					onSubmit: (e) => {
						e.preventDefault();
						save.mutate();
					},
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl",
							children: "Compromisso"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Título" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							required: true,
							value: form.title,
							onChange: (e) => setForm({
								...form,
								title: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Início" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "datetime-local",
							value: form.startsAt,
							onChange: (e) => setForm({
								...form,
								startsAt: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Fim" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							type: "datetime-local",
							value: form.endsAt,
							onChange: (e) => setForm({
								...form,
								endsAt: e.target.value
							})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								variant: "secondary",
								onClick: () => setOpen(false),
								children: "Cancelar"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "submit",
								children: "Salvar"
							})]
						})
					]
				})
			}) : null
		]
	});
}
//#endregion
export { AgendaPage as component };
