-- =====================================================================
-- حقول استمارة Google الرسمية للحاضنة (2026/2027)
-- نفّذ هذا الملف في: Supabase → SQL Editor → New query → Run (آمن لإعادة التنفيذ)
-- ⚠️ نفّذه قبل استعمال النسخة الجديدة من الموقع.
-- =====================================================================

-- 1) الأعمدة الجديدة
alter table public.profiles add column if not exists level_other      text;    -- «حدّد المستوى» (إذا «أخرى»)
alter table public.profiles add column if not exists idea_field       text;    -- مجال الفكرة المقترحة
alter table public.profiles add column if not exists idea_field_other text;    -- «حدّد المجال» (إذا «مجالات أخرى»)
alter table public.profiles add column if not exists linked_to_thesis boolean; -- مرتبطة بمذكرة التخرج؟
alter table public.profiles add column if not exists extra_notes      text;    -- ملاحظات إضافية

-- 2) تحقق في الخادم (حتى لو تجاوز أحد الموقع):
--    موجز الفكرة ≤ 100 كلمة، مجال الفكرة من القائمة، وطول أقصى للنصوص.
--    NOT VALID = يُطبَّق على كل حفظ جديد بلا ما يفشل بسبب معلومات قديمة.
do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_idea_max_100_words') then
    alter table public.profiles add constraint profiles_idea_max_100_words check (
      project_idea is null or btrim(project_idea) = ''
      or coalesce(array_length(regexp_split_to_array(btrim(project_idea), '\s+'), 1), 0) <= 100
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_idea_field_values') then
    alter table public.profiles add constraint profiles_idea_field_values check (
      idea_field is null or idea_field in (
        'الخدمات (تعليمية، صحية، تجارية، إلكترونية…)',
        'الإنتاج الصناعي والتحويل',
        'الإنتاج الزراعي والفلاحي',
        'مجالات أخرى'
      )
    ) not valid;
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_form_text_lengths') then
    alter table public.profiles add constraint profiles_form_text_lengths check (
      char_length(coalesce(level_other, '')) <= 100
      and char_length(coalesce(idea_field_other, '')) <= 150
      and char_length(coalesce(extra_notes, '')) <= 2000
    ) not valid;
  end if;
end $$;

-- 3) التسجيل: حفظ الحقول الجديدة من فورم التسجيل (ويبقى المدير مدير حسب admin_emails)
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
    id, email, full_name, phone, faculty, specialty, level, level_other,
    idea_field, idea_field_other, linked_to_thesis, extra_notes,
    project_title, project_idea, has_prototype, prototype_desc, prototype_link, role
  ) values (
    new.id,
    coalesce(new.email, ''),
    coalesce(nullif(m->>'full_name', ''), case when v_role = 'admin' then 'مدير الحاضنة' else '' end),
    m->>'phone',
    m->>'faculty',
    m->>'specialty',
    m->>'level',
    nullif(m->>'level_other', ''),
    nullif(m->>'idea_field', ''),
    nullif(m->>'idea_field_other', ''),
    case when m->>'linked_to_thesis' in ('true', 'false') then (m->>'linked_to_thesis')::boolean end,
    nullif(m->>'extra_notes', ''),
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

-- RLS: بلا تغيير (الطالب يقرا ويبدّل بروفايلو برك، والمدير كلش).
