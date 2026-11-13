"use client";

import Link from "next/link";
import { useState } from "react";
import { Alert, Field, Input, SubmitButton } from "@/components/ui/form";
import { arabicError } from "@/lib/errors";
import { EMAIL_RE } from "@/lib/profile-options";
import { createClient } from "@/lib/supabase/client";

export default function ForgotForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!EMAIL_RE.test(email.trim())) {
      setError("اكتب بريدًا إلكترونيًا صحيحًا.");
      return;
    }
    setLoading(true);
    const { error } = await createClient().auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/confirm?next=/reset-password`,
    });
    setLoading(false);
    if (error) setError(arabicError(error.message));
    else setSent(true);
  };

  if (sent) {
    return (
      <div className="space-y-4">
        <Alert kind="success">
          إذا كان هذا البريد مسجّلًا لدينا، ستصلك رسالة فيها رابط لتغيير كلمة السر خلال دقائق. تفقّد أيضًا مجلد Spam.
        </Alert>
        <Link href="/login" className="inline-flex min-h-11 items-center font-bold text-emerald underline underline-offset-4">
          الرجوع إلى تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="البريد الإلكتروني" htmlFor="email" required>
        <Input id="email" type="email" dir="ltr" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      {error && <Alert>{error}</Alert>}
      <SubmitButton loading={loading}>إرسال رابط الاسترجاع</SubmitButton>
      <p className="text-center">
        <Link href="/login" className="inline-flex min-h-11 items-center text-emerald underline underline-offset-4">
          الرجوع إلى تسجيل الدخول
        </Link>
      </p>
    </form>
  );
}
