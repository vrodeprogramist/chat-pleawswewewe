'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// ============================================================
// ИНТЕРФЕЙСЫ
// ============================================================
interface Message {
  id: number;
  chat_id: number;
  username: string;
  text: string;
  type?: 'text' | 'image' | 'video' | 'file' | 'voice';
  fileName?: string;
  duration?: number;
  avatar_url?: string | null;
  reactions?: Reaction[];
  created_at?: string;
  tempId?: string;
}

interface Reaction {
  id: number;
  message_id: number;
  username: string;
  reaction: string;
}

interface Chat {
  id: number;
  user1: string;
  user2: string;
  otherUser: string;
  otherUserAvatar?: string | null;
  lastMessage?: string;
  lastMessageTime?: number;
}

interface UserProfile {
  username: string;
  avatar_url?: string | null;
  bio?: string;
  created_at?: string;
}

// ============================================================
// КОМПОНЕНТ ПРИВИДЕНИЯ
// ============================================================
function GhostIcon({ className = "", size = "normal" }: { className?: string; size?: 'small' | 'normal' | 'large' }) {
  const sizes = { small: "w-12 h-14", normal: "w-20 h-24", large: "w-32 h-36" };
  const sizeClass = sizes[size as keyof typeof sizes] || sizes.normal;
  return (
    <svg className={`${sizeClass} ${className}`} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ghostGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="white" stopOpacity="0.6"/>
        </radialGradient>
        <filter id="ghostFilter">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="50" cy="50" rx="48" ry="53" fill="url(#ghostGlow)" className="animate-ghostPulse"/>
      <ellipse cx="50" cy="115" rx="38" ry="10" fill="currentColor" className="opacity-10 animate-ghostShadow"/>
      <g className="animate-ghostFloat">
        <path d="M20 40C20 18 30 10 50 10C70 10 80 18 80 40V80C80 90 70 95 60 90L55 85C50 90 45 90 40 85L35 90C25 95 20 90 20 80V40Z" fill="currentColor" filter="url(#ghostFilter)"/>
        <ellipse cx="35" cy="40" rx="11" ry="13" fill="url(#eyeGlow)" className="animate-ghostEyes" />
        <ellipse cx="65" cy="40" rx="11" ry="13" fill="url(#eyeGlow)" className="animate-ghostEyes" />
        <ellipse cx="37" cy="41" rx="5" ry="6" fill="#1a1a2e" className="animate-ghostPupils" />
        <ellipse cx="67" cy="41" rx="5" ry="6" fill="#1a1a2e" className="animate-ghostPupils" />
        <circle cx="39" cy="39" r="2" fill="white" opacity="0.9" className="animate-ghostSparkle" />
        <circle cx="69" cy="39" r="2" fill="white" opacity="0.9" className="animate-ghostSparkle" style={{ animationDelay: '0.15s' }} />
        <ellipse cx="24" cy="52" rx="9" ry="5" fill="#ff6b6b" opacity="0.12" className="animate-ghostBlush" />
        <ellipse cx="76" cy="52" rx="9" ry="5" fill="#ff6b6b" opacity="0.12" className="animate-ghostBlush" style={{ animationDelay: '0.2s' }} />
        <path d="M38 60C44 66 56 66 62 60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" className="animate-ghostSmile" />
      </g>
      <g className="animate-ghostWave">
        <path d="M25 85Q30 78 35 85Q40 92 45 85Q50 78 55 85Q60 92 65 85Q70 78 75 85" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7"/>
        <path d="M25 85Q30 78 35 85Q40 92 45 85Q50 78 55 85Q60 92 65 85Q70 78 75 85" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(0,4)"/>
        <path d="M25 85Q30 78 35 85Q40 92 45 85Q50 78 55 85Q60 92 65 85Q70 78 75 85" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.15" transform="translate(0,8)"/>
      </g>
      <circle cx="12" cy="20" r="2.5" fill="currentColor" opacity="0.4" className="animate-sparkle" />
      <circle cx="88" cy="25" r="2" fill="currentColor" opacity="0.4" className="animate-sparkle" style={{ animationDelay: '0.6s' }} />
      <circle cx="8" cy="58" r="2" fill="currentColor" opacity="0.3" className="animate-sparkle" style={{ animationDelay: '1.2s' }} />
      <circle cx="92" cy="65" r="2.5" fill="currentColor" opacity="0.4" className="animate-sparkle" style={{ animationDelay: '1.8s' }} />
      <circle cx="18" cy="72" r="1.5" fill="currentColor" opacity="0.2" className="animate-sparkle" style={{ animationDelay: '0.9s' }} />
      <circle cx="82" cy="78" r="1.5" fill="currentColor" opacity="0.2" className="animate-sparkle" style={{ animationDelay: '2.1s' }} />
      <ellipse cx="50" cy="82" rx="30" ry="12" fill="currentColor" opacity="0.04" className="animate-ghostVapor" />
      <ellipse cx="50" cy="86" rx="20" ry="8" fill="currentColor" opacity="0.06" className="animate-ghostVapor" style={{ animationDelay: '0.5s' }} />
    </svg>
  );
}

