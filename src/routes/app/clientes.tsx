import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { Input, Label } from "@/components/ui/input";
import { Money } from "@/components/format";
import { listCustomers, upsertCustomer } from "@/lib/server/crm";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/clientes")({ component: ClientesPage });

function ClientesPage() {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const list = useQuery({ queryKey: ["customers", query], queryFn: () => listCustomers({ data: { query, page: 0 } }) });
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", email: "", phone: "", consentWhatsapp: true });
  const save = useMutation({
    mutationFn: () => upsertCustomer({ data: form }),
    onSuccess: async () => {
      toast.success("Cliente salvo.");
      setOpen(false);
      setForm({ name: "", email: "", phone: "", consentWhatsapp: true });
      await qc.invalidateQueries({ queryKey: ["customers"] });
    },
    onError: () => toast.error("Não foi possível salvar."),
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-4xl">Clientes</h1>
        <Button onClick={() => setOpen(true)}>Novo cliente</Button>
      </div>
      <Input placeholder="Buscar nome, e-mail ou telefone" value={query} onChange={(e) => setQuery(e.target.value)} />
      {list.isLoading ? <Skeleton className="h-48" /> : null}
      {list.data && list.data.rows.length === 0 ? (
        <EmptyState title="Nenhum cliente" body="Cadastre o primeiro cliente para o CRM e o dinheiro perdido começarem a trabalhar." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3">Nome</th>
                <th>Contato</th>
                <th>Classe</th>
                <th>Total</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {list.data?.rows.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/app/clientes/$id" params={{ id: c.id }} className="font-medium hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td className="text-muted">{c.phone ?? c.email ?? "—"}</td>
                  <td>
                    <Badge>{c.classification}</Badge>
                  </td>
                  <td className="tabular-nums">{formatBRL(c.total_spent)}</td>
                  <td className="tabular-nums">
                    <Money value={c.avg_ticket} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
          <form
            className="w-full max-w-md space-y-3 rounded-[var(--radius-xl)] bg-paper p-6"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h2 className="font-display text-2xl">Novo cliente</h2>
            <div className="space-y-1">
              <Label>Nome</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>E-mail</Label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Telefone</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.consentWhatsapp}
                onChange={(e) => setForm({ ...form, consentWhatsapp: e.target.checked })}
              />
              Consentimento WhatsApp
            </label>
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={save.isPending}>
                Salvar
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
