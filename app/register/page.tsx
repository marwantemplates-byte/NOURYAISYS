import type { Metadata } from "next";
import RegisterForm from "@/components/auth/RegisterForm";
import AuthShell from "@/components/ui/AuthShell";

export const metadata: Metadata = { title: "التسجيل — حاضنة الأعمال" };

export default function RegisterPage() {
  return (
    <AuthShell title="سجّل في الحاضنة" subtitle="أنشئ حسابك وعرّف بمشروعك في دقيقتين." wide>
      <RegisterForm />
    </AuthShell>
  );
}
