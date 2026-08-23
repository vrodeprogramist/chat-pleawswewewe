import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { username, peerId } = await request.json();
    
    const { error } = await supabase
      .from('profiles')
      .update({ peer_id: peerId })
      .eq('username', username);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Ошибка обновления peer_id:', error);
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}