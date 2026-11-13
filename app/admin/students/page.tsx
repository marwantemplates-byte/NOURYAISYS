import StudentsTable, { type StudentRow } from "@/components/admin/StudentsTable";
import { requireProfile } from "@/lib/session";

export default async function StudentsPage() {
  const { supabase } = await requireProfile();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id,full_name,email,phone,faculty,specialty,level,project_title,project_idea,has_prototype,prototype_desc,prototype_link,project_file,status,created_at",
    )
    .eq("role", "student")
    .order("created_at", { ascending: false })
    .returns<StudentRow[]>();

  return (
    <>
      <h1 className="text-3xl font-bold text-olive">الطلبة</h1>
      <p className="mt-1 text-ink/70">جدول كل المسجلين بمعلومات التسجيل.</p>
      {error ? (
        <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
          تعذّر تحميل الطلبة. أعد تحميل الصفحة.
        </p>
      ) : (
        <StudentsTable rows={data ?? []} />
      )}
    </>
  );
}
