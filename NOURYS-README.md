# NOURYS: دليل المشروع الكامل

> هذا الملف يشرح مشروع NOURYS من الأول للآخر: وين كل حاجة، كيفاش تخدم، وكيفاش تكمل عليه بأي أداة (Claude Code، Codex، Gemini CLI…).
> آخر تحديث: 6 نوفمبر 2026. صاحب المشروع: مروان نويري، العوينات، تبسة.

---

## 1. واش هو NOURYS؟

منصة SaaS تخدم التجار الجزائريين اللي يبيعو بالدفع عند الاستلام (COD):

- **صفحة هبوط** تعرّف بالخدمة.
- **لوحة تحكم لكل تاجر**: يدخل بالإيميل وكلمة السر، يشوف طلبياته، ويبدّل حالتها.
- **استقبال الطلبيات أوتوماتيكيًا** من متجر التاجر (Shopify / WooCommerce / صفحة هبوط) عبر n8n.
- **رسائل واتساب أوتوماتيكية للزبون** في كل حالة: تأكيد، شحن، المندوب في الطريق، تم التسليم.
- **ربط مع شركة التوصيل** (Yalidine، ZR Express، Ecotrack): التاجر يحط مفاتيحه، والتسجيل الأوتوماتيكي **مازال ما تبناش** (شوف القسم 8).

ومن بعد، لكل تاجر عميل يتبنالو **موقع خاص بيه** (تصميم + فورم طلب + لوحة)، ماشي موقع واحد مشترك.

---

## 2. الخريطة: وين كاين كل شيء

| الجزء | الأداة | الرابط / المعرّف |
|---|---|---|
| الكود كامل | GitHub | `github.com/marwantemplates-byte/NOURYAISYS` |
| صفحة الهبوط | Vercel، مشروع `nourys-home` | https://nourys-home.vercel.app |
| لوحة التاجر | Vercel، مشروع `nourys-app` | (شوف Vercel ← nourys-app ← Domains) |
| قاعدة البيانات + تسجيل الدخول | Supabase | `https://dwphyhykervbxcllkqip.supabase.co` |
| الأوتوماتيزم | n8n Cloud | https://nourys.app.n8n.cloud |
| واتساب | Meta WhatsApp Cloud API | WABA ID `1395400362778447` |
| التصاميم | Canva | حساب Marwantemplates@gmail.com |

**حساب Vercel:** الفريق `nourys` (team ID `team_6jLKYvxtyeXkxh5tLKYcykSx`).

---

## 3. GitHub: كل فرع (branch) واش فيه

الريبو واحد، وكل جزء في فرع وحدو:

| الفرع | واش فيه | يترفع لـ Vercel في |
|---|---|---|
| `nourys-landing` | صفحة الهبوط: `index.html`، صور الفيديو `frames/`، `privacy.html`، `terms.html`، `data-deletion.html` | `nourys-home` |
| `nourys-app` | لوحة التاجر: `index.html` + ملفات SQL في `supabase/` | `nourys-app` |
| `nourys-demo` | صفحة فيديو ديمو المتابعة عبر واتساب | `nourys-demo` |
| `main` | متجر تجريبي `nourys-store/` + ديمو واتساب `whatsapp-demo/` + هذا الملف | `nourys-store` / `nourys-whatsapp-demo` |
| `brand-assets` | ملفات الهوية (لوغو…) | — |

كل المواقع **HTML + CSS + JavaScript عاديين**، بلا React وبلا build. تفتح الملف `index.html` في المتصفح وتشوفو ديراكت.

### كيفاش ترفع تعديل (deploy)
1. عدّل الملف.
2. `git add . && git commit -m "وصف التعديل" && git push origin <اسم-الفرع>`
3. Vercel يرفع وحدو إذا المشروع مربوط بالفرع. وإذا ما رفعش: Vercel ← المشروع ← Deployments ← **Redeploy**، ولا `vercel --prod` من الطرمينال.

---

## 4. Supabase: قاعدة البيانات

