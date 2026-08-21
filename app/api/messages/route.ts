import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const chatId = searchParams.get('chatId');

    if (!chatId) {
      return NextResponse.json({ error: 'chatId required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', parseInt(chatId))
      .order('timestamp', { ascending: true })
      .limit(100);

    if (error) {
      console.error('Ошибка загрузки сообщений:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Получаем аватарки для всех пользователей из таблицы users
    const usernames = [...new Set(data.map((m: any) => m.username))];
    const { data: users } = await supabase
      .from('users')
      .select('username, avatar_url')
      .in('username', usernames);

    const avatarMap = users?.reduce((acc: any, user: any) => {
      acc[user.username] = user.avatar_url;
      return acc;
    }, {});

    const messagesWithAvatars = data.map((msg: any) => ({
      ...msg,
      avatar_url: avatarMap?.[msg.username] || null,
    }));

    return NextResponse.json(messagesWithAvatars);
  } catch (error) {
    console.error('Ошибка в GET messages:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { chatId, username, text, type, replyTo, fileName, avatar_url } = await request.json();

    if (!chatId) {
      return NextResponse.json({ error: 'chatId required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        username,
        text,
        type: type || 'text',
        replyTo: replyTo || null,
        fileName: fileName || null,
        avatar_url: avatar_url || null,
      }]);

    if (error) {
      console.error('Ошибка вставки:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка в POST messages:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}