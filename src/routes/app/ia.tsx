import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { runAi } from "@/lib/server/ops";

export const Route = createFileRoute("/app/ia")({ component: AiPage });

const KINDS = [
  { id: "recovery" as const, title: "IA de recuperação", body: "Quem contactar primeiro, com justificativa." },
  { id: "sales" as const, title: "IA de vendas", body: "Leitura do funil a partir das etapas reais." },
  { id: "finance" as const, title: "IA financeira", body: "Receita, despesa e margem do mês." },
  { id: "management" as const, title: "IA de gestão", body: "Resumo executivo curto." },
  { id: "campaign" as const, title: "IA de campanhas", body: "Sugestão de mensagem para inativos." },
  { id: "forecast" as const, title: "IA de previsão", body: "Estimativa conservadora com os dados atuais." },
];

function AiPage() {
  const [kind, setKind] = useState<(typeof KINDS)[number]["id"]>("recovery");
  const [text, setText] = useState<string | null>(null);
  const run = useMutation({
    mutationFn: () => runAi({ data: { kind } }),
    onSuccess: (res) => {
      if (!res.ok) {
        setText(
          res.reason === "not_configured"
            ? "IA indisponível neste ambiente. A chave do provedor não está configurada — nada foi inventado."
            : "O provedor de IA retornou erro. Tente de novo em instantes.",
        );
        return;
      }
      setText(res.text);
    },
  });

  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">IA</h1>
      <p className="max-w-2xl text-sm text-muted">
        A IA não consulta o banco diretamente. Cada botão envia um recorte já filtrado pela sua empresa. Nada é executado
        automaticamente.
      </p>
      <div className="grid gap-3 md:grid-cols-2">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => {
              setKind(k.id);
              setText(null);
            }}
            className={`rounded-[var(--radius-lg)] border p-4 text-left ${kind === k.id ? "border-ink bg-paper" : "border-line bg-paper/70"}`}
          >
            <p className="font-medium">{k.title}</p>
            <p className="mt-1 text-sm text-muted">{k.body}</p>
          </button>
        ))}
      </div>
      <Button onClick={() => run.mutate()} disabled={run.isPending}>
        {run.isPending ? "Analisando…" : "Gerar recomendação"}
      </Button>
      {text ? (
        <Card>
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{text}</pre>
        </Card>
      ) : null}
    </div>
  );
}
