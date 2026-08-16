import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Получить все сообщения
export async function GET() {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('timestamp', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// Отправить сообщение
export async function POST(request: Request) {
  const { username, text } = await request.json();

  const { error } = await supabase
    .from('messages')
    .insert([{ username, text }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

// Удалить все сообщения (для админа)
export async function DELETE() {
  const { error } = await supabase.from('messages').delete().neq('id', 0);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}