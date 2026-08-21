import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const usernames = searchParams.get('usernames')?.split(',') || [];

  if (usernames.length === 0) {
    return NextResponse.json([]);
  }

  try {
    const { data, error } = await supabase
      .from('users')
      .select('username, avatar_url')
      .in('username', usernames);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error('Ошибка в users:', error);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}