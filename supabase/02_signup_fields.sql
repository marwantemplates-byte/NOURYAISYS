alter table public.merchants add column if not exists owner_name text;
alter table public.merchants add column if not exists daily_orders text;
alter table public.merchants add column if not exists sales_channel text;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.merchants (id, store_name, owner_name, phone, daily_orders, sales_channel)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'store_name', ''),
    new.raw_user_meta_data->>'owner_name',
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'daily_orders',
    new.raw_user_meta_data->>'sales_channel'
  );
  return new;
end $$;
