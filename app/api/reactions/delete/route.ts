import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(request: Request) {
  try {
    const body = await request.json();
    console.log('🗑️ DELETE /api/reactions/delete body:', body);

    const { messageId, username } = body;

    if (!messageId || !username) {
      return NextResponse.json(
        { error: 'Не указаны messageId или username' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('username', username);

    if (error) {
      console.error('❌ Ошибка удаления реакции:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Реакция удалена');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Критическая ошибка DELETE /api/reactions/delete:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}