create table if not exists public.billing_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique not null,
  stripe_subscription_id text unique,
  plan text not null default 'free' check (plan in ('free', 'student', 'pro')),
  status text not null default 'inactive',
  cancel_at_period_end boolean not null default false,
  current_period_end timestamptz,
  price_id text,
  updated_at timestamptz not null default now()
);

create table if not exists public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);

alter table public.billing_subscriptions enable row level security;
alter table public.stripe_webhook_events enable row level security;

create policy "Users read own billing subscription"
on public.billing_subscriptions for select
to authenticated
using (auth.uid() = user_id);