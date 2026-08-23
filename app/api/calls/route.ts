import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { caller, receiver, type } = await request.json();

    if (!caller || !receiver) {
      return NextResponse.json({ error: 'Не указан caller или receiver' }, { status: 400 });
    }

    // Проверяем, что таблица calls существует
    const { data, error } = await supabase
      .from('calls')
      .insert([
        {
          caller,
          receiver,
          type: type || 'audio',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Ошибка создания звонка:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, callId: data.id });
  } catch (error) {
    console.error('Ошибка звонка:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}