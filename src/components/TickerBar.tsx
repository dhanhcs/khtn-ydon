import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { Megaphone, Pause, Play, Edit3, Check, Sparkles } from 'lucide-react';

export const TickerBar: React.FC = () => {
  const { settings, updateSettings } = useApp();
  const { isAdmin } = useAuth();
  const [isPaused, setIsPaused] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState(settings.tickerText || '');

  if (!settings.tickerEnabled) return null;

  const handleSaveText = async () => {
    await updateSettings({ tickerText: text });
    setIsEditing(false);
  };

  const displayText =
    settings.tickerText ||
    'Chào mừng quý thầy cô, phụ huynh và các em học sinh đến với CHINH PHỤC MÔN HÓA THCS- NĐH (Thầy Nguyễn Đình Hành)';

  return (
    <div className="bg-gradient-to-r from-red-700 via-rose-700 to-red-800 text-yellow-300 border-b border-red-900 shadow-sm relative overflow-hidden select-none">
      <div className="max-w-7xl mx-auto flex items-center px-2 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold">
        {/* Left Badge */}
        <div className="flex items-center gap-1.5 bg-red-950/90 text-yellow-300 px-2.5 py-1 rounded-md shadow-inner shrink-0 z-10 border border-yellow-400/40">
          <Megaphone className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span className="uppercase text-[11px] font-black tracking-wider">Thông báo:</span>
        </div>

        {/* Center Marquee Content or Edit Input */}
        <div
          className="flex-1 overflow-hidden relative mx-3"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => !isEditing && setIsPaused(false)}
        >
          {isEditing ? (
            <div className="flex items-center gap-2 py-0.5">
              <input
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full bg-red-950 text-yellow-200 border border-yellow-400 rounded px-2.5 py-1 text-xs focus:outline-none"
              />
              <button
                onClick={handleSaveText}
                className="bg-yellow-400 text-red-950 px-3 py-1 rounded text-xs font-bold hover:bg-yellow-300 shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" /> Lưu
              </button>
            </div>
          ) : (
            <div
              className={`text-yellow-200 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] cursor-pointer py-0.5 ${
                isPaused ? 'ticker-track-paused' : 'ticker-track-running'
              }`}
              title="Rê chuột để tạm dừng"
            >
              {/* Duplicate 3 parts for truly infinite seamless smooth scrolling on any screen resolution */}
              {[1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-4 pr-10 shrink-0 font-medium whitespace-nowrap"
                >
                  <span className="font-bold text-yellow-100">{displayText}</span>
                  <span className="text-amber-400 font-extrabold text-xs">✦</span>
                  <span className="text-yellow-200">
                    Khóa học Hóa THCS 6, 7, 8, 9 & Bồi dưỡng HSG Chuyên Hóa - Thầy Nguyễn Đình Hành
                  </span>
                  <span className="text-amber-400 font-extrabold text-xs">✦</span>
                  <span className="text-white font-extrabold bg-red-900/60 px-2 py-0.5 rounded border border-white/20">
                    Hotline: 0988 275 288
                  </span>
                  <span className="text-amber-400 font-extrabold text-xs">✦</span>
                  <span className="text-yellow-300 italic">Trách nhiệm - Uy tín - Chất lượng</span>
                  <span className="text-amber-400 font-extrabold text-xs">✦</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Controls: Pause / Play & Admin Edit */}
        <div className="flex items-center gap-1 shrink-0 z-10">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className="p-1 text-yellow-300 hover:text-white hover:bg-red-800 rounded transition cursor-pointer"
            title={isPaused ? 'Tiếp tục chạy chữ' : 'Tạm dừng chạy chữ'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
          </button>

          {isAdmin && (
            <button
              onClick={() => {
                setText(settings.tickerText || displayText);
                setIsEditing(!isEditing);
              }}
              className="p-1 text-yellow-300 hover:text-white hover:bg-red-800 rounded transition ml-1 cursor-pointer"
              title="Chỉnh sửa nội dung dòng chữ chạy"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
