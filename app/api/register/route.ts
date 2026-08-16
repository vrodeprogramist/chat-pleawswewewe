import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Проверяем, есть ли такой пользователь
  const { data: existing } = await supabase
    .from('users')
    .select('username')
    .eq('username', username)
    .single();

  if (existing) {
    return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 });
  }

  // Добавляем пользователя
  const { error } = await supabase
    .from('users')
    .insert([{ username, password }]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}