ملفات SQL في فرع `nourys-app` تحت `supabase/`، وتتنفذ بالترتيب في Supabase ← SQL Editor:

1. `01_schema.sql`: الجداول الأساسية، الأمان (RLS)، والـ triggers.
2. `02_signup_fields.sql`: حقول التسجيل (`owner_name`، `daily_orders`، `sales_channel`).
3. `03_carriers.sql`: جدول مفاتيح شركات التوصيل.

### الجداول
- **`merchants`**: التاجر (يتصاوب وحدو كي يسجّل). فيه `api_key` خاص بيه، يستعملو متجرو باش يبعث الطلبيات.
- **`orders`**: الطلبيات. حالة الطلبية `status` وحدة من هاذو:
  `new` ← `confirmed` ← `shipped` ← `out_for_delivery` ← `delivered` (ولا `returned` / `cancelled`)
- **`order_events`**: تاريخ كل طلبية (تبديل الحالة، رسالة واتساب خرجت ولا فشلت، ملاحظات). يتعمّر وحدو.
- **`carrier_connections`**: مفاتيح شركة التوصيل لكل تاجر. اللوحة تقدر **تكتب** المفاتيح وما تقدرش **تقراهم** (للأمان). غير n8n بمفتاح السيرفر يقدر يقراهم.

**الأمان:** كل تاجر يشوف غير طلبياتو (Row Level Security). مفتاح `service_role` **ما يتحطش أبدًا** في كود الموقع، يبقى غير في n8n.

---

## 5. n8n: الأوتوماتيزم

| الـ Workflow | ID | يخدم؟ | واش يدير |
|---|---|---|---|
| NOURYS — استقبال الطلبات | `BUfyU3zBstFnTPmr` | ✅ | يستقبل طلبية على `POST /webhook/nourys-order?key=<api_key>`، يتحقق من المفتاح في Supabase، ويسجّل الطلبية عند التاجر |
| NOURYS — رسائل حالة الطلب | `hvawrLIE7TdUlKGu` | ✅ | يستقبل تبديل الحالة على `POST /webhook/nourys-status`، يبعث قالب واتساب للزبون، ويسجّل في `order_events` |
| NOURYS — فحص حالة القوالب | `H2VKLQWp6UCxx6Xy` | يدوي | يقرا من Meta حالة القوالب ولا الأرقام المسجلة (بدّل الرابط حسب الحاجة) |
| NOURYS - Suivi client WhatsApp | `bhDohLEOwFBherYD` | ❌ | النسخة القديمة (Google Sheets + WaSender). ما عادش مستعملة |
| NOURY - AI Coach | `unAKBteVvghSijlK` | ✅ | بوت تيليغرام شخصي (@Marwan_coatch_bot)، ما عندو علاقة بالمنصة |

- **مفتاح واتساب في n8n:** credential اسمها «WhatsApp account» (ID `4RT2gVLng4HEOfvG`).
- **وين يتعيّط `nourys-status`؟** من Supabase ← Database ← Webhooks على جدول `orders` عند UPDATE. إذا الرسائل حبسو، تحقق من هنا أول حاجة.

### كيفاش متجر التاجر يبعث طلبية
```
POST https://nourys.app.n8n.cloud/webhook/nourys-order?key=<api_key تاع التاجر>
Content-Type: application/json

{ "customer_name": "...", "phone": "...", "wilaya": "...", "commune": "...",
  "address": "...", "product": "...", "quantity": 1, "total": 3500 }
```
الرابط كامل بالمفتاح يبان للتاجر في لوحتو ← الإعدادات، وكاين زر «طلبية تجريبية».
(أسماء الحقول بالضبط: شوفها في node «Receive order» في n8n.)

---

## 6. واتساب (Meta)

- **القوالب الأربعة موافق عليهم (APPROVED)** بالعربية، نوع UTILITY:
  `nourys_order_confirmed`، `nourys_order_shipped`، `nourys_out_for_delivery`، `nourys_order_delivered`
