import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { changePlan, getBilling } from "@/lib/server/ops";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/assinatura")({ component: BillingPage });

function BillingPage() {
  const q = useQuery({ queryKey: ["billing"], queryFn: () => getBilling() });
  const qc = useQueryClient();
  const change = useMutation({
    mutationFn: (planSlug: string) => changePlan({ data: { planSlug } }),
    onSuccess: async (res) => {
      toast.message(res.note);
      await qc.invalidateQueries({ queryKey: ["billing"] });
    },
  });
  if (q.isLoading) return <Skeleton className="h-40" />;
  if (!q.data) return <p className="text-sm text-rust">Não foi possível carregar os planos.</p>;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Assinatura</h1>
      <p className="text-sm text-muted">
        Plano atual: <strong>{q.data.subscription?.plan_slug}</strong> · {q.data.subscription?.status}
      </p>
      {!q.data.stripe ? (
        <p className="rounded-[var(--radius-md)] border border-line bg-paper px-4 py-3 text-sm">
          Stripe: configuração necessária. Sem chave secreta não há checkout, cobrança nem simulação de pagamento.
        </p>
      ) : null}
      <div className="grid gap-3 md:grid-cols-2">
        {q.data.plans.map((p) => {
          const features = Array.isArray(p.features) ? (p.features as string[]) : [];
          return (
            <Card key={p.slug}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-2xl">{p.name}</h2>
                {q.data.subscription?.plan_slug === p.slug ? <Badge tone="forest">atual</Badge> : null}
              </div>
              <p className="mt-2 font-display text-3xl">{formatBRL(p.price_cents / 100)}</p>
              <p className="text-xs text-muted">por mês</p>
              <p className="mt-3 text-sm text-muted">{p.description}</p>
              <ul className="mt-3 space-y-1 text-sm">
                {features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
              <Button
                className="mt-4"
                variant="secondary"
                disabled={change.isPending || q.data.subscription?.plan_slug === p.slug}
                onClick={() => change.mutate(p.slug)}
              >
                Selecionar
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
