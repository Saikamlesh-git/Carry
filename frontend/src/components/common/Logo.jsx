import React from 'react';

export default function Logo({ size = 'default', variant = 'light', subtitle = null, isAdmin = false }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const iconBox = isLarge ? 'w-13 h-13' : isSmall ? 'w-8 h-8' : 'w-10 h-10';
  const titleText = isLarge ? 'text-3xl' : isSmall ? 'text-xl' : 'text-2xl';
  const isDark = variant === 'dark';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Icon */}
      <div className={`relative flex items-center justify-center rounded-[14px] shadow-lg flex-shrink-0 ${iconBox}`}
        style={{
          background: 'linear-gradient(135deg, #059669 0%, #0d9488 55%, #0891b2 100%)',
          boxShadow: '0 4px 14px rgba(5,150,105,0.35), 0 1px 3px rgba(0,0,0,0.12)'
        }}
      >
        {/* Subtle gloss overlay */}
        <div className="absolute inset-0 rounded-[14px] bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-[58%] h-[58%] relative"
        >
          {/* Bag handle */}
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          {/* Bag body */}
          <path d="M4 8h16l-1.5 12.5a2 2 0 0 1-2 1.5H7.5a2 2 0 0 1-2-1.5L4 8z" />
          {/* Carry "C" accent dot */}
          <circle cx="12" cy="14.5" r="1.8" fill="white" stroke="none" />
        </svg>
      </div>

      {/* Text block */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-2">
          <span
            className={`font-extrabold tracking-[-0.03em] ${titleText} ${isDark ? 'text-white' : 'text-slate-900'}`}
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            carry
          </span>
          {isAdmin && (
            <span className="px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase rounded-lg bg-amber-100 text-amber-800 border border-amber-200/80">
              Admin
            </span>
          )}
        </div>
        {subtitle && (
          <span
            className={`text-[11px] font-medium tracking-wide mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}
            style={{ fontFamily: "'Inter', sans-serif" }}
          >
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
