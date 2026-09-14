import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { n as daysSince, r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError, t as AppError } from "./errors-nQop9poO.mjs";
import { i as writeAudit, r as requireTenant, t as assertPermission } from "./tenant-DtcaGUj6.mjs";
import { n as whatsappConfigured, t as sendWhatsAppMessage } from "./whatsapp-DVE5o1V0.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/lost-money-BncAiQPt.js
var CATEGORY_META = {
	inactive: {
		label: "Clientes inativos",
		description: "Compraram antes e sumiram do radar.",
		action: "Reativar com oferta de retorno"
	},
	leads: {
		label: "Leads parados",
		description: "Oportunidades sem acompanhamento recente.",
		action: "Retomar conversa com contexto"
	},
	quotes: {
		label: "Orçamentos abandonados",
		description: "Propostas enviadas ainda sem resposta.",
		action: "Cobrar retorno da proposta"
	},
	overdue: {
		label: "Cobranças vencidas",
		description: "Valores já faturados e não recebidos.",
		action: "Enviar lembrete de vencimento"
	},
	repurchase: {
		label: "Recompra atrasada",
		description: "Clientes recorrentes que passaram do intervalo usual.",
		action: "Lembrar da reposição"
	}
};
function priorityForAmount(amount, daysIdle) {
	if (amount >= 1500 || daysIdle >= 90) return "high";
	if (amount >= 500 || daysIdle >= 45) return "medium";
	return "low";
}
function itemPriority(amount, last) {
	return priorityForAmount(amount, daysSince(last) ?? 0);
}
var getLostMoney_createServerFn_handler = createServerRpc({
	id: "6099bf0e08535cb6a675c58cdd8a32256446d022eb3d82a3041b149ce0f89455",
	name: "getLostMoney",
	filename: "src/lib/server/lost-money.ts"
}, (opts) => getLostMoney.__executeServer(opts));
var getLostMoney = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getLostMoney_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		const [settings] = await sql`
        select inactive_days, lead_idle_days, quote_idle_days, repurchase_multiplier
        from company_settings where company_id = ${tenant.companyId}
      `;
		const inactiveDays = settings?.inactive_days ?? 60;
		const leadDays = settings?.lead_idle_days ?? 7;
		const quoteDays = settings?.quote_idle_days ?? 7;
		const multi = num(settings?.repurchase_multiplier) || 1.5;
		const inactiveRows = await sql`
        select id, name, phone, email, avg_ticket, last_purchase_at, consent_whatsapp
        from customers
        where company_id = ${tenant.companyId}
          and deleted_at is null
          and last_purchase_at is not null
          and last_purchase_at < now() - (${inactiveDays}::text || ' days')::interval
        order by avg_ticket desc
      `;
		const leadRows = await sql`
        select id, name, phone, email, estimated_value, last_activity_at, source
        from leads
        where company_id = ${tenant.companyId}
          and deleted_at is null
          and converted_customer_id is null
          and status not in ('converted', 'lost')
          and coalesce(last_activity_at, created_at) < now() - (${leadDays}::text || ' days')::interval
        order by estimated_value desc
      `;
		const quoteRows = await sql`
        select q.id, q.total, q.sent_at, q.status, c.name as customer_name, c.phone, c.email, c.consent_whatsapp as consent
        from quotes q
        left join customers c on c.id = q.customer_id and c.company_id = q.company_id
        where q.company_id = ${tenant.companyId}
          and q.status in ('sent', 'viewed')
          and q.sent_at is not null
          and q.sent_at < now() - (${quoteDays}::text || ' days')::interval
        order by q.total desc
      `;
		await sql`
        update invoices
        set status = 'overdue'
        where company_id = ${tenant.companyId}
          and status = 'open'
          and due_date < current_date
      `;
		const overdueRows = await sql`
        select i.id, i.amount, i.amount_paid, i.due_date, i.description,
               c.name as customer_name, c.phone, c.email, c.consent_whatsapp as consent
        from invoices i
        left join customers c on c.id = i.customer_id and c.company_id = i.company_id
        where i.company_id = ${tenant.companyId}
          and i.status in ('open', 'overdue')
          and i.due_date < current_date
        order by i.due_date asc
      `;
		const repurchaseRows = await sql`
        select id, name, phone, email, avg_ticket, last_purchase_at, avg_interval_days, consent_whatsapp
        from customers
        where company_id = ${tenant.companyId}
          and deleted_at is null
          and purchase_count >= 2
          and avg_interval_days is not null
          and last_purchase_at is not null
          and last_purchase_at >= now() - (${inactiveDays}::text || ' days')::interval
          and last_purchase_at < now() - ((avg_interval_days * ${multi})::text || ' days')::interval
        order by avg_ticket desc
      `;
		const categories = [
			{
				key: "inactive",
				...CATEGORY_META.inactive,
				count: inactiveRows.length,
				amount: inactiveRows.reduce((s, r) => s + num(r.avg_ticket), 0),
				items: inactiveRows.map((r) => ({
					id: r.id,
					category: "inactive",
					name: r.name,
					subtitle: `Última compra há ${daysSince(r.last_purchase_at) ?? "—"} dias`,
					amount: num(r.avg_ticket),
					priority: itemPriority(num(r.avg_ticket), r.last_purchase_at),
					lastActivity: r.last_purchase_at,
					recommendedAction: CATEGORY_META.inactive.action,
					phone: r.phone,
					email: r.email,
					consent: Boolean(r.consent_whatsapp)
				}))
			},
			{
				key: "quotes",
				...CATEGORY_META.quotes,
				count: quoteRows.length,
				amount: quoteRows.reduce((s, r) => s + num(r.total), 0),
				items: quoteRows.map((r) => ({
					id: r.id,
					category: "quotes",
					name: r.customer_name ?? "Orçamento",
					subtitle: `Status ${r.status} · enviado há ${daysSince(r.sent_at) ?? "—"} dias`,
					amount: num(r.total),
					priority: itemPriority(num(r.total), r.sent_at),
					lastActivity: r.sent_at,
					recommendedAction: CATEGORY_META.quotes.action,
					phone: r.phone,
					email: r.email,
					consent: Boolean(r.consent)
				}))
			},
			{
				key: "leads",
				...CATEGORY_META.leads,
				count: leadRows.length,
				amount: leadRows.reduce((s, r) => s + num(r.estimated_value), 0),
				items: leadRows.map((r) => ({
					id: r.id,
					category: "leads",
					name: r.name,
					subtitle: `${r.source ?? "Lead"} · parado há ${daysSince(r.last_activity_at) ?? "—"} dias`,
					amount: num(r.estimated_value),
					priority: itemPriority(num(r.estimated_value), r.last_activity_at),
					lastActivity: r.last_activity_at,
					recommendedAction: CATEGORY_META.leads.action,
					phone: r.phone,
					email: r.email,
					consent: false
				}))
			},
			{
				key: "overdue",
				...CATEGORY_META.overdue,
				count: overdueRows.length,
				amount: overdueRows.reduce((s, r) => s + (num(r.amount) - num(r.amount_paid)), 0),
				items: overdueRows.map((r) => ({
					id: r.id,
					category: "overdue",
					name: r.customer_name ?? "Cobrança",
					subtitle: r.description ?? `Venceu em ${r.due_date}`,
					amount: num(r.amount) - num(r.amount_paid),
					priority: "high",
					lastActivity: r.due_date,
					recommendedAction: CATEGORY_META.overdue.action,
					phone: r.phone,
					email: r.email,
					consent: Boolean(r.consent)
				}))
			},
			{
				key: "repurchase",
				...CATEGORY_META.repurchase,
				count: repurchaseRows.length,
				amount: repurchaseRows.reduce((s, r) => s + num(r.avg_ticket), 0),
				items: repurchaseRows.map((r) => ({
					id: r.id,
					category: "repurchase",
					name: r.name,
					subtitle: `Intervalo usual ${Math.round(num(r.avg_interval_days))} dias`,
					amount: num(r.avg_ticket),
					priority: itemPriority(num(r.avg_ticket), r.last_purchase_at),
					lastActivity: r.last_purchase_at,
					recommendedAction: CATEGORY_META.repurchase.action,
					phone: r.phone,
					email: r.email,
					consent: Boolean(r.consent_whatsapp)
				}))
			}
		];
		return {
			total: categories.reduce((s, c) => s + c.amount, 0),
			generatedAt: (/* @__PURE__ */ new Date()).toISOString(),
			inactiveDays,
			categories
		};
	} catch (error) {
		publicError(error);
	}
});
var createRecoveryCampaign_createServerFn_handler = createServerRpc({
	id: "9d35d7219eec754ee5907ba3e11ed70ad22f323edcef869b2be05a3ea4fcf978",
	name: "createRecoveryCampaign",
	filename: "src/lib/server/lost-money.ts"
}, (opts) => createRecoveryCampaign.__executeServer(opts));
var createRecoveryCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	const message = input.message?.trim();
	if (!name) throw new AppError("VALIDATION", "Dê um nome à campanha.");
	if (!message) throw new AppError("VALIDATION", "Escreva a mensagem.");
	if (!input.itemIds?.length) throw new AppError("VALIDATION", "Selecione pelo menos um contato.");
	return {
		name,
		category: input.category,
		message,
		channel: input.channel,
		itemIds: input.itemIds.slice(0, 200)
	};
}).handler(createRecoveryCampaign_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "campaigns.write");
		const configured = data.channel === "whatsapp" ? whatsappConfigured() : false;
		const status = configured ? "draft" : "needs_config";
		const [campaign] = await sql`
        insert into campaigns (company_id, name, segment_key, channel, message, status, created_by)
        values (${tenant.companyId}, ${data.name}, ${data.category}, ${data.channel}, ${data.message}, ${status}, ${tenant.userId})
        returning id
      `;
		for (const id of data.itemIds) if (data.category === "leads") {
			const [lead] = await sql`
            select id, name, phone, email, estimated_value from leads
            where id = ${id} and company_id = ${tenant.companyId}
          `;
			if (!lead) continue;
			await sql`
            insert into campaign_recipients (
              company_id, campaign_id, lead_id, name, phone, email, estimated_value, consent, status
            ) values (
              ${tenant.companyId}, ${campaign.id}, ${lead.id}, ${lead.name}, ${lead.phone}, ${lead.email},
              ${num(lead.estimated_value)}, ${false}, ${"pending"}
            )
          `;
		} else if (data.category === "quotes") {
			const [q] = await sql`
            select q.id, q.total, q.customer_id, c.name, c.phone, c.email, c.consent_whatsapp as consent
            from quotes q
            left join customers c on c.id = q.customer_id and c.company_id = q.company_id
            where q.id = ${id} and q.company_id = ${tenant.companyId}
          `;
			if (!q) continue;
			await sql`
            insert into campaign_recipients (
              company_id, campaign_id, customer_id, quote_id, name, phone, email, estimated_value, consent, status
            ) values (
              ${tenant.companyId}, ${campaign.id}, ${q.customer_id}, ${q.id}, ${q.name ?? "Cliente"},
              ${q.phone}, ${q.email}, ${num(q.total)}, ${Boolean(q.consent)}, ${"pending"}
            )
          `;
		} else if (data.category === "overdue") {
			const [inv] = await sql`
            select i.id, i.amount, i.amount_paid, i.customer_id, c.name, c.phone, c.email, c.consent_whatsapp as consent
            from invoices i
            left join customers c on c.id = i.customer_id and c.company_id = i.company_id
            where i.id = ${id} and i.company_id = ${tenant.companyId}
          `;
			if (!inv) continue;
			await sql`
            insert into campaign_recipients (
              company_id, campaign_id, customer_id, invoice_id, name, phone, email, estimated_value, consent, status
            ) values (
              ${tenant.companyId}, ${campaign.id}, ${inv.customer_id}, ${inv.id}, ${inv.name ?? "Cliente"},
              ${inv.phone}, ${inv.email}, ${num(inv.amount) - num(inv.amount_paid)}, ${Boolean(inv.consent)}, ${"pending"}
            )
          `;
		} else {
			const [c] = await sql`
            select id, name, phone, email, avg_ticket, consent_whatsapp
            from customers
            where id = ${id} and company_id = ${tenant.companyId} and deleted_at is null
          `;
			if (!c) continue;
			await sql`
            insert into campaign_recipients (
              company_id, campaign_id, customer_id, name, phone, email, estimated_value, consent, status
            ) values (
              ${tenant.companyId}, ${campaign.id}, ${c.id}, ${c.name}, ${c.phone}, ${c.email},
              ${num(c.avg_ticket)}, ${Boolean(c.consent_whatsapp)}, ${"pending"}
            )
          `;
		}
		await sql`
        insert into campaign_events (company_id, campaign_id, type, payload)
        values (${tenant.companyId}, ${campaign.id}, ${"created"}, ${JSON.stringify({ category: data.category })}::jsonb)
      `;
		await writeAudit(sql, tenant, {
			action: "create",
			entity: "campaign",
			entityId: campaign.id,
			after: data.name
		});
		return {
			campaignId: campaign.id,
			status,
			configured,
			needsConfig: !configured
		};
	} catch (error) {
		publicError(error);
	}
});
var dispatchCampaign_createServerFn_handler = createServerRpc({
	id: "5f486a4bee283e3882f40e8924a745edea2c814c22fb97a09377bbd2588fc8db",
	name: "dispatchCampaign",
	filename: "src/lib/server/lost-money.ts"
}, (opts) => dispatchCampaign.__executeServer(opts));
var dispatchCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.campaignId) throw new AppError("VALIDATION", "Campanha inválida.");
	return input;
}).handler(dispatchCampaign_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "campaigns.write");
		const [campaign] = await sql`
        select id, channel, message, status from campaigns
        where id = ${data.campaignId} and company_id = ${tenant.companyId}
      `;
		if (!campaign) throw new AppError("NOT_FOUND", "Campanha não encontrada.", 404);
		const recipients = await sql`
        select id, phone, consent, name from campaign_recipients
        where campaign_id = ${campaign.id} and company_id = ${tenant.companyId}
      `;
		if (campaign.channel !== "whatsapp") throw new AppError("VALIDATION", "Canal ainda não suportado.");
		let queued = 0;
		let blocked = 0;
		for (const r of recipients) {
			const personalized = campaign.message.replaceAll("{{nome}}", r.name);
			const result = await sendWhatsAppMessage({
				to: r.phone ?? "",
				body: personalized,
				consent: r.consent
			});
			if (result.ok) {
				queued += 1;
				await sql`
            update campaign_recipients set status = ${"sent"}
            where id = ${r.id} and company_id = ${tenant.companyId}
          `;
			} else {
				blocked += 1;
				await sql`
            update campaign_recipients set status = ${"blocked"}, result = ${result.reason}
            where id = ${r.id} and company_id = ${tenant.companyId}
          `;
			}
		}
		await sql`
        update campaigns set status = ${whatsappConfigured() ? campaign.status : "needs_config"}
        where id = ${campaign.id} and company_id = ${tenant.companyId}
      `;
		return {
			queued,
			blocked,
			needsConfig: !whatsappConfigured()
		};
	} catch (error) {
		publicError(error);
	}
});
//#endregion
export { createRecoveryCampaign_createServerFn_handler, dispatchCampaign_createServerFn_handler, getLostMoney_createServerFn_handler };
