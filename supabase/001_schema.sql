-- =====================================================================
-- منصة حاضنة الأعمال — قاعدة البيانات (Supabase / Postgres)
-- نفّذ هذا الملف مرة واحدة في: Supabase → SQL Editor → New query → Run
-- الملف يمكن إعادة تنفيذه بأمان (idempotent) بعد أي تعديل.
-- =====================================================================

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- 1) الجداول
-- ---------------------------------------------------------------------

-- بروفايل الطالب/المدير (نفس id تاع auth.users)
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  full_name      text not null default '',
  email          text not null default '',
  phone          text,
  faculty        text,                 -- الكلية
  specialty      text,                 -- التخصص
  level          text,                 -- ليسانس 1/2/3، ماستر 1/2، دكتوراه
  project_title  text,
  project_idea   text,                 -- فكرة المشروع
  has_prototype  boolean not null default false,
  prototype_desc text,
  prototype_link text,
  role           text not null default 'student' check (role in ('student', 'admin')),
  status         text not null default 'active'  check (status in ('active', 'blocked')),
  created_at     timestamptz not null default now()
);

-- المنشورات والأحداث والدورات
create table if not exists public.items (
  id           uuid primary key default gen_random_uuid(),
  type         text not null default 'course' check (type in ('post', 'event', 'course')),
  title        text not null,
  body         text,
  trainer_name text,                   -- اسم المكوّن
  starts_at    timestamptz,
  ends_at      timestamptz,
  mode         text not null default 'onsite' check (mode in ('onsite', 'online', 'hybrid')),
  location     text,                   -- المكان (للحضوري)
  meeting_link text,                   -- رابط Google Meet: ما يبانش للطلبة غير بعد التأكيد
  image_url    text,
  capacity     int check (capacity is null or capacity > 0),
  published    boolean not null default false,
  created_by   uuid references public.profiles (id) on delete set null,
  created_at   timestamptz not null default now()
);

-- تأكيد الحضور + الحضور الفعلي
create table if not exists public.rsvps (
  item_id    uuid not null references public.items (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  attended   boolean,                  -- null = ما تسجلش بعد، true = حضر، false = غاب (المدير برك)
  checked_at timestamptz,
  checked_by uuid references public.profiles (id) on delete set null,
  primary key (item_id, user_id)
);

-- ملاحظات المتابعة (للمدير برك)
create table if not exists public.student_notes (
  id         uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles (id) on delete cascade,
  note       text not null,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

-- سجل الإيميلات الجماعية
create table if not exists public.email_campaigns (
  id               uuid primary key default gen_random_uuid(),
  subject          text not null,
  body             text not null,
  audience         jsonb not null default '{"type":"all"}',
  recipients_count int not null default 0,
  sent_count       int not null default 0,
  failed_count     int not null default 0,
  status           text not null default 'sending' check (status in ('sending', 'done', 'failed')),
  created_by       uuid references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now()
);

create index if not exists items_published_starts_idx on public.items (published, starts_at);
create index if not exists rsvps_user_idx on public.rsvps (user_id);
create index if not exists student_notes_student_idx on public.student_notes (student_id, created_at desc);
create index if not exists profiles_specialty_idx on public.profiles (specialty);

-- ---------------------------------------------------------------------
-- 2) دوال مساعدة
-- ---------------------------------------------------------------------

-- واش المستخدم الحالي مدير (ونشط)؟
create or replace function public.is_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin' and status = 'active'
  );
$$;

-- واش المستخدم الحالي طالب نشط (ماشي موقوف)؟
create or replace function public.is_active_user()
returns boolean
language sql stable security definer set search_path = public
as $$
  select exists (select 1 from public.profiles where id = auth.uid() and status = 'active');
$$;

