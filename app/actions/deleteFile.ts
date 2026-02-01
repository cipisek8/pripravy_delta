import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";


export const deleteFile = async (fileId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase.storage
    .from('PDFs')
    .remove([fileId]);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ message: 'File deleted successfully' }, { status: 200 });
};

