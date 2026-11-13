"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert, Field, Input, SubmitButton } from "@/components/ui/form";
import { arabicError } from "@/lib/errors";
import { createClient } from "@/lib/supabase/client";

/** Students' login. Admin accounts are refused here (the admin has /admin/login). */
export default function LoginForm({ next, notice }: { next: string | null; notice?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email.trim() || !password) {
      setError("اكتب البريد الإلكتروني وكلمة السر.");
      return;
    }
    setLoading(true);
    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setLoading(false);
      setError(arabicError(error.message));
      return;
    }
    // Blocked accounts can't use the platform
    const { data: profile } = await supabase.from("profiles").select("status,role").eq("id", data.user.id).maybeSingle();
    if (profile?.status === "blocked") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("حسابك موقوف. تواصل مع إدارة الحاضنة.");
      return;
    }
    if (profile?.role === "admin") {
      await supabase.auth.signOut();
      setLoading(false);
      setError("هذا الحساب خاص بالإدارة ولا يمكن استعماله في فضاء الطلبة.");
      return;
    }
    router.replace(next ?? "/app");
    router.refresh();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      {notice && <Alert kind="info">{notice}</Alert>}
      <Field label="البريد الإلكتروني" htmlFor="email" required>
        <Input id="email" type="email" dir="ltr" autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="كلمة السر" htmlFor="password" required>
        <Input id="password" type="password" dir="ltr" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </Field>
      <div className="-mt-2 text-left">
        <Link href="/forgot-password" className="inline-flex min-h-11 items-center text-sm font-medium text-emerald underline underline-offset-4">
          نسيت كلمة السر؟
        </Link>
      </div>
      {error && <Alert>{error}</Alert>}
      <SubmitButton loading={loading}>دخول</SubmitButton>
      <p className="text-center text-ink/70">
        ليس لديك حساب؟{" "}
        <Link href="/register" className="font-bold text-emerald underline underline-offset-4">
          سجّل الآن
        </Link>
      </p>
    </form>
  );
}
