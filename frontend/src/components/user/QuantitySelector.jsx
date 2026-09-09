import React from 'react';
import { Plus, Minus } from 'lucide-react';

export default function QuantitySelector({ quantity = 0, onIncrement, onDecrement, size = 'default' }) {
  const isSmall = size === 'small';

  const btnSize = isSmall ? 'w-8 h-8' : 'w-10 h-10';
  const iconSize = isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const numSize = isSmall ? 'w-8 text-sm' : 'w-12 text-base';

  return (
    <div className="inline-flex items-center bg-slate-100 rounded-xl p-1 border border-slate-200/80 select-none">
      {/* Minus Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDecrement();
        }}
        disabled={quantity <= 0}
        aria-label="Decrease quantity"
        className={`flex items-center justify-center rounded-lg transition-all cursor-pointer ${btnSize} ${
          quantity > 0
            ? 'bg-white text-slate-800 hover:bg-slate-50 active:scale-95 shadow-xs hover:border-slate-300'
            : 'text-slate-300 cursor-not-allowed opacity-50'
        }`}
      >
        <Minus className={iconSize} strokeWidth={2.5} />
      </button>

      {/* Quantity Display */}
      <div className={`text-center font-bold tracking-tight text-slate-900 transition-colors ${numSize} ${quantity > 0 ? 'text-emerald-700' : 'text-slate-500'}`}>
        {quantity}
      </div>

      {/* Plus Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onIncrement();
        }}
        aria-label="Increase quantity"
        className={`flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 shadow-xs shadow-emerald-600/20 transition-all cursor-pointer ${btnSize}`}
      >
        <Plus className={iconSize} strokeWidth={2.5} />
      </button>
    </div>
  );
}
