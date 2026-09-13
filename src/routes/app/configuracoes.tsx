import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { useSessionContext } from "@/hooks/use-session-context";
import { authClient } from "@/lib/auth/client";
import { probeTenantIsolation } from "@/lib/server/isolation-probe";

export const Route = createFileRoute("/app/configuracoes")({ component: SettingsPage });

function SettingsPage() {
  const session = useSessionContext();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const probe = useMutation({
    mutationFn: () => probeTenantIsolation(),
    onSuccess: (res) => {
      if (res.isolated) toast.success("Isolamento entre empresas confirmado.");
      else toast.error("Falha de isolamento.");
    },
    onError: () => toast.error("Não foi possível executar o teste."),
  });
  const t = session.data?.tenant;
  const i = session.data?.integrations;

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    const { error } = await authClient.changePassword({
      currentPassword,
      newPassword,
    });
    if (error) {
      toast.error("Não foi possível alterar a senha.");
      return;
    }
    toast.success("Senha alterada.");
    setCurrentPassword("");
    setNewPassword("");
  }

  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Configurações</h1>
      <Card>
        <p className="text-xs uppercase tracking-[0.14em] text-muted">Empresa</p>
        <p className="mt-2 font-display text-2xl">{t?.companyName}</p>
        <p className="text-sm text-muted">
          {t?.segment ?? "Segmento não informado"} · {t?.currency} · plano {t?.planSlug}
        </p>
      </Card>
      <Card>
        <h2 className="font-display text-xl">Integrações</h2>
        <ul className="mt-3 space-y-2 text-sm">
          <li>WhatsApp Business API — {i?.whatsapp ? "configurado" : "configuração necessária"}</li>
          <li>Stripe — {i?.stripe ? "configurado" : "configuração necessária"}</li>
          <li>IA (xAI) — {i?.ai ? "configurada" : "configuração necessária"}</li>
        </ul>
      </Card>
      <Card>
        <h2 className="font-display text-xl">Alterar senha</h2>
        <form className="mt-3 max-w-sm space-y-2" onSubmit={changePassword}>
          <Label htmlFor="current">Senha atual</Label>
          <Input
            id="current"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Label htmlFor="next">Nova senha</Label>
          <Input
            id="next"
            type="password"
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Button type="submit">Salvar senha</Button>
        </form>
      </Card>
      <Card>
        <h2 className="font-display text-xl">Segurança</h2>
        <p className="mt-2 text-sm text-muted">
          Teste de isolamento: cria um cliente em outra empresa e tenta lê-lo com a sessão atual. Deve falhar.
        </p>
        <Button className="mt-4" variant="secondary" onClick={() => probe.mutate()} disabled={probe.isPending}>
          {probe.isPending ? "Testando…" : "Rodar teste de isolamento"}
        </Button>
        {t?.isPlatformAdmin ? (
          <p className="mt-4 text-sm">
            <Link to="/plataforma" className="underline-offset-4 hover:underline">
              Abrir painel da plataforma
            </Link>
          </p>
        ) : null}
      </Card>
    </div>
  );
}
