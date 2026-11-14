-- =====================================================================
-- الإيميلات الأوتوماتيكية: ترحيب + تذكير قبل الدورة
-- نفّذ هذا الملف في: Supabase → SQL Editor → New query → Run (آمن لإعادة التنفيذ)
-- =====================================================================

-- متى تبعث إيميل الترحيب (باه ما يتبعثش زوج مرات)
alter table public.profiles add column if not exists welcome_sent_at timestamptz;
-- متى تبعث التذكير لهذا الطالب في هذه الدورة
alter table public.rsvps add column if not exists reminded_at timestamptz;

-- إعدادات داخلية (ما تتقراش من الموقع)
create table if not exists public.app_config (key text primary key, value text not null);
alter table public.app_config enable row level security;
revoke all on public.app_config from anon, authenticated;

-- المفتاح السري تاع التذكير الأوتوماتيكي: بدّل CHANGE_ME بنفس قيمة CRON_SECRET في Vercel
insert into public.app_config (key, value) values ('cron_secret', 'CHANGE_ME')
on conflict (key) do update set value = excluded.value;

-- يرجّع التذكيرات اللي حان وقتها (الدورات اللي تبدا في الـ 30 ساعة الجاية)
-- ويعلّمهم «تبعثو» في نفس اللحظة، باه ما يتبعثوش مرتين.
create or replace function public.claim_due_reminders(p_secret text)
returns table (email text, full_name text, item_id uuid, title text, starts_at timestamptz, mode text, location text, meeting_link text)
language plpgsql security definer set search_path = public
as $$
begin
  if p_secret is null or p_secret = 'CHANGE_ME'
     or p_secret <> coalesce((select value from public.app_config where key = 'cron_secret'), '') then
    raise exception 'forbidden';
  end if;
  return query
  with due as (
    update public.rsvps r
    set reminded_at = now()
    from public.items i, public.profiles p
    where i.id = r.item_id
      and p.id = r.user_id
      and r.reminded_at is null
      and i.published
      and i.type in ('event', 'course')
      and i.starts_at > now()
      and i.starts_at <= now() + interval '30 hours'
      and p.status = 'active'
    returning r.item_id, r.user_id
  )
  select p.email, p.full_name, i.id, i.title, i.starts_at, i.mode, i.location, i.meeting_link
  from due d
  join public.items i on i.id = d.item_id
  join public.profiles p on p.id = d.user_id;
end;
$$;
revoke execute on function public.claim_due_reminders(text) from public;
grant execute on function public.claim_due_reminders(text) to anon, authenticated;
