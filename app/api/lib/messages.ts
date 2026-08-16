import db from './db';

export function getMessages() {
  const stmt = db.prepare('SELECT * FROM messages ORDER BY timestamp ASC');
  return stmt.all();
}

export function sendMessage(username: string, text: string) {
  const stmt = db.prepare('INSERT INTO messages (username, text) VALUES (?, ?)');
  return stmt.run(username, text);
}