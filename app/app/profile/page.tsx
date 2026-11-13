import type { Metadata } from "next";
import ProfileForm from "@/components/app/ProfileForm";
import { PROJECT_BUCKET } from "@/lib/project-file";
import { requireProfile } from "@/lib/session";

export const metadata: Metadata = { title: "ملفي — حاضنة الأعمال" };

export default async function ProfilePage() {
  const { supabase, user, profile } = await requireProfile();
  if (!profile) return null; // handled by the layout
  // Short-lived private link to the student's own PDF
  const fileUrl = profile.project_file
    ? (await supabase.storage.from(PROJECT_BUCKET).createSignedUrl(profile.project_file, 3600)).data?.signedUrl ?? null
    : null;
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold text-olive">ملفي</h1>
      <p className="mt-2 text-lg text-ink/70">حدّث معلوماتك ومعلومات مشروعك في أي وقت.</p>
      <div className="mt-8 rounded-2xl border border-olive/10 bg-white p-6 shadow-sm sm:p-8">
        <ProfileForm
          userId={user.id}
          currentFile={profile.project_file}
          currentFileUrl={fileUrl}
          email={profile.email || user.email || ""}
          initial={{
            full_name: profile.full_name ?? "",
            phone: profile.phone ?? "",
            faculty: profile.faculty ?? "",
            specialty: profile.specialty ?? "",
            level: profile.level ?? "",
            project_title: profile.project_title ?? "",
            project_idea: profile.project_idea ?? "",
            has_prototype: !!profile.has_prototype,
            prototype_desc: profile.prototype_desc ?? "",
            prototype_link: profile.prototype_link ?? "",
          }}
        />
      </div>
    </div>
  );
}
