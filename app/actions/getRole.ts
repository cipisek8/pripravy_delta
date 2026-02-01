'use server'

import { createClient } from "@/lib/supabase/server";

export async function getRole()
{
  const supabase = createClient();

  const {data: { user }} = await (await supabase).auth.getUser();

  if (!user) return null;

  const { data } = await (await supabase)
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  return data?.role ?? null;
}