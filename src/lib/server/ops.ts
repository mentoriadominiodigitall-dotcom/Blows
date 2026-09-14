import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { AppError, publicError } from "@/lib/errors";
import { aiConfigured, completeJsonPrompt } from "@/lib/integrations/ai";
import { stripeConfigured } from "@/lib/integrations/stripe";
import { whatsappConfigured } from "@/lib/integrations/whatsapp";
import { num } from "@/lib/utils";
import { ROLE_LABELS, type RoleSlug } from "@/lib/permissions";
import { assertPermission, requireTenant, writeAudit } from "./tenant";

export const listCampaigns = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "campaigns.read");
      const rows = await sql<{
        id: string;
        name: string;
        segment_key: string;
        channel: string;
        status: string;
        recovered_amount: string;
        created_at: string;
      }>`
        select id, name, segment_key, channel, status, recovered_amount, created_at
        from campaigns
        where company_id = ${tenant.companyId}
        order by created_at desc
        limit 50
      `;
      return { rows, whatsapp: whatsappConfigured() };
    } catch (error) {
      publicError(error);
    }
  });

export const getCampaign = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "campaigns.read");
      const [campaign] = await sql<{
        id: string;
        name: string;
        segment_key: string;
        channel: string;
        message: string;
        status: string;
        recovered_amount: string;
        created_at: string;
      }>`
        select id, name, segment_key, channel, message, status, recovered_amount, created_at
        from campaigns where id = ${data.id} and company_id = ${tenant.companyId}
      `;
      if (!campaign) throw new AppError("NOT_FOUND", "Campanha não encontrada.", 404);
      const recipients = await sql<{
        id: string;
        name: string;
        status: string;
        estimated_value: string;
        consent: boolean;
        result: string | null;
      }>`
        select id, name, status, estimated_value, consent, result
        from campaign_recipients
        where campaign_id = ${data.id} and company_id = ${tenant.companyId}
      `;
      return { campaign, recipients, whatsapp: whatsappConfigured() };
    } catch (error) {
      publicError(error);
    }
  });

export const listAppointments = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      return await sql<{
        id: string;
        title: string;
        starts_at: string;
        ends_at: string;
        status: string;
        customer_name: string | null;
      }>`
        select a.id, a.title, a.starts_at, a.ends_at, a.status, c.name as customer_name
        from appointments a
        left join customers c on c.id = a.customer_id and c.company_id = a.company_id
        where a.company_id = ${tenant.companyId}
        order by a.starts_at
        limit 80
      `;
    } catch (error) {
      publicError(error);
    }
  });

export const createAppointment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; startsAt: string; endsAt: string; customerId?: string }) => {
    const title = input.title?.trim();
    if (!title) throw new AppError("VALIDATION", "Informe o compromisso.");
    return { title, startsAt: input.startsAt, endsAt: input.endsAt, customerId: input.customerId || null };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      if (data.customerId) {
        const [c] = await sql<{ id: string }>`
          select id from customers where id = ${data.customerId} and company_id = ${tenant.companyId}
        `;
        if (!c) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
      }
      const [row] = await sql<{ id: string }>`
        insert into appointments (company_id, customer_id, title, starts_at, ends_at, owner_user_id)
        values (${tenant.companyId}, ${data.customerId}, ${data.title}, ${data.startsAt}, ${data.endsAt}, ${tenant.userId})
        returning id
      `;
      return { id: row.id };
    } catch (error) {
      publicError(error);
    }
  });

export const listLoyalty = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      const accounts = await sql<{
        id: string;
        points: number;
        tier: string;
        customer_name: string;
      }>`
        select la.id, la.points, la.tier, c.name as customer_name
        from loyalty_accounts la
        join customers c on c.id = la.customer_id and c.company_id = la.company_id
        where la.company_id = ${tenant.companyId}
        order by la.points desc
        limit 50
      `;
      const rewards = await sql<{ id: string; name: string; points_cost: number; active: boolean }>`
        select id, name, points_cost, active from rewards
        where company_id = ${tenant.companyId} order by points_cost
      `;
      return { accounts, rewards };
    } catch (error) {
      publicError(error);
    }
  });

export const listAutomations = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "automations.read");
      return await sql<{
        id: string;
        name: string;
        enabled: boolean;
        trigger_key: string;
      }>`
        select id, name, enabled, trigger_key from automations
        where company_id = ${tenant.companyId}
        order by created_at desc
      `;
    } catch (error) {
      publicError(error);
    }
  });

export const toggleAutomation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { id: string; enabled: boolean }) => input)
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "automations.write");
      const [row] = await sql<{ id: string }>`
        update automations set enabled = ${data.enabled}
        where id = ${data.id} and company_id = ${tenant.companyId}
        returning id
      `;
      if (!row) throw new AppError("NOT_FOUND", "Automação não encontrada.", 404);
      await writeAudit(sql, tenant, {
        action: "update",
        entity: "automation",
        entityId: row.id,
        field: "enabled",
        after: String(data.enabled),
      });
      return { ok: true };
    } catch (error) {
      publicError(error);
    }
  });

export const getTeam = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "team.read");
      const members = await sql<{
        user_id: string;
        role_slug: string;
        status: string;
        full_name: string | null;
      }>`
        select cm.user_id, cm.role_slug, cm.status, p.full_name
        from company_members cm
        left join profiles p on p.user_id = cm.user_id
        where cm.company_id = ${tenant.companyId}
        order by cm.created_at
      `;
      const sales = await sql<{ user_id: string; total: string; c: number }>`
        select seller_user_id as user_id, coalesce(sum(total),0) as total, count(*)::int as c
        from sales
        where company_id = ${tenant.companyId} and sold_at >= date_trunc('month', current_date)
        group by seller_user_id
      `;
      const goals = await sql<{ id: string; name: string; target: string; user_id: string | null }>`
        select id, name, target, user_id from goals where company_id = ${tenant.companyId}
      `;
      const invites = await sql<{ id: string; email: string; role_slug: string; expires_at: string; accepted_at: string | null }>`
        select id, email, role_slug, expires_at, accepted_at from invites
        where company_id = ${tenant.companyId} order by created_at desc limit 20
      `;
      return {
        members: members.map((m) => ({
          ...m,
          roleLabel: ROLE_LABELS[m.role_slug as RoleSlug] ?? m.role_slug,
          sales: num(sales.find((s) => s.user_id === m.user_id)?.total),
          salesCount: sales.find((s) => s.user_id === m.user_id)?.c ?? 0,
        })),
        goals,
        invites,
      };
    } catch (error) {
      publicError(error);
    }
  });

export const listAudit = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "audit.read");
      return await sql<{
        id: string;
        action: string;
        entity: string;
        entity_id: string | null;
        field: string | null;
        before_value: string | null;
        after_value: string | null;
        user_id: string | null;
        created_at: string;
      }>`
        select id, action, entity, entity_id, field, before_value, after_value, user_id, created_at
        from audit_logs
        where company_id = ${tenant.companyId}
        order by created_at desc
        limit 80
      `;
    } catch (error) {
      publicError(error);
    }
  });

export const getBilling = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      const plans = await sql<{
        slug: string;
        name: string;
        price_cents: number;
        description: string | null;
        features: string[];
      }>`
        select slug, name, price_cents, description, coalesce(features, '[]'::jsonb) as features from plans order by sort_order
      `;
      const serializablePlans = plans.map((p) => ({
        ...p,
        features: Array.isArray(p.features) ? p.features.map((f) => String(f)) : [],
      }));
      const [sub] = await sql<{
        plan_slug: string;
        status: string;
        trial_ends_at: string | null;
        current_period_end: string | null;
      }>`
        select plan_slug, status, trial_ends_at, current_period_end
        from company_subscriptions where company_id = ${tenant.companyId}
      `;
      return { plans: serializablePlans, subscription: sub ?? null, stripe: stripeConfigured() };
    } catch (error) {
      publicError(error);
    }
  });

export const changePlan = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { planSlug: string }) => input)
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "billing.manage");
      const [plan] = await sql<{ slug: string }>`select slug from plans where slug = ${data.planSlug}`;
      if (!plan) throw new AppError("VALIDATION", "Plano inválido.");
      if (!stripeConfigured()) {
        await sql`
          update company_subscriptions
          set plan_slug = ${plan.slug}, updated_at = now()
          where company_id = ${tenant.companyId}
        `;
        await writeAudit(sql, tenant, {
          action: "update",
          entity: "subscription",
          field: "plan_slug",
          after: plan.slug,
        });
        return { ok: true as const, stripe: false, note: "Plano atualizado internamente. Checkout Stripe exige configuração." };
      }
      return { ok: false as const, stripe: true, note: "Checkout Stripe ainda precisa dos price IDs." };
    } catch (error) {
      publicError(error);
    }
  });

type AiKind = "recovery" | "sales" | "finance" | "management" | "campaign" | "forecast";

export const runAi = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { kind: AiKind }) => input)
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "ai.use");
      if (!aiConfigured()) {
        return { ok: false as const, reason: "not_configured" as const };
      }

      let packed = "";
      if (data.kind === "recovery" || data.kind === "campaign") {
        const rows = await sql<{ name: string; avg_ticket: string; last_purchase_at: string | null }>`
          select name, avg_ticket, last_purchase_at from customers
          where company_id = ${tenant.companyId} and deleted_at is null
            and last_purchase_at < now() - interval '60 days'
          order by avg_ticket desc limit 8
        `;
        packed = JSON.stringify(rows);
      } else if (data.kind === "sales") {
        const rows = await sql<{ name: string; value: string }>`
          select s.name, coalesce(sum(d.value),0) as value
          from pipeline_stages s
          left join deals d on d.stage_id = s.id and d.company_id = s.company_id
          where s.company_id = ${tenant.companyId}
          group by s.name, s.sort_order order by s.sort_order
        `;
        packed = JSON.stringify(rows);
      } else if (data.kind === "finance") {
        const [row] = await sql<{ income: string; expense: string }>`
          select
            coalesce(sum(case when kind='income' and status='paid' then amount else 0 end),0) as income,
            coalesce(sum(case when kind='expense' and status='paid' then amount else 0 end),0) as expense
          from transactions
          where company_id = ${tenant.companyId} and occurred_at >= date_trunc('month', current_date)
        `;
        packed = JSON.stringify(row);
      } else {
        const [row] = await sql<{ customers: number; sales: string }>`
          select
            (select count(*) from customers where company_id = ${tenant.companyId} and deleted_at is null)::int as customers,
            (select coalesce(sum(total),0) from sales where company_id = ${tenant.companyId} and sold_at >= date_trunc('month', current_date)) as sales
        `;
        packed = JSON.stringify(row);
      }

      const system =
        "Você é a IA do REVIVA, plataforma que recupera receita parada de PMEs brasileiras. Responda em português, objetivo, com recomendações acionáveis. Sempre explique de onde veio cada recomendação com base nos dados fornecidos. Não invente números. Nunca sugira apagar dados.";
      const user = `Tipo: ${data.kind}\nEmpresa: ${tenant.companyName}\nDados (já filtrados pela empresa, sem PII além do primeiro nome comercial):\n${packed}`;
      const result = await completeJsonPrompt(system, user);
      if (!result.ok) return { ok: false as const, reason: result.reason };
      await writeAudit(sql, tenant, { action: "ai", entity: "insight", after: data.kind });
      return { ok: true as const, text: result.text, model: result.model };
    } catch (error) {
      publicError(error);
    }
  });

export const platformOverview = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      if (!tenant.isPlatformAdmin) {
        throw new AppError("FORBIDDEN", "Acesso restrito à plataforma.", 403);
      }
      const companies = await sql<{
        id: string;
        name: string;
        status: string;
        created_at: string;
        plan_slug: string | null;
        sub_status: string | null;
      }>`
        select c.id, c.name, c.status, c.created_at, cs.plan_slug, cs.status as sub_status
        from companies c
        left join company_subscriptions cs on cs.company_id = c.id
        order by c.created_at desc
        limit 50
      `;
      const [users] = await sql<{ c: number }>`select count(*)::int as c from "user"`;
      const events = await sql<{ id: string; type: string; detail: string | null; created_at: string }>`
        select id, type, detail, created_at from security_events order by created_at desc limit 30
      `;
      return { companies, users: users?.c ?? 0, events };
    } catch (error) {
      publicError(error);
    }
  });

export const setCompanyStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { companyId: string; status: "active" | "suspended" }) => input)
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      if (!tenant.isPlatformAdmin) throw new AppError("FORBIDDEN", "Acesso restrito.", 403);
      await sql`update companies set status = ${data.status}, updated_at = now() where id = ${data.companyId}`;
      await sql`
        insert into security_events (company_id, user_id, type, detail)
        values (${data.companyId}, ${tenant.userId}, ${"company_status"}, ${data.status})
      `;
      await writeAudit(sql, tenant, {
        action: "admin",
        entity: "company",
        entityId: data.companyId,
        field: "status",
        after: data.status,
      });
      return { ok: true };
    } catch (error) {
      publicError(error);
    }
  });
