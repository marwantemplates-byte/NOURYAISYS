/** Options for the registration / profile forms. Edit freely. */
export const FACULTIES = [
  "كلية أصول الدين",
  "كلية الشريعة والاقتصاد",
  "كلية الآداب والحضارة الإسلامية",
  "أخرى",
];

export const LEVELS = ["ليسانس 1", "ليسانس 2", "ليسانس 3", "ماستر 1", "ماستر 2", "دكتوراه"];

export type ProfileFields = {
  full_name: string;
  phone: string;
  faculty: string;
  specialty: string;
  level: string;
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
  if (!v.project_title.trim()) e.project_title = "اكتب عنوان مشروعك (ولو مبدئيًا).";
  if (v.project_idea.trim().length < 20) e.project_idea = "اشرح فكرة المشروع في 20 حرفًا على الأقل.";
  if (v.has_prototype) {
    if (!v.prototype_desc.trim()) e.prototype_desc = "صف النموذج الأولي باختصار.";
    if (v.prototype_link.trim() && !/^https?:\/\//i.test(v.prototype_link.trim()))
      e.prototype_link = "الرابط يجب أن يبدأ بـ https://";
  }
  return e;
}
