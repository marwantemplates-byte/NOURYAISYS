"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ProjectFields from "@/components/auth/ProjectFields";
import { Alert, Field, Input, SubmitButton } from "@/components/ui/form";
import { arabicError } from "@/lib/errors";
import { PHONE_RE, type ProfileFields, validateProject } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/client";

export default function ProfileForm({ userId, email, initial }: { userId: string; email: string; initial: ProfileFields }) {
  const router = useRouter();
  const [values, setValues] = useState<ProfileFields>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof ProfileFields>(k: K, v: ProfileFields[K]) => {
    setValues((p) => ({ ...p, [k]: v }));
    setResult(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const err = validateProject(values) as Record<string, string>;
    if (values.full_name.trim().length < 3) err.full_name = "اكتب الاسم واللقب.";
    if (!PHONE_RE.test(values.phone.trim())) err.phone = "اكتب رقم هاتف صحيحًا.";
    setErrors(err);
    if (Object.keys(err).length) {
      setResult({ kind: "error", text: "صحّح الحقول المعلَّمة باللون الأحمر." });
      return;
    }
    setLoading(true);
    const clean = Object.fromEntries(Object.entries(values).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]));
    if (!values.has_prototype) Object.assign(clean, { prototype_desc: null, prototype_link: null });
    const { error } = await createClient().from("profiles").update(clean).eq("id", userId);
    setLoading(false);
    if (error) return setResult({ kind: "error", text: arabicError(error.message) });
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
      <ProjectFields values={values} errors={errors} onChange={set} />

      {result && <Alert kind={result.kind}>{result.text}</Alert>}
      <SubmitButton loading={loading}>حفظ التغييرات</SubmitButton>
    </form>
  );
}
