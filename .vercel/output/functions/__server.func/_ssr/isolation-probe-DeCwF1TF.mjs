import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError } from "./errors-nQop9poO.mjs";
import { r as getSql } from "./db-CitYTwIy.mjs";
import { r as requireTenant } from "./tenant-DtcaGUj6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/isolation-probe-DeCwF1TF.js
/**
* Creates a throwaway company + customer, then attempts the same scoped
* lookups used by the CRM API. Must return isolated: true.
*/
var probeTenantIsolation_createServerFn_handler = createServerRpc({
	id: "9f2275ec2ed6ebad52aea273650517414e5b985fe3d6400bd26cf1612c683086",
	name: "probeTenantIsolation",
	filename: "src/lib/server/isolation-probe.ts"
}, (opts) => probeTenantIsolation.__executeServer(opts));
var probeTenantIsolation = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(probeTenantIsolation_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		const phantomCompany = crypto.randomUUID();
		const phantomCustomer = crypto.randomUUID();
		await sql`
        insert into companies (id, name, slug, status)
        values (${phantomCompany}, ${"ISOLATION_PROBE"}, ${`probe-${phantomCompany.slice(0, 8)}`}, ${"active"})
      `;
		await sql`
        insert into customers (id, company_id, name)
        values (${phantomCustomer}, ${phantomCompany}, ${"Segredo Empresa B"})
      `;
		const scoped = await sql`
        select id, name from customers
        where id = ${phantomCustomer} and company_id = ${tenant.companyId}
      `;
		const listLeak = await sql`
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
			crossTenantByName: listLeak.length
		};
	} catch (error) {
		const sql = await getSql();
		await sql`delete from customers where name = ${"Segredo Empresa B"}`;
		await sql`delete from companies where name = ${"ISOLATION_PROBE"}`;
		publicError(error);
	}
});
//#endregion
export { probeTenantIsolation_createServerFn_handler };
