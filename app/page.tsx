'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Peer from 'peerjs';

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
        </div>
        <div className="mb-4">
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`w-full p-2 rounded-xl border ${isLight ? 'bg-gray-100 text-black border-gray-300' : 'bg-white/10 text-white border-white/20'}`}
          />
        </div>
        <button type="submit" className={`w-full p-2 rounded-xl ${isLight ? 'bg-gray-800 text-white' : 'bg-white/20 text-white'}`}>
          {isLogin ? 'Войти' : 'Зарегистрироваться'}
        </button>
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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [deleteButton, setDeleteButton] = useState<{ messageId: number; x: number; y: number } | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isUploadingVoice, setIsUploadingVoice] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  // Звонки
  const [peer, setPeer] = useState<any>(null);
  const [currentCall, setCurrentCall] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<any>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [callTimer, setCallTimer] = useState(0);
  const [isCalling, setIsCalling] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [peerId, setPeerId] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageIds = useRef<Set<number>>(new Set());
  const touchStartX = useRef<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const savedUsername = localStorage.getItem('chat_username') || '';
    const savedColor = localStorage.getItem('chatColor') || '#ffffff';
    setUsername(savedUsername);
    setChatColor(savedColor);
    setIsMobile(window.innerWidth < 768);
    loadChats();
    loadAvatar();

    // Инициализация PeerJS с фиксированным ID на основе username
    const peerId = `chat-${savedUsername}`;
    const newPeer = new Peer(peerId, {
      host: '0.peerjs.com',
      port: 443,
      secure: true,
    });

    newPeer.on('open', (id: string) => {
      setPeer(newPeer);
      setPeerId(id);
      console.log('Peer открыт, ID:', id);
      // Обновляем peer_id в базе
      fetch('/api/update-peer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: savedUsername, peerId: id }),
      }).catch((err: any) => console.error('Ошибка обновления peer_id:', err));
    });

    newPeer.on('call', async (call: any) => {
      console.log('Входящий звонок от:', call.peer);
      setIncomingCall({
        caller: call.peer.replace('chat-', ''),
        call: call
      });
    });

    newPeer.on('error', (err: any) => {
      console.error('PeerJS ошибка:', err);
      if (err.type === 'unavailable-id') {
        // Если ID занят, пробуем с суффиксом
        const newId = `chat-${savedUsername}-${Date.now()}`;
        const newPeer2 = new Peer(newId, {
          host: '0.peerjs.com',
          port: 443,
          secure: true,
        });
        newPeer2.on('open', (id: string) => {
          setPeer(newPeer2);
          setPeerId(id);
          fetch('/api/update-peer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: savedUsername, peerId: id }),
          }).catch((err: any) => console.error('Ошибка обновления peer_id:', err));
        });
      }
    });

    // Подписка на звонки через Supabase
    const channel = supabase
      .channel('calls-' + savedUsername)
      .on('postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'calls',
          filter: `receiver=eq.${savedUsername}`
        },
        (payload: any) => {
          console.log('Новый звонок в БД:', payload.new);
        }
      )
      .subscribe();

    return () => {
      newPeer.destroy();
      supabase.removeChannel(channel);
    };
  }, []);

  // Подписка на новые сообщения
  useEffect(() => {
    if (!currentChatId) return;
    const channel = supabase
      .channel('messages-' + currentChatId)
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload: any) => {
          const newMsg = payload.new;
          if (newMsg.chat_id === currentChatId && !messageIds.current.has(newMsg.id)) {
            messageIds.current.add(newMsg.id);
            setChatMessages((prev) => [...prev, newMsg]);
            setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentChatId]);

  // Подписка на удаление
  useEffect(() => {
    if (!currentChatId) return;
    const channel = supabase
      .channel('msg-del-' + currentChatId)
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload: any) => {
          const deletedMsg = payload.old;
          if (deletedMsg.chat_id === currentChatId) {
            setChatMessages((prev) => prev.filter((msg) => msg.id !== deletedMsg.id));
            messageIds.current.delete(deletedMsg.id);
          }
        }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [currentChatId]);

  useEffect(() => {
    if (username) {
      loadAvatar();
      loadChats();
    }
  }, [username]);

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
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const existingChatUsers = chats.map((c: any) => c.otherUser);
        const filtered = data.filter((u: any) => u.username !== username && !existingChatUsers.includes(u.username));
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
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
        setCurrentChatId(data.chatId);
        setCurrentChatUser(otherUser);
        await loadChatMessages(data.chatId);
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
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
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
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setDeleteButton({
      messageId,
      x: rect.left - 40,
      y: rect.top + rect.height / 2,
    });
  };

  // ГОЛОСОВЫЕ СООБЩЕНИЯ
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoice(audioBlob);
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
      alert('Нужен доступ к микрофону!');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    }
  };

  const uploadVoice = async (audioBlob: Blob) => {
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

  // ЗВОНКИ
  const getPeerIdForUser = async (targetUsername: string): Promise<string | null> => {
    try {
      const res = await fetch(`/api/get-peer?username=${targetUsername}`);
      if (res.ok) {
        const data = await res.json();
        return data.peerId;
      }
      return null;
    } catch (error) {
      console.error('Ошибка получения peer_id:', error);
      return null;
    }
  };

  const startCall = async () => {
    if (!currentChatUser || !peer) {
      alert('Выберите чат');
      return;
    }

    try {
      // Получаем peer_id собеседника
      const targetPeerId = await getPeerIdForUser(currentChatUser);
      if (!targetPeerId) {
        alert('Пользователь не в сети');
        return;
      }

      console.log('Звонок на:', targetPeerId);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      setIsCalling(true);

      const call = peer.call(targetPeerId, stream);
      setCurrentCall(call);

      call.on('stream', (remoteStream: MediaStream) => {
        console.log('Получен стрим от собеседника');
        setRemoteStream(remoteStream);
        setIsCalling(false);
        setIsCallActive(true);
        setCallTimer(0);

        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
          audioRef.current.play().catch((err: any) => console.error('Ошибка воспроизведения:', err));
        }

        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
        }
        callTimerRef.current = setInterval(() => {
          setCallTimer((prev) => prev + 1);
        }, 1000);
      });

      call.on('close', () => {
        console.log('Звонок закрыт');
        endCall();
      });

      call.on('error', (err: any) => {
        console.error('Ошибка звонка:', err);
        endCall();
      });

      // Отправляем сигнал через Supabase
      await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caller: username,
          receiver: currentChatUser,
          type: 'audio',
        }),
      });
    } catch (error) {
      console.error('Ошибка звонка:', error);
      alert('Не удалось начать звонок. Нужен доступ к микрофону.');
      setIsCalling(false);
    }
  };

  const acceptCall = async () => {
    if (!incomingCall) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setLocalStream(stream);
      
      const call = incomingCall.call;
      call.answer(stream);
      setCurrentCall(call);
      setIncomingCall(null);
      setIsCallActive(true);
      setCallTimer(0);

      call.on('stream', (remoteStream: MediaStream) => {
        console.log('Получен стрим от собеседника');
        setRemoteStream(remoteStream);
        setIsCallActive(true);
        setCallTimer(0);

        if (audioRef.current) {
          audioRef.current.srcObject = remoteStream;
          audioRef.current.play().catch((err: any) => console.error('Ошибка воспроизведения:', err));
        }

        if (callTimerRef.current) {
          clearInterval(callTimerRef.current);
        }
        callTimerRef.current = setInterval(() => {
          setCallTimer((prev) => prev + 1);
        }, 1000);
      });

      call.on('close', () => {
        console.log('Звонок закрыт');
        endCall();
      });
    } catch (error) {
      console.error('Ошибка принятия звонка:', error);
      alert('Не удалось принять звонок. Нужен доступ к микрофону.');
    }
  };

  const rejectCall = () => {
    if (incomingCall && incomingCall.call) {
      incomingCall.call.close();
    }
    setIncomingCall(null);
  };

  const endCall = () => {
    if (currentCall) {
      try {
        currentCall.close();
      } catch (e) {}
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    setCurrentCall(null);
    setLocalStream(null);
    setRemoteStream(null);
    setIsCallActive(false);
    setIsCalling(false);
    setCallTimer(0);
    if (callTimerRef.current) {
      clearInterval(callTimerRef.current);
      callTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.srcObject = null;
      audioRef.current.pause();
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
    const currentChat = chats.find((chat: any) => 
      (chat.user1 === username && chat.user2 === currentChatUser) ||
      (chat.user2 === username && chat.user1 === currentChatUser)
    );
    return currentChat?.otherUserAvatar || null;
  };

  const currentChatAvatar = getCurrentChatAvatar();

  return (
    <div className="h-dvh flex overflow-hidden" style={{ backgroundColor: chatColor }}>
      {/* Список чатов */}
      <div 
        className={`${isMobile && currentChatId ? 'hidden' : 'flex'} flex-col flex-shrink-0 ${isMobile ? 'w-full' : 'w-80'}`}
        style={{ backgroundColor: isLight ? '#f0f0f0' : darkenColor(chatColor, 0.9) }}
      >
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSettingsOpen(!isSettingsOpen)} className={isLight ? 'text-gray-600' : 'text-gray-400'}>⚙️</button>
            <span className={`font-bold ${isLight ? 'text-black' : 'text-white'}`}>Чаты ({username})</span>
          </div>
          <button onClick={() => setIsSearchOpen(!isSearchOpen)} className={isLight ? 'text-gray-600' : 'text-gray-400'}>🔍</button>
        </div>

        {isSearchOpen && (
          <div className="px-4 pb-2">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Поиск..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); searchUsers(e.target.value); }}
              className={`w-full p-2 rounded-xl text-sm ${isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-white'}`}
            />
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-2">
          {!isSearchOpen ? (
            chats.map((chat: any) => {
              const otherUser = chat.user1 === username ? chat.user2 : chat.user1;
              return (
                <button
                  key={chat.id}
                  onClick={() => selectChat(chat.id, otherUser)}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl ${currentChatId === chat.id ? (isLight ? 'bg-gray-300' : 'bg-white/10') : (isLight ? 'hover:bg-gray-200' : 'hover:bg-white/5')}`}
                >
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    {chat.otherUserAvatar ? (
                      <img src={chat.otherUserAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold" style={{ backgroundColor: getAvatarColor(otherUser) }}>
                        {otherUser.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 text-left">
                    <span className={`font-medium text-sm ${isLight ? 'text-black' : 'text-white'}`}>{otherUser}</span>
                    {chat.lastMessage && (
                      <span className={`text-xs block truncate ${isLight ? 'text-gray-700' : 'text-gray-400'}`}>
                        {chat.username === username ? 'Вы: ' : ''}{chat.lastMessage}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            searchResults.map((user: any) => (
              <button
                key={user.username}
                onClick={() => createChat(user.username)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl ${isLight ? 'hover:bg-gray-100' : 'hover:bg-white/5'}`}
              >
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <span className={`text-sm ${isLight ? 'text-black' : 'text-white'}`}>{user.username}</span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Область чата */}
      <div className={`flex-1 flex-col ${currentChatId ? 'flex' : isMobile ? 'hidden' : 'flex'}`} style={{ backgroundColor: chatColor }}>
        {currentChatId ? (
          <>
            <div className="p-3 flex items-center gap-2 flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
              {isMobile && <button onClick={goBackToChats} className={isLight ? 'text-gray-600' : 'text-gray-400'}>←</button>}
              <div className="w-9 h-9 rounded-full overflow-hidden flex-shrink-0">
                {currentChatAvatar ? (
                  <img src={currentChatAvatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: getAvatarColor(currentChatUser) }}>
                    {currentChatUser.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <span className={`font-medium text-sm truncate ${isLight ? 'text-black' : 'text-white'}`}>{currentChatUser}</span>
              {!isCallActive && !isCalling && !incomingCall && (
                <button onClick={startCall} className={`ml-auto p-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} title="Позвонить">📞</button>
              )}
              {isCallActive && (
                <button onClick={endCall} className={`ml-auto p-2 text-red-500`} title="Завершить звонок">🔴</button>
              )}
            </div>

            {/* Полоса звонка */}
            {isCalling && (
              <div className="p-2 bg-green-600 text-white text-center text-sm">
                Звоним... <button onClick={endCall} className="underline">Отмена</button>
              </div>
            )}

            {incomingCall && (
              <div className="p-2 bg-blue-600 text-white flex items-center justify-between text-sm">
                <span>Входящий звонок от {incomingCall.caller.replace('chat-', '')}...</span>
                <div className="flex gap-2">
                  <button onClick={acceptCall} className="bg-green-600 px-3 py-0.5 rounded">Ответить</button>
                  <button onClick={rejectCall} className="bg-red-600 px-3 py-0.5 rounded">Отклонить</button>
                </div>
              </div>
            )}

            {isCallActive && (
              <div className="p-2 bg-green-600 text-white flex items-center justify-between text-sm">
                <span>📞 {formatTime(callTimer)}</span>
                <button onClick={endCall} className="bg-red-600 px-3 py-0.5 rounded">Завершить</button>
              </div>
            )}

            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
              {chatMessages.map((msg: any) => {
                const isMyMessage = msg.username === username;
                return (
                  <div key={msg.id} className={`flex mb-2 ${isMyMessage ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`inline-block px-3 py-2 rounded-2xl max-w-[75%] ${isMyMessage ? (isLight ? 'bg-gray-800 text-white' : 'text-white') : (isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-gray-200')}`}
                      style={isMyMessage && !isLight ? { backgroundColor: darkenColor(chatColor, 0.6) } : {}}
                      onClick={(e) => showDeleteButton(e, msg.id, isMyMessage)}
                    >
                      {msg.type === 'image' && <img src={msg.text} alt="Фото" className="max-w-[200px] rounded-xl" />}
                      {msg.type === 'video' && <video src={msg.text} controls className="max-w-[200px] rounded-xl" />}
                      {msg.type === 'file' && <a href={msg.text} target="_blank" className="underline">📎 {msg.fileName || 'Файл'}</a>}
                      {msg.type === 'voice' && (
                        <div className="flex items-center gap-2">
                          <audio controls src={msg.text} className="max-w-[200px] h-8" />
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

            <form onSubmit={sendMessage} className="p-2 flex gap-1 items-center flex-shrink-0" style={{ backgroundColor: isLight ? '#e0e0e0' : darkenColor(chatColor, 0.85) }}>
              <label className={`p-2 cursor-pointer ${isLight ? 'text-gray-600' : 'text-gray-400'}`} title="Фото">
                📎
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,video/*"
                  capture="environment"
                />
              </label>

              {!isRecording ? (
                <button type="button" onClick={startRecording} className={`p-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`} title="Голосовое">
                  🎤
                </button>
              ) : (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-red-500">{formatTime(recordingTime)}</span>
                  <button type="button" onClick={stopRecording} className="p-2 text-green-500">➤</button>
                </div>
              )}

              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder={isRecording ? 'Запись...' : 'Сообщение...'}
                className={`flex-1 p-2 rounded-xl text-sm ${isLight ? 'bg-gray-200 text-black' : 'bg-white/10 text-white'}`}
                disabled={isRecording || isUploadingVoice}
              />
              
              {!isRecording && (
                <button type="submit" disabled={isSending} className={`p-2 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}>
                  ➤
                </button>
              )}
            </form>

            {deleteButton && (
              <div className="fixed z-50" style={{ top: deleteButton.y - 20, left: deleteButton.x }}>
                <button onClick={() => deleteMessage(deleteButton.messageId)} className="bg-red-600 text-white p-2 rounded-full shadow-lg">🗑</button>
              </div>
            )}
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className={isLight ? 'text-gray-600' : 'text-gray-400'}>Выберите чат</span>
          </div>
        )}
      </div>

      {/* Аудио для звонков */}
      <audio ref={audioRef} autoPlay style={{ display: 'none' }} />

      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className={`rounded-2xl max-w-md w-full p-6 ${isLight ? 'bg-white' : 'bg-gray-900'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className={`text-xl font-bold ${isLight ? 'text-black' : 'text-white'}`}>Настройки</h2>
              <button onClick={() => setIsSettingsOpen(false)} className={isLight ? 'text-gray-600' : 'text-gray-400'}>✕</button>
            </div>

            <div className="mb-6 text-center">
              <p className={isLight ? 'text-gray-600' : 'text-gray-400'}>Вы вошли как</p>
              <p className={`text-xl font-bold mb-3 ${isLight ? 'text-black' : 'text-white'}`}>{username}</p>
              <button onClick={handleLogout} className="px-6 py-2 rounded-xl bg-red-600 text-white">Выйти</button>
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
                {['#ffffff', '#1c1515', '#1a1a2e', '#16213e', '#0f3460', '#4a2c2c', '#2d4a2c', '#4a2c4a', '#2c4a4a'].map((color) => (
                  <button
                    key={color}
                    onClick={() => { setChatColor(color); localStorage.setItem('chatColor', color); }}
                    className={`w-10 h-10 rounded-full border-2 ${chatColor === color ? 'border-white' : 'border-transparent'}`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}