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

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');

    const fileExt = file.name.split('.').pop();
    const cleanBaseName = cleanFileName(file.name.replace(/\.[^.]+$/, ''));
    const cleanUsername = cleanFileName(username);
    const fileName = `${cleanUsername}_${Date.now()}_${cleanBaseName}.${fileExt}`;

    const { error } = await supabase.storage
      .from('chat-files')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      console.error('Ошибка загрузки в Storage:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: publicUrl } = supabase.storage
      .from('chat-files')
      .getPublicUrl(fileName);

    return NextResponse.json({
      success: true,
      fileUrl: publicUrl.publicUrl,
      isImage,
      isVideo,
    });
  } catch (error) {
    console.error('Общая ошибка:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}