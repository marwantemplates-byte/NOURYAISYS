-- =====================================================================
-- ملف المشروع (PDF) — لطلبة ليسانس 3 و ماستر 2
-- نفّذ هذا الملف مرة واحدة في: Supabase → SQL Editor → New query → Run
-- (آمن لإعادة التنفيذ)
-- =====================================================================

-- 1) خانة في البروفايل فيها مسار الملف في Storage
alter table public.profiles add column if not exists project_file text;

-- 2) مخزن الملفات: خاص (ماشي علني)، PDF برك، 10 ميغا كحد أقصى
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-files', 'project-files', false, 10485760, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- 3) واش هذا الحساب تسجّل توّا (أقل من ساعتين) ومازال ما عندوش ملف؟
--    يسمح برفع الملف مباشرة بعد التسجيل، قبل تأكيد الإيميل.
create or replace function public.can_attach_signup_file(p_folder text)
returns boolean
language plpgsql stable security definer set search_path = public
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = p_folder::uuid
      and project_file is null
      and created_at > now() - interval '2 hours'
  );
exception when others then
  return false;  -- اسم مجلد ماشي uuid
end;
$$;

-- 4) ربط الملف بالبروفايل بعد الرفع (من صفحة التسجيل)
create or replace function public.attach_signup_file(p_user uuid, p_path text)
returns text  -- 'ok' | 'denied'
language plpgsql security definer set search_path = public
as $$
begin
  if not public.can_attach_signup_file(p_user::text) or p_path not like p_user::text || '/%' then
    return 'denied';
  end if;
  update public.profiles set project_file = p_path where id = p_user;
  return 'ok';
end;
$$;
revoke execute on function public.attach_signup_file(uuid, text) from public;
grant execute on function public.attach_signup_file(uuid, text) to anon, authenticated;
grant execute on function public.can_attach_signup_file(text) to anon, authenticated;

-- 5) الطالب ما يقدرش يحط في project_file ملف ماشي تاعو
create or replace function public.protect_profile_fields()
returns trigger
language plpgsql security definer set search_path = public
as $$
begin
  if auth.uid() is not null and not public.is_admin() then
    new.role       := old.role;
    new.status     := old.status;
    new.email      := old.email;
    new.created_at := old.created_at;
    if new.project_file is distinct from old.project_file
       and new.project_file is not null
       and new.project_file not like auth.uid()::text || '/%' then
      new.project_file := old.project_file;
    end if;
  end if;
  new.id := old.id;
  return new;
end;
$$;

-- 6) قواعد الوصول للملفات (المجلد = id تاع الطالب)
drop policy if exists project_files_signup_insert on storage.objects;
create policy project_files_signup_insert on storage.objects
  for insert to anon, authenticated
  with check (bucket_id = 'project-files' and public.can_attach_signup_file((storage.foldername(name))[1]));

drop policy if exists project_files_own_insert on storage.objects;
create policy project_files_own_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'project-files' and (storage.foldername(name))[1] = auth.uid()::text);

drop policy if exists project_files_read on storage.objects;
create policy project_files_read on storage.objects
  for select to authenticated
  using (bucket_id = 'project-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));

drop policy if exists project_files_delete on storage.objects;
create policy project_files_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'project-files' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_admin()));
