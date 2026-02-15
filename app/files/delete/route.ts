import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { filePath } = await req.json();
  console.log("test")


  if (!filePath) {
    return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
  }

  const supabase = await createClient();

  const { error } = await supabase.storage
    .from("PDFs")
    .remove([filePath]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}