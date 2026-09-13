import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  const { user, isPending } = useCurrentUserState();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!isPending && user) {
    void navigate({ to: "/app" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.signIn.email({ email, password });
    setBusy(false);
    if (err) {
      setError("Não foi possível entrar. Verifique e-mail e senha.");
      return;
    }
    window.location.href = "/app";
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-line bg-paper p-8">
        <p className="font-display text-3xl">REVIVA</p>
        <h1 className="mt-2 font-display text-2xl">Entrar</h1>
        <p className="mt-1 text-sm text-muted">Acesse o painel da sua empresa.</p>
        {authEnabled ? (
          <>
            <form className="mt-6 space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="text-sm text-rust">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={busy}>
                {busy ? "Entrando…" : "Entrar"}
              </Button>
            </form>
            <p className="mt-3 text-sm">
              <Link to="/recuperar-senha" className="text-muted hover:text-ink">
                Esqueci a senha
              </Link>
            </p>
            <div className="my-5 h-px bg-line" />
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/app" })}
                >
                  Continuar com {p.label}
                </Button>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">
              Não tem conta?{" "}
              <Link to="/cadastro" className="text-ink underline-offset-4 hover:underline">
                Criar agora
              </Link>
            </p>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted">O acesso está desativado neste ambiente.</p>
        )}
      </div>
    </main>
  );
}
