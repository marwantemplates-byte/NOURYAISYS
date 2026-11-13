"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import ProjectFields from "@/components/auth/ProjectFields";
import { Alert, Field, Input, SubmitButton } from "@/components/ui/form";
import { arabicError } from "@/lib/errors";
import { EMAIL_RE, PHONE_RE, checkPdf, needsPdf, type ProfileFields, validateProject } from "@/lib/profile-options";
import { uploadProjectPdf } from "@/lib/project-file";
import { createClient } from "@/lib/supabase/client";

type Account = { email: string; password: string; password2: string };

const EMPTY: ProfileFields = {
  full_name: "",
  phone: "",
  faculty: "",
  specialty: "",
  level: "",
  project_title: "",
  project_idea: "",
  has_prototype: false,
  prototype_desc: "",
  prototype_link: "",
};

/** Two-step registration: 1) account, 2) project. Creates the Supabase user with the profile as metadata;
 *  a database trigger copies it into `profiles`. */
export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [account, setAccount] = useState<Account>({ email: "", password: "", password2: "" });
  const [profile, setProfile] = useState<ProfileFields>(EMPTY);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [pdf, setPdf] = useState<File | null>(null);
  const [pdfWarning, setPdfWarning] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const setP = <K extends keyof ProfileFields>(k: K, v: ProfileFields[K]) => setProfile((p) => ({ ...p, [k]: v }));
  const setA = (k: keyof Account, v: string) => setAccount((a) => ({ ...a, [k]: v }));

  const goStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    const err: Record<string, string> = {};
    if (profile.full_name.trim().length < 3) err.full_name = "اكتب الاسم واللقب.";
    if (!EMAIL_RE.test(account.email.trim())) err.email = "اكتب بريدًا إلكترونيًا صحيحًا.";
    if (!PHONE_RE.test(profile.phone.trim())) err.phone = "اكتب رقم هاتف صحيحًا (مثال: 0555 12 34 56).";
    if (account.password.length < 8) err.password = "كلمة السر: 8 أحرف على الأقل.";
    if (account.password2 !== account.password) err.password2 = "كلمتا السر غير متطابقتين.";
    setErrors(err);
    if (Object.keys(err).length) return;
    setStep(2);
    requestAnimationFrame(() => headingRef.current?.focus());
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    const err = validateProject(profile) as Record<string, string>;
    if (needsPdf(profile.level)) {
      const pdfErr = pdf ? checkPdf(pdf) : "ارفع ملف المشروع بصيغة PDF.";
      if (pdfErr) err.project_pdf = pdfErr;
    }
    setErrors(err);
    if (Object.keys(err).length) return;

    setLoading(true);
    const supabase = createClient();
    const clean = Object.fromEntries(
      Object.entries(profile).map(([k, v]) => [k, typeof v === "string" ? v.trim() : v]),
    );
    const { data, error } = await supabase.auth.signUp({
      email: account.email.trim(),
      password: account.password,
      options: {
        data: clean,
        emailRedirectTo: `${window.location.origin}/auth/confirm?next=/app`,
      },
    });
    if (error) {
      setLoading(false);
      setFormError(arabicError(error.message));
      return;
    }

    // Project PDF (ليسانس 3 / ماستر 2): upload right after the account is created
    if (needsPdf(profile.level) && pdf && data.user) {
      const { path } = await uploadProjectPdf(supabase, data.user.id, pdf);
      const attached = path ? (await supabase.rpc("attach_signup_file", { p_user: data.user.id, p_path: path })).data : null;
      if (attached !== "ok") setPdfWarning(true);
    }
    setLoading(false);
    if (data.session) {
      // Email confirmation disabled in Supabase → already signed in
      router.replace("/app");
      router.refresh();
      return;
    }
    setSentTo(account.email.trim());
  };

  if (sentTo) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-5xl" aria-hidden="true">
          ✉️
        </p>
        <h2 className="text-2xl font-bold text-olive">بقيت خطوة واحدة!</h2>
        <p className="leading-relaxed text-ink/80">
          أرسلنا رسالة تأكيد إلى <strong dir="ltr">{sentTo}</strong>. افتحها واضغط على رابط التأكيد لتفعيل حسابك.
        </p>
        <p className="text-sm text-ink/60">لم تصلك الرسالة؟ تفقّد مجلد الرسائل غير المرغوب فيها (Spam).</p>
        {pdfWarning && (
          <Alert kind="info">لم نتمكّن من رفع ملف المشروع. بعد تأكيد حسابك، ارفعه من صفحة «ملفي».</Alert>
        )}
        <Link href="/login" className="inline-flex min-h-11 items-center font-bold text-emerald underline underline-offset-4">
          الذهاب إلى تسجيل الدخول
        </Link>
      </div>
    );
  }

  const aria = (k: string) => ({
    "aria-invalid": !!errors[k] || undefined,
    "aria-describedby": errors[k] ? `${k}-error` : undefined,
  });

  return (
    <>
      {/* Step indicator */}
      <ol className="mb-6 grid grid-cols-2 gap-2 text-sm font-medium" aria-label="مراحل التسجيل">
        {["الحساب", "المشروع"].map((label, i) => {
          const active = step === i + 1;
          const done = step > i + 1;
          return (
            <li key={label} aria-current={active ? "step" : undefined}>
              <span className={`block h-1.5 rounded-full ${active || done ? "bg-emerald" : "bg-olive/15"}`} />
              <span className={`mt-2 block ${active ? "text-olive" : "text-ink/50"}`}>
                {i + 1}. {label}
              </span>
            </li>
          );
        })}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className="mb-5 text-xl font-bold text-olive focus:outline-none">
        {step === 1 ? "معلومات الحساب" : "معلومات المشروع"}
      </h2>

      {step === 1 ? (
        <form onSubmit={goStep2} noValidate className="space-y-5">
          <Field label="الاسم واللقب" htmlFor="full_name" required error={errors.full_name}>
            <Input id="full_name" autoComplete="name" value={profile.full_name} onChange={(e) => setP("full_name", e.target.value)} {...aria("full_name")} />
          </Field>
          <Field label="البريد الإلكتروني" htmlFor="email" required error={errors.email}>
            <Input id="email" type="email" dir="ltr" autoComplete="email" inputMode="email" value={account.email} onChange={(e) => setA("email", e.target.value)} {...aria("email")} />
          </Field>
          <Field label="رقم الهاتف" htmlFor="phone" required error={errors.phone}>
            <Input id="phone" type="tel" dir="ltr" autoComplete="tel" inputMode="tel" value={profile.phone} onChange={(e) => setP("phone", e.target.value)} {...aria("phone")} />
          </Field>
          <Field label="كلمة السر" htmlFor="password" required error={errors.password} hint="8 أحرف على الأقل">
            <Input id="password" type="password" dir="ltr" autoComplete="new-password" value={account.password} onChange={(e) => setA("password", e.target.value)} {...aria("password")} />
          </Field>
          <Field label="تأكيد كلمة السر" htmlFor="password2" required error={errors.password2}>
            <Input id="password2" type="password" dir="ltr" autoComplete="new-password" value={account.password2} onChange={(e) => setA("password2", e.target.value)} {...aria("password2")} />
          </Field>
          <SubmitButton>التالي: معلومات المشروع</SubmitButton>
        </form>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          <ProjectFields
            values={profile}
            errors={errors}
            onChange={setP}
            pdf={{
              file: pdf,
              error: errors.project_pdf,
              onChange: (f) => {
                setPdf(f);
                setErrors((e) => ({ ...e, project_pdf: checkPdf(f) }));
              },
            }}
          />
          {formError && <Alert>{formError}</Alert>}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setErrors({});
              }}
              className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-olive/20 px-6 font-medium text-olive hover:border-olive sm:w-40"
            >
              رجوع
            </button>
            <SubmitButton loading={loading}>إنشاء الحساب</SubmitButton>
          </div>
        </form>
      )}

      <p className="mt-6 text-center text-ink/70">
        لديك حساب؟{" "}
        <Link href="/login" className="font-bold text-emerald underline underline-offset-4">
          سجّل الدخول
        </Link>
      </p>
    </>
  );
}
