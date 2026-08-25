import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function PUT(request: Request) {
  try {
    const { username, bio } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('users')
      .update({ bio: bio || '' })
      .eq('username', username)
      .select();

    if (error) {
      console.error('❌ Ошибка обновления профиля:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, user: data[0] });
  } catch (error) {
    console.error('❌ Критическая ошибка:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}