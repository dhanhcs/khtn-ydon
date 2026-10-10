import React from 'react';

interface YDonSchoolLogoProps {
  className?: string;
  size?: number;
}

export function YDonSchoolLogo({ className = '', size = 48 }: YDonSchoolLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 320 320"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 rounded-full shadow-md ${className}`}
      aria-label="Logo Trường THCS và THPT Y Đôn"
    >
      <defs>
        {/* Curved Path for Top Text: THCS VÀ THPT Y ĐÔN */}
        <path
          id="ydon-top-arc"
          d="M 40,160 A 120,120 0 1,1 280,160"
          fill="none"
        />
        {/* Curved Path for Bottom Text: HỌC LỄ - HỌC VĂN */}
        <path
          id="ydon-bottom-arc"
          d="M 280,160 A 120,120 0 0,1 40,160"
          fill="none"
        />

        {/* Gradients */}
        <linearGradient id="ringGrad" x1="0" y1="0" x2="320" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1e52c8" />
          <stop offset="50%" stopColor="#1a45b2" />
          <stop offset="100%" stopColor="#163996" />
        </linearGradient>

        <linearGradient id="innerCyanGrad" x1="160" y1="50" x2="160" y2="270" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#00d2ff" />
          <stop offset="60%" stopColor="#00b4f0" />
          <stop offset="100%" stopColor="#009ed9" />
        </linearGradient>
      </defs>

      {/* Outer Circle Ring */}
      <circle cx="160" cy="160" r="156" fill="url(#ringGrad)" stroke="#ffffff" strokeWidth="2" />

      {/* Inner Sky-Blue Circle */}
      <circle cx="160" cy="160" r="108" fill="url(#innerCyanGrad)" stroke="#ffffff" strokeWidth="2" />

      {/* Top Arc Text */}
      <text
        fill="#ffffff"
        fontSize="21"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="2.2"
      >
        <textPath href="#ydon-top-arc" startOffset="50%" textAnchor="middle">
          THCS VÀ THPT Y ĐÔN
        </textPath>
      </text>

      {/* Left Star */}
      <polygon
        points="28,155 33,143 38,155 26,147 40,147"
        fill="#ffd000"
        stroke="#eab308"
        strokeWidth="0.5"
        transform="translate(14, 5) scale(1.4)"
      />

      {/* Right Star */}
      <polygon
        points="28,155 33,143 38,155 26,147 40,147"
        fill="#ffd000"
        stroke="#eab308"
        strokeWidth="0.5"
        transform="translate(236, 5) scale(1.4)"
      />

      {/* Bottom Arc Text */}
      <text
        fill="#ffffff"
        fontSize="20"
        fontWeight="800"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
        letterSpacing="2.5"
      >
        <textPath href="#ydon-bottom-arc" startOffset="50%" textAnchor="middle">
          HỌC LỄ - HỌC VĂN
        </textPath>
      </text>

      {/* Center Stylized "Y" Tree / Growth Pedestal (Royal Blue) */}
      <g id="center-y-shape">
        {/* Left Curved Wing / Branch */}
        <path
          d="M 160,268 C 158,225 152,192 68,174 C 118,172 150,188 155,225 Z"
          fill="#1748be"
        />
        {/* Right Curved Wing / Branch */}
        <path
          d="M 160,268 C 162,225 168,192 252,174 C 202,172 170,188 165,225 Z"
          fill="#1748be"
        />
        {/* Center Trunk */}
        <path
          d="M 152,268 L 168,268 L 165,200 L 155,200 Z"
          fill="#1748be"
        />
        {/* Cyan Wing Accent Highlights */}
        <path
          d="M 78,176 C 115,178 145,195 154,228 C 146,205 120,186 78,176 Z"
          fill="#38bdf8"
          opacity="0.8"
        />
        <path
          d="M 242,176 C 205,178 175,195 166,228 C 174,205 200,186 242,176 Z"
          fill="#38bdf8"
          opacity="0.8"
        />
      </g>

      {/* Center Open Book in 3D Perspective */}
      <g id="center-book" transform="translate(108, 68)">
        {/* Book shadow */}
        <ellipse cx="52" cy="88" rx="46" ry="6" fill="#000000" opacity="0.2" />

        {/* Book Spine & Pages */}
        {/* Left page back/thickness */}
        <path
          d="M 4,46 L 50,70 L 50,75 L 4,51 Z"
          fill="#cbd5e1"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        {/* Left page white surface */}
        <path
          d="M 46,14 L 4,46 L 50,70 L 88,34 Z"
          fill="#ffffff"
          stroke="#1e293b"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Page lines / text hints left */}
        <line x1="20" y1="44" x2="48" y2="30" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="24" y1="50" x2="52" y2="36" stroke="#94a3b8" strokeWidth="1.2" />
        <line x1="28" y1="56" x2="56" y2="42" stroke="#94a3b8" strokeWidth="1.2" />

        {/* Right page back/thickness */}
        <path
          d="M 50,70 L 102,48 L 102,53 L 50,75 Z"
          fill="#94a3b8"
          stroke="#1e293b"
          strokeWidth="1.5"
        />
        {/* Right page white surface */}
        <path
          d="M 88,34 L 50,70 L 98,49 L 102,44 Z"
          fill="#f8fafc"
          stroke="#1e293b"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Open Book Spine Center Crease */}
        <line x1="50" y1="70" x2="88" y2="34" stroke="#475569" strokeWidth="2.5" />

        {/* Black Pen / Stylus lying diagonally on the book */}
        <g transform="rotate(-35, 70, 48)">
          <rect x="62" y="24" width="6" height="42" rx="2.5" fill="#0f172a" stroke="#ffffff" strokeWidth="0.8" />
          {/* Pen clip */}
          <rect x="63" y="28" width="2" height="14" rx="1" fill="#cbd5e1" />
          {/* Pen nib tip */}
          <polygon points="62,66 68,66 65,74" fill="#1e293b" />
          <circle cx="65" cy="73.5" r="1" fill="#f8fafc" />
        </g>
      </g>
    </svg>
  );
}
