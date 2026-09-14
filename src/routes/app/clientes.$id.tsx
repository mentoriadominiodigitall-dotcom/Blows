import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Badge, Card, Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/input";
import { Money } from "@/components/format";
import { addCustomerNote, getCustomer } from "@/lib/server/crm";
import { formatBRL } from "@/lib/money";
import { num } from "@/lib/utils";

export const Route = createFileRoute("/app/clientes/$id")({ component: CustomerPage });

function CustomerPage() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: ["customer", id], queryFn: () => getCustomer({ data: { id } }) });
  const [note, setNote] = useState("");
  const qc = useQueryClient();
  const add = useMutation({
    mutationFn: () => addCustomerNote({ data: { customerId: id, body: note } }),
    onSuccess: async () => {
      setNote("");
      toast.success("Nota registrada.");
      await qc.invalidateQueries({ queryKey: ["customer", id] });
    },
  });

  if (q.isLoading) return <Skeleton className="h-64" />;
  if (q.error || !q.data) return <p className="text-sm text-rust">Cliente não encontrado nesta empresa.</p>;
  const c = q.data.customer;

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Cliente</p>
        <h1 className="mt-2 font-display text-3xl">{String(c.name)}</h1>
        <p className="mt-2 text-sm text-muted">{String(c.email ?? "—")}</p>
        <p className="text-sm text-muted">{String(c.phone ?? "—")}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Badge>{String(c.classification)}</Badge>
          {q.data.tags.map((t) => (
            <Badge key={t.id} tone="forest">
              {t.name}
            </Badge>
          ))}
        </div>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Total gasto</dt>
            <dd>
              <Money value={c.total_spent} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Ticket médio</dt>
            <dd>
              <Money value={c.avg_ticket} />
            </dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">Compras</dt>
            <dd className="tabular-nums">{num(c.purchase_count)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted">WhatsApp</dt>
            <dd>{c.consent_whatsapp ? "Com consentimento" : "Sem consentimento"}</dd>
          </div>
        </dl>
      </Card>
      <div className="space-y-4 lg:col-span-2">
        <Card>
          <h2 className="font-display text-xl">Linha do tempo</h2>
          <ol className="mt-4 space-y-3">
            {q.data.events.map((e) => (
              <li key={e.id} className="border-l border-line pl-3 text-sm">
                <p className="font-medium">{e.title}</p>
                <p className="text-xs text-muted">{new Date(e.created_at).toLocaleString("pt-BR")}</p>
              </li>
            ))}
          </ol>
        </Card>
        <Card>
          <h2 className="font-display text-xl">Compras</h2>
          {q.data.sales.length === 0 ? (
            <p className="mt-2 text-sm text-muted">Nenhuma venda vinculada.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {q.data.sales.map((s) => (
                <li key={s.id} className="flex justify-between">
                  <span>#{s.number}</span>
                  <span className="tabular-nums">{formatBRL(s.total)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="font-display text-xl">Notas</h2>
          <form
            className="mt-3 space-y-2"
            onSubmit={(e) => {
              e.preventDefault();
              add.mutate();
            }}
          >
            <Textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Registrar atendimento" />
            <Button type="submit" size="sm" disabled={!note.trim() || add.isPending}>
              Adicionar
            </Button>
          </form>
          <ul className="mt-4 space-y-3">
            {q.data.notes.map((n) => (
              <li key={n.id} className="text-sm">
                <p>{n.body}</p>
                <p className="text-xs text-muted">{new Date(n.created_at).toLocaleString("pt-BR")}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
