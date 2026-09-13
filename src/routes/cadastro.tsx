import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { GROK_PROVIDERS, authClient, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/cadastro")({ component: Cadastro });

function Cadastro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setError("A senha precisa ter pelo menos 8 caracteres.");
      return;
    }
    setBusy(true);
    setError(null);
    const { error: err } = await authClient.signUp.email({
      name,
      email,
      password,
      callbackURL: "/onboarding",
    });
    setBusy(false);
    if (err) {
      setError("Não foi possível criar a conta. Tente outro e-mail.");
      return;
    }
    window.location.href = "/onboarding";
  }

  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-line bg-paper p-8">
        <p className="font-display text-3xl">REVIVA</p>
        <h1 className="mt-2 font-display text-2xl">Criar conta</h1>
        <p className="mt-1 text-sm text-muted">Depois você cadastra a empresa e vê o dinheiro perdido.</p>
        {authEnabled ? (
          <>
            <form className="mt-6 space-y-3" onSubmit={onSubmit}>
              <div className="space-y-1">
                <Label htmlFor="name">Seu nome</Label>
                <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="password">Senha</Label>
                <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
              </div>
              {error ? <p className="text-sm text-rust">{error}</p> : null}
              <Button className="w-full" type="submit" disabled={busy}>
                {busy ? "Criando…" : "Criar conta"}
              </Button>
            </form>
            <div className="my-5 h-px bg-line" />
            <div className="space-y-2">
              {GROK_PROVIDERS.map((p) => (
                <Button
                  key={p.providerId}
                  type="button"
                  variant="secondary"
                  className="w-full"
                  onClick={() => signIn(p.providerId, { callbackURL: "/onboarding" })}
                >
                  Continuar com {p.label}
                </Button>
              ))}
            </div>
            <p className="mt-6 text-sm text-muted">
              Já tem conta?{" "}
              <Link to="/login" className="text-ink underline-offset-4 hover:underline">
                Entrar
              </Link>
            </p>
          </>
        ) : (
          <p className="mt-6 text-sm text-muted">Cadastro indisponível neste ambiente.</p>
        )}
      </div>
    </main>
  );
}
