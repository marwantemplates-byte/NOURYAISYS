-- =====================================================================
-- إيميلات المدراء: أي حساب يتعمل بإيميل من هذه القائمة يولّي مدير أوتوماتيكيًا
-- نفّذ هذا الملف في: Supabase → SQL Editor → New query → Run (آمن لإعادة التنفيذ)
-- =====================================================================

-- 1) قائمة إيميلات المدراء (ما تتقراش من الموقع، غير من SQL)
create table if not exists public.admin_emails (email text primary key);
alter table public.admin_emails enable row level security;
revoke all on public.admin_emails from anon, authenticated;

-- 2) زيد إيميل المدير هنا (وتقدر تزيد أكثر من واحد)
insert into public.admin_emails (email) values
  ('incubator.emir@gmail.com')
on conflict (email) do nothing;

-- 3) عند إنشاء أي حساب: إذا كان الإيميل في القائمة → role = admin
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  v_role text := case
    when exists (select 1 from public.admin_emails a where lower(a.email) = lower(new.email)) then 'admin'
    else 'student'
  end;
begin
  insert into public.profiles (
    id, email, full_name, phone, faculty, specialty, level,
    project_title, project_idea, has_prototype, prototype_desc, prototype_link, role
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(m->>'full_name', ''), case when v_role = 'admin' then 'مدير الحاضنة' else '' end),
    m->>'phone',
    m->>'faculty',
    m->>'specialty',
    m->>'level',
    m->>'project_title',
    m->>'project_idea',
    coalesce((m->>'has_prototype')::boolean, false),
    m->>'prototype_desc',
    m->>'prototype_link',
    v_role
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

-- 4) إذا الحساب موجود من قبل: خليه مدير دروك
update public.profiles p
set role = 'admin'
where exists (select 1 from public.admin_emails a where lower(a.email) = lower(p.email));

-- للتحقق:
select email, role from public.profiles where role = 'admin';
