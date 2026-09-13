-- CRM, funnel, products, sales, quotes.

create table if not exists tags (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  color text,
  unique (company_id, name)
);

create table if not exists customers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  document text,
  company_name text,
  source text,
  status text not null default 'active',
  classification text not null default 'regular',
  consent_whatsapp boolean not null default false,
  consent_email boolean not null default false,
  last_purchase_at timestamptz,
  total_spent numeric(14,2) not null default 0,
  purchase_count integer not null default 0,
  avg_ticket numeric(14,2) not null default 0,
  avg_interval_days numeric(10,2),
  credit_limit numeric(14,2) not null default 0,
  notes_preview text,
  owner_user_id text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_status_chk check (status in ('active', 'inactive', 'blocked')),
  constraint customers_class_chk check (classification in ('regular', 'vip', 'at_risk', 'lost', 'new'))
);

create index if not exists customers_company_idx on customers (company_id) where deleted_at is null;
create index if not exists customers_company_last_purchase_idx on customers (company_id, last_purchase_at);
create index if not exists customers_company_email_idx on customers (company_id, email);
create index if not exists customers_company_name_idx on customers (company_id, name);

create table if not exists customer_tags (
  customer_id uuid not null references customers(id) on delete cascade,
  tag_id uuid not null references tags(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  primary key (customer_id, tag_id)
);

create table if not exists customer_notes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  author_user_id text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists customer_notes_customer_idx on customer_notes (company_id, customer_id, created_at desc);

create table if not exists customer_events (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid not null references customers(id) on delete cascade,
  type text not null,
  title text not null,
  payload jsonb not null default '{}'::jsonb,
  actor_user_id text,
  created_at timestamptz not null default now()
);

create index if not exists customer_events_idx on customer_events (company_id, customer_id, created_at desc);

create table if not exists customer_segments (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  definition jsonb not null,
  created_by text,
  created_at timestamptz not null default now()
);

create table if not exists lead_sources (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  unique (company_id, name)
);

create table if not exists lead_statuses (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order integer not null default 0,
  unique (company_id, slug)
);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  source text,
  status text not null default 'new',
  estimated_value numeric(14,2) not null default 0,
  owner_user_id text,
  last_activity_at timestamptz,
  converted_customer_id uuid references customers(id) on delete set null,
  notes text,
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists leads_company_idx on leads (company_id) where deleted_at is null;
create index if not exists leads_idle_idx on leads (company_id, last_activity_at);

create table if not exists lead_activities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  lead_id uuid not null references leads(id) on delete cascade,
  type text not null,
  body text not null,
  actor_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists pipelines (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  is_default boolean not null default true
);

create table if not exists pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  pipeline_id uuid not null references pipelines(id) on delete cascade,
  name text not null,
  slug text not null,
  sort_order integer not null,
  is_won boolean not null default false,
  is_lost boolean not null default false
);

create index if not exists pipeline_stages_pipeline_idx on pipeline_stages (pipeline_id, sort_order);

create table if not exists deals (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  pipeline_id uuid not null references pipelines(id) on delete cascade,
  stage_id uuid not null references pipeline_stages(id),
  title text not null,
  customer_id uuid references customers(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  value numeric(14,2) not null default 0,
  owner_user_id text,
  expected_close_at date,
  source text,
  notes text,
  closed_at timestamptz,
  lost_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_company_stage_idx on deals (company_id, stage_id);
create index if not exists deals_company_owner_idx on deals (company_id, owner_user_id);

create table if not exists deal_activities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  deal_id uuid not null references deals(id) on delete cascade,
  type text not null,
  body text not null,
  actor_user_id text,
  created_at timestamptz not null default now()
);

create table if not exists product_categories (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  unique (company_id, name)
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  category_id uuid references product_categories(id) on delete set null,
  name text not null,
  sku text,
  kind text not null default 'product',
  price numeric(14,2) not null default 0,
  cost numeric(14,2) not null default 0,
  quantity numeric(14,3) not null default 0,
  min_quantity numeric(14,3) not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists products_company_idx on products (company_id, active);
create unique index if not exists products_sku_idx on products (company_id, sku) where sku is not null;

create table if not exists inventory (
  product_id uuid primary key references products(id) on delete cascade,
  company_id uuid not null references companies(id) on delete cascade,
  quantity numeric(14,3) not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists inventory_movements (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  type text not null,
  quantity numeric(14,3) not null,
  reason text,
  actor_user_id text,
  created_at timestamptz not null default now(),
  constraint inventory_movements_type_chk check (type in ('in', 'out', 'adjust'))
);

create table if not exists payment_methods (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  name text not null,
  unique (company_id, name)
);

create table if not exists sales (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  number integer not null,
  status text not null default 'completed',
  sold_at timestamptz not null default now(),
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  payment_method text,
  seller_user_id text,
  notes text,
  created_at timestamptz not null default now(),
  unique (company_id, number)
);

create index if not exists sales_company_sold_idx on sales (company_id, sold_at desc);
create index if not exists sales_customer_idx on sales (company_id, customer_id, sold_at desc);

create table if not exists sale_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  sale_id uuid not null references sales(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null,
  unit_price numeric(14,2) not null,
  total numeric(14,2) not null
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  customer_id uuid references customers(id) on delete set null,
  lead_id uuid references leads(id) on delete set null,
  number integer not null,
  status text not null default 'draft',
  valid_until date,
  sent_at timestamptz,
  viewed_at timestamptz,
  subtotal numeric(14,2) not null default 0,
  discount numeric(14,2) not null default 0,
  total numeric(14,2) not null default 0,
  notes text,
  owner_user_id text,
  converted_sale_id uuid references sales(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, number),
  constraint quotes_status_chk check (status in (
    'draft', 'sent', 'viewed', 'accepted', 'rejected', 'expired'
  ))
);

create index if not exists quotes_company_status_idx on quotes (company_id, status);
create index if not exists quotes_idle_idx on quotes (company_id, sent_at);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  quote_id uuid not null references quotes(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  description text not null,
  quantity numeric(14,3) not null,
  unit_price numeric(14,2) not null,
  total numeric(14,2) not null
);

create table if not exists quote_status_history (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references companies(id) on delete cascade,
  quote_id uuid not null references quotes(id) on delete cascade,
  from_status text,
  to_status text not null,
  actor_user_id text,
  created_at timestamptz not null default now()
);
