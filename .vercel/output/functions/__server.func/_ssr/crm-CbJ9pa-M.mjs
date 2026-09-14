import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError, t as AppError } from "./errors-nQop9poO.mjs";
import { i as writeAudit, r as requireTenant, t as assertPermission } from "./tenant-DtcaGUj6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/crm-CbJ9pa-M.js
var listCustomers_createServerFn_handler = createServerRpc({
	id: "cd12a84573a8d0aa74ef392c1704f0c3759129ee7b78cddf21e44a7264eaa61a",
	name: "listCustomers",
	filename: "src/lib/server/crm.ts"
}, (opts) => listCustomers.__executeServer(opts));
var listCustomers = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => ({
	query: input?.query?.trim() ?? "",
	page: Math.max(0, input?.page ?? 0)
})).handler(listCustomers_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "customers.read");
		const like = `%${data.query}%`;
		const offset = data.page * 40;
		const rows = await sql`
        select id, name, email, phone, classification, last_purchase_at, total_spent, avg_ticket, purchase_count, status
        from customers
        where company_id = ${tenant.companyId}
          and deleted_at is null
          and (${data.query} = '' or name ilike ${like} or coalesce(email,'') ilike ${like} or coalesce(phone,'') ilike ${like})
        order by name
        limit 40 offset ${offset}
      `;
		const [count] = await sql`
        select count(*)::int as c from customers
        where company_id = ${tenant.companyId} and deleted_at is null
          and (${data.query} = '' or name ilike ${like} or coalesce(email,'') ilike ${like} or coalesce(phone,'') ilike ${like})
      `;
		return {
			rows,
			total: count?.c ?? 0
		};
	} catch (error) {
		publicError(error);
	}
});
var getCustomer_createServerFn_handler = createServerRpc({
	id: "35971f299bb653279be97085226a50e456da075c8e2eb3ea373fcdc64e2318c8",
	name: "getCustomer",
	filename: "src/lib/server/crm.ts"
}, (opts) => getCustomer.__executeServer(opts));
var getCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.id) throw new AppError("VALIDATION", "Cliente inválido.");
	return input;
}).handler(getCustomer_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "customers.read");
		const [customer] = await sql`
        select id, name, email, phone, company_name, source, status, classification,
          consent_whatsapp, last_purchase_at, total_spent, avg_ticket, purchase_count, credit_limit
        from customers
        where id = ${data.id} and company_id = ${tenant.companyId} and deleted_at is null
      `;
		if (!customer) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
		return {
			customer,
			notes: await sql`
        select id, body, created_at, author_user_id from customer_notes
        where customer_id = ${data.id} and company_id = ${tenant.companyId}
        order by created_at desc limit 30
      `,
			events: await sql`
        select id, type, title, created_at from customer_events
        where customer_id = ${data.id} and company_id = ${tenant.companyId}
        order by created_at desc limit 40
      `,
			sales: await sql`
        select id, number, total, sold_at, status from sales
        where customer_id = ${data.id} and company_id = ${tenant.companyId}
        order by sold_at desc limit 20
      `,
			tags: await sql`
        select t.id, t.name from tags t
        join customer_tags ct on ct.tag_id = t.id and ct.company_id = t.company_id
        where ct.customer_id = ${data.id} and t.company_id = ${tenant.companyId}
      `
		};
	} catch (error) {
		publicError(error);
	}
});
var upsertCustomer_createServerFn_handler = createServerRpc({
	id: "4211db61e4296230a855ce647cd1aadfbcef8d2b64a8b456cf671bfa42a9bd6f",
	name: "upsertCustomer",
	filename: "src/lib/server/crm.ts"
}, (opts) => upsertCustomer.__executeServer(opts));
var upsertCustomer = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name) throw new AppError("VALIDATION", "Informe o nome.");
	return {
		id: input.id,
		name,
		email: input.email?.trim() || null,
		phone: input.phone?.trim() || null,
		companyName: input.companyName?.trim() || null,
		source: input.source?.trim() || null,
		consentWhatsapp: Boolean(input.consentWhatsapp),
		creditLimit: num(input.creditLimit)
	};
}).handler(upsertCustomer_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "customers.write");
		if (data.id) {
			const [prev] = await sql`
          select credit_limit from customers
          where id = ${data.id} and company_id = ${tenant.companyId}
        `;
			if (!prev) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
			await sql`
          update customers set
            name = ${data.name},
            email = ${data.email},
            phone = ${data.phone},
            company_name = ${data.companyName},
            source = ${data.source},
            consent_whatsapp = ${data.consentWhatsapp},
            credit_limit = ${data.creditLimit},
            updated_at = now()
          where id = ${data.id} and company_id = ${tenant.companyId}
        `;
			if (num(prev.credit_limit) !== data.creditLimit) await writeAudit(sql, tenant, {
				action: "update",
				entity: "customer",
				entityId: data.id,
				field: "credit_limit",
				before: String(prev.credit_limit),
				after: String(data.creditLimit)
			});
			await sql`
          insert into customer_events (company_id, customer_id, type, title, actor_user_id)
          values (${tenant.companyId}, ${data.id}, ${"updated"}, ${"Cadastro atualizado"}, ${tenant.userId})
        `;
			return { id: data.id };
		}
		const [row] = await sql`
        insert into customers (
          company_id, name, email, phone, company_name, source, consent_whatsapp, credit_limit, owner_user_id
        ) values (
          ${tenant.companyId}, ${data.name}, ${data.email}, ${data.phone}, ${data.companyName},
          ${data.source}, ${data.consentWhatsapp}, ${data.creditLimit}, ${tenant.userId}
        ) returning id
      `;
		await sql`
        insert into customer_events (company_id, customer_id, type, title, actor_user_id)
        values (${tenant.companyId}, ${row.id}, ${"created"}, ${"Cliente criado"}, ${tenant.userId})
      `;
		await writeAudit(sql, tenant, {
			action: "create",
			entity: "customer",
			entityId: row.id,
			after: data.name
		});
		return { id: row.id };
	} catch (error) {
		publicError(error);
	}
});
var addCustomerNote_createServerFn_handler = createServerRpc({
	id: "7933b8b9c80f1e30123d7d3356c4e700a5d63afc19c7e18c38fc4279bb4701af",
	name: "addCustomerNote",
	filename: "src/lib/server/crm.ts"
}, (opts) => addCustomerNote.__executeServer(opts));
var addCustomerNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const body = input.body?.trim();
	if (!body) throw new AppError("VALIDATION", "Escreva a nota.");
	return {
		customerId: input.customerId,
		body
	};
}).handler(addCustomerNote_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "customers.write");
		const [c] = await sql`
        select id from customers where id = ${data.customerId} and company_id = ${tenant.companyId}
      `;
		if (!c) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
		await sql`
        insert into customer_notes (company_id, customer_id, author_user_id, body)
        values (${tenant.companyId}, ${data.customerId}, ${tenant.userId}, ${data.body})
      `;
		await sql`
        insert into customer_events (company_id, customer_id, type, title, actor_user_id)
        values (${tenant.companyId}, ${data.customerId}, ${"note"}, ${"Nota adicionada"}, ${tenant.userId})
      `;
		return { ok: true };
	} catch (error) {
		publicError(error);
	}
});
var listLeads_createServerFn_handler = createServerRpc({
	id: "1ccf55995d7ad40b7d1f033935a65960c0b3be08c51eac67437f895ed83cad7c",
	name: "listLeads",
	filename: "src/lib/server/crm.ts"
}, (opts) => listLeads.__executeServer(opts));
var listLeads = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listLeads_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "leads.read");
		return await sql`
        select id, name, email, phone, source, status, estimated_value, last_activity_at
        from leads
        where company_id = ${tenant.companyId} and deleted_at is null
        order by coalesce(last_activity_at, created_at) desc
        limit 100
      `;
	} catch (error) {
		publicError(error);
	}
});
var upsertLead_createServerFn_handler = createServerRpc({
	id: "643b6d5ab0ef03a4aec393cf615cf15c972c2d7f88318a02de6ab61ee1d0d101",
	name: "upsertLead",
	filename: "src/lib/server/crm.ts"
}, (opts) => upsertLead.__executeServer(opts));
var upsertLead = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name) throw new AppError("VALIDATION", "Informe o nome do lead.");
	return {
		id: input.id,
		name,
		email: input.email?.trim() || null,
		phone: input.phone?.trim() || null,
		source: input.source?.trim() || null,
		estimatedValue: num(input.estimatedValue)
	};
}).handler(upsertLead_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "leads.write");
		if (data.id) {
			const [prev] = await sql`
          select id from leads where id = ${data.id} and company_id = ${tenant.companyId}
        `;
			if (!prev) throw new AppError("NOT_FOUND", "Lead não encontrado.", 404);
			await sql`
          update leads set name = ${data.name}, email = ${data.email}, phone = ${data.phone},
            source = ${data.source}, estimated_value = ${data.estimatedValue}, last_activity_at = now(), updated_at = now()
          where id = ${data.id} and company_id = ${tenant.companyId}
        `;
			return { id: data.id };
		}
		const [row] = await sql`
        insert into leads (company_id, name, email, phone, source, estimated_value, owner_user_id, last_activity_at)
        values (${tenant.companyId}, ${data.name}, ${data.email}, ${data.phone}, ${data.source}, ${data.estimatedValue}, ${tenant.userId}, now())
        returning id
      `;
		await sql`
        insert into lead_activities (company_id, lead_id, type, body, actor_user_id)
        values (${tenant.companyId}, ${row.id}, ${"created"}, ${"Lead criado"}, ${tenant.userId})
      `;
		await writeAudit(sql, tenant, {
			action: "create",
			entity: "lead",
			entityId: row.id,
			after: data.name
		});
		return { id: row.id };
	} catch (error) {
		publicError(error);
	}
});
//#endregion
export { addCustomerNote_createServerFn_handler, getCustomer_createServerFn_handler, listCustomers_createServerFn_handler, listLeads_createServerFn_handler, upsertCustomer_createServerFn_handler, upsertLead_createServerFn_handler };
