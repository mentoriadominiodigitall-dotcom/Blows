import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { useSessionContext } from "@/hooks/use-session-context";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const { isPending } = useCurrentUserState();
  const session = useSessionContext();
  const appHref = session.data?.hasCompany ? "/app" : "/onboarding";

  return (
    <div className="min-h-screen bg-canvas">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <span className="font-display text-2xl tracking-tight">REVIVA</span>
        <div className="flex items-center gap-3">
          {isPending ? <div className="h-8 w-8 animate-pulse rounded-full bg-line" /> : null}
          <SignedOut>
            <Link to="/login" className="text-sm text-muted hover:text-ink">
              Entrar
            </Link>
            <Button asChild>
              <Link to="/cadastro">Começar</Link>
            </Button>
          </SignedOut>
          <SignedIn>
            <Button asChild variant="secondary">
              <Link to={appHref}>Abrir painel</Link>
            </Button>
            <UserButton />
          </SignedIn>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-10 md:pt-16">
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Receita encontrada</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] tracking-[-0.03em] md:text-6xl">
          Quanto dinheiro sua empresa está deixando escapar — e o que fazer agora.
        </h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          REVIVA encontra clientes inativos, orçamentos sem resposta, leads parados e cobranças vencidas.
          Depois monta a recuperação. Sem inventar métrica. Sem disparo fantasma.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Button asChild size="lg">
            <Link to="/cadastro">
              Recuperar agora <ArrowRight className="size-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="secondary">
            <Link to="/login">Já tenho conta</Link>
          </Button>
        </div>

        <section className="mt-16 grid gap-4 md:grid-cols-4">
          {[
            { k: "Clientes inativos", d: "Quem parou de comprar e quanto isso representa." },
            { k: "Orçamentos", d: "Propostas enviadas que esfriaram no silêncio." },
            { k: "Leads parados", d: "Fila de conversa sem dono e sem próximo passo." },
            { k: "Cobranças", d: "Valores vencidos, prontos para um lembrete correto." },
          ].map((item) => (
            <article key={item.k} className="rounded-[var(--radius-lg)] border border-line bg-paper p-5">
              <h2 className="font-display text-xl">{item.k}</h2>
              <p className="mt-2 text-sm text-muted">{item.d}</p>
            </article>
          ))}
        </section>

        <section className="mt-16 rounded-[var(--radius-xl)] bg-sidebar px-6 py-10 text-sidebar-fg md:px-12">
          <p className="text-xs uppercase tracking-[0.18em] text-sidebar-muted">O ciclo</p>
          <ol className="mt-6 grid gap-6 md:grid-cols-4">
            {["Identificar", "Priorizar", "Executar", "Medir"].map((step, i) => (
              <li key={step}>
                <span className="text-xs tabular-nums text-sidebar-muted">0{i + 1}</span>
                <p className="mt-2 font-display text-2xl">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </main>
    </div>
  );
}
