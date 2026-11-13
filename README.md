# منصة حاضنة الأعمال — جامعة الأمير عبد القادر

مشروع منفصل عن NOURYS (فرع `incubator-platform`).

- **SPEC.md**: المواصفات الكاملة. أي أداة AI تقراه قبل ما تكتب كود.
- **public/hero/hero-desktop.jpg**: صورة الواجهة (16:9). **public/hero/hero-mobile.jpg**: صورة الهاتف (9:16).

## التشغيل
```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # بناء الإنتاج
```

## ضبط الـ Hero
| الثابت | الملف | الدور |
|---|---|---|
| `LEAF_COUNT_DESKTOP` | `components/hero/leaves.ts` | عدد الأوراق على الكمبيوتر (40) |
| `LEAF_COUNT_MOBILE` | `components/hero/leaves.ts` | عدد الأوراق على الهاتف، أقل من 768px (18) |
| `LEAF_EXTRA_TOP_DESKTOP` / `_MOBILE` | `components/hero/leaves.ts` | أوراق إضافية في الأعلى في صفحات الدخول والتسجيل (16 / 8) |

## بيانات تجريبية
- `data/events.ts`: الأحداث والدورات القادمة (تتبدل بـ Supabase من بعد).
- `data/site.ts`: معلومات التواصل وأرقام الإحصائيات.

## Supabase — الإعداد (مرة واحدة)
1. **قاعدة البيانات:** Supabase → **SQL Editor** → New query → الصق محتوى `supabase/001_schema.sql` → **Run**.
   (الملف آمن لإعادة التنفيذ بعد أي تعديل.)
2. **ملف المشروع PDF:** نفّذ `supabase/004_project_pdf.sql` (المخزن الخاص بملفات PDF لطلبة ليسانس 3 و ماستر 2).
   - **بيانات تجريبية (اختياري):** نفّذ `supabase/003_demo_items.sql`.
3. **روابط الموقع:** Authentication → **URL Configuration**:
   - **Site URL:** `https://incubator-platform-beryl.vercel.app`
   - **Redirect URLs:** زيد `https://incubator-platform-beryl.vercel.app/**` و `http://localhost:3000/**`
4. **قوالب الإيميل** (Authentication → **Email Templates**) — باه الروابط تخدم حتى إذا فتح الطالب الإيميل في جهاز آخر:
   - **Confirm signup:** بدّل الرابط بـ
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email&next=/app`
   - **Reset password:** بدّل الرابط بـ
     `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery&next=/reset-password`
5. **حساب مدير (بلا فورم التسجيل):**
   - نفّذ `supabase/005_admin_emails.sql` (فيه إيميل المدير؛ تقدر تزيد إيميلات أخرى).
   - Supabase → **Authentication → Users → Add user → Create new user**: الإيميل + كلمة السر + ✅ **Auto Confirm User**.
   - المدير يدخل من `/login` ويروح مباشرة لـ `/admin`.
   - (طريقة بديلة: `supabase/002_make_admin.sql` لحساب موجود من قبل.)

### المتغيرات
- `NEXT_PUBLIC_SUPABASE_URL` و `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (قيم علنية، شوف `.env.example`).
  القيم الحالية موجودة كافتراضية في `lib/supabase/config.ts`، والمتغيرات في Vercel تغلبها.
- **ممنوع** تحط `service_role` / secret key في الكود ولا في متغير يبدا بـ `NEXT_PUBLIC_`.

### الحماية (ملخص)
- الطالب يقرا ويبدّل بروفايلو برك، وما يقدرش يبدّل `role` ولا `status`.
- رابط Google Meet ما يتقراش من الجدول: يجي غير من `get_meeting_link()` بعد تأكيد الحضور.
- تأكيد/إلغاء الحضور عبر `rsvp_item()` / `cancel_rsvp()` (تحترم العدد الأقصى، والإلغاء ممنوع بعد ما يسجّل المدير الحضور).
- `attended` و `student_notes` و `email_campaigns`: للمدير برك.
