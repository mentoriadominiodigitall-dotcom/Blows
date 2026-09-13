import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { AppError, publicError } from "@/lib/errors";
import { num } from "@/lib/utils";
import { assertPermission, requireTenant, writeAudit } from "./tenant";

export const listProducts = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "products.read");
      return await sql<{
        id: string;
        name: string;
        sku: string | null;
        price: string;
        cost: string;
        quantity: string;
        min_quantity: string;
        active: boolean;
      }>`
        select id, name, sku, price, cost, quantity, min_quantity, active
        from products
        where company_id = ${tenant.companyId}
        order by name
      `;
    } catch (error) {
      publicError(error);
    }
  });

export const upsertProduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id?: string; name: string; sku?: string; price: number; cost: number; quantity: number; minQuantity: number }) => {
    const name = input.name?.trim();
    if (!name) throw new AppError("VALIDATION", "Informe o nome.");
    return {
      id: input.id,
      name,
      sku: input.sku?.trim() || null,
      price: num(input.price),
      cost: num(input.cost),
      quantity: num(input.quantity),
      minQuantity: num(input.minQuantity),
    };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "products.write");
      if (data.id) {
        const [prev] = await sql<{ id: string }>`
          select id from products where id = ${data.id} and company_id = ${tenant.companyId}
        `;
        if (!prev) throw new AppError("NOT_FOUND", "Produto não encontrado.", 404);
        await sql`
          update products set name = ${data.name}, sku = ${data.sku}, price = ${data.price},
            cost = ${data.cost}, quantity = ${data.quantity}, min_quantity = ${data.minQuantity}, updated_at = now()
          where id = ${data.id} and company_id = ${tenant.companyId}
        `;
        return { id: data.id };
      }
      const [row] = await sql<{ id: string }>`
        insert into products (company_id, name, sku, price, cost, quantity, min_quantity)
        values (${tenant.companyId}, ${data.name}, ${data.sku}, ${data.price}, ${data.cost}, ${data.quantity}, ${data.minQuantity})
        returning id
      `;
      await sql`
        insert into inventory (product_id, company_id, quantity)
        values (${row.id}, ${tenant.companyId}, ${data.quantity})
      `;
      await writeAudit(sql, tenant, { action: "create", entity: "product", entityId: row.id, after: data.name });
      return { id: row.id };
    } catch (error) {
      publicError(error);
    }
  });

export const adjustInventory = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { productId: string; type: "in" | "out" | "adjust"; quantity: number; reason: string }) => {
    const qty = num(input.quantity);
    if (qty === 0) throw new AppError("VALIDATION", "Quantidade inválida.");
    return { ...input, quantity: qty, reason: input.reason?.trim() || "ajuste" };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "products.write");
      const [p] = await sql<{ id: string; quantity: string }>`
        select id, quantity from products where id = ${data.productId} and company_id = ${tenant.companyId}
      `;
      if (!p) throw new AppError("NOT_FOUND", "Produto não encontrado.", 404);
      const current = num(p.quantity);
      const next =
        data.type === "in" ? current + data.quantity : data.type === "out" ? current - data.quantity : data.quantity;
      await sql`
        update products set quantity = ${next}, updated_at = now()
        where id = ${p.id} and company_id = ${tenant.companyId}
      `;
      await sql`
        insert into inventory_movements (company_id, product_id, type, quantity, reason, actor_user_id)
        values (${tenant.companyId}, ${p.id}, ${data.type}, ${data.quantity}, ${data.reason}, ${tenant.userId})
      `;
      return { quantity: next };
    } catch (error) {
      publicError(error);
    }
  });

export const listQuotes = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "quotes.read");
      return await sql<{
        id: string;
        number: number;
        status: string;
        total: string;
        sent_at: string | null;
        valid_until: string | null;
        customer_name: string | null;
      }>`
        select q.id, q.number, q.status, q.total, q.sent_at, q.valid_until, c.name as customer_name
        from quotes q
        left join customers c on c.id = q.customer_id and c.company_id = q.company_id
        where q.company_id = ${tenant.companyId}
        order by q.created_at desc
        limit 80
      `;
    } catch (error) {
      publicError(error);
    }
  });

export const createQuote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    customerId?: string;
    items: { description: string; quantity: number; unitPrice: number; productId?: string }[];
    discount?: number;
  }) => {
    if (!input.items?.length) throw new AppError("VALIDATION", "Adicione itens ao orçamento.");
    return {
      customerId: input.customerId || null,
      discount: num(input.discount),
      items: input.items.map((i) => ({
        description: i.description.trim(),
        quantity: num(i.quantity),
        unitPrice: num(i.unitPrice),
        productId: i.productId || null,
        total: num(i.quantity) * num(i.unitPrice),
      })),
    };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "quotes.write");
      if (data.customerId) {
        const [c] = await sql<{ id: string }>`
          select id from customers where id = ${data.customerId} and company_id = ${tenant.companyId}
        `;
        if (!c) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
      }
      const [n] = await sql<{ n: number }>`
        select coalesce(max(number), 0)::int as n from quotes where company_id = ${tenant.companyId}
      `;
      const subtotal = data.items.reduce((s, i) => s + i.total, 0);
      const total = Math.max(0, subtotal - data.discount);
      const [q] = await sql<{ id: string }>`
        insert into quotes (company_id, customer_id, number, status, subtotal, discount, total, owner_user_id)
        values (${tenant.companyId}, ${data.customerId}, ${(n?.n ?? 0) + 1}, ${"draft"}, ${subtotal}, ${data.discount}, ${total}, ${tenant.userId})
        returning id
      `;
      for (const item of data.items) {
        await sql`
          insert into quote_items (company_id, quote_id, product_id, description, quantity, unit_price, total)
          values (${tenant.companyId}, ${q.id}, ${item.productId}, ${item.description}, ${item.quantity}, ${item.unitPrice}, ${item.total})
        `;
      }
      await sql`
        insert into quote_status_history (company_id, quote_id, from_status, to_status, actor_user_id)
        values (${tenant.companyId}, ${q.id}, ${null}, ${"draft"}, ${tenant.userId})
      `;
      return { id: q.id, number: (n?.n ?? 0) + 1 };
    } catch (error) {
      publicError(error);
    }
  });

export const updateQuoteStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; status: "draft" | "sent" | "viewed" | "accepted" | "rejected" | "expired" }) => input)
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "quotes.write");
      const [q] = await sql<{ id: string; status: string }>`
        select id, status from quotes where id = ${data.id} and company_id = ${tenant.companyId}
      `;
      if (!q) throw new AppError("NOT_FOUND", "Orçamento não encontrado.", 404);
      await sql`
        update quotes set status = ${data.status},
          sent_at = case when ${data.status} = 'sent' then coalesce(sent_at, now()) else sent_at end,
          viewed_at = case when ${data.status} = 'viewed' then now() else viewed_at end,
          updated_at = now()
        where id = ${q.id} and company_id = ${tenant.companyId}
      `;
      await sql`
        insert into quote_status_history (company_id, quote_id, from_status, to_status, actor_user_id)
        values (${tenant.companyId}, ${q.id}, ${q.status}, ${data.status}, ${tenant.userId})
      `;
      return { ok: true };
    } catch (error) {
      publicError(error);
    }
  });
