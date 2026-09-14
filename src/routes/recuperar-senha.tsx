import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";

export const Route = createFileRoute("/recuperar-senha")({ component: Recover });

function Recover() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch("/api/auth/request-password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, redirectTo: "/login" }),
      });
      if (!res.ok) {
        setMessage(
          "Não foi possível enviar o e-mail de recuperação. A entrega exige um provedor de e-mail configurado no servidor de autenticação.",
        );
        return;
      }
      setMessage("Se este e-mail existir e o provedor estiver configurado, as instruções serão enviadas.");
    } catch {
      setMessage(
        "Não foi possível enviar o e-mail de recuperação. A entrega exige um provedor de e-mail configurado.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center px-4">
      <div className="w-full max-w-md rounded-[var(--radius-xl)] border border-line bg-paper p-8">
        <h1 className="font-display text-2xl">Recuperar senha</h1>
        <form className="mt-6 space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <Label htmlFor="email">E-mail</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button className="w-full" disabled={busy}>
            {busy ? "Enviando…" : "Enviar instruções"}
          </Button>
        </form>
        {message ? <p className="mt-4 text-sm text-muted">{message}</p> : null}
        <Link to="/login" className="mt-6 inline-block text-sm text-muted hover:text-ink">
          Voltar ao login
        </Link>
      </div>
    </main>
  );
}
