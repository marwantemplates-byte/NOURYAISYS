"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { FACULTIES, LEVELS, type ProfileFields } from "@/lib/profile-options";

type Errors = Partial<Record<keyof ProfileFields, string>>;

/** Faculty / specialty / level / project / prototype fields — shared by /register and /app/profile. */
export default function ProjectFields({
  values,
  errors,
  onChange,
}: {
  values: ProfileFields;
  errors: Errors;
  onChange: <K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) => void;
}) {
  const aria = (k: keyof ProfileFields) => ({
    "aria-invalid": !!errors[k] || undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="الكلية" htmlFor="faculty" required error={errors.faculty}>
          <Select id="faculty" value={values.faculty} onChange={(e) => onChange("faculty", e.target.value)} {...aria("faculty")}>
            <option value="">— اختر —</option>
            {FACULTIES.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="المستوى" htmlFor="level" required error={errors.level}>
          <Select id="level" value={values.level} onChange={(e) => onChange("level", e.target.value)} {...aria("level")}>
            <option value="">— اختر —</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="التخصص" htmlFor="specialty" required error={errors.specialty}>
        <Input id="specialty" value={values.specialty} onChange={(e) => onChange("specialty", e.target.value)} placeholder="مثال: اقتصاد إسلامي" {...aria("specialty")} />
      </Field>
      <Field label="عنوان المشروع" htmlFor="project_title" required error={errors.project_title}>
        <Input id="project_title" value={values.project_title} onChange={(e) => onChange("project_title", e.target.value)} {...aria("project_title")} />
      </Field>
      <Field label="فكرة المشروع" htmlFor="project_idea" required error={errors.project_idea} hint="ما المشكلة التي يحلها مشروعك؟ ولمن؟">
        <Textarea id="project_idea" value={values.project_idea} onChange={(e) => onChange("project_idea", e.target.value)} {...aria("project_idea")} />
      </Field>

      <fieldset>
        <legend className="mb-2 font-medium text-ink">هل لديك نموذج أولي؟</legend>
        <div className="grid grid-cols-2 gap-3">
          {[
            { v: true, label: "نعم" },
            { v: false, label: "لا" },
          ].map((o) => (
            <label
              key={o.label}
              className={`flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 font-medium transition-colors ${
                values.has_prototype === o.v ? "border-emerald bg-emerald/10 text-olive" : "border-olive/15 bg-white text-ink/80"
              }`}
            >
              <input
                type="radio"
                name="has_prototype"
                className="h-5 w-5 accent-emerald"
                checked={values.has_prototype === o.v}
                onChange={() => onChange("has_prototype", o.v)}
              />
              {o.label}
            </label>
          ))}
        </div>
      </fieldset>

      {values.has_prototype && (
        <>
          <Field label="وصف النموذج الأولي" htmlFor="prototype_desc" required error={errors.prototype_desc}>
            <Textarea id="prototype_desc" value={values.prototype_desc} onChange={(e) => onChange("prototype_desc", e.target.value)} {...aria("prototype_desc")} />
          </Field>
          <Field label="رابط النموذج الأولي" htmlFor="prototype_link" error={errors.prototype_link} hint="اختياري: موقع، فيديو، ملف…">
            <Input id="prototype_link" type="url" dir="ltr" inputMode="url" value={values.prototype_link} onChange={(e) => onChange("prototype_link", e.target.value)} placeholder="https://" {...aria("prototype_link")} />
          </Field>
        </>
      )}
    </>
  );
}
