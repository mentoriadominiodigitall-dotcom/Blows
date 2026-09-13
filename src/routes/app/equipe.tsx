import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import { getTeam } from "@/lib/server/ops";
import { inviteMember } from "@/lib/server/session";
import { ROLE_SLUGS, ROLE_LABELS, type RoleSlug } from "@/lib/permissions";
import { formatBRL } from "@/lib/money";

export const Route = createFileRoute("/app/equipe")({ component: TeamPage });

function TeamPage() {
  const q = useQuery({ queryKey: ["team"], queryFn: () => getTeam() });
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<RoleSlug>("seller");
  const qc = useQueryClient();
  const invite = useMutation({
    mutationFn: () => inviteMember({ data: { email, role } }),
    onSuccess: async (res) => {
      toast.success(`Convite gerado. Token interno: ${res.token.slice(0, 8)}…`);
      setEmail("");
      await qc.invalidateQueries({ queryKey: ["team"] });
    },
    onError: () => toast.error("Não foi possível convidar."),
  });

  if (q.isLoading) return <Skeleton className="h-40" />;
  if (!q.data) return <p className="text-sm text-rust">Sem permissão ou falha ao carregar.</p>;

  return (
    <div className="space-y-5">
      <h1 className="font-display text-4xl">Equipe</h1>
      <div className="grid gap-3 md:grid-cols-2">
        {q.data.members.map((m) => (
          <Card key={m.user_id}>
            <p className="font-medium">{m.full_name ?? m.user_id.slice(0, 8)}</p>
            <p className="text-sm text-muted">{m.roleLabel}</p>
            <p className="mt-2 text-sm tabular-nums">
              {m.salesCount} vendas · {formatBRL(m.sales)}
            </p>
            <Badge className="mt-2">{m.status}</Badge>
          </Card>
        ))}
      </div>
      <Card>
        <h2 className="font-display text-xl">Convidar</h2>
        <form
          className="mt-3 flex flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            invite.mutate();
          }}
        >
          <Label className="sr-only">E-mail</Label>
          <Input type="email" required placeholder="email@empresa.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select
            className="h-11 rounded-[var(--radius-sm)] border border-line bg-paper px-3 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value as RoleSlug)}
          >
            {ROLE_SLUGS.filter((r) => r !== "owner").map((r) => (
              <option key={r} value={r}>
                {ROLE_LABELS[r]}
              </option>
            ))}
          </select>
          <Button type="submit">Convidar</Button>
        </form>
        <p className="mt-2 text-xs text-muted">
          O e-mail transacional exige provedor configurado. O convite fica registrado com token e validade de 7 dias.
        </p>
      </Card>
    </div>
  );
}

