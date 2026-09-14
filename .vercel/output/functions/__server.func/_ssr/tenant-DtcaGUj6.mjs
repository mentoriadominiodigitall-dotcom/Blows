import { t as AppError } from "./errors-nQop9poO.mjs";
import { r as getSql } from "./db-CitYTwIy.mjs";
import { i as isRoleSlug, r as hasPermission } from "./permissions-6R54wWQh.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/tenant-DtcaGUj6.js
async function loadTenant(userId, requestedCompanyId) {
	const sql = await getSql();
	await sql`
    insert into profiles (user_id, full_name)
    values (${userId}, ${"Usuário"})
    on conflict (user_id) do nothing
  `;
	const rows = await sql`
    select
      cm.company_id,
      cm.role_slug,
      c.name as company_name,
      c.status as company_status,
      c.demo_mode,
      c.onboarding_completed,
      c.currency,
      c.timezone,
      c.segment,
      coalesce(p.is_platform_admin, false) as is_platform_admin,
      cs.plan_slug,
      cs.status as sub_status,
      p.full_name,
      p.current_company_id
    from company_members cm
    join companies c on c.id = cm.company_id
    left join profiles p on p.user_id = cm.user_id
    left join company_subscriptions cs on cs.company_id = c.id
    where cm.user_id = ${userId}
      and cm.status = 'active'
      and c.status <> 'cancelled'
    order by
      case when p.current_company_id = cm.company_id then 0 else 1 end,
      cm.created_at asc
  `;
	if (rows.length === 0) return null;
	let row = rows[0];
	if (requestedCompanyId) {
		const match = rows.find((r) => r.company_id === requestedCompanyId);
		if (!match) {
			await (await getSql())`
        insert into security_events (user_id, type, detail)
        values (
          ${userId},
          ${"tenant_mismatch"},
          ${"Tentativa de acessar empresa sem vínculo"}
        )
      `;
			throw new AppError("FORBIDDEN", "Acesso negado.", 403);
		}
		row = match;
	}
	const role = isRoleSlug(row.role_slug) ? row.role_slug : "attendant";
	return {
		userId,
		companyId: row.company_id,
		role,
		companyName: row.company_name,
		companyStatus: row.company_status,
		demoMode: Boolean(row.demo_mode),
		onboardingCompleted: Boolean(row.onboarding_completed),
		currency: row.currency,
		timezone: row.timezone,
		segment: row.segment,
		isPlatformAdmin: Boolean(row.is_platform_admin),
		planSlug: row.plan_slug ?? "starter",
		subscriptionStatus: row.sub_status ?? "trialing",
		fullName: row.full_name,
		email: null
	};
}
async function requireTenant(userId, requestedCompanyId) {
	const tenant = await loadTenant(userId, requestedCompanyId);
	if (!tenant) throw new AppError("NO_COMPANY", "Complete o cadastro da empresa.", 403);
	if (tenant.companyStatus === "suspended") throw new AppError("SUSPENDED", "Esta conta está suspensa.", 403);
	return {
		sql: await getSql(),
		tenant
	};
}
function assertPermission(tenant, permission) {
	if (!hasPermission(tenant.role, permission)) throw new AppError("FORBIDDEN", "Você não tem permissão para esta ação.", 403);
}
async function writeAudit(sql, tenant, input) {
	await sql`
    insert into audit_logs (
      company_id, user_id, action, entity, entity_id, field, before_value, after_value
    ) values (
      ${tenant.companyId},
      ${tenant.userId},
      ${input.action},
      ${input.entity},
      ${input.entityId ?? null},
      ${input.field ?? null},
      ${input.before ?? null},
      ${input.after ?? null}
    )
  `;
}
//#endregion
export { writeAudit as i, loadTenant as n, requireTenant as r, assertPermission as t };
