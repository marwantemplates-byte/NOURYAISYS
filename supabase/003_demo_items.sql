-- =====================================================================
-- بيانات تجريبية (اختياري): 3 عناصر منشورة باه تشوف الصفحة الرئيسية وصفحة الطالب عامرين.
-- تقدر تحذفهم من بعد: delete from public.items where title like '[تجريبي]%';
-- =====================================================================
insert into public.items (type, title, body, trainer_name, starts_at, ends_at, mode, location, meeting_link, capacity, published)
values
  ('course', '[تجريبي] من الفكرة إلى نموذج العمل: ورشة Business Model Canvas',
   'ورشة تطبيقية نبنيو فيها نموذج العمل تاع مشروعك خطوة بخطوة.',
   'د. أستاذ مكوّن', now() + interval '7 days', now() + interval '7 days 2 hours',
   'onsite', 'قاعة المحاضرات الكبرى — الجامعة', null, 40, true),
  ('course', '[تجريبي] مسار القرار 1275: كيف تحضّر مشروع «شهادة — مؤسسة ناشئة»',
   'شرح مسار القرار الوزاري 1275 والوثائق المطلوبة.',
   'أ. أستاذة مكوّنة', now() + interval '10 days', now() + interval '10 days 90 minutes',
   'online', null, 'https://meet.google.com/xxx-xxxx-xxx', null, true),
  ('event', '[تجريبي] يوم الابتكار: عرض مشاريع الطلبة أمام لجنة من الخبراء',
   'فرصة تعرض فيها مشروعك وتاخذ ملاحظات من الخبراء.',
   'فريق الحاضنة', now() + interval '17 days', now() + interval '17 days 4 hours',
   'onsite', 'بهو الجامعة — قسنطينة', null, 3, true),
  ('post', '[تجريبي] مرحبًا بكم في منصة حاضنة الأعمال',
   'من هنا تتابعو كل الدورات والأحداث وتأكدو حضوركم.', null, null, null,
   'onsite', null, null, null, true);
