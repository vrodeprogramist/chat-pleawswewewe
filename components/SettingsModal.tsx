'use client';

import { useState } from 'react';
import Avatar from './Avatar';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  username: string;
  chatColor: string;
  onColorChange: (color: string) => void;
  onAvatarChange: (url: string) => void;
}

const colors = [
  '#1c1212', '#1a1a2e', '#16213e', '#0f3460', '#2c3e50',
  '#4a2c2c', '#2d4a2c', '#2c3e50', '#4a2c4a', '#2c4a4a',
];

export default function SettingsModal({
  isOpen,
  onClose,
  username,
  chatColor,
  onColorChange,
  onAvatarChange,
}: SettingsModalProps) {
  const [selectedColor, setSelectedColor] = useState(chatColor);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1c1212] border border-white/10 rounded-lg max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-white text-xl font-bold">Настройки</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Аватарка */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Аватарка</p>
          <div className="flex items-center gap-4">
            <Avatar
              username={username}
              size={64}
              isOwn={true}
              onAvatarChange={onAvatarChange}
            />
            <span className="text-gray-300 text-sm">Нажми на аватарку, чтобы изменить</span>
          </div>
        </div>

        {/* Цвет чата */}
        <div className="mb-6">
          <p className="text-gray-400 text-sm mb-2">Цвет чата</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((color) => (
              <button
                key={color}
                onClick={() => {
                  setSelectedColor(color);
                  onColorChange(color);
                }}
                className={`w-10 h-10 rounded-full border-2 transition ${
                  selectedColor === color ? 'border-white' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full bg-red-950 text-white py-2 rounded hover:bg-red-900 transition"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
}