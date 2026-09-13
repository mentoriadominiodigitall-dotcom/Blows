import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { listAutomations, toggleAutomation } from "@/lib/server/ops";

export const Route = createFileRoute("/app/automacoes")({ component: AutomationsPage });

function AutomationsPage() {
  const q = useQuery({ queryKey: ["automations"], queryFn: () => listAutomations() });
  const qc = useQueryClient();
  const tog = useMutation({
    mutationFn: (input: { id: string; enabled: boolean }) => toggleAutomation({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["automations"] }),
  });
  if (q.isLoading) return <Skeleton className="h-40" />;
  if (!q.data?.length) {
    return (
      <EmptyState
        title="Nenhuma automação"
        body="Regras ficam desligadas por padrão. Nenhuma ação destrutiva roda sozinha."
      />
    );
  }
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Automações</h1>
      <p className="text-sm text-muted">
        Ativar apenas marca a regra. Envio de mensagem e alterações financeiras exigem confirmação humana.
      </p>
      <div className="space-y-3">
        {q.data.map((a) => (
          <Card key={a.id} className="flex items-center justify-between gap-3">
            <div>
              <p className="font-medium">{a.name}</p>
              <p className="text-xs text-muted">{a.trigger_key}</p>
            </div>
            <label className="flex min-h-11 items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={a.enabled}
                onChange={(e) => tog.mutate({ id: a.id, enabled: e.target.checked })}
              />
              {a.enabled ? "Ligada" : "Desligada"}
            </label>
          </Card>
        ))}
      </div>
    </div>
  );
}
