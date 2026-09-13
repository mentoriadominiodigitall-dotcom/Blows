import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { completeOnboarding, createCompany } from "@/lib/server/session";
import { useSessionContext } from "@/hooks/use-session-context";
import { Skeleton } from "@/components/ui/card";

export const Route = createFileRoute("/onboarding")({ component: Onboarding });

const SEGMENTS = [
  "Clínica e saúde",
  "Comércio",
  "Serviços",
  "Alimentação",
  "Educação",
  "Indústria",
  "Outro",
];

function Onboarding() {
  const { user, isPending } = useCurrentUserState();
  const session = useSessionContext();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [segment, setSegment] = useState(SEGMENTS[0]);
  const [approx, setApprox] = useState("80");
  const [currency, setCurrency] = useState("BRL");
  const [seedDemo, setSeedDemo] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (isPending || session.isLoading) {
    return (
      <main className="grid min-h-screen place-items-center">
        <Skeleton className="h-64 w-full max-w-lg" />
      </main>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (session.data?.hasCompany && session.data.tenant?.onboardingCompleted) {
    void navigate({ to: "/app" });
  }

  async function finish() {
    setBusy(true);
    setError(null);
    try {
      if (!session.data?.hasCompany) {
        await createCompany({
          data: {
            name,
            segment,
            approxCustomers: Number(approx) || 0,
            currency,
            seedDemo,
          },
        });
      }
      await completeOnboarding();
      window.location.href = "/app";
    } catch {
      setError("Não foi possível concluir. Tente de novo.");
      setBusy(false);
    }
  }

  const steps = [
    {
      title: "Nome da empresa",
      body: (
        <div className="space-y-1">
          <Label htmlFor="company">Como sua empresa é chamada?</Label>
          <Input id="company" value={name} onChange={(e) => setName(e.target.value)} placeholder="Clínica Norte" />
        </div>
      ),
    },
    {
      title: "Segmento",
      body: (
        <div className="grid grid-cols-2 gap-2">
          {SEGMENTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSegment(s)}
              className={`min-h-11 rounded-[var(--radius-sm)] border px-3 text-sm ${segment === s ? "border-forest bg-forest/10" : "border-line bg-paper"}`}
            >
              {s}
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Escala",
      body: (
        <div className="space-y-1">
          <Label htmlFor="approx">Número aproximado de clientes</Label>
          <Input id="approx" type="number" min={0} value={approx} onChange={(e) => setApprox(e.target.value)} />
        </div>
      ),
    },
    {
      title: "Moeda",
      body: (
        <select
          className="h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3"
          value={currency}
          onChange={(e) => setCurrency(e.target.value)}
        >
          <option value="BRL">Real (BRL)</option>
          <option value="USD">Dólar (USD)</option>
          <option value="EUR">Euro (EUR)</option>
        </select>
      ),
    },
    {
      title: "Dados de demonstração",
      body: (
        <label className="flex items-start gap-3 rounded-[var(--radius-md)] border border-line bg-canvas p-4 text-sm">
          <input type="checkbox" checked={seedDemo} onChange={(e) => setSeedDemo(e.target.checked)} className="mt-1" />
          <span>
            Carregar um conjunto de exemplo (clientes, orçamentos, cobranças) para ver o Dinheiro perdido funcionando.
            Sem este passo, o painel abre vazio — o correto para uma empresa nova.
          </span>
        </label>
      ),
    },
  ];

  const current = steps[step];

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-4 py-10">
      <p className="font-display text-3xl">REVIVA</p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted">
        Passo {step + 1} de {steps.length}
      </p>
      <h1 className="mt-3 font-display text-3xl">{current.title}</h1>
      <div className="mt-6">{current.body}</div>
      {error ? <p className="mt-3 text-sm text-rust">{error}</p> : null}
      <div className="mt-8 flex gap-3">
        {step > 0 ? (
          <Button variant="secondary" onClick={() => setStep((s) => s - 1)}>
            Voltar
          </Button>
        ) : null}
        {step < steps.length - 1 ? (
          <Button
            onClick={() => {
              if (step === 0 && name.trim().length < 2) {
                setError("Informe o nome da empresa.");
                return;
              }
              setError(null);
              setStep((s) => s + 1);
            }}
          >
            Continuar
          </Button>
        ) : (
          <Button onClick={() => void finish()} disabled={busy}>
            {busy ? "Preparando…" : "Abrir o painel"}
          </Button>
        )}
      </div>
    </main>
  );
}
