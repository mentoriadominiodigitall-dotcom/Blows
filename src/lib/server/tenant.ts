import { getSql, type Sql } from "@/lib/db";
import { AppError } from "@/lib/errors";
import {
  hasPermission,
  isRoleSlug,
  type PermissionSlug,
  type RoleSlug,
} from "@/lib/permissions";

export type Tenant = {
  userId: string;
  companyId: string;
  role: RoleSlug;
  companyName: string;
  companyStatus: string;
  demoMode: boolean;
  onboardingCompleted: boolean;
  currency: string;
  timezone: string;
  segment: string | null;
  isPlatformAdmin: boolean;
  planSlug: string;
  subscriptionStatus: string;
  fullName: string | null;
  email: string | null;
};

type MemberRow = {
  company_id: string;
  role_slug: string;
  company_name: string;
  company_status: string;
  demo_mode: boolean;
  onboarding_completed: boolean;
  currency: string;
  timezone: string;
  segment: string | null;
  is_platform_admin: boolean;
  plan_slug: string | null;
  sub_status: string | null;
  full_name: string | null;
};

export async function loadTenant(userId: string, requestedCompanyId?: string): Promise<Tenant | null> {
  const sql = await getSql();
  await sql`
    insert into profiles (user_id, full_name)
    values (${userId}, ${"Usuário"})
    on conflict (user_id) do nothing
  `;

  const rows = await sql<MemberRow>`
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
      const sql2 = await getSql();
      await sql2`
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
    email: null,
  };
}

export async function requireTenant(userId: string, requestedCompanyId?: string): Promise<{
  sql: Sql;
  tenant: Tenant;
}> {
  const tenant = await loadTenant(userId, requestedCompanyId);
  if (!tenant) {
    throw new AppError("NO_COMPANY", "Complete o cadastro da empresa.", 403);
  }
  if (tenant.companyStatus === "suspended") {
    throw new AppError("SUSPENDED", "Esta conta está suspensa.", 403);
  }
  const sql = await getSql();
  return { sql, tenant };
}

export function assertPermission(tenant: Tenant, permission: PermissionSlug): void {
  if (!hasPermission(tenant.role, permission)) {
    throw new AppError("FORBIDDEN", "Você não tem permissão para esta ação.", 403);
  }
}

export function assertWritableSubscription(tenant: Tenant): void {
  if (tenant.subscriptionStatus === "unpaid" || tenant.subscriptionStatus === "cancelled") {
    throw new AppError(
      "BILLING",
      "Assinatura inativa. Regularize o plano para continuar.",
      402,
    );
  }
}

export async function writeAudit(
  sql: Sql,
  tenant: Tenant,
  input: {
    action: string;
    entity: string;
    entityId?: string | null;
    field?: string | null;
    before?: string | null;
    after?: string | null;
  },
): Promise<void> {
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
