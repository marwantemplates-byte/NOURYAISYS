create table if not exists public.carrier_connections (
  merchant_id   uuid not null references public.merchants(id) on delete cascade,
  carrier       text not null check (carrier in ('yalidine','zr_express','ecotrack_dhd')),
  api_id        text,
  api_token     text not null,
  extra         text,
  active        boolean not null default true,
  last_check_at timestamptz,
  last_status   text,
  created_at    timestamptz not null default now(),
  primary key (merchant_id, carrier)
);

alter table public.carrier_connections enable row level security;

create policy "merchant reads own carriers" on public.carrier_connections
  for select to authenticated using (merchant_id = (select auth.uid()));
create policy "merchant adds own carriers" on public.carrier_connections
  for insert to authenticated with check (merchant_id = (select auth.uid()));
create policy "merchant updates own carriers" on public.carrier_connections
  for update to authenticated using (merchant_id = (select auth.uid())) with check (merchant_id = (select auth.uid()));
create policy "merchant removes own carriers" on public.carrier_connections
  for delete to authenticated using (merchant_id = (select auth.uid()));

-- keys are write-only from the website: the dashboard can see which carriers are linked, never the keys
revoke select on public.carrier_connections from anon, authenticated;
grant select (merchant_id, carrier, active, last_check_at, last_status, created_at) on public.carrier_connections to authenticated;
grant insert, update, delete on public.carrier_connections to authenticated;
