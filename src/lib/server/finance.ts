import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { AppError, publicError } from "@/lib/errors";
import { num } from "@/lib/utils";
import { assertPermission, requireTenant, writeAudit } from "./tenant";

export const getFinanceOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "finance.read");
      const [totals] = await sql<{ income: string; expense: string }>`
        select
          coalesce(sum(case when kind = 'income' and status = 'paid' then amount else 0 end), 0) as income,
          coalesce(sum(case when kind = 'expense' and status = 'paid' then amount else 0 end), 0) as expense
        from transactions
        where company_id = ${tenant.companyId}
          and occurred_at >= date_trunc('month', current_date)
      `;
      const series = await sql<{ month: string; income: string; expense: string }>`
        select to_char(date_trunc('month', occurred_at), 'YYYY-MM') as month,
          coalesce(sum(case when kind = 'income' and status = 'paid' then amount else 0 end), 0) as income,
          coalesce(sum(case when kind = 'expense' and status = 'paid' then amount else 0 end), 0) as expense
        from transactions
        where company_id = ${tenant.companyId}
          and occurred_at >= (current_date - interval '6 months')
        group by 1
        order by 1
      `;
      const pending = await sql<{
        id: string;
        kind: string;
        amount: string;
        due_date: string | null;
        description: string;
        status: string;
      }>`
        select id, kind, amount, due_date, description, status
        from transactions
        where company_id = ${tenant.companyId} and status in ('pending', 'overdue')
        order by due_date nulls last
        limit 30
      `;
      const invoices = await sql<{
        id: string;
        number: number;
        amount: string;
        due_date: string;
        status: string;
        description: string | null;
      }>`
        select id, number, amount, due_date, status, description
        from invoices
        where company_id = ${tenant.companyId}
        order by due_date desc
        limit 30
      `;
      const categories = await sql<{ id: string; name: string; kind: string }>`
        select id, name, kind from transaction_categories
        where company_id = ${tenant.companyId} order by kind, name
      `;
      const income = num(totals?.income);
      const expense = num(totals?.expense);
      return {
        income,
        expense,
        profit: income - expense,
        margin: income === 0 ? 0 : ((income - expense) / income) * 100,
        series: series.map((s) => ({ month: s.month, income: num(s.income), expense: num(s.expense) })),
        pending,
        invoices,
        categories,
      };
    } catch (error) {
      publicError(error);
    }
  });

export const addTransaction = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    kind: "income" | "expense";
    amount: number;
    description: string;
    occurredAt: string;
    status?: "paid" | "pending";
    categoryId?: string;
  }) => {
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
      categoryId: input.categoryId || null,
    };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "finance.write");
      const [row] = await sql<{ id: string }>`
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
        after: `${data.kind}:${data.amount}`,
      });
      return { id: row.id };
    } catch (error) {
      publicError(error);
    }
  });
