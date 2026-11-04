import React from 'react';

interface HoaHocNdhLogoProps {
  logoUrl?: string;
  sizePx?: number;
  shape?: 'original' | 'circle' | 'rounded';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
}

/**
 * Helper to convert an uploaded image file (e.g. "Logo Hoa hoc NDH.png")
 * into a crisp, high-resolution PNG Data URL (preserving transparency)
 * sized appropriately for instant rendering and persistence in Firestore & Server.
 */
export async function processLogoFileToDataUrl(file: File, maxDimension = 520): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        reject(new Error('Không thể đọc tệp ảnh'));
        return;
      }
      // If SVG, return directly
      if (file.type === 'image/svg+xml') {
        resolve(dataUrl);
        return;
      }
      const img = new Image();
      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        if (width > maxDimension || height > maxDimension) {
          if (width >= height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(dataUrl);
          return;
        }
        ctx.clearRect(0, 0, width, height);
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);
        // Always output PNG to preserve alpha transparency of Logo Hoa hoc NDH.png
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => reject(new Error('Lỗi khi đọc file ảnh Logo'));
    reader.readAsDataURL(file);
  });
}

export const HoaHocNdhLogo: React.FC<HoaHocNdhLogoProps> = ({
  logoUrl,
  sizePx = 100,
  shape = 'original',
  className = '',
  onClick,
}) => {
  const shapeClass =
    shape === 'circle'
      ? 'rounded-full overflow-hidden ring-2 ring-amber-300/80 bg-white/95 p-1'
      : shape === 'rounded'
      ? 'rounded-2xl overflow-hidden ring-2 ring-white/70 bg-white/95 p-1'
      : '';

  if (logoUrl && logoUrl.trim() !== '') {
    return (
      <div
        onClick={onClick}
        style={{ height: `${sizePx}px`, minHeight: `${sizePx}px` }}
        className={`relative inline-flex items-center justify-center select-none transition-transform duration-200 ${
          onClick ? 'cursor-pointer hover:scale-[1.03]' : ''
        } ${shapeClass} ${className}`}
        title="Logo Hóa Học NĐH - Thầy Nguyễn Đình Hành"
      >
        <img
          src={logoUrl}
          alt="Logo Hóa học NĐH"
          referrerPolicy="no-referrer"
          style={{ height: '100%', width: 'auto', maxWidth: `${Math.round(sizePx * 2.2)}px` }}
          className="object-contain drop-shadow-[0_4px_12px_rgba(0,0,0,0.38)]"
        />
      </div>
    );
  }

  // High-precision vector Emblem for "Logo Hóa học NĐH"
  return (
    <div
      onClick={onClick}
      style={{ width: `${sizePx}px`, height: `${sizePx}px` }}
      className={`relative inline-flex items-center justify-center shrink-0 select-none transition-transform duration-200 drop-shadow-[0_5px_14px_rgba(0,0,0,0.45)] ${
        onClick ? 'cursor-pointer hover:scale-[1.04]' : ''
      } ${className}`}
      title="Logo Hóa Học NĐH - Thầy Nguyễn Đình Hành"
    >
      <svg
        viewBox="0 0 240 240"
        className="w-full h-full overflow-visible"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ndhGoldRim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="35%" stopColor="#FACC15" />
            <stop offset="70%" stopColor="#D97706" />
            <stop offset="100%" stopColor="#FDE047" />
          </linearGradient>

          <linearGradient id="ndhOuterBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F296B" />
            <stop offset="50%" stopColor="#1E3A8A" />
            <stop offset="100%" stopColor="#091945" />
          </linearGradient>

          <radialGradient id="ndhInnerBg" cx="50%" cy="46%" r="52%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="70%" stopColor="#F0F9FF" />
            <stop offset="100%" stopColor="#DBEAFE" />
          </radialGradient>

          <linearGradient id="ndhCyanLiquid" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" />
            <stop offset="55%" stopColor="#0284C7" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>

          <linearGradient id="ndhRibbonRed" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#B91C1C" />
            <stop offset="50%" stopColor="#DC2626" />
            <stop offset="100%" stopColor="#991B1B" />
          </linearGradient>

          {/* Curved paths for circular crest text */}
          <path id="ndhTopTextArc" d="M 34,120 A 86,86 0 1,1 206,120" />
          <path id="ndhBottomTextArc" d="M 198,134 A 82,82 0 0,1 42,134" />
        </defs>

        {/* Outer Golden Scalloped/Crest Ring */}
        <circle cx="120" cy="120" r="114" fill="url(#ndhGoldRim)" stroke="#FFFFFF" strokeWidth="3" />
        <circle cx="120" cy="120" r="108" fill="url(#ndhOuterBlue)" stroke="url(#ndhGoldRim)" strokeWidth="2.5" />

        {/* Inner White/Sky Crest Field */}
        <circle cx="120" cy="120" r="80" fill="url(#ndhInnerBg)" stroke="url(#ndhGoldRim)" strokeWidth="3" />

        {/* Decorative Laurel Wreath & Stars in Outer Ring */}
        <circle
          cx="120"
          cy="120"
          r="94"
          stroke="#FDE047"
          strokeWidth="1.2"
          strokeDasharray="4 4"
          opacity="0.55"
        />

        {/* Top Arched Typography: HÓA HỌC NĐH */}
        <text
          fill="#FEF08A"
          fontSize="18.5"
          fontWeight="900"
          letterSpacing="2.2"
          fontFamily="system-ui, -apple-system, sans-serif"
        >
          <textPath href="#ndhTopTextArc" startOffset="50%" textAnchor="middle">
            ★ HÓA HỌC NĐH ★
          </textPath>
        </text>

        {/* Subtle Hexagonal Benzene Ring in Upper Background */}
        <polygon
          points="120,48 138,58 138,78 120,88 102,78 102,58"
          stroke="#0284C7"
          strokeWidth="2.2"
          fill="rgba(56, 189, 248, 0.1)"
          opacity="0.85"
        />
        <circle cx="120" cy="68" r="10" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="3 2" fill="none" />

        {/* Atomic Orbital Ellipses around Center */}
        <ellipse
          cx="120"
          cy="112"
          rx="64"
          ry="23"
          stroke="#1D4ED8"
          strokeWidth="2.4"
          transform="rotate(-28 120 112)"
          opacity="0.8"
        />
        <ellipse
          cx="120"
          cy="112"
          rx="64"
          ry="23"
          stroke="#059669"
          strokeWidth="2.4"
          transform="rotate(28 120 112)"
          opacity="0.8"
        />
        {/* Orbiting Electrons */}
        <circle cx="67" cy="87" r="4.5" fill="#EF4444" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="173" cy="87" r="4.5" fill="#10B981" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="68" cy="137" r="4.5" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="1.5" />
        <circle cx="172" cy="137" r="4.5" fill="#F59E0B" stroke="#FFFFFF" strokeWidth="1.5" />

        {/* Central Chemistry Erlenmeyer Flask */}
        <path
          d="M111 66 H129 M114 66 V86 L88 134 C85 140 89 147 96 147 H144 C151 147 155 140 152 134 L126 86 V66"
          fill="#FFFFFF"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Glowing Chemical Liquid Inside Flask */}
        <path
          d="M97 118 Q109 113 120 118 Q131 123 143 118 L149 133 C151 138 148 143 142 143 H98 C92 143 89 138 91 133 Z"
          fill="url(#ndhCyanLiquid)"
        />
        {/* Measurement graduation marks & bubbles */}
        <line x1="126" y1="105" x2="133" y2="105" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        <line x1="131" y1="115" x2="139" y2="115" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
        <circle cx="110" cy="132" r="4" fill="#FFFFFF" opacity="0.9" />
        <circle cx="126" cy="127" r="3" fill="#FFFFFF" opacity="0.9" />
        <circle cx="118" cy="110" r="3.2" fill="#06B6D4" />
        <circle cx="124" cy="98" r="2.2" fill="#10B981" />

        {/* Open Book of Knowledge at Base of Inner Crest */}
        <path
          d="M78 154 Q99 146 120 156 Q141 146 162 154 L158 168 Q139 160 120 170 Q101 160 82 168 Z"
          fill="#FEF08A"
          stroke="#1E3A8A"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <line x1="120" y1="156" x2="120" y2="170" stroke="#1E3A8A" strokeWidth="2.5" />

        {/* Prestigious NĐH VTV-style Color Badge on Lower Crest */}
        <g transform="translate(68, 174)">
          {/* Rounded Gold-Bordered Plate */}
          <rect
            x="0"
            y="0"
            width="104"
            height="34"
            rx="10"
            fill="#0F172A"
            stroke="url(#ndhGoldRim)"
            strokeWidth="3"
          />
          {/* N - Red */}
          <g transform="translate(10, 5) skewX(-10)">
            <rect width="26" height="24" rx="4" fill="#DC2626" />
            <text
              x="13"
              y="18"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="17"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              transform="skewX(10)"
            >
              N
            </text>
          </g>
          {/* Đ - Green */}
          <g transform="translate(40, 5) skewX(-10)">
            <rect width="26" height="24" rx="4" fill="#10B981" />
            <text
              x="13"
              y="18"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="17"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              transform="skewX(10)"
            >
              Đ
            </text>
          </g>
          {/* H - Blue */}
          <g transform="translate(70, 5) skewX(-10)">
            <rect width="26" height="24" rx="4" fill="#2563EB" />
            <text
              x="13"
              y="18"
              textAnchor="middle"
              fill="#FFFFFF"
              fontSize="17"
              fontWeight="900"
              fontFamily="system-ui, sans-serif"
              transform="skewX(10)"
            >
              H
            </text>
          </g>
        </g>
      </svg>
    </div>
  );
};