- ⚠️ **المشكل الحالي:** الرسائل تخرج من **رقم Meta التجريبي** (+1 555-673-3266، ID `1225399780665369`).
  - الزبون يشوف رقم أمريكي بلا اسم NOURYS.
  - يبعث **غير لـ 5 أرقام** متحقق منهم.
- **الحل:** رقم حقيقي (شريحة جزائرية جديدة، ولا رقم WhatsApp Business عبر Coexistence):
  WhatsApp Manager ← Phone numbers ← Add phone number، الاسم **NOURYS**، تأكيد بـ SMS.
  من بعد تبدّل `phone_number_id` في workflow «رسائل حالة الطلب».
- من بعد: **Business verification** في Meta Business باش يتنحاو الحدود ويبان الاسم.
- 🔐 **مهم:** التوكن الدائم تاع Meta تشارك في المحادثة من قبل، لازم **تبدّلو (rotate)** من Meta Business ← System users، وتحط الجديد في credential n8n.

---

## 7. الهوية البصرية

- **الألوان (FAZTI teal):** الخلفية `#0C6873` ← `#10808A`، الغامق `#053B42`، الأكسنت `#3FD1C6`، الفاتح `#BBE8EC`. ممنوع الأزرق السماوي والنيلي القدام.
- **Canva:** كل عنصر وحدو (نص قابل للتعديل، كل صورة عنصر). الكاروسيلات: 3 نقاط برك، كل وحدة بسهم منحني، بلا مربعات بيضاء.
- **الملصقات:** صورة وحدة كبيرة مقصوصة، مايلة بحوالي 10°، خارجة شوية من حافة الصفحة، وعليها motion blur يكبر لجهة الذيل (الحركة لليمين والبلور على اليسار).
- **الصور الحقيقية:** تتولد في Gemini من برومبت.
- **الكتابة في الموقع:** عربية فصحى بسيطة، والاتجاه RTL.

---

## 8. واش باقي (بالترتيب)

1. [ ] **رقم واتساب حقيقي** وتبديل `phone_number_id` في n8n (القسم 6).
2. [ ] **Rotate** توكن Meta.
3. [ ] **ربط شركة التوصيل فعليًا:** workflow في n8n، كي تولي الطلبية `confirmed`:
   - يقرا مفاتيح التاجر من `carrier_connections`.
   - يبعث الطلبية لـ API تاع الشركة.
   - يرجّع رقم التتبع للطلبية، ويسجّل في `order_events`.
   - يحتاج مفاتيح API حقيقية تاع شركة وحدة على الأقل باش نجربو.
4. [ ] **مزامنة الحالة من شركة التوصيل:** كل شوية يقرا الحالة (shipped / delivered / returned) ويبدّلها في `orders`، والرسائل تخرج وحدها.
5. [ ] **الدومين** nourys.com: Vercel ← nourys-home ← Domains.
6. [ ] **Business verification / App Review** في Meta.
7. [ ] صفحة الهبوط تذكر ميزة ربط شركة التوصيل، لازم تتبنى (رقم 3) قبل ما تتباع للتجار.

---

## 9. كيفاش تكمل بأي أداة AI

1. افتح الريبو (`git clone` ثم `git checkout <الفرع>`).
2. قول للأداة: **«اقرا NOURYS-README.md قبل كل شيء»**.
3. اطلب حاجة وحدة واضحة في كل مرة. مثال:
   > «في فرع nourys-app، في صفحة الإعدادات، زيد زر يمسح الطلبيات الملغاة. ما تبدلش التصميم. من بعد ورّيني التعديل.»
4. جرّب في المتصفح ← commit ← push.
5. ما تعطيش للأداة لا التوكنات ولا كلمات السر في الشات. حطهم في n8n credentials ولا Vercel Environment Variables.

**الأدوات:** Claude Code (Pro)، Codex (يجي مع ChatGPT)، Gemini CLI (مع اشتراك Gemini). الثلاثة يقراو نفس الريبو ونفس هذا الملف.
