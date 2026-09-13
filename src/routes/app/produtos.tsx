import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, Badge, Skeleton } from "@/components/ui/card";
import { EmptyState } from "@/components/empty";
import { Input, Label } from "@/components/ui/input";
import { listProducts, upsertProduct } from "@/lib/server/catalog";
import { formatBRL } from "@/lib/money";
import { num } from "@/lib/utils";

export const Route = createFileRoute("/app/produtos")({ component: ProductsPage });

function ProductsPage() {
  const q = useQuery({ queryKey: ["products"], queryFn: () => listProducts() });
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: "", sku: "", price: 0, cost: 0, quantity: 0, minQuantity: 0 });
  const qc = useQueryClient();
  const save = useMutation({
    mutationFn: () => upsertProduct({ data: form }),
    onSuccess: async () => {
      toast.success("Produto salvo.");
      setOpen(false);
      await qc.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="font-display text-4xl">Estoque</h1>
        <Button onClick={() => setOpen(true)}>Novo item</Button>
      </div>
      {q.isLoading ? <Skeleton className="h-40" /> : null}
      {q.data && q.data.length === 0 ? (
        <EmptyState title="Sem produtos" body="Cadastre serviços ou produtos com preço, custo e estoque mínimo." />
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="text-xs uppercase text-muted">
              <tr>
                <th className="px-4 py-3 text-left">Item</th>
                <th className="text-left">SKU</th>
                <th className="text-left">Preço</th>
                <th className="text-left">Custo</th>
                <th className="text-left">Margem</th>
                <th className="text-left">Qtd</th>
              </tr>
            </thead>
            <tbody>
              {q.data?.map((p) => {
                const margin = num(p.price) === 0 ? 0 : ((num(p.price) - num(p.cost)) / num(p.price)) * 100;
                const low = num(p.quantity) <= num(p.min_quantity);
                return (
                  <tr key={p.id} className="border-t border-line">
                    <td className="px-4 py-3">{p.name}</td>
                    <td className="text-muted">{p.sku ?? "—"}</td>
                    <td className="tabular-nums">{formatBRL(p.price)}</td>
                    <td className="tabular-nums">{formatBRL(p.cost)}</td>
                    <td className="tabular-nums">{margin.toFixed(0)}%</td>
                    <td>
                      {low ? <Badge tone="rust">baixo · {p.quantity}</Badge> : <span className="tabular-nums">{p.quantity}</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Card>
      )}
      {open ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 p-4">
          <form
            className="w-full max-w-md space-y-3 rounded-[var(--radius-xl)] bg-paper p-6"
            onSubmit={(e) => {
              e.preventDefault();
              save.mutate();
            }}
          >
            <h2 className="font-display text-2xl">Produto</h2>
            <Label>Nome</Label>
            <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <Label>SKU</Label>
            <Input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <Label>Preço</Label>
            <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
            <Label>Custo</Label>
            <Input type="number" value={form.cost} onChange={(e) => setForm({ ...form, cost: Number(e.target.value) })} />
            <div className="flex gap-2">
              <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
