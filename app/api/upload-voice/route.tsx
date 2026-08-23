import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;

    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }

    const fileName = `voice_${username}_${Date.now()}.webm`;
    
    const { error: uploadError } = await supabase.storage
      .from('voice-messages')
      .upload(fileName, file, {
        cacheControl: '3600',
        contentType: 'audio/webm',
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from('voice-messages')
      .getPublicUrl(fileName);

    return NextResponse.json({ success: true, fileUrl: publicUrl.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}