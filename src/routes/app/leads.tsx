import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { Input, Label } from "@/components/ui/input";
import { listLeads, upsertLead } from "@/lib/server/crm";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/leads")({ component: LeadsPage });

function LeadsPage() {
  const q = useQuery({ queryKey: ["leads"], queryFn: () => listLeads() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", source: "WhatsApp", estimatedValue: 0 });
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () => upsertLead({ data: form }),
    onSuccess: async () => {
      toast.success("Lead salvo.");
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["leads"] });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Leads</h1>
        <Button onClick={() => setOpen(true)}>Novo lead</Button>
      </div>
      {q.isLoading ? <Skeleton className="h-40" /> : null}
      {q.data && q.data.length === 0 ? (
        <EmptyState title="Nenhum lead" body="Capture oportunidades para o funil e para o radar de dinheiro perdido." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="text-left">Origem</th>
                <th className="text-left">Status</th>
                <th className="text-left">Valor</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.map((l) => (
                <tr key={l.id} className="border-t border-line">
                  <td className="px-4 py-3">{l.name}</td>
                  <td>{l.source ?? "—"}</td>
                  <td>
                    <Badge>{l.status}</Badge>
                  </td>
                  <td className="tabular-nums">{formatBRL(l.estimated_value)}</td>
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
            <h2 className="font-display text-2xl">Novo lead</h2>
            <Label>Nome</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Label>Valor estimado</Label>
            <Input type="number" value={form.estimatedValue} onChange={(e) => setForm({ ...form, estimatedValue: Number(e.target.value) })} />
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
