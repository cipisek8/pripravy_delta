import { createClient } from "@/lib/supabase/server";

export async function getFiles() {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('PDFs')
    .listV2({ prefix: (await supabase.auth.getClaims()).data.claims.sub + '/'});
  if (error) throw new Error(error.message);
  return data.objects;
}
