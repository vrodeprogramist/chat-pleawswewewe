import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  const username = formData.get('username') as string;
  
  if (!file || !username) {
    return NextResponse.json({ error: 'Missing file or username' }, { status: 400 });
  }
  
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = `avatars/${username}.jpg`;
  
  const { error: uploadError } = await supabase
    .storage
    .from('avatars')
    .upload(fileName, buffer, {
      contentType: 'image/jpeg',
      upsert: true,
    });
  
  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 });
  }
  
  const { data: urlData } = supabase
    .storage
    .from('avatars')
    .getPublicUrl(fileName);
  
  const avatarUrl = urlData.publicUrl;
  
  const { error: updateError } = await supabase
    .from('users')
    .update({ avatar_url: avatarUrl })
    .eq('username', username);
  
  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 });
  }
  
  return NextResponse.json({ avatarUrl });
}