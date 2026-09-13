import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { AppError, publicError } from "@/lib/errors";
import { num } from "@/lib/utils";
import { assertPermission, requireTenant, writeAudit } from "./tenant";

export const getPipeline = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "deals.read");
      const stages = await sql<{
        id: string;
        name: string;
        slug: string;
        sort_order: number;
        is_won: boolean;
        is_lost: boolean;
      }>`
        select id, name, slug, sort_order, is_won, is_lost
        from pipeline_stages
        where company_id = ${tenant.companyId}
        order by sort_order
      `;
      const deals = await sql<{
        id: string;
        title: string;
        value: string;
        stage_id: string;
        owner_user_id: string | null;
        expected_close_at: string | null;
        customer_id: string | null;
        notes: string | null;
      }>`
        select id, title, value, stage_id, owner_user_id, expected_close_at, customer_id, notes
        from deals
        where company_id = ${tenant.companyId}
        order by updated_at desc
      `;
      const totals = stages.map((s, i) => {
        const inStage = deals.filter((d) => d.stage_id === s.id);
        const prev = i === 0 ? inStage.length : stages.slice(0, i + 1).reduce((n, st) => n + deals.filter((d) => d.stage_id === st.id).length, 0);
        return { stageId: s.id, count: inStage.length, amount: inStage.reduce((n, d) => n + num(d.value), 0), prev };
      });
      const firstCount = totals[0]?.count || 1;
      const conversion = stages.map((s, i) => ({
        stageId: s.id,
        rate: firstCount === 0 ? 0 : (deals.filter((d) => d.stage_id === s.id).length / Math.max(deals.length, 1)) * 100,
      }));
      return { stages, deals, conversion };
    } catch (error) {
      publicError(error);
    }
  });

export const moveDeal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { dealId: string; stageId: string }) => {
    if (!input.dealId || !input.stageId) throw new AppError("VALIDATION", "Oportunidade inválida.");
    return input;
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "deals.write");
      const [stage] = await sql<{ id: string; name: string; is_won: boolean }>`
        select id, name, is_won from pipeline_stages
        where id = ${data.stageId} and company_id = ${tenant.companyId}
      `;
      if (!stage) throw new AppError("NOT_FOUND", "Etapa não encontrada.", 404);
      const [deal] = await sql<{ id: string; stage_id: string }>`
        select id, stage_id from deals where id = ${data.dealId} and company_id = ${tenant.companyId}
      `;
      if (!deal) throw new AppError("NOT_FOUND", "Oportunidade não encontrada.", 404);
      await sql`
        update deals set stage_id = ${stage.id}, updated_at = now(),
          closed_at = case when ${stage.is_won} then now() else closed_at end
        where id = ${deal.id} and company_id = ${tenant.companyId}
      `;
      await sql`
        insert into deal_activities (company_id, deal_id, type, body, actor_user_id)
        values (${tenant.companyId}, ${deal.id}, ${"stage"}, ${"Movido para " + stage.name}, ${tenant.userId})
      `;
      await writeAudit(sql, tenant, {
        action: "update",
        entity: "deal",
        entityId: deal.id,
        field: "stage_id",
        before: deal.stage_id,
        after: stage.id,
      });
      return { ok: true };
    } catch (error) {
      publicError(error);
    }
  });

export const upsertDeal = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: { title: string; value: number; stageId?: string; notes?: string }) => {
    const title = input.title?.trim();
    if (!title) throw new AppError("VALIDATION", "Informe o título.");
    return { title, value: num(input.value), stageId: input.stageId, notes: input.notes?.trim() || null };
  })
  .handler(async ({ context, data }) => {
    try {
      const { sql, tenant } = await requireTenant(context.userId);
      assertPermission(tenant, "deals.write");
      const [pipeline] = await sql<{ id: string }>`
        select id from pipelines where company_id = ${tenant.companyId} order by is_default desc limit 1
      `;
      if (!pipeline) throw new AppError("VALIDATION", "Funil não configurado.");
      let stageId = data.stageId;
      if (!stageId) {
        const [first] = await sql<{ id: string }>`
          select id from pipeline_stages where company_id = ${tenant.companyId} order by sort_order limit 1
        `;
        stageId = first?.id;
      }
      const [okStage] = await sql<{ id: string }>`
        select id from pipeline_stages where id = ${stageId ?? ""} and company_id = ${tenant.companyId}
      `;
      if (!okStage) throw new AppError("VALIDATION", "Etapa inválida.");
      const [row] = await sql<{ id: string }>`
        insert into deals (company_id, pipeline_id, stage_id, title, value, owner_user_id, notes)
        values (${tenant.companyId}, ${pipeline.id}, ${okStage.id}, ${data.title}, ${data.value}, ${tenant.userId}, ${data.notes})
        returning id
      `;
      return { id: row.id };
    } catch (error) {
      publicError(error);
    }
  });
