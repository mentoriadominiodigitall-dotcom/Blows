-- Row Level Security. Policies key off current_setting('app.company_id').
-- The app connection in preview is the table owner, so RLS is not FORCED
-- (owner bypass). Production should connect as a non-owner role and
-- SET LOCAL app.company_id inside a transaction. Application queries always
-- filter by membership-resolved company_id regardless.

create or replace function app_current_company_id()
returns uuid
language sql
stable
as $$
  select nullif(current_setting('app.company_id', true), '')::uuid
$$;

do $$
declare
  t text;
begin
  foreach t in array ARRAY[
    'customers','customer_notes','customer_events','customer_segments','customer_tags','tags',
    'leads','lead_activities','lead_sources','lead_statuses',
    'pipelines','pipeline_stages','deals','deal_activities',
    'products','product_categories','inventory','inventory_movements',
    'sales','sale_items','payment_methods',
    'quotes','quote_items','quote_status_history',
    'financial_accounts','transaction_categories','transactions','invoices','recurring_transactions',
    'campaigns','campaign_recipients','campaign_events','message_templates','messages',
    'automations','automation_rules','automation_actions','automation_executions',
    'appointments','appointment_services','appointment_reminders',
    'loyalty_accounts','loyalty_transactions','rewards',
    'goals','goal_progress','commissions',
    'analytics_events','daily_metrics','monthly_metrics',
    'notifications','audit_logs','company_settings','company_members',
    'company_subscriptions','company_role_permissions'
  ]
  loop
    execute format('alter table %I enable row level security', t);
    execute format('drop policy if exists tenant_select on %I', t);
    execute format(
      'create policy tenant_select on %I for all using (company_id = app_current_company_id()) with check (company_id = app_current_company_id())',
      t
    );
  end loop;
end
$$;
