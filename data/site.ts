/** Site-wide contact info. Leave a field empty ("") to hide it. */
export const CONTACT = {
  email: "incubator.emir@gmail.com",
  phone: "",
  phoneHref: "",
  facebook: "",
};

/** Number of partners shown on the home page (not stored in the database). */
export const PARTNERS_COUNT = 0; // 0 = hide the "شريك" stat

/** Fallback numbers — used only if Supabase is unreachable. */
export const STATS = [
  { value: 250, suffix: "+", label: "طالب مسجّل" },
  { value: 60, suffix: "", label: "مشروع مرافَق" },
  { value: 35, suffix: "", label: "دورة تكوينية" },
  { value: 12, suffix: "", label: "شريك" },
];
