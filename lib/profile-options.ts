/** Options for the registration / profile forms. Edit freely. */
export const FACULTIES = [
  "كلية أصول الدين",
  "كلية الشريعة والاقتصاد",
  "كلية الآداب والحضارة الإسلامية",
  "أخرى",
];

export const LEVELS = [
  "ليسانس 1",
  "ليسانس 2",
  "ليسانس 3",
  "ماستر 1",
  "ماستر 2",
  "دكتوراه",
  "متخرج من الجامعة",
  "متخرج من خارج الجامعة",
  "أخرى",
];
export const LEVEL_OTHER = "أخرى";

/** «مجال الفكرة المقترحة» (as in the incubator's Google Form 2026/2027). */
export const IDEA_FIELDS = [
  "الخدمات (تعليمية، صحية، تجارية، إلكترونية…)",
  "الإنتاج الصناعي والتحويل",
  "الإنتاج الزراعي والفلاحي",
  "مجالات أخرى",
];
export const IDEA_FIELD_OTHER = "مجالات أخرى";

/** Short labels for tables / exports. */
export function ideaFieldLabel(field: string | null | undefined, other?: string | null) {
  if (!field) return "";
  if (field === IDEA_FIELD_OTHER) return other ? `أخرى: ${other}` : "أخرى";
  return field.replace(/\s*\(.*\)$/, "");
}
export function levelLabel(level: string | null | undefined, other?: string | null) {
  if (!level) return "";
  return level === LEVEL_OTHER && other ? `أخرى: ${other}` : level;
}

export const IDEA_MAX_WORDS = 100;
/** Words in a text (Arabic or Latin), split on whitespace. */
export const countWords = (t: string) => (t.trim() ? t.trim().split(/\s+/).length : 0);

export type ProfileFields = {
  full_name: string;
  phone: string;
  faculty: string;
  specialty: string;
  level: string;
  level_other: string;
  idea_field: string;
  idea_field_other: string;
  linked_to_thesis: boolean | null;
  extra_notes: string;
  project_title: string;
  project_idea: string;
  has_prototype: boolean;
  prototype_desc: string;
  prototype_link: string;
};

export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PHONE_RE = /^[+0-9\s-]{8,20}$/;

/** Returns Arabic error messages per field for the project part of the form. */
export function validateProject(v: ProfileFields) {
  const e: Partial<Record<keyof ProfileFields, string>> = {};
  if (!v.faculty) e.faculty = "اختر الكلية.";
  if (!v.specialty.trim()) e.specialty = "اكتب تخصصك.";
  if (!v.level) e.level = "اختر المستوى.";
  if (v.level === LEVEL_OTHER && !v.level_other.trim()) e.level_other = "حدّد المستوى.";
  if (!v.idea_field) e.idea_field = "اختر مجال الفكرة المقترحة.";
  if (v.idea_field === IDEA_FIELD_OTHER && !v.idea_field_other.trim()) e.idea_field_other = "حدّد المجال.";
  if (!v.project_title.trim()) e.project_title = "اكتب عنوان مشروعك (ولو مبدئيًا).";
  const words = countWords(v.project_idea);
  if (v.project_idea.trim().length < 20) e.project_idea = "اكتب موجزًا عن الفكرة (20 حرفًا على الأقل).";
  else if (words > IDEA_MAX_WORDS) e.project_idea = `الموجز طويل: ${words} كلمة. الحد الأقصى ${IDEA_MAX_WORDS} كلمة.`;
  if (v.linked_to_thesis === null) e.linked_to_thesis = "اختر نعم أو لا.";
  if (v.extra_notes.length > 2000) e.extra_notes = "الملاحظات طويلة (2000 حرف كحد أقصى).";
  if (v.has_prototype) {
    if (!v.prototype_desc.trim()) e.prototype_desc = "صف النموذج الأولي باختصار.";
    if (v.prototype_link.trim() && !/^https?:\/\//i.test(v.prototype_link.trim()))
      e.prototype_link = "الرابط يجب أن يبدأ بـ https://";
  }
  return e;
}

/** Levels that must upload a project PDF (graduation years). */
export const PDF_LEVELS = ["ليسانس 3", "ماستر 2"];
export const MAX_PDF_MB = 10;
export const needsPdf = (level: string | null | undefined) => !!level && PDF_LEVELS.includes(level);

/** Arabic error for an invalid PDF, or "" if the file is fine. */
export function checkPdf(file: File | null) {
  if (!file) return "";
  const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
  if (!isPdf) return "الملف يجب أن يكون بصيغة PDF.";
  if (file.size > MAX_PDF_MB * 1024 * 1024) return `حجم الملف أكبر من ${MAX_PDF_MB} ميغا.`;
  return "";
}

/** Trimmed values ready to save (drops «أخرى» texts and prototype fields that no longer apply). */
export function cleanProfile(v: ProfileFields) {
  const t = (x: string) => x.trim();
  return {
    full_name: t(v.full_name),
    phone: t(v.phone),
    faculty: v.faculty,
    specialty: t(v.specialty),
    level: v.level,
    level_other: v.level === LEVEL_OTHER ? t(v.level_other) : null,
    idea_field: v.idea_field,
    idea_field_other: v.idea_field === IDEA_FIELD_OTHER ? t(v.idea_field_other) : null,
    linked_to_thesis: v.linked_to_thesis,
    extra_notes: t(v.extra_notes) || null,
    project_title: t(v.project_title),
    project_idea: t(v.project_idea),
    has_prototype: v.has_prototype,
    prototype_desc: v.has_prototype ? t(v.prototype_desc) : null,
    prototype_link: v.has_prototype ? t(v.prototype_link) || null : null,
  };
}
