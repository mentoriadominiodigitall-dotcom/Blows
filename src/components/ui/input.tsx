import type { InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 text-sm text-ink placeholder:text-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
        className,
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-[var(--radius-sm)] border border-line bg-paper px-3 py-2 text-sm text-ink placeholder:text-muted/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest/30",
        className,
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-medium text-ink", className)} {...props} />;
}
