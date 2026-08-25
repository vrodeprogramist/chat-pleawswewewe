import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================
// GET — получить сообщения чата
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json(
        { error: 'chatId is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', parseInt(chatId))
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Ошибка загрузки сообщений:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('❌ Ошибка GET /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// ============================================================
// POST — отправить сообщение
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📩 POST /api/messages body:', body);

    const { chatId, username, text, type, avatar_url, tempId, fileName, duration } = body;

    if (!chatId || !username || !text) {
      console.error('❌ Не все данные:', { chatId, username, text });
      return NextResponse.json(
        { error: 'chatId, username, text are required' },
        { status: 400 }
      );
    }

    // Сохраняем сообщение в БД
    const { data, error } = await supabase
      .from('messages')
      .insert({
        chat_id: parseInt(chatId),
        username,
        text,
        type: type || 'text',
        avatar_url: avatar_url || null,
        temp_id: tempId || null,
        file_name: fileName || null,
        duration: duration || null,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Ошибка вставки сообщения:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Обновляем last_message в чате
    await supabase
      .from('chats')
      .update({
        last_message: text,
        last_message_time: new Date().toISOString(),
      })
      .eq('id', parseInt(chatId));

    console.log('✅ Сообщение сохранено:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('❌ Ошибка POST /api/messages:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}