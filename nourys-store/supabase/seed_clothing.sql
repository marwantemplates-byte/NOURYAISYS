-- LALLA store: 10 winter clothing products (coats, trench coats, jumpers, cardigans).
-- Run AFTER 01_lalla_columns.sql. Safe to re-run: a product is skipped if one with the same name exists.
-- Photos are Unsplash stock images (free licence). Replace them from the admin page with your own photos.
-- Sizes and colours appear as choices in the order form and are saved with each order.

insert into public.products (name, description, price, old_price, image_url, category, colors, sizes, is_new, is_bestseller, active)
select v.name, v.description, v.price, v.old_price, v.image_url, v.category, v.colors, v.sizes, v.is_new, v.is_bestseller, true
from (values
  ('ترانش «سيرتا» مقاوم للمطر', 'ترانش كلاسيكي بقماش مقاوم للماء، أزرار مزدوجة وحزام على الخصر. يحميك من المطر والبرد ويليق مع الجينز والفستان.', 3200, 3900,
   'https://images.unsplash.com/photo-1539533018447-63fcce2678e3?w=900&q=80&auto=format&fit=crop', 'manteaux', array['بيج','كاكي','بني'], array['S','M','L','XL'], true, true),
  ('ترانش «تيبازة» طويل بحزام', 'ترانش طويل إلى تحت الركبة، أكمام واسعة وحزام قابل للنزع. قصّة مريحة تناسب الحجاب.', 2900, 3500,
   'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=900&q=80&auto=format&fit=crop', 'manteaux', array['أخضر زيتي','أسود','بيج'], array['S','M','L','XL'], false, true),
  ('معطف «وهران» مزدوج الأزرار', 'معطف بملمس الصوف، أزرار مزدوجة وياقة عريضة. دافئ وأنيق للخدمة والخرجات.', 3900, 4800,
   'https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=900&q=80&auto=format&fit=crop', 'manteaux', array['أسود','كاميل','رمادي'], array['S','M','L','XL'], false, false),
  ('معطف «بجاية» قصير بياقة عالية', 'معطف قصير بياقة عالية وحزام، يتنسق فوق بنطلون واسع أو مع تنورة طويلة.', 3400, 4200,
   'https://images.unsplash.com/photo-1548624313-0396c75e4b1a?w=900&q=80&auto=format&fit=crop', 'manteaux', array['بيج','عنابي'], array['S','M','L'], true, false),
  ('معطف «القالة» بملمس الكشمير', 'معطف ناعم بملمس الكشمير، بطانة خفيفة وجيوب جانبية. قطعة تدوم سنوات.', 3600, null,
   'https://images.unsplash.com/photo-1520975954732-35dd22299614?w=900&q=80&auto=format&fit=crop', 'manteaux', array['كريمي','رمادي','أسود'], array['S','M','L','XL'], true, false),
  ('سترة «الأوراس» مبطّنة', 'سترة مبطّنة خفيفة الوزن وشديدة الدفء، بقبعة قابلة للنزع. للأيام الباردة جدًا.', 4500, 5500,
   'https://images.unsplash.com/photo-1608234808654-2a8875faa7fd?w=900&q=80&auto=format&fit=crop', 'manteaux', array['أسود','بيج'], array['M','L','XL'], false, false),
  ('كارديغان «غيمة» طويل', 'كارديغان طويل وناعم بقصّة واسعة، يُلبس فوق أي إطلالة ويعطي دفئًا بلا ثقل.', 2500, 2900,
   'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=900&q=80&auto=format&fit=crop', 'pulls', array['بني','رمادي','بيج'], array['مقاس واحد'], true, true),
  ('كنزة «نسمة» بياقة عالية', 'كنزة محبوكة بياقة عالية وأكمام منفوخة قليلًا. دافئة ولا تحك الجلد.', 1950, 2400,
   'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=900&q=80&auto=format&fit=crop', 'pulls', array['عنابي','بيج','أسود','أخضر'], array['S/M','L/XL'], false, true),
  ('كنزة «ريحانة» محبوكة', 'كنزة بحبكة ناعمة وقصّة مريحة، تتنسق مع التنانير الطويلة والجينز.', 2200, null,
   'https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=900&q=80&auto=format&fit=crop', 'pulls', array['كريمي','وردي فاتح'], array['S/M','L/XL'], true, false),
  ('كارديغان «ندى» قصير بأزرار', 'كارديغان قصير بأزرار ذهبية، خفيف لأيام الخريف وفوق الفساتين.', 2300, 2800,
   'https://images.unsplash.com/photo-1608744882201-52a7f7f3dd60?w=900&q=80&auto=format&fit=crop', 'pulls', array['أسود','بيج'], array['S/M','L/XL'], false, false)
) as v(name, description, price, old_price, image_url, category, colors, sizes, is_new, is_bestseller)
where not exists (select 1 from public.products p where p.name = v.name);
