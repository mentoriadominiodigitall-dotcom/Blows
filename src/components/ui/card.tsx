import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[var(--radius-lg)] border border-line bg-paper p-5 shadow-[0_1px_0_rgba(26,24,20,0.04)]",
        className,
      )}
      {...props}
    />
  );
}

export function Badge({
  className,
  tone = "muted",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { tone?: "muted" | "forest" | "rust" | "ok" | "warn" }) {
  const tones = {
    muted: "bg-canvas text-muted",
    forest: "bg-forest/10 text-forest",
    rust: "bg-rust/10 text-rust",
    ok: "bg-ok/10 text-ok",
    warn: "bg-warn/10 text-warn",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className,
      )}
      {...props}
    />
  );
}

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-line/80", className)} {...props} />;
}
