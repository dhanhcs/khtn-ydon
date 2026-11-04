import React from 'react';

interface VtvNdhBadgeProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Renders 'NĐH' with Vietnam Television (VTV) broadcast badge style:
 * - N: Vivid Crimson Red
 * - Đ: Brilliant Emerald Green
 * - H: Deep Cobalt Blue
 * Styled as 3 slanted parallelograms with upright high-contrast typography.
 */
export const VtvNdhBadge: React.FC<VtvNdhBadgeProps> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    xs: 'w-4 h-4 text-[10px]',
    sm: 'w-5 h-5 text-xs',
    md: 'w-6 h-6 sm:w-7 sm:h-7 text-xs sm:text-sm',
    lg: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 text-sm sm:text-base md:text-lg',
    xl: 'w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 text-base sm:text-xl md:text-2xl',
  }[size];

  return (
    <span className={`inline-flex items-center gap-0.5 sm:gap-1 select-none align-middle font-sans ${className}`}>
      {/* VTV Red: N */}
      <span
        className={`inline-flex items-center justify-center ${sizeMap} font-black text-white bg-gradient-to-br from-red-500 via-red-600 to-rose-700 rounded-xs shadow-[0_2px_5px_rgba(220,38,38,0.5)] transform -skew-x-12 border border-white/40 ring-1 ring-red-400/50`}
        title="N (Nguyễn)"
      >
        <span className="transform skew-x-12 leading-none">N</span>
      </span>

      {/* VTV Green: Đ */}
      <span
        className={`inline-flex items-center justify-center ${sizeMap} font-black text-white bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-700 rounded-xs shadow-[0_2px_5px_rgba(16,185,129,0.5)] transform -skew-x-12 border border-white/40 ring-1 ring-emerald-400/50`}
        title="Đ (Đình)"
      >
        <span className="transform skew-x-12 leading-none">Đ</span>
      </span>

      {/* VTV Blue: H */}
      <span
        className={`inline-flex items-center justify-center ${sizeMap} font-black text-white bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 rounded-xs shadow-[0_2px_5px_rgba(37,99,235,0.5)] transform -skew-x-12 border border-white/40 ring-1 ring-blue-400/50`}
        title="H (Hành)"
      >
        <span className="transform skew-x-12 leading-none">H</span>
      </span>
    </span>
  );
};
