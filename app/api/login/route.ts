import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .eq('password', password)
    .single();

  if (error || !user) {
    return NextResponse.json({ error: 'Неверный логин или пароль' }, { status: 401 });
  }

  return NextResponse.json({ success: true, username: user.username });
}