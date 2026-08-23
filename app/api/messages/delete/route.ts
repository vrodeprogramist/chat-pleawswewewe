import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request) {
  try {
    const { messageId, username } = await request.json();

    if (!messageId || !username) {
      return NextResponse.json({ error: 'Не указан messageId или username' }, { status: 400 });
    }

    // Проверяем, что сообщение принадлежит пользователю
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .select('id, username')
      .eq('id', messageId)
      .single();

    if (messageError || !message) {
      return NextResponse.json({ error: 'Сообщение не найдено' }, { status: 404 });
    }

    if (message.username !== username) {
      return NextResponse.json({ error: 'Вы можете удалять только свои сообщения' }, { status: 403 });
    }

    // Удаляем сообщение
    const { error: deleteError } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId);

    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка удаления:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}