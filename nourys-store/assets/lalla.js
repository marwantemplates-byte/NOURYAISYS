// LALLA: shared store code (Supabase client, helpers, header, footer, product cards).
// Needs supabase-js loaded before this file. Pages set <body data-root=".."> for paths.
(function () {
  const ROOT = document.body.dataset.root || ".";

  // ---------- Settings you can edit ----------
  const BRAND = {
    name: "LALLA",
    ar: "لالة",
    tagline: "Maison d'accessoires",
    // Fill these to show them in the footer (leave "" to hide).
    phone: "",        // e.g. "0550123456"
    whatsapp: "",     // e.g. "213550123456" (without +)
    instagram: "",    // e.g. "lalla.dz"
    email: "",
    city: ""          // e.g. "تبسة" (shows as "تبسة، الجزائر")
  };

  const CATEGORIES = [
    { key: "sacs",     fr: "Sacs",     ar: "حقائب ومحافظ" },
    { key: "bijoux",   fr: "Bijoux",   ar: "مجوهرات" },
    { key: "montres",  fr: "Montres",  ar: "ساعات" },
    { key: "lunettes", fr: "Lunettes", ar: "نظارات شمسية" },
    { key: "foulards", fr: "Foulards", ar: "أوشحة وإكسسوارات الشعر" }
  ];

  // Same Supabase project and publishable key as before. The store is always a guest.
  const db = supabase.createClient(
    "https://wlpapvirtacrmcxcevuk.supabase.co",
    "sb_publishable_z8EeZip-KzTc6jbDVVNfsg_YWo4fFDs",
    { auth: { persistSession: false, autoRefreshToken: false, storageKey: "nourys-store" } }
  );

  const money = (n) => Number(n || 0).toLocaleString("fr-DZ") + " دج";
  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const catOf = (key) => CATEGORIES.find((c) => c.key === key);
  const offPct = (p) => (p.old_price && Number(p.old_price) > Number(p.price)) ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  const imagesOf = (p) => {
    const list = Array.isArray(p.images) ? p.images.filter(Boolean) : [];
    if (p.image_url && !list.includes(p.image_url)) list.unshift(p.image_url);
    return list;
  };

  // Elegant placeholder: shown when a product has no photo or the photo fails to load.
  function placeholder(p) {
    const d = el("div", "ph-art");
    d.setAttribute("aria-hidden", "true");
    d.append(el("span", null, (p && p.name ? p.name.trim().charAt(0) : "L")), el("small", null, "LALLA"));
    return d;
  }
  function photo(src, alt, p, eager) {
    const img = el("img");
    img.alt = alt || "";
    img.decoding = "async";
    if (!eager) img.loading = "lazy";
    img.width = 800; img.height = 1000;
    img.addEventListener("error", () => { img.replaceWith(placeholder(p)); });
    img.src = src;
    return img;
  }

  function card(p) {
    const a = el("a", "card");
    a.href = ROOT + "/product/index.html?id=" + encodeURIComponent(p.id);
    const ph = el("div", "ph");
    const src = imagesOf(p)[0];
    ph.appendChild(src ? photo(src, p.name, p) : placeholder(p));
    const badges = el("div", "badges");
    if (p.is_new) badges.appendChild(el("span", "badge new", "Nouveau"));
    const off = offPct(p);
    if (off) badges.appendChild(el("span", "badge off", "-" + off + "%"));
    ph.appendChild(badges);
    const meta = el("div", "meta");
    const c = catOf(p.category);
    if (c) meta.appendChild(el("span", "card-cat", c.ar));
    meta.appendChild(el("h3", null, p.name));
    const price = el("div", "price");
    price.appendChild(el("b", null, money(p.price)));
    if (off) { const s = el("s", null, money(p.old_price)); s.setAttribute("aria-label", "السعر القديم " + money(p.old_price)); price.appendChild(s); }
    meta.appendChild(price);
    a.append(ph, meta);
    return a;
  }
  function skeletons(n) {
    const f = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const d = el("div", "card sk"); d.setAttribute("aria-hidden", "true");
      d.append(el("div", "ph"), el("div", "line"), el("div", "line s"));
      f.appendChild(d);
    }
    return f;
  }

  async function loadProducts() {
    const { data, error } = await db.from("products").select("*").eq("active", true).order("id", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  // ---------- Header & footer ----------
  const I = {
    bag: '<svg class="ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6L5 8Z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>',
    truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>',
    cash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/><path d="M6 9.5v5M18 9.5v5"/></svg>',
    swap: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 8h14l-3-3M20 16H6l3 3"/></svg>'
  };

  function header() {
    const here = location.pathname;
    const cur = (p) => (here.includes(p) ? ' aria-current="page"' : "");
    return '<a class="skip" href="#main">تخطَّي إلى المحتوى</a>' +
      '<div class="announce">الدفع عند الاستلام · التوصيل إلى <b>58 ولاية</b></div>' +
      '<header class="site-header"><div class="wrap">' +
      '<nav class="nav" aria-label="القائمة الرئيسية">' +
        '<a href="' + ROOT + '/index.html"' + (!/\/(collection|product|admin)\//.test(here) ? ' aria-current="page"' : "") + '>الرئيسية</a>' +
        '<a href="' + ROOT + '/collection/index.html"' + cur("/collection") + '>المجموعة</a>' +
        '<a href="' + ROOT + '/collection/index.html?cat=bijoux">مجوهرات</a>' +
        '<a href="' + ROOT + '/collection/index.html?cat=sacs">حقائب</a>' +
      '</nav>' +
      '<a class="brand" href="' + ROOT + '/index.html" aria-label="LALLA، الصفحة الرئيسية"><span class="word">LALLA</span><span class="tag">Maison d\'accessoires</span></a>' +
      '<a class="icon-btn" href="' + ROOT + '/collection/index.html" aria-label="تسوّقي المجموعة">' + I.bag + '</a>' +
      '</div></header>';
  }

  function footer() {
    const contact = [];
    if (BRAND.phone) contact.push('<li><a class="ltr" href="tel:' + BRAND.phone + '">' + BRAND.phone + '</a></li>');
    if (BRAND.whatsapp) contact.push('<li><a href="https://wa.me/' + BRAND.whatsapp + '" target="_blank" rel="noopener">واتساب</a></li>');
    if (BRAND.instagram) contact.push('<li><a class="ltr" href="https://instagram.com/' + BRAND.instagram + '" target="_blank" rel="noopener">@' + BRAND.instagram + '</a></li>');
    if (BRAND.email) contact.push('<li><a class="ltr" href="mailto:' + BRAND.email + '">' + BRAND.email + '</a></li>');
    contact.push('<li>' + (BRAND.city ? BRAND.city + '، ' : '') + 'الجزائر</li>');
    return '<footer class="site-footer"><div class="wrap">' +
      '<div><a class="brand" href="' + ROOT + '/index.html" style="align-items:flex-start"><span class="word">LALLA</span><span class="tag">Maison d\'accessoires</span></a>' +
      '<p style="margin-top:16px;max-width:34ch">إكسسوارات نسائية مختارة بعناية، تصلك إلى باب دارك وتدفعين عند الاستلام.</p></div>' +
      '<div><h4>المجموعة</h4><ul>' + CATEGORIES.map((c) => '<li><a href="' + ROOT + '/collection/index.html?cat=' + c.key + '">' + c.ar + '</a></li>').join("") + '</ul></div>' +
      '<div><h4>تواصلي معنا</h4><ul>' + contact.join("") + '</ul></div>' +
      '<div class="legal"><span>© ' + new Date().getFullYear() + ' LALLA. جميع الحقوق محفوظة.</span><span class="fr ltr">Paiement à la livraison · Livraison 58 wilayas · Échange possible</span></div>' +
      '</div></footer>';
  }

  const h = document.getElementById("site-header"); if (h) h.outerHTML = header();
  const f = document.getElementById("site-footer"); if (f) f.outerHTML = footer();

  window.LALLA = { ROOT, BRAND, CATEGORIES, db, money, el, catOf, offPct, imagesOf, placeholder, photo, card, skeletons, loadProducts, icons: I };
})();
