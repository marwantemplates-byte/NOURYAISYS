-- LALLA store: new columns for orders and products.
-- Safe to run more than once: it only ADDS columns, never drops or rewrites data.
-- Run in Supabase -> SQL Editor (project wlpapvirtacrmcxcevuk), BEFORE seed_products.sql.

-- 1) Orders: commune, delivery type, and optional variant
alter table public.orders add column if not exists commune       text;
alter table public.orders add column if not exists delivery_type text;   -- 'Domicile' or 'Bureau'
alter table public.orders add column if not exists color         text;
alter table public.orders add column if not exists size          text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'orders_delivery_type_check') then
    alter table public.orders
      add constraint orders_delivery_type_check
      check (delivery_type is null or delivery_type in ('Domicile', 'Bureau')) not valid;
  end if;
end $$;

-- The store inserts orders as a guest (anon). If insert rights are granted per column,
-- this lets the new columns through. Harmless if the table already allows insert.
grant insert (commune, delivery_type, color, size) on public.orders to anon, authenticated;

-- 2) Products: category, extra photos, variants, and home-page flags
alter table public.products add column if not exists category      text;     -- sacs | bijoux | montres | lunettes | foulards
alter table public.products add column if not exists images        text[];   -- extra photos (image_url stays the main one)
alter table public.products add column if not exists colors        text[];   -- optional colour choices shown in the order form
alter table public.products add column if not exists sizes         text[];   -- optional size choices (rings, etc.)
alter table public.products add column if not exists is_new        boolean not null default false;  -- "Nouveau" badge
alter table public.products add column if not exists is_bestseller boolean not null default false;  -- Best-sellers row

create index if not exists products_category_idx on public.products (category);

-- Ask the API to see the new columns right away
notify pgrst, 'reload schema';
