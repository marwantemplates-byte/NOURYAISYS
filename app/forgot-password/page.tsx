import type { Metadata } from "next";
import ForgotForm from "@/components/auth/ForgotForm";
import AuthShell from "@/components/ui/AuthShell";

export const metadata: Metadata = { title: "نسيت كلمة السر — حاضنة الأعمال" };

export default function ForgotPasswordPage() {
  return (
    <AuthShell title="نسيت كلمة السر؟" subtitle="اكتب بريدك الإلكتروني وسنرسل لك رابطًا لتغييرها.">
      <ForgotForm />
    </AuthShell>
  );
}