// ============================================================
// ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ (без изменений)
// ============================================================
function UserProfileModal({
  username: targetUsername,
  currentUsername,
  onClose,
  theme,
  avatarUrl: propAvatarUrl,
  userAvatar,
}: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwnProfile = targetUsername === currentUsername;
  const isLight = theme === 'light';

  const displayAvatarUrl = isOwnProfile
    ? propAvatarUrl
    : (userAvatar || profile?.avatar_url || null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!targetUsername) {
        setLoading(false);
        setError('Не указан пользователь');
        return;
      }
      try {
        const res = await fetch(`/api/profile?username=${encodeURIComponent(targetUsername)}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setError(null);
        } else {
          const errorData = await res.json();
          setError(errorData.error || 'Профиль не найден');
          setProfile(null);
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setError('Ошибка соединения');
        setProfile(null);
      }
      setLoading(false);
    };
    loadProfile();
  }, [targetUsername]);

  const getAvatarColor = (name: string) => {
    if (!name || name.length === 0) return '#6c5ce7';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Неизвестно';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className={`rounded-3xl p-8 ${isLight ? 'bg-white' : 'bg-[#1f1f1f]'}`}>
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
        <div className={`max-w-md w-full rounded-3xl p-6 ${isLight ? 'bg-white' : 'bg-[#1f1f1f]'}`}>
          <p className="text-center text-gray-500">{error || 'Профиль не найден'}</p>
          <button onClick={onClose} className="mt-4 w-full py-2 rounded-xl bg-[var(--accent)] text-white">Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className={`max-w-md w-full rounded-3xl p-6 ${isLight ? 'bg-white' : 'bg-[#1f1f1f]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {isOwnProfile ? '👤 Мой профиль' : '👤 Профиль'}
          </h2>
          <button onClick={onClose} className={`${isLight ? 'text-gray-500' : 'text-gray-400'} text-xl hover:scale-110 transition-transform`}>✕</button>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto" style={{ backgroundColor: displayAvatarUrl ? 'transparent' : getAvatarColor(profile.username) }}>
            {displayAvatarUrl ? (
              <img src={displayAvatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: getAvatarColor(profile.username) }}>
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <h3 className={`text-xl font-semibold mt-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {profile.username || 'Неизвестно'}
          </h3>
          <div className={`mt-2 flex items-center justify-center gap-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>📅</span>
            <span>Присоединился: {formatDate(profile.created_at)}</span>
          </div>
        </div>
        {!isOwnProfile && (
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:opacity-80 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            👻 Написать сообщение
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// МОДАЛЬНОЕ ОКНО С ПРАВИЛАМИ СООБЩЕСТВА
// ============================================================
function RulesModal({ onClose, theme }: { onClose: () => void; theme: string }) {
  const isLight = theme === 'light';
  const bgColor = isLight ? '#ffffff' : '#0a0a0a';
  const textPrimary = isLight ? '#000000' : '#ffffff';
  const textSecondary = isLight ? '#8e8e93' : '#8e8e93';
  const borderColor = isLight ? '#d1d1d6' : '#38383a';
  const cardBg = isLight ? '#f0f0f0' : '#1c1c1e';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="max-w-lg w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: bgColor, color: textPrimary }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📜 Правила сообщества</h2>
          <button onClick={onClose} className="text-2xl hover:scale-110 transition-transform">✕</button>
        </div>
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="font-semibold text-base">Добро пожаловать в Whisp! Мы ценим каждого участника и просим соблюдать простые правила:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Будьте вежливы</strong> – уважайте мнение других, избегайте оскорблений и грубости.</li>
            <li><strong>Запрещены:</strong> мат, ненормативная лексика, угрозы, разжигание ненависти, спам и флуд.</li>
            <li><strong>Контент:</strong> не публикуйте материалы, нарушающие законодательство РФ, а также порнографию, насилие или любые другие неподобающие изображения/видео.</li>
            <li><strong>Личные данные:</strong> не раскрывайте чужие личные данные без согласия (адреса, телефоны, паспортные данные).</li>
            <li><strong>Соблюдайте тематику</strong> – этот чат создан для общения на общие темы, но мы оставляем за собой право ограничивать обсуждение, если оно выходит за рамки приличия.</li>
            <li><strong>Администрация:</strong> мы оставляем за собой право блокировать пользователей за нарушение правил без предупреждения.</li>
          </ul>
          <p className="mt-4 text-center text-xs opacity-70" style={{ color: textSecondary }}>
            Нарушение правил может привести к временной или постоянной блокировке аккаунта.
            <br />Спасибо, что делаете наше сообщество лучше! 👻
          </p>
          <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: cardBg }}>
            <p className="text-center text-xs" style={{ color: textSecondary }}>
              ⚠️ Данный проект является учебным (школьным). Администрация не несёт ответственности за содержание сообщений,<br />
              но оставляет за собой право модерировать контент в соответствии с правилами.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-80 active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Принимаю и закрываю
        </button>
      </div>
    </div>
  );
}

// ============================================================
// НАСТРОЙКИ (без изменений)
// ============================================================
function SettingsModal({
  username,
  avatarUrl,
  setAvatarUrl,
  onClose,
  theme,
  setTheme,
  accentColor,
  setAccentColor,
  setIsAuth,
  openRules,
}: any) {
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgColor = isLight ? '#ffffff' : '#0a0a0a';
  const textPrimary = isLight ? '#000000' : '#ffffff';
  const textSecondary = isLight ? '#8e8e93' : '#8e8e93';
  const borderColor = isLight ? '#d1d1d6' : '#38383a';
  const cardBg = isLight ? '#f0f0f0' : '#1c1c1e';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profile?username=${username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };
    loadProfile();
  }, [username]);

  const formatDate = (date?: string) => {
    if (!date) return 'Неизвестно';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Неизвестно';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл > 5 МБ');
      return;
    }
    setIsUploading(true);
    const img = new Image();
    const reader = new FileReader();
    reader.onload = async (event) => {
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        ctx?.drawImage(img, x, y, size, size, 0, 0, 200, 200);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const formData = new FormData();
        const blob = await fetch(resizedDataUrl).then(r => r.blob());
        formData.append('file', blob, 'avatar.jpg');
        formData.append('username', username);
        try {
          const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            const newAvatarUrl = data.avatarUrl + '?t=' + Date.now();
            setAvatarUrl(newAvatarUrl);
            localStorage.setItem(`whisp_avatar_${username}`, newAvatarUrl);
            window.dispatchEvent(new Event('avatar-updated'));
          } else {
            const err = await res.json();
            alert(err.error || 'Ошибка загрузки');
          }
        } catch (error) {
          console.error('Ошибка:', error);
          alert('Ошибка загрузки');
        } finally {
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: bgColor }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          paddingTop: 'max(10px, env(safe-area-inset-top))',
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
          backgroundColor: bgColor,
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '6px',
            border: 'none',
            background: 'none',
            color: textPrimary,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ✕
        </button>
        <span style={{ fontWeight: 600, fontSize: '17px', color: textPrimary }}>Настройки</span>
        <div style={{ width: '40px' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {isUploading ? (
              <div className="w-full h-full flex items-center justify-center bg-black/50">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px', fontWeight: 600, color: 'white' }}>
                {username?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 500 }}>📷 Изменить</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: textPrimary }}>{username}</div>
          <div style={{ fontSize: '13px', color: textSecondary, marginTop: '2px' }}>👻 Whisp</div>
        </div>
        {profile?.created_at && (
          <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', color: textSecondary }}>
            📅 Присоединился: {formatDate(profile.created_at)}
          </div>
        )}
        <div style={{ backgroundColor: cardBg, borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '8px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: textPrimary, fontSize: '15px' }}>🌙 Тема</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setTheme('dark');
                    localStorage.setItem('whisp_theme', 'dark');
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme === 'dark' ? accentColor : 'transparent',
                    color: theme === 'dark' ? 'white' : textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Тёмная
                </button>
                <button
                  onClick={() => {
                    setTheme('light');
                    localStorage.setItem('whisp_theme', 'light');
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme === 'light' ? accentColor : 'transparent',
                    color: theme === 'light' ? 'white' : textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Светлая
                </button>
              </div>
            </div>
          </div>
          <div style={{ height: '1px', backgroundColor: borderColor, margin: '0 14px' }} />
          <div style={{ padding: '8px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: textPrimary, fontSize: '15px' }}>🎨 Акцент</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#7c3aed', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setAccentColor(c);
                      localStorage.setItem('whisp_accent', c);
                      document.documentElement.style.setProperty('--accent', c);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: accentColor === c ? `2px solid ${textPrimary}` : '1px solid transparent',
                      backgroundColor: c,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            openRules();
          }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: 'rgba(124,58,237,0.1)',
            color: accentColor,
            border: 'none',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.1)')}
        >
          📜 Правила сообщества
        </button>

        <button
          onClick={() => {
            if (confirm('Вы уверены?')) {
              localStorage.removeItem('whisp_username');
              setIsAuth(false);
              onClose();
            }
          }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,59,48,0.1)',
            color: '#ff3b30',
            border: 'none',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.1)')}
        >
          👻 Выйти из аккаунта
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: textSecondary, opacity: 0.5 }}>
          Whisp v1.0 · Школьный проект
        </div>
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: textSecondary, opacity: 0.4 }}>
          © 2026 Whisp. Все права защищены. Данный продукт разработан в образовательных целях.
          <br />Администрация не несёт ответственности за содержание сообщений пользователей.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ЗАГРУЗКА
// ============================================================
function LoadingScreen({ theme }: { theme: string }) {
  return (
    <div className={`h-dvh flex items-center justify-center flex-col gap-6 ${theme === 'dark' ? 'bg-[#1c1515]' : 'bg-white'}`}>
      <div className="relative">
        <GhostIcon className={`${theme === 'dark' ? 'text-white' : 'text-[var(--accent)]'}`} size="large" />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-[var(--accent)] rounded-full blur-md animate-pulse"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} animate-pulse`}>
          Загрузка...
        </p>
        <div className="flex gap-1">
          <span className={`w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce`} style={{ animationDelay: '0s' }}></span>
          <span className={`w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce`} style={{ animationDelay: '0.2s' }}></span>
          <span className={`w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce`} style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// АВТОРИЗАЦИЯ (С СОГЛАСИЕМ НА ПРАВИЛА)
// ============================================================
function AuthForm({
  username,
  setUsername,
  password,
  setPassword,
  isLogin,
  setIsLogin,
  setIsAuth,
  theme,
  accentColor,
  onOpenRules,
}: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    setAgreedToRules(false);
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreedToRules) {
      alert('Пожалуйста, примите правила сообщества');
      return;
    }
    setIsLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        localStorage.setItem('whisp_username', username);
        setIsAuth(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка');
      }
    } catch (error) {
      alert('Ошибка соединения');
    }
    setIsLoading(false);
  };

  return (
    <div className={`h-dvh flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-[#1c1515]' : 'bg-gray-50'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative w-24 h-28 mx-auto">
            <div className="absolute inset-0 -m-4 rounded-full border-2 border-[var(--accent)] animate-ping opacity-20"></div>
            <div className="absolute inset-0 -m-8 rounded-full border-2 border-[var(--accent)] animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-0 -m-12 rounded-full border-2 border-[var(--accent)] animate-ping opacity-5" style={{ animationDelay: '1s' }}></div>
            <div className="relative z-10">
              <GhostIcon className={`${isLight ? 'text-[var(--accent)]' : 'text-white'}`} size="large" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold mt-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <span className="relative inline-block">
              Whisp
              <span className="absolute -top-2 -right-7 text-lg">👻</span>
            </span>
          </h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            {isLogin ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input
              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full p-4 pl-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm transition-all duration-300 ${
                isLight
                  ? 'bg-white/80 text-gray-900 placeholder-gray-400 border-gray-200'
                  : 'bg-[#1f1f1f] text-white placeholder-gray-500 border-[#2f2f2f]'
              }`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300">
              👻
            </span>
          </div>
          <div className="relative group">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-4 pl-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm transition-all duration-300 ${
                isLight
                  ? 'bg-white/80 text-gray-900 placeholder-gray-400 border-gray-200'
                  : 'bg-[#1f1f1f] text-white placeholder-gray-500 border-[#2f2f2f]'
              }`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300">
              🔮
            </span>
          </div>

          {!isLogin && (
            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="rulesAgreement"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
              <label htmlFor="rulesAgreement" className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'} cursor-pointer`}>
                Я принимаю{' '}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenRules();
                  }}
                  style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  правила сообщества
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!isLogin && !agreedToRules)}
            className="w-full py-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:opacity-80 active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block mr-2">👻</span>
                Загрузка...
              </>
            ) : isLogin ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className={`text-sm text-center mt-6 cursor-pointer hover:underline transition-all duration-300 ${
            isLight ? 'text-gray-500 hover:text-[var(--accent)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="w-8 h-[2px] bg-[var(--accent)] opacity-30 rounded-full"></div>
          <p className={`text-xs ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>👻 Whisp</p>
          <div className="w-8 h-[2px] bg-[var(--accent)] opacity-30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ОСНОВНОЙ ЧАТ
// ============================================================
function ChatApp({ username, theme, setTheme, accentColor, setAccentColor }: any) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'chats' | 'chat'>('chats');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | string | null>(null);
  const [showReactionsId, setShowReactionsId] = useState<number | string | null>(null);
  const [animatingReactionId, setAnimatingReactionId] = useState<number | string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());
  const pendingMessagesRef = useRef<Set<string>>(new Set());
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [, forceUpdate] = useState({});

  // LONG PRESS ДЛЯ МОБИЛЬНЫХ (1000 мс)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const getAvatarColor = (name: string) => {
    if (!name || name.length === 0) return '#6c5ce7';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функция для удаления дублей сообщений
  const deduplicateMessages = (msgs: Message[]): Message[] => {
    const seen = new Map<number | string, Message>();
    const result: Message[] = [];
    for (const msg of msgs) {
      if (msg.id && typeof msg.id === 'number') {
        if (!seen.has(msg.id)) {
          seen.set(msg.id, msg);
          result.push(msg);
        }
      } else if (msg.tempId) {
        if (!seen.has(msg.tempId)) {
          seen.set(msg.tempId, msg);
          result.push(msg);
        }
      } else {
        result.push(msg);
      }
    }
    return result;
  };

  useEffect(() => {
    if (messages.length > 0) {
      const unique = deduplicateMessages(messages);
      if (unique.length !== messages.length) {
        setMessages(unique);
      }
    }
  }, [messages]);

  // ===================== ЗАГРУЗКА АВАТАРА (СВОЙ) =====================
  const loadAvatar = async () => {
    try {
      const cached = localStorage.getItem(`whisp_avatar_${username}`);
      if (cached) {
        if (!cached.includes('?t=')) {
          const newUrl = cached + '?t=' + Date.now();
          setAvatarUrl(newUrl);
          localStorage.setItem(`whisp_avatar_${username}`, newUrl);
        } else {
          setAvatarUrl(cached);
        }
        return;
      }
      const res = await fetch(`/api/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        const avatarUrl = data.avatarUrl || data.avatar_url;
        if (avatarUrl) {
          const newUrl = avatarUrl + '?t=' + Date.now();
          setAvatarUrl(newUrl);
          localStorage.setItem(`whisp_avatar_${username}`, newUrl);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
  };

  // ===================== ЗАГРУЗКА АВАТАРА ДРУГОГО ПОЛЬЗОВАТЕЛЯ =====================
  const fetchUserAvatar = async (user: string): Promise<string | null> => {
    if (user === username) {
      const cached = localStorage.getItem(`whisp_avatar_${username}`);
      if (cached) return cached;
    }
    try {
      const res = await fetch(`/api/profile?username=${encodeURIComponent(user)}&_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const avatarUrl = data.avatarUrl || data.avatar_url;
        if (avatarUrl) {
          const newUrl = avatarUrl + '?t=' + Date.now();
          if (user === username) {
            localStorage.setItem(`whisp_avatar_${username}`, newUrl);
          }
          return newUrl;
        }
      }
      return null;
    } catch (error) {
      console.error(`Ошибка загрузки аватара ${user}:`, error);
      return null;
    }
  };

  const updateChatAvatar = (user: string, avatar: string | null) => {
    setChats(prev =>
      prev.map(c =>
        c.otherUser === user ? { ...c, otherUserAvatar: avatar } : c
      )
    );
  };

  const ensureChatAvatar = async (user: string) => {
    if (!user) return;
    const existing = chats.find(c => c.otherUser === user);
    if (existing && existing.otherUserAvatar) return;
    const avatar = await fetchUserAvatar(user);
    if (avatar) {
      updateChatAvatar(user, avatar);
      forceUpdate({});
    }
  };

  // Загрузка списка чатов с аватарками собеседников
  const loadChats = async () => {
    try {
      const res = await fetch(`/api/chats?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        const chatsWithAvatars = await Promise.all(
          data.map(async (chat: Chat) => {
            const avatar = await fetchUserAvatar(chat.otherUser);
            return { ...chat, otherUserAvatar: avatar };
          })
        );
        setChats(chatsWithAvatars);
        forceUpdate({});
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    }
  };

  // Загрузка сообщений
  const loadMessages = async (chatId: number) => {
    try {
      const res = await fetch(`/api/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        const uniqueMessages = data.filter(
          (msg: Message, index: number, self: Message[]) =>
            index === self.findIndex((m) => m.id === msg.id)
        );
        setMessages(uniqueMessages);
        if (uniqueMessages.length > 0) {
          const ids = uniqueMessages.map((m: Message) => m.id);
          try {
            const reactionsRes = await fetch(`/api/reactions?messageIds=${ids.join(',')}`);
            if (reactionsRes.ok) {
              const reactionsData = await reactionsRes.json();
              setMessages((prev) =>
                prev.map((msg) => ({
                  ...msg,
                  reactions: reactionsData.filter((r: any) => r.message_id === msg.id),
                }))
              );
            }
          } catch (error) {
            console.error('Ошибка загрузки реакций:', error);
          }
        }
        if (currentChatUser) {
          await ensureChatAvatar(currentChatUser);
        }
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  // Обработчик выбора чата
  const handleChatSelect = async (chat: Chat) => {
    setCurrentChatId(chat.id);
    setCurrentChatUser(chat.otherUser);
    await ensureChatAvatar(chat.otherUser);
    await loadMessages(chat.id);
    if (isMobile) setMobileView('chat');
  };

  // Создание нового чата
  const createChat = async (otherUser: string) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1: username, user2: otherUser }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchOpen(false);
        await loadChats();
        const chatId = data.chatId;
        setCurrentChatId(chatId);
        setCurrentChatUser(otherUser);
        await ensureChatAvatar(otherUser);
        await loadMessages(chatId);
        if (isMobile) setMobileView('chat');
      }
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  // Поиск пользователей
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const existingUsers = chats.map((c) => c.otherUser);
        const filtered = data.filter(
          (u: any) => u.username !== username && !existingUsers.includes(u.username)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  };

  // Событие обновления аватара
  useEffect(() => {
    const handleAvatarUpdate = () => {
      loadAvatar();
      loadChats();
    };
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('avatar-updated', handleAvatarUpdate);
  }, []);

  // Инициализация
  useEffect(() => {
    loadChats();
    loadAvatar();
  }, []);

  // ===================== ПОДПИСКА НА ОБНОВЛЕНИЯ ПРОФИЛЕЙ (АВАТАРКИ В РЕАЛЬНОМ ВРЕМЕНИ) =====================
  useEffect(() => {
    const profilesChannel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        async (payload) => {
          const updatedProfile = payload.new as { username: string; avatar_url: string | null };
          const updatedUser = updatedProfile.username;
          
          const freshAvatar = await fetchUserAvatar(updatedUser);
          
          setChats(prev => 
            prev.map(chat => 
              chat.otherUser === updatedUser 
                ? { ...chat, otherUserAvatar: freshAvatar } 
                : chat
            )
          );
          
          if (updatedUser === username) {
            if (freshAvatar) {
              setAvatarUrl(freshAvatar);
              localStorage.setItem(`whisp_avatar_${username}`, freshAvatar);
            } else {
              setAvatarUrl(null);
            }
          }
          
          forceUpdate({});
        }
      )
      .subscribe();

    return () => {
      profilesChannel.unsubscribe();
    };
  }, [username]);

  // Отправка сообщения
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isSending || !currentChatId) return;
    setIsSending(true);
    const currentText = text;
    setText('');
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId as any,
      chat_id: currentChatId,
      username: username,
      text: currentText,
      type: 'text',
      avatar_url: avatarUrl,
      tempId: tempId,
      created_at: new Date().toISOString(),
      reactions: [],
    };
    setMessages((prev) => {
      const exists = prev.some(
        (m) => m.tempId === tempId || (m.text === currentText && m.username === username && !m.id)
      );
      if (exists) return prev;
      return [...prev, optimisticMessage];
    });
    pendingMessagesRef.current.add(tempId);
    setPendingMessages((prev) => new Set(prev).add(tempId));
    setTimeout(scrollToBottom, 50);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          username,
          text: currentText,
          type: 'text',
          avatar_url: avatarUrl,
          tempId: tempId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          const index = prev.findIndex((msg) => msg.tempId === tempId);
          if (index !== -1) {
            const updated = [...prev];
            const existingIdIndex = updated.findIndex((msg) => msg.id === data.id);
            if (existingIdIndex !== -1 && existingIdIndex !== index) {
              updated.splice(existingIdIndex, 1);
            }
            updated[index] = { ...updated[index], id: data.id, tempId: undefined };
            return updated;
          }
          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, { ...optimisticMessage, id: data.id, tempId: undefined }];
        });
        pendingMessagesRef.current.delete(tempId);
        setPendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
      } else {
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        pendingMessagesRef.current.delete(tempId);
        setPendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
        const data = await res.json();
        alert(data.error || 'Ошибка отправки');
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
      pendingMessagesRef.current.delete(tempId);
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    } finally {
      setIsSending(false);
    }
  };

  // ЗАГРУЗКА ФАЙЛОВ (ТОЛЬКО ВИДЕО)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChatId) return;

    if (file.type.startsWith('image/')) {
      alert('Отправка изображений запрещена. Разрешены только видео.');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('video/')) {
      alert('Разрешены только видеофайлы.');
      e.target.value = '';
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Файл > 50 МБ');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();

        let type: 'image' | 'video' | 'file' = 'file';
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        }

        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: currentChatId,
            username,
            text: data.fileUrl,
            type: type,
            fileName: file.name,
            avatar_url: avatarUrl,
          }),
        });

        await loadMessages(currentChatId);
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('Ошибка соединения при загрузке файла');
    }
  };

  // Голосовые
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoice(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Нет доступа к микрофону');
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
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    }
  };

  const uploadVoice = async (blob: Blob) => {
    if (!currentChatId) return;
    const formData = new FormData();
    formData.append('file', blob, 'voice.webm');
    formData.append('username', username);
    try {
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
    }
  };

  // Удаление
  const deleteMessage = async (messageId: number | string) => {
    const isTempId = typeof messageId === 'string' && messageId.startsWith('temp_');
    if (isTempId) {
      setMessages((prev) => prev.filter((msg) => msg.tempId !== messageId));
      return;
    }
    setDeletingMessageId(messageId);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/messages/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, username }),
        });
        if (res.ok) {
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } else {
          const data = await res.json();
          alert(data.error || 'Ошибка удаления');
        }
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
      setDeletingMessageId(null);
    }, 350);
  };

  // Реакции
  const toggleReaction = async (messageId: number | string, emoji: string) => {
    const isTempId = typeof messageId === 'string' && messageId.startsWith('temp_');
    if (isTempId) return;
    try {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      const userReaction = msg.reactions?.find((r) => r.username === username);
      setAnimatingReactionId(messageId);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const currentReactions = m.reactions || [];
            const existing = currentReactions.find((r) => r.username === username);
            if (existing?.reaction === emoji) {
              return { ...m, reactions: currentReactions.filter((r) => r.username !== username) };
            } else if (existing) {
              return {
                ...m,
                reactions: currentReactions.map((r) =>
                  r.username === username ? { ...r, reaction: emoji } : r
                ),
              };
            } else {
              return {
                ...m,
                reactions: [
                  ...currentReactions,
                  { id: Date.now(), message_id: messageId as number, username, reaction: emoji },
                ],
              };
            }
          }
          return m;
        })
      );
      if (userReaction?.reaction === emoji) {
        await fetch('/api/reactions/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, username }),
        });
      } else {
        await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, username, reaction: emoji }),
        });
      }
      if (isMobile) {
        setShowReactionsId(null);
        setHoveredMessageId(null);
      }
      setTimeout(() => {
        setAnimatingReactionId(null);
      }, 300);
    } catch (error) {
      console.error('Ошибка реакции:', error);
      setAnimatingReactionId(null);
    }
  };

  // ОБРАБОТЧИКИ ДОЛГОГО НАЖАТИЯ (1000 мс)
  const handleTouchStart = (messageId: number | string) => {
    const timer = setTimeout(() => {
      setIsLongPressing(true);
      setShowReactionsId(messageId);
      setHoveredMessageId(messageId);
    }, 1000);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  // Hover для десктопа
  const handleMouseEnter = (messageId: number | string) => {
    if (isMobile) return;
    setHoveredMessageId(messageId);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactionsId(messageId);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setHoveredMessageId(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setShowReactionsId(null);
      leaveTimeoutRef.current = null;
    }, 200);
  };

  const toggleReactionsMobile = (messageId: number | string) => {
    if (showReactionsId === messageId) {
      setShowReactionsId(null);
      setHoveredMessageId(null);
    } else {
      setShowReactionsId(messageId);
      setHoveredMessageId(messageId);
    }
  };

  // Realtime подписки
  useEffect(() => {
    if (!currentChatId) return;

    const messagesChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.chat_id === currentChatId) {
            setMessages((prev) => {
              if (newMsg.id && prev.some((m) => m.id === newMsg.id)) return prev;
              if (newMsg.username === username && newMsg.text) {
                const filtered = prev.filter(
                  (m) => !(m.username === username && !m.id && m.text === newMsg.text)
                );
                if (filtered.length !== prev.length) {
                  return [...filtered, newMsg];
                }
              }
              return [...prev, newMsg];
            });
            if (newMsg.username !== username) {
              ensureChatAvatar(newMsg.username);
            }
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    const deleteChannel = supabase
      .channel('public:messages:delete')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const deleted = payload.old as Message;
          if (deleted.chat_id === currentChatId) {
            setMessages((prev) => prev.filter((msg) => msg.id !== deleted.id));
          }
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel('public:reactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        async () => {
          const currentMessages = messages.filter((m) => typeof m.id === 'number');
          if (currentMessages.length === 0) return;
          const ids = currentMessages.map((m) => m.id);
          try {
            const res = await fetch(`/api/reactions?messageIds=${ids.join(',')}`);
            if (res.ok) {
              const data = await res.json();
              setMessages((prev) =>
                prev.map((msg) => {
                  const msgId = msg.id;
                  const isTempId = typeof msgId === 'string' && (msgId as string).startsWith('temp_');
                  if (isTempId) return msg;
                  return {
                    ...msg,
                    reactions: data.filter((r: any) => r.message_id === msg.id),
                  };
                })
              );
            }
          } catch (error) {
            console.error('Ошибка загрузки реакций:', error);
          }
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      deleteChannel.unsubscribe();
      reactionsChannel.unsubscribe();
    };
  }, [currentChatId, messages, username]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const isLight = theme === 'light';

  const handleProfileClick = (user: string) => {
    if (user) {
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setIsSettingsOpen(false);
      setProfileUsername(user);
      setIsProfileOpen(true);
    }
  };

  // ============================================================
  // РЕНДЕР ОДНОГО СООБЩЕНИЯ (ИСПРАВЛЕНО)
  // ============================================================
  const renderMessage = (msg: Message) => {
    const isMy = msg.username === username;
    const msgReactions = msg.reactions || [];
    const groupedReactions = msgReactions.reduce((acc: any, r: Reaction) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    }, {});
    const userReaction = msgReactions.find((r) => r.username === username)?.reaction;
    const isDeleting = deletingMessageId === msg.id || deletingMessageId === msg.tempId;
    const showReactions = showReactionsId === msg.id || showReactionsId === msg.tempId;
    const isHovered = hoveredMessageId === msg.id || hoveredMessageId === msg.tempId;
    const isAnimating = animatingReactionId === msg.id;
    const isPending = msg.tempId ? pendingMessages.has(msg.tempId) : false;
    const key = msg.id ? `msg-${msg.id}` : `msg-temp-${msg.tempId || Math.random()}`;

    let senderAvatar = !isMy
      ? chats.find((c) => c.otherUser === msg.username)?.otherUserAvatar
      : null;

    return (
      <div
        key={key}
        className={`flex items-end gap-3 ${isMy ? 'flex-row-reverse' : ''} relative ${
          isPending ? 'animate-pulse opacity-70' : ''
        } ${!isPending && !isDeleting ? 'animate-slideUp' : ''} ${isDeleting ? 'animate-delete' : ''}`}
        onMouseEnter={() => !isMobile && handleMouseEnter(msg.id || msg.tempId || key)}
        onMouseLeave={() => !isMobile && handleMouseLeave()}
        onTouchStart={() => isMobile && handleTouchStart(msg.id || msg.tempId || key)}
        onTouchEnd={() => isMobile && handleTouchEnd()}
        onTouchMove={() => isMobile && handleTouchMove()}
        onContextMenu={(e) => {
          e.preventDefault();
          if (isMobile) {
            setShowReactionsId(msg.id || msg.tempId || key);
            setHoveredMessageId(msg.id || msg.tempId || key);
          }
        }}
      >
        {!isMy && (
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: senderAvatar ? 'transparent' : getAvatarColor(msg.username) }}
            onClick={(e) => {
              e.stopPropagation();
              handleProfileClick(msg.username);
            }}
          >
            {senderAvatar ? (
              <img src={senderAvatar} alt={msg.username} className="w-full h-full object-cover" />
            ) : (
              msg.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
        )}
        <div className={`max-w-[80%] ${isMy ? 'flex flex-col items-end' : ''}`}>
          {!isMy && (
            <span
              className={`text-sm font-medium ml-2 mb-1 cursor-pointer hover:underline ${
                isLight ? 'text-gray-600' : 'text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(msg.username);
              }}
            >
              {msg.username}
            </span>
          )}

          <div className="relative flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-2 w-full">
              {/* FIX: Само сообщение - без изменений */}
              <div
                className={`px-6 py-4 rounded-2xl text-base break-words ${
                  isMy
                    ? 'bg-[var(--accent)] text-white rounded-br-sm'
                    : isLight
                    ? 'bg-white text-gray-900 rounded-bl-sm shadow-md'
                    : 'bg-[#2b2b2b] text-white rounded-bl-sm'
                }`}
                style={{ maxWidth: '100%', wordBreak: 'break-word' }}
              >
                {msg.type === 'image' && (
                  <img
                    src={msg.text}
                    alt="Фото"
                    className="rounded-xl"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      width: 'auto',
                      height: 'auto',
                    }}
                  />
                )}
                {msg.type === 'video' && (
                  <video
                    src={msg.text}
                    controls
                    className="rounded-xl"
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                )}
                {msg.type === 'voice' && (
                  <div className="flex items-center gap-3">
                    <audio controls src={msg.text} className="h-12" />
                    {msg.duration && <span className="text-sm opacity-70">{msg.duration}с</span>}
                  </div>
                )}
                {(!msg.type || msg.type === 'text') && <span className="text-base">{msg.text}</span>}
                {isPending && <span className="inline-block ml-2 text-xs opacity-50 animate-pulse">⏳</span>}
              </div>
            </div>

            {/* FIX: Блок с реакциями - теперь включает кнопку удаления */}
            {(isHovered || showReactions) && !isPending && !isDeleting && (
              <div
                className={`flex gap-0.5 bg-[#1f1f1f] rounded-full px-2 py-1 shadow-lg border border-[#2f2f2f] z-10 transition-all duration-300 ${
                  showReactions ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  position: isMobile ? 'relative' : 'absolute',
                  ...(isMobile
                    ? { marginTop: '4px', alignSelf: isMy ? 'flex-end' : 'flex-start' }
                    : isMy
                    ? { right: '100%', marginRight: '8px' }
                    : { left: '100%', marginLeft: '8px' }),
                  top: isMobile ? 'auto' : '50%',
                  // FIX: Убираем transform, чтобы сообщение не двигалось при долгом нажатии
                  transform: showReactions ? 'scale(1)' : 'scale(0.95)',
                  maxWidth: isMobile ? '100%' : '200px',
                  overflow: 'visible',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  justifyContent: isMy ? 'flex-end' : 'flex-start',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* FIX: Кнопка удаления теперь внутри блока реакций */}
                {isMy && !isMobile && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteMessage(msg.id || msg.tempId || key);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-base transition-all hover:scale-110 ${
                      isLight
                        ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        : 'bg-[#2b2b2b] text-gray-400 hover:bg-[#3b3b3b]'
                    }`}
                    title="Удалить"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                )}
                {['❤️', '🔥', '😂', '😢', '👍'].map((emoji) => (
                  <button
                    key={`${msg.id || msg.tempId}-${emoji}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReaction(msg.id || msg.tempId || key, emoji);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-base transition-all hover:scale-125 active:scale-90 ${
                      userReaction === emoji ? 'bg-[var(--accent)]/30 scale-110' : ''
                    } ${isAnimating ? 'animate-bounce' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {Object.keys(groupedReactions).length > 0 && !isPending && (
            <div className={`flex flex-wrap gap-1.5 mt-1 ${isMy ? 'justify-end' : ''}`}>
              {Object.entries(groupedReactions).map(([emoji, count]) => (
                <span
                  key={`${msg.id || msg.tempId}-${emoji}-count`}
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-gray-200 text-gray-700' : 'bg-[#2b2b2b] text-gray-300'
                  }`}
                >
                  {emoji} {count as number}
                </span>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-2 mt-1 ${isMy ? 'flex-row-reverse' : ''}`}>
            <span className={`text-xs ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
              {msg.tempId ? 'Отправка...' : formatTime(msg.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // МОБИЛЬНАЯ ВЕРСИЯ
  // ============================================================
  if (isMobile) {
    const bgColor = isLight ? '#ffffff' : '#0a0a0a';
    const textPrimary = isLight ? '#000000' : '#ffffff';
    const textSecondary = isLight ? '#8e8e93' : '#8e8e93';
    const borderColor = isLight ? '#d1d1d6' : '#38383a';
    const headerBg = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(28,28,30,0.9)';
    const inputFieldBg = isLight ? '#f0f0f0' : '#2c2c2e';
    const messagesBg = isLight ? '#f0f2f5' : '#0a0a0a';

    return (
      <>
        {isProfileOpen && (
          <UserProfileModal
            username={profileUsername}
            currentUsername={username}
            onClose={() => setIsProfileOpen(false)}
            theme={theme}
            avatarUrl={avatarUrl}
            userAvatar={chats.find((c) => c.otherUser === profileUsername)?.otherUserAvatar || null}
          />
        )}
        {isSettingsOpen && (
          <SettingsModal
            username={username}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            setTheme={setTheme}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            setIsAuth={() => {
              localStorage.removeItem('whisp_username');
              window.location.reload();
            }}
            openRules={() => setIsRulesOpen(true)}
          />
        )}
        {isRulesOpen && (
          <RulesModal
            onClose={() => setIsRulesOpen(false)}
            theme={theme}
          />
        )}
        <div
          style={{
            backgroundColor: bgColor,
            color: textPrimary,
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            overflowX: 'hidden',
          }}
        >
          {mobileView === 'chats' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  paddingTop: 'max(12px, env(safe-area-inset-top))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderBottom: `1px solid ${borderColor}`,
                  flexShrink: 0,
                  position: 'sticky',
                  top: 0,
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      username?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '18px' }}>Whisp</div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>👻 {username}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsProfileOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    color: textPrimary,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px 12px',
                  paddingBottom: '80px',
                  backgroundColor: bgColor,
                  overflowX: 'hidden',
                }}
              >
                {chats.map((chat) => {
                  const name = chat.otherUser;
                  const friendAvatar = chat.otherUserAvatar;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        marginBottom: '2px',
                        backgroundColor: 'transparent',
                      }}
                    >
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: 'white',
                          background: friendAvatar ? 'transparent' : accentColor,
                          overflow: 'hidden',
                        }}
                      >
                        {friendAvatar ? (
                          <img src={friendAvatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '16px', color: textPrimary }}>{name}</div>
                        {chat.lastMessage && (
                          <div
                            style={{
                              fontSize: '13px',
                              color: textSecondary,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {chat.lastMessage}
                          </div>
                        )}
                      </div>
                      {chat.lastMessageTime && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: textSecondary,
                            flexShrink: 0,
                            marginLeft: '8px',
                          }}
                        >
                          {formatTime(new Date(chat.lastMessageTime).toISOString())}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 16px 4px',
                    fontSize: '11px',
                    color: textSecondary,
                    opacity: 0.6,
                  }}
                >
                  👻 Проект для школы. Автор не несёт ответственности за содержание сообщений.
                  <br />
                  <span
                    onClick={() => {
                      setIsRulesOpen(true);
                    }}
                    style={{
                      color: accentColor,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      opacity: 0.8,
                    }}
                  >
                    📜 Правила сообщества
                  </span>
                </div>
              </div>

              {/* FIX: НИЖНИЙ ТАББАР - кнопка "Чаты" теперь серая (не акцентная) */}
              <div
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  padding: '8px 0',
                  paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderTop: `1px solid ${borderColor}`,
                  zIndex: 100,
                }}
              >
                {/* FIX: Кнопка "Чаты" теперь всегда серая (не акцентная) */}
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsProfileOpen(false);
                    setIsSettingsOpen(false);
                    setMobileView('chats');
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '4px 16px',
                    border: 'none',
                    background: 'none',
                    color: textSecondary, // Всегда серый
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Чаты</span>
                </button>

                <button
                  onClick={() => {
                    if (isSearchOpen) {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    } else {
                      setIsProfileOpen(false);
                      setIsSettingsOpen(false);
                      setIsSearchOpen(true);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '4px 16px',
                    border: 'none',
                    background: 'none',
                    color: isSearchOpen ? accentColor : textSecondary,
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Поиск</span>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsProfileOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '4px 16px',
                    border: 'none',
                    background: 'none',
                    color: textSecondary,
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Настройки</span>
                </button>
              </div>

              {isSearchOpen && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: bgColor,
                    zIndex: 200,
                    padding: '20px 16px',
                    paddingTop: 'max(20px, env(safe-area-inset-top))',
                    overflowX: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      style={{
                        padding: '8px',
                        border: 'none',
                        background: 'none',
                        color: textPrimary,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: inputFieldBg,
                        color: textPrimary,
                        fontSize: '15px',
                        outline: 'none',
                      }}
                      autoFocus
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div>
                      {searchResults.map((user) => (
                        <div
                          key={user.username}
                          onClick={() => createChat(user.username)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: 600,
                            }}
                          >
                            {user.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, color: textPrimary }}>{user.username}</div>
                            <div style={{ fontSize: '12px', color: textSecondary }}>Начать чат</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.length === 0 && searchQuery && (
                    <div style={{ textAlign: 'center', color: textSecondary, marginTop: '40px' }}>
                      Пользователи не найдены
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {mobileView === 'chat' && currentChatId && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  paddingTop: 'max(8px, env(safe-area-inset-top))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderBottom: `1px solid ${borderColor}`,
                  gap: '10px',
                  flexShrink: 0,
                  position: 'sticky',
                  top: 0,
                  zIndex: 50,
                }}
              >
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsSettingsOpen(false);
                    setIsSearchOpen(false);
                    setMobileView('chats');
                    setCurrentChatId(null);
                  }}
                  style={{
                    padding: '6px',
                    border: 'none',
                    background: 'none',
                    color: textPrimary,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSettingsOpen(false);
                    setProfileUsername(currentChatUser);
                    setIsProfileOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flex: 1,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '16px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'transparent',
                    }}
                  >
                    {(() => {
                      const chat = chats.find((c) => c.otherUser === currentChatUser);
                      const friendAvatar = chat?.otherUserAvatar;
                      if (currentChatUser === username) {
                        return avatarUrl ? (
                          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        );
                      } else {
                        return friendAvatar ? (
                          <img src={friendAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {currentChatUser?.charAt(0).toUpperCase() || '?'}
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '16px', color: textPrimary }}>{currentChatUser}</div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>👻 Нажмите для профиля</div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: messagesBg,
                  overflowX: 'hidden',
                }}
              >
                {messages.map((msg) => renderMessage(msg))}
                <div ref={messagesEndRef} />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  padding: '8px 12px',
                  paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderTop: `1px solid ${borderColor}`,
                  flexShrink: 0,
                }}
              >
                <label style={{ cursor: 'pointer', padding: '4px' }}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: textSecondary }}
                  >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept="video/*"
                  />
                </label>
                {!isRecording ? (
                  <>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Сообщение..."
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: inputFieldBg,
                        color: textPrimary,
                        fontSize: '15px',
                        outline: 'none',
                        minHeight: '40px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={startRecording}
                      style={{
                        padding: '8px',
                        border: 'none',
                        background: 'none',
                        color: textSecondary,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      disabled={isSending || !text.trim()}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '50%',
                        border: 'none',
                        background: accentColor,
                        color: 'white',
                        cursor: 'pointer',
                        opacity: isSending || !text.trim() ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', color: textPrimary }}>
                      {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                      {String(recordingTime % 60).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      style={{
                        color: 'red',
                        padding: '4px',
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      style={{
                        color: 'green',
                        padding: '4px',
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                      }}
                    >
                      ●
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // ============================================================
  // ДЕСКТОПНАЯ ВЕРСИЯ
  // ============================================================
  return (
    <div className={`h-dvh flex overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-[#1c1515]'}`}>
      <div
        className={`${
          isMobileMenuOpen ? 'absolute inset-0 z-50 flex' : 'hidden md:flex'
        } md:relative md:z-0 md:flex flex-col w-[320px] max-w-[85vw] md:max-w-[320px] flex-shrink-0 ${
          isLight ? 'bg-white' : 'bg-[#1f1f1f]'
        } border-r ${isLight ? 'border-gray-200' : 'border-[#2b2b2b]'}`}
      >
        <div className={`flex items-center justify-between p-4 ${isLight ? 'bg-gray-50' : 'bg-[#1f1f1f]'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleProfileClick(username)}
              className="w-10 h-10 rounded-full overflow-hidden bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{username?.charAt(0).toUpperCase() || '?'}</span>
              )}
            </button>
            <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{username}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) {
                  setSearchResults([]);
                  setIsProfileOpen(false);
                  setIsSettingsOpen(false);
                }
              }}
              className="p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all"
            >
              <svg
                className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all"
            >
              <svg
                className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-full hover:bg-gray-700/20 transition-all"
            >
              <svg
                className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {isSearchOpen && (
          <div className={`px-4 py-2 ${isLight ? 'bg-gray-50' : 'bg-[#1f1f1f]'}`}>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className={`w-full p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all ${
                isLight
                  ? 'bg-white text-gray-900 placeholder-gray-400'
                  : 'bg-[#2b2b2f] text-white placeholder-gray-500'
              }`}
            />
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => createChat(user.username)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                      isLight ? 'hover:bg-gray-200' : 'hover:bg-[#2b2b2f]'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getAvatarColor(user.username) }}
                    >
                      {user.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className={`text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const name = chat.otherUser;
            const friendAvatar = chat.otherUserAvatar;
            return (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`w-full flex items-center gap-3 p-3 transition-all ${
                  currentChatId === chat.id
                    ? isLight
                      ? 'bg-gray-200'
                      : 'bg-[#2b2b2f]'
                    : 'hover:bg-[var(--accent)]/5'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                  style={{ background: friendAvatar ? 'transparent' : accentColor }}
                >
                  {friendAvatar ? (
                    <img src={friendAvatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {name}
                    </span>
                    <span className={`text-xs flex-shrink-0 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                      {chat.lastMessageTime ? formatTime(new Date(chat.lastMessageTime).toISOString()) : ''}
                    </span>
                  </div>
                  {chat.lastMessage && (
                    <span className={`text-xs truncate block ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      {chat.lastMessage}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          <div className={`text-center text-xs py-2 px-4 ${isLight ? 'text-gray-400' : 'text-gray-500'} opacity-60`}>
            👻 Проект для школы. Автор не несёт ответственности за содержание сообщений.
            <br />
            <span
              onClick={() => setIsRulesOpen(true)}
              style={{
                color: accentColor,
                textDecoration: 'underline',
                cursor: 'pointer',
                opacity: 0.8,
              }}
            >
              📜 Правила сообщества
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {currentChatId ? (
          <>
            <header
              className={`flex items-center gap-3 p-3 flex-shrink-0 cursor-pointer ${
                isLight ? 'bg-gray-50 border-b border-gray-200' : 'bg-[#1f1f1f] border-b border-[#2b2b2b]'
              }`}
            >
              <button
                onClick={() => {
                  if (window.innerWidth < 768) setIsMobileMenuOpen(true);
                }}
                className="md:hidden p-1 rounded-full hover:bg-gray-700/20 transition-all"
              >
                <svg
                  className={`w-6 h-6 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: 'transparent' }}
                  onClick={() => handleProfileClick(currentChatUser)}
                >
                  {(() => {
                    const chat = chats.find((c) => c.otherUser === currentChatUser);
                    const friendAvatar = chat?.otherUserAvatar;
                    if (currentChatUser === username) {
                      return avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: accentColor }}
                        >
                          {username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      );
                    } else {
                      return friendAvatar ? (
                        <img src={friendAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: accentColor }}
                        >
                          {currentChatUser?.charAt(0).toUpperCase() || '?'}
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleProfileClick(currentChatUser)}>
                  <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentChatUser}</span>
                  <p className={`text-xs truncate ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                    👻 Нажмите для просмотра профиля
                  </p>
                </div>
              </div>
            </header>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 messages-container" style={{ overflowX: 'hidden' }}>
              {messages.map((msg) => renderMessage(msg))}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={sendMessage}
              className={`flex items-end gap-2 p-3 flex-shrink-0 ${
                isLight ? 'bg-gray-50 border-t border-gray-200' : 'bg-[#1f1f1f] border-t border-[#2b2b2b]'
              }`}
            >
              <label className="cursor-pointer p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all">
                <svg
                  className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="video/*"
                />
              </label>
              {!isRecording ? (
                <>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Напишите сообщение..."
                    className={`flex-1 p-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all ${
                      isLight
                        ? 'bg-white text-gray-900 placeholder-gray-400'
                        : 'bg-[#2b2b2b] text-white placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all"
                  >
                    <svg
                      className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    disabled={isSending || !text.trim()}
                    className="p-3 rounded-full text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <span className={`text-sm font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                    {String(recordingTime % 60).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="text-red-500 p-2 transition-all hover:scale-110"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="text-green-500 p-2 transition-all hover:scale-110"
                  >
                    ●
                  </button>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <div className="relative">
              <GhostIcon
                className={`w-32 h-36 ${isLight ? 'text-[var(--accent)]' : 'text-white'} opacity-30`}
                size="large"
              />
              <div className="absolute inset-0 -m-8 rounded-full border-4 border-[var(--accent)] animate-ping opacity-10"></div>
            </div>
            <span className="text-2xl font-bold text-[var(--accent)]">Whisp</span>
            <span className={`text-sm ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>👻 Выберите чат</span>
          </div>
        )}
      </div>
      {isProfileOpen && (
        <UserProfileModal
          username={profileUsername}
          currentUsername={username}
          onClose={() => setIsProfileOpen(false)}
          theme={theme}
          avatarUrl={avatarUrl}
          userAvatar={chats.find((c) => c.otherUser === profileUsername)?.otherUserAvatar || null}
        />
      )}
      {isSettingsOpen && (
        <SettingsModal
          username={username}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          setIsAuth={() => {
            localStorage.removeItem('whisp_username');
            window.location.reload();
          }}
          openRules={() => setIsRulesOpen(true)}
        />
      )}
      {isRulesOpen && (
        <RulesModal
          onClose={() => setIsRulesOpen(false)}
          theme={theme}
        />
      )}
    </div>
  );
}

// ============================================================
// ГЛАВНЫЙ КОМПОНЕНТ – ЭКСПОРТ
// ============================================================
export default function HomePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('whisp_theme') as 'dark' | 'light' || 'dark';
    const savedAccent = localStorage.getItem('whisp_accent') || '#7c3aed';
    setTheme(savedTheme);
    setAccentColor(savedAccent);
    document.documentElement.style.setProperty('--accent', savedAccent);

    const savedUsername = localStorage.getItem('whisp_username');
    if (savedUsername) {
      fetch(`/api/profile?username=${savedUsername}`)
        .then((res) => {
          if (res.ok) {
            setIsAuth(true);
            setUsername(savedUsername);
          } else {
            localStorage.removeItem('whisp_username');
          }
        })
        .catch(() => localStorage.removeItem('whisp_username'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingScreen theme={theme} />;
  if (isAuth) {
    return (
      <>
        <ChatApp
          username={username}
          theme={theme}
          setTheme={setTheme}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
        />
        {isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} theme={theme} />}
      </>
    );
  }

  return (
    <>
      <AuthForm
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        setIsAuth={setIsAuth}
        theme={theme}
        accentColor={accentColor}
        onOpenRules={() => setIsRulesOpen(true)}
      />
      {isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} theme={theme} />}
    </>
  );
}  lastMessageTime?: number;
}

interface UserProfile {
  username: string;
  avatar_url?: string | null;
  bio?: string;
  created_at?: string;
}

// ============================================================
// КОМПОНЕНТ ПРИВИДЕНИЯ
// ============================================================
function GhostIcon({ className = "", size = "normal" }: { className?: string; size?: 'small' | 'normal' | 'large' }) {
  const sizes = { small: "w-12 h-14", normal: "w-20 h-24", large: "w-32 h-36" };
  const sizeClass = sizes[size as keyof typeof sizes] || sizes.normal;
  return (
    <svg className={`${sizeClass} ${className}`} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="ghostGlow" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="currentColor" stopOpacity="0"/>
        </radialGradient>
        <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="white" stopOpacity="0.95"/>
          <stop offset="100%" stopColor="white" stopOpacity="0.6"/>
        </radialGradient>
        <filter id="ghostFilter">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feMerge>
            <feMergeNode in="blur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <ellipse cx="50" cy="50" rx="48" ry="53" fill="url(#ghostGlow)" className="animate-ghostPulse"/>
      <ellipse cx="50" cy="115" rx="38" ry="10" fill="currentColor" className="opacity-10 animate-ghostShadow"/>
      <g className="animate-ghostFloat">
        <path d="M20 40C20 18 30 10 50 10C70 10 80 18 80 40V80C80 90 70 95 60 90L55 85C50 90 45 90 40 85L35 90C25 95 20 90 20 80V40Z" fill="currentColor" filter="url(#ghostFilter)"/>
        <ellipse cx="35" cy="40" rx="11" ry="13" fill="url(#eyeGlow)" className="animate-ghostEyes" />
        <ellipse cx="65" cy="40" rx="11" ry="13" fill="url(#eyeGlow)" className="animate-ghostEyes" />
        <ellipse cx="37" cy="41" rx="5" ry="6" fill="#1a1a2e" className="animate-ghostPupils" />
        <ellipse cx="67" cy="41" rx="5" ry="6" fill="#1a1a2e" className="animate-ghostPupils" />
        <circle cx="39" cy="39" r="2" fill="white" opacity="0.9" className="animate-ghostSparkle" />
        <circle cx="69" cy="39" r="2" fill="white" opacity="0.9" className="animate-ghostSparkle" style={{ animationDelay: '0.15s' }} />
        <ellipse cx="24" cy="52" rx="9" ry="5" fill="#ff6b6b" opacity="0.12" className="animate-ghostBlush" />
        <ellipse cx="76" cy="52" rx="9" ry="5" fill="#ff6b6b" opacity="0.12" className="animate-ghostBlush" style={{ animationDelay: '0.2s' }} />
        <path d="M38 60C44 66 56 66 62 60" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.5" className="animate-ghostSmile" />
      </g>
      <g className="animate-ghostWave">
        <path d="M25 85Q30 78 35 85Q40 92 45 85Q50 78 55 85Q60 92 65 85Q70 78 75 85" stroke="currentColor" strokeWidth="3" fill="none" opacity="0.7"/>
        <path d="M25 85Q30 78 35 85Q40 92 45 85Q50 78 55 85Q60 92 65 85Q70 78 75 85" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.3" transform="translate(0,4)"/>
        <path d="M25 85Q30 78 35 85Q40 92 45 85Q50 78 55 85Q60 92 65 85Q70 78 75 85" stroke="currentColor" strokeWidth="0.8" fill="none" opacity="0.15" transform="translate(0,8)"/>
      </g>
      <circle cx="12" cy="20" r="2.5" fill="currentColor" opacity="0.4" className="animate-sparkle" />
      <circle cx="88" cy="25" r="2" fill="currentColor" opacity="0.4" className="animate-sparkle" style={{ animationDelay: '0.6s' }} />
      <circle cx="8" cy="58" r="2" fill="currentColor" opacity="0.3" className="animate-sparkle" style={{ animationDelay: '1.2s' }} />
      <circle cx="92" cy="65" r="2.5" fill="currentColor" opacity="0.4" className="animate-sparkle" style={{ animationDelay: '1.8s' }} />
      <circle cx="18" cy="72" r="1.5" fill="currentColor" opacity="0.2" className="animate-sparkle" style={{ animationDelay: '0.9s' }} />
      <circle cx="82" cy="78" r="1.5" fill="currentColor" opacity="0.2" className="animate-sparkle" style={{ animationDelay: '2.1s' }} />
      <ellipse cx="50" cy="82" rx="30" ry="12" fill="currentColor" opacity="0.04" className="animate-ghostVapor" />
      <ellipse cx="50" cy="86" rx="20" ry="8" fill="currentColor" opacity="0.06" className="animate-ghostVapor" style={{ animationDelay: '0.5s' }} />
    </svg>
  );
}

// ============================================================
// ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ============================================================
function UserProfileModal({
  username: targetUsername,
  currentUsername,
  onClose,
  theme,
  avatarUrl: propAvatarUrl,
  userAvatar,
}: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isOwnProfile = targetUsername === currentUsername;
  const isLight = theme === 'light';

  const displayAvatarUrl = isOwnProfile
    ? propAvatarUrl
    : (userAvatar || profile?.avatar_url || null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!targetUsername) {
        setLoading(false);
        setError('Не указан пользователь');
        return;
      }
      try {
        const res = await fetch(`/api/profile?username=${encodeURIComponent(targetUsername)}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setError(null);
        } else {
          const errorData = await res.json();
          setError(errorData.error || 'Профиль не найден');
          setProfile(null);
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
        setError('Ошибка соединения');
        setProfile(null);
      }
      setLoading(false);
    };
    loadProfile();
  }, [targetUsername]);

  const getAvatarColor = (name: string) => {
    if (!name || name.length === 0) return '#6c5ce7';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  const formatDate = (date?: string) => {
    if (!date) return 'Неизвестно';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Неизвестно';
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
        <div className={`rounded-3xl p-8 ${isLight ? 'bg-white' : 'bg-[#1f1f1f]'}`}>
          <div className="w-12 h-12 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
        <div className={`max-w-md w-full rounded-3xl p-6 ${isLight ? 'bg-white' : 'bg-[#1f1f1f]'}`}>
          <p className="text-center text-gray-500">{error || 'Профиль не найден'}</p>
          <button onClick={onClose} className="mt-4 w-full py-2 rounded-xl bg-[var(--accent)] text-white">Закрыть</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div
        className={`max-w-md w-full rounded-3xl p-6 ${isLight ? 'bg-white' : 'bg-[#1f1f1f]'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className={`text-xl font-bold ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {isOwnProfile ? '👤 Мой профиль' : '👤 Профиль'}
          </h2>
          <button onClick={onClose} className={`${isLight ? 'text-gray-500' : 'text-gray-400'} text-xl hover:scale-110 transition-transform`}>✕</button>
        </div>
        <div className="text-center">
          <div className="w-24 h-24 rounded-full overflow-hidden mx-auto" style={{ backgroundColor: displayAvatarUrl ? 'transparent' : getAvatarColor(profile.username) }}>
            {displayAvatarUrl ? (
              <img src={displayAvatarUrl} alt={profile.username} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold" style={{ backgroundColor: getAvatarColor(profile.username) }}>
                {profile.username?.charAt(0).toUpperCase() || '?'}
              </div>
            )}
          </div>
          <h3 className={`text-xl font-semibold mt-3 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            {profile.username || 'Неизвестно'}
          </h3>
          <div className={`mt-2 flex items-center justify-center gap-2 text-sm ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>📅</span>
            <span>Присоединился: {formatDate(profile.created_at)}</span>
          </div>
        </div>
        {!isOwnProfile && (
          <button
            onClick={onClose}
            className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:opacity-80 active:scale-[0.98]"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            👻 Написать сообщение
          </button>
        )}
      </div>
    </div>
  );
}

// ============================================================
// МОДАЛЬНОЕ ОКНО С ПРАВИЛАМИ СООБЩЕСТВА
// ============================================================
function RulesModal({ onClose, theme }: { onClose: () => void; theme: string }) {
  const isLight = theme === 'light';
  const bgColor = isLight ? '#ffffff' : '#0a0a0a';
  const textPrimary = isLight ? '#000000' : '#ffffff';
  const textSecondary = isLight ? '#8e8e93' : '#8e8e93';
  const borderColor = isLight ? '#d1d1d6' : '#38383a';
  const cardBg = isLight ? '#f0f0f0' : '#1c1c1e';

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="max-w-lg w-full rounded-3xl p-6 max-h-[90vh] overflow-y-auto"
        style={{ backgroundColor: bgColor, color: textPrimary }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">📜 Правила сообщества</h2>
          <button onClick={onClose} className="text-2xl hover:scale-110 transition-transform">✕</button>
        </div>
        <div className="space-y-3 text-sm leading-relaxed">
          <p className="font-semibold text-base">Добро пожаловать в Whisp! Мы ценим каждого участника и просим соблюдать простые правила:</p>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>Будьте вежливы</strong> – уважайте мнение других, избегайте оскорблений и грубости.</li>
            <li><strong>Запрещены:</strong> мат, ненормативная лексика, угрозы, разжигание ненависти, спам и флуд.</li>
            <li><strong>Контент:</strong> не публикуйте материалы, нарушающие законодательство РФ, а также порнографию, насилие или любые другие неподобающие изображения/видео.</li>
            <li><strong>Личные данные:</strong> не раскрывайте чужие личные данные без согласия (адреса, телефоны, паспортные данные).</li>
            <li><strong>Соблюдайте тематику</strong> – этот чат создан для общения на общие темы, но мы оставляем за собой право ограничивать обсуждение, если оно выходит за рамки приличия.</li>
            <li><strong>Администрация:</strong> мы оставляем за собой право блокировать пользователей за нарушение правил без предупреждения.</li>
          </ul>
          <p className="mt-4 text-center text-xs opacity-70" style={{ color: textSecondary }}>
            Нарушение правил может привести к временной или постоянной блокировке аккаунта.
            <br />Спасибо, что делаете наше сообщество лучше! 👻
          </p>
          <div className="mt-4 p-3 rounded-xl" style={{ backgroundColor: cardBg }}>
            <p className="text-center text-xs" style={{ color: textSecondary }}>
              ⚠️ Данный проект является учебным (школьным). Администрация не несёт ответственности за содержание сообщений,<br />
              но оставляет за собой право модерировать контент в соответствии с правилами.
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-full mt-6 py-3 rounded-xl text-white font-semibold text-sm transition-all hover:opacity-80 active:scale-[0.98]"
          style={{ backgroundColor: 'var(--accent)' }}
        >
          Принимаю и закрываю
        </button>
      </div>
    </div>
  );
}

// ============================================================
// НАСТРОЙКИ
// ============================================================
function SettingsModal({
  username,
  avatarUrl,
  setAvatarUrl,
  onClose,
  theme,
  setTheme,
  accentColor,
  setAccentColor,
  setIsAuth,
  openRules,
}: any) {
  const [isUploading, setIsUploading] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const bgColor = isLight ? '#ffffff' : '#0a0a0a';
  const textPrimary = isLight ? '#000000' : '#ffffff';
  const textSecondary = isLight ? '#8e8e93' : '#8e8e93';
  const borderColor = isLight ? '#d1d1d6' : '#38383a';
  const cardBg = isLight ? '#f0f0f0' : '#1c1c1e';

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`/api/profile?username=${username}`);
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (error) {
        console.error('Ошибка загрузки профиля:', error);
      }
    };
    loadProfile();
  }, [username]);

  const formatDate = (date?: string) => {
    if (!date) return 'Неизвестно';
    try {
      const d = new Date(date);
      return d.toLocaleDateString('ru-RU', { year: 'numeric', month: 'long', day: 'numeric' });
    } catch {
      return 'Неизвестно';
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('Файл > 5 МБ');
      return;
    }
    setIsUploading(true);
    const img = new Image();
    const reader = new FileReader();
    reader.onload = async (event) => {
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 200;
        canvas.height = 200;
        const size = Math.min(img.width, img.height);
        const x = (img.width - size) / 2;
        const y = (img.height - size) / 2;
        ctx?.drawImage(img, x, y, size, size, 0, 0, 200, 200);
        const resizedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const formData = new FormData();
        const blob = await fetch(resizedDataUrl).then(r => r.blob());
        formData.append('file', blob, 'avatar.jpg');
        formData.append('username', username);
        try {
          const res = await fetch('/api/upload-avatar', { method: 'POST', body: formData });
          if (res.ok) {
            const data = await res.json();
            const newAvatarUrl = data.avatarUrl + '?t=' + Date.now();
            setAvatarUrl(newAvatarUrl);
            localStorage.setItem(`whisp_avatar_${username}`, newAvatarUrl);
            window.dispatchEvent(new Event('avatar-updated'));
          } else {
            const err = await res.json();
            alert(err.error || 'Ошибка загрузки');
          }
        } catch (error) {
          console.error('Ошибка:', error);
          alert('Ошибка загрузки');
        } finally {
          setIsUploading(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col" style={{ backgroundColor: bgColor }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 16px',
          paddingTop: 'max(10px, env(safe-area-inset-top))',
          borderBottom: `1px solid ${borderColor}`,
          flexShrink: 0,
          backgroundColor: bgColor,
        }}
      >
        <button
          onClick={onClose}
          style={{
            padding: '6px',
            border: 'none',
            background: 'none',
            color: textPrimary,
            cursor: 'pointer',
            fontSize: '16px',
          }}
        >
          ✕
        </button>
        <span style={{ fontWeight: 600, fontSize: '17px', color: textPrimary }}>Настройки</span>
        <div style={{ width: '40px' }} />
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
          <div
            className="relative cursor-pointer group"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              overflow: 'hidden',
              backgroundColor: accentColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {isUploading ? (
              <div className="w-full h-full flex items-center justify-center bg-black/50">
                <div className="w-8 h-8 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : avatarUrl ? (
              <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ fontSize: '32px', fontWeight: 600, color: 'white' }}>
                {username?.charAt(0).toUpperCase() || '?'}
              </span>
            )}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span style={{ color: 'white', fontSize: '11px', fontWeight: 500 }}>📷 Изменить</span>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarUpload}
          />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '12px' }}>
          <div style={{ fontSize: '18px', fontWeight: 600, color: textPrimary }}>{username}</div>
          <div style={{ fontSize: '13px', color: textSecondary, marginTop: '2px' }}>👻 Whisp</div>
        </div>
        {profile?.created_at && (
          <div style={{ textAlign: 'center', marginBottom: '16px', fontSize: '13px', color: textSecondary }}>
            📅 Присоединился: {formatDate(profile.created_at)}
          </div>
        )}
        <div style={{ backgroundColor: cardBg, borderRadius: '10px', overflow: 'hidden', marginBottom: '12px' }}>
          <div style={{ padding: '8px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: textPrimary, fontSize: '15px' }}>🌙 Тема</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button
                  onClick={() => {
                    setTheme('dark');
                    localStorage.setItem('whisp_theme', 'dark');
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme === 'dark' ? accentColor : 'transparent',
                    color: theme === 'dark' ? 'white' : textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Тёмная
                </button>
                <button
                  onClick={() => {
                    setTheme('light');
                    localStorage.setItem('whisp_theme', 'light');
                  }}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: theme === 'light' ? accentColor : 'transparent',
                    color: theme === 'light' ? 'white' : textSecondary,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  Светлая
                </button>
              </div>
            </div>
          </div>
          <div style={{ height: '1px', backgroundColor: borderColor, margin: '0 14px' }} />
          <div style={{ padding: '8px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ color: textPrimary, fontSize: '15px' }}>🎨 Акцент</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['#7c3aed', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'].map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setAccentColor(c);
                      localStorage.setItem('whisp_accent', c);
                      document.documentElement.style.setProperty('--accent', c);
                    }}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: accentColor === c ? `2px solid ${textPrimary}` : '1px solid transparent',
                      backgroundColor: c,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            onClose();
            openRules();
          }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: 'rgba(124,58,237,0.1)',
            color: accentColor,
            border: 'none',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            marginBottom: '8px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(124,58,237,0.1)')}
        >
          📜 Правила сообщества
        </button>

        <button
          onClick={() => {
            if (confirm('Вы уверены?')) {
              localStorage.removeItem('whisp_username');
              setIsAuth(false);
              onClose();
            }
          }}
          style={{
            width: '100%',
            padding: '10px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255,59,48,0.1)',
            color: '#ff3b30',
            border: 'none',
            fontSize: '15px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.2)')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(255,59,48,0.1)')}
        >
          👻 Выйти из аккаунта
        </button>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: textSecondary, opacity: 0.5 }}>
          Whisp v1.0 · Школьный проект
        </div>
        <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '10px', color: textSecondary, opacity: 0.4 }}>
          © 2026 Whisp. Все права защищены. Данный продукт разработан в образовательных целях.
          <br />Администрация не несёт ответственности за содержание сообщений пользователей.
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ЗАГРУЗКА
// ============================================================
function LoadingScreen({ theme }: { theme: string }) {
  return (
    <div className={`h-dvh flex items-center justify-center flex-col gap-6 ${theme === 'dark' ? 'bg-[#1c1515]' : 'bg-white'}`}>
      <div className="relative">
        <GhostIcon className={`${theme === 'dark' ? 'text-white' : 'text-[var(--accent)]'}`} size="large" />
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-16 h-2 bg-[var(--accent)] rounded-full blur-md animate-pulse"></div>
      </div>
      <div className="flex flex-col items-center gap-2">
        <p className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'} animate-pulse`}>
          Загрузка...
        </p>
        <div className="flex gap-1">
          <span className={`w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce`} style={{ animationDelay: '0s' }}></span>
          <span className={`w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce`} style={{ animationDelay: '0.2s' }}></span>
          <span className={`w-2 h-2 rounded-full bg-[var(--accent)] animate-bounce`} style={{ animationDelay: '0.4s' }}></span>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// АВТОРИЗАЦИЯ (С СОГЛАСИЕМ НА ПРАВИЛА)
// ============================================================
function AuthForm({
  username,
  setUsername,
  password,
  setPassword,
  isLogin,
  setIsLogin,
  setIsAuth,
  theme,
  accentColor,
  onOpenRules,
}: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [agreedToRules, setAgreedToRules] = useState(false);
  const isLight = theme === 'light';

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', accentColor);
  }, [accentColor]);

  useEffect(() => {
    setAgreedToRules(false);
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !agreedToRules) {
      alert('Пожалуйста, примите правила сообщества');
      return;
    }
    setIsLoading(true);
    const endpoint = isLogin ? '/api/login' : '/api/register';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        localStorage.setItem('whisp_username', username);
        setIsAuth(true);
      } else {
        const data = await res.json();
        alert(data.error || 'Ошибка');
      }
    } catch (error) {
      alert('Ошибка соединения');
    }
    setIsLoading(false);
  };

  return (
    <div className={`h-dvh flex items-center justify-center px-4 ${theme === 'dark' ? 'bg-[#1c1515]' : 'bg-gray-50'}`}>
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="relative w-24 h-28 mx-auto">
            <div className="absolute inset-0 -m-4 rounded-full border-2 border-[var(--accent)] animate-ping opacity-20"></div>
            <div className="absolute inset-0 -m-8 rounded-full border-2 border-[var(--accent)] animate-ping opacity-10" style={{ animationDelay: '0.5s' }}></div>
            <div className="absolute inset-0 -m-12 rounded-full border-2 border-[var(--accent)] animate-ping opacity-5" style={{ animationDelay: '1s' }}></div>
            <div className="relative z-10">
              <GhostIcon className={`${isLight ? 'text-[var(--accent)]' : 'text-white'}`} size="large" />
            </div>
          </div>
          <h1 className={`text-3xl font-bold mt-4 ${isLight ? 'text-gray-900' : 'text-white'}`}>
            <span className="relative inline-block">
              Whisp
              <span className="absolute -top-2 -right-7 text-lg">👻</span>
            </span>
          </h1>
          <p className={`text-sm mt-1 ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
            {isLogin ? 'Войдите в аккаунт' : 'Создайте аккаунт'}
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <input              type="text"
              placeholder="Логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full p-4 pl-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm transition-all duration-300 ${
                isLight
                  ? 'bg-white/80 text-gray-900 placeholder-gray-400 border-gray-200'
                  : 'bg-[#1f1f1f] text-white placeholder-gray-500 border-[#2f2f2f]'
              }`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300">
              👻
            </span>
          </div>
          <div className="relative group">
            <input
              type="password"
              placeholder="Пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full p-4 pl-12 rounded-xl border focus:outline-none focus:ring-2 focus:ring-[var(--accent)] text-sm transition-all duration-300 ${
                isLight
                  ? 'bg-white/80 text-gray-900 placeholder-gray-400 border-gray-200'
                  : 'bg-[#1f1f1f] text-white placeholder-gray-500 border-[#2f2f2f]'
              }`}
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg opacity-30 group-hover:opacity-60 transition-opacity duration-300">
              🔮
            </span>
          </div>

          {!isLogin && (
            <div className="flex items-start gap-2 mt-2">
              <input
                type="checkbox"
                id="rulesAgreement"
                checked={agreedToRules}
                onChange={(e) => setAgreedToRules(e.target.checked)}
                className="mt-1 w-4 h-4 accent-[var(--accent)] cursor-pointer"
              />
              <label htmlFor="rulesAgreement" className={`text-sm ${isLight ? 'text-gray-600' : 'text-gray-300'} cursor-pointer`}>
                Я принимаю{' '}
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onOpenRules();
                  }}
                  style={{ color: 'var(--accent)', textDecoration: 'underline', cursor: 'pointer' }}
                >
                  правила сообщества
                </span>
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || (!isLogin && !agreedToRules)}
            className="w-full py-4 rounded-xl text-white font-semibold text-sm transition-all duration-300 hover:opacity-80 active:scale-[0.98] disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)' }}
          >
            {isLoading ? (
              <>
                <span className="animate-spin inline-block mr-2">👻</span>
                Загрузка...
              </>
            ) : isLogin ? (
              'Войти'
            ) : (
              'Зарегистрироваться'
            )}
          </button>
        </form>

        <p
          onClick={() => setIsLogin(!isLogin)}
          className={`text-sm text-center mt-6 cursor-pointer hover:underline transition-all duration-300 ${
            isLight ? 'text-gray-500 hover:text-[var(--accent)]' : 'text-gray-400 hover:text-white'
          }`}
        >
          {isLogin ? 'Нет аккаунта? Создать' : 'Уже есть аккаунт? Войти'}
        </p>

        <div className="flex items-center justify-center gap-3 mt-8">
          <div className="w-8 h-[2px] bg-[var(--accent)] opacity-30 rounded-full"></div>
          <p className={`text-xs ${isLight ? 'text-gray-400' : 'text-gray-600'}`}>👻 Whisp</p>
          <div className="w-8 h-[2px] bg-[var(--accent)] opacity-30 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ОСНОВНОЙ ЧАТ
// ============================================================
function ChatApp({ username, theme, setTheme, accentColor, setAccentColor }: any) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const [currentChatUser, setCurrentChatUser] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deletingMessageId, setDeletingMessageId] = useState<number | string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState<'chats' | 'chat'>('chats');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const leaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [hoveredMessageId, setHoveredMessageId] = useState<number | string | null>(null);
  const [showReactionsId, setShowReactionsId] = useState<number | string | null>(null);
  const [animatingReactionId, setAnimatingReactionId] = useState<number | string | null>(null);
  const [pendingMessages, setPendingMessages] = useState<Set<string>>(new Set());
  const pendingMessagesRef = useRef<Set<string>>(new Set());
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [, forceUpdate] = useState({});

  // ★★★ LONG PRESS ДЛЯ МОБИЛЬНЫХ (увеличен таймер до 1000 мс) ★★★
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);
  const [isLongPressing, setIsLongPressing] = useState(false);

  const getAvatarColor = (name: string) => {
    if (!name || name.length === 0) return '#6c5ce7';
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#FF8A5C', '#A29BFE'];
    return colors[name.charCodeAt(0) % colors.length];
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функция для удаления дублей сообщений
  const deduplicateMessages = (msgs: Message[]): Message[] => {
    const seen = new Map<number | string, Message>();
    const result: Message[] = [];
    for (const msg of msgs) {
      if (msg.id && typeof msg.id === 'number') {
        if (!seen.has(msg.id)) {
          seen.set(msg.id, msg);
          result.push(msg);
        }
      } else if (msg.tempId) {
        if (!seen.has(msg.tempId)) {
          seen.set(msg.tempId, msg);
          result.push(msg);
        }
      } else {
        result.push(msg);
      }
    }
    return result;
  };

  useEffect(() => {
    if (messages.length > 0) {
      const unique = deduplicateMessages(messages);
      if (unique.length !== messages.length) {
        setMessages(unique);
      }
    }
  }, [messages]);

  // ===================== ЗАГРУЗКА АВАТАРА (СВОЙ) =====================
  const loadAvatar = async () => {
    try {
      const cached = localStorage.getItem(`whisp_avatar_${username}`);
      if (cached) {
        if (!cached.includes('?t=')) {
          const newUrl = cached + '?t=' + Date.now();
          setAvatarUrl(newUrl);
          localStorage.setItem(`whisp_avatar_${username}`, newUrl);
        } else {
          setAvatarUrl(cached);
        }
        return;
      }
      const res = await fetch(`/api/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        const avatarUrl = data.avatarUrl || data.avatar_url;
        if (avatarUrl) {
          const newUrl = avatarUrl + '?t=' + Date.now();
          setAvatarUrl(newUrl);
          localStorage.setItem(`whisp_avatar_${username}`, newUrl);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки аватара:', error);
    }
  };

  // ===================== ЗАГРУЗКА АВАТАРА ДРУГОГО ПОЛЬЗОВАТЕЛЯ =====================
  const fetchUserAvatar = async (user: string): Promise<string | null> => {
    if (user === username) {
      const cached = localStorage.getItem(`whisp_avatar_${username}`);
      if (cached) return cached;
    }
    try {
      const res = await fetch(`/api/profile?username=${encodeURIComponent(user)}&_=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        const avatarUrl = data.avatarUrl || data.avatar_url;
        if (avatarUrl) {
          const newUrl = avatarUrl + '?t=' + Date.now();
          if (user === username) {
            localStorage.setItem(`whisp_avatar_${username}`, newUrl);
          }
          return newUrl;
        }
      }
      return null;
    } catch (error) {
      console.error(`Ошибка загрузки аватара ${user}:`, error);
      return null;
    }
  };

  const updateChatAvatar = (user: string, avatar: string | null) => {
    setChats(prev =>
      prev.map(c =>
        c.otherUser === user ? { ...c, otherUserAvatar: avatar } : c
      )
    );
  };

  const ensureChatAvatar = async (user: string) => {
    if (!user) return;
    const existing = chats.find(c => c.otherUser === user);
    if (existing && existing.otherUserAvatar) return;
    const avatar = await fetchUserAvatar(user);
    if (avatar) {
      updateChatAvatar(user, avatar);
      forceUpdate({});
    }
  };

  // Загрузка списка чатов с аватарками собеседников
  const loadChats = async () => {
    try {
      const res = await fetch(`/api/chats?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        const chatsWithAvatars = await Promise.all(
          data.map(async (chat: Chat) => {
            const avatar = await fetchUserAvatar(chat.otherUser);
            return { ...chat, otherUserAvatar: avatar };
          })
        );
        setChats(chatsWithAvatars);
        forceUpdate({});
      }
    } catch (error) {
      console.error('Ошибка загрузки чатов:', error);
    }
  };

  // Загрузка сообщений
  const loadMessages = async (chatId: number) => {
    try {
      const res = await fetch(`/api/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        const uniqueMessages = data.filter(
          (msg: Message, index: number, self: Message[]) =>
            index === self.findIndex((m) => m.id === msg.id)
        );
        setMessages(uniqueMessages);
        if (uniqueMessages.length > 0) {
          const ids = uniqueMessages.map((m: Message) => m.id);
          try {
            const reactionsRes = await fetch(`/api/reactions?messageIds=${ids.join(',')}`);
            if (reactionsRes.ok) {
              const reactionsData = await reactionsRes.json();
              setMessages((prev) =>
                prev.map((msg) => ({
                  ...msg,
                  reactions: reactionsData.filter((r: any) => r.message_id === msg.id),
                }))
              );
            }
          } catch (error) {
            console.error('Ошибка загрузки реакций:', error);
          }
        }
        if (currentChatUser) {
          await ensureChatAvatar(currentChatUser);
        }
        setTimeout(scrollToBottom, 100);
      }
    } catch (error) {
      console.error('Ошибка загрузки сообщений:', error);
    }
  };

  // Обработчик выбора чата
  const handleChatSelect = async (chat: Chat) => {
    setCurrentChatId(chat.id);
    setCurrentChatUser(chat.otherUser);
    await ensureChatAvatar(chat.otherUser);
    await loadMessages(chat.id);
    if (isMobile) setMobileView('chat');
  };

  // Создание нового чата
  const createChat = async (otherUser: string) => {
    try {
      const res = await fetch('/api/chats', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user1: username, user2: otherUser }),
      });
      if (res.ok) {
        const data = await res.json();
        setSearchQuery('');
        setSearchResults([]);
        setIsSearchOpen(false);
        await loadChats();
        const chatId = data.chatId;
        setCurrentChatId(chatId);
        setCurrentChatUser(otherUser);
        await ensureChatAvatar(otherUser);
        await loadMessages(chatId);
        if (isMobile) setMobileView('chat');
      }
    } catch (error) {
      console.error('Ошибка создания чата:', error);
    }
  };

  // Поиск пользователей
  const searchUsers = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        const existingUsers = chats.map((c) => c.otherUser);
        const filtered = data.filter(
          (u: any) => u.username !== username && !existingUsers.includes(u.username)
        );
        setSearchResults(filtered);
      }
    } catch (error) {
      console.error('Ошибка поиска:', error);
    }
  };

  // Событие обновления аватара
  useEffect(() => {
    const handleAvatarUpdate = () => {
      loadAvatar();
      loadChats();
    };
    window.addEventListener('avatar-updated', handleAvatarUpdate);
    return () => window.removeEventListener('avatar-updated', handleAvatarUpdate);
  }, []);

  // Инициализация
  useEffect(() => {
    loadChats();
    loadAvatar();
  }, []);

  // ===================== ПОДПИСКА НА ОБНОВЛЕНИЯ ПРОФИЛЕЙ (АВАТАРКИ В РЕАЛЬНОМ ВРЕМЕНИ) =====================
  useEffect(() => {
    const profilesChannel = supabase
      .channel('public:profiles')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'profiles' },
        async (payload) => {
          const updatedProfile = payload.new as { username: string; avatar_url: string | null };
          const updatedUser = updatedProfile.username;
          
          const freshAvatar = await fetchUserAvatar(updatedUser);
          
          setChats(prev => 
            prev.map(chat => 
              chat.otherUser === updatedUser 
                ? { ...chat, otherUserAvatar: freshAvatar } 
                : chat
            )
          );
          
          if (updatedUser === username) {
            if (freshAvatar) {
              setAvatarUrl(freshAvatar);
              localStorage.setItem(`whisp_avatar_${username}`, freshAvatar);
            } else {
              setAvatarUrl(null);
            }
          }
          
          forceUpdate({});
        }
      )
      .subscribe();

    return () => {
      profilesChannel.unsubscribe();
    };
  }, [username]);

  // Отправка сообщения
  const sendMessage = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!text.trim() || isSending || !currentChatId) return;
    setIsSending(true);
    const currentText = text;
    setText('');
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const optimisticMessage: Message = {
      id: tempId as any,
      chat_id: currentChatId,
      username: username,
      text: currentText,
      type: 'text',
      avatar_url: avatarUrl,
      tempId: tempId,
      created_at: new Date().toISOString(),
      reactions: [],
    };
    setMessages((prev) => {
      const exists = prev.some(
        (m) => m.tempId === tempId || (m.text === currentText && m.username === username && !m.id)
      );
      if (exists) return prev;
      return [...prev, optimisticMessage];
    });
    pendingMessagesRef.current.add(tempId);
    setPendingMessages((prev) => new Set(prev).add(tempId));
    setTimeout(scrollToBottom, 50);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chatId: currentChatId,
          username,
          text: currentText,
          type: 'text',
          avatar_url: avatarUrl,
          tempId: tempId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => {
          const index = prev.findIndex((msg) => msg.tempId === tempId);
          if (index !== -1) {
            const updated = [...prev];
            const existingIdIndex = updated.findIndex((msg) => msg.id === data.id);
            if (existingIdIndex !== -1 && existingIdIndex !== index) {
              updated.splice(existingIdIndex, 1);
            }
            updated[index] = { ...updated[index], id: data.id, tempId: undefined };
            return updated;
          }
          if (prev.some((msg) => msg.id === data.id)) return prev;
          return [...prev, { ...optimisticMessage, id: data.id, tempId: undefined }];
        });
        pendingMessagesRef.current.delete(tempId);
        setPendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
      } else {
        setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
        pendingMessagesRef.current.delete(tempId);
        setPendingMessages((prev) => {
          const newSet = new Set(prev);
          newSet.delete(tempId);
          return newSet;
        });
        const data = await res.json();
        alert(data.error || 'Ошибка отправки');
      }
    } catch (error) {
      console.error(error);
      setMessages((prev) => prev.filter((msg) => msg.tempId !== tempId));
      pendingMessagesRef.current.delete(tempId);
      setPendingMessages((prev) => {
        const newSet = new Set(prev);
        newSet.delete(tempId);
        return newSet;
      });
    } finally {
      setIsSending(false);
    }
  };

  // ★★★ ЗАГРУЗКА ФАЙЛОВ (ТОЛЬКО ВИДЕО) ★★★
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentChatId) return;

    if (file.type.startsWith('image/')) {
      alert('Отправка изображений запрещена. Разрешены только видео.');
      e.target.value = '';
      return;
    }
    if (!file.type.startsWith('video/')) {
      alert('Разрешены только видеофайлы.');
      e.target.value = '';
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      alert('Файл > 50 МБ');
      e.target.value = '';
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      if (res.ok) {
        const data = await res.json();

        let type: 'image' | 'video' | 'file' = 'file';
        if (file.type.startsWith('image/')) {
          type = 'image';
        } else if (file.type.startsWith('video/')) {
          type = 'video';
        }

        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chatId: currentChatId,
            username,
            text: data.fileUrl,
            type: type,
            fileName: file.name,
            avatar_url: avatarUrl,
          }),
        });

        await loadMessages(currentChatId);
      } else {
        const err = await res.json();
        alert(err.error || 'Ошибка загрузки файла');
      }
    } catch (error) {
      console.error('Ошибка загрузки файла:', error);
      alert('Ошибка соединения при загрузке файла');
    }
  };

  // Голосовые
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await uploadVoice(blob);
        stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setIsRecording(true);
      setRecordingTime(0);
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Нет доступа к микрофону');
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
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
        recordingTimerRef.current = null;
      }
      if (mediaRecorderRef.current.stream) {
        mediaRecorderRef.current.stream.getTracks().forEach((t) => t.stop());
      }
    }
  };

  const uploadVoice = async (blob: Blob) => {
    if (!currentChatId) return;
    const formData = new FormData();
    formData.append('file', blob, 'voice.webm');
    formData.append('username', username);
    try {
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
    }
  };

  // Удаление
  const deleteMessage = async (messageId: number | string) => {
    const isTempId = typeof messageId === 'string' && messageId.startsWith('temp_');
    if (isTempId) {
      setMessages((prev) => prev.filter((msg) => msg.tempId !== messageId));
      return;
    }
    setDeletingMessageId(messageId);
    setTimeout(async () => {
      try {
        const res = await fetch('/api/messages/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, username }),
        });
        if (res.ok) {
          setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
        } else {
          const data = await res.json();
          alert(data.error || 'Ошибка удаления');
        }
      } catch (error) {
        console.error('Ошибка удаления:', error);
      }
      setDeletingMessageId(null);
    }, 350);
  };

  // Реакции
  const toggleReaction = async (messageId: number | string, emoji: string) => {
    const isTempId = typeof messageId === 'string' && messageId.startsWith('temp_');
    if (isTempId) return;
    try {
      const msg = messages.find((m) => m.id === messageId);
      if (!msg) return;
      const userReaction = msg.reactions?.find((r) => r.username === username);
      setAnimatingReactionId(messageId);
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id === messageId) {
            const currentReactions = m.reactions || [];
            const existing = currentReactions.find((r) => r.username === username);
            if (existing?.reaction === emoji) {
              return { ...m, reactions: currentReactions.filter((r) => r.username !== username) };
            } else if (existing) {
              return {
                ...m,
                reactions: currentReactions.map((r) =>
                  r.username === username ? { ...r, reaction: emoji } : r
                ),
              };
            } else {
              return {
                ...m,
                reactions: [
                  ...currentReactions,
                  { id: Date.now(), message_id: messageId as number, username, reaction: emoji },
                ],
              };
            }
          }
          return m;
        })
      );
      if (userReaction?.reaction === emoji) {
        await fetch('/api/reactions/delete', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, username }),
        });
      } else {
        await fetch('/api/reactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messageId, username, reaction: emoji }),
        });
      }
      if (isMobile) {
        setShowReactionsId(null);
        setHoveredMessageId(null);
      }
      setTimeout(() => {
        setAnimatingReactionId(null);
      }, 300);
    } catch (error) {
      console.error('Ошибка реакции:', error);
      setAnimatingReactionId(null);
    }
  };

  // ★★★ ОБРАБОТЧИКИ ДОЛГОГО НАЖАТИЯ (1000 мс) ★★★
  const handleTouchStart = (messageId: number | string) => {
    const timer = setTimeout(() => {
      setIsLongPressing(true);
      setShowReactionsId(messageId);
      setHoveredMessageId(messageId);
    }, 1000);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
    setIsLongPressing(false);
  };

  // Hover для десктопа
  const handleMouseEnter = (messageId: number | string) => {
    if (isMobile) return;
    setHoveredMessageId(messageId);
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
      leaveTimeoutRef.current = null;
    }
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setShowReactionsId(messageId);
    }, 300);
  };

  const handleMouseLeave = () => {
    if (isMobile) return;
    setHoveredMessageId(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    if (leaveTimeoutRef.current) {
      clearTimeout(leaveTimeoutRef.current);
    }
    leaveTimeoutRef.current = setTimeout(() => {
      setShowReactionsId(null);
      leaveTimeoutRef.current = null;
    }, 200);
  };

  const toggleReactionsMobile = (messageId: number | string) => {
    if (showReactionsId === messageId) {
      setShowReactionsId(null);
      setHoveredMessageId(null);
    } else {
      setShowReactionsId(messageId);
      setHoveredMessageId(messageId);
    }
  };

  // Realtime подписки
  useEffect(() => {
    if (!currentChatId) return;

    const messagesChannel = supabase
      .channel('public:messages')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const newMsg = payload.new as Message;
          if (newMsg.chat_id === currentChatId) {
            setMessages((prev) => {
              if (newMsg.id && prev.some((m) => m.id === newMsg.id)) return prev;
              if (newMsg.username === username && newMsg.text) {
                const filtered = prev.filter(
                  (m) => !(m.username === username && !m.id && m.text === newMsg.text)
                );
                if (filtered.length !== prev.length) {
                  return [...filtered, newMsg];
                }
              }
              return [...prev, newMsg];
            });
            if (newMsg.username !== username) {
              ensureChatAvatar(newMsg.username);
            }
            setTimeout(scrollToBottom, 50);
          }
        }
      )
      .subscribe();

    const deleteChannel = supabase
      .channel('public:messages:delete')
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages' },
        (payload) => {
          const deleted = payload.old as Message;
          if (deleted.chat_id === currentChatId) {
            setMessages((prev) => prev.filter((msg) => msg.id !== deleted.id));
          }
        }
      )
      .subscribe();

    const reactionsChannel = supabase
      .channel('public:reactions')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reactions' },
        async () => {
          const currentMessages = messages.filter((m) => typeof m.id === 'number');
          if (currentMessages.length === 0) return;
          const ids = currentMessages.map((m) => m.id);
          try {
            const res = await fetch(`/api/reactions?messageIds=${ids.join(',')}`);
            if (res.ok) {
              const data = await res.json();
              setMessages((prev) =>
                prev.map((msg) => {
                  const msgId = msg.id;
                  const isTempId = typeof msgId === 'string' && (msgId as string).startsWith('temp_');
                  if (isTempId) return msg;
                  return {
                    ...msg,
                    reactions: data.filter((r: any) => r.message_id === msg.id),
                  };
                })
              );
            }
          } catch (error) {
            console.error('Ошибка загрузки реакций:', error);
          }
        }
      )
      .subscribe();

    return () => {
      messagesChannel.unsubscribe();
      deleteChannel.unsubscribe();
      reactionsChannel.unsubscribe();
    };
  }, [currentChatId, messages, username]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  const formatTime = (date?: string) => {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  const isLight = theme === 'light';

  const handleProfileClick = (user: string) => {
    if (user) {
      setIsSearchOpen(false);
      setSearchQuery('');
      setSearchResults([]);
      setIsSettingsOpen(false);
      setProfileUsername(user);
      setIsProfileOpen(true);
    }
  };

  // ============================================================
  // РЕНДЕР ОДНОГО СООБЩЕНИЯ
  // ============================================================
  const renderMessage = (msg: Message) => {
    const isMy = msg.username === username;
    const msgReactions = msg.reactions || [];
    const groupedReactions = msgReactions.reduce((acc: any, r: Reaction) => {
      acc[r.reaction] = (acc[r.reaction] || 0) + 1;
      return acc;
    }, {});
    const userReaction = msgReactions.find((r) => r.username === username)?.reaction;
    const isDeleting = deletingMessageId === msg.id || deletingMessageId === msg.tempId;
    const showReactions = showReactionsId === msg.id || showReactionsId === msg.tempId;
    const isHovered = hoveredMessageId === msg.id || hoveredMessageId === msg.tempId;
    const isAnimating = animatingReactionId === msg.id;
    const isPending = msg.tempId ? pendingMessages.has(msg.tempId) : false;
    const key = msg.id ? `msg-${msg.id}` : `msg-temp-${msg.tempId || Math.random()}`;

    let senderAvatar = !isMy
      ? chats.find((c) => c.otherUser === msg.username)?.otherUserAvatar
      : null;

    return (
      <div
        key={key}
        className={`flex items-end gap-3 ${isMy ? 'flex-row-reverse' : ''} relative ${
          isPending ? 'animate-pulse opacity-70' : ''
        } ${!isPending && !isDeleting ? 'animate-slideUp' : ''} ${isDeleting ? 'animate-delete' : ''}`}
        onMouseEnter={() => !isMobile && handleMouseEnter(msg.id || msg.tempId || key)}
        onMouseLeave={() => !isMobile && handleMouseLeave()}
        onTouchStart={() => isMobile && handleTouchStart(msg.id || msg.tempId || key)}
        onTouchEnd={() => isMobile && handleTouchEnd()}
        onTouchMove={() => isMobile && handleTouchMove()}
        onContextMenu={(e) => {
          e.preventDefault();
          if (isMobile) {
            setShowReactionsId(msg.id || msg.tempId || key);
            setHoveredMessageId(msg.id || msg.tempId || key);
          }
        }}
      >
        {!isMy && (
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: senderAvatar ? 'transparent' : getAvatarColor(msg.username) }}
            onClick={(e) => {
              e.stopPropagation();
              handleProfileClick(msg.username);
            }}
          >
            {senderAvatar ? (
              <img src={senderAvatar} alt={msg.username} className="w-full h-full object-cover" />
            ) : (
              msg.username?.charAt(0).toUpperCase() || '?'
            )}
          </div>
        )}
        <div className={`max-w-[80%] ${isMy ? 'flex flex-col items-end' : ''}`}>
          {!isMy && (
            <span
              className={`text-sm font-medium ml-2 mb-1 cursor-pointer hover:underline ${
                isLight ? 'text-gray-600' : 'text-gray-400'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleProfileClick(msg.username);
              }}
            >
              {msg.username}
            </span>
          )}

          <div className="relative flex flex-col items-start gap-1 w-full">
            <div className="flex items-center gap-2 w-full">
              {isMy && (isHovered || showReactions) && !isMobile && !isPending && !isDeleting && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteMessage(msg.id || msg.tempId || key);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-base transition-all hover:scale-110 ${
                    isLight
                      ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      : 'bg-[#2b2b2b] text-gray-400 hover:bg-[#3b3b3b]'
                  }`}
                  title="Удалить"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              )}
              <div
                className={`px-6 py-4 rounded-2xl text-base break-words ${
                  isMy
                    ? 'bg-[var(--accent)] text-white rounded-br-sm'
                    : isLight
                    ? 'bg-white text-gray-900 rounded-bl-sm shadow-md'
                    : 'bg-[#2b2b2b] text-white rounded-bl-sm'
                }`}
                style={{ maxWidth: '100%', wordBreak: 'break-word' }}
              >
                {msg.type === 'image' && (
                  <img
                    src={msg.text}
                    alt="Фото"
                    className="rounded-xl"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      width: 'auto',
                      height: 'auto',
                    }}
                  />
                )}
                {msg.type === 'video' && (
                  <video
                    src={msg.text}
                    controls
                    className="rounded-xl"
                    style={{ maxWidth: '100%', maxHeight: '300px' }}
                  />
                )}
                {msg.type === 'voice' && (
                  <div className="flex items-center gap-3">
                    <audio controls src={msg.text} className="h-12" />
                    {msg.duration && <span className="text-sm opacity-70">{msg.duration}с</span>}
                  </div>
                )}
                {(!msg.type || msg.type === 'text') && <span className="text-base">{msg.text}</span>}
                {isPending && <span className="inline-block ml-2 text-xs opacity-50 animate-pulse">⏳</span>}
              </div>
            </div>

            {(isHovered || showReactions) && !isPending && !isDeleting && (
              <div
                className={`flex gap-0.5 bg-[#1f1f1f] rounded-full px-2 py-1 shadow-lg border border-[#2f2f2f] z-10 transition-all duration-300 ${
                  showReactions ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
                style={{
                  position: isMobile ? 'relative' : 'absolute',
                  ...(isMobile
                    ? { marginTop: '4px', alignSelf: isMy ? 'flex-end' : 'flex-start' }
                    : isMy
                    ? { right: '100%', marginRight: '8px' }
                    : { left: '100%', marginLeft: '8px' }),
                  top: isMobile ? 'auto' : '50%',
                  transform: showReactions
                    ? isMobile
                      ? 'scale(1)'
                      : 'translateY(-50%) scale(1)'
                    : isMobile
                    ? 'scale(0.95)'
                    : 'translateY(-50%) scale(0.95)',
                  maxWidth: isMobile ? '100%' : '200px',
                  overflow: 'visible',
                  whiteSpace: isMobile ? 'normal' : 'nowrap',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  justifyContent: isMy ? 'flex-end' : 'flex-start',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {['❤️', '🔥', '😂', '😢', '👍'].map((emoji) => (
                  <button
                    key={`${msg.id || msg.tempId}-${emoji}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleReaction(msg.id || msg.tempId || key, emoji);
                    }}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-base transition-all hover:scale-125 active:scale-90 ${
                      userReaction === emoji ? 'bg-[var(--accent)]/30 scale-110' : ''
                    } ${isAnimating ? 'animate-bounce' : ''}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            )}
          </div>

          {Object.keys(groupedReactions).length > 0 && !isPending && (
            <div className={`flex flex-wrap gap-1.5 mt-1 ${isMy ? 'justify-end' : ''}`}>
              {Object.entries(groupedReactions).map(([emoji, count]) => (
                <span
                  key={`${msg.id || msg.tempId}-${emoji}-count`}
                  className={`text-sm px-2 py-0.5 rounded-full ${
                    isLight ? 'bg-gray-200 text-gray-700' : 'bg-[#2b2b2b] text-gray-300'
                  }`}
                >
                  {emoji} {count as number}
                </span>
              ))}
            </div>
          )}

          <div className={`flex items-center gap-2 mt-1 ${isMy ? 'flex-row-reverse' : ''}`}>
            <span className={`text-xs ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
              {msg.tempId ? 'Отправка...' : formatTime(msg.created_at)}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // ============================================================
  // МОБИЛЬНАЯ ВЕРСИЯ
  // ============================================================
  if (isMobile) {
    const bgColor = isLight ? '#ffffff' : '#0a0a0a';
    const textPrimary = isLight ? '#000000' : '#ffffff';
    const textSecondary = isLight ? '#8e8e93' : '#8e8e93';
    const borderColor = isLight ? '#d1d1d6' : '#38383a';
    const headerBg = isLight ? 'rgba(255,255,255,0.9)' : 'rgba(28,28,30,0.9)';
    const inputFieldBg = isLight ? '#f0f0f0' : '#2c2c2e';
    const messagesBg = isLight ? '#f0f2f5' : '#0a0a0a';

    return (
      <>
        {isProfileOpen && (
          <UserProfileModal
            username={profileUsername}
            currentUsername={username}
            onClose={() => setIsProfileOpen(false)}
            theme={theme}
            avatarUrl={avatarUrl}
            userAvatar={chats.find((c) => c.otherUser === profileUsername)?.otherUserAvatar || null}
          />
        )}
        {isSettingsOpen && (
          <SettingsModal
            username={username}
            avatarUrl={avatarUrl}
            setAvatarUrl={setAvatarUrl}
            onClose={() => setIsSettingsOpen(false)}
            theme={theme}
            setTheme={setTheme}
            accentColor={accentColor}
            setAccentColor={setAccentColor}
            setIsAuth={() => {
              localStorage.removeItem('whisp_username');
              window.location.reload();
            }}
            openRules={() => setIsRulesOpen(true)}
          />
        )}
        {isRulesOpen && (
          <RulesModal
            onClose={() => setIsRulesOpen(false)}
            theme={theme}
          />
        )}
        <div
          style={{
            backgroundColor: bgColor,
            color: textPrimary,
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            overflowX: 'hidden',
          }}
        >
          {mobileView === 'chats' && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 16px',
                  paddingTop: 'max(12px, env(safe-area-inset-top))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderBottom: `1px solid ${borderColor}`,
                  flexShrink: 0,
                  position: 'sticky',
                  top: 0,
                  zIndex: 50,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    onClick={() => {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                      setIsProfileOpen(false);
                      setIsSettingsOpen(true);
                    }}
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: accentColor,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '16px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      username?.charAt(0).toUpperCase() || '?'
                    )}
                  </div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '18px' }}>Whisp</div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>👻 {username}</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsProfileOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  style={{
                    padding: '8px',
                    border: 'none',
                    background: 'none',
                    color: textPrimary,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </button>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '8px 12px',
                  paddingBottom: '80px',
                  backgroundColor: bgColor,
                  overflowX: 'hidden',
                }}
              >
                {chats.map((chat) => {
                  const name = chat.otherUser;
                  const friendAvatar = chat.otherUserAvatar;
                  return (
                    <div
                      key={chat.id}
                      onClick={() => handleChatSelect(chat)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px 14px',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        marginBottom: '2px',
                        backgroundColor: 'transparent',
                      }}
                    >
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '50%',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '20px',
                          fontWeight: 600,
                          color: 'white',
                          background: friendAvatar ? 'transparent' : accentColor,
                          overflow: 'hidden',
                        }}
                      >
                        {friendAvatar ? (
                          <img src={friendAvatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          name?.charAt(0).toUpperCase() || '?'
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 500, fontSize: '16px', color: textPrimary }}>{name}</div>
                        {chat.lastMessage && (
                          <div
                            style={{
                              fontSize: '13px',
                              color: textSecondary,
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                            }}
                          >
                            {chat.lastMessage}
                          </div>
                        )}
                      </div>
                      {chat.lastMessageTime && (
                        <div
                          style={{
                            fontSize: '11px',
                            color: textSecondary,
                            flexShrink: 0,
                            marginLeft: '8px',
                          }}
                        >
                          {formatTime(new Date(chat.lastMessageTime).toISOString())}
                        </div>
                      )}
                    </div>
                  );
                })}
                <div
                  style={{
                    textAlign: 'center',
                    padding: '12px 16px 4px',
                    fontSize: '11px',
                    color: textSecondary,
                    opacity: 0.6,
                  }}
                >
                  👻 Проект для школы. Автор не несёт ответственности за содержание сообщений.
                  <br />
                  <span
                    onClick={() => {
                      setIsRulesOpen(true);
                    }}
                    style={{
                      color: accentColor,
                      textDecoration: 'underline',
                      cursor: 'pointer',
                      opacity: 0.8,
                    }}
                  >
                    📜 Правила сообщества
                  </span>
                </div>
              </div>

              {/* НИЖНИЙ ТАББАР - УДАЛЕНА КНОПКА ПРОФИЛЬ */}
              <div
                style={{
                  position: 'fixed',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  display: 'flex',
                  justifyContent: 'space-around',
                  alignItems: 'center',
                  padding: '8px 0',
                  paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderTop: `1px solid ${borderColor}`,
                  zIndex: 100,
                }}
              >
                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsProfileOpen(false);
                    setIsSettingsOpen(false);
                    setMobileView('chats');
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '4px 16px',
                    border: 'none',
                    background: 'none',
                    color: mobileView === 'chats' ? accentColor : textSecondary,
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill={mobileView === 'chats' ? accentColor : 'none'}
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <span>Чаты</span>
                </button>

                <button
                  onClick={() => {
                    if (isSearchOpen) {
                      setIsSearchOpen(false);
                      setSearchQuery('');
                      setSearchResults([]);
                    } else {
                      setIsProfileOpen(false);
                      setIsSettingsOpen(false);
                      setIsSearchOpen(true);
                    }
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '4px 16px',
                    border: 'none',
                    background: 'none',
                    color: isSearchOpen ? accentColor : textSecondary,
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span>Поиск</span>
                </button>

                <button
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsProfileOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '2px',
                    padding: '4px 16px',
                    border: 'none',
                    background: 'none',
                    color: textSecondary,
                    fontSize: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                  }}
                >
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                  <span>Настройки</span>
                </button>
              </div>

              {isSearchOpen && (
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: bgColor,
                    zIndex: 200,
                    padding: '20px 16px',
                    paddingTop: 'max(20px, env(safe-area-inset-top))',
                    overflowX: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <button
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      style={{
                        padding: '8px',
                        border: 'none',
                        background: 'none',
                        color: textPrimary,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      placeholder="Поиск..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        searchUsers(e.target.value);
                      }}
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: inputFieldBg,
                        color: textPrimary,
                        fontSize: '15px',
                        outline: 'none',
                      }}
                      autoFocus
                    />
                  </div>
                  {searchResults.length > 0 && (
                    <div>
                      {searchResults.map((user) => (
                        <div
                          key={user.username}
                          onClick={() => createChat(user.username)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '12px 14px',
                            borderRadius: '12px',
                            cursor: 'pointer',
                          }}
                        >
                          <div
                            style={{
                              width: '44px',
                              height: '44px',
                              borderRadius: '50%',
                              background: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'white',
                              fontSize: '18px',
                              fontWeight: 600,
                            }}
                          >
                            {user.username?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500, color: textPrimary }}>{user.username}</div>
                            <div style={{ fontSize: '12px', color: textSecondary }}>Начать чат</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {searchResults.length === 0 && searchQuery && (
                    <div style={{ textAlign: 'center', color: textSecondary, marginTop: '40px' }}>
                      Пользователи не найдены
                    </div>
                  )}
                </div>
              )}
            </>
          )}

          {mobileView === 'chat' && currentChatId && (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '8px 12px',
                  paddingTop: 'max(8px, env(safe-area-inset-top))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderBottom: `1px solid ${borderColor}`,
                  gap: '10px',
                  flexShrink: 0,
                  position: 'sticky',
                  top: 0,
                  zIndex: 50,
                }}
              >
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    setIsSettingsOpen(false);
                    setIsSearchOpen(false);
                    setMobileView('chats');
                    setCurrentChatId(null);
                  }}
                  style={{
                    padding: '6px',
                    border: 'none',
                    background: 'none',
                    color: textPrimary,
                    cursor: 'pointer',
                  }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div
                  onClick={() => {
                    setIsSearchOpen(false);
                    setSearchQuery('');
                    setSearchResults([]);
                    setIsSettingsOpen(false);
                    setProfileUsername(currentChatUser);
                    setIsProfileOpen(true);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    flex: 1,
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 600,
                      fontSize: '16px',
                      overflow: 'hidden',
                      flexShrink: 0,
                      background: 'transparent',
                    }}
                  >
                    {(() => {
                      const chat = chats.find((c) => c.otherUser === currentChatUser);
                      const friendAvatar = chat?.otherUserAvatar;
                      if (currentChatUser === username) {
                        return avatarUrl ? (
                          <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {username?.charAt(0).toUpperCase() || '?'}
                          </div>
                        );
                      } else {
                        return friendAvatar ? (
                          <img src={friendAvatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              background: accentColor,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {currentChatUser?.charAt(0).toUpperCase() || '?'}
                          </div>
                        );
                      }
                    })()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, fontSize: '16px', color: textPrimary }}>{currentChatUser}</div>
                    <div style={{ fontSize: '12px', color: textSecondary }}>👻 Нажмите для профиля</div>
                  </div>
                </div>
              </div>
              <div
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  padding: '12px 16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  backgroundColor: messagesBg,
                  overflowX: 'hidden',
                }}
              >
                {messages.map((msg) => renderMessage(msg))}
                <div ref={messagesEndRef} />
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '8px',
                  padding: '8px 12px',
                  paddingBottom: 'max(8px, env(safe-area-inset-bottom))',
                  background: headerBg,
                  backdropFilter: 'blur(20px)',
                  WebkitBackdropFilter: 'blur(20px)',
                  borderTop: `1px solid ${borderColor}`,
                  flexShrink: 0,
                }}
              >
                <label style={{ cursor: 'pointer', padding: '4px' }}>
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    style={{ color: textSecondary }}
                  >
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                    accept="video/*"
                  />
                </label>
                {!isRecording ? (
                  <>
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      placeholder="Сообщение..."
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        borderRadius: '20px',
                        border: 'none',
                        background: inputFieldBg,
                        color: textPrimary,
                        fontSize: '15px',
                        outline: 'none',
                        minHeight: '40px',
                      }}
                    />
                    <button
                      type="button"
                      onClick={startRecording}
                      style={{
                        padding: '8px',
                        border: 'none',
                        background: 'none',
                        color: textSecondary,
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        sendMessage();
                      }}
                      disabled={isSending || !text.trim()}
                      style={{
                        padding: '10px 16px',
                        borderRadius: '50%',
                        border: 'none',
                        background: accentColor,
                        color: 'white',
                        cursor: 'pointer',
                        opacity: isSending || !text.trim() ? 0.5 : 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '14px', fontFamily: 'monospace', color: textPrimary }}>
                      {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                      {String(recordingTime % 60).padStart(2, '0')}
                    </span>
                    <button
                      type="button"
                      onClick={cancelRecording}
                      style={{
                        color: 'red',
                        padding: '4px',
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                      }}
                    >
                      ✕
                    </button>
                    <button
                      type="button"
                      onClick={stopRecording}
                      style={{
                        color: 'green',
                        padding: '4px',
                        background: 'none',
                        border: 'none',
                        fontSize: '18px',
                        cursor: 'pointer',
                      }}
                    >
                      ●
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // ============================================================
  // ДЕСКТОПНАЯ ВЕРСИЯ
  // ============================================================
  return (
    <div className={`h-dvh flex overflow-hidden ${isLight ? 'bg-gray-100' : 'bg-[#1c1515]'}`}>
      <div
        className={`${
          isMobileMenuOpen ? 'absolute inset-0 z-50 flex' : 'hidden md:flex'
        } md:relative md:z-0 md:flex flex-col w-[320px] max-w-[85vw] md:max-w-[320px] flex-shrink-0 ${
          isLight ? 'bg-white' : 'bg-[#1f1f1f]'
        } border-r ${isLight ? 'border-gray-200' : 'border-[#2b2b2b]'}`}
      >
        <div className={`flex items-center justify-between p-4 ${isLight ? 'bg-gray-50' : 'bg-[#1f1f1f]'}`}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleProfileClick(username)}
              className="w-10 h-10 rounded-full overflow-hidden bg-[var(--accent)] flex items-center justify-center text-white font-bold text-sm"
            >
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{username?.charAt(0).toUpperCase() || '?'}</span>
              )}
            </button>
            <span className={`font-semibold ${isLight ? 'text-gray-900' : 'text-white'}`}>{username}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                setIsSearchOpen(!isSearchOpen);
                if (!isSearchOpen) {
                  setSearchResults([]);
                  setIsProfileOpen(false);
                  setIsSettingsOpen(false);
                }
              }}
              className="p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all"
            >
              <svg
                className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>
            <button
              onClick={() => {
                setIsProfileOpen(false);
                setIsSettingsOpen(true);
              }}
              className="p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all"
            >
              <svg
                className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                />
              </svg>
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden p-2 rounded-full hover:bg-gray-700/20 transition-all"
            >
              <svg
                className={`w-5 h-5 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        {isSearchOpen && (
          <div className={`px-4 py-2 ${isLight ? 'bg-gray-50' : 'bg-[#1f1f1f]'}`}>
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                searchUsers(e.target.value);
              }}
              className={`w-full p-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all ${
                isLight
                  ? 'bg-white text-gray-900 placeholder-gray-400'
                  : 'bg-[#2b2b2f] text-white placeholder-gray-500'
              }`}
            />
            {searchResults.length > 0 && (
              <div className="mt-2 space-y-1">
                {searchResults.map((user) => (
                  <button
                    key={user.username}
                    onClick={() => createChat(user.username)}
                    className={`w-full flex items-center gap-3 p-2 rounded-xl transition-all ${
                      isLight ? 'hover:bg-gray-200' : 'hover:bg-[#2b2b2f]'
                    }`}
                  >
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getAvatarColor(user.username) }}
                    >
                      {user.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                    <span className={`text-sm ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {user.username}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const name = chat.otherUser;
            const friendAvatar = chat.otherUserAvatar;
            return (
              <button
                key={chat.id}
                onClick={() => handleChatSelect(chat)}
                className={`w-full flex items-center gap-3 p-3 transition-all ${
                  currentChatId === chat.id
                    ? isLight
                      ? 'bg-gray-200'
                      : 'bg-[#2b2b2f]'
                    : 'hover:bg-[var(--accent)]/5'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center text-white font-bold text-lg overflow-hidden"
                  style={{ background: friendAvatar ? 'transparent' : accentColor }}
                >
                  {friendAvatar ? (
                    <img src={friendAvatar} alt={name} className="w-full h-full object-cover" />
                  ) : (
                    name?.charAt(0).toUpperCase() || '?'
                  )}
                </div>
                <div className="flex-1 text-left min-w-0">
                  <div className="flex items-center justify-between">
                    <span className={`font-medium text-sm truncate ${isLight ? 'text-gray-900' : 'text-white'}`}>
                      {name}
                    </span>
                    <span className={`text-xs flex-shrink-0 ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                      {chat.lastMessageTime ? formatTime(new Date(chat.lastMessageTime).toISOString()) : ''}
                    </span>
                  </div>
                  {chat.lastMessage && (
                    <span className={`text-xs truncate block ${isLight ? 'text-gray-500' : 'text-gray-400'}`}>
                      {chat.lastMessage}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
          <div className={`text-center text-xs py-2 px-4 ${isLight ? 'text-gray-400' : 'text-gray-500'} opacity-60`}>
            👻 Проект для школы. Автор не несёт ответственности за содержание сообщений.
            <br />
            <span
              onClick={() => setIsRulesOpen(true)}
              style={{
                color: accentColor,
                textDecoration: 'underline',
                cursor: 'pointer',
                opacity: 0.8,
              }}
            >
              📜 Правила сообщества
            </span>
          </div>
        </div>
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        {currentChatId ? (
          <>
            <header
              className={`flex items-center gap-3 p-3 flex-shrink-0 cursor-pointer ${
                isLight ? 'bg-gray-50 border-b border-gray-200' : 'bg-[#1f1f1f] border-b border-[#2b2b2b]'
              }`}
            >
              <button
                onClick={() => {
                  if (window.innerWidth < 768) setIsMobileMenuOpen(true);
                }}
                className="md:hidden p-1 rounded-full hover:bg-gray-700/20 transition-all"
              >
                <svg
                  className={`w-6 h-6 ${isLight ? 'text-gray-700' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 cursor-pointer flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: 'transparent' }}
                  onClick={() => handleProfileClick(currentChatUser)}
                >
                  {(() => {
                    const chat = chats.find((c) => c.otherUser === currentChatUser);
                    const friendAvatar = chat?.otherUserAvatar;
                    if (currentChatUser === username) {
                      return avatarUrl ? (
                        <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: accentColor }}
                        >
                          {username?.charAt(0).toUpperCase() || '?'}
                        </div>
                      );
                    } else {
                      return friendAvatar ? (
                        <img src={friendAvatar} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center"
                          style={{ backgroundColor: accentColor }}
                        >
                          {currentChatUser?.charAt(0).toUpperCase() || '?'}
                        </div>
                      );
                    }
                  })()}
                </div>
                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => handleProfileClick(currentChatUser)}>
                  <span className={`font-medium ${isLight ? 'text-gray-900' : 'text-white'}`}>{currentChatUser}</span>
                  <p className={`text-xs truncate ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>
                    👻 Нажмите для просмотра профиля
                  </p>
                </div>
              </div>
            </header>
            <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-3 messages-container" style={{ overflowX: 'hidden' }}>
              {messages.map((msg) => renderMessage(msg))}
              <div ref={messagesEndRef} />
            </div>
            <form
              onSubmit={sendMessage}
              className={`flex items-end gap-2 p-3 flex-shrink-0 ${
                isLight ? 'bg-gray-50 border-t border-gray-200' : 'bg-[#1f1f1f] border-t border-[#2b2b2b]'
              }`}
            >
              <label className="cursor-pointer p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all">
                <svg
                  className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
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
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="video/*"
                />
              </label>
              {!isRecording ? (
                <>
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Напишите сообщение..."
                    className={`flex-1 p-3 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-[var(--accent)] transition-all ${
                      isLight
                        ? 'bg-white text-gray-900 placeholder-gray-400'
                        : 'bg-[#2b2b2b] text-white placeholder-gray-500'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={startRecording}
                    className="p-2 rounded-full hover:bg-[var(--accent)]/10 transition-all"
                  >
                    <svg
                      className={`w-5 h-5 ${isLight ? 'text-gray-600' : 'text-gray-400'}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                      />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    disabled={isSending || !text.trim()}
                    className="p-3 rounded-full text-white disabled:opacity-50 transition-all hover:scale-105 active:scale-95"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                    </svg>
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-3 flex-1">
                  <span className={`text-sm font-mono ${isLight ? 'text-gray-900' : 'text-white'}`}>
                    {String(Math.floor(recordingTime / 60)).padStart(2, '0')}:
                    {String(recordingTime % 60).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={cancelRecording}
                    className="text-red-500 p-2 transition-all hover:scale-110"
                  >
                    ✕
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="text-green-500 p-2 transition-all hover:scale-110"
                  >
                    ●
                  </button>
                </div>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center flex-col gap-4">
            <div className="relative">
              <GhostIcon
                className={`w-32 h-36 ${isLight ? 'text-[var(--accent)]' : 'text-white'} opacity-30`}
                size="large"
              />
              <div className="absolute inset-0 -m-8 rounded-full border-4 border-[var(--accent)] animate-ping opacity-10"></div>
            </div>
            <span className="text-2xl font-bold text-[var(--accent)]">Whisp</span>
            <span className={`text-sm ${isLight ? 'text-gray-400' : 'text-gray-500'}`}>👻 Выберите чат</span>
          </div>
        )}
      </div>
      {isProfileOpen && (
        <UserProfileModal
          username={profileUsername}
          currentUsername={username}
          onClose={() => setIsProfileOpen(false)}
          theme={theme}
          avatarUrl={avatarUrl}
          userAvatar={chats.find((c) => c.otherUser === profileUsername)?.otherUserAvatar || null}
        />
      )}
      {isSettingsOpen && (
        <SettingsModal
          username={username}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
          onClose={() => setIsSettingsOpen(false)}
          theme={theme}
          setTheme={setTheme}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
          setIsAuth={() => {
            localStorage.removeItem('whisp_username');
            window.location.reload();
          }}
          openRules={() => setIsRulesOpen(true)}
        />
      )}
      {isRulesOpen && (
        <RulesModal
          onClose={() => setIsRulesOpen(false)}
          theme={theme}
        />
      )}
    </div>
  );
}

// ============================================================
// ГЛАВНЫЙ КОМПОНЕНТ – ЭКСПОРТ
// ============================================================
export default function HomePage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [accentColor, setAccentColor] = useState('#7c3aed');
  const [isRulesOpen, setIsRulesOpen] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('whisp_theme') as 'dark' | 'light' || 'dark';
    const savedAccent = localStorage.getItem('whisp_accent') || '#7c3aed';
    setTheme(savedTheme);
    setAccentColor(savedAccent);
    document.documentElement.style.setProperty('--accent', savedAccent);

    const savedUsername = localStorage.getItem('whisp_username');
    if (savedUsername) {
      fetch(`/api/profile?username=${savedUsername}`)
        .then((res) => {
          if (res.ok) {
            setIsAuth(true);
            setUsername(savedUsername);
          } else {
            localStorage.removeItem('whisp_username');
          }
        })
        .catch(() => localStorage.removeItem('whisp_username'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) return <LoadingScreen theme={theme} />;
  if (isAuth) {
    return (
      <>
        <ChatApp
          username={username}
          theme={theme}
          setTheme={setTheme}
          accentColor={accentColor}
          setAccentColor={setAccentColor}
        />
        {isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} theme={theme} />}
      </>
    );
  }

  return (
    <>
      <AuthForm
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        setIsAuth={setIsAuth}
        theme={theme}
        accentColor={accentColor}
        onOpenRules={() => setIsRulesOpen(true)}
      />
      {isRulesOpen && <RulesModal onClose={() => setIsRulesOpen(false)} theme={theme} />}
    </>
  );
              }
