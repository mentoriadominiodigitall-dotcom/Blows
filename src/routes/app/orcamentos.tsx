import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Badge, Card, Skeleton } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/empty";
import { listQuotes, updateQuoteStatus } from "@/lib/server/catalog";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/orcamentos")({ component: QuotesPage });

const NEXT: Record<string, "sent" | "viewed" | "accepted" | "rejected" | "expired"> = {
  draft: "sent",
  sent: "viewed",
  viewed: "accepted",
};

function QuotesPage() {
  const q = useQuery({ queryKey: ["quotes"], queryFn: () => listQuotes() });
  const qc = useQueryClient();
  const upd = useMutation({
    mutationFn: (input: { id: string; status: "sent" | "viewed" | "accepted" | "rejected" | "expired" }) =>
      updateQuoteStatus({ data: input }),
    onSuccess: () => {
      toast.success("Status atualizado.");
      void qc.invalidateQueries({ queryKey: ["quotes"] });
    },
  });

  if (q.isLoading) return <Skeleton className="h-48" />;
  if (!q.data?.length) {
    return <EmptyState title="Nenhum orçamento" body="Crie propostas para medir abandono no Dinheiro perdido." />;
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Orçamentos</h1>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Nº</th>
              <th className="text-left">Cliente</th>
              <th className="text-left">Status</th>
              <th className="text-left">Total</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {q.data.map((quote) => (
              <tr key={quote.id} className="border-t border-line">
                <td className="px-4 py-3 tabular-nums">#{quote.number}</td>
                <td>{quote.customer_name ?? "—"}</td>
                <td>
                  <Badge tone={quote.status === "expired" || quote.status === "rejected" ? "rust" : "muted"}>
                    {quote.status}
                  </Badge>
                </td>
                <td className="tabular-nums">{formatBRL(quote.total)}</td>
                <td>
                  {NEXT[quote.status] ? (
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => upd.mutate({ id: quote.id, status: NEXT[quote.status] })}
                    >
                      Marcar {NEXT[quote.status]}
                    </Button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
