export const LOST_CATEGORIES = [
  "inactive",
  "leads",
  "quotes",
  "overdue",
  "repurchase",
] as const;

export type LostCategoryKey = (typeof LOST_CATEGORIES)[number];

export type LostItem = {
  id: string;
  category: LostCategoryKey;
  name: string;
  subtitle: string;
  amount: number;
  priority: "high" | "medium" | "low";
  lastActivity: string | null;
  recommendedAction: string;
  phone: string | null;
  email: string | null;
  consent: boolean;
};

export type LostCategory = {
  key: LostCategoryKey;
  label: string;
  description: string;
  count: number;
  amount: number;
  items: LostItem[];
};

export type LostMoneySnapshot = {
  total: number;
  generatedAt: string;
  inactiveDays: number;
  categories: LostCategory[];
};

export const CATEGORY_META: Record<
  LostCategoryKey,
  { label: string; description: string; action: string }
> = {
  inactive: {
    label: "Clientes inativos",
    description: "Compraram antes e sumiram do radar.",
    action: "Reativar com oferta de retorno",
  },
  leads: {
    label: "Leads parados",
    description: "Oportunidades sem acompanhamento recente.",
    action: "Retomar conversa com contexto",
  },
  quotes: {
    label: "Orçamentos abandonados",
    description: "Propostas enviadas ainda sem resposta.",
    action: "Cobrar retorno da proposta",
  },
  overdue: {
    label: "Cobranças vencidas",
    description: "Valores já faturados e não recebidos.",
    action: "Enviar lembrete de vencimento",
  },
  repurchase: {
    label: "Recompra atrasada",
    description: "Clientes recorrentes que passaram do intervalo usual.",
    action: "Lembrar da reposição",
  },
};

export function priorityForAmount(amount: number, daysIdle: number): LostItem["priority"] {
  if (amount >= 1500 || daysIdle >= 90) return "high";
  if (amount >= 500 || daysIdle >= 45) return "medium";
  return "low";
}
