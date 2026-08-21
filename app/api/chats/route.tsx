import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('chats')
      .select('*')
      .or(`user1.eq.${username},user2.eq.${username}`)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Ошибка получения чатов:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const chatsWithUsers = data.map((chat: any) => ({
      ...chat,
      otherUser: chat.user1 === username ? chat.user2 : chat.user1,
    }));

    return NextResponse.json(chatsWithUsers);
  } catch (error) {
    console.error('Ошибка в GET /api/chats:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { user1, user2 } = await request.json();

    if (!user1 || !user2) {
      return NextResponse.json({ error: 'user1 и user2 обязательны' }, { status: 400 });
    }

    if (user1 === user2 && user1 !== 'general') {
      return NextResponse.json({ error: 'Нельзя создать чат с самим собой' }, { status: 400 });
    }

    // Проверяем, существует ли чат
    const { data: existing, error: findError } = await supabase
      .from('chats')
      .select('*')
      .or(`and(user1.eq.${user1},user2.eq.${user2}),and(user1.eq.${user2},user2.eq.${user1})`)
      .maybeSingle();

    if (findError && findError.code !== 'PGRST116') {
      console.error('Ошибка поиска чата:', findError);
      return NextResponse.json({ error: findError.message }, { status: 500 });
    }

    if (existing) {
      return NextResponse.json({ success: true, chatId: existing.id, isNew: false });
    }

    const { data, error } = await supabase
      .from('chats')
      .insert([{ user1, user2 }])
      .select()
      .single();

    if (error) {
      console.error('Ошибка создания чата:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, chatId: data.id, isNew: true });
  } catch (error) {
    console.error('Ошибка в POST /api/chats:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}