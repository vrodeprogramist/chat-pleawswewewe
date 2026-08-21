import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    // Валидация
    if (username.length < 5) {
      return NextResponse.json({ error: 'Ник должен быть не менее 5 символов' }, { status: 400 });
    }
    if (username.includes(' ')) {
      return NextResponse.json({ error: 'Ник не должен содержать пробелов' }, { status: 400 });
    }
    if (password.length < 5) {
      return NextResponse.json({ error: 'Пароль должен быть не менее 5 символов' }, { status: 400 });
    }

    // Проверяем, существует ли пользователь
    const { data: existing } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single();

    if (existing) {
      return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 });
    }

    // Регистрируем пользователя
    const { error } = await supabase
      .from('users')
      .insert([{ username, password }]);

    if (error) {
      console.error('Ошибка регистрации:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ==== СОЗДАЁМ ОБЩИЙ ЧАТ (если ещё нет) ====
    const { data: generalChat } = await supabase
      .from('chats')
      .select('id')
      .eq('user1', 'general')
      .eq('user2', 'general')
      .single();

    if (!generalChat) {
      await supabase
        .from('chats')
        .insert([{ user1: 'general', user2: 'general' }]);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка в register:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}