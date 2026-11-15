"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/form";
import {
  FACULTIES,
  IDEA_FIELDS,
  IDEA_FIELD_OTHER,
  IDEA_MAX_WORDS,
  LEVELS,
  LEVEL_OTHER,
  MAX_PDF_MB,
  countWords,
  needsPdf,
  type ProfileFields,
} from "@/lib/profile-options";

type Errors = Partial<Record<keyof ProfileFields, string>>;

export type PdfFieldProps = {
  file: File | null;
  /** Already uploaded file (profile page): link to open it. */
  currentUrl?: string | null;
  error?: string;
  onChange: (file: File | null) => void;
};

/** Faculty / specialty / level / project / prototype fields — shared by /register and /app/profile. */
/** Radio buttons styled as big cards (same look everywhere in the form). */
function ChoiceGroup<T extends string | boolean>({
  name,
  legend,
  hint,
  required,
  error,
  options,
  value,
  onChange,
  columns = 2,
}: {
  name: string;
  legend: string;
  hint?: string;
  required?: boolean;
  error?: string;
  options: { v: T; label: string }[];
  value: T | null;
  onChange: (v: T) => void;
  columns?: 1 | 2;
}) {
  return (
    <fieldset aria-invalid={!!error || undefined} aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}>
      <legend className="mb-1.5 font-medium text-ink">
        {legend}
        {required && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </legend>
      {hint && (
        <p id={`${name}-hint`} className="-mt-0.5 mb-2 text-sm text-ink/60">
          {hint}
        </p>
      )}
      <div className={`grid gap-3 ${columns === 2 ? "grid-cols-2" : "grid-cols-1 sm:grid-cols-2"}`}>
        {options.map((o) => (
          <label
            key={String(o.v)}
            className={`flex min-h-12 cursor-pointer items-center gap-2 rounded-xl border-2 px-3 py-2 font-medium leading-snug transition-colors ${
              columns === 2 ? "justify-center" : ""
            } ${value === o.v ? "border-emerald bg-emerald/10 text-olive" : error ? "border-red-300 bg-white text-ink/80" : "border-olive/15 bg-white text-ink/80"}`}
          >
            <input type="radio" name={name} className="h-5 w-5 shrink-0 accent-emerald" checked={value === o.v} onChange={() => onChange(o.v)} />
            {o.label}
          </label>
        ))}
      </div>
      {error && (
        <p id={`${name}-error`} className="mt-1 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </fieldset>
  );
}

/** Faculty / level / specialty / idea / project / prototype fields — shared by /register and /app/profile.
 *  Matches the incubator's official Google Form (2026/2027). */
export default function ProjectFields({
  values,
  errors,
  onChange,
  pdf,
}: {
  values: ProfileFields;
  errors: Errors;
  onChange: <K extends keyof ProfileFields>(key: K, value: ProfileFields[K]) => void;
  pdf?: PdfFieldProps;
}) {
  const aria = (k: keyof ProfileFields) => ({
    "aria-invalid": !!errors[k] || undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });
  const words = countWords(values.project_idea);
  const tooMany = words > IDEA_MAX_WORDS;
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
      {values.level === LEVEL_OTHER && (
        <Field label="حدّد المستوى" htmlFor="level_other" required error={errors.level_other}>
          <Input id="level_other" value={values.level_other} maxLength={100} onChange={(e) => onChange("level_other", e.target.value)} {...aria("level_other")} />
        </Field>
      )}
      {pdf && needsPdf(values.level) && <PdfField level={values.level} {...pdf} />}
      <Field label="التخصص" htmlFor="specialty" required error={errors.specialty}>
        <Input id="specialty" value={values.specialty} onChange={(e) => onChange("specialty", e.target.value)} placeholder="مثال: اقتصاد إسلامي" {...aria("specialty")} />
      </Field>

      <ChoiceGroup
        name="idea_field"
        legend="مجال الفكرة المقترحة"
        required
        error={errors.idea_field}
        columns={1}
        options={IDEA_FIELDS.map((f) => ({ v: f, label: f }))}
        value={values.idea_field || null}
        onChange={(v) => onChange("idea_field", v)}
      />
      {values.idea_field === IDEA_FIELD_OTHER && (
        <Field label="حدّد المجال" htmlFor="idea_field_other" required error={errors.idea_field_other}>
          <Input id="idea_field_other" value={values.idea_field_other} maxLength={150} onChange={(e) => onChange("idea_field_other", e.target.value)} {...aria("idea_field_other")} />
        </Field>
      )}

      <Field label="عنوان المشروع" htmlFor="project_title" required error={errors.project_title}>
        <Input id="project_title" value={values.project_title} onChange={(e) => onChange("project_title", e.target.value)} {...aria("project_title")} />
      </Field>
      <div>
        <Field label="موجز عن الفكرة المقترحة" htmlFor="project_idea" required error={errors.project_idea}>
          <Textarea
            id="project_idea"
            value={values.project_idea}
            onChange={(e) => onChange("project_idea", e.target.value)}
            aria-invalid={!!errors.project_idea || undefined}
            aria-describedby={errors.project_idea ? "project_idea-error" : "project_idea-hint"}
          />
        </Field>
        <div className="mt-1 flex items-center justify-between gap-3 text-sm">
          <p id="project_idea-hint" className="text-ink/60">
            لا يتعدّى {IDEA_MAX_WORDS} كلمة
          </p>
          <p aria-live="polite" className={`font-medium ${tooMany ? "text-red-700" : words > IDEA_MAX_WORDS * 0.9 ? "text-gold-dark" : "text-ink/55"}`}>
            {words} / {IDEA_MAX_WORDS} كلمة
          </p>
        </div>
      </div>

      <ChoiceGroup
        name="linked_to_thesis"
        legend="هل ترتبط فكرة المشروع بمذكرة التخرج؟"
        hint="خاص بطلبة السنة الثالثة ليسانس والسنة الثانية ماستر"
        required
        error={errors.linked_to_thesis}
        options={[
          { v: true, label: "نعم" },
          { v: false, label: "لا" },
        ]}
        value={values.linked_to_thesis}
        onChange={(v) => onChange("linked_to_thesis", v)}
      />

      <ChoiceGroup
        name="has_prototype"
        legend="هل لديك نموذج أولي؟"
        options={[
          { v: true, label: "نعم" },
          { v: false, label: "لا" },
        ]}
        value={values.has_prototype}
        onChange={(v) => onChange("has_prototype", v)}
      />

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

      <Field label="ملاحظات إضافية إن وجدت" htmlFor="extra_notes" error={errors.extra_notes} hint="اختياري">
        <Textarea id="extra_notes" value={values.extra_notes} maxLength={2000} onChange={(e) => onChange("extra_notes", e.target.value)} className="min-h-24" {...aria("extra_notes")} />
      </Field>
    </>
  );
}

/** Required project PDF for graduation-year students (ليسانس 3 / ماستر 2). */
function PdfField({ level, file, currentUrl, error, onChange }: PdfFieldProps & { level: string }) {
  const hasCurrent = !!currentUrl;
  return (
    <div className="rounded-xl border-2 border-dashed border-gold/60 bg-gold-light/20 p-4">
      <label htmlFor="project_pdf" className="block font-medium text-ink">
        ملف المشروع (PDF)
        {!hasCurrent && (
          <span className="text-red-700" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </label>
      <p id="project_pdf-hint" className="mt-1 text-sm text-ink/70">
        مطلوب لطلبة {level}: ملف PDF يعرّف بمشروعك (الحد الأقصى {MAX_PDF_MB} ميغا). يطّلع عليه مدير الحاضنة فقط.
      </p>
      {hasCurrent && (
        <p className="mt-2 text-sm">
          <a href={currentUrl!} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center font-bold text-emerald underline underline-offset-4">
            📄 عرض الملف الحالي
          </a>
          <span className="text-ink/60"> — اختر ملفًا جديدًا لاستبداله.</span>
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <input
          id="project_pdf"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          aria-invalid={!!error || undefined}
          aria-describedby={error ? "project_pdf-error" : "project_pdf-hint"}
          className="peer sr-only"
        />
        <label
          htmlFor="project_pdf"
          className="inline-flex min-h-12 cursor-pointer items-center gap-2 rounded-xl bg-olive px-5 font-bold text-white transition-colors hover:bg-emerald peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-gold"
        >
          <span aria-hidden="true">📎</span>
          {file ? "تغيير الملف" : hasCurrent ? "اختر ملفًا جديدًا" : "اختر ملف PDF"}
        </label>
        {!file && <span className="text-sm text-ink/60">لم يتم اختيار ملف</span>}
      </div>
      {file && !error && (
        <p className="mt-2 text-sm text-olive">
          ✓ {file.name} ({(file.size / 1024 / 1024).toFixed(1)} ميغا)
        </p>
      )}
      {error && (
        <p id="project_pdf-error" className="mt-2 text-sm font-medium text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
