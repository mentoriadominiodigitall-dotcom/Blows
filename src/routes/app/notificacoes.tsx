import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { listNotifications, markNotificationsRead } from "@/lib/server/session";

export const Route = createFileRoute("/app/notificacoes")({ component: NotificationsPage });

function NotificationsPage() {
  const q = useQuery({ queryKey: ["notifications"], queryFn: () => listNotifications() });
  const qc = useQueryClient();
  const read = useMutation({
    mutationFn: () => markNotificationsRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ["notifications"] });
      void qc.invalidateQueries({ queryKey: ["session-context"] });
    },
  });
  if (q.isLoading) return <Skeleton className="h-40" />;
  if (!q.data?.length) return <EmptyState title="Tudo em dia" body="Avisos de leads, estoque, cobranças e recuperação aparecem aqui." />;
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Notificações</h1>
        <Button variant="secondary" onClick={() => read.mutate()}>
          Marcar lidas
        </Button>
      </div>
      <div className="space-y-2">
        {q.data.map((n) => (
          <Card key={n.id} className="p-4">
            <p className="font-medium">{n.title}</p>
            <p className="mt-1 text-sm text-muted">{n.body}</p>
            {n.href ? (
              <a href={n.href} className="mt-2 inline-block text-sm underline-offset-4 hover:underline">
                Abrir
              </a>
            ) : null}
          </Card>
        ))}
      </div>
    </div>
  );
}
