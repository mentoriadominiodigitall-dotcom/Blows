import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { Money } from "@/components/format";
import { addTransaction, getFinanceOverview } from "@/lib/server/finance";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/financeiro")({ component: FinancePage });

function FinancePage() {
  const q = useQuery({ queryKey: ["finance"], queryFn: () => getFinanceOverview() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ kind: "income" as "income" | "expense", amount: "", description: "", occurredAt: new Date().toISOString().slice(0, 10) });
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      addTransaction({
        data: {
          kind: form.kind,
          amount: Number(form.amount),
          description: form.description,
          occurredAt: form.occurredAt,
          status: "paid",
        },
      }),
    onSuccess: async () => {
      toast.success("Lançamento registrado.");
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["finance"] });
    },
  });

  function exportCsv() {
    if (!q.data) return;
    const lines = ["mes,receita,despesa", ...q.data.series.map((s) => `${s.month},${s.income},${s.expense}`)];
    const blob = new Blob([lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "fluxo-caixa.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  if (q.isLoading) return <Skeleton className="h-64" />;
  if (!q.data) return <p className="text-sm text-rust">Financeiro indisponível.</p>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Financeiro</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={exportCsv}>
            Exportar CSV
          </Button>
          <Button onClick={() => setOpen(true)}>Novo lançamento</Button>
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        <Card>
          <p className="text-xs text-muted">Receita</p>
          <p className="mt-2 font-display text-2xl">
            <Money value={q.data.income} />
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Despesas</p>
          <p className="mt-2 font-display text-2xl">
            <Money value={q.data.expense} />
          </p>
        </Card>
        <Card>
          <p className="text-xs text-muted">Lucro / margem</p>
          <p className="mt-2 font-display text-2xl">
            <Money value={q.data.profit} />
          </p>
          <p className="text-xs text-muted">{q.data.margin.toFixed(1)}%</p>
        </Card>
      </div>
      <Card>
        <p className="text-sm text-muted">Fluxo de caixa</p>
        <div className="mt-4 h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={q.data.series}>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="income" fill="var(--color-forest)" />
              <Bar dataKey="expense" fill="var(--color-rust)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card>
        <h2 className="font-display text-xl">Faturas</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {q.data.invoices.map((i) => (
            <li key={i.id} className="flex items-center justify-between gap-3">
              <span>
                #{i.number} · {i.description ?? "Fatura"}
              </span>
              <span className="flex items-center gap-2">
                <Badge tone={i.status === "overdue" ? "rust" : "muted"}>{i.status}</Badge>
                <span className="tabular-nums">{formatBRL(i.amount)}</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
          <form
            className="w-full max-w-md space-y-3 rounded-[var(--radius-xl)] bg-paper p-6"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h2 className="font-display text-2xl">Lançamento</h2>
            <select
              className="h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3"
              value={form.kind}
              onChange={(e) => setForm({ ...form, kind: e.target.value as "income" | "expense" })}
            >
              <option value="income">Receita</option>
              <option value="expense">Despesa</option>
            </select>
            <Label>Valor</Label>
            <Input type="number" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
            <Label>Descrição</Label>
            <Input required value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <Label>Data</Label>
            <Input type="date" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
