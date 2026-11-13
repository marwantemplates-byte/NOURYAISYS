import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import AdminShell from "@/components/admin/AdminShell";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "لوحة التحكم — حاضنة الأعمال" };

/** Admin area: only active admins. Real protection is RLS; this redirects everyone else. */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { profile } = await requireProfile();
  if (!profile || profile.role !== "admin" || profile.status !== "active") redirect("/app");
  return <AdminShell name={profile.full_name || profile.email}>{children}</AdminShell>;
}
