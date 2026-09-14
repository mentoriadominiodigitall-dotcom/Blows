import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { i as slugify } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError, t as AppError } from "./errors-nQop9poO.mjs";
import { t as env } from "./env.server-wS9zOhV6.mjs";
import { r as getSql } from "./db-CitYTwIy.mjs";
import { t as ROLE_LABELS } from "./permissions-6R54wWQh.mjs";
import { i as writeAudit, n as loadTenant, r as requireTenant } from "./tenant-DtcaGUj6.mjs";
import { n as whatsappConfigured } from "./whatsapp-DVE5o1V0.mjs";
import { r as stripeConfigured, t as aiConfigured } from "./stripe-DI3aYGD-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/session-D_q2bXaR.js
var PIPELINE = [
	{
		slug: "lead",
		name: "Lead",
		order: 0
	},
	{
		slug: "contact",
		name: "Contato",
		order: 1
	},
	{
		slug: "qualify",
		name: "Qualificação",
		order: 2
	},
	{
		slug: "proposal",
		name: "Proposta",
		order: 3
	},
	{
		slug: "negotiation",
		name: "Negociação",
		order: 4
	},
	{
		slug: "won",
		name: "Venda",
		order: 5,
		won: true
	},
	{
		slug: "after",
		name: "Pós-venda",
		order: 6,
		won: true
	}
];
async function provisionCompanyDefaults(sql, companyId, userId) {
	await sql`
    insert into company_settings (company_id)
    values (${companyId})
    on conflict (company_id) do nothing
  `;
	await sql`
    insert into company_subscriptions (company_id, plan_slug, status, provider, trial_ends_at)
    values (${companyId}, ${"professional"}, ${"trialing"}, ${"manual"}, ${new Date(Date.now() + 12096e5).toISOString()})
    on conflict (company_id) do nothing
  `;
	const [pipeline] = await sql`
    insert into pipelines (company_id, name, is_default)
    values (${companyId}, ${"Vendas"}, ${true})
    returning id
  `;
	for (const stage of PIPELINE) await sql`
      insert into pipeline_stages (company_id, pipeline_id, name, slug, sort_order, is_won, is_lost)
      values (
        ${companyId},
        ${pipeline.id},
        ${stage.name},
        ${stage.slug},
        ${stage.order},
        ${Boolean(stage.won)},
        ${false}
      )
    `;
	const income = [
		"Vendas",
		"Serviços",
		"Recuperação"
	];
	const expense = [
		"Aluguel",
		"Folha",
		"Fornecedores",
		"Impostos",
		"Marketing"
	];
	for (const name of income) await sql`
      insert into transaction_categories (company_id, name, kind)
      values (${companyId}, ${name}, ${"income"})
    `;
	for (const name of expense) await sql`
      insert into transaction_categories (company_id, name, kind)
      values (${companyId}, ${name}, ${"expense"})
    `;
	await sql`
    insert into financial_accounts (company_id, name, kind, opening_balance)
    values (${companyId}, ${"Conta principal"}, ${"checking"}, ${0})
  `;
	for (const name of [
		"Pix",
		"Cartão",
		"Boleto",
		"Dinheiro"
	]) await sql`
      insert into payment_methods (company_id, name) values (${companyId}, ${name})
    `;
	for (const name of [
		"Indicação",
		"Instagram",
		"Google",
		"WhatsApp",
		"Balcão"
	]) await sql`
      insert into lead_sources (company_id, name) values (${companyId}, ${name})
    `;
	for (const s of [
		{
			slug: "new",
			name: "Novo",
			order: 0
		},
		{
			slug: "contacted",
			name: "Contatado",
			order: 1
		},
		{
			slug: "qualified",
			name: "Qualificado",
			order: 2
		},
		{
			slug: "lost",
			name: "Perdido",
			order: 3
		},
		{
			slug: "converted",
			name: "Convertido",
			order: 4
		}
	]) await sql`
      insert into lead_statuses (company_id, slug, name, sort_order)
      values (${companyId}, ${s.slug}, ${s.name}, ${s.order})
    `;
	await sql`
    insert into notifications (company_id, user_id, type, title, body, href)
    values (
      ${companyId},
      ${userId},
      ${"welcome"},
      ${"Bem-vindo ao REVIVA"},
      ${"O módulo Dinheiro perdido já está calculando oportunidades a partir dos seus dados."},
      ${"/app/dinheiro-perdido"}
    )
  `;
}
function daysAgo(days) {
	return (/* @__PURE__ */ new Date(Date.now() - days * 864e5)).toISOString();
}
function dateAgo(days) {
	return daysAgo(days).slice(0, 10);
}
async function seedDemoCompany(sql, companyId, userId) {
	if (((await sql`
    select count(*)::int as c from customers where company_id = ${companyId}
  `)[0]?.c ?? 0) > 0) return;
	const tags = await Promise.all([
		"VIP",
		"Recorrente",
		"Inativo",
		"B2B"
	].map(async (name) => {
		const [row] = await sql`
        insert into tags (company_id, name) values (${companyId}, ${name}) returning id
      `;
		return {
			name,
			id: row.id
		};
	}));
	const tag = (name) => tags.find((t) => t.name === name).id;
	const customers = [
		{
			name: "Ana Ribeiro",
			email: "ana.ribeiro@email.com",
			phone: "11987651001",
			last: 78,
			spent: 3920,
			count: 4,
			ticket: 980,
			interval: 45,
			class: "at_risk",
			consent: true
		},
		{
			name: "Marcos Pires",
			email: "marcos.pires@email.com",
			phone: "11987651002",
			last: 91,
			spent: 2160,
			count: 3,
			ticket: 720,
			interval: 40,
			class: "lost",
			consent: true
		},
		{
			name: "Padaria São Bento",
			email: "contato@saobento.com",
			phone: "1130910001",
			last: 64,
			spent: 8400,
			count: 4,
			ticket: 2100,
			interval: 30,
			class: "at_risk",
			consent: true
		},
		{
			name: "Helena Costa",
			email: "helena.costa@email.com",
			phone: "11987651003",
			last: 102,
			spent: 1600,
			count: 4,
			ticket: 400,
			interval: 35,
			class: "lost",
			consent: false
		},
		{
			name: "Bruno Lima",
			email: "bruno.lima@email.com",
			phone: "11987651004",
			last: 12,
			spent: 2700,
			count: 6,
			ticket: 450,
			interval: 18,
			class: "vip",
			consent: true
		},
		{
			name: "Carla Mendes",
			email: "carla.mendes@email.com",
			phone: "11987651005",
			last: 6,
			spent: 980,
			count: 2,
			ticket: 490,
			interval: 20,
			class: "regular",
			consent: true
		},
		{
			name: "Eduardo Nogueira",
			email: "eduardo.n@email.com",
			phone: "11987651006",
			last: 38,
			spent: 1500,
			count: 5,
			ticket: 300,
			interval: 21,
			class: "at_risk",
			consent: true
		},
		{
			name: "Farmácia Central",
			email: "compras@farmaciacentral.com",
			phone: "1130910002",
			last: 8,
			spent: 6200,
			count: 8,
			ticket: 775,
			interval: 14,
			class: "vip",
			consent: true
		},
		{
			name: "Sofia Martins",
			email: "sofia.martins@email.com",
			phone: "11987651007",
			last: 21,
			spent: 890,
			count: 1,
			ticket: 890,
			interval: null,
			class: "new",
			consent: true
		},
		{
			name: "Igor Azevedo",
			email: "igor.azevedo@email.com",
			phone: "11987651008",
			last: 48,
			spent: 1200,
			count: 3,
			ticket: 400,
			interval: 22,
			class: "at_risk",
			consent: true
		}
	];
	const customerIds = {};
	for (const c of customers) {
		const [row] = await sql`
      insert into customers (
        company_id, name, email, phone, source, status, classification,
        consent_whatsapp, consent_email, last_purchase_at, total_spent,
        purchase_count, avg_ticket, avg_interval_days, owner_user_id
      ) values (
        ${companyId}, ${c.name}, ${c.email}, ${c.phone}, ${"Indicação"}, ${"active"}, ${c.class},
        ${c.consent}, ${true}, ${daysAgo(c.last)}, ${c.spent},
        ${c.count}, ${c.ticket}, ${c.interval}, ${userId}
      ) returning id
    `;
		customerIds[c.name] = row.id;
		if (c.class === "vip") await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("VIP")}, ${companyId})`;
		if (c.last > 60) await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("Inativo")}, ${companyId})`;
		if (c.count >= 3) await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("Recorrente")}, ${companyId})`;
		if (c.name.includes("Padaria") || c.name.includes("Farmácia")) await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("B2B")}, ${companyId})`;
		await sql`
      insert into customer_events (company_id, customer_id, type, title, actor_user_id)
      values (${companyId}, ${row.id}, ${"created"}, ${"Cliente cadastrado"}, ${userId})
    `;
		await sql`
      insert into loyalty_accounts (company_id, customer_id, points, tier)
      values (${companyId}, ${row.id}, ${Math.round(c.spent / 10)}, ${c.class === "vip" ? "gold" : "bronze"})
    `;
	}
	const cats = [
		"Consultas",
		"Tratamentos",
		"Estética",
		"Produtos"
	];
	const catIds = [];
	for (const name of cats) {
		const [row] = await sql`
      insert into product_categories (company_id, name) values (${companyId}, ${name}) returning id
    `;
		catIds.push(row.id);
	}
	const products = [
		{
			name: "Consulta de retorno",
			sku: "CON-001",
			price: 280,
			cost: 80,
			qty: 999,
			cat: 0
		},
		{
			name: "Limpeza completa",
			sku: "TRT-010",
			price: 420,
			cost: 120,
			qty: 999,
			cat: 1
		},
		{
			name: "Clareamento",
			sku: "EST-003",
			price: 1850,
			cost: 480,
			qty: 12,
			cat: 2
		},
		{
			name: "Kit higiene",
			sku: "PRD-022",
			price: 89,
			cost: 32,
			qty: 4,
			cat: 3
		},
		{
			name: "Prótese parcial",
			sku: "TRT-040",
			price: 1e3,
			cost: 410,
			qty: 6,
			cat: 1
		},
		{
			name: "Manutenção aparelho",
			sku: "TRT-018",
			price: 350,
			cost: 90,
			qty: 999,
			cat: 1
		}
	];
	const productIds = [];
	for (const p of products) {
		const [row] = await sql`
      insert into products (company_id, category_id, name, sku, kind, price, cost, quantity, min_quantity)
      values (${companyId}, ${catIds[p.cat]}, ${p.name}, ${p.sku}, ${"service"}, ${p.price}, ${p.cost}, ${p.qty}, ${p.qty < 20 ? 5 : 0})
      returning id
    `;
		productIds.push(row.id);
		await sql`
      insert into inventory (product_id, company_id, quantity)
      values (${row.id}, ${companyId}, ${p.qty})
    `;
	}
	let saleNo = 1;
	async function addSale(customerName, days, productIndex, qty) {
		const customerId = customerIds[customerName];
		const product = products[productIndex];
		const total = product.price * qty;
		const [sale] = await sql`
      insert into sales (company_id, customer_id, number, status, sold_at, subtotal, discount, total, payment_method, seller_user_id)
      values (${companyId}, ${customerId}, ${saleNo++}, ${"completed"}, ${daysAgo(days)}, ${total}, ${0}, ${total}, ${"Pix"}, ${userId})
      returning id
    `;
		await sql`
      insert into sale_items (company_id, sale_id, product_id, description, quantity, unit_price, total)
      values (${companyId}, ${sale.id}, ${productIds[productIndex]}, ${product.name}, ${qty}, ${product.price}, ${total})
    `;
		const [cat] = await sql`
      select id from transaction_categories where company_id = ${companyId} and name = ${"Vendas"} limit 1
    `;
		await sql`
      insert into transactions (company_id, kind, amount, occurred_at, status, description, customer_id, sale_id, created_by, category_id)
      values (${companyId}, ${"income"}, ${total}, ${dateAgo(days)}, ${"paid"}, ${"Venda " + product.name}, ${customerId}, ${sale.id}, ${userId}, ${cat?.id ?? null})
    `;
	}
	await addSale("Bruno Lima", 12, 1, 1);
	await addSale("Carla Mendes", 6, 0, 1);
	await addSale("Farmácia Central", 8, 3, 6);
	await addSale("Sofia Martins", 21, 2, 1);
	await addSale("Ana Ribeiro", 78, 1, 1);
	await addSale("Padaria São Bento", 64, 5, 6);
	await addSale("Marcos Pires", 91, 1, 1);
	await addSale("Helena Costa", 102, 0, 1);
	await addSale("Eduardo Nogueira", 38, 5, 1);
	await addSale("Igor Azevedo", 48, 1, 1);
	const [expCat] = await sql`
    select id from transaction_categories where company_id = ${companyId} and name = ${"Aluguel"} limit 1
  `;
	await sql`
    insert into transactions (company_id, kind, amount, occurred_at, status, description, created_by, category_id)
    values (${companyId}, ${"expense"}, ${4200}, ${dateAgo(5)}, ${"paid"}, ${"Aluguel do consultório"}, ${userId}, ${expCat?.id ?? null})
  `;
	const [folha] = await sql`
    select id from transaction_categories where company_id = ${companyId} and name = ${"Folha"} limit 1
  `;
	await sql`
    insert into transactions (company_id, kind, amount, occurred_at, status, description, created_by, category_id)
    values (${companyId}, ${"expense"}, ${8600}, ${dateAgo(3)}, ${"paid"}, ${"Folha da equipe"}, ${userId}, ${folha?.id ?? null})
  `;
	let invNo = 1;
	async function overdue(customerName, amount, dueDays, desc) {
		await sql`
      insert into invoices (company_id, customer_id, number, amount, amount_paid, due_date, status, description)
      values (
        ${companyId},
        ${customerIds[customerName]},
        ${invNo++},
        ${amount},
        ${0},
        ${dateAgo(dueDays)},
        ${"overdue"},
        ${desc}
      )
    `;
	}
	await overdue("Padaria São Bento", 1600, 18, "Manutenção mensal em atraso");
	await overdue("Marcos Pires", 1e3, 5, "Saldo de tratamento");
	let quoteNo = 1;
	async function quote(customerName, productIndex, status, sentDays) {
		const product = products[productIndex];
		const [q] = await sql`
      insert into quotes (
        company_id, customer_id, number, status, valid_until, sent_at, subtotal, discount, total, owner_user_id
      ) values (
        ${companyId}, ${customerIds[customerName]}, ${quoteNo++}, ${status},
        ${dateAgo(-10)}, ${daysAgo(sentDays)}, ${product.price}, ${0}, ${product.price}, ${userId}
      ) returning id
    `;
		await sql`
      insert into quote_items (company_id, quote_id, product_id, description, quantity, unit_price, total)
      values (${companyId}, ${q.id}, ${productIds[productIndex]}, ${product.name}, ${1}, ${product.price}, ${product.price})
    `;
		await sql`
      insert into quote_status_history (company_id, quote_id, from_status, to_status, actor_user_id)
      values (${companyId}, ${q.id}, ${"draft"}, ${status}, ${userId})
    `;
	}
	await quote("Ana Ribeiro", 2, "sent", 12);
	await quote("Helena Costa", 4, "viewed", 20);
	await quote("Bruno Lima", 1, "accepted", 4);
	const leads = [
		{
			name: "Patrícia Gomes",
			source: "Instagram",
			value: 890,
			idle: 14,
			status: "new"
		},
		{
			name: "Rafael Teixeira",
			source: "Indicação",
			value: 1500,
			idle: 10,
			status: "contacted"
		},
		{
			name: "Larissa Duarte",
			source: "Google",
			value: 800,
			idle: 21,
			status: "qualified"
		},
		{
			name: "Otávio Reis",
			source: "WhatsApp",
			value: 350,
			idle: 2,
			status: "new"
		}
	];
	const leadIds = [];
	for (const l of leads) {
		const [row] = await sql`
      insert into leads (company_id, name, email, phone, source, status, estimated_value, owner_user_id, last_activity_at)
      values (
        ${companyId}, ${l.name}, ${l.name.toLowerCase().replace(" ", ".") + "@email.com"}, ${"11988880000"},
        ${l.source}, ${l.status}, ${l.value}, ${userId}, ${daysAgo(l.idle)}
      ) returning id
    `;
		leadIds.push(row.id);
		await sql`
      insert into lead_activities (company_id, lead_id, type, body, actor_user_id)
      values (${companyId}, ${row.id}, ${"note"}, ${"Lead capturado via " + l.source}, ${userId})
    `;
	}
	const stages = await sql`
    select id, slug from pipeline_stages where company_id = ${companyId} order by sort_order
  `;
	const stage = (slug) => stages.find((s) => s.slug === slug).id;
	const [pipeline] = await sql`
    select id from pipelines where company_id = ${companyId} limit 1
  `;
	for (const d of [
		{
			title: "Clareamento Ana",
			stage: "proposal",
			value: 1850,
			customer: "Ana Ribeiro"
		},
		{
			title: "Plano Padaria São Bento",
			stage: "negotiation",
			value: 4200,
			customer: "Padaria São Bento"
		},
		{
			title: "Consulta Patrícia",
			stage: "contact",
			value: 280,
			customer: null,
			lead: 0
		},
		{
			title: "Tratamento Rafael",
			stage: "qualify",
			value: 1500,
			customer: null,
			lead: 1
		},
		{
			title: "Manutenção Bruno",
			stage: "won",
			value: 350,
			customer: "Bruno Lima"
		}
	]) await sql`
      insert into deals (
        company_id, pipeline_id, stage_id, title, customer_id, lead_id, value, owner_user_id, expected_close_at, source
      ) values (
        ${companyId},
        ${pipeline.id},
        ${stage(d.stage)},
        ${d.title},
        ${d.customer ? customerIds[d.customer] : null},
        ${"lead" in d && d.lead != null ? leadIds[d.lead] : null},
        ${d.value},
        ${userId},
        ${dateAgo(-14)},
        ${"Indicação"}
      )
    `;
	const [svc] = await sql`
    insert into appointment_services (company_id, name, duration_minutes, price)
    values (${companyId}, ${"Consulta"}, ${40}, ${280}) returning id
  `;
	await sql`
    insert into appointments (company_id, customer_id, service_id, title, starts_at, ends_at, owner_user_id, status)
    values (
      ${companyId},
      ${customerIds["Carla Mendes"]},
      ${svc.id},
      ${"Retorno Carla Mendes"},
      ${daysAgo(-1)},
      ${new Date(Date.now() + 864e5 + 24e5).toISOString()},
      ${userId},
      ${"scheduled"}
    )
  `;
	await sql`
    insert into rewards (company_id, name, points_cost)
    values (${companyId}, ${"Limpeza cortesia"}, ${800})
  `;
	await sql`
    insert into goals (company_id, user_id, name, metric, target, period_start, period_end)
    values (
      ${companyId}, ${userId}, ${"Receita do mês"}, ${"revenue"}, ${45e3},
      ${(/* @__PURE__ */ new Date()).toISOString().slice(0, 8) + "01"},
      ${dateAgo(-20)}
    )
  `;
	await sql`
    insert into automations (company_id, name, enabled, trigger_key)
    values (${companyId}, ${"Avisar clientes inativos 60 dias"}, ${false}, ${"customer_inactive_60"})
  `;
	await sql`
    insert into message_templates (company_id, name, channel, body)
    values (
      ${companyId},
      ${"Retorno 60 dias"},
      ${"whatsapp"},
      ${"Olá {{nome}}, sentimos sua falta na {{empresa}}. Separámos uma condição para seu retorno. Posso te contar?"}
    )
  `;
	await sql`
    insert into notifications (company_id, user_id, type, title, body, href)
    values (
      ${companyId},
      ${userId},
      ${"lost_money"},
      ${"Há receita parada para recuperar"},
      ${"O motor de Dinheiro perdido encontrou clientes inativos, orçamentos e cobranças em atraso."},
      ${"/app/dinheiro-perdido"}
    )
  `;
	await sql`update companies set demo_mode = true where id = ${companyId}`;
}
function platformAdminEmail(email) {
	const raw = env("PLATFORM_ADMIN_EMAILS") ?? "";
	if (!email || !raw) return false;
	return raw.split(",").map((s) => s.trim().toLowerCase()).filter(Boolean).includes(email.toLowerCase());
}
var getSessionContext_createServerFn_handler = createServerRpc({
	id: "8f03ce50440f4c1f1e189ab610e092cbba4517a8cb146a3b73a90c710b489500",
	name: "getSessionContext",
	filename: "src/lib/server/session.ts"
}, (opts) => getSessionContext.__executeServer(opts));
var getSessionContext = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getSessionContext_createServerFn_handler, async ({ context }) => {
	try {
		const sql = await getSql();
		const [authUser] = await sql`
        select name, email from "user" where id = ${context.userId} limit 1
      `;
		const email = authUser?.email ?? null;
		if (platformAdminEmail(email)) await sql`
          update profiles set is_platform_admin = true, full_name = coalesce(nullif(full_name, 'Usuário'), ${authUser?.name ?? "Usuário"})
          where user_id = ${context.userId}
        `;
		else await sql`
          insert into profiles (user_id, full_name)
          values (${context.userId}, ${authUser?.name ?? "Usuário"})
          on conflict (user_id) do update
            set full_name = coalesce(nullif(profiles.full_name, 'Usuário'), excluded.full_name)
        `;
		const tenant = await loadTenant(context.userId);
		const unread = tenant ? await sql`
            select count(*)::int as c from notifications
            where company_id = ${tenant.companyId}
              and (user_id = ${context.userId} or user_id is null)
              and read_at is null
          ` : [{ c: 0 }];
		return {
			userId: context.userId,
			name: tenant?.fullName ?? authUser?.name ?? "Usuário",
			email,
			hasCompany: Boolean(tenant),
			tenant: tenant ? {
				companyId: tenant.companyId,
				companyName: tenant.companyName,
				role: tenant.role,
				roleLabel: ROLE_LABELS[tenant.role],
				demoMode: tenant.demoMode,
				onboardingCompleted: tenant.onboardingCompleted,
				currency: tenant.currency,
				segment: tenant.segment,
				planSlug: tenant.planSlug,
				subscriptionStatus: tenant.subscriptionStatus,
				isPlatformAdmin: tenant.isPlatformAdmin
			} : null,
			unreadNotifications: unread[0]?.c ?? 0,
			integrations: {
				stripe: stripeConfigured(),
				whatsapp: whatsappConfigured(),
				ai: aiConfigured()
			}
		};
	} catch (error) {
		publicError(error);
	}
});
var createCompany_createServerFn_handler = createServerRpc({
	id: "e6bfa02d642029ed533c5b72474ad06f42570409d7b65c2fc0e8682b21038a63",
	name: "createCompany",
	filename: "src/lib/server/session.ts"
}, (opts) => createCompany.__executeServer(opts));
var createCompany = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name || name.length < 2) throw new AppError("VALIDATION", "Informe o nome da empresa.");
	const approx = Number(input.approxCustomers) || 0;
	const currency = (input.currency || "BRL").toUpperCase();
	return {
		name,
		segment: (input.segment || "").trim(),
		approxCustomers: approx,
		currency,
		seedDemo: Boolean(input.seedDemo)
	};
}).handler(createCompany_createServerFn_handler, async ({ context, data }) => {
	try {
		if (await loadTenant(context.userId)) throw new AppError("EXISTS", "Você já possui uma empresa nesta conta.");
		const sql = await getSql();
		const slug = `${slugify(data.name) || "empresa"}-${crypto.randomUUID().slice(0, 8)}`;
		const [company] = await sql`
        insert into companies (name, slug, segment, approx_customers, currency, created_by, onboarding_completed)
        values (${data.name}, ${slug}, ${data.segment}, ${data.approxCustomers}, ${data.currency}, ${context.userId}, ${false})
        returning id
      `;
		await sql`
        insert into company_members (company_id, user_id, role_slug, status, accepted_at)
        values (${company.id}, ${context.userId}, ${"owner"}, ${"active"}, ${(/* @__PURE__ */ new Date()).toISOString()})
      `;
		await sql`
        update profiles set current_company_id = ${company.id}, full_name = coalesce(nullif(full_name, 'Usuário'), full_name)
        where user_id = ${context.userId}
      `;
		await provisionCompanyDefaults(sql, company.id, context.userId);
		if (data.seedDemo) await seedDemoCompany(sql, company.id, context.userId);
		const tenant = await loadTenant(context.userId);
		if (tenant) await writeAudit(sql, tenant, {
			action: "create",
			entity: "company",
			entityId: company.id,
			after: data.name
		});
		return { companyId: company.id };
	} catch (error) {
		publicError(error);
	}
});
var completeOnboarding_createServerFn_handler = createServerRpc({
	id: "0bf76cc27c1665833bfcefcf0538dbfc049f4c89d75d5c480d8dfa5bc93894fb",
	name: "completeOnboarding",
	filename: "src/lib/server/session.ts"
}, (opts) => completeOnboarding.__executeServer(opts));
var completeOnboarding = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(completeOnboarding_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		await sql`update companies set onboarding_completed = true, updated_at = now() where id = ${tenant.companyId}`;
		return { ok: true };
	} catch (error) {
		publicError(error);
	}
});
var listNotifications_createServerFn_handler = createServerRpc({
	id: "8a7fd8130734c9f5e1d206ce545a5e6af6f4e67c0180fe6e44315a635d4c6bd8",
	name: "listNotifications",
	filename: "src/lib/server/session.ts"
}, (opts) => listNotifications.__executeServer(opts));
var listNotifications = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listNotifications_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		return await sql`
        select id, type, title, body, href, read_at, created_at
        from notifications
        where company_id = ${tenant.companyId}
          and (user_id = ${tenant.userId} or user_id is null)
        order by created_at desc
        limit 40
      `;
	} catch (error) {
		publicError(error);
	}
});
var markNotificationsRead_createServerFn_handler = createServerRpc({
	id: "13c232ad2bb2f647b129b0d0c872b1019e082d814f19ba317a9dadb6a825095d",
	name: "markNotificationsRead",
	filename: "src/lib/server/session.ts"
}, (opts) => markNotificationsRead.__executeServer(opts));
var markNotificationsRead = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(markNotificationsRead_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		await sql`
        update notifications set read_at = now()
        where company_id = ${tenant.companyId}
          and (user_id = ${tenant.userId} or user_id is null)
          and read_at is null
      `;
		return { ok: true };
	} catch (error) {
		publicError(error);
	}
});
var inviteMember_createServerFn_handler = createServerRpc({
	id: "40bb63b73406f12cc2649ae55e0733e417ef484b75d51d4ba0e58aa6271d667e",
	name: "inviteMember",
	filename: "src/lib/server/session.ts"
}, (opts) => inviteMember.__executeServer(opts));
var inviteMember = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const email = input.email?.trim().toLowerCase();
	if (!email || !email.includes("@")) throw new AppError("VALIDATION", "E-mail inválido.");
	return {
		email,
		role: input.role
	};
}).handler(inviteMember_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		if (tenant.role !== "owner" && tenant.role !== "admin") throw new AppError("FORBIDDEN", "Apenas administradores convidam a equipe.", 403);
		const token = crypto.randomUUID();
		const expires = new Date(Date.now() + 6048e5).toISOString();
		await sql`
        insert into invites (company_id, email, role_slug, token, invited_by, expires_at)
        values (${tenant.companyId}, ${data.email}, ${data.role}, ${token}, ${tenant.userId}, ${expires})
      `;
		await writeAudit(sql, tenant, {
			action: "invite",
			entity: "member",
			after: `${data.email}:${data.role}`
		});
		return {
			token,
			expiresAt: expires
		};
	} catch (error) {
		publicError(error);
	}
});
//#endregion
export { completeOnboarding_createServerFn_handler, createCompany_createServerFn_handler, getSessionContext_createServerFn_handler, inviteMember_createServerFn_handler, listNotifications_createServerFn_handler, markNotificationsRead_createServerFn_handler };
