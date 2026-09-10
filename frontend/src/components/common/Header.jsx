import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Edit3, ShieldCheck, MapPin } from 'lucide-react';
import Logo from './Logo';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/whatsapp';

export default function Header({ onOpenHotelModal }) {
  const { hotelName, totalCount, totalAmount, setIsCartOpen } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-slate-200/70"
      style={{ boxShadow: '0 1px 20px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.04)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-18 flex items-center justify-between gap-4">

        {/* ── Brand ── */}
        <div className="flex items-center">
          <Logo subtitle="Hotel Essentials" />
        </div>

        {/* ── Hotel Indicator (desktop) ── */}
        {hotelName && (
          <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/70 px-3.5 py-2 rounded-full shadow-xs">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Ordering for</span>
            <span className="font-bold text-slate-900 max-w-[180px] lg:max-w-xs truncate text-sm">
              {hotelName}
            </span>
            <button
              onClick={onOpenHotelModal}
              title="Change Hotel Name"
              className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors ml-0.5"
            >
              <Edit3 className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 transition-all"
            title="Admin Portal"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span className="hidden xs:inline">Admin</span>
          </Link>

          <button
            onClick={() => setIsCartOpen(true)}
            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all duration-200 btn-press ${
              totalCount > 0
                ? 'text-white shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
            style={totalCount > 0 ? {
              background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)'
            } : {}}
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4" />
            <span className="hidden xs:inline">Cart</span>
            {totalCount > 0 ? (
              <span className="flex items-center gap-1.5 font-bold">
                <span className="bg-white/20 px-1.5 py-0.5 rounded-full text-xs text-white">
                  {totalCount}
                </span>
                <span className="hidden sm:inline text-emerald-100 font-semibold text-xs">
                  {formatCurrency(totalAmount)}
                </span>
              </span>
            ) : (
              <span className="text-xs text-slate-400 font-normal">0</span>
            )}
          </button>
        </div>
      </div>

      {/* ── Mobile Hotel Strip ── */}
      {hotelName && (
        <div className="md:hidden border-t border-emerald-100 bg-gradient-to-r from-emerald-50 to-teal-50/70 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <MapPin className="w-3 h-3 text-emerald-600 flex-shrink-0" />
            <span className="text-emerald-700 font-semibold uppercase tracking-wider text-[10px]">For</span>
            <span className="font-bold text-slate-800 truncate">{hotelName}</span>
          </div>
          <button
            onClick={onOpenHotelModal}
            className="text-emerald-700 font-semibold hover:text-emerald-900 flex items-center gap-1 flex-shrink-0 text-[11px] ml-2"
          >
            <Edit3 className="w-3 h-3" />
            Change
          </button>
        </div>
      )}
    </header>
  );
}
