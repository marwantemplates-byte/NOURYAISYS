import type { Metadata } from "next";
import { redirect } from "next/navigation";
import ResetForm from "@/components/auth/ResetForm";
import AuthShell from "@/components/ui/AuthShell";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "كلمة سر جديدة — حاضنة الأعمال" };

export default async function ResetPasswordPage() {
  // Reached through the recovery link (/auth/confirm signs the user in first)
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?error=link");
  return (
    <AuthShell title="كلمة سر جديدة" subtitle="اختر كلمة سر جديدة لحسابك.">
      <ResetForm />
    </AuthShell>
  );
}
