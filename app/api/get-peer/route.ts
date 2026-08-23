import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('peer_id')
      .eq('username', username)
      .single();

    if (error) throw error;

    return NextResponse.json({ peerId: data?.peer_id || null });
  } catch (error) {
    console.error('Ошибка получения peer_id:', error);
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}