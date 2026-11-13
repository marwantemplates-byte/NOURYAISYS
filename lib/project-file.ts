import type { SupabaseClient } from "@supabase/supabase-js";

export const PROJECT_BUCKET = "project-files";

/** Upload a student's project PDF to `project-files/<userId>/<timestamp>.pdf`. Returns the path. */
export async function uploadProjectPdf(supabase: SupabaseClient, userId: string, file: File) {
  const path = `${userId}/${Date.now()}.pdf`;
  const { error } = await supabase.storage
    .from(PROJECT_BUCKET)
    .upload(path, file, { contentType: "application/pdf", upsert: false });
  return { path: error ? null : path, error };
}
