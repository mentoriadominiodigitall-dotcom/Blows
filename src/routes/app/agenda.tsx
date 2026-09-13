import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { Input, Label } from "@/components/ui/input";
import { createAppointment, listAppointments } from "@/lib/server/ops";

export const Route = createFileRoute("/app/agenda")({ component: AgendaPage });

function AgendaPage() {
  const q = useQuery({ queryKey: ["appointments"], queryFn: () => listAppointments() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    startsAt: new Date().toISOString().slice(0, 16),
    endsAt: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
  });
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () =>
      createAppointment({
        data: {
          title: form.title,
          startsAt: new Date(form.startsAt).toISOString(),
          endsAt: new Date(form.endsAt).toISOString(),
        },
      }),
    onSuccess: async () => {
      toast.success("Compromisso criado.");
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["appointments"] });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Agenda</h1>
        <Button onClick={() => setOpen(true)}>Novo</Button>
      </div>
      <p className="text-sm text-muted">Google Calendar: configuração necessária para sincronizar.</p>
      {q.isLoading ? <Skeleton className="h-40" /> : null}
      {q.data && q.data.length === 0 ? (
        <EmptyState title="Agenda vazia" body="Marque retornos, avaliações e visitas." />
      ) : (
        <div className="space-y-2">
          {q.data?.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{a.title}</p>
                <p className="text-xs text-muted">
                  {new Date(a.starts_at).toLocaleString("pt-BR")} · {a.customer_name ?? "interno"}
                </p>
              </div>
              <Badge>{a.status}</Badge>
            </Card>
          ))}
        </div>
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
            <h2 className="font-display text-2xl">Compromisso</h2>
            <Label>Título</Label>
            <Input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Label>Início</Label>
            <Input type="datetime-local" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
            <Label>Fim</Label>
            <Input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
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
