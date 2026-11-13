"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProjectFields from "@/components/auth/ProjectFields";
import { Alert, Field, Input, SubmitButton } from "@/components/ui/form";
import { arabicError } from "@/lib/errors";
import { PHONE_RE, checkPdf, needsPdf, type ProfileFields, validateProject } from "@/lib/profile-options";
import { PROJECT_BUCKET, uploadProjectPdf } from "@/lib/project-file";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({
  userId,
  email,
  initial,
  currentFile,
  currentFileUrl,
}: {
  userId: string;
  email: string;
  initial: ProfileFields;
  currentFile: string | null;
  currentFileUrl: string | null;
}) {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFields>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [pdf, setPdf] = useState<File | null>(null);

  const set = <K extends keyof ProfileFields>(k: K, v: ProfileFields[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    setResult(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateProject(values) as Record<string, string>;
    if (values.full_name.trim().length < 3) err.full_name = "اكتب الاسم واللقب.";
    if (!PHONE_RE.test(values.phone.trim())) err.phone = "اكتب رقم هاتف صحيحًا.";
    if (needsPdf(values.level)) {
      const pdfErr = pdf ? checkPdf(pdf) : currentFile ? "" : "ارفع ملف المشروع بصيغة PDF.";
      if (pdfErr) err.project_pdf = pdfErr;
    }
    setErrors(err);
    if (Object.keys(err).length) {
      setResult({ kind: "error", text: "صحّح الحقول المعلَّمة باللون الأحمر." });
      return;
    }
    setLoading(true);
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
    if (!values.has_prototype) Object.assign(clean, { prototype_desc: null, prototype_link: null });
    const supabase = createClient();
    let newPath: string | null = null;
    if (pdf && needsPdf(values.level)) {
      const up = await uploadProjectPdf(supabase, userId, pdf);
      if (up.error || !up.path) {
        setLoading(false);
        return setResult({ kind: "error", text: "تعذّر رفع الملف: " + arabicError(up.error?.message) });
      }
      newPath = up.path;
      Object.assign(clean, { project_file: newPath });
    }
    const { error } = await supabase.from("profiles").update(clean).eq("id", userId);
    setLoading(false);
    if (error) return setResult({ kind: "error", text: arabicError(error.message) });
    // Replaced the PDF → remove the old one
    if (newPath && currentFile && currentFile !== newPath) {
      await supabase.storage.from(PROJECT_BUCKET).remove([currentFile]);
    }
    setPdf(null);
    setResult({ kind: "success", text: "تم حفظ التغييرات ✓" });
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <h2 className="text-xl font-bold text-olive">المعلومات الشخصية</h2>
      <Field label="الاسم واللقب" htmlFor="full_name" required error={errors.full_name}>
        <Input id="full_name" autoComplete="name" value={values.full_name} onChange={(e) => set("full_name", e.target.value)} aria-invalid={!!errors.full_name || undefined} />
      </Field>
      <Field label="البريد الإلكتروني" htmlFor="email" hint="لا يمكن تغيير البريد الإلكتروني.">
        <Input id="email" dir="ltr" value={email} disabled readOnly />
      </Field>
      <Field label="رقم الهاتف" htmlFor="phone" required error={errors.phone}>
        <Input id="phone" type="tel" dir="ltr" autoComplete="tel" value={values.phone} onChange={(e) => set("phone", e.target.value)} aria-invalid={!!errors.phone || undefined} />
      </Field>

      <h2 className="pt-4 text-xl font-bold text-olive">المشروع</h2>
      <ProjectFields
        values={values}
        errors={errors}
        onChange={set}
        pdf={{
          file: pdf,
          currentUrl: currentFileUrl,
          error: errors.project_pdf,
          onChange: (f) => {
            setPdf(f);
            setResult(null);
            setErrors((e) => ({ ...e, project_pdf: checkPdf(f) }));
          },
        }}
      />

      {result && <Alert kind={result.kind}>{result.text}</Alert>}
      <SubmitButton loading={loading}>حفظ التغييرات</SubmitButton>
    </form>
  );
}
