import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty";
import { getPipeline, moveDeal, upsertDeal } from "@/lib/server/pipeline";
import { formatBRL } from "@/lib/money";
import { num } from "@/lib/utils";

export const Route = createFileRoute("/app/funil")({ component: FunilPage });

function FunilPage() {
  const q = useQuery({ queryKey: ["pipeline"], queryFn: () => getPipeline() });
  const qc = useQueryClient();
  const [title, setTitle] = useState("");
  const [value, setValue] = useState("0");
  const move = useMutation({
    mutationFn: (input: { dealId: string; stageId: string }) => moveDeal({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["pipeline"] }),
    onError: () => toast.error("Não foi possível mover."),
  });
  const create = useMutation({
    mutationFn: () => upsertDeal({ data: { title, value: Number(value) } }),
    onSuccess: async () => {
      setTitle("");
      await qc.invalidateQueries({ queryKey: ["pipeline"] });
    },
  });

  if (q.isLoading) return <Skeleton className="h-64" />;
  if (!q.data) return <p className="text-sm text-rust">Funil indisponível.</p>;
  if (q.data.deals.length === 0) {
    /* still show columns */
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="font-display text-4xl">Funil</h1>
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            create.mutate();
          }}
        >
          <Input placeholder="Nova oportunidade" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Input className="w-28" type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          <Button type="submit">Adicionar</Button>
        </form>
      </div>
      {q.data.deals.length === 0 ? (
        <EmptyState title="Funil vazio" body="Crie uma oportunidade para acompanhar conversão entre etapas." />
      ) : null}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {q.data.stages.map((stage) => {
          const deals = q.data.deals.filter((d) => d.stage_id === stage.id);
          const conv = q.data.conversion.find((c) => c.stageId === stage.id)?.rate ?? 0;
          return (
            <section
              key={stage.id}
              className="w-64 shrink-0 rounded-[var(--radius-lg)] border border-line bg-paper p-3"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                const dealId = e.dataTransfer.getData("text/deal");
                if (dealId) move.mutate({ dealId, stageId: stage.id });
              }}
            >
              <header className="mb-3 flex items-baseline justify-between">
                <h2 className="text-sm font-medium">{stage.name}</h2>
                <span className="text-xs tabular-nums text-muted">{conv.toFixed(0)}%</span>
              </header>
              <div className="space-y-2">
                {deals.map((deal) => (
                  <article
                    key={deal.id}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData("text/deal", deal.id)}
                    className="cursor-grab rounded-[var(--radius-md)] border border-line bg-canvas p-3 active:cursor-grabbing"
                  >
                    <p className="text-sm font-medium">{deal.title}</p>
                    <p className="mt-1 text-sm tabular-nums text-muted">{formatBRL(num(deal.value))}</p>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
