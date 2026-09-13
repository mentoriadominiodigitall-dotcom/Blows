import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { listLoyalty } from "@/lib/server/ops";

export const Route = createFileRoute("/app/fidelidade")({ component: LoyaltyPage });

function LoyaltyPage() {
  const q = useQuery({ queryKey: ["loyalty"], queryFn: () => listLoyalty() });
  if (q.isLoading) return <Skeleton className="h-40" />;
  if (!q.data?.accounts.length) {
    return <EmptyState title="Sem contas de fidelidade" body="Pontos nascem das compras registradas." />;
  }
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Fidelidade</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {q.data.rewards.map((r) => (
          <Card key={r.id}>
            <p className="font-medium">{r.name}</p>
            <p className="text-sm text-muted">{r.points_cost} pontos</p>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-display text-xl">Ranking</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {q.data.accounts.map((a) => (
            <li key={a.id} className="flex justify-between">
              <span>{a.customer_name}</span>
              <span>
                <Badge>{a.tier}</Badge> <span className="tabular-nums">{a.points} pts</span>
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
