import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// ============================================================
// POST — поставить реакцию
// ============================================================
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📩 POST /api/reactions body:', body);

    const { messageId, username, reaction } = body;

    // Проверяем наличие всех данных
    if (!messageId || !username || !reaction) {
      console.error('❌ Не все данные:', { messageId, username, reaction });
      return NextResponse.json(
        { error: 'Не все данные: нужны messageId, username, reaction' },
        { status: 400 }
      );
    }

    // Проверяем, есть ли уже реакция от этого пользователя
    const { data: existing, error: findError } = await supabase
      .from('reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('username', username)
      .maybeSingle();

    if (findError) {
      console.error('❌ Ошибка поиска реакции:', findError);
      return NextResponse.json(
        { error: findError.message },
        { status: 500 }
      );
    }

    if (existing) {
      // Обновляем реакцию
      console.log('🔄 Обновляем реакцию:', existing.id, '→', reaction);
      const { error: updateError } = await supabase
        .from('reactions')
        .update({ reaction })
        .eq('id', existing.id);

      if (updateError) {
        console.error('❌ Ошибка обновления реакции:', updateError);
        return NextResponse.json(
          { error: updateError.message },
          { status: 500 }
        );
      }
    } else {
      // Создаём новую
      console.log('➕ Создаём новую реакцию');
      const { error: insertError } = await supabase
        .from('reactions')
        .insert({ message_id: messageId, username, reaction });

      if (insertError) {
        console.error('❌ Ошибка вставки реакции:', insertError);
        return NextResponse.json(
          { error: insertError.message },
          { status: 500 }
        );
      }
    }

    console.log('✅ Реакция успешно сохранена');
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Критическая ошибка POST /api/reactions:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}

// ============================================================
// GET — получить реакции для списка сообщений
// ============================================================
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idsParam = searchParams.get('messageIds');
    console.log('📩 GET /api/reactions?messageIds=', idsParam);

    if (!idsParam) {
      return NextResponse.json([]);
    }

    const ids = idsParam.split(',').map(Number).filter(id => !isNaN(id));

    if (ids.length === 0) {
      return NextResponse.json([]);
    }

    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .in('message_id', ids);

    if (error) {
      console.error('❌ Ошибка получения реакций:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('✅ Получено реакций:', data?.length || 0);
    return NextResponse.json(data || []);
  } catch (error) {
    console.error('❌ Критическая ошибка GET /api/reactions:', error);
    return NextResponse.json(
      { error: 'Внутренняя ошибка сервера' },
      { status: 500 }
    );
  }
}