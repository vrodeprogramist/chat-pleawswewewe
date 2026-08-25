import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');
  
  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }
  
  const { data, error } = await supabase
    .from('chats')
    .select(`
      id,
      user1,
      user2,
      messages (
        text,
        created_at
      )
    `)
    .or(`user1.eq.${username},user2.eq.${username}`)
    .order('created_at', { foreignTable: 'messages', ascending: false });
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  const formatted = data.map((chat: any) => {
    const otherUser = chat.user1 === username ? chat.user2 : chat.user1;
    const lastMsg = chat.messages?.[0];
    return {
      id: chat.id,
      user1: chat.user1,
      user2: chat.user2,
      otherUser,
      lastMessage: lastMsg?.text || '',
      lastMessageTime: lastMsg?.created_at || null,
    };
  });
  
  return NextResponse.json(formatted);
}

export async function POST(request: Request) {
  const { user1, user2 } = await request.json();
  
  if (!user1 || !user2) {
    return NextResponse.json({ error: 'Missing users' }, { status: 400 });
  }
  
  // Проверяем, есть ли уже чат
  const { data: existing } = await supabase
    .from('chats')
    .select('id')
    .or(`and(user1.eq.${user1},user2.eq.${user2}),and(user1.eq.${user2},user2.eq.${user1})`)
    .maybeSingle();
  
  if (existing) {
    return NextResponse.json({ chatId: existing.id });
  }
  
  const { data, error } = await supabase
    .from('chats')
    .insert({ user1, user2 })
    .select()
    .single();
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  
  return NextResponse.json({ chatId: data.id });
}