import type { Sql } from "@/lib/db";

function daysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function dateAgo(days: number): string {
  return daysAgo(days).slice(0, 10);
}

export async function seedDemoCompany(sql: Sql, companyId: string, userId: string): Promise<void> {
  const existing = await sql<{ c: number }>`
    select count(*)::int as c from customers where company_id = ${companyId}
  `;
  if ((existing[0]?.c ?? 0) > 0) return;

  const tags = await Promise.all(
    ["VIP", "Recorrente", "Inativo", "B2B"].map(async (name) => {
      const [row] = await sql<{ id: string }>`
        insert into tags (company_id, name) values (${companyId}, ${name}) returning id
      `;
      return { name, id: row.id };
    }),
  );
  const tag = (name: string) => tags.find((t) => t.name === name)!.id;

  type Cust = { name: string; email: string; phone: string; last: number; spent: number; count: number; ticket: number; interval: number | null; class: string; consent: boolean };
  const customers: Cust[] = [
    { name: "Ana Ribeiro", email: "ana.ribeiro@email.com", phone: "11987651001", last: 78, spent: 3920, count: 4, ticket: 980, interval: 45, class: "at_risk", consent: true },
    { name: "Marcos Pires", email: "marcos.pires@email.com", phone: "11987651002", last: 91, spent: 2160, count: 3, ticket: 720, interval: 40, class: "lost", consent: true },
    { name: "Padaria São Bento", email: "contato@saobento.com", phone: "1130910001", last: 64, spent: 8400, count: 4, ticket: 2100, interval: 30, class: "at_risk", consent: true },
    { name: "Helena Costa", email: "helena.costa@email.com", phone: "11987651003", last: 102, spent: 1600, count: 4, ticket: 400, interval: 35, class: "lost", consent: false },
    { name: "Bruno Lima", email: "bruno.lima@email.com", phone: "11987651004", last: 12, spent: 2700, count: 6, ticket: 450, interval: 18, class: "vip", consent: true },
    { name: "Carla Mendes", email: "carla.mendes@email.com", phone: "11987651005", last: 6, spent: 980, count: 2, ticket: 490, interval: 20, class: "regular", consent: true },
    { name: "Eduardo Nogueira", email: "eduardo.n@email.com", phone: "11987651006", last: 38, spent: 1500, count: 5, ticket: 300, interval: 21, class: "at_risk", consent: true },
    { name: "Farmácia Central", email: "compras@farmaciacentral.com", phone: "1130910002", last: 8, spent: 6200, count: 8, ticket: 775, interval: 14, class: "vip", consent: true },
    { name: "Sofia Martins", email: "sofia.martins@email.com", phone: "11987651007", last: 21, spent: 890, count: 1, ticket: 890, interval: null, class: "new", consent: true },
    { name: "Igor Azevedo", email: "igor.azevedo@email.com", phone: "11987651008", last: 48, spent: 1200, count: 3, ticket: 400, interval: 22, class: "at_risk", consent: true },
  ];

  const customerIds: Record<string, string> = {};
  for (const c of customers) {
    const [row] = await sql<{ id: string }>`
      insert into customers (
        company_id, name, email, phone, source, status, classification,
        consent_whatsapp, consent_email, last_purchase_at, total_spent,
        purchase_count, avg_ticket, avg_interval_days, owner_user_id
      ) values (
        ${companyId}, ${c.name}, ${c.email}, ${c.phone}, ${"Indicação"}, ${"active"}, ${c.class},
        ${c.consent}, ${true}, ${daysAgo(c.last)}, ${c.spent},
        ${c.count}, ${c.ticket}, ${c.interval}, ${userId}
      ) returning id
    `;
    customerIds[c.name] = row.id;
    if (c.class === "vip") {
      await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("VIP")}, ${companyId})`;
    }
    if (c.last > 60) {
      await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("Inativo")}, ${companyId})`;
    }
    if (c.count >= 3) {
      await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("Recorrente")}, ${companyId})`;
    }
    if (c.name.includes("Padaria") || c.name.includes("Farmácia")) {
      await sql`insert into customer_tags (customer_id, tag_id, company_id) values (${row.id}, ${tag("B2B")}, ${companyId})`;
    }
    await sql`
      insert into customer_events (company_id, customer_id, type, title, actor_user_id)
      values (${companyId}, ${row.id}, ${"created"}, ${"Cliente cadastrado"}, ${userId})
    `;
    await sql`
      insert into loyalty_accounts (company_id, customer_id, points, tier)
      values (${companyId}, ${row.id}, ${Math.round(c.spent / 10)}, ${c.class === "vip" ? "gold" : "bronze"})
    `;
  }

  const cats = ["Consultas", "Tratamentos", "Estética", "Produtos"];
  const catIds: string[] = [];
  for (const name of cats) {
    const [row] = await sql<{ id: string }>`
      insert into product_categories (company_id, name) values (${companyId}, ${name}) returning id
    `;
    catIds.push(row.id);
  }

  const products = [
    { name: "Consulta de retorno", sku: "CON-001", price: 280, cost: 80, qty: 999, cat: 0 },
    { name: "Limpeza completa", sku: "TRT-010", price: 420, cost: 120, qty: 999, cat: 1 },
    { name: "Clareamento", sku: "EST-003", price: 1850, cost: 480, qty: 12, cat: 2 },
    { name: "Kit higiene", sku: "PRD-022", price: 89, cost: 32, qty: 4, cat: 3 },
    { name: "Prótese parcial", sku: "TRT-040", price: 1000, cost: 410, qty: 6, cat: 1 },
    { name: "Manutenção aparelho", sku: "TRT-018", price: 350, cost: 90, qty: 999, cat: 1 },
  ];
  const productIds: string[] = [];
  for (const p of products) {
    const [row] = await sql<{ id: string }>`
      insert into products (company_id, category_id, name, sku, kind, price, cost, quantity, min_quantity)
      values (${companyId}, ${catIds[p.cat]}, ${p.name}, ${p.sku}, ${"service"}, ${p.price}, ${p.cost}, ${p.qty}, ${p.qty < 20 ? 5 : 0})
      returning id
    `;
    productIds.push(row.id);
    await sql`
      insert into inventory (product_id, company_id, quantity)
      values (${row.id}, ${companyId}, ${p.qty})
    `;
  }

  let saleNo = 1;
  async function addSale(customerName: string, days: number, productIndex: number, qty: number) {
    const customerId = customerIds[customerName];
    const product = products[productIndex];
    const total = product.price * qty;
    const [sale] = await sql<{ id: string }>`
      insert into sales (company_id, customer_id, number, status, sold_at, subtotal, discount, total, payment_method, seller_user_id)
      values (${companyId}, ${customerId}, ${saleNo++}, ${"completed"}, ${daysAgo(days)}, ${total}, ${0}, ${total}, ${"Pix"}, ${userId})
      returning id
    `;
    await sql`
      insert into sale_items (company_id, sale_id, product_id, description, quantity, unit_price, total)
      values (${companyId}, ${sale.id}, ${productIds[productIndex]}, ${product.name}, ${qty}, ${product.price}, ${total})
    `;
    const [cat] = await sql<{ id: string }>`
      select id from transaction_categories where company_id = ${companyId} and name = ${"Vendas"} limit 1
    `;
    await sql`
      insert into transactions (company_id, kind, amount, occurred_at, status, description, customer_id, sale_id, created_by, category_id)
      values (${companyId}, ${"income"}, ${total}, ${dateAgo(days)}, ${"paid"}, ${"Venda " + product.name}, ${customerId}, ${sale.id}, ${userId}, ${cat?.id ?? null})
    `;
  }

  await addSale("Bruno Lima", 12, 1, 1);
  await addSale("Carla Mendes", 6, 0, 1);
  await addSale("Farmácia Central", 8, 3, 6);
  await addSale("Sofia Martins", 21, 2, 1);
  await addSale("Ana Ribeiro", 78, 1, 1);
  await addSale("Padaria São Bento", 64, 5, 6);
  await addSale("Marcos Pires", 91, 1, 1);
  await addSale("Helena Costa", 102, 0, 1);
  await addSale("Eduardo Nogueira", 38, 5, 1);
  await addSale("Igor Azevedo", 48, 1, 1);

  const [expCat] = await sql<{ id: string }>`
    select id from transaction_categories where company_id = ${companyId} and name = ${"Aluguel"} limit 1
  `;
  await sql`
    insert into transactions (company_id, kind, amount, occurred_at, status, description, created_by, category_id)
    values (${companyId}, ${"expense"}, ${4200}, ${dateAgo(5)}, ${"paid"}, ${"Aluguel do consultório"}, ${userId}, ${expCat?.id ?? null})
  `;
  const [folha] = await sql<{ id: string }>`
    select id from transaction_categories where company_id = ${companyId} and name = ${"Folha"} limit 1
  `;
  await sql`
    insert into transactions (company_id, kind, amount, occurred_at, status, description, created_by, category_id)
    values (${companyId}, ${"expense"}, ${8600}, ${dateAgo(3)}, ${"paid"}, ${"Folha da equipe"}, ${userId}, ${folha?.id ?? null})
  `;

  let invNo = 1;
  async function overdue(customerName: string, amount: number, dueDays: number, desc: string) {
    await sql`
      insert into invoices (company_id, customer_id, number, amount, amount_paid, due_date, status, description)
      values (
        ${companyId},
        ${customerIds[customerName]},
        ${invNo++},
        ${amount},
        ${0},
        ${dateAgo(dueDays)},
        ${"overdue"},
        ${desc}
      )
    `;
  }
  await overdue("Padaria São Bento", 1600, 18, "Manutenção mensal em atraso");
  await overdue("Marcos Pires", 1000, 5, "Saldo de tratamento");

  let quoteNo = 1;
  async function quote(customerName: string, productIndex: number, status: string, sentDays: number) {
    const product = products[productIndex];
    const [q] = await sql<{ id: string }>`
      insert into quotes (
        company_id, customer_id, number, status, valid_until, sent_at, subtotal, discount, total, owner_user_id
      ) values (
        ${companyId}, ${customerIds[customerName]}, ${quoteNo++}, ${status},
        ${dateAgo(-10)}, ${daysAgo(sentDays)}, ${product.price}, ${0}, ${product.price}, ${userId}
      ) returning id
    `;
    await sql`
      insert into quote_items (company_id, quote_id, product_id, description, quantity, unit_price, total)
      values (${companyId}, ${q.id}, ${productIds[productIndex]}, ${product.name}, ${1}, ${product.price}, ${product.price})
    `;
    await sql`
      insert into quote_status_history (company_id, quote_id, from_status, to_status, actor_user_id)
      values (${companyId}, ${q.id}, ${"draft"}, ${status}, ${userId})
    `;
  }
  await quote("Ana Ribeiro", 2, "sent", 12);
  await quote("Helena Costa", 4, "viewed", 20);
  await quote("Bruno Lima", 1, "accepted", 4);

  const leads = [
    { name: "Patrícia Gomes", source: "Instagram", value: 890, idle: 14, status: "new" },
    { name: "Rafael Teixeira", source: "Indicação", value: 1500, idle: 10, status: "contacted" },
    { name: "Larissa Duarte", source: "Google", value: 800, idle: 21, status: "qualified" },
    { name: "Otávio Reis", source: "WhatsApp", value: 350, idle: 2, status: "new" },
  ];
  const leadIds: string[] = [];
  for (const l of leads) {
    const [row] = await sql<{ id: string }>`
      insert into leads (company_id, name, email, phone, source, status, estimated_value, owner_user_id, last_activity_at)
      values (
        ${companyId}, ${l.name}, ${l.name.toLowerCase().replace(" ", ".") + "@email.com"}, ${"11988880000"},
        ${l.source}, ${l.status}, ${l.value}, ${userId}, ${daysAgo(l.idle)}
      ) returning id
    `;
    leadIds.push(row.id);
    await sql`
      insert into lead_activities (company_id, lead_id, type, body, actor_user_id)
      values (${companyId}, ${row.id}, ${"note"}, ${"Lead capturado via " + l.source}, ${userId})
    `;
  }

  const stages = await sql<{ id: string; slug: string }>`
    select id, slug from pipeline_stages where company_id = ${companyId} order by sort_order
  `;
  const stage = (slug: string) => stages.find((s) => s.slug === slug)!.id;
  const [pipeline] = await sql<{ id: string }>`
    select id from pipelines where company_id = ${companyId} limit 1
  `;

  const deals = [
    { title: "Clareamento Ana", stage: "proposal", value: 1850, customer: "Ana Ribeiro" },
    { title: "Plano Padaria São Bento", stage: "negotiation", value: 4200, customer: "Padaria São Bento" },
    { title: "Consulta Patrícia", stage: "contact", value: 280, customer: null, lead: 0 },
    { title: "Tratamento Rafael", stage: "qualify", value: 1500, customer: null, lead: 1 },
    { title: "Manutenção Bruno", stage: "won", value: 350, customer: "Bruno Lima" },
  ];
  for (const d of deals) {
    await sql`
      insert into deals (
        company_id, pipeline_id, stage_id, title, customer_id, lead_id, value, owner_user_id, expected_close_at, source
      ) values (
        ${companyId},
        ${pipeline.id},
        ${stage(d.stage)},
        ${d.title},
        ${d.customer ? customerIds[d.customer] : null},
        ${"lead" in d && d.lead != null ? leadIds[d.lead] : null},
        ${d.value},
        ${userId},
        ${dateAgo(-14)},
        ${"Indicação"}
      )
    `;
  }

  const [svc] = await sql<{ id: string }>`
    insert into appointment_services (company_id, name, duration_minutes, price)
    values (${companyId}, ${"Consulta"}, ${40}, ${280}) returning id
  `;
  await sql`
    insert into appointments (company_id, customer_id, service_id, title, starts_at, ends_at, owner_user_id, status)
    values (
      ${companyId},
      ${customerIds["Carla Mendes"]},
      ${svc.id},
      ${"Retorno Carla Mendes"},
      ${daysAgo(-1)},
      ${new Date(Date.now() + 86_400_000 + 40 * 60_000).toISOString()},
      ${userId},
      ${"scheduled"}
    )
  `;

  await sql`
    insert into rewards (company_id, name, points_cost)
    values (${companyId}, ${"Limpeza cortesia"}, ${800})
  `;

  await sql`
    insert into goals (company_id, user_id, name, metric, target, period_start, period_end)
    values (
      ${companyId}, ${userId}, ${"Receita do mês"}, ${"revenue"}, ${45000},
      ${new Date().toISOString().slice(0, 8) + "01"},
      ${dateAgo(-20)}
    )
  `;

  await sql`
    insert into automations (company_id, name, enabled, trigger_key)
    values (${companyId}, ${"Avisar clientes inativos 60 dias"}, ${false}, ${"customer_inactive_60"})
  `;

  await sql`
    insert into message_templates (company_id, name, channel, body)
    values (
      ${companyId},
      ${"Retorno 60 dias"},
      ${"whatsapp"},
      ${"Olá {{nome}}, sentimos sua falta na {{empresa}}. Separámos uma condição para seu retorno. Posso te contar?"}
    )
  `;

  await sql`
    insert into notifications (company_id, user_id, type, title, body, href)
    values (
      ${companyId},
      ${userId},
      ${"lost_money"},
      ${"Há receita parada para recuperar"},
      ${"O motor de Dinheiro perdido encontrou clientes inativos, orçamentos e cobranças em atraso."},
      ${"/app/dinheiro-perdido"}
    )
  `;

  await sql`update companies set demo_mode = true where id = ${companyId}`;
}
