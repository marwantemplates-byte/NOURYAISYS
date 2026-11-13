import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";
import AuthShell from "@/components/ui/AuthShell";
import { safeNext } from "@/lib/safe-next";

export const metadata: Metadata = { title: "تسجيل الدخول — حاضنة الأعمال" };

const NOTICES: Record<string, string> = {
  link: "الرابط غير صالح أو انتهت صلاحيته. سجّل الدخول، أو اطلب رابطًا جديدًا من «نسيت كلمة السر».",
  confirmed: "تم تأكيد بريدك الإلكتروني. يمكنك تسجيل الدخول الآن.",
  reset: "تم تغيير كلمة السر. سجّل الدخول بكلمة السر الجديدة.",
  blocked: "حسابك موقوف. تواصل مع إدارة الحاضنة.",
};

export default async function LoginPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const sp = await searchParams;
  const notice = typeof sp.error === "string" ? NOTICES[sp.error] : typeof sp.notice === "string" ? NOTICES[sp.notice] : undefined;
  return (
    <AuthShell title="تسجيل الدخول" subtitle="مرحبًا بعودتك إلى حاضنة الأعمال">
      <LoginForm next={safeNext(sp.next)} notice={notice} />
    </AuthShell>
  );
}
