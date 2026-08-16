import { NextResponse } from 'next/server';
import db from '..//lib/db';

export async function POST(request: Request) {
  const { username, password } = await request.json();

  // Проверяем, есть ли такой пользователь
  const existing = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (existing) {
    return NextResponse.json({ error: 'Пользователь уже существует' }, { status: 400 });
  }

  // Сохраняем нового пользователя
  const stmt = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)');
  stmt.run(username, password);

  return NextResponse.json({ success: true });
}