import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { getSql } from "@/lib/db";
import { env } from "@/lib/env.server";
import { AppError, publicError } from "@/lib/errors";
import { stripeConfigured } from "@/lib/integrations/stripe";
import { whatsappConfigured } from "@/lib/integrations/whatsapp";
import { aiConfigured } from "@/lib/integrations/ai";
import { ROLE_LABELS, type RoleSlug } from "@/lib/permissions";
import { slugify } from "@/lib/utils";
import { loadTenant, requireTenant, writeAudit } from "./tenant";
import { provisionCompanyDefaults } from "./setup-company";
import { seedDemoCompany } from "./seed-demo";

function platformAdminEmail(email: string | null | undefined): boolean {
  const raw = env("PLATFORM_ADMIN_EMAILS") ?? "";
  if (!email || !raw) return false;
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .includes(email.toLowerCase());
}

export const getSessionContext = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const sql = await getSql();
      const [authUser] = await sql<{ name: string; email: string }>`
        select name, email from "user" where id = ${context.userId} limit 1
      `;
      const email = authUser?.email ?? null;
      if (platformAdminEmail(email)) {
        await sql`
          update profiles set is_platform_admin = true, full_name = coalesce(nullif(full_name, 'Usuário'), ${authUser?.name ?? "Usuário"})
          where user_id = ${context.userId}
        `;
      } else {
        await sql`
          insert into profiles (user_id, full_name)
          values (${context.userId}, ${authUser?.name ?? "Usuário"})
          on conflict (user_id) do update
            set full_name = coalesce(nullif(profiles.full_name, 'Usuário'), excluded.full_name)
        `;
      }

      const tenant = await loadTenant(context.userId);
      const unread = tenant
        ? await sql<{ c: number }>`
            select count(*)::int as c from notifications
            where company_id = ${tenant.companyId}
              and (user_id = ${context.userId} or user_id is null)
              and read_at is null
          `
        : [{ c: 0 }];

      return {
        userId: context.userId,
        name: tenant?.fullName ?? authUser?.name ?? "Usuário",
        email,
        hasCompany: Boolean(tenant),
        tenant: tenant
          ? {
              companyId: tenant.companyId,
              companyName: tenant.companyName,
              role: tenant.role,
              roleLabel: ROLE_LABELS[tenant.role],
              demoMode: tenant.demoMode,
              onboardingCompleted: tenant.onboardingCompleted,
              currency: tenant.currency,
              segment: tenant.segment,
              planSlug: tenant.planSlug,
              subscriptionStatus: tenant.subscriptionStatus,
              isPlatformAdmin: tenant.isPlatformAdmin,
            }
          : null,
        unreadNotifications: unread[0]?.c ?? 0,
        integrations: {
          stripe: stripeConfigured(),
          whatsapp: whatsappConfigured(),
          ai: aiConfigured(),
        },
      };
    } catch (error) {
      publicError(error);
    }
  });

export const createCompany = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: {
    name: string;
    segment: string;
    approxCustomers: number;
    currency: string;
    seedDemo: boolean;
  }) => {
    const name = input.name?.trim();
    if (!name || name.length < 2) throw new AppError("VALIDATION", "Informe o nome da empresa.");
    const approx = Number(input.approxCustomers) || 0;
    const currency = (input.currency || "BRL").toUpperCase();
    return {
      name,
      segment: (input.segment || "").trim(),
      approxCustomers: approx,
      currency,
      seedDemo: Boolean(input.seedDemo),
    };
  })
  .handler(async ({ context, data }) => {
    try {
      const existing = await loadTenant(context.userId);
      if (existing) {
        throw new AppError("EXISTS", "Você já possui uma empresa nesta conta.");
      }
      const sql = await getSql();
      const base = slugify(data.name) || "empresa";
      const slug = `${base}-${crypto.randomUUID().slice(0, 8)}`;
      const [company] = await sql<{ id: string }>`
        insert into companies (name, slug, segment, approx_customers, currency, created_by, onboarding_completed)
        values (${data.name}, ${slug}, ${data.segment}, ${data.approxCustomers}, ${data.currency}, ${context.userId}, ${false})
        returning id
      `;
      await sql`
        insert into company_members (company_id, user_id, role_slug, status, accepted_at)
        values (${company.id}, ${context.userId}, ${"owner"}, ${"active"}, ${new Date().toISOString()})
      `;
      await sql`
        update profiles set current_company_id = ${company.id}, full_name = coalesce(nullif(full_name, 'Usuário'), full_name)
        where user_id = ${context.userId}
      `;
      await provisionCompanyDefaults(sql, company.id, context.userId);
      if (data.seedDemo) {
        await seedDemoCompany(sql, company.id, context.userId);
      }
      const tenant = await loadTenant(context.userId);
      if (tenant) {
        await writeAudit(sql, tenant, {
          action: "create",
          entity: "company",
          entityId: company.id,
          after: data.name,
        });
      }
      return { companyId: company.id };
    } catch (error) {
      publicError(error);
    }
  });

export const completeOnboarding = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      await sql`update companies set onboarding_completed = true, updated_at = now() where id = ${tenant.companyId}`;
      return { ok: true };
    } catch (error) {
      publicError(error);
    }
  });

export const listNotifications = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      return await sql<{
        id: string;
        type: string;
        title: string;
        body: string;
        href: string | null;
        read_at: string | null;
        created_at: string;
      }>`
        select id, type, title, body, href, read_at, created_at
        from notifications
        where company_id = ${tenant.companyId}
          and (user_id = ${tenant.userId} or user_id is null)
        order by created_at desc
        limit 40
      `;
    } catch (error) {
      publicError(error);
    }
  });

export const markNotificationsRead = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      await sql`
        update notifications set read_at = now()
        where company_id = ${tenant.companyId}
          and (user_id = ${tenant.userId} or user_id is null)
          and read_at is null
      `;
      return { ok: true };
    } catch (error) {
      publicError(error);
    }
  });

export type InviteInput = { email: string; role: RoleSlug };

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: InviteInput) => {
    const email = input.email?.trim().toLowerCase();
    if (!email || !email.includes("@")) throw new AppError("VALIDATION", "E-mail inválido.");
    return { email, role: input.role };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      if (tenant.role !== "owner" && tenant.role !== "admin") {
        throw new AppError("FORBIDDEN", "Apenas administradores convidam a equipe.", 403);
      }
      const token = crypto.randomUUID();
      const expires = new Date(Date.now() + 7 * 86_400_000).toISOString();
      await sql`
        insert into invites (company_id, email, role_slug, token, invited_by, expires_at)
        values (${tenant.companyId}, ${data.email}, ${data.role}, ${token}, ${tenant.userId}, ${expires})
      `;
      await writeAudit(sql, tenant, {
        action: "invite",
        entity: "member",
        after: `${data.email}:${data.role}`,
      });
      return { token, expiresAt: expires };
    } catch (error) {
      publicError(error);
    }
  });
