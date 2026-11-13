/** Site-wide placeholder content — replace with real values. */
export const CONTACT = {
  email: "incubator@example.dz",
  phone: "+213 00 00 00 00",
  phoneHref: "tel:+21300000000",
  facebook: "https://www.facebook.com/",
};

/** Number of partners shown on the home page (not stored in the database). */
export const PARTNERS_COUNT = 12;

/** Fallback numbers — used only if Supabase is unreachable. */
export const STATS = [
  { value: 250, suffix: "+", label: "طالب مسجّل" },
  { value: 60, suffix: "", label: "مشروع مرافَق" },
  { value: 35, suffix: "", label: "دورة تكوينية" },
  { value: 12, suffix: "", label: "شريك" },
];
