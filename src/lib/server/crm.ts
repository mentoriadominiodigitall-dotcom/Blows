import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { AppError, publicError } from "@/lib/errors";
import { num } from "@/lib/utils";
import { assertPermission, requireTenant, writeAudit } from "./tenant";

export const listCustomers = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { query?: string; page?: number } | undefined) => ({
    query: input?.query?.trim() ?? "",
    page: Math.max(0, input?.page ?? 0),
  }))
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "customers.read");
      const like = `%${data.query}%`;
      const offset = data.page * 40;
      const rows = await sql<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        classification: string;
        last_purchase_at: string | null;
        total_spent: string;
        avg_ticket: string;
        purchase_count: number;
        status: string;
      }>`
        select id, name, email, phone, classification, last_purchase_at, total_spent, avg_ticket, purchase_count, status
        from customers
        where company_id = ${tenant.companyId}
          and deleted_at is null
          and (${data.query} = '' or name ilike ${like} or coalesce(email,'') ilike ${like} or coalesce(phone,'') ilike ${like})
        order by name
        limit 40 offset ${offset}
      `;
      const [count] = await sql<{ c: number }>`
        select count(*)::int as c from customers
        where company_id = ${tenant.companyId} and deleted_at is null
          and (${data.query} = '' or name ilike ${like} or coalesce(email,'') ilike ${like} or coalesce(phone,'') ilike ${like})
      `;
      return { rows, total: count?.c ?? 0 };
    } catch (error) {
      publicError(error);
    }
  });

export const getCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => {
    if (!input.id) throw new AppError("VALIDATION", "Cliente inválido.");
    return input;
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "customers.read");
      const [customer] = await sql<Record<string, unknown>>`
        select * from customers
        where id = ${data.id} and company_id = ${tenant.companyId} and deleted_at is null
      `;
      if (!customer) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
      const notes = await sql<{ id: string; body: string; created_at: string; author_user_id: string }>`
        select id, body, created_at, author_user_id from customer_notes
        where customer_id = ${data.id} and company_id = ${tenant.companyId}
        order by created_at desc limit 30
      `;
      const events = await sql<{ id: string; type: string; title: string; created_at: string }>`
        select id, type, title, created_at from customer_events
        where customer_id = ${data.id} and company_id = ${tenant.companyId}
        order by created_at desc limit 40
      `;
      const sales = await sql<{ id: string; number: number; total: string; sold_at: string; status: string }>`
        select id, number, total, sold_at, status from sales
        where customer_id = ${data.id} and company_id = ${tenant.companyId}
        order by sold_at desc limit 20
      `;
      const tags = await sql<{ id: string; name: string }>`
        select t.id, t.name from tags t
        join customer_tags ct on ct.tag_id = t.id and ct.company_id = t.company_id
        where ct.customer_id = ${data.id} and t.company_id = ${tenant.companyId}
      `;
      return { customer, notes, events, sales, tags };
    } catch (error) {
      publicError(error);
    }
  });

export const upsertCustomer = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    companyName?: string;
    source?: string;
    consentWhatsapp?: boolean;
    creditLimit?: number;
  }) => {
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
      creditLimit: num(input.creditLimit),
    };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "customers.write");
      if (data.id) {
        const [prev] = await sql<{ credit_limit: string }>`
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
        if (num(prev.credit_limit) !== data.creditLimit) {
          await writeAudit(sql, tenant, {
            action: "update",
            entity: "customer",
            entityId: data.id,
            field: "credit_limit",
            before: String(prev.credit_limit),
            after: String(data.creditLimit),
          });
        }
        await sql`
          insert into customer_events (company_id, customer_id, type, title, actor_user_id)
          values (${tenant.companyId}, ${data.id}, ${"updated"}, ${"Cadastro atualizado"}, ${tenant.userId})
        `;
        return { id: data.id };
      }
      const [row] = await sql<{ id: string }>`
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
      await writeAudit(sql, tenant, { action: "create", entity: "customer", entityId: row.id, after: data.name });
      return { id: row.id };
    } catch (error) {
      publicError(error);
    }
  });

export const addCustomerNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { customerId: string; body: string }) => {
    const body = input.body?.trim();
    if (!body) throw new AppError("VALIDATION", "Escreva a nota.");
    return { customerId: input.customerId, body };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "customers.write");
      const [c] = await sql<{ id: string }>`
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

export const listLeads = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "leads.read");
      return await sql<{
        id: string;
        name: string;
        email: string | null;
        phone: string | null;
        source: string | null;
        status: string;
        estimated_value: string;
        last_activity_at: string | null;
      }>`
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

export const upsertLead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; name: string; email?: string; phone?: string; source?: string; estimatedValue?: number }) => {
    const name = input.name?.trim();
    if (!name) throw new AppError("VALIDATION", "Informe o nome do lead.");
    return {
      id: input.id,
      name,
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      source: input.source?.trim() || null,
      estimatedValue: num(input.estimatedValue),
    };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "leads.write");
      if (data.id) {
        const [prev] = await sql<{ id: string }>`
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
      const [row] = await sql<{ id: string }>`
        insert into leads (company_id, name, email, phone, source, estimated_value, owner_user_id, last_activity_at)
        values (${tenant.companyId}, ${data.name}, ${data.email}, ${data.phone}, ${data.source}, ${data.estimatedValue}, ${tenant.userId}, now())
        returning id
      `;
      await sql`
        insert into lead_activities (company_id, lead_id, type, body, actor_user_id)
        values (${tenant.companyId}, ${row.id}, ${"created"}, ${"Lead criado"}, ${tenant.userId})
      `;
      await writeAudit(sql, tenant, { action: "create", entity: "lead", entityId: row.id, after: data.name });
      return { id: row.id };
    } catch (error) {
      publicError(error);
    }
  });
