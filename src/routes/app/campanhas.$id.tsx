import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge, Card, Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { dispatchCampaign } from "@/lib/server/lost-money";
import { getCampaign } from "@/lib/server/ops";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/campanhas/$id")({ component: CampaignDetail });

function CampaignDetail() {
  const { id } = Route.useParams();
  const q = useQuery({ queryKey: ["campaign", id], queryFn: () => getCampaign({ data: { id } }) });
  const qc = useQueryClient();
  const send = useMutation({
    mutationFn: () => dispatchCampaign({ data: { campaignId: id } }),
    onSuccess: async (res) => {
      if (res.needsConfig) toast.message("Configuração necessária para enviar pelo WhatsApp.");
      else toast.success(`Fila: ${res.queued}. Bloqueados: ${res.blocked}.`);
      await qc.invalidateQueries({ queryKey: ["campaign", id] });
    },
  });

  if (q.isLoading) return <Skeleton className="h-48" />;
  if (!q.data) return <p className="text-sm text-rust">Campanha não encontrada nesta empresa.</p>;
  const c = q.data.campaign as Record<string, unknown>;

  return (
    <div className="space-y-4">
      <h1 className="font-display text-4xl">{String(c.name)}</h1>
      <div className="flex flex-wrap gap-2">
        <Badge>{String(c.status)}</Badge>
        <Badge tone="muted">{String(c.channel)}</Badge>
      </div>
      <Card>
        <p className="text-sm text-muted">Mensagem</p>
        <p className="mt-2 whitespace-pre-wrap text-sm">{String(c.message)}</p>
      </Card>
      {!q.data.whatsapp ? (
        <p className="rounded-[var(--radius-md)] border border-line bg-paper px-4 py-3 text-sm">
          Configuração necessária: WhatsApp Business API. O botão abaixo registra a tentativa e não finge envio.
        </p>
      ) : null}
      <Button onClick={() => send.mutate()} disabled={send.isPending}>
        {send.isPending ? "Processando…" : "Tentar envio"}
      </Button>
      <Card>
        <h2 className="font-display text-xl">Destinatários</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {q.data.recipients.map((r) => (
            <li key={r.id} className="flex justify-between gap-3">
              <span>
                {r.name} {r.consent ? "" : "· sem consentimento"}
              </span>
              <span className="tabular-nums text-muted">
                {r.status} · {formatBRL(r.estimated_value)}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
