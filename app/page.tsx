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
      <div className="h-dvh flex items-center justify-center" style={{ backgroundColor: themeColor, color: isLight ? '#000' : '#fff' }}>
        Загрузка...
      </div>
    );
  }

  if (isAuth) {
    return <Chat />;
  }

  return (
    <div className="h-dvh flex items-center justify-center px-4" style={{ backgroundColor: themeColor }}>
      <form onSubmit={handleSubmit} className={`p-6 sm:p-8 rounded-2xl w-full max-w-sm border shadow-lg ${isLight ? 'bg-white border-gray-300' : 'bg-black/20 border-white/20'}`}>
        <h2 className={`text-2xl mb-4 ${isLight ? 'text-black' : 'text-white'}`}>
          {isLogin ? 'Вход' : 'Регистрация'}
        </h2>
        <div className="mb-2">
          <input
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className={`w-full p-2 rounded-xl border ${isLight ? 'bg-gray-100 text-black border-gray-300' : 'bg-white/10 text-white border-white/20'}`}
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
            className={`w-full p-2 rounded-xl border ${isLight ? 'bg-gray-100 text-black border-gray-300' : 'bg-white/10 text-white border-white/20'}`}
          />
          <p className={`text-xs mt-1 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>🔹 От 5 символов</p>
        </div>
        <button type="submit" className={`w-full p-2 rounded-xl ${isLight ? 'bg-gray-800 text-white' : 'bg-white/20 text-white'}`}>
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
        <p className={`text-xs text-center mt-6 border-t pt-4 ${isLight ? 'text-gray-600 border-gray-300' : 'text-gray-400 border-white/20'}`}>
          🔒 Анонимный чат · Только логин и пароль - и ты в чате!
        </p>
        <p onClick={() => setIsLogin(!isLogin)} className={`text-sm mt-3 text-center cursor-pointer hover:underline ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
          {isLogin ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войди'}
        </p>
      </form>
    </div>
  );
}

function Chat() {
  const [text, setText] = useState('');
  const [username, setUsername] = useState('');
  const [chatColor, setChatColor] = useState('#ffffff');
  const [isSending, setIsSending] = useState(false);

  const [chats, setChats] = useState<any[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [deleteButton, setDeleteButton] = useState<{ messageId: number; x: number; y: number } | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callTimer, setCallTimer] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username') || '';
    const savedColor = localStorage.getItem('chatColor') || '#ffffff';
    setUsername(savedUsername);
    setChatColor(savedColor);
    setIsMobile(window.innerWidth < 768);
    loadChats();
    loadAvatar();
  }, []);

  useEffect(() => {
    if (username) {
      loadAvatar();
      loadChats();
    }
  }, [username]);

  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClick = () => setDeleteButton(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
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
        setAvatarUrl(data.avatarUrl);
        setChatMessages((prev) => prev.map((msg) => msg.username === username ? { ...msg, avatar_url: data.avatarUrl } : msg));
        setChats((prev) => prev.map((chat) => ({ ...chat, otherUserAvatar: chat.otherUser === username ? data.avatarUrl : chat.otherUserAvatar })));
        await loadChats();
      }
    } catch (error) {
      console.error('Ошибка загрузки аватарки:', error);
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const res = await fetch(`/api/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setChatMessages(data);
        messageIds.current = new Set(data.map((m: any) => m.id));
        setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'auto' }), 100);
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
        setIsSearchOpen(false);
        await loadChats();
        const chatId = data.chatId;
        setCurrentChatId(chatId);
        setCurrentChatUser(otherUser);
        await loadChatMessages(chatId);
      }
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  const selectChat = (chatId: number, otherUser: string) => {
    setCurrentChatId(chatId);
    setCurrentChatUser(otherUser);
    loadChatMessages(chatId);
  };

  const goBackToChats = () => {
    setCurrentChatId(null);
    setCurrentChatUser('');
    setChatMessages([]);
  };

  const closeSearch = () => {
    setIsSearchOpen(false);
    setSearch('');
    setSearchResults([]);
    setIsSearching(false);
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || isSending || !currentChatId) return;

    const currentText = text;
    setText('');
    setIsSending(true);

    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          username,
          text: currentText,
          type: 'text',
          avatar_url: avatarUrl,
        }),
      });
    } catch (error) {
      console.error('Ошибка отправки:', error);
    } finally {
      setIsSending(false);
    }
  };

  const deleteMessage = async (messageId: number) => {
    try {
      console.log('Удаление сообщения:', messageId, 'пользователь:', username);
      
      const res = await fetch('/api/messages/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, username }),
      });

      const data = await res.json();
      console.log('Ответ удаления:', data);

      if (res.ok) {
        setChatMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        messageIds.current.delete(messageId);
        setDeleteButton(null);
      } else {
        alert(data.error || 'Ошибка удаления сообщения');
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка соединения с сервером');
    }
  };

  const showDeleteButton = (e: React.MouseEvent, messageId: number, isMyMessage: boolean) => {
    if (!isMyMessage) return;
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDeleteButton({
      messageId,
      x: rect.left - 40,
      y: rect.top + rect.height / 2,
    });
  };

  const startCall = async (type: 'audio' | 'video') => {
    if (!currentChatUser) {
      alert('Выберите чат');
      return;
    }
    
    console.log('Начало звонка:', type, 'кому:', currentChatUser);
    
    setCallType(type);
    setIsCalling(true);
    
    try {
      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caller: username,
          receiver: currentChatUser,
          type,
        }),
      });

      const data = await res.json();
      console.log('Ответ звонка:', data);

      if (!res.ok) {
        alert(data.error || 'Ошибка создания звонка');
        setIsCalling(false);
      }
    } catch (error) {
      console.error('Ошибка звонка:', error);
      alert('Ошибка соединения с сервером');
      setIsCalling(false);
    }
  };

  const acceptCall = () => {
    if (!incomingCall) return;
    setCallType(incomingCall.type);
    setIsCalling(false);
    setIncomingCall(null);
    setIsCallActive(true);
    setCallTimer(0);
    
    callTimerRef.current = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);
  };

  const declineCall = () => {
    setIncomingCall(null);
  };

  const cancelCall = () => {
    setIsCalling(false);
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallTimer(0);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
  };

  const formatCallTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Подписка на звонки
  useEffect(() => {
    if (!username) return;
    
    console.log('Подписка на звонки для:', username);
    
    const channel = supabase
      .channel('calls-channel-' + username)
      .on('postgres_changes',
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'calls',
          filter: `receiver=eq.${username}`
        },
        (payload) => {
          console.log('Новый звонок:', payload.new);
          const newCall = payload.new;
          if (newCall.status === 'pending') {
            setIncomingCall(newCall);
          }
        }
      )
      .subscribe((status) => {
        console.log('Статус подписки на звонки:', status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  // Подписка на новые сообщения
  useEffect(() => {
    if (!currentChatId) return;
    
    const channel = supabase
      .channel('messages-' + currentChatId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new;
          if (newMsg.chat_id === currentChatId && !messageIds.current.has(newMsg.id)) {
            messageIds.current.add(newMsg.id);
            setChatMessages((prev) => [...prev, newMsg]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChatId]);

  // Подписка на удаление сообщений
  useEffect(() => {
    if (!currentChatId) return;
    
    const channel = supabase
      .channel('messages-delete-' + currentChatId)
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('Сообщение удалено:', payload.old);
          const deletedMsg = payload.old;
          if (deletedMsg.chat_id === currentChatId) {
            setChatMessages((prev) => prev.filter((msg) => msg.id !== deletedMsg.id));
            messageIds.current.delete(deletedMsg.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentChatId]);

  // Подписка на обновление профилей
  useEffect(() => {
    if (!username) return;
    
    const channel = supabase
      .channel('users-updates-' + username)
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'users' },
        (payload) => {
          const updatedUser = payload.new;
          setChats((prev) => prev.map((chat) => {
            if (chat.user1 === updatedUser.username || chat.user2 === updatedUser.username) {
              return { ...chat, otherUserAvatar: updatedUser.avatar_url };
            }
            return chat;
          }));
          setChatMessages((prev) => prev.map((msg) => msg.username === updatedUser.username ? { ...msg, avatar_url: updatedUser.avatar_url } : msg));
          if (updatedUser.username === username) {
            setAvatarUrl(updatedUser.avatar_url);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [username]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current !== null) {
      const diff = touchStartX.current - e.changedTouches[0].clientX;
      if (diff < -50 && currentChatId && isMobile) {
        goBackToChats();
      }
    }
    touchStartX.current = null;
  };

  const getAvatarColor = (name: string) => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00CEC9'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const darkenColor = (color: string, amount: number = 0.7) => {
    if (color === '#ffffff') {
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
    if (color === '#ffffff') return true;
    let r = parseInt(color.slice(1, 3), 16);
    let g = parseInt(color.slice(3, 5), 16);
    let b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150;
  };

  const isLight = isLightColor(chatColor);

  const handleLogout = () => {
    localStorage.removeItem('chat_username');
    window.location.reload();
  };

  const getCurrentChatAvatar = () => {
    const currentChat = chats.find(chat => 
      (chat.user1 === username && chat.user2 === currentChatUser) ||
      (chat.user2 === username && chat.user1 === currentChatUser)
    );
    return currentChat?.otherUserAvatar || null;
  };

  const currentChatAvatar = getCurrentChatAvatar();

  // Мобильный вид: список чатов
  if (isMobile && !currentChatId) {
    return (
      <div className="h-dvh flex flex-col" style={{ backgroundColor: isLight ? '#f0f0f0' : darkenColor(chatColor, 0.9) }}>
        {!isSearchOpen ? (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>⚙️</button>
              <div>
                <span className={`font-bold text-lg ${isLight ? 'text-black' : 'text-white'}`}>Чаты</span>
                <span className={`text-xs ml-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>({username})</span>
              </div>
            </div>
            <button onClick={() => setIsSearchOpen(true)} className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>🔍</button>
          </div>
        ) : (
          <div className="p-4 flex items-center gap-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Поиск по нику..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); searchUsers(e.target.value); }}
              className={`flex-1 p-2 rounded-xl text-sm ${isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-white'}`}
            />
            <button onClick={closeSearch} className={isLight ? 'text-gray-600' : 'text-gray-400'}>✕</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          {!isSearchOpen ? (
            <>
              {chats.length === 0 && (
                <div className={`text-center text-sm mt-10 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Нет чатов. Нажми на лупу для поиска!</div>
              )}
              {chats.map((chat) => {
                const otherUser = chat.user1 === username ? chat.user2 : chat.user1;
                return (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat.id, otherUser)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${isLight ? 'hover:bg-gray-200' : 'hover:bg-white/5'}`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {chat.otherUserAvatar ? (
                        <img src={chat.otherUserAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getAvatarColor(otherUser) }}>
                          {otherUser.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`font-medium text-sm block ${isLight ? 'text-black' : 'text-white'}`}>{otherUser}</span>
                      {chat.lastMessage && (
                        <span className={`text-xs block truncate max-w-[200px] ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                          {chat.username === username ? 'Вы: ' : ''}{chat.lastMessage}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {searchResults.map((user) => (
                <button
                  key={user.username}
                  onClick={() => createChat(user.username)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>{user.username}</span>
                </button>
              ))}
            </>
          )}
        </div>

        {isSettingsOpen && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className={`border rounded-2xl max-w-md w-full p-6 ${isLight ? 'bg-white border-gray-300' : 'border-white/10'}`} style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.9) } : {}}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>Настройки</h2>
                <button onClick={() => setIsSettingsOpen(false)} className={isLight ? 'text-gray-600' : 'text-gray-400'}>✕</button>
              </div>

              <div className="mb-6 text-center">
                <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Вы вошли как</p>
                <p className={`text-xl font-bold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>{username}</p>
                <button onClick={handleLogout} className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">
                  Выйти из аккаунта
                </button>
              </div>

              <div className="mb-6">
                <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Аватарка</p>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: isLight ? '#333' : darkenColor(chatColor, 0.6) }}>
                    {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : username.charAt(0).toUpperCase()}
                  </div>
                  <label className={`cursor-pointer text-white px-4 py-2 rounded-xl ${isUploadingAvatar ? 'opacity-50' : ''}`} style={{ backgroundColor: isLight ? '#333' : darkenColor(chatColor, 0.6) }}>
                    {isUploadingAvatar ? 'Загрузка...' : 'Изменить'}
                    <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                  </label>
                </div>
              </div>

              <div className="mb-6">
                <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Цветовая тема</p>
                <div className="flex flex-wrap gap-2">
                  {['#ffffff', '#1c1515', '#1a1a2e', '#16213e', '#0f3460', '#4a2c2c', '#2d4a2c', '#4a2c4a', '#2c4a4a', '#3d1f1f', '#1f3d1f', '#1f1f3d', '#3d3d1f'].map((color) => (
                    <button
                      key={color}
                      onClick={() => { setChatColor(color); localStorage.setItem('chatColor', color); }}
                      className={`w-10 h-10 rounded-full border-2 ${chatColor === color ? (isLight ? 'border-gray-800' : 'border-white') : 'border-transparent'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <button onClick={() => setIsSettingsOpen(false)} className={`w-full py-2 rounded-xl ${isLight ? 'bg-gray-800 text-white' : 'text-white'}`}>
                Закрыть
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Мобильный вид: открытый чат
  if (isMobile && currentChatId) {
    return (
      <div className="h-dvh flex flex-col" style={{ backgroundColor: chatColor }} onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
        <header className="p-4 flex items-center gap-3 flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
          <button onClick={goBackToChats} className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>←</button>
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
            {currentChatAvatar ? (
              <img src={currentChatAvatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: getAvatarColor(currentChatUser) }}>
                {currentChatUser.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <span className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>{currentChatUser}</span>
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => startCall('audio')} className={`p-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>📞</button>
            <button onClick={() => startCall('video')} className={`p-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>📹</button>
          </div>
        </header>

        {isCalling && (
          <div className="p-3 flex items-center justify-between bg-green-600 text-white">
            <span>📞 Звоним {currentChatUser}...</span>
            <button onClick={cancelCall} className="bg-red-600 px-3 py-1 rounded-lg">Отмена</button>
          </div>
        )}

        {incomingCall && (
          <div className="p-3 flex items-center justify-between bg-blue-600 text-white">
            <span>{incomingCall.type === 'video' ? '📹' : '📞'} {incomingCall.caller} звонит...</span>
            <div className="flex gap-2">
              <button onClick={acceptCall} className="bg-green-600 px-3 py-1 rounded-lg">Ответить</button>
              <button onClick={declineCall} className="bg-red-600 px-3 py-1 rounded-lg">Отклонить</button>
            </div>
          </div>
        )}

        {isCallActive && (
          <div className="p-3 flex items-center justify-between bg-green-600 text-white">
            <span>{callType === 'video' ? '📹' : '📞'} Звонок активен</span>
            <span className="font-mono">{formatCallTimer(callTimer)}</span>
            <button onClick={endCall} className="bg-red-600 px-3 py-1 rounded-lg">Завершить</button>
          </div>
        )}

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
          {chatMessages.length === 0 && (
            <div className={`text-center mt-20 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Сообщений пока нет</div>
          )}
          {chatMessages.map((msg: any) => {
            const isMyMessage = msg.username === username;
            return (
              <div key={msg.id} className={`flex items-start gap-2 mb-3 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                <div
                  className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${isMyMessage ? (isLight ? 'bg-gray-800 text-white' : 'text-white') : (isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-gray-200')}`}
                  style={isMyMessage && !isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}
                  onClick={(e) => showDeleteButton(e, msg.id, isMyMessage)}
                >
                  {msg.type === 'image' && <img src={msg.text} alt="Фото" className="max-w-[250px] rounded-xl" />}
                  {msg.type === 'voice' && <audio controls src={msg.text} className="max-w-[250px] h-10" />}
                  {(!msg.type || msg.type === 'text') && <span className="break-words text-sm">{msg.text}</span>}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        <form onSubmit={sendMessage} className="p-4 flex gap-2 items-center flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите сообщение..."
            className={`flex-1 p-2 rounded-xl ${isLight ? 'bg-gray-200 text-black placeholder-gray-500' : 'bg-white/10 text-white placeholder-gray-500'}`}
          />
          <button type="submit" disabled={isSending} className={`px-4 py-2 rounded-xl transition shrink-0 ${isLight ? 'bg-gray-800 text-white' : 'text-white'}`} style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}>
            {isSending ? '...' : 'Отправить'}
          </button>
        </form>

        {deleteButton && (
          <div className="fixed z-50" style={{ top: deleteButton.y - 20, left: deleteButton.x }}>
            <button onClick={() => deleteMessage(deleteButton.messageId)} className="bg-red-600 text-white p-2 rounded-full shadow-lg">
              🗑
            </button>
          </div>
        )}
      </div>
    );
  }

  // Десктопный вид
  return (
    <div className="h-dvh flex overflow-hidden" style={{ backgroundColor: chatColor }}>
      <div className="flex flex-col flex-shrink-0 w-1/4 min-w-[280px] max-w-[400px]" style={{ backgroundColor: isLight ? '#f0f0f0' : darkenColor(chatColor, 0.9) }}>
        {!isSearchOpen ? (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>⚙️</button>
              <div>
                <span className={`font-bold text-lg ${isLight ? 'text-black' : 'text-white'}`}>Чаты</span>
                <span className={`text-xs ml-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>({username})</span>
              </div>
            </div>
            <button onClick={() => setIsSearchOpen(true)} className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>🔍</button>
          </div>
        ) : (
          <div className="p-4 flex items-center gap-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Поиск по нику..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); searchUsers(e.target.value); }}
              className={`flex-1 p-2 rounded-xl text-sm ${isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-white'}`}
            />
            <button onClick={closeSearch} className={isLight ? 'text-gray-600' : 'text-gray-400'}>✕</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          {!isSearchOpen ? (
            <>
              {chats.map((chat) => {
                const otherUser = chat.user1 === username ? chat.user2 : chat.user1;
                return (
                  <button
                    key={chat.id}
                    onClick={() => selectChat(chat.id, otherUser)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${currentChatId === chat.id ? (isLight ? 'bg-gray-300' : 'bg-white/10') : (isLight ? 'hover:bg-gray-200' : 'hover:bg-white/5')}`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                      {chat.otherUserAvatar ? (
                        <img src={chat.otherUserAvatar} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getAvatarColor(otherUser) }}>
                          {otherUser.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <span className={`font-medium text-sm block ${isLight ? 'text-black' : 'text-white'}`}>{otherUser}</span>
                      {chat.lastMessage && (
                        <span className={`text-xs block truncate max-w-[200px] ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                          {chat.username === username ? 'Вы: ' : ''}{chat.lastMessage}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </>
          ) : (
            <>
              {searchResults.map((user) => (
                <button
                  key={user.username}
                  onClick={() => createChat(user.username)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl transition text-left ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}
                >
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold text-sm">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <span className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>{user.username}</span>
                </button>
              ))}
            </>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col" style={{ backgroundColor: chatColor }}>
        {currentChatId ? (
          <>
            <header className="p-4 flex items-center gap-3 flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                {currentChatAvatar ? (
                  <img src={currentChatAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: getAvatarColor(currentChatUser) }}>
                    {currentChatUser.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className={`font-medium ${isLight ? 'text-black' : 'text-white'}`}>{currentChatUser}</span>
              <div className="ml-auto flex items-center gap-2">
                <button onClick={() => startCall('audio')} className={`p-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>📞</button>
                <button onClick={() => startCall('video')} className={`p-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>📹</button>
              </div>
            </header>

            {isCalling && (
              <div className="p-3 flex items-center justify-between bg-green-600 text-white">
                <span>📞 Звоним {currentChatUser}...</span>
                <button onClick={cancelCall} className="bg-red-600 px-3 py-1 rounded-lg">Отмена</button>
              </div>
            )}

            {incomingCall && (
              <div className="p-3 flex items-center justify-between bg-blue-600 text-white">
                <span>{incomingCall.type === 'video' ? '📹' : '📞'} {incomingCall.caller} звонит...</span>
                <div className="flex gap-2">
                  <button onClick={acceptCall} className="bg-green-600 px-3 py-1 rounded-lg">Ответить</button>
                  <button onClick={declineCall} className="bg-red-600 px-3 py-1 rounded-lg">Отклонить</button>
                </div>
              </div>
            )}

            {isCallActive && (
              <div className="p-3 flex items-center justify-between bg-green-600 text-white">
                <span>{callType === 'video' ? '📹' : '📞'} Звонок активен</span>
                <span className="font-mono">{formatCallTimer(callTimer)}</span>
                <button onClick={endCall} className="bg-red-600 px-3 py-1 rounded-lg">Завершить</button>
              </div>
            )}

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
              {chatMessages.map((msg: any) => {
                const isMyMessage = msg.username === username;
                return (
                  <div key={msg.id} className={`flex items-start gap-2 mb-3 ${isMyMessage ? 'flex-row-reverse' : ''}`}>
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${isMyMessage ? (isLight ? 'bg-gray-800 text-white' : 'text-white') : (isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-gray-200')}`}
                      style={isMyMessage && !isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}
                      onClick={(e) => showDeleteButton(e, msg.id, isMyMessage)}
                    >
                      {msg.type === 'image' && <img src={msg.text} alt="Фото" className="max-w-[250px] rounded-xl" />}
                      {msg.type === 'voice' && <audio controls src={msg.text} className="max-w-[250px] h-10" />}
                      {(!msg.type || msg.type === 'text') && <span className="break-words text-sm">{msg.text}</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 flex gap-2 items-center flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Введите сообщение..."
                className={`flex-1 p-2 rounded-xl ${isLight ? 'bg-gray-200 text-black placeholder-gray-500' : 'bg-white/10 text-white placeholder-gray-500'}`}
              />
              <button type="submit" disabled={isSending} className={`px-4 py-2 rounded-xl transition shrink-0 ${isLight ? 'bg-gray-800 text-white' : 'text-white'}`} style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}>
                {isSending ? '...' : 'Отправить'}
              </button>
            </form>

            {deleteButton && (
              <div className="fixed z-50" style={{ top: deleteButton.y - 20, left: deleteButton.x }}>
                <button onClick={() => deleteMessage(deleteButton.messageId)} className="bg-red-600 text-white p-2 rounded-full shadow-lg">
                  🗑
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className={`text-lg ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Выберите чат</span>
          </div>
        )}
      </div>

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 ${isLight ? 'bg-white border-gray-300' : 'border-white/10'}`} style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.9) } : {}}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>Настройки</h2>
              <button onClick={() => setIsSettingsOpen(false)} className={isLight ? 'text-gray-600' : 'text-gray-400'}>✕</button>
            </div>

            <div className="mb-6 text-center">
              <p className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Вы вошли как</p>
              <p className={`text-xl font-bold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>{username}</p>
              <button onClick={handleLogout} className="px-6 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700">
                Выйти из аккаунта
              </button>
            </div>

            <div className="mb-6">
              <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Аватарка</p>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: isLight ? '#333' : darkenColor(chatColor, 0.6) }}>
                  {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : username.charAt(0).toUpperCase()}
                </div>
                <label className={`cursor-pointer text-white px-4 py-2 rounded-xl ${isUploadingAvatar ? 'opacity-50' : ''}`} style={{ backgroundColor: isLight ? '#333' : darkenColor(chatColor, 0.6) }}>
                  {isUploadingAvatar ? 'Загрузка...' : 'Изменить'}
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={isUploadingAvatar} />
                </label>
              </div>
            </div>

            <div className="mb-6">
              <p className={`text-sm mb-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Цветовая тема</p>
              <div className="flex flex-wrap gap-2">
                {['#ffffff', '#1c1515', '#1a1a2e', '#16213e', '#0f3460', '#4a2c2c', '#2d4a2c', '#4a2c4a', '#2c4a4a', '#3d1f1f', '#1f3d1f', '#1f1f3d', '#3d3d1f'].map((color) => (
                  <button
                    key={color}
                    onClick={() => { setChatColor(color); localStorage.setItem('chatColor', color); }}
                    className={`w-10 h-10 rounded-full border-2 ${chatColor === color ? (isLight ? 'border-gray-800' : 'border-white') : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button onClick={() => setIsSettingsOpen(false)} className={`w-full py-2 rounded-xl ${isLight ? 'bg-gray-800 text-white' : 'text-white'}`}>
              Закрыть
            </button>
          </div>
        </div>
      )}
    </div>
  );
}