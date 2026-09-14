import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError, t as AppError } from "./errors-nQop9poO.mjs";
import { i as writeAudit, r as requireTenant, t as assertPermission } from "./tenant-DtcaGUj6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/finance-CpOpGPgm.js
var getFinanceOverview_createServerFn_handler = createServerRpc({
	id: "5f0e243f4422070826ac47962eb8a8b70cf1b73b7dcef278ec7b840effab095d",
	name: "getFinanceOverview",
	filename: "src/lib/server/finance.ts"
}, (opts) => getFinanceOverview.__executeServer(opts));
var getFinanceOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getFinanceOverview_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "finance.read");
		const [totals] = await sql`
        select
          coalesce(sum(case when kind = 'income' and status = 'paid' then amount else 0 end), 0) as income,
          coalesce(sum(case when kind = 'expense' and status = 'paid' then amount else 0 end), 0) as expense
        from transactions
        where company_id = ${tenant.companyId}
          and occurred_at >= date_trunc('month', current_date)
      `;
		const series = await sql`
        select to_char(date_trunc('month', occurred_at), 'YYYY-MM') as month,
          coalesce(sum(case when kind = 'income' and status = 'paid' then amount else 0 end), 0) as income,
          coalesce(sum(case when kind = 'expense' and status = 'paid' then amount else 0 end), 0) as expense
        from transactions
        where company_id = ${tenant.companyId}
          and occurred_at >= (current_date - interval '6 months')
        group by 1
        order by 1
      `;
		const pending = await sql`
        select id, kind, amount, due_date, description, status
        from transactions
        where company_id = ${tenant.companyId} and status in ('pending', 'overdue')
        order by due_date nulls last
        limit 30
      `;
		const invoices = await sql`
        select id, number, amount, due_date, status, description
        from invoices
        where company_id = ${tenant.companyId}
        order by due_date desc
        limit 30
      `;
		const categories = await sql`
        select id, name, kind from transaction_categories
        where company_id = ${tenant.companyId} order by kind, name
      `;
		const income = num(totals?.income);
		const expense = num(totals?.expense);
		return {
			income,
			expense,
			profit: income - expense,
			margin: income === 0 ? 0 : (income - expense) / income * 100,
			series: series.map((s) => ({
				month: s.month,
				income: num(s.income),
				expense: num(s.expense)
			})),
			pending,
			invoices,
			categories
		};
	} catch (error) {
		publicError(error);
	}
});
var addTransaction_createServerFn_handler = createServerRpc({
	id: "dc397eda079a4b30bc0c5d76f58da53864aa941988bd8e0b3a49447d78b23517",
	name: "addTransaction",
	filename: "src/lib/server/finance.ts"
}, (opts) => addTransaction.__executeServer(opts));
var addTransaction = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const description = input.description?.trim();
	if (!description) throw new AppError("VALIDATION", "Informe a descrição.");
	const amount = num(input.amount);
	if (amount <= 0) throw new AppError("VALIDATION", "Valor inválido.");
	return {
		kind: input.kind,
		amount,
		description,
		occurredAt: input.occurredAt,
		status: input.status ?? "paid",
		categoryId: input.categoryId || null
	};
}).handler(addTransaction_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "finance.write");
		const [row] = await sql`
        insert into transactions (
          company_id, kind, amount, occurred_at, due_date, paid_at, status, description, created_by, category_id
        ) values (
          ${tenant.companyId}, ${data.kind}, ${data.amount}, ${data.occurredAt},
          ${data.status === "pending" ? data.occurredAt : null},
          ${data.status === "paid" ? data.occurredAt : null},
          ${data.status}, ${data.description}, ${tenant.userId}, ${data.categoryId}
        ) returning id
      `;
		await writeAudit(sql, tenant, {
			action: "create",
			entity: "transaction",
			entityId: row.id,
			after: `${data.kind}:${data.amount}`
		});
		return { id: row.id };
	} catch (error) {
		publicError(error);
	}
});
//#endregion
export { addTransaction_createServerFn_handler, getFinanceOverview_createServerFn_handler };
