export const ROLE_SLUGS = [
  "owner",
  "admin",
  "manager",
  "seller",
  "finance",
  "attendant",
] as const;

export type RoleSlug = (typeof ROLE_SLUGS)[number];

export const ROLE_LABELS: Record<RoleSlug, string> = {
  owner: "Proprietário",
  admin: "Administrador",
  manager: "Gerente",
  seller: "Vendedor",
  finance: "Financeiro",
  attendant: "Atendente",
};

export const PERMISSIONS = [
  "customers.read",
  "customers.write",
  "leads.read",
  "leads.write",
  "deals.read",
  "deals.write",
  "quotes.read",
  "quotes.write",
  "sales.read",
  "sales.write",
  "products.read",
  "products.write",
  "finance.read",
  "finance.write",
  "campaigns.read",
  "campaigns.write",
  "automations.read",
  "automations.write",
  "team.read",
  "team.write",
  "ai.use",
  "settings.write",
  "billing.manage",
  "audit.read",
] as const;

export type PermissionSlug = (typeof PERMISSIONS)[number];

const DEFAULT_ROLE_PERMISSIONS: Record<RoleSlug, PermissionSlug[] | "*"> = {
  owner: "*",
  admin: PERMISSIONS.filter((p) => p !== "billing.manage"),
  manager: [
    "customers.read",
    "customers.write",
    "leads.read",
    "leads.write",
    "deals.read",
    "deals.write",
    "quotes.read",
    "quotes.write",
    "sales.read",
    "products.read",
    "finance.read",
    "campaigns.read",
    "campaigns.write",
    "team.read",
    "ai.use",
    "audit.read",
  ],
  seller: [
    "customers.read",
    "customers.write",
    "leads.read",
    "leads.write",
    "deals.read",
    "deals.write",
    "quotes.read",
    "quotes.write",
    "sales.read",
    "sales.write",
    "products.read",
    "ai.use",
  ],
  finance: [
    "customers.read",
    "sales.read",
    "quotes.read",
    "finance.read",
    "finance.write",
    "products.read",
    "ai.use",
  ],
  attendant: ["customers.read", "customers.write", "leads.read", "products.read"],
};

export function permissionsForRole(role: RoleSlug): Set<PermissionSlug> {
  const listed = DEFAULT_ROLE_PERMISSIONS[role];
  if (listed === "*") return new Set(PERMISSIONS);
  return new Set(listed);
}

export function hasPermission(
  role: RoleSlug,
  permission: PermissionSlug,
  overrides?: { permission_slug: string; allowed: boolean }[],
): boolean {
  if (role === "owner") return true;
  const base = permissionsForRole(role);
  let allowed = base.has(permission);
  if (overrides) {
    const hit = overrides.find((o) => o.permission_slug === permission);
    if (hit) allowed = hit.allowed;
  }
  return allowed;
}

export function isRoleSlug(value: string): value is RoleSlug {
  return (ROLE_SLUGS as readonly string[]).includes(value);
}
