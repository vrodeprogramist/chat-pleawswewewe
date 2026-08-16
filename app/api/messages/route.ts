import { NextResponse } from 'next/server';
import { getMessages, sendMessage } from '../lib/messages';

export async function GET() {
  const messages = getMessages();
  return NextResponse.json(messages);
}

export async function POST(request: Request) {
  const { username, text } = await request.json();
  sendMessage(username, text);
  return NextResponse.json({ success: true });
}