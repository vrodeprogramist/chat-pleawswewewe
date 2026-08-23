import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

function cleanFileName(name: string): string {
  const translitMap: any = {
    'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
    'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
    'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
    'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
    'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
  };
  let result = '';
  for (const char of name.toLowerCase()) {
    result += translitMap[char] || char;
  }
  return result.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 50);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const username = formData.get('username') as string;

    if (!file) {
      return NextResponse.json({ error: 'Файл не выбран' }, { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const cleanBaseName = cleanFileName(file.name.replace(/\.[^.]+$/, ''));
    const cleanUsername = cleanFileName(username);
    const fileName = `avatar_${cleanUsername}_${Date.now()}_${cleanBaseName}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      return NextResponse.json({ error: uploadError.message }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    const { error: updateError } = await supabase
      .from('users')
      .update({ avatar_url: publicUrl.publicUrl })
      .eq('username', username);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, avatarUrl: publicUrl.publicUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}