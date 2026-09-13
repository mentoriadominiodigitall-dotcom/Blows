import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { publicError } from "@/lib/errors";
import { requireTenant } from "./tenant";

/**
 * Creates a throwaway company + customer, then attempts the same scoped
 * lookups used by the CRM API. Must return isolated: true.
 */
export const probeTenantIsolation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      const phantomCompany = crypto.randomUUID();
      const phantomCustomer = crypto.randomUUID();
      const slug = `probe-${phantomCompany.slice(0, 8)}`;
      await sql`
        insert into companies (id, name, slug, status)
        values (${phantomCompany}, ${"ISOLATION_PROBE"}, ${slug}, ${"active"})
      `;
      await sql`
        insert into customers (id, company_id, name)
        values (${phantomCustomer}, ${phantomCompany}, ${"Segredo Empresa B"})
      `;

      const scoped = await sql<{ id: string; name: string }>`
        select id, name from customers
        where id = ${phantomCustomer} and company_id = ${tenant.companyId}
      `;
      const listLeak = await sql<{ id: string }>`
        select id from customers
        where company_id = ${tenant.companyId} and name = ${"Segredo Empresa B"}
      `;

      await sql`delete from customers where id = ${phantomCustomer}`;
      await sql`delete from companies where id = ${phantomCompany}`;

      await sql`
        insert into security_events (company_id, user_id, type, detail)
        values (
          ${tenant.companyId},
          ${tenant.userId},
          ${"isolation_probe"},
          ${scoped.length === 0 && listLeak.length === 0 ? "pass" : "fail"}
        )
      `;

      return {
        isolated: scoped.length === 0 && listLeak.length === 0,
        crossTenantById: scoped.length,
        crossTenantByName: listLeak.length,
      };
    } catch (error) {
      const sql = await getSql();
      await sql`delete from customers where name = ${"Segredo Empresa B"}`;
      await sql`delete from companies where name = ${"ISOLATION_PROBE"}`;
      publicError(error);
    }
  });
