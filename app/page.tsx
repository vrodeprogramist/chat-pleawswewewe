'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('chat_username');
    if (saved) setIsAuth(true);
    setLoading(false);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? '/api/login' : '/api/register';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (res.ok) {
      localStorage.setItem('chat_username', username);
      setIsAuth(true);
    } else {
      const data = await res.json();
      alert(data.error || 'Ошибка, попробуйте снова');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1c1212] flex items-center justify-center text-white">
        Загрузка...
      </div>
    );
  }

  if (isAuth) {
    return <Chat />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#1c1212]">
      <form onSubmit={handleSubmit} className="bg-black/30 p-8 rounded-lg w-80">
        <h2 className="text-white text-2xl mb-4">
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>
        <input
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full p-2 mb-2 rounded bg-white/10 text-white placeholder-gray-400"
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-2 mb-4 rounded bg-white/10 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          className="w-full bg-red-950 text-white p-2 rounded hover:bg-red-900 transition"
        >
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <p
          onClick={() => setIsLogin(!isLogin)}
          className="text-gray-400 text-sm mt-3 text-center cursor-pointer hover:underline"
        >
          {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
        </p>
      </form>
    </div>
  );
}

// ====== КОМПОНЕНТ ЧАТА ======
function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const username = localStorage.getItem('chat_username') || '';

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/messages');
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, text }),
      });
      setText('');
      fetchMessages();
    } catch (error) {
      console.error('Ошибка отправки сообщения:', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#1c1212] flex flex-col">
      {/* Шапка чата */}
      <header className="bg-black/50 p-4 flex justify-between items-center border-b border-white/10">
        <span className="text-white font-medium">Чат — {username}</span>
        <button
          onClick={() => {
            localStorage.removeItem('chat_username');
            window.location.reload();
          }}
          className="text-sm text-gray-400 hover:text-white transition"
        >
          Выйти
        </button>
      </header>

      {/* Сообщения */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-gray-500 text-center mt-10">Сообщений пока нет. Напиши первым!</div>
        )}
        {messages.map((msg: any) => (
          <div
            key={msg.id}
            className={`mb-3 ${
              msg.username === username ? 'text-right' : ''
            }`}
          >
            <span
              className={`inline-block px-4 py-2 rounded-lg ${
                msg.username === username
                  ? 'bg-red-950 text-white'
                  : 'bg-white/10 text-gray-200'
              }`}
            >
              <span className="font-bold text-xs opacity-70 block">
                {msg.username}
              </span>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Форма отправки */}
      <form onSubmit={sendMessage} className="p-4 bg-black/30 flex gap-2 border-t border-white/10">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Введите сообщение..."
          className="flex-1 p-2 rounded bg-white/10 text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-red-950"
        />
        <button
          type="submit"
          className="bg-red-950 text-white px-4 py-2 rounded hover:bg-red-900 transition"
        >
          Отправить
        </button>
      </form>
    </div>
  );
}