"use client";

import { Field, Input, Select, Textarea } from "@/components/ui/form";
import { FACULTIES, LEVELS, MAX_PDF_MB, needsPdf, type ProfileFields } from "@/lib/profile-options";

type Errors = Partial<Record<keyof ProfileFields, string>>;

export type PdfFieldProps = {
  file: File | null;
  /** Already uploaded file (profile page): link to open it. */
  currentUrl?: string | null;
  error?: string;
  onChange: (file: File | null) => void;
};

/** Faculty / specialty / level / project / prototype fields — shared by /register and /app/profile. */
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
      {pdf && needsPdf(values.level) && <PdfField level={values.level} {...pdf} />}
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
