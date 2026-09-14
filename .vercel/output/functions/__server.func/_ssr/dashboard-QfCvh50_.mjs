import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError } from "./errors-nQop9poO.mjs";
import { r as requireTenant } from "./tenant-DtcaGUj6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/dashboard-QfCvh50_.js
var getDashboard_createServerFn_handler = createServerRpc({
	id: "9db85427a1c24a4946624e0d3df9e6cbf4f6db0a0617124b39eec33b6ee26c12",
	name: "getDashboard",
	filename: "src/lib/server/dashboard.ts"
}, (opts) => getDashboard.__executeServer(opts));
var getDashboard = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getDashboard_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		const [finance] = await sql`
        select
          coalesce(sum(case when kind = 'income' and status = 'paid' then amount else 0 end), 0) as income,
          coalesce(sum(case when kind = 'expense' and status = 'paid' then amount else 0 end), 0) as expense
        from transactions
        where company_id = ${tenant.companyId}
          and occurred_at >= date_trunc('month', current_date)
      `;
		const [sales] = await sql`
        select count(*)::int as c, coalesce(sum(total), 0) as total
        from sales
        where company_id = ${tenant.companyId}
          and sold_at >= date_trunc('month', current_date)
      `;
		const [customers] = await sql`
        select
          count(*) filter (where last_purchase_at >= now() - interval '60 days')::int as active,
          count(*) filter (where last_purchase_at < now() - interval '60 days' or last_purchase_at is null)::int as inactive
        from customers
        where company_id = ${tenant.companyId} and deleted_at is null
      `;
		const [leads] = await sql`
        select count(*)::int as c from leads
        where company_id = ${tenant.companyId} and deleted_at is null and status not in ('converted','lost')
      `;
		const [deals] = await sql`
        select count(*)::int as c, coalesce(sum(value),0) as value
        from deals d
        join pipeline_stages s on s.id = d.stage_id and s.company_id = d.company_id
        where d.company_id = ${tenant.companyId} and s.is_won = false and s.is_lost = false
      `;
		const [overdue] = await sql`
        select count(*)::int as c, coalesce(sum(amount - amount_paid),0) as amount
        from invoices
        where company_id = ${tenant.companyId} and status in ('open','overdue') and due_date < current_date
      `;
		const [settings] = await sql`
        select inactive_days from company_settings where company_id = ${tenant.companyId}
      `;
		const inactiveDays = settings?.inactive_days ?? 60;
		const [lost] = await sql`
        select coalesce((
          (select coalesce(sum(avg_ticket),0) from customers
            where company_id = ${tenant.companyId} and deleted_at is null
              and last_purchase_at < now() - (${inactiveDays}::text || ' days')::interval)
          +
          (select coalesce(sum(estimated_value),0) from leads
            where company_id = ${tenant.companyId} and deleted_at is null
              and converted_customer_id is null and status not in ('converted','lost')
              and coalesce(last_activity_at, created_at) < now() - interval '7 days')
          +
          (select coalesce(sum(total),0) from quotes
            where company_id = ${tenant.companyId} and status in ('sent','viewed')
              and sent_at < now() - interval '7 days')
          +
          (select coalesce(sum(amount - amount_paid),0) from invoices
            where company_id = ${tenant.companyId} and status in ('open','overdue') and due_date < current_date)
        ), 0) as amount
      `;
		const [campaigns] = await sql`
        select coalesce(sum(recovered_amount),0) as recovered
        from campaigns where company_id = ${tenant.companyId}
      `;
		const trend = await sql`
        select to_char(sold_at::date, 'DD/MM') as day, coalesce(sum(total),0) as total
        from sales
        where company_id = ${tenant.companyId} and sold_at >= current_date - interval '14 days'
        group by sold_at::date
        order by sold_at::date
      `;
		const team = await sql`
        select seller_user_id as user_id, coalesce(sum(total),0) as total, count(*)::int as c
        from sales
        where company_id = ${tenant.companyId} and sold_at >= date_trunc('month', current_date)
          and seller_user_id is not null
        group by seller_user_id
        order by total desc
        limit 5
      `;
		const income = num(finance?.income);
		const expense = num(finance?.expense);
		const salesCount = sales?.c ?? 0;
		const salesTotal = num(sales?.total);
		return {
			revenue: income,
			expenses: expense,
			profit: income - expense,
			salesCount,
			salesTotal,
			avgTicket: salesCount ? salesTotal / salesCount : 0,
			leads: leads?.c ?? 0,
			activeCustomers: customers?.active ?? 0,
			inactiveCustomers: customers?.inactive ?? 0,
			recovered: num(campaigns?.recovered),
			openDeals: deals?.c ?? 0,
			openDealValue: num(deals?.value),
			overdueCount: overdue?.c ?? 0,
			overdueAmount: num(overdue?.amount),
			lostMoney: num(lost?.amount),
			trend: trend.map((t) => ({
				day: t.day,
				total: num(t.total)
			})),
			team,
			empty: salesCount === 0 && income === 0
		};
	} catch (error) {
		publicError(error);
	}
});
//#endregion
export { getDashboard_createServerFn_handler };
