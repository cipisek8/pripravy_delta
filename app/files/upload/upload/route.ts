import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export const POST = async (req: NextRequest) => {
  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Parse FormData directly
  const formData = await req.formData();
  const file = formData.get('file') as File | null;

  if (!file) return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
  if (file.type !== 'application/pdf') return NextResponse.json({ error: 'Only PDFs allowed' }, { status: 400 });
  if (file.size > 50 * 1024 * 1024) return NextResponse.json({ error: 'Max 50MB exceeded' }, { status: 400 });

  // Convert file to ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const remotePath = `${user.id}/${file.name}`;

  const { error } = await supabase.storage
    .from('PDFs')
    .upload(remotePath, buffer, { cacheControl: '3600', upsert: true, contentType: file.type});

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data: urlData } = supabase.storage.from('PDFs').getPublicUrl(remotePath);

  return NextResponse.json({ publicUrl: urlData.publicUrl });
};
