-- Finance, campaigns, automations, agenda, loyalty, goals, analytics, security.

create table if not exists financial_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  kind text not null default 'checking',
  opening_balance numeric(14,2) not null default 0
);

create table if not exists transaction_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  kind text not null,
  constraint transaction_categories_kind_chk check (kind in ('income', 'expense')),
  unique (company_id, name, kind)
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  account_id uuid references financial_accounts(id) on delete set null,
  category_id uuid references transaction_categories(id) on delete set null,
  kind text not null,
  amount numeric(14,2) not null,
  occurred_at date not null,
  due_date date,
  paid_at date,
  status text not null default 'paid',
  description text not null,
  counterparty text,
  customer_id uuid references customers(id) on delete set null,
  sale_id uuid references sales(id) on delete set null,
  recurring_id uuid,
  created_by text,
  created_at timestamptz not null default now(),
  constraint transactions_kind_chk check (kind in ('income', 'expense')),
  constraint transactions_status_chk check (status in ('pending', 'paid', 'overdue', 'cancelled'))
);

create index if not exists transactions_company_date_idx on transactions (company_id, occurred_at desc);
create index if not exists transactions_company_status_idx on transactions (company_id, status, due_date);

create table if not exists invoices (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  number integer not null,
  amount numeric(14,2) not null,
  amount_paid numeric(14,2) not null default 0,
  due_date date not null,
  status text not null default 'open',
  description text,
  issued_at date not null default current_date,
  created_at timestamptz not null default now(),
  unique (company_id, number),
  constraint invoices_status_chk check (status in ('open', 'paid', 'overdue', 'cancelled'))
);

create index if not exists invoices_due_idx on invoices (company_id, status, due_date);

create table if not exists recurring_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  kind text not null,
  amount numeric(14,2) not null,
  description text not null,
  interval text not null default 'monthly',
  next_run date not null,
  active boolean not null default true
);

create table if not exists message_templates (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  channel text not null default 'whatsapp',
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists campaigns (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  segment_key text not null,
  channel text not null default 'whatsapp',
  message text not null,
  status text not null default 'draft',
  scheduled_at timestamptz,
  sent_at timestamptz,
  recovered_amount numeric(14,2) not null default 0,
  created_by text,
  created_at timestamptz not null default now(),
  constraint campaigns_status_chk check (status in (
    'draft', 'scheduled', 'sending', 'sent', 'cancelled', 'needs_config'
  ))
);

create index if not exists campaigns_company_idx on campaigns (company_id, created_at desc);

create table if not exists campaign_recipients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  quote_id uuid references quotes(id) on delete set null,
  invoice_id uuid references invoices(id) on delete set null,
  name text not null,
  phone text,
  email text,
  estimated_value numeric(14,2) not null default 0,
  consent boolean not null default false,
  status text not null default 'pending',
  result text
);

create index if not exists campaign_recipients_campaign_idx on campaign_recipients (campaign_id, status);

create table if not exists campaign_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  campaign_id uuid not null references campaigns(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  channel text not null,
  direction text not null,
  customer_id uuid references customers(id) on delete set null,
  body text not null,
  status text not null default 'queued',
  provider_id text,
  created_at timestamptz not null default now()
);

create table if not exists automations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  enabled boolean not null default false,
  trigger_key text not null,
  created_at timestamptz not null default now()
);

create table if not exists automation_rules (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  automation_id uuid not null references automations(id) on delete cascade,
  field text not null,
  operator text not null,
  value text not null
);

create table if not exists automation_actions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  automation_id uuid not null references automations(id) on delete cascade,
  type text not null,
  config jsonb not null default '{}'::jsonb
);

create table if not exists automation_executions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  automation_id uuid not null references automations(id) on delete cascade,
  status text not null,
  detail text,
  created_at timestamptz not null default now()
);

create table if not exists appointment_services (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  duration_minutes integer not null default 30,
  price numeric(14,2) not null default 0
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  service_id uuid references appointment_services(id) on delete set null,
  title text not null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  owner_user_id text,
  status text not null default 'scheduled',
  notes text,
  constraint appointments_status_chk check (status in (
    'scheduled', 'confirmed', 'done', 'cancelled', 'no_show'
  ))
);

create index if not exists appointments_company_time_idx on appointments (company_id, starts_at);

create table if not exists appointment_reminders (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  appointment_id uuid not null references appointments(id) on delete cascade,
  channel text not null default 'whatsapp',
  send_at timestamptz not null,
  sent_at timestamptz
);

create table if not exists loyalty_accounts (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  points integer not null default 0,
  tier text not null default 'bronze',
  unique (company_id, customer_id)
);

create table if not exists loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  account_id uuid not null references loyalty_accounts(id) on delete cascade,
  points integer not null,
  reason text not null,
  created_at timestamptz not null default now()
);

create table if not exists rewards (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  points_cost integer not null,
  active boolean not null default true
);

create table if not exists goals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id text,
  name text not null,
  metric text not null,
  target numeric(14,2) not null,
  period_start date not null,
  period_end date not null
);

create table if not exists goal_progress (
  goal_id uuid not null references goals(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  current_value numeric(14,2) not null default 0,
  updated_at timestamptz not null default now(),
  primary key (goal_id)
);

create table if not exists commissions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id text not null,
  sale_id uuid references sales(id) on delete set null,
  amount numeric(14,2) not null,
  rate numeric(6,4) not null,
  period date not null
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id text,
  name text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_idx on analytics_events (company_id, created_at desc);

create table if not exists daily_metrics (
  company_id uuid not null references companies(id) on delete cascade,
  day date not null,
  revenue numeric(14,2) not null default 0,
  expenses numeric(14,2) not null default 0,
  sales_count integer not null default 0,
  recovered numeric(14,2) not null default 0,
  primary key (company_id, day)
);

create table if not exists monthly_metrics (
  company_id uuid not null references companies(id) on delete cascade,
  month date not null,
  revenue numeric(14,2) not null default 0,
  expenses numeric(14,2) not null default 0,
  recovered numeric(14,2) not null default 0,
  primary key (company_id, month)
);

create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  user_id text,
  type text not null,
  title text not null,
  body text not null,
  href text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_idx on notifications (company_id, user_id, created_at desc);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references companies(id) on delete cascade,
  user_id text,
  action text not null,
  entity text not null,
  entity_id text,
  field text,
  before_value text,
  after_value text,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_company_idx on audit_logs (company_id, created_at desc);

create table if not exists security_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid,
  user_id text,
  type text not null,
  detail text,
  ip text,
  created_at timestamptz not null default now()
);

create table if not exists login_attempts (
  id uuid primary key default gen_random_uuid(),
  email text,
  success boolean not null,
  ip text,
  created_at timestamptz not null default now()
);

create index if not exists login_attempts_email_idx on login_attempts (email, created_at desc);

create table if not exists user_sessions_log (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  company_id uuid,
  action text not null,
  ip text,
  created_at timestamptz not null default now()
);

create table if not exists invites (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  email text not null,
  role_slug text not null,
  token text not null unique,
  invited_by text not null,
  accepted_at timestamptz,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
