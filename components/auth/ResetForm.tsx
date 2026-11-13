"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Field, Input, SubmitButton } from "@/components/ui/form";
import { arabicError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

export default function ResetForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("كلمة السر: 8 أحرف على الأقل.");
    if (password !== password2) return setError("كلمتا السر غير متطابقتين.");
    setLoading(true);
    const { error } = await createClient().auth.updateUser({ password });
    setLoading(false);
    if (error) return setError(arabicError(error.message));
    router.replace("/app");
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="كلمة السر الجديدة" htmlFor="password" required hint="8 أحرف على الأقل">
        <Input id="password" type="password" dir="ltr" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <Field label="تأكيد كلمة السر" htmlFor="password2" required>
        <Input id="password2" type="password" dir="ltr" autoComplete="new-password" value={password2} onChange={(e) => setPassword2(e.target.value)} />
      </Field>
      {error && <Alert>{error}</Alert>}
      <SubmitButton loading={loading}>حفظ كلمة السر</SubmitButton>
    </form>
  );
}
