import React, { useState } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Download, Maximize2 } from 'lucide-react';

interface ImageViewerModalProps {
  isOpen: boolean;
  imageUrl: string | null;
  title?: string;
  onClose: () => void;
}

export function ImageViewerModal({ isOpen, imageUrl, title, onClose }: ImageViewerModalProps) {
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  if (!isOpen || !imageUrl) return null;

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setScale(1);
    setRotation(0);
  };

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = (title ? title.replace(/\s+/g, '_') : 'hinh_anh_khoa_hoc') + '.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div 
      className="fixed inset-0 z-90 bg-black/90 backdrop-blur-md flex flex-col items-center justify-between p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Header Controls */}
      <div 
        className="w-full max-w-5xl flex items-center justify-between text-white py-2 px-4 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 z-10 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <Maximize2 className="w-4 h-4 text-sky-400 shrink-0" />
          <span className="text-xs sm:text-sm font-bold truncate max-w-xs sm:max-w-md">
            {title || 'Xem ảnh phóng to'}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomIn}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
            title="Phóng to"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleZoomOut}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
            title="Thu nhỏ"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleRotate}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer"
            title="Xoay 90°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all cursor-pointer hidden sm:inline"
            title="Đặt lại kích thước"
          >
            100%
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
            title="Tải ảnh về máy"
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">Tải về</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold transition-all cursor-pointer ml-1"
            title="Đóng (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Image View Area */}
      <div 
        className="flex-1 w-full flex items-center justify-center overflow-hidden p-2 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={imageUrl}
          alt={title || 'Hình ảnh'}
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: 'transform 0.15s ease-out'
          }}
          className="max-h-[82vh] max-w-[95vw] object-contain rounded-2xl shadow-2xl cursor-grab active:cursor-grabbing"
        />
      </div>

      {/* Footer hint */}
      <div className="text-[11px] text-white/60 py-1 font-medium z-10 shrink-0 text-center">
        Nhấp ra ngoài hoặc bấm nút ✕ để đóng • Dùng nút + / - để phóng to, xoay ảnh
      </div>
    </div>
  );
}
