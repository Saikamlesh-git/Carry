import React from 'react';
import { ShoppingBag, Edit3 } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/whatsapp';

export default function Header({ onOpenHotelModal }) {
  const { hotelName, totalCount, totalAmount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Logo */}
        <div className="flex items-center">
          <Logo subtitle="Hotel Essentials" />
        </div>

        {/* Hotel Name Badge */}
        {hotelName && (
          <div className="hidden sm:flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 px-3.5 py-1.5 rounded-full text-sm">
            <span className="text-emerald-700 text-xs font-semibold uppercase tracking-wider">
              Ordering for:
            </span>
            <span className="font-bold text-slate-900 max-w-[200px] md:max-w-xs truncate">
              {hotelName}
            </span>
            <button
              onClick={onOpenHotelModal}
              title="Change Hotel Name"
              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100/50 rounded-full transition-colors ml-1"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Desktop Cart Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative flex items-center gap-2.5 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 ${
              totalCount > 0
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700 active:scale-98'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden xs:inline">Cart</span>
            {totalCount > 0 ? (
              <span className="flex items-center gap-1.5 font-bold">
                <span className="bg-emerald-950/30 px-2 py-0.5 rounded-full text-xs text-white">
                  {totalCount}
                </span>
                <span className="hidden sm:inline text-emerald-100 font-medium">
                  • {formatCurrency(totalAmount)}
                </span>
              </span>
            ) : (
              <span className="text-xs text-slate-500 font-normal">0</span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Hotel Name Strip */}
      {hotelName && (
        <div className="sm:hidden bg-emerald-50 border-t border-emerald-100 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[10px]">
              Hotel:
            </span>
            <span className="font-bold text-slate-800 truncate">
              {hotelName}
            </span>
          </div>
          <button
            onClick={onOpenHotelModal}
            className="text-emerald-700 font-semibold hover:underline flex items-center gap-1 flex-shrink-0 text-[11px]"
          >
            <Edit3 className="w-3 h-3" />
            Change
          </button>
        </div>
      )}
    </header>
  );
}
