import { r as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
import { r as num } from "./utils-Db4STYG5.mjs";
import { t as authMiddleware } from "./middleware-BkPx-PIH.mjs";
import { n as publicError, t as AppError } from "./errors-nQop9poO.mjs";
import { t as ROLE_LABELS } from "./permissions-6R54wWQh.mjs";
import { i as writeAudit, r as requireTenant, t as assertPermission } from "./tenant-DtcaGUj6.mjs";
import { n as whatsappConfigured } from "./whatsapp-DVE5o1V0.mjs";
import { n as completeJsonPrompt, r as stripeConfigured, t as aiConfigured } from "./stripe-DI3aYGD-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ops-BF7ZBQcJ.js
var listCampaigns_createServerFn_handler = createServerRpc({
	id: "b6125d511b8b999ed4e2d6b8ddf708b9c532f70239643bf91abfd938ec78991b",
	name: "listCampaigns",
	filename: "src/lib/server/ops.ts"
}, (opts) => listCampaigns.__executeServer(opts));
var listCampaigns = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listCampaigns_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "campaigns.read");
		return {
			rows: await sql`
        select id, name, segment_key, channel, status, recovered_amount, created_at
        from campaigns
        where company_id = ${tenant.companyId}
        order by created_at desc
        limit 50
      `,
			whatsapp: whatsappConfigured()
		};
	} catch (error) {
		publicError(error);
	}
});
var getCampaign_createServerFn_handler = createServerRpc({
	id: "72e89f7827a17e0520d4586aee55e800b84ca38a1319266b60a21a8d54f4e816",
	name: "getCampaign",
	filename: "src/lib/server/ops.ts"
}, (opts) => getCampaign.__executeServer(opts));
var getCampaign = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(getCampaign_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "campaigns.read");
		const [campaign] = await sql`
        select id, name, segment_key, channel, message, status, recovered_amount, created_at
        from campaigns where id = ${data.id} and company_id = ${tenant.companyId}
      `;
		if (!campaign) throw new AppError("NOT_FOUND", "Campanha não encontrada.", 404);
		return {
			campaign,
			recipients: await sql`
        select id, name, status, estimated_value, consent, result
        from campaign_recipients
        where campaign_id = ${data.id} and company_id = ${tenant.companyId}
      `,
			whatsapp: whatsappConfigured()
		};
	} catch (error) {
		publicError(error);
	}
});
var listAppointments_createServerFn_handler = createServerRpc({
	id: "38aaac3a4b0ccafe4fc0390c0bea4a84d9911b6706acbfeb51bca27adb15d2aa",
	name: "listAppointments",
	filename: "src/lib/server/ops.ts"
}, (opts) => listAppointments.__executeServer(opts));
var listAppointments = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAppointments_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		return await sql`
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
var createAppointment_createServerFn_handler = createServerRpc({
	id: "63430134a1a459660f8dabec2d55d61937178835f141a9660757debf7ec8dda7",
	name: "createAppointment",
	filename: "src/lib/server/ops.ts"
}, (opts) => createAppointment.__executeServer(opts));
var createAppointment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const title = input.title?.trim();
	if (!title) throw new AppError("VALIDATION", "Informe o compromisso.");
	return {
		title,
		startsAt: input.startsAt,
		endsAt: input.endsAt,
		customerId: input.customerId || null
	};
}).handler(createAppointment_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		if (data.customerId) {
			const [c] = await sql`
          select id from customers where id = ${data.customerId} and company_id = ${tenant.companyId}
        `;
			if (!c) throw new AppError("NOT_FOUND", "Cliente não encontrado.", 404);
		}
		const [row] = await sql`
        insert into appointments (company_id, customer_id, title, starts_at, ends_at, owner_user_id)
        values (${tenant.companyId}, ${data.customerId}, ${data.title}, ${data.startsAt}, ${data.endsAt}, ${tenant.userId})
        returning id
      `;
		return { id: row.id };
	} catch (error) {
		publicError(error);
	}
});
var listLoyalty_createServerFn_handler = createServerRpc({
	id: "e39835f98ee343e2d6389b829ceef2da6f60f8bb8503601864f88fbba3437997",
	name: "listLoyalty",
	filename: "src/lib/server/ops.ts"
}, (opts) => listLoyalty.__executeServer(opts));
var listLoyalty = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listLoyalty_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		return {
			accounts: await sql`
        select la.id, la.points, la.tier, c.name as customer_name
        from loyalty_accounts la
        join customers c on c.id = la.customer_id and c.company_id = la.company_id
        where la.company_id = ${tenant.companyId}
        order by la.points desc
        limit 50
      `,
			rewards: await sql`
        select id, name, points_cost, active from rewards
        where company_id = ${tenant.companyId} order by points_cost
      `
		};
	} catch (error) {
		publicError(error);
	}
});
var listAutomations_createServerFn_handler = createServerRpc({
	id: "ce97f4916df89b0f41e3dcfb821cc788e839176d785d77b0e8f6fd63804aef5c",
	name: "listAutomations",
	filename: "src/lib/server/ops.ts"
}, (opts) => listAutomations.__executeServer(opts));
var listAutomations = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAutomations_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "automations.read");
		return await sql`
        select id, name, enabled, trigger_key from automations
        where company_id = ${tenant.companyId}
        order by created_at desc
      `;
	} catch (error) {
		publicError(error);
	}
});
var toggleAutomation_createServerFn_handler = createServerRpc({
	id: "7b3a8adf5c39d507400299108d21b285e561dfd88968d73f24125829d86b6592",
	name: "toggleAutomation",
	filename: "src/lib/server/ops.ts"
}, (opts) => toggleAutomation.__executeServer(opts));
var toggleAutomation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(toggleAutomation_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "automations.write");
		const [row] = await sql`
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
			after: String(data.enabled)
		});
		return { ok: true };
	} catch (error) {
		publicError(error);
	}
});
var getTeam_createServerFn_handler = createServerRpc({
	id: "e39ec37ed6f88a235ce700d8ddcc5a464507febff938eda4ac29feafcf08ffaf",
	name: "getTeam",
	filename: "src/lib/server/ops.ts"
}, (opts) => getTeam.__executeServer(opts));
var getTeam = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getTeam_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "team.read");
		const members = await sql`
        select cm.user_id, cm.role_slug, cm.status, p.full_name
        from company_members cm
        left join profiles p on p.user_id = cm.user_id
        where cm.company_id = ${tenant.companyId}
        order by cm.created_at
      `;
		const sales = await sql`
        select seller_user_id as user_id, coalesce(sum(total),0) as total, count(*)::int as c
        from sales
        where company_id = ${tenant.companyId} and sold_at >= date_trunc('month', current_date)
        group by seller_user_id
      `;
		const goals = await sql`
        select id, name, target, user_id from goals where company_id = ${tenant.companyId}
      `;
		const invites = await sql`
        select id, email, role_slug, expires_at, accepted_at from invites
        where company_id = ${tenant.companyId} order by created_at desc limit 20
      `;
		return {
			members: members.map((m) => ({
				...m,
				roleLabel: ROLE_LABELS[m.role_slug] ?? m.role_slug,
				sales: num(sales.find((s) => s.user_id === m.user_id)?.total),
				salesCount: sales.find((s) => s.user_id === m.user_id)?.c ?? 0
			})),
			goals,
			invites
		};
	} catch (error) {
		publicError(error);
	}
});
var listAudit_createServerFn_handler = createServerRpc({
	id: "8d08f52a174f68a31c70995677e3291f2eb25048b32a9bd5aa9bcf558ce71cb8",
	name: "listAudit",
	filename: "src/lib/server/ops.ts"
}, (opts) => listAudit.__executeServer(opts));
var listAudit = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listAudit_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "audit.read");
		return await sql`
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
var getBilling_createServerFn_handler = createServerRpc({
	id: "a4335eeb07579f2ccccf5031362bbeddc8c2423de5ee3f5eb4383f14ef48b855",
	name: "getBilling",
	filename: "src/lib/server/ops.ts"
}, (opts) => getBilling.__executeServer(opts));
var getBilling = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(getBilling_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		const serializablePlans = (await sql`
        select slug, name, price_cents, description, coalesce(features, '[]'::jsonb) as features from plans order by sort_order
      `).map((p) => ({
			...p,
			features: Array.isArray(p.features) ? p.features.map((f) => String(f)) : []
		}));
		const [sub] = await sql`
        select plan_slug, status, trial_ends_at, current_period_end
        from company_subscriptions where company_id = ${tenant.companyId}
      `;
		return {
			plans: serializablePlans,
			subscription: sub ?? null,
			stripe: stripeConfigured()
		};
	} catch (error) {
		publicError(error);
	}
});
var changePlan_createServerFn_handler = createServerRpc({
	id: "13de89879cf7de87177945887ff0361fc7aaf3e8ca5a2df46f9db3256a3a9bd7",
	name: "changePlan",
	filename: "src/lib/server/ops.ts"
}, (opts) => changePlan.__executeServer(opts));
var changePlan = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(changePlan_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "billing.manage");
		const [plan] = await sql`select slug from plans where slug = ${data.planSlug}`;
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
				after: plan.slug
			});
			return {
				ok: true,
				stripe: false,
				note: "Plano atualizado internamente. Checkout Stripe exige configuração."
			};
		}
		return {
			ok: false,
			stripe: true,
			note: "Checkout Stripe ainda precisa dos price IDs."
		};
	} catch (error) {
		publicError(error);
	}
});
var runAi_createServerFn_handler = createServerRpc({
	id: "faced4f2a37b1676954439090ad0bd5a4fdf77df06ad2bb85d4185cd0d1ad683",
	name: "runAi",
	filename: "src/lib/server/ops.ts"
}, (opts) => runAi.__executeServer(opts));
var runAi = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(runAi_createServerFn_handler, async ({ context, data }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		assertPermission(tenant, "ai.use");
		if (!aiConfigured()) return {
			ok: false,
			reason: "not_configured"
		};
		let packed = "";
		if (data.kind === "recovery" || data.kind === "campaign") {
			const rows = await sql`
          select name, avg_ticket, last_purchase_at from customers
          where company_id = ${tenant.companyId} and deleted_at is null
            and last_purchase_at < now() - interval '60 days'
          order by avg_ticket desc limit 8
        `;
			packed = JSON.stringify(rows);
		} else if (data.kind === "sales") {
			const rows = await sql`
          select s.name, coalesce(sum(d.value),0) as value
          from pipeline_stages s
          left join deals d on d.stage_id = s.id and d.company_id = s.company_id
          where s.company_id = ${tenant.companyId}
          group by s.name, s.sort_order order by s.sort_order
        `;
			packed = JSON.stringify(rows);
		} else if (data.kind === "finance") {
			const [row] = await sql`
          select
            coalesce(sum(case when kind='income' and status='paid' then amount else 0 end),0) as income,
            coalesce(sum(case when kind='expense' and status='paid' then amount else 0 end),0) as expense
          from transactions
          where company_id = ${tenant.companyId} and occurred_at >= date_trunc('month', current_date)
        `;
			packed = JSON.stringify(row);
		} else {
			const [row] = await sql`
          select
            (select count(*) from customers where company_id = ${tenant.companyId} and deleted_at is null)::int as customers,
            (select coalesce(sum(total),0) from sales where company_id = ${tenant.companyId} and sold_at >= date_trunc('month', current_date)) as sales
        `;
			packed = JSON.stringify(row);
		}
		const system = "Você é a IA do REVIVA, plataforma que recupera receita parada de PMEs brasileiras. Responda em português, objetivo, com recomendações acionáveis. Sempre explique de onde veio cada recomendação com base nos dados fornecidos. Não invente números. Nunca sugira apagar dados.";
		const user = `Tipo: ${data.kind}\nEmpresa: ${tenant.companyName}\nDados (já filtrados pela empresa, sem PII além do primeiro nome comercial):\n${packed}`;
		const result = await completeJsonPrompt(system, user);
		if (!result.ok) return {
			ok: false,
			reason: result.reason
		};
		await writeAudit(sql, tenant, {
			action: "ai",
			entity: "insight",
			after: data.kind
		});
		return {
			ok: true,
			text: result.text,
			model: result.model
		};
	} catch (error) {
		publicError(error);
	}
});
var platformOverview_createServerFn_handler = createServerRpc({
	id: "69e4060bc94b8fd7c758b69f647800fbf001e88fee1e7f8ff1440143c7c56333",
	name: "platformOverview",
	filename: "src/lib/server/ops.ts"
}, (opts) => platformOverview.__executeServer(opts));
var platformOverview = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(platformOverview_createServerFn_handler, async ({ context }) => {
	try {
		const { sql, tenant } = await requireTenant(context.userId);
		if (!tenant.isPlatformAdmin) throw new AppError("FORBIDDEN", "Acesso restrito à plataforma.", 403);
		const companies = await sql`
        select c.id, c.name, c.status, c.created_at, cs.plan_slug, cs.status as sub_status
        from companies c
        left join company_subscriptions cs on cs.company_id = c.id
        order by c.created_at desc
        limit 50
      `;
		const [users] = await sql`select count(*)::int as c from "user"`;
		const events = await sql`
        select id, type, detail, created_at from security_events order by created_at desc limit 30
      `;
		return {
			companies,
			users: users?.c ?? 0,
			events
		};
	} catch (error) {
		publicError(error);
	}
});
var setCompanyStatus_createServerFn_handler = createServerRpc({
	id: "a81b2999beec96540f04dbe311c8d1c6d84727bbbadb75718e20e54ccba60aa8",
	name: "setCompanyStatus",
	filename: "src/lib/server/ops.ts"
}, (opts) => setCompanyStatus.__executeServer(opts));
var setCompanyStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => input).handler(setCompanyStatus_createServerFn_handler, async ({ context, data }) => {
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
			after: data.status
		});
		return { ok: true };
	} catch (error) {
		publicError(error);
	}
});
//#endregion
export { changePlan_createServerFn_handler, createAppointment_createServerFn_handler, getBilling_createServerFn_handler, getCampaign_createServerFn_handler, getTeam_createServerFn_handler, listAppointments_createServerFn_handler, listAudit_createServerFn_handler, listAutomations_createServerFn_handler, listCampaigns_createServerFn_handler, listLoyalty_createServerFn_handler, platformOverview_createServerFn_handler, runAi_createServerFn_handler, setCompanyStatus_createServerFn_handler, toggleAutomation_createServerFn_handler };
