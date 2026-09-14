import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError, t as AppError } from "./errors-nQop9poO.mjs";
import { i as writeAudit, r as requireTenant, t as assertPermission } from "./tenant-DtcaGUj6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-BvpcNL6q.js
var listProducts_createServerFn_handler = createServerRpc({
	id: "2f3cb902609e50ac96044f7e96228fa2f59f70d4c357ba5479010af2a225aea2",
	name: "listProducts",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listProducts.__executeServer(opts));
var listProducts = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listProducts_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "products.read");
		return await sql`
        select id, name, sku, price, cost, quantity, min_quantity, active
        from products
        where company_id = ${tenant.companyId}
        order by name
      `;
	} catch (error) {
		publicError(error);
	}
});
var upsertProduct_createServerFn_handler = createServerRpc({
	id: "7f62f859e64ed1146e3ffa17ef378eb3cc1b638b8a87edd607491b7b9ac16943",
	name: "upsertProduct",
	filename: "src/lib/server/catalog.ts"
}, (opts) => upsertProduct.__executeServer(opts));
var upsertProduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const name = input.name?.trim();
	if (!name) throw new AppError("VALIDATION", "Informe o nome.");
	return {
		id: input.id,
		name,
		sku: input.sku?.trim() || null,
		price: num(input.price),
		cost: num(input.cost),
		quantity: num(input.quantity),
		minQuantity: num(input.minQuantity)
	};
}).handler(upsertProduct_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "products.write");
		if (data.id) {
			const [prev] = await sql`
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
		const [row] = await sql`
        insert into products (company_id, name, sku, price, cost, quantity, min_quantity)
        values (${tenant.companyId}, ${data.name}, ${data.sku}, ${data.price}, ${data.cost}, ${data.quantity}, ${data.minQuantity})
        returning id
      `;
		await sql`
        insert into inventory (product_id, company_id, quantity)
        values (${row.id}, ${tenant.companyId}, ${data.quantity})
      `;
		await writeAudit(sql, tenant, {
			action: "create",
			entity: "product",
			entityId: row.id,
			after: data.name
		});
		return { id: row.id };
	} catch (error) {
		publicError(error);
	}
});
var adjustInventory_createServerFn_handler = createServerRpc({
	id: "fb3284896370af61f4e25ec786c13174fbe72db360339f963c2472ad73693fb9",
	name: "adjustInventory",
	filename: "src/lib/server/catalog.ts"
}, (opts) => adjustInventory.__executeServer(opts));
var adjustInventory = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const qty = num(input.quantity);
	if (qty === 0) throw new AppError("VALIDATION", "Quantidade inválida.");
	return {
		...input,
		quantity: qty,
		reason: input.reason?.trim() || "ajuste"
	};
}).handler(adjustInventory_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "products.write");
		const [p] = await sql`
        select id, quantity from products where id = ${data.productId} and company_id = ${tenant.companyId}
      `;
		if (!p) throw new AppError("NOT_FOUND", "Produto não encontrado.", 404);
		const current = num(p.quantity);
		const next = data.type === "in" ? current + data.quantity : data.type === "out" ? current - data.quantity : data.quantity;
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
var listQuotes_createServerFn_handler = createServerRpc({
	id: "9df9ee268f73dc4b250a5f05ed2aeb2c4b9cd73f1a7687db5b294ae077de7e1a",
	name: "listQuotes",
	filename: "src/lib/server/catalog.ts"
}, (opts) => listQuotes.__executeServer(opts));
var listQuotes = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listQuotes_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "quotes.read");
		return await sql`
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
var createQuote_createServerFn_handler = createServerRpc({
	id: "b902320731d932f97b04377e0b3ec512204bedd2aa1b797c98f33d6f56715aab",
	name: "createQuote",
	filename: "src/lib/server/catalog.ts"
}, (opts) => createQuote.__executeServer(opts));
var createQuote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.items?.length) throw new AppError("VALIDATION", "Adicione itens ao orçamento.");
	return {
		customerId: input.customerId || null,
		discount: num(input.discount),
		items: input.items.map((i) => ({
			description: i.description.trim(),
			quantity: num(i.quantity),
			unitPrice: num(i.unitPrice),
			productId: i.productId || null,
			total: num(i.quantity) * num(i.unitPrice)
		}))
	};
}).handler(createQuote_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "quotes.write");
		if (data.customerId) {
			const [c] = await sql`
          select id from customers where id = ${data.customerId} and company_id = ${tenant.companyId}
        `;
			if (!c) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
		}
		const [n] = await sql`
        select coalesce(max(number), 0)::int as n from quotes where company_id = ${tenant.companyId}
      `;
		const subtotal = data.items.reduce((s, i) => s + i.total, 0);
		const total = Math.max(0, subtotal - data.discount);
		const [q] = await sql`
        insert into quotes (company_id, customer_id, number, status, subtotal, discount, total, owner_user_id)
        values (${tenant.companyId}, ${data.customerId}, ${(n?.n ?? 0) + 1}, ${"draft"}, ${subtotal}, ${data.discount}, ${total}, ${tenant.userId})
        returning id
      `;
		for (const item of data.items) await sql`
          insert into quote_items (company_id, quote_id, product_id, description, quantity, unit_price, total)
          values (${tenant.companyId}, ${q.id}, ${item.productId}, ${item.description}, ${item.quantity}, ${item.unitPrice}, ${item.total})
        `;
		await sql`
        insert into quote_status_history (company_id, quote_id, from_status, to_status, actor_user_id)
        values (${tenant.companyId}, ${q.id}, ${null}, ${"draft"}, ${tenant.userId})
      `;
		return {
			id: q.id,
			number: (n?.n ?? 0) + 1
		};
	} catch (error) {
		publicError(error);
	}
});
var updateQuoteStatus_createServerFn_handler = createServerRpc({
	id: "ca14ee8742c3b333c643df696e887df834eb428d4d069533381437496b2362a7",
	name: "updateQuoteStatus",
	filename: "src/lib/server/catalog.ts"
}, (opts) => updateQuoteStatus.__executeServer(opts));
var updateQuoteStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(updateQuoteStatus_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "quotes.write");
		const [q] = await sql`
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
//#endregion
export { adjustInventory_createServerFn_handler, createQuote_createServerFn_handler, listProducts_createServerFn_handler, listQuotes_createServerFn_handler, updateQuoteStatus_createServerFn_handler, upsertProduct_createServerFn_handler };
