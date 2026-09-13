import { formatBRL, formatInt } from "@/lib/money";

export function Money({ value, className }: { value: unknown; className?: string }) {
  return <span className={`tabular-nums ${className ?? ""}`}>{formatBRL(value)}</span>;
}

export function Count({ value }: { value: unknown }) {
  return <span className="tabular-nums">{formatInt(value)}</span>;
}
