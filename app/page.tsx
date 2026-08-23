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
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
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
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [deleteButton, setDeleteButton] = useState<{ messageId: number; x: number; y: number } | null>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [callTimer, setCallTimer] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username') || '';
    const savedColor = localStorage.getItem('chatColor') || '#ffffff';
    setUsername(savedUsername);
    setChatColor(savedColor);
    localStorage.removeItem('currentChatId');
    localStorage.removeItem('currentChatUser');
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
        localStorage.setItem('currentChatId', String(chatId));
        localStorage.setItem('currentChatUser', otherUser);
        await loadChatMessages(chatId);
      }
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  const selectChat = (chatId: number, otherUser: string) => {
    setCurrentChatId(chatId);
    setCurrentChatUser(otherUser);
    localStorage.setItem('currentChatId', String(chatId));
    localStorage.setItem('currentChatUser', otherUser);
    loadChatMessages(chatId);
  };

  const goBackToChats = () => {
    setCurrentChatId(null);
    setCurrentChatUser('');
    setChatMessages([]);
    localStorage.removeItem('currentChatId');
    localStorage.removeItem('currentChatUser');
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
    } catch (error) {
      console.error('Ошибка отправки:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChatId) return;
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

  const deleteMessage = async (messageId: number) => {
    try {
      const res = await fetch('/api/messages/delete', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messageId, username }),
      });

      if (res.ok) {
        setChatMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        messageIds.current.delete(messageId);
        setDeleteButton(null);
      }
    } catch (error) {
      console.error('Ошибка удаления:', error);
    }
  };

  const showDeleteButton = (e: React.MouseEvent, messageId: number, isMyMessage: boolean) => {
    if (!isMyMessage) return;
    e.preventDefault();
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDeleteButton({
      messageId,
      x: rect.left - 40,
      y: rect.top + rect.height / 2,
    });
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoiceMessage(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Ошибка записи:', error);
      alert('Не удалось получить доступ к микрофону');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      audioChunksRef.current = [];
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  const uploadVoiceMessage = async (audioBlob: Blob) => {
    if (!currentChatId) return;
    setIsUploadingVoice(true);
    try {
      const formData = new FormData();
      formData.append('file', audioBlob, 'voice.webm');
      formData.append('username', username);
      const res = await fetch('/api/upload-voice', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: currentChatId,
            username,
            text: data.fileUrl,
            type: 'voice',
            duration: recordingTime,
            avatar_url: avatarUrl,
          }),
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки голосового:', error);
    } finally {
      setIsUploadingVoice(false);
      setRecordingTime(0);
    }
  };

  const formatRecordingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Звонки
  const startCall = async (type: 'audio' | 'video') => {
    if (!currentChatUser) return;
    setCallType(type);
    setIsCalling(true);
    
    try {
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caller: username,
          receiver: currentChatUser,
          type,
        }),
      });
    } catch (error) {
      console.error('Ошибка звонка:', error);
      setIsCalling(false);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;
    setCallType(incomingCall.type);
    setIsCalling(false);
    setIncomingCall(null);
    setIsCallActive(true);
    setCallTimer(0);
    
    callTimerRef.current = setInterval(() => {
      setCallTimer((prev) => prev + 1);
    }, 1000);
    
    if (incomingCall.type === 'video') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        setLocalStream(stream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Ошибка доступа к камере:', error);
      }
    }
  };

  const declineCall = () => {
    setIncomingCall(null);
    setIsCalling(false);
  };

  const endCall = () => {
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsCalling(false);
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

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  // Подписка на звонки
  useEffect(() => {
    if (!username) return;
    const subscription = supabase
      .channel('calls')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'calls' },
        (payload) => {
          const newCall = payload.new;
          if (newCall.receiver === username && newCall.status === 'pending') {
            setIncomingCall(newCall);
          }
        }
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [username]);

  useEffect(() => {
    if (!username) return;
    const subscription = supabase
      .channel('users-changes')
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

  useEffect(() => {
    if (!currentChatId) return;
    const subscription = supabase
      .channel('messages-delete')
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const deletedMsg = payload.old;
          if (deletedMsg.chat_id === currentChatId) {
            setChatMessages((prev) => prev.filter((msg) => msg.id !== deletedMsg.id));
            messageIds.current.delete(deletedMsg.id);
          }
        }
      )
      .subscribe();
    return () => {
      subscription.unsubscribe();
    };
  }, [currentChatId]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchEndX.current !== null) {
      const diff = touchStartX.current - touchEndX.current;
      if (diff < -50 && currentChatId && window.innerWidth < 768) {
        goBackToChats();
      }
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

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
    localStorage.removeItem('currentChatId');
    localStorage.removeItem('currentChatUser');
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

  return (
    <div 
      className="h-dvh flex overflow-hidden relative transition-colors duration-300"
      style={{ backgroundColor: chatColor }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Список чатов */}
      <div
        className={`${currentChatId && window.innerWidth < 768 ? 'hidden' : 'flex'} flex-col flex-shrink-0 md:w-1/4 md:min-w-[280px] md:max-w-[400px] md:flex`}
        style={{ backgroundColor: isLight ? '#f0f0f0' : darkenColor(chatColor, 0.9) }}
      >
        {!isSearchOpen ? (
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`}>⚙️</button>
              <div>
                <span className={`font-bold text-lg ${isLight ? 'text-black' : 'text-white'}`}>Чаты</span>
                <span className={`text-xs ml-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>({username})</span>
              </div>
            </div>
            <button onClick={() => setIsSearchOpen(true)} className={`transition p-1 text-xl ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`}>🔍</button>
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
              {isSearching && <div className={`text-center text-sm mt-10 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Поиск...</div>}
              {!isSearching && searchResults.length === 0 && search.trim() && (
                <div className={`text-center text-sm mt-10 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Никого не найдено</div>
              )}
              {!search.trim() && <div className={`text-center text-sm mt-10 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Введите ник для поиска</div>}
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

      {/* Область чата */}
      <div className={`flex-1 flex-col overflow-hidden ${currentChatId ? 'flex' : 'hidden md:flex'}`} style={{ backgroundColor: chatColor }}>
        {currentChatId ? (
          <>
            <header className="p-4 flex items-center gap-3 flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
              <button onClick={goBackToChats} className={`transition p-1 text-xl md:hidden ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>←</button>
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
                <button onClick={() => startCall('audio')} className={`p-2 rounded-full transition ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`} title="Аудиозвонок">📞</button>
                <button onClick={() => startCall('video')} className={`p-2 rounded-full transition ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`} title="Видеозвонок">📹</button>
              </div>
            </header>

            {/* Полоса дозвона */}
            {isCalling && (
              <div className="p-3 flex items-center justify-between bg-green-600 text-white">
                <span>📞 Звоним {currentChatUser}...</span>
                <button onClick={() => setIsCalling(false)} className="bg-red-600 px-3 py-1 rounded-lg">Отмена</button>
              </div>
            )}

            {/* Полоса входящего звонка */}
            {incomingCall && (
              <div className="p-3 flex items-center justify-between bg-blue-600 text-white">
                <span>{incomingCall.type === 'video' ? '📹' : '📞'} {incomingCall.caller} звонит...</span>
                <div className="flex gap-2">
                  <button onClick={acceptCall} className="bg-green-600 px-3 py-1 rounded-lg">Ответить</button>
                  <button onClick={declineCall} className="bg-red-600 px-3 py-1 rounded-lg">Отклонить</button>
                </div>
              </div>
            )}

            {/* Таймер звонка */}
            {isCallActive && (
              <div className="p-3 flex items-center justify-between bg-green-600 text-white">
                <span>{callType === 'video' ? '📹' : '📞'} Звонок активен</span>
                <span className="font-mono">{formatCallTimer(callTimer)}</span>
                <button onClick={endCall} className="bg-red-600 px-3 py-1 rounded-lg">Завершить</button>
              </div>
            )}

            <div ref={messagesContainerRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4">
              {chatMessages.length === 0 && (
                <div className={`text-center mt-20 ${isLight ? 'text-gray-600' : 'text-gray-500'}`}>Сообщений пока нет</div>
              )}
              {chatMessages.map((msg: any) => {
                const isMyMessage = msg.username === username;
                return (
                  <div
                    key={msg.id}
                    className={`slide-up flex items-start gap-2 mb-3 ${isMyMessage ? 'flex-row-reverse' : ''}`}
                  >
                    <div
                      className={`inline-block px-4 py-2 rounded-2xl max-w-[80%] ${isMyMessage ? (isLight ? 'bg-gray-800 text-white' : 'text-white') : (isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-gray-200')}`}
                      style={isMyMessage && !isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}
                      onClick={(e) => showDeleteButton(e, msg.id, isMyMessage)}
                    >
                      {msg.type === 'image' && <img src={msg.text} alt="Фото" className="max-w-[250px] rounded-xl" />}
                      {msg.type === 'video' && <video src={msg.text} controls className="max-w-[250px] rounded-xl" />}
                      {msg.type === 'file' && <a href={msg.text} target="_blank" className="underline">📎 {msg.fileName || 'Файл'}</a>}
                      {msg.type === 'voice' && (
                        <div className="flex items-center gap-2">
                          <audio controls src={msg.text} className="max-w-[250px] h-10" />
                          {msg.duration && <span className="text-xs opacity-70">{msg.duration}с</span>}
                        </div>
                      )}
                      {(!msg.type || msg.type === 'text') && <span className="break-words text-sm">{msg.text}</span>}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            <form onSubmit={sendMessage} className="p-4 flex gap-2 items-center flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
              <label className={`cursor-pointer transition shrink-0 ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <input type="file" className="hidden" onChange={handleFileUpload} accept="image/*,video/*" capture="environment" />
              </label>

              {!isRecording ? (
                <button type="button" onClick={startRecording} className={`cursor-pointer transition shrink-0 ${isLight ? 'text-gray-600' : 'text-gray-400'} hover:opacity-70`} title="Голосовое сообщение">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <span className={`text-sm font-mono ${isLight ? 'text-black' : 'text-white'}`}>{formatRecordingTime(recordingTime)}</span>
                  <button type="button" onClick={cancelRecording} className="text-red-500">✕</button>
                  <button type="button" onClick={stopRecording} className="text-green-500">➤</button>
                </div>
              )}

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isRecording ? 'Запись...' : 'Введите сообщение...'}
                className={`flex-1 p-2 rounded-xl ${isLight ? 'bg-gray-200 text-black placeholder-gray-500' : 'bg-white/10 text-white placeholder-gray-500'}`}
                disabled={isRecording || isUploadingVoice}
              />
              
              {!isRecording ? (
                <button type="submit" disabled={isSending} className={`px-4 py-2 rounded-xl transition shrink-0 ${isLight ? 'bg-gray-800 text-white' : 'text-white'}`} style={!isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}>
                  {isSending ? '...' : 'Отправить'}
                </button>
              ) : null}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className={`text-lg ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>Выберите чат</span>
          </div>
        )}
      </div>

      {/* Кнопка удаления слева от сообщения */}
      {deleteButton && (
        <div
          className="fixed z-50"
          style={{ top: deleteButton.y - 20, left: deleteButton.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => deleteMessage(deleteButton.messageId)}
            className="bg-red-600 text-white p-2 rounded-full shadow-lg hover:bg-red-700 transition"
            title="Удалить сообщение"
          >
            🗑
          </button>
        </div>
      )}

      {/* Видео звонок */}
      {isCallActive && callType === 'video' && (
        <div className="fixed bottom-4 right-4 z-50 flex gap-2">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            className="w-32 h-40 bg-gray-800 rounded-xl object-cover"
          />
          <video
            ref={remoteVideoRef}
            autoPlay
            className="w-32 h-40 bg-gray-800 rounded-xl object-cover"
          />
        </div>
      )}

      {/* Настройки */}
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