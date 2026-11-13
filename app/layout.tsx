import type { Metadata, Viewport } from "next";
import { Reem_Kufi, Tajawal } from "next/font/google";
import { Suspense } from "react";
import NavFeedback from "@/components/ui/NavFeedback";
import "./globals.css";

const reemKufi = Reem_Kufi({
  subsets: ["arabic", "latin"],
  weight: ["500", "600", "700"],
  variable: "--font-reem-kufi",
  display: "swap",
});

const tajawal = Tajawal({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  variable: "--font-tajawal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "حاضنة الأعمال — جامعة الأمير عبد القادر للعلوم الإسلامية",
  description:
    "من فكرة إلى مؤسسة: نرافق الطلبة في تحويل مشاريعهم إلى نماذج أولية ومؤسسات ناشئة.",
};

export const viewport: Viewport = {
  themeColor: "#1F3D2B",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ar" dir="rtl" className={`${reemKufi.variable} ${tajawal.variable}`}>
      <body>
        {children}
        <Suspense>
          <NavFeedback />
        </Suspense>
      </body>
    </html>
  );
}
