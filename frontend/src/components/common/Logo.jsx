import React from 'react';

export default function Logo({ size = 'default', variant = 'light', subtitle = null, isAdmin = false }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  const iconSizes = isLarge ? 'w-12 h-12' : isSmall ? 'w-8 h-8' : 'w-10 h-10';
  const textSizes = isLarge ? 'text-3xl' : isSmall ? 'text-xl' : 'text-2xl';

  return (
    <div className="flex items-center gap-3 select-none">
      {/* Carry Bag Icon */}
      <div className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white shadow-md shadow-emerald-600/20 ${iconSizes}`}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-3/5 h-3/5"
        >
          {/* Bag handle */}
          <path d="M8 8V6a4 4 0 0 1 8 0v2" />
          {/* Bag body */}
          <path d="M4 8h16l-1.5 12.5a2 2 0 0 1-2 1.5h-9a2 2 0 0 1-2-1.5L4 8z" />
          {/* Accent dot */}
          <circle cx="12" cy="14" r="1.5" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Name */}
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <span className={`font-extrabold tracking-tight ${textSizes} ${variant === 'dark' ? 'text-white' : 'text-slate-900'}`}>
            Carry
          </span>
          {isAdmin && (
            <span className="px-2 py-0.5 text-[11px] font-semibold tracking-wide uppercase rounded-md bg-amber-100 text-amber-800 border border-amber-300">
              Admin
            </span>
          )}
        </div>
        {subtitle && (
          <span className={`text-xs font-medium tracking-wide ${variant === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
}