-- إنشاء البروفايل أوتوماتيكيًا عند التسجيل (من المعلومات اللي بعثها فورم التسجيل)
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = public
as $$
declare
  m jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (
    id, email, full_name, phone, faculty, specialty, level,
    project_title, project_idea, has_prototype, prototype_desc, prototype_link
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(m->>'full_name', ''),
    m->>'phone',
    m->>'faculty',
    m->>'specialty',
    m->>'level',
    m->>'project_title',
    m->>'project_idea',
    coalesce((m->>'has_prototype')::boolean, false),
    m->>'prototype_desc',
    m->>'prototype_link'
  )
  on conflict (id) do nothing;   -- role و status يبقاو على القيم الافتراضية (student / active)
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- حماية: الطالب ما يقدرش يبدّل role ولا status ولا الإيميل ديالو
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  -- auth.uid() فارغ = تنفيذ مباشر من SQL Editor (صاحب المشروع): مسموح بكلش
  if auth.uid() is not null and not public.is_admin() then
    new.role       := old.role;
    new.status     := old.status;
    new.email      := old.email;
    new.created_at := old.created_at;
  end if;
  new.id := old.id;
  return new;
end;
$$;

drop trigger if exists protect_profile_fields on public.profiles;
create trigger protect_profile_fields
  before update on public.profiles
  for each row execute function public.protect_profile_fields();

-- رابط Google Meet: يرجع غير للمدير، ولا للطالب اللي أكّد حضوره
create or replace function public.get_meeting_link(p_item_id uuid)
returns text
language sql stable security definer set search_path = public
as $$
  select i.meeting_link
  from public.items i
  where i.id = p_item_id
    and (
      public.is_admin()
      or (
        i.published
        and public.is_active_user()
        and exists (select 1 from public.rsvps r where r.item_id = i.id and r.user_id = auth.uid())
      )
    );
$$;

-- عدد المؤكدين لكل عنصر منشور (باه نعرفو «اكتملت الأماكن» بلا ما نكشفو شكون سجّل)
create or replace function public.get_rsvp_counts(p_item_ids uuid[])
returns table (item_id uuid, confirmed bigint)
language sql stable security definer set search_path = public
as $$
  select r.item_id, count(*)::bigint
  from public.rsvps r
  join public.items i on i.id = r.item_id
  where r.item_id = any (p_item_ids) and (i.published or public.is_admin())
  group by r.item_id;
$$;

-- تأكيد الحضور (الطالب): يتحقق من النشر، الحساب النشط، والعدد الأقصى
create or replace function public.rsvp_item(p_item_id uuid)
returns text  -- 'ok' | 'already' | 'full' | 'not_found' | 'blocked' | 'not_signed_in'
language plpgsql security definer set search_path = public
as $$
declare
  v_item public.items%rowtype;
  v_count int;
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  if not public.is_active_user() then return 'blocked'; end if;

  select * into v_item from public.items
  where id = p_item_id and published and type in ('event', 'course')
  for update;                                  -- قفل باه ما يفوتوش العدد الأقصى في نفس اللحظة
  if not found then return 'not_found'; end if;

  if exists (select 1 from public.rsvps where item_id = p_item_id and user_id = auth.uid()) then
    return 'already';
  end if;

  if v_item.capacity is not null then
    select count(*) into v_count from public.rsvps where item_id = p_item_id;
    if v_count >= v_item.capacity then return 'full'; end if;
  end if;

  insert into public.rsvps (item_id, user_id) values (p_item_id, auth.uid());
  return 'ok';
end;
$$;

-- إلغاء التأكيد (الطالب): ممنوع بعد ما يسجّل المدير الحضور الفعلي
create or replace function public.cancel_rsvp(p_item_id uuid)
returns text  -- 'ok' | 'not_found' | 'locked' | 'not_signed_in'
language plpgsql security definer set search_path = public
as $$
declare
  v_attended boolean;
begin
  if auth.uid() is null then return 'not_signed_in'; end if;
  select attended into v_attended from public.rsvps
  where item_id = p_item_id and user_id = auth.uid();
  if not found then return 'not_found'; end if;
  if v_attended is not null then return 'locked'; end if;
  delete from public.rsvps where item_id = p_item_id and user_id = auth.uid();
  return 'ok';
