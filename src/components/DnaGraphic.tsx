export function DnaGraphic() {
  return (
    <div id="dna-graphic-container" className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center select-none pointer-events-none">
      {/* Background glow */}
      <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse" />

      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id="dnaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="dnaGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <linearGradient id="cellBase" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#0d9488" />
          </linearGradient>
        </defs>

        {/* Biological Cell / DNA Strand representation */}
        {/* Cell membrane outline */}
        <circle cx="100" cy="100" r="78" fill="none" stroke="#10b981" strokeWidth="2" strokeDasharray="6 3" className="opacity-40 animate-spin" style={{ animationDuration: '40s' }} />
        <circle cx="100" cy="100" r="70" fill="#ecfdf5" fillOpacity="0.4" stroke="#059669" strokeWidth="1" className="opacity-60" />

        {/* DNA Helix rungs and strands */}
        {[
          { y: 40, r1: 85, r2: 115, color1: '#10b981', color2: '#06b6d4', delay: '0s' },
          { y: 55, r1: 92, r2: 108, color1: '#06b6d4', color2: '#10b981', delay: '0.3s' },
          { y: 70, r1: 105, r2: 95, color1: '#10b981', color2: '#06b6d4', delay: '0.6s' },
          { y: 85, r1: 115, r2: 85, color1: '#06b6d4', color2: '#10b981', delay: '0.9s' },
          { y: 100, r1: 110, r2: 90, color1: '#10b981', color2: '#06b6d4', delay: '1.2s' },
          { y: 115, r1: 95, r2: 105, color1: '#06b6d4', color2: '#10b981', delay: '1.5s' },
          { y: 130, r1: 85, r2: 115, color1: '#10b981', color2: '#06b6d4', delay: '1.8s' },
          { y: 145, r1: 90, r2: 110, color1: '#06b6d4', color2: '#10b981', delay: '2.1s' },
          { y: 160, r1: 108, r2: 92, color1: '#10b981', color2: '#06b6d4', delay: '2.4s' },
        ].map((rung, i) => (
          <g key={i}>
            {/* Connecting base pair */}
            <line
              x1={rung.r1}
              y1={rung.y}
              x2={rung.r2}
              y2={rung.y}
              stroke="#64748b"
              strokeWidth="2.5"
              strokeLinecap="round"
              className="opacity-70"
            />
            {/* Left nucleotide node */}
            <circle cx={rung.r1} cy={rung.y} r="5.5" fill={rung.color1}>
              <animate
                attributeName="cx"
                values={`${rung.r1}; ${rung.r2}; ${rung.r1}`}
                dur="3s"
                begin={rung.delay}
                repeatCount="indefinite"
              />
            </circle>
            {/* Right nucleotide node */}
            <circle cx={rung.r2} cy={rung.y} r="5.5" fill={rung.color2}>
              <animate
                attributeName="cx"
                values={`${rung.r2}; ${rung.r1}; ${rung.r2}`}
                dur="3s"
                begin={rung.delay}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Chloroplast / Mitochondria mini organelle */}
        <g transform="translate(138, 55) scale(0.65)" className="opacity-80">
          <ellipse cx="20" cy="15" rx="16" ry="10" fill="#22c55e" stroke="#15803d" strokeWidth="1.5" />
          <path d="M 10 15 Q 20 8 30 15 Q 20 22 10 15" fill="none" stroke="#ffffff" strokeWidth="1" />
        </g>
        <g transform="translate(32, 125) scale(0.65)" className="opacity-80">
          <ellipse cx="20" cy="15" rx="16" ry="10" fill="#0ea5e9" stroke="#0284c7" strokeWidth="1.5" />
          <path d="M 8 15 Q 20 10 32 15" fill="none" stroke="#ffffff" strokeWidth="1" />
        </g>
      </svg>
      <div className="absolute -bottom-2 text-[11px] font-bold tracking-wider text-emerald-700 uppercase bg-emerald-50/90 px-2 py-0.5 rounded-full border border-emerald-200">
        Mô hình ADN & Tế bào
      </div>
    </div>
  );
}
