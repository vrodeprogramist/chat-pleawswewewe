'use client';

import { useState, useRef, useEffect } from 'react';

interface AvatarProps {
  username: string;
  size?: number;
  avatarUrl?: string | null;
  onAvatarChange?: (newUrl: string) => void;
  isOwn?: boolean;
}

export default function Avatar({ 
  username, 
  size = 40, 
  avatarUrl: initialAvatarUrl,
  onAvatarChange,
  isOwn = false
}: AvatarProps) {
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialAvatarUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null);
  }, [initialAvatarUrl]);

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#FF8A5C', '#A29BFE', '#FD79A8', '#00CEC9',
  ];
  
  const index = username.charCodeAt(0) % colors.length;
  const bgColor = colors[index];
  const initial = username.charAt(0).toUpperCase();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert('Файл слишком большой. Максимум 5 МБ.');
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('username', username);

    try {
      const res = await fetch('/api/upload-avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      if (res.ok) {
        setAvatarUrl(data.avatarUrl);
        if (onAvatarChange) {
          onAvatarChange(data.avatarUrl);
        }
      } else {
        alert(data.error || 'Ошибка загрузки аватарки');
      }
    } catch (error) {
      console.error('Ошибка загрузки аватарки:', error);
      alert('Ошибка соединения с сервером');
    } finally {
      setIsLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClick = () => {
    if (isOwn && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <>
      <div
        className={`rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${
          isOwn ? 'cursor-pointer hover:opacity-80' : ''
        } transition-opacity relative`}
        style={{
          width: size,
          height: size,
          backgroundColor: avatarUrl ? 'transparent' : bgColor,
          fontSize: size * 0.45,
        }}
        onClick={handleClick}
        title={isOwn ? 'Нажми, чтобы изменить аватарку' : ''}
      >
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          initial
        )}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
            <span className="text-white text-xs">...</span>
          </div>
        )}
      </div>
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept="image/*"
        onChange={handleFileUpload}
      />
    </>
  );
}