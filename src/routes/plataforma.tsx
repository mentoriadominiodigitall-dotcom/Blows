import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { RedirectToSignIn } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { useSessionContext } from "@/hooks/use-session-context";
import { platformOverview, setCompanyStatus } from "@/lib/server/ops";

export const Route = createFileRoute("/plataforma")({ component: PlatformPage });

function PlatformPage() {
  const { user, isPending } = useCurrentUserState();
  const session = useSessionContext();
  const q = useQuery({
    queryKey: ["platform"],
    queryFn: () => platformOverview(),
    enabled: Boolean(session.data?.tenant?.isPlatformAdmin),
  });
  const qc = useQueryClient();
  const setStatus = useMutation({
    mutationFn: (input: { companyId: string; status: "active" | "suspended" }) => setCompanyStatus({ data: input }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["platform"] }),
  });

  if (isPending || session.isLoading) return <Skeleton className="m-8 h-40" />;
  if (!user) return <RedirectToSignIn />;
  if (!session.data?.tenant?.isPlatformAdmin) {
    return (
      <main className="grid min-h-screen place-items-center p-6">
        <Card className="max-w-md">
          <h1 className="font-display text-2xl">Acesso negado</h1>
          <p className="mt-2 text-sm text-muted">
            O painel da plataforma só abre para operadores autorizados. Tentativas ficam na auditoria de segurança.
          </p>
          <Button asChild className="mt-4">
            <Link to="/app">Voltar</Link>
          </Button>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Plataforma</h1>
        <Button asChild variant="secondary">
          <Link to="/app">Voltar ao app</Link>
        </Button>
      </div>
      <p className="text-sm text-muted">Usuários totais: {q.data?.users ?? "—"}</p>
      {q.isLoading ? <Skeleton className="h-40" /> : null}
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Empresa</th>
              <th className="text-left">Plano</th>
              <th className="text-left">Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {q.data?.companies.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="px-4 py-3">{c.name}</td>
                <td>
                  {c.plan_slug} · {c.sub_status}
                </td>
                <td>
                  <Badge tone={c.status === "suspended" ? "rust" : "ok"}>{c.status}</Badge>
                </td>
                <td>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      setStatus.mutate({
                        companyId: c.id,
                        status: c.status === "suspended" ? "active" : "suspended",
                      })
                    }
                  >
                    {c.status === "suspended" ? "Reativar" : "Suspender"}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card>
        <h2 className="font-display text-xl">Eventos de segurança</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {q.data?.events.map((e) => (
            <li key={e.id} className="flex justify-between gap-3">
              <span>
                {e.type} · {e.detail}
              </span>
              <span className="text-muted">{new Date(e.created_at).toLocaleString("pt-BR")}</span>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
