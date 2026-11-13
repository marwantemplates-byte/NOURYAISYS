"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Field, Input, SubmitButton } from "@/components/ui/form";
import { arabicError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

/** Admin-only login: student accounts are refused. */
export default function AdminLoginForm({ notice }: { notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) return setError("اكتب البريد الإلكتروني وكلمة السر.");
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      return setError(arabicError(error.message));
    }
    const { data: profile } = await supabase.from("profiles").select("role,status").eq("id", data.user.id).maybeSingle();
    if (profile?.role !== "admin" || profile.status !== "active") {
      await supabase.auth.signOut();
      setLoading(false);
      return setError("هذا الحساب ليس حساب مدير.");
    }
    router.replace("/admin");
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {notice && <Alert kind="info">{notice}</Alert>}
      <Field label="البريد الإلكتروني" htmlFor="email" required>
        <Input id="email" type="email" dir="ltr" autoComplete="username" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="كلمة السر" htmlFor="password" required>
        <Input id="password" type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      {error && <Alert>{error}</Alert>}
      <SubmitButton loading={loading}>دخول لوحة التحكم</SubmitButton>
    </form>
  );
}
