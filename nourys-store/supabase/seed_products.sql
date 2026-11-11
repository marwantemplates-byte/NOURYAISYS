-- LALLA store: 16 starter products (women's accessories).
-- Run AFTER 01_lalla_columns.sql. Safe to re-run: a product is skipped if one with the same name exists.
-- Photos are Unsplash stock images (free licence). If a link ever breaks, the site shows a LALLA placeholder;
-- replace image_url from the admin page with your own product photos when you have them.

insert into public.products (name, description, price, old_price, image_url, category, colors, sizes, is_new, is_bestseller, active)
select v.name, v.description, v.price, v.old_price, v.image_url, v.category, v.colors, v.sizes, v.is_new, v.is_bestseller, true
from (values
  ('حقيبة يد «ياسمين»', 'حقيبة يد أنيقة من جلد صناعي ناعم، بمقبضين وحزام كتف قابل للنزع. تتسع للهاتف والمحفظة ومستلزماتك اليومية.', 7900, 9800,
   'https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=900&q=80&auto=format&fit=crop', 'sacs', array['أسود','بيج','عنابي'], null::text[], true, true),
  ('حقيبة كتف «القصبة»', 'حقيبة كتف مبطّنة بخياطة ناعمة وسلسلة معدنية، تناسب الخرجات والعمل.', 6500, 7900,
   'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=900&q=80&auto=format&fit=crop', 'sacs', array['أسود','كراميل'], null, false, true),
  ('حقيبة سهرة «ليلى»', 'حقيبة صغيرة للسهرات والأعراس، بسلسلة ذهبية رفيعة وقفل مغناطيسي.', 4900, 5900,
   'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=900&q=80&auto=format&fit=crop', 'sacs', array['ذهبي','أسود','وردي فاتح'], null, true, false),
  ('محفظة «نور» بسحّاب', 'محفظة نسائية بثماني خانات للبطاقات وجيب للعملة، حجم يدخل في أي حقيبة.', 2900, 3500,
   'https://images.unsplash.com/photo-1627123424574-724758594e93?w=900&q=80&auto=format&fit=crop', 'sacs', array['بيج','أسود','وردي'], null, false, false),
  ('حقيبة تسوّق «مدينة»', 'حقيبة كبيرة بقاع مقوّى وجيب داخلي بسحّاب، تحمل اللابتوب ومستلزمات اليوم كله.', 8500, null,
   'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=900&q=80&auto=format&fit=crop', 'sacs', array['بني','أسود'], null, false, true),
  ('عقد «قمر» مطلي بالذهب', 'عقد رقيق بقلادة هلال، مطلي بالذهب ومقاوم للاسوداد. طول 45 سم قابل للتعديل.', 3200, 4200,
   'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=900&q=80&auto=format&fit=crop', 'bijoux', null, null, false, true),
  ('سوار «خيط الذهب»', 'سوار رفيع قابل للتعديل، يُلبس وحده أو مع ساعتك.', 2400, 2900,
   'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?w=900&q=80&auto=format&fit=crop', 'bijoux', array['ذهبي','فضي'], null, false, false),
  ('أقراط «لؤلؤة»', 'أقراط صغيرة بلؤلؤ صناعي لامع، خفيفة ومريحة لكل يوم.', 1900, null,
   'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=900&q=80&auto=format&fit=crop', 'bijoux', null, null, true, false),
  ('خاتم «سوليتير» فضة 925', 'خاتم من الفضة عيار 925 بحجر لامع واحد، هدية مثالية.', 2600, 3200,
   'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=900&q=80&auto=format&fit=crop', 'bijoux', null, array['52','54','56','58'], false, false),
  ('طقم «عروس» عقد وأقراط', 'طقم مجوهرات للمناسبات: عقد وأقراط متناسقان، في علبة هدية.', 5900, 7500,
   'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=900&q=80&auto=format&fit=crop', 'bijoux', null, null, false, true),
  ('ساعة «سيرين» بسوار شبكي', 'ساعة نسائية بمينا رفيع وسوار معدني شبكي، مقاومة لرذاذ الماء.', 6900, 8500,
   'https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=900&q=80&auto=format&fit=crop', 'montres', array['ذهبي','فضي','ذهبي وردي'], null, true, true),
  ('ساعة «كلاسيك» بسوار جلد', 'ساعة بتصميم كلاسيكي وسوار جلد ناعم، تناسب العمل والمناسبات.', 5400, 6200,
   'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=900&q=80&auto=format&fit=crop', 'montres', array['بني','أسود'], null, false, false),
  ('نظارات «ريفييرا» عين القطة', 'نظارات شمسية بإطار عين القطة وعدسات UV400 تحمي عينيك.', 3400, 4200,
   'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=900&q=80&auto=format&fit=crop', 'lunettes', array['أسود','هافانا'], null, true, false),
  ('نظارات «صيف» بإطار كبير', 'إطار كبير خفيف الوزن وعدسات متدرّجة، مع جراب حماية.', 2900, null,
   'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=900&q=80&auto=format&fit=crop', 'lunettes', null, null, false, false),
  ('وشاح «زليج» حريري', 'وشاح ناعم الملمس بطبعة مستوحاة من الزليج، مقاس 90×90 سم.', 2800, 3500,
   'https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=900&q=80&auto=format&fit=crop', 'foulards', array['عنابي','أخضر زمردي','بيج'], null, true, false),
  ('مشبك شعر «فراشة» (قطعتان)', 'مشبكان للشعر بلمسة ذهبية، يثبّتان الشعر دون أن يشدّاه.', 1200, 1500,
   'https://images.unsplash.com/photo-1596944924616-7b38e7cfac36?w=900&q=80&auto=format&fit=crop', 'foulards', null, null, false, false)
) as v(name, description, price, old_price, image_url, category, colors, sizes, is_new, is_bestseller)
where not exists (select 1 from public.products p where p.name = v.name);

-- Optional: hide older products that don't belong to the new brand (e.g. the perfume demo).
-- Uncomment to run. This only sets active = false; nothing is deleted.
-- update public.products set active = false where category is null;
