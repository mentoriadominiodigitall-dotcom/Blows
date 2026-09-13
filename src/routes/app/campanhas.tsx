import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Badge, Card, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { Button } from "@/components/ui/button";
import { listCampaigns } from "@/lib/server/ops";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/campanhas")({ component: CampaignsPage });

function CampaignsPage() {
  const q = useQuery({ queryKey: ["campaigns"], queryFn: () => listCampaigns() });
  if (q.isLoading) return <Skeleton className="h-40" />;
  const rows = q.data?.rows ?? [];
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Campanhas</h1>
        <Button asChild>
          <Link to="/app/dinheiro-perdido">Nova a partir do radar</Link>
        </Button>
      </div>
      {!q.data?.whatsapp ? (
        <p className="rounded-[var(--radius-md)] border border-line bg-paper px-4 py-3 text-sm text-muted">
          WhatsApp Business API: configuração necessária. Campanhas podem ser criadas, mas o envio não é simulado.
        </p>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title="Nenhuma campanha" body="Use Recuperar agora no Dinheiro perdido para gerar a primeira." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Nome</th>
                <th className="text-left">Canal</th>
                <th className="text-left">Status</th>
                <th className="text-left">Recuperado</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="px-4 py-3">
                    <Link to="/app/campanhas/$id" params={{ id: c.id }} className="hover:underline">
                      {c.name}
                    </Link>
                  </td>
                  <td>{c.channel}</td>
                  <td>
                    <Badge tone={c.status === "needs_config" ? "warn" : "muted"}>{c.status}</Badge>
                  </td>
                  <td className="tabular-nums">{formatBRL(c.recovered_amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