end;
$$;

-- أرقام الصفحة الرئيسية (علنية، بلا معلومات شخصية)
create or replace function public.public_stats()
returns table (students bigint, projects bigint, trainings bigint)
language sql stable security definer set search_path = public
as $$
  select
    (select count(*) from public.profiles where role = 'student'),
    (select count(*) from public.profiles where role = 'student' and coalesce(project_title, '') <> ''),
    (select count(*) from public.items where published and type = 'course');
$$;

-- ---------------------------------------------------------------------
-- 3) RLS (الحماية الحقيقية)
-- ---------------------------------------------------------------------
alter table public.profiles        enable row level security;
alter table public.items           enable row level security;
alter table public.rsvps           enable row level security;
alter table public.student_notes   enable row level security;
alter table public.email_campaigns enable row level security;

-- profiles: كل واحد يقرا ويبدّل بروفايلو برك، والمدير كلش
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select to authenticated using (id = auth.uid() or public.is_admin());

drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update to authenticated
  using (id = auth.uid() or public.is_admin())
  with check (id = auth.uid() or public.is_admin());

drop policy if exists profiles_admin_delete on public.profiles;
create policy profiles_admin_delete on public.profiles
  for delete to authenticated using (public.is_admin());

-- items: الكل (حتى الزوار) يقراو المنشور، والمدير يقرا ويكتب كلش
drop policy if exists items_select on public.items;
create policy items_select on public.items
  for select to anon, authenticated using (published or public.is_admin());

drop policy if exists items_admin_write on public.items;
create policy items_admin_write on public.items
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- rsvps: الطالب يقرا تأكيداته برك (يزيد/يلغي عبر rsvp_item / cancel_rsvp)، والمدير كلش
drop policy if exists rsvps_select on public.rsvps;
create policy rsvps_select on public.rsvps
  for select to authenticated using (user_id = auth.uid() or public.is_admin());

drop policy if exists rsvps_admin_write on public.rsvps;
create policy rsvps_admin_write on public.rsvps
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- student_notes و email_campaigns: للمدير برك
drop policy if exists student_notes_admin on public.student_notes;
create policy student_notes_admin on public.student_notes
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

drop policy if exists email_campaigns_admin on public.email_campaigns;
create policy email_campaigns_admin on public.email_campaigns
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ---------------------------------------------------------------------
-- 4) صلاحيات الأعمدة: meeting_link ما يتقراش مباشرة (غير عبر get_meeting_link)
-- ---------------------------------------------------------------------
revoke select on public.items from anon, authenticated;
grant select (
  id, type, title, body, trainer_name, starts_at, ends_at, mode, location,
  image_url, capacity, published, created_by, created_at
) on public.items to anon, authenticated;
grant insert, update, delete on public.items to authenticated;  -- RLS يخليها للمدير برك

-- صلاحيات صريحة (بعض مشاريع Supabase الجديدة ما تعطيهاش افتراضيًا). RLS هو اللي يحدد الأسطر.
grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.profiles, public.rsvps, public.student_notes, public.email_campaigns to authenticated;

-- الزوار ما عندهم حتى وصول للجداول الأخرى
revoke all on public.profiles, public.rsvps, public.student_notes, public.email_campaigns from anon;

-- الدوال
-- (Postgres يعطي EXECUTE لـ PUBLIC افتراضيًا، لازم نسحبوه من PUBLIC)
revoke execute on function public.rsvp_item(uuid), public.cancel_rsvp(uuid), public.get_meeting_link(uuid) from public, anon;
grant execute on function public.rsvp_item(uuid), public.cancel_rsvp(uuid), public.get_meeting_link(uuid) to authenticated;
grant execute on function public.get_rsvp_counts(uuid[]), public.public_stats() to anon, authenticated;
