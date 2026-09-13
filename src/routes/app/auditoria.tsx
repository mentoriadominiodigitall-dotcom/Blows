import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Card, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { listAudit } from "@/lib/server/ops";

export const Route = createFileRoute("/app/auditoria")({ component: AuditPage });

function AuditPage() {
  const q = useQuery({ queryKey: ["audit"], queryFn: () => listAudit() });
  if (q.isLoading) return <Skeleton className="h-40" />;
  if (!q.data?.length) {
    return <EmptyState title="Sem eventos ainda" body="Criações, alterações financeiras e convites aparecem aqui. Logs não podem ser apagados pelo usuário comum." />;
  }
  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Auditoria</h1>
      <Card className="overflow-x-auto p-0">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="text-xs uppercase text-muted">
            <tr>
              <th className="px-4 py-3 text-left">Quando</th>
              <th className="text-left">Ação</th>
              <th className="text-left">Entidade</th>
              <th className="text-left">Campo</th>
              <th className="text-left">Antes → Depois</th>
            </tr>
          </thead>
          <tbody>
            {q.data.map((row) => (
              <tr key={row.id} className="border-t border-line">
                <td className="px-4 py-3 text-xs text-muted">{new Date(row.created_at).toLocaleString("pt-BR")}</td>
                <td>{row.action}</td>
                <td>
                  {row.entity} {row.entity_id ? `· ${row.entity_id.slice(0, 8)}` : ""}
                </td>
                <td>{row.field ?? "—"}</td>
                <td className="text-muted">
                  {row.before_value ?? "—"} → {row.after_value ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
