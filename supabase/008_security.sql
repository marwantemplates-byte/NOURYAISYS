-- =====================================================================
-- حماية إضافية (مراجعة الأمان)
-- نفّذ هذا الملف في: Supabase → SQL Editor → New query → Run (آمن لإعادة التنفيذ)
-- =====================================================================

-- 1) قيود على المعلومات: روابط https فقط + طول أقصى للنصوص.
--    NOT VALID = تُطبَّق على كل كتابة جديدة بلا ما تفشل بسبب معلومات قديمة.
do $$
declare
  c record;
begin
  for c in
    select * from (values
      ('profiles', 'profiles_prototype_link_https', 'check (prototype_link is null or prototype_link = '''' or prototype_link ~* ''^https?://'')'),
      ('profiles', 'profiles_text_lengths', 'check (char_length(full_name) <= 120 and char_length(coalesce(phone, '''')) <= 30
          and char_length(coalesce(faculty, '''')) <= 150 and char_length(coalesce(specialty, '''')) <= 150
          and char_length(coalesce(level, '''')) <= 40 and char_length(coalesce(project_title, '''')) <= 250
          and char_length(coalesce(project_idea, '''')) <= 5000 and char_length(coalesce(prototype_desc, '''')) <= 3000
          and char_length(coalesce(prototype_link, '''')) <= 500)'),
      ('items', 'items_links_https', 'check ((meeting_link is null or meeting_link ~* ''^https://'') and (image_url is null or image_url ~* ''^https://''))'),
      ('items', 'items_text_lengths', 'check (char_length(title) <= 300 and char_length(coalesce(body, '''')) <= 20000
          and char_length(coalesce(location, '''')) <= 300 and char_length(coalesce(trainer_name, '''')) <= 200)'),
      ('student_notes', 'student_notes_length', 'check (char_length(note) <= 5000)')
    ) as t(tbl, name, def)
  loop
    if not exists (select 1 from pg_constraint where conname = c.name) then
      execute format('alter table public.%I add constraint %I %s not valid', c.tbl, c.name, c.def);
    end if;
  end loop;
end $$;

-- 2) حد للإيميلات الأوتوماتيكية لكل طالب (باه حتى واحد ما يستهلك حد Gmail بطلبات متكررة)
create table if not exists public.auto_email_log (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);
create index if not exists auto_email_log_user_idx on public.auto_email_log (user_id, created_at desc);
alter table public.auto_email_log enable row level security;
revoke all on public.auto_email_log from anon, authenticated;

-- يرجّع true ويسجّل، إذا الطالب ما فاتش 10 إيميلات في 24 ساعة وما فاتش 1 كل 20 ثانية
create or replace function public.allow_auto_email(p_kind text)
returns boolean
language plpgsql security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then return false; end if;
  perform pg_advisory_xact_lock(hashtext(v_uid::text));
  if (select count(*) from public.auto_email_log where user_id = v_uid and created_at > now() - interval '24 hours') >= 10 then
    return false;
  end if;
  if exists (select 1 from public.auto_email_log where user_id = v_uid and created_at > now() - interval '20 seconds') then
    return false;
  end if;
  insert into public.auto_email_log (user_id, kind) values (v_uid, left(p_kind, 30));
  return true;
end;
$$;
revoke execute on function public.allow_auto_email(text) from public, anon;
grant execute on function public.allow_auto_email(text) to authenticated;
