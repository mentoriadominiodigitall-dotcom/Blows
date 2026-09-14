import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError, t as AppError } from "./errors-nQop9poO.mjs";
import { i as writeAudit, r as requireTenant, t as assertPermission } from "./tenant-DtcaGUj6.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/pipeline-CByBMpQ8.js
var getPipeline_createServerFn_handler = createServerRpc({
	id: "eedd7b9a51e93fb22bc2598d74b0ae462a5711bc1979915948e5ba2b74e8cd4a",
	name: "getPipeline",
	filename: "src/lib/server/pipeline.ts"
}, (opts) => getPipeline.__executeServer(opts));
var getPipeline = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getPipeline_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "deals.read");
		const stages = await sql`
        select id, name, slug, sort_order, is_won, is_lost
        from pipeline_stages
        where company_id = ${tenant.companyId}
        order by sort_order
      `;
		const deals = await sql`
        select id, title, value, stage_id, owner_user_id, expected_close_at, customer_id, notes
        from deals
        where company_id = ${tenant.companyId}
        order by updated_at desc
      `;
		const firstCount = stages.map((s, i) => {
			const inStage = deals.filter((d) => d.stage_id === s.id);
			const prev = i === 0 ? inStage.length : stages.slice(0, i + 1).reduce((n, st) => n + deals.filter((d) => d.stage_id === st.id).length, 0);
			return {
				stageId: s.id,
				count: inStage.length,
				amount: inStage.reduce((n, d) => n + num(d.value), 0),
				prev
			};
		})[0]?.count || 1;
		return {
			stages,
			deals,
			conversion: stages.map((s, i) => ({
				stageId: s.id,
				rate: firstCount === 0 ? 0 : deals.filter((d) => d.stage_id === s.id).length / Math.max(deals.length, 1) * 100
			}))
		};
	} catch (error) {
		publicError(error);
	}
});
var moveDeal_createServerFn_handler = createServerRpc({
	id: "22b7e70a406740e05cfd980b07e03ad2e51de77713834e4e5eb80c656984504f",
	name: "moveDeal",
	filename: "src/lib/server/pipeline.ts"
}, (opts) => moveDeal.__executeServer(opts));
var moveDeal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	if (!input.dealId || !input.stageId) throw new AppError("VALIDATION", "Oportunidade inválida.");
	return input;
}).handler(moveDeal_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "deals.write");
		const [stage] = await sql`
        select id, name, is_won from pipeline_stages
        where id = ${data.stageId} and company_id = ${tenant.companyId}
      `;
		if (!stage) throw new AppError("NOT_FOUND", "Etapa não encontrada.", 404);
		const [deal] = await sql`
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
			after: stage.id
		});
		return { ok: true };
	} catch (error) {
		publicError(error);
	}
});
var upsertDeal_createServerFn_handler = createServerRpc({
	id: "b559070a69a5633d2115f8cad42034e9f4352604e1a22b0d47629b5a3005e2a5",
	name: "upsertDeal",
	filename: "src/lib/server/pipeline.ts"
}, (opts) => upsertDeal.__executeServer(opts));
var upsertDeal = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = input.title?.trim();
	if (!title) throw new AppError("VALIDATION", "Informe o título.");
	return {
		title,
		value: num(input.value),
		stageId: input.stageId,
		notes: input.notes?.trim() || null
	};
}).handler(upsertDeal_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "deals.write");
		const [pipeline] = await sql`
        select id from pipelines where company_id = ${tenant.companyId} order by is_default desc limit 1
      `;
		if (!pipeline) throw new AppError("VALIDATION", "Funil não configurado.");
		let stageId = data.stageId;
		if (!stageId) {
			const [first] = await sql`
          select id from pipeline_stages where company_id = ${tenant.companyId} order by sort_order limit 1
        `;
			stageId = first?.id;
		}
		const [okStage] = await sql`
        select id from pipeline_stages where id = ${stageId ?? ""} and company_id = ${tenant.companyId}
      `;
		if (!okStage) throw new AppError("VALIDATION", "Etapa inválida.");
		const [row] = await sql`
        insert into deals (company_id, pipeline_id, stage_id, title, value, owner_user_id, notes)
        values (${tenant.companyId}, ${pipeline.id}, ${okStage.id}, ${data.title}, ${data.value}, ${tenant.userId}, ${data.notes})
        returning id
      `;
		return { id: row.id };
	} catch (error) {
		publicError(error);
	}
});
//#endregion
export { getPipeline_createServerFn_handler, moveDeal_createServerFn_handler, upsertDeal_createServerFn_handler };
