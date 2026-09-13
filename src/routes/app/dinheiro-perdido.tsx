import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { Money } from "@/components/format";
import { Textarea } from "@/components/ui/input";
import { createRecoveryCampaign, getLostMoney } from "@/lib/server/lost-money";
import type { LostCategoryKey, LostItem } from "@/lib/lost-money/types";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/dinheiro-perdido")({ component: LostMoneyPage });

const STRATEGIES: Record<LostCategoryKey, { name: string; message: string }[]> = {
  inactive: [
    {
      name: "Retorno cordial",
      message:
        "Olá {{nome}}, aqui é da {{empresa}}. Faz um tempo que você não aparece — separamos uma condição de retorno. Posso te contar em 2 minutos?",
    },
    {
      name: "Oferta objetiva",
      message:
        "Olá {{nome}}, preparamos uma condição especial para você voltar este mês. Quer que eu envie os detalhes?",
    },
  ],
  quotes: [
    {
      name: "Cobrar proposta",
      message:
        "Olá {{nome}}, o orçamento ainda está válido. Posso tirar alguma dúvida para avançarmos?",
    },
  ],
  leads: [
    {
      name: "Retomar conversa",
      message:
        "Olá {{nome}}, retomando nossa conversa. Ainda faz sentido seguirmos com aquilo que você pediu?",
    },
  ],
  overdue: [
    {
      name: "Lembrete de vencimento",
      message:
        "Olá {{nome}}, identificamos um valor em aberto. Se já pagou, desconsidere. Se não, posso te enviar o pix agora.",
    },
  ],
  repurchase: [
    {
      name: "Lembrete de reposição",
      message:
        "Olá {{nome}}, no seu ritmo usual já estaria na hora de repor. Quer que eu reserve o mesmo de sempre?",
    },
  ],
};

function LostMoneyPage() {
  const q = useQuery({ queryKey: ["lost-money"], queryFn: () => getLostMoney() });
  const [active, setActive] = useState<LostCategoryKey>("inactive");
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [strategy, setStrategy] = useState(0);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const qc = useQueryClient();

  const category = q.data?.categories.find((c) => c.key === active);
  const items = category?.items ?? [];
  const selectedItems = items.filter((i) => selected[i.id]);

  const mutate = useMutation({
    mutationFn: async () => {
      const tpl = STRATEGIES[active][strategy] ?? STRATEGIES[active][0];
      return createRecoveryCampaign({
        data: {
          name: `Recuperação · ${category?.label ?? active}`,
          category: active,
          channel: "whatsapp",
          message: message || tpl.message,
          itemIds: selectedItems.map((i) => i.id),
        },
      });
    },
    onSuccess: async (res) => {
      await qc.invalidateQueries({ queryKey: ["campaigns"] });
      if (res.needsConfig) {
        toast.message("Campanha criada. Envio WhatsApp exige configuração.");
      } else {
        toast.success("Campanha criada.");
      }
      void navigate({ to: "/app/campanhas/$id", params: { id: res.campaignId } });
    },
    onError: () => toast.error("Não foi possível criar a campanha."),
  });

  const total = q.data?.total ?? 0;

  if (q.isLoading) {
    return <Skeleton className="h-64 w-full" />;
  }
  if (q.error) {
    return <p className="text-sm text-rust">Falha ao calcular oportunidades.</p>;
  }

  if (!q.data || (q.data.total === 0 && q.data.categories.every((c) => c.count === 0))) {
    return (
      <EmptyState
        title="Nada parado no momento"
        body="Quando houver clientes inativos, orçamentos sem resposta, leads parados ou cobranças vencidas, o valor aparece aqui — calculado a partir dos seus dados, não de um número inventado."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[var(--radius-xl)] border border-line bg-paper px-6 py-8 md:px-10">
        <p className="text-xs uppercase tracking-[0.18em] text-rust">Dinheiro perdido</p>
        <p className="mt-3 font-display text-5xl md:text-7xl">
          <Money value={total} />
        </p>
        <p className="mt-3 max-w-xl text-sm text-muted">
          Estimativa com base no ticket médio, valor de orçamentos, leads e faturas em atraso. Atualizado agora.
        </p>
        <Button className="mt-6" variant="rust" onClick={() => setOpen(true)}>
          Recuperar agora
        </Button>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        {q.data.categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => {
              setActive(c.key);
              setSelected({});
              setStrategy(0);
            }}
            className={`rounded-[var(--radius-lg)] border p-4 text-left ${active === c.key ? "border-ink bg-paper" : "border-line bg-paper/60"}`}
          >
            <p className="text-xs text-muted">{c.label}</p>
            <p className="mt-2 font-display text-2xl">
              <Money value={c.amount} />
            </p>
            <p className="mt-1 text-xs text-muted">{c.count} oportunidades</p>
          </button>
        ))}
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl">{category?.label}</h2>
            <p className="text-sm text-muted">{category?.description}</p>
          </div>
          <Button variant="secondary" size="sm" onClick={() => toggleAll(items, selected, setSelected)}>
            Selecionar visíveis
          </Button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-xs uppercase tracking-wide text-muted">
              <tr>
                <th className="py-2"></th>
                <th>Quem</th>
                <th>Valor</th>
                <th>Prioridade</th>
                <th>Próxima ação</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-t border-line">
                  <td className="py-3">
                    <input
                      type="checkbox"
                      checked={Boolean(selected[item.id])}
                      onChange={() => setSelected((s) => ({ ...s, [item.id]: !s[item.id] }))}
                      aria-label={`Selecionar ${item.name}`}
                    />
                  </td>
                  <td>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-xs text-muted">{item.subtitle}</p>
                  </td>
                  <td className="tabular-nums">{formatBRL(item.amount)}</td>
                  <td>
                    <Badge tone={item.priority === "high" ? "rust" : item.priority === "medium" ? "warn" : "muted"}>
                      {item.priority === "high" ? "Alta" : item.priority === "medium" ? "Média" : "Baixa"}
                    </Badge>
                  </td>
                  <td className="text-muted">{item.recommendedAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-0 md:place-items-center md:p-6">
          <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-[var(--radius-xl)] bg-paper p-6 md:max-w-xl md:rounded-[var(--radius-xl)]">
            <h2 className="font-display text-2xl">Recuperar agora</h2>
            <p className="mt-1 text-sm text-muted">
              {selectedItems.length} contato(s) · {formatBRL(selectedItems.reduce((s, i) => s + i.amount, 0))}
            </p>
            {selectedItems.length === 0 ? (
              <p className="mt-4 text-sm text-rust">Selecione ao menos um item na lista.</p>
            ) : (
              <>
                <p className="mt-4 text-sm font-medium">Estratégia</p>
                <div className="mt-2 grid gap-2">
                  {STRATEGIES[active].map((s, i) => (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        setStrategy(i);
                        setMessage(s.message);
                      }}
                      className={`rounded-[var(--radius-sm)] border px-3 py-2 text-left text-sm ${strategy === i ? "border-forest" : "border-line"}`}
                    >
                      {s.name}
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-sm font-medium">Mensagem</p>
                <Textarea
                  className="mt-2"
                  value={message || STRATEGIES[active][strategy].message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="mt-2 text-xs text-muted">
                  O envio só acontece com WhatsApp Business configurado e consentimento do contato. Sem isso, a campanha fica salva como rascunho.
                </p>
              </>
            )}
            <div className="mt-6 flex gap-3">
              <Button variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button
                variant="rust"
                disabled={selectedItems.length === 0 || mutate.isPending}
                onClick={() => mutate.mutate()}
              >
                {mutate.isPending ? "Criando…" : "Criar campanha"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function toggleAll(
  items: LostItem[],
  selected: Record<string, boolean>,
  setSelected: (v: Record<string, boolean>) => void,
) {
  const all = items.every((i) => selected[i.id]);
  const next: Record<string, boolean> = {};
  if (!all) for (const i of items) next[i.id] = true;
  setSelected(next);
}

