import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { Money } from "@/components/format";
import { getDashboard } from "@/lib/server/dashboard";

export const Route = createFileRoute("/app/")({ component: DashboardPage });

function DashboardPage() {
  const q = useQuery({ queryKey: ["dashboard"], queryFn: () => getDashboard() });
  if (q.isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>
    );
  }
  if (q.error) {
    return <p className="text-sm text-rust">Não foi possível carregar o painel.</p>;
  }
  const d = q.data!;
  if (d.empty) {
    return (
      <EmptyState
        title="Ainda não há movimento"
        body="Importe clientes, registre uma venda ou carregue dados de demonstração no onboarding para ver indicadores reais."
        action={
          <Button asChild>
            <Link to="/app/clientes">Cadastrar cliente</Link>
          </Button>
        }
      />
    );
  }

  const cards = [
    { label: "Faturamento", value: d.revenue },
    { label: "Despesas", value: d.expenses },
    { label: "Lucro", value: d.profit },
    { label: "Ticket médio", value: d.avgTicket },
    { label: "Receita recuperada", value: d.recovered },
    { label: "Cobranças atrasadas", value: d.overdueAmount },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-muted">Este mês</p>
          <h1 className="font-display text-4xl">Visão geral</h1>
        </div>
        <Link
          to="/app/dinheiro-perdido"
          className="min-w-[220px] rounded-[var(--radius-lg)] border border-rust/20 bg-paper px-5 py-4"
        >
          <p className="text-xs uppercase tracking-[0.14em] text-rust">Dinheiro perdido</p>
          <p className="mt-1 font-display text-3xl">
            <Money value={d.lostMoney} />
          </p>
          <p className="mt-1 text-sm text-muted">Recuperar agora</p>
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => (
          <Card key={c.label} className="p-4">
            <p className="text-xs uppercase tracking-[0.12em] text-muted">{c.label}</p>
            <p className="mt-2 font-display text-2xl">
              <Money value={c.value} />
            </p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <p className="text-sm text-muted">Vendas · 14 dias</p>
          <div className="mt-4 h-56">
            {d.trend.length === 0 ? (
              <p className="text-sm text-muted">Sem vendas no período.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={d.trend}>
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(v: number) => [new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v)]} />
                  <Area type="monotone" dataKey="total" stroke="var(--color-forest)" fill="var(--color-forest)" fillOpacity={0.12} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>
        <Card>
          <p className="text-sm text-muted">Operação</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li className="flex justify-between"><span>Leads abertos</span><span className="tabular-nums">{d.leads}</span></li>
            <li className="flex justify-between"><span>Clientes ativos</span><span className="tabular-nums">{d.activeCustomers}</span></li>
            <li className="flex justify-between"><span>Clientes inativos</span><span className="tabular-nums">{d.inactiveCustomers}</span></li>
            <li className="flex justify-between"><span>Oportunidades</span><span className="tabular-nums">{d.openDeals}</span></li>
            <li className="flex justify-between"><span>Vendas no mês</span><span className="tabular-nums">{d.salesCount}</span></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
