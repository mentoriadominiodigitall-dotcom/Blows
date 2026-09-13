import type { Sql } from "@/lib/db";

const PIPELINE = [
  { slug: "lead", name: "Lead", order: 0 },
  { slug: "contact", name: "Contato", order: 1 },
  { slug: "qualify", name: "Qualificação", order: 2 },
  { slug: "proposal", name: "Proposta", order: 3 },
  { slug: "negotiation", name: "Negociação", order: 4 },
  { slug: "won", name: "Venda", order: 5, won: true },
  { slug: "after", name: "Pós-venda", order: 6, won: true },
];

export async function provisionCompanyDefaults(
  sql: Sql,
  companyId: string,
  userId: string,
): Promise<void> {
  await sql`
    insert into company_settings (company_id)
    values (${companyId})
    on conflict (company_id) do nothing
  `;

  const trialEnd = new Date(Date.now() + 14 * 86_400_000).toISOString();
  await sql`
    insert into company_subscriptions (company_id, plan_slug, status, provider, trial_ends_at)
    values (${companyId}, ${"professional"}, ${"trialing"}, ${"manual"}, ${trialEnd})
    on conflict (company_id) do nothing
  `;

  const [pipeline] = await sql<{ id: string }>`
    insert into pipelines (company_id, name, is_default)
    values (${companyId}, ${"Vendas"}, ${true})
    returning id
  `;

  for (const stage of PIPELINE) {
    await sql`
      insert into pipeline_stages (company_id, pipeline_id, name, slug, sort_order, is_won, is_lost)
      values (
        ${companyId},
        ${pipeline.id},
        ${stage.name},
        ${stage.slug},
        ${stage.order},
        ${Boolean(stage.won)},
        ${false}
      )
    `;
  }

  const income = ["Vendas", "Serviços", "Recuperação"];
  const expense = ["Aluguel", "Folha", "Fornecedores", "Impostos", "Marketing"];
  for (const name of income) {
    await sql`
      insert into transaction_categories (company_id, name, kind)
      values (${companyId}, ${name}, ${"income"})
    `;
  }
  for (const name of expense) {
    await sql`
      insert into transaction_categories (company_id, name, kind)
      values (${companyId}, ${name}, ${"expense"})
    `;
  }

  await sql`
    insert into financial_accounts (company_id, name, kind, opening_balance)
    values (${companyId}, ${"Conta principal"}, ${"checking"}, ${0})
  `;

  for (const name of ["Pix", "Cartão", "Boleto", "Dinheiro"]) {
    await sql`
      insert into payment_methods (company_id, name) values (${companyId}, ${name})
    `;
  }

  const sources = ["Indicação", "Instagram", "Google", "WhatsApp", "Balcão"];
  for (const name of sources) {
    await sql`
      insert into lead_sources (company_id, name) values (${companyId}, ${name})
    `;
  }

  const statuses = [
    { slug: "new", name: "Novo", order: 0 },
    { slug: "contacted", name: "Contatado", order: 1 },
    { slug: "qualified", name: "Qualificado", order: 2 },
    { slug: "lost", name: "Perdido", order: 3 },
    { slug: "converted", name: "Convertido", order: 4 },
  ];
  for (const s of statuses) {
    await sql`
      insert into lead_statuses (company_id, slug, name, sort_order)
      values (${companyId}, ${s.slug}, ${s.name}, ${s.order})
    `;
  }

  await sql`
    insert into notifications (company_id, user_id, type, title, body, href)
    values (
      ${companyId},
      ${userId},
      ${"welcome"},
      ${"Bem-vindo ao REVIVA"},
      ${"O módulo Dinheiro perdido já está calculando oportunidades a partir dos seus dados."},
      ${"/app/dinheiro-perdido"}
    )
  `;
}
