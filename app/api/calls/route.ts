import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const { caller, receiver, type } = await request.json();

    const { data, error } = await supabase
      .from('calls')
      .insert([
        {
          caller,
          receiver,
          type,
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, callId: data.id });
  } catch (error) {
    return NextResponse.json({ error: 'Ошибка создания звонка' }, { status: 500 });
  }
}