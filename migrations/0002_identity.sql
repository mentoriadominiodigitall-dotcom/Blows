-- REVIVA identity, tenancy, RBAC, billing metadata.
-- Isolation is enforced in application queries via membership-resolved company_id.
-- RLS policies are defense-in-depth for a non-owner database role in production.

create table if not exists companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  segment text,
  approx_customers integer,
  currency text not null default 'BRL',
  timezone text not null default 'America/Sao_Paulo',
  status text not null default 'active',
  onboarding_completed boolean not null default false,
  demo_mode boolean not null default false,
  created_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint companies_status_chk check (status in ('active', 'suspended', 'cancelled'))
);

create table if not exists profiles (
  user_id text primary key,
  full_name text,
  phone text,
  avatar_url text,
  current_company_id uuid references companies(id) on delete set null,
  is_platform_admin boolean not null default false,
  mfa_enabled boolean not null default false,
  locale text not null default 'pt-BR',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists company_members (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id text not null,
  role_slug text not null,
  status text not null default 'active',
  invited_by text,
  invited_email text,
  accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_members_unique unique (company_id, user_id),
  constraint company_members_status_chk check (status in ('invited', 'active', 'disabled')),
  constraint company_members_role_chk check (role_slug in (
    'owner', 'admin', 'manager', 'seller', 'finance', 'attendant'
  ))
);

create index if not exists company_members_user_idx on company_members (user_id, status);
create index if not exists company_members_company_idx on company_members (company_id, status);

create table if not exists permissions (
  slug text primary key,
  name text not null,
  module text not null
);

create table if not exists role_permissions (
  role_slug text not null,
  permission_slug text not null references permissions(slug) on delete cascade,
  primary key (role_slug, permission_slug)
);

create table if not exists company_role_permissions (
  company_id uuid not null references companies(id) on delete cascade,
  role_slug text not null,
  permission_slug text not null,
  allowed boolean not null default true,
  primary key (company_id, role_slug, permission_slug)
);

create table if not exists company_settings (
  company_id uuid primary key references companies(id) on delete cascade,
  inactive_days integer not null default 60,
  lead_idle_days integer not null default 7,
  quote_idle_days integer not null default 7,
  repurchase_multiplier numeric(6,2) not null default 1.50,
  whatsapp_phone_id text,
  whatsapp_configured boolean not null default false,
  fiscal_name text,
  document text,
  address text,
  default_payment_method text,
  modules jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists plans (
  slug text primary key,
  name text not null,
  price_cents integer not null,
  currency text not null default 'BRL',
  interval text not null default 'month',
  description text,
  features jsonb not null default '[]'::jsonb,
  limits jsonb not null default '{}'::jsonb,
  sort_order integer not null default 0
);

create table if not exists company_subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references companies(id) on delete cascade,
  plan_slug text not null references plans(slug),
  status text not null default 'trialing',
  provider text not null default 'manual',
  provider_customer_id text,
  provider_subscription_id text,
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint company_subscriptions_status_chk check (status in (
    'trialing', 'active', 'past_due', 'cancelled', 'incomplete', 'unpaid'
  ))
);

insert into permissions (slug, name, module) values
  ('customers.read', 'Ver clientes', 'crm'),
  ('customers.write', 'Editar clientes', 'crm'),
  ('leads.read', 'Ver leads', 'crm'),
  ('leads.write', 'Editar leads', 'crm'),
  ('deals.read', 'Ver funil', 'crm'),
  ('deals.write', 'Editar funil', 'crm'),
  ('quotes.read', 'Ver orçamentos', 'sales'),
  ('quotes.write', 'Editar orçamentos', 'sales'),
  ('sales.read', 'Ver vendas', 'sales'),
  ('sales.write', 'Registrar vendas', 'sales'),
  ('products.read', 'Ver produtos', 'inventory'),
  ('products.write', 'Editar produtos', 'inventory'),
  ('finance.read', 'Ver financeiro', 'finance'),
  ('finance.write', 'Editar financeiro', 'finance'),
  ('campaigns.read', 'Ver campanhas', 'marketing'),
  ('campaigns.write', 'Editar campanhas', 'marketing'),
  ('automations.read', 'Ver automações', 'ops'),
  ('automations.write', 'Editar automações', 'ops'),
  ('team.read', 'Ver equipe', 'team'),
  ('team.write', 'Gerenciar equipe', 'team'),
  ('ai.use', 'Usar IA', 'ai'),
  ('settings.write', 'Alterar configurações', 'settings'),
  ('billing.manage', 'Gerenciar assinatura', 'billing'),
  ('audit.read', 'Ver auditoria', 'security')
on conflict (slug) do nothing;

insert into role_permissions (role_slug, permission_slug)
select 'owner', slug from permissions
on conflict do nothing;

insert into role_permissions (role_slug, permission_slug)
select 'admin', slug from permissions where slug not in ('billing.manage')
on conflict do nothing;

insert into role_permissions (role_slug, permission_slug) values
  ('manager', 'customers.read'), ('manager', 'customers.write'),
  ('manager', 'leads.read'), ('manager', 'leads.write'),
  ('manager', 'deals.read'), ('manager', 'deals.write'),
  ('manager', 'quotes.read'), ('manager', 'quotes.write'),
  ('manager', 'sales.read'), ('manager', 'products.read'),
  ('manager', 'finance.read'), ('manager', 'campaigns.read'),
  ('manager', 'campaigns.write'), ('manager', 'team.read'),
  ('manager', 'ai.use'), ('manager', 'audit.read'),
  ('seller', 'customers.read'), ('seller', 'customers.write'),
  ('seller', 'leads.read'), ('seller', 'leads.write'),
  ('seller', 'deals.read'), ('seller', 'deals.write'),
  ('seller', 'quotes.read'), ('seller', 'quotes.write'),
  ('seller', 'sales.read'), ('seller', 'sales.write'),
  ('seller', 'products.read'), ('seller', 'ai.use'),
  ('finance', 'customers.read'), ('finance', 'sales.read'),
  ('finance', 'quotes.read'), ('finance', 'finance.read'),
  ('finance', 'finance.write'), ('finance', 'products.read'),
  ('finance', 'ai.use'),
  ('attendant', 'customers.read'), ('attendant', 'customers.write'),
  ('attendant', 'leads.read'), ('attendant', 'products.read')
on conflict do nothing;

insert into plans (slug, name, price_cents, description, features, limits, sort_order) values
  ('starter', 'Starter', 3990, 'Para começar a recuperar receita parada.',
    '["Dinheiro perdido","CRM","Funil","1 usuário"]'::jsonb,
    '{"users":1,"customers":500,"campaigns":2}'::jsonb, 1),
  ('professional', 'Professional', 7990, 'Operação completa para times pequenos.',
    '["Tudo do Starter","Financeiro","Campanhas","IA de recuperação","5 usuários"]'::jsonb,
    '{"users":5,"customers":5000,"campaigns":20}'::jsonb, 2),
  ('premium', 'Premium', 14990, 'Gestão, automação e previsão.',
    '["Tudo do Professional","Automações","Estoque","Agenda","15 usuários"]'::jsonb,
    '{"users":15,"customers":25000,"campaigns":100}'::jsonb, 3),
  ('enterprise', 'Enterprise', 29900, 'Limites altos, suporte dedicado e módulos extras.',
    '["Tudo do Premium","Painel avançado","Limites sob medida","SLA"]'::jsonb,
    '{"users":100,"customers":-1,"campaigns":-1}'::jsonb, 4)
on conflict (slug) do nothing;
