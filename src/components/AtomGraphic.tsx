export function AtomGraphic() {
  return (
    <div id="atom-graphic-container" className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center select-none pointer-events-none">
      {/* Background glow */}
      <div className="absolute inset-0 bg-blue-500/10 rounded-full blur-2xl animate-pulse" />

      <svg viewBox="0 0 200 200" className="w-full h-full overflow-visible">
        <defs>
          <radialGradient id="nucleusGradient" cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="60%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#1e3a8a" />
          </radialGradient>

          <radialGradient id="protonGradient" cx="30%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#f87171" />
            <stop offset="100%" stopColor="#dc2626" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Orbit 1 */}
        <ellipse
          cx="100"
          cy="100"
          rx="75"
          ry="28"
          fill="none"
          stroke="#38bdf8"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          className="opacity-60"
          transform="rotate(0 100 100)"
        />
        {/* Electron 1 on Orbit 1 */}
        <g transform="rotate(0 100 100)">
          <circle cx="175" cy="100" r="4.5" fill="#38bdf8" filter="url(#glow)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 100 100"
              to="360 100 100"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Orbit 2 */}
        <ellipse
          cx="100"
          cy="100"
          rx="75"
          ry="28"
          fill="none"
          stroke="#818cf8"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          className="opacity-60"
          transform="rotate(60 100 100)"
        />
        {/* Electron 2 on Orbit 2 */}
        <g transform="rotate(60 100 100)">
          <circle cx="175" cy="100" r="4.5" fill="#818cf8" filter="url(#glow)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 100 100"
              to="360 100 100"
              dur="5.5s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Orbit 3 */}
        <ellipse
          cx="100"
          cy="100"
          rx="75"
          ry="28"
          fill="none"
          stroke="#34d399"
          strokeWidth="1.5"
          strokeDasharray="4 2"
          className="opacity-60"
          transform="rotate(120 100 100)"
        />
        {/* Electron 3 on Orbit 3 */}
        <g transform="rotate(120 100 100)">
          <circle cx="175" cy="100" r="4.5" fill="#34d399" filter="url(#glow)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 100 100"
              to="360 100 100"
              dur="4.8s"
              repeatCount="indefinite"
            />
          </circle>
        </g>

        {/* Nucleus Core (Protons & Neutrons cluster) */}
        <g className="animate-pulse">
          <circle cx="94" cy="95" r="8" fill="url(#protonGradient)" filter="url(#glow)" />
          <circle cx="106" cy="94" r="7.5" fill="url(#nucleusGradient)" filter="url(#glow)" />
          <circle cx="98" cy="106" r="8.5" fill="url(#protonGradient)" filter="url(#glow)" />
          <circle cx="107" cy="104" r="7" fill="url(#nucleusGradient)" />
          <circle cx="100" cy="99" r="6" fill="#60a5fa" opacity="0.9" />
        </g>
      </svg>
      <div className="absolute -bottom-2 text-[11px] font-bold tracking-wider text-blue-700 uppercase bg-blue-50/90 px-2 py-0.5 rounded-full border border-blue-200">
        Mô hình nguyên tử
      </div>
    </div>
  );
}
