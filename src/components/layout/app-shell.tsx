import { Link, Navigate, Outlet, useRouterState } from "@tanstack/react-router";
import {
  Bell,
  Calendar,
  ChevronRight,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { RedirectToSignIn, UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { useSessionContext } from "@/hooks/use-session-context";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/card";
import { formatCompact } from "@/lib/money";
import { useQuery } from "@tanstack/react-query";
import { getLostMoney } from "@/lib/server/lost-money";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/app", label: "Visão geral", icon: LayoutDashboard },
  { href: "/app/dinheiro-perdido", label: "Dinheiro perdido", icon: CircleDollarSign, highlight: true },
  { href: "/app/clientes", label: "Clientes" },
  { href: "/app/leads", label: "Leads" },
  { href: "/app/funil", label: "Funil" },
  { href: "/app/orcamentos", label: "Orçamentos" },
  { href: "/app/financeiro", label: "Financeiro" },
  { href: "/app/produtos", label: "Estoque" },
  { href: "/app/campanhas", label: "Campanhas" },
  { href: "/app/automacoes", label: "Automações" },
  { href: "/app/agenda", label: "Agenda", icon: Calendar },
  { href: "/app/ia", label: "IA", icon: Sparkles },
  { href: "/app/equipe", label: "Equipe", icon: Users },
  { href: "/app/fidelidade", label: "Fidelidade" },
  { href: "/app/auditoria", label: "Auditoria" },
  { href: "/app/assinatura", label: "Assinatura" },
  { href: "/app/configuracoes", label: "Configurações" },
];

export function AppShell() {
  const { user, isPending } = useCurrentUserState();
  const session = useSessionContext();
  const [open, setOpen] = useState(false);

  if (isPending) {
    return (
      <div className="flex min-h-screen bg-canvas">
        <div className="hidden w-64 bg-sidebar md:block" />
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-6 h-40 w-full" />
        </div>
      </div>
    );
  }
  if (!user) return <RedirectToSignIn />;
  if (session.isLoading) {
    return (
      <div className="flex min-h-screen bg-canvas">
        <div className="hidden w-64 bg-sidebar md:block" />
        <div className="flex-1 p-8">
          <Skeleton className="h-8 w-48" />
        </div>
      </div>
    );
  }
  if (session.data && !session.data.hasCompany) {
    return <Navigate to="/onboarding" />;
  }

  return (
    <div className="min-h-screen bg-canvas md:flex">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar text-sidebar-fg transition-transform md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Link to="/app" className="font-display text-2xl tracking-tight text-sidebar-fg">
              REVIVA
            </Link>
            <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Fechar menu">
              <X className="size-5" />
            </button>
          </div>
          <LostRail />
          <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
            {NAV.map((item) => (
              <NavItem key={item.href} href={item.href} onClick={() => setOpen(false)} highlight={item.highlight}>
                {item.label}
              </NavItem>
            ))}
          </nav>
          <div className="border-t border-white/10 px-4 py-4 text-xs text-sidebar-muted">
            <p className="truncate text-sidebar-fg">{session.data?.tenant?.companyName}</p>
            <p>{session.data?.tenant?.roleLabel}</p>
          </div>
        </div>
      </aside>
      {open ? (
        <button
          className="fixed inset-0 z-30 bg-ink/40 md:hidden"
          aria-label="Fechar"
          onClick={() => setOpen(false)}
        />
      ) : null}
      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setOpen(true)} aria-label="Menu">
              <Menu className="size-5" />
            </Button>
            <Breadcrumb />
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/app/notificacoes"
              className="relative grid size-11 place-items-center rounded-[var(--radius-sm)] hover:bg-ink/5"
              aria-label="Notificações"
            >
              <Bell className="size-4" />
              {(session.data?.unreadNotifications ?? 0) > 0 ? (
                <span className="absolute right-2 top-2 size-2 rounded-full bg-rust" />
              ) : null}
            </Link>
            <UserButton />
          </div>
        </header>
        <main className="px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function NavItem({
  href,
  children,
  onClick,
  highlight,
}: {
  href: string;
  children: ReactNode;
  onClick: () => void;
  highlight?: boolean;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const active = href === "/app" ? pathname === "/app" : pathname.startsWith(href);
  return (
    <Link
      to={href}
      onClick={onClick}
      className={cn(
        "flex min-h-11 items-center rounded-[var(--radius-sm)] px-3 text-sm transition-colors",
        active ? "bg-white/10 text-sidebar-fg" : "text-sidebar-muted hover:bg-white/5 hover:text-sidebar-fg",
        highlight && !active && "text-sidebar-fg",
      )}
    >
      {children}
    </Link>
  );
}

function LostRail() {
  const q = useQuery({ queryKey: ["lost-money-rail"], queryFn: () => getLostMoney(), staleTime: 30_000 });
  const total = q.data?.total ?? 0;
  return (
    <Link
      to="/app/dinheiro-perdido"
      className="mx-3 mb-4 block rounded-[var(--radius-md)] border border-white/10 bg-white/5 px-3 py-3"
    >
      <p className="text-[11px] uppercase tracking-[0.14em] text-sidebar-muted">Dinheiro perdido</p>
      <p className="mt-1 font-display text-2xl tabular-nums text-sidebar-fg">
        {q.isLoading ? "—" : formatCompact(total)}
      </p>
      <p className="mt-1 flex items-center gap-1 text-xs text-sidebar-muted">
        Recuperar agora <ChevronRight className="size-3" />
      </p>
    </Link>
  );
}

function Breadcrumb() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = NAV.find((n) => (n.href === "/app" ? pathname === "/app" : pathname.startsWith(n.href)));
  return (
    <div className="text-sm text-muted">
      <span>REVIVA</span>
      <span className="mx-2">/</span>
      <span className="text-ink">{current?.label ?? "Painel"}</span>
    </div>
  );
}
