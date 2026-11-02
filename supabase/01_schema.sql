-- NOURYS platform — step 1: database + security
-- Run ONCE in Supabase > SQL Editor. New merchants never need new SQL.

-- 1) Merchants (one row per account, created automatically on sign-up)
create table if not exists public.merchants (
  id            uuid primary key references auth.users(id) on delete cascade,
  store_name    text,
  phone         text,
  whatsapp      text,
  plan          text not null default 'trial' check (plan in ('trial','active','paused')),
  api_key       text not null unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  created_at    timestamptz not null default now()
);

-- 2) Orders
create table if not exists public.orders (
  id             bigint generated always as identity primary key,
  merchant_id    uuid not null references public.merchants(id) on delete cascade,
  customer_name  text not null,
  customer_phone text not null,
  wilaya         text,
  commune        text,
  product        text,
  quantity       int  not null default 1 check (quantity > 0),
  total_price    numeric(12,2),
  status         text not null default 'new'
                 check (status in ('new','confirmed','shipped','out_for_delivery','delivered','returned','cancelled')),
  tracking_code  text,
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index if not exists orders_merchant_created_idx on public.orders (merchant_id, created_at desc);

-- 3) Order history (each status change + each WhatsApp message sent)
create table if not exists public.order_events (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references public.orders(id) on delete cascade,
  merchant_id uuid   not null references public.merchants(id) on delete cascade,
  kind        text   not null check (kind in ('status','whatsapp_sent','whatsapp_failed','note')),
  detail      text,
  created_at  timestamptz not null default now()
);
create index if not exists order_events_order_idx on public.order_events (order_id, created_at);

-- 4) Auto-create the merchant row when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.merchants (id, store_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'store_name', ''));
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5) Keep updated_at fresh + log status changes automatically
create or replace function public.orders_on_update()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if new.status is distinct from old.status then
    insert into public.order_events (order_id, merchant_id, kind, detail)
    values (new.id, new.merchant_id, 'status', old.status || ' -> ' || new.status);
  end if;
  return new;
end $$;

drop trigger if exists orders_before_update on public.orders;
create trigger orders_before_update
  before update on public.orders
  for each row execute function public.orders_on_update();

-- 6) SECURITY: lock every table, then open only what each merchant owns
alter table public.merchants    enable row level security;
alter table public.orders       enable row level security;
alter table public.order_events enable row level security;

-- merchants: see / edit only your own profile (plan + api_key are not editable from the app)
create policy "merchant reads own profile" on public.merchants
  for select to authenticated using (id = (select auth.uid()));
create policy "merchant updates own profile" on public.merchants
  for update to authenticated using (id = (select auth.uid())) with check (id = (select auth.uid()));
revoke update on public.merchants from authenticated;
grant update (store_name, phone, whatsapp) on public.merchants to authenticated;

-- orders: full control over your own orders only
create policy "merchant reads own orders" on public.orders
  for select to authenticated using (merchant_id = (select auth.uid()));
create policy "merchant adds own orders" on public.orders
  for insert to authenticated with check (merchant_id = (select auth.uid()));
create policy "merchant updates own orders" on public.orders
  for update to authenticated using (merchant_id = (select auth.uid())) with check (merchant_id = (select auth.uid()));
create policy "merchant deletes own orders" on public.orders
  for delete to authenticated using (merchant_id = (select auth.uid()));

-- order_events: read-only for the merchant (written by triggers / n8n)
create policy "merchant reads own events" on public.order_events
  for select to authenticated using (merchant_id = (select auth.uid()));

-- NOTE: there is NO policy for "anon". Visitors cannot read or write anything.
-- Orders from a merchant's store go through n8n with that merchant's api_key,
-- and n8n inserts them with the service_role key (kept only inside n8n).
-- This blocks fake orders sent to another merchant.
