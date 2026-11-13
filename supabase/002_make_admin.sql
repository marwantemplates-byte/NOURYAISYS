-- =====================================================================
-- خلّي حساب مدير
-- 1) سجّل حساب عادي من /register وأكّد الإيميل.
-- 2) بدّل الإيميل تحت ونفّذ هذا في Supabase → SQL Editor.
-- =====================================================================
update public.profiles
set role = 'admin'
where email = 'ADMIN_EMAIL@example.com';

-- للتحقق:
select id, full_name, email, role, status from public.profiles where role = 'admin';
