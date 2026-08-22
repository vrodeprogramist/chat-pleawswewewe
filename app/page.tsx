'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

export default function Home() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [themeColor, setThemeColor] = useState('#ffffff');

  useEffect(() => {
    const savedColor = localStorage.getItem('chatColor') || '#ffffff';
    setThemeColor(savedColor);
    
    const checkAuth = async () => {
      const saved = localStorage.getItem('chat_username');
      if (saved) {
        try {
          const res = await fetch(`/api/profile?username=${saved}`);
          if (res.ok) {
            const data = await res.json();
            if (data.avatarUrl !== undefined) {
              setIsAuth(true);
            } else {
              localStorage.removeItem('chat_username');
            }
          } else {
            localStorage.removeItem('chat_username');
          }
        } catch (error) {
          console.error('Ошибка проверки пользователя:', error);
          localStorage.removeItem('chat_username');
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, []);

  const isLightColor = (color: string) => {
    if (color === '#ffffff' || color === '#FFFFFF' || color === 'white') return true;
    
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
  };

  const isLight = isLightColor(themeColor);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (username.length < 5) {
      alert('⚠️ Ник должен быть не менее 5 символов');
      return;
    }
    if (username.includes(' ')) {
      alert('⚠️ Ник не должен содержать пробелов');
      return;
    }
    if (password.length < 5) {
      alert('⚠️ Пароль должен быть не менее 5 символов');
      return;
    }

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
      <div 
        className="h-dvh flex items-center justify-center transition-colors duration-300"
        style={{ 
          backgroundColor: themeColor,
          color: isLight ? '#000000' : '#ffffff'
        }}
      >
        Загрузка...
      </div>
    );
  }

  if (isAuth) {
    return <Chat />;
  }

  return (
    <div 
      className="h-dvh flex items-center justify-center px-4 relative overflow-hidden transition-colors duration-300"
      style={{ backgroundColor: themeColor }}
    >
      <form 
        onSubmit={handleSubmit} 
        className={`p-6 sm:p-8 rounded-2xl w-full max-w-sm z-10 border shadow-lg transition-colors duration-300 ${
          isLight 
            ? 'bg-white border-gray-300' 
            : 'bg-black/20 border-white/20'
        }`}
        style={!isLight ? { backgroundColor: themeColor } : {}}
      >
        <h2 className={`text-2xl mb-4 ${isLight ? 'text-black' : 'text-white'}`}>
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-1 transition-colors duration-300 ${
              isLight 
                ? 'bg-gray-100 text-black placeholder-gray-500 border-gray-300 focus:ring-gray-400' 
                : 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:ring-white/30'
            }`}
          />
          <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            🔹 От 5 символов, придумай ник и пароль, и войди в чат!
          </p>
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 rounded-xl border focus:outline-none focus:ring-1 transition-colors duration-300 ${
              isLight 
                ? 'bg-gray-100 text-black placeholder-gray-500 border-gray-300 focus:ring-gray-400' 
                : 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:ring-white/30'
            }`}
          />
          <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
            🔹 От 5 символов
          </p>
        </div>
        <button 
          type="submit" 
          className={`w-full p-2 rounded-xl transition ${
            isLight 
              ? 'bg-gray-800 text-white hover:bg-gray-700' 
              : 'bg-white/20 text-white hover:bg-white/30'
          }`}
        >
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <p className={`text-xs text-center mt-6 border-t pt-4 transition-colors duration-300 ${
          isLight ? 'text-gray-600 border-gray-300' : 'text-gray-400 border-white/20'
        }`}>
          🔒 Анонимный чат · Только логин и пароль - и ты в чате!
        </p>
        <p 
          onClick={() => setIsLogin(!isLogin)} 
          className={`text-sm mt-3 text-center cursor-pointer hover:underline transition-colors duration-300 ${
            isLight ? 'text-gray-600' : 'text-gray-400'
          }`}
        >
          {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
        </p>
      </form>
    </div>
  );
}

function Chat() {
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [chatColor, setChatColor] = useState('#ffffff');
  const [isSending, setIsSending] = useState(false);

  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isChatListOpen, setIsChatListOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef<Set<number>>(new Set());

  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username') || '';
    const savedColor = localStorage.getItem('chatColor') || '#ffffff';
    setUsername(savedUsername);
    setChatColor(savedColor);
  }, []);

  useEffect(() => {
    setCurrentChatId(null);
    setCurrentChatUser('');
    localStorage.removeItem('currentChatId');
    localStorage.removeItem('currentChatUser');
  }, []);

  const loadChats = async () => {
    if (!username) return;
    try {
      const res = await fetch(`/api/chats?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setChats(data);
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const res = await fetch(`/api/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
        messageIds.current = new Set(data.map((m: any) => m.id));
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }
    setIsSearching(true);
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const existingChatUsers = chats.map(c => c.otherUser);
        const filtered = data.filter((u: any) => u.username !== username && !existingChatUsers.includes(u.username));
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const createChat = async (otherUser: string) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1: username, user2: otherUser }),
      });

      if (res.ok) {
        const data = await res.json();
        setSearch('');
        setSearchResults([]);
        await loadChats();
        const chatId = data.chatId;
        setCurrentChatId(chatId);
        setCurrentChatUser(otherUser);
        localStorage.setItem('currentChatId', String(chatId));
        localStorage.setItem('currentChatUser', otherUser);
        await loadChatMessages(chatId);
        if (window.innerWidth < 768) setIsChatListOpen(false);
      } else {
        const error = await res.json();
        alert(error.error || 'Ошибка создания чата');
      }
    } catch (error) {
      console.error('Ошибка создания чата:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  const selectChat = (chatId: number, otherUser: string) => {
    setCurrentChatId(chatId);
    setCurrentChatUser(otherUser);
    localStorage.setItem('currentChatId', String(chatId));
    localStorage.setItem('currentChatUser', otherUser);
    loadChatMessages(chatId);
    if (window.innerWidth < 768) setIsChatListOpen(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending || !currentChatId) return;

    const currentText = text;
    const currentReply = replyTo;
    setText('');
    if (replyTo) setReplyTo(null);
    setIsSending(true);

    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          username,
          text: currentText,
          type: 'text',
          replyTo: currentReply,
          avatar_url: avatarUrl,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        alert(data.error || 'Не удалось отправить сообщение');
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChatId) return;
    if (file.size > 50 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 50 МБ.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: currentChatId,
            username,
            text: data.fileUrl,
            type: data.isImage ? 'image' : data.isVideo ? 'video' : 'file',
            fileName: file.name,
            avatar_url: avatarUrl,
          }),
        });
      } else {
        alert('Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
    }
  };

  const loadAvatar = async () => {
    if (!username) return;
    try {
      const res = await fetch(`/api/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        if (data.avatarUrl) {
          setAvatarUrl(data.avatarUrl);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки аватарки:', error);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAvatar(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        
        // Мгновенно обновляем аватарку в интерфейсе
        setAvatarUrl(data.avatarUrl);
        
        // Обновляем сообщения в текущем чате
        setChatMessages((prev) =>
          prev.map((msg) =>
            msg.username === username
              ? { ...msg, avatar_url: data.avatarUrl }
              : msg
          )
        );
        
        // Обновляем список чатов
        setChats((prev) =>
          prev.map((chat) => ({
            ...chat,
            otherUserAvatar: chat.otherUser === username ? data.avatarUrl : chat.otherUserAvatar,
          }))
        );
        
        // Перезагружаем чаты для получения актуальных данных
        await loadChats();
        
        // Отправляем обновление через Supabase Realtime
        await supabase
          .from('users')
          .update({ avatar_url: data.avatarUrl })
          .eq('username', username);
      } else {
        alert('Ошибка загрузки аватарки');
      }
    } catch (error) {
      console.error('Ошибка загрузки аватарки:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  useEffect(() => {
    if (username) {
      loadAvatar();
      loadChats();
    }
  }, [username]);

  // Подписка на изменения профилей для实时 обновления аватарок
  useEffect(() => {
    if (!username) return;

    const subscription = supabase
      .channel('users-changes')
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => {
          const updatedUser = payload.new;
          
          // Обновляем аватарки в списке чатов
          setChats((prev) =>
            prev.map((chat) => {
              if (chat.user1 === updatedUser.username || chat.user2 === updatedUser.username) {
                return {
                  ...chat,
                  otherUserAvatar: updatedUser.avatar_url,
                };
              }
              return chat;
            })
          );
          
          // Обновляем аватарки в сообщениях текущего чата
          setChatMessages((prev) =>
            prev.map((msg) =>
              msg.username === updatedUser.username
                ? { ...msg, avatar_url: updatedUser.avatar_url }
                : msg
            )
          );
          
          // Если обновился текущий пользователь, обновляем его аватар
          if (updatedUser.username === username) {
            setAvatarUrl(updatedUser.avatar_url);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [username]);

  useEffect(() => {
    if (!currentChatId) return;

    const subscription = supabase
      .channel('messages')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.chat_id === currentChatId && !messageIds.current.has(newMsg.id)) {
            messageIds.current.add(newMsg.id);
            setChatMessages((prev) => [...prev, newMsg]);
            setChats((prev) => {
              const updated = prev.map((chat) => {
                if (chat.id === currentChatId) {
                  return { ...chat, lastMessage: newMsg.text, lastMessageTime: Date.now() };
                }
                return chat;
              });
              return updated.sort((a, b) => (b.lastMessageTime || 0) - (a.lastMessageTime || 0));
            });
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [currentChatId]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop <= clientHeight + 50;
    setShowScrollButton(!isAtBottom);
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00CEC9'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const darkenColor = (color: string, amount: number = 0.7) => {
    if (color === '#ffffff' || color === '#FFFFFF' || color === 'white') {
      const grayValue = Math.floor(255 * amount);
      return `rgb(${grayValue}, ${grayValue}, ${grayValue})`;
    }
    
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    r = Math.floor(r * amount);
    g = Math.floor(g * amount);
    b = Math.floor(b * amount);
    
    return `rgb(${r}, ${g}, ${b})`;
  };

  const isLightColor = (color: string) => {
    if (color === '#ffffff' || color === '#FFFFFF' || color === 'white') return true;
    
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
  };

  const isLight = isLightColor(chatColor);

  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    localStorage.removeItem('currentChatId');
    localStorage.removeItem('currentChatUser');
    window.location.reload();
  };

  return (
    <div className="h-dvh flex overflow-hidden relative transition-colors duration-300" style={{ backgroundColor: chatColor }}>
      {/* Шторка с чатами */}
      <div
        className={`absolute inset-0 z-30 flex flex-col transition-transform duration-300 ease-in-out ${
          isChatListOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 md:w-1/4 md:min-w-[280px] md:max-w-[400px] md:flex-shrink-0 md:z-auto`}
        style={{ backgroundColor: isLight ? '#f0f0f0' : darkenColor(chatColor, 0.9) }}
      >
        <div className="p-4 flex items-center justify-between">
          <span className={`font-bold text-lg ${isLight ? 'text-black' : 'text-white'}`}>Чаты</span>
          <button
            onClick={() => setIsChatListOpen(false)}
            className={`md:hidden ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70 transition`}
          >
            ✕
          </button>
        </div>
        <div className="px-4 pb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск по нику..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                searchUsers(e.target.value);
              }}
              className={`w-full p-2 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 ${
                isLight 
                  ? 'bg-gray-200 text-black placeholder-gray-500' 
                  : 'bg-white/10 text-white placeholder-gray-400 focus:ring-white/30'
              }`}
            />
            {searchResults.length > 0 && (
              <div className={`absolute top-full left-0 right-0 mt-1 border rounded-xl overflow-hidden z-30 ${
                isLight ? 'bg-white border-gray-300' : 'bg-black/50 border-white/10'
              }`}>
                {searchResults.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => createChat(user.username)}
                    className={`w-full flex items-center gap-3 p-3 transition text-left ${
                      isLight ? 'hover:bg-gray-100' : 'hover:bg-white/5'
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-xs">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <span className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>{user.username}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 && (
            <div className={`text-center text-sm mt-10 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
              Нет чатов. Найди друга по нику!
            </div>
          )}
          {chats.map((chat) => {
            const otherUser = chat.user1 === username ? chat.user2 : chat.user1;
            return (
              <button
                key={chat.id}
                onClick={() => selectChat(chat.id, otherUser)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                  currentChatId === chat.id 
                    ? (isLight ? 'bg-gray-300' : 'bg-white/10')
                    : (isLight ? 'hover:bg-gray-200' : 'hover:bg-white/5')
                }`}
              >
                <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                  {chat.otherUserAvatar ? (
                    <img
                      src={chat.otherUserAvatar}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getAvatarColor(otherUser) }}
                    >
                      {otherUser.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <span className={`font-medium text-sm block ${isLight ? 'text-black' : 'text-white'}`}>
                    {otherUser}
                  </span>
                  {chat.lastMessage && (
                    <span className={`text-xs block truncate max-w-[120px] ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                      {chat.username === username ? 'Вы: ' : ''}
                      {chat.lastMessage}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Основная область чата */}
      <div className="flex-1 flex flex-col overflow-hidden relative transition-colors duration-300" style={{ backgroundColor: chatColor }}>
        <header 
          className="p-4 flex justify-between items-center flex-shrink-0" 
          style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsChatListOpen(!isChatListOpen)}
              className={`md:hidden ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70 transition`}
            >
              ☰
            </button>
            <span className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>
              {currentChatId ? `Чат с ${currentChatUser}` : 'Выберите чат'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-sm hidden sm:block ${isLight ? 'text-gray-700' : 'text-gray-300'}`}>
              {username}
            </span>
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`}
              title="Настройки"
            >
              ⚙️
            </button>
          </div>
        </header>

        <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4">
          {!currentChatId && (
            <div className={`text-center mt-20 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
              👈 Выбери чат или найди друга по нику
            </div>
          )}
          {currentChatId && chatMessages.length === 0 && (
            <div className={`text-center mt-20 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>
              Сообщений пока нет
            </div>
          )}
          {currentChatId &&
            chatMessages.map((msg: any) => {
              const isMyMessage = msg.username === username;
              return (
                <div
                  key={msg.id}
                  className={`slide-up flex items-start gap-2 mb-3 ${
                    isMyMessage ? 'flex-row-reverse' : ''
                  }`}
                >
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${
                      isMyMessage 
                        ? (isLight ? 'bg-gray-800 text-white' : 'text-white')
                        : (isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-gray-200')
                    }`}
                    style={isMyMessage && !isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}
                  >
                    {msg.type === 'image' && (
                      <img src={msg.text} alt="Фото" className="max-w-[250px] rounded-xl" />
                    )}
                    {(!msg.type || msg.type === 'text') && (
                      <span className="break-words text-sm">{msg.text}</span>
                    )}
                  </div>
                </div>
              );
            })}
          <div ref={messagesEndRef} />
        </div>

        {currentChatId && (
          <form
            onSubmit={sendMessage}
            className="p-4 flex gap-2 items-center flex-shrink-0"
            style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}
          >
            <label className={`cursor-pointer transition shrink-0 ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <input
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                accept="image/*,video/*"
                capture="environment"
              />
            </label>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Введите сообщение..."
              className={`flex-1 p-2 rounded-xl focus:outline-none focus:ring-1 focus:ring-gray-400 min-w-0 ${
                isLight 
                  ? 'bg-gray-200 text-black placeholder-gray-500' 
                  : 'bg-white/10 text-white placeholder-gray-500 focus:ring-white/30'
              }`}
            />
            <button
              type="submit"
              disabled={isSending}
              className={`px-4 py-2 rounded-xl transition shrink-0 ${
                isLight ? 'bg-gray-800 text-white' : 'text-white'
              }`}
              style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}
            >
              {isSending ? 'Отправка...' : 'Отправить'}
            </button>
          </form>
        )}
      </div>

      {/* Настройки */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div 
            className={`border rounded-2xl max-w-md w-full p-6 ${
              isLight ? 'bg-white border-gray-300' : 'border-white/10'
            }`}
            style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.9) } : {}}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>Настройки</h2>
              <button
                onClick={() => setIsSettingsOpen(false)}
                className={`transition ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`}
              >
                ✕
              </button>
            </div>

            <div className="mb-6 text-center">
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Вы вошли как</p>
              <p className={`text-xl font-bold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>{username}</p>
              <button
                onClick={handleLogout}
                className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition text-sm"
              >
                Выйти из аккаунта
              </button>
            </div>

            <div className="mb-6">
              <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Аватарка</p>
              <div className="flex items-center gap-4">
                <div 
                  className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold"
                  style={{ backgroundColor: isLight ? '#333' : darkenColor(chatColor, 0.6) }}
                >
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    username.charAt(0).toUpperCase()
                  )}
                </div>
                <label 
                  className={`cursor-pointer text-white px-4 py-2 rounded-xl transition ${
                    isUploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  style={{ backgroundColor: isLight ? '#333' : darkenColor(chatColor, 0.6) }}
                >
                  {isUploadingAvatar ? 'Загрузка...' : 'Изменить'}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    disabled={isUploadingAvatar}
                  />
                </label>
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Цветовая тема</p>
              <div className="flex flex-wrap gap-2">
                {[
                  '#ffffff',
                  '#1c1515',
                  '#1a1a2e',
                  '#16213e',
                  '#0f3460',
                  '#4a2c2c',
                  '#2d4a2c',
                  '#4a2c4a',
                  '#2c4a4a',
                  '#3d1f1f',
                  '#1f3d1f',
                  '#1f1f3d',
                  '#3d3d1f',
                ].map((color) => (
                  <button
                    key={color}
                    onClick={() => {
                      setChatColor(color);
                      localStorage.setItem('chatColor', color);
                    }}
                    className={`w-10 h-10 rounded-full border-2 transition ${
                      chatColor === color 
                        ? (isLight ? 'border-gray-800' : 'border-white') 
                        : 'border-transparent'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={() => setIsSettingsOpen(false)}
              className={`w-full py-2 rounded-xl transition ${
                isLight ? 'bg-gray-800 text-white' : 'text-white'
              }`}
              style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}
            >
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}