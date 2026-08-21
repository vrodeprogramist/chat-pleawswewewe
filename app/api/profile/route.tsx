import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get('username');

  if (!username) {
    return NextResponse.json({ error: 'Username required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('users')
    .select('avatar_url')
    .eq('username', username)
    .single();

  if (error) {
    return NextResponse.json({});
  }

  return NextResponse.json({ avatarUrl: data?.avatar_url });
}