import React from 'react';
import { X, ShoppingBag, ArrowRight, Trash2, Hotel, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import QuantitySelector from './QuantitySelector';
import { formatCurrency } from '../../services/whatsapp';

export default function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    hotelName,
    cartItems,
    totalCount,
    totalAmount,
    incrementProduct,
    decrementProduct,
    removeProduct,
    clearCart,
    setIsConfirmModalOpen,
  } = useCart();

  if (!isCartOpen) return null;

  const handleCheckoutClick = () => {
    setIsCartOpen(false);
    setIsConfirmModalOpen(true);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => setIsCartOpen(false)}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-12">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md flex flex-col transform transition-transform animate-in slide-in-from-right duration-300"
          style={{
            background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
            boxShadow: '-4px 0 40px rgba(15,23,42,0.12)'
          }}
        >
          {/* ── Header ── */}
          <div className="relative flex-shrink-0 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 60%, #064e3b 100%)' }}
          >
            <div className="absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(16,185,129,0.2)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-white leading-tight">Your Order</h2>
                  {hotelName && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Hotel className="w-3 h-3 text-emerald-400" />
                      <span className="text-xs font-semibold text-slate-300 truncate max-w-[180px]">
                        {hotelName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    title="Clear all items"
                    className="p-2 text-slate-400 hover:text-rose-400 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Item count strip */}
            {cartItems.length > 0 && (
              <div className="relative px-5 pb-4">
                <span className="text-xs font-semibold text-slate-400">
                  {totalCount} item{totalCount !== 1 ? 's' : ''} selected
                </span>
              </div>
            )}
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                <div className="w-24 h-24 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)' }}
                >
                  <Package className="w-10 h-10 text-slate-400 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Your cart is empty</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    Browse products and add them to start building your order.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-3 rounded-2xl font-bold text-sm text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer btn-press"
                  style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {cartItems.map((item) => {
                  const lineTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col gap-3 shadow-xs hover:shadow-sm transition-shadow"
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug truncate">
                            {item.product.name}
                          </h4>
                          <span className="text-[11px] text-slate-400 font-medium mt-0.5 block">
                            {item.product.unit_type} · {item.product.category_name}
                          </span>
                        </div>
                        <button
                          onClick={() => removeProduct(item.product.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1 flex-shrink-0 cursor-pointer rounded-lg hover:bg-rose-50"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between">
                        <QuantitySelector
                          quantity={item.quantity}
                          onIncrement={() => incrementProduct(item.product)}
                          onDecrement={() => decrementProduct(item.product)}
                          size="small"
                        />
                        <div className="text-right">
                          <div className="text-[11px] text-slate-400 font-medium">
                            {formatCurrency(item.product.price)} × {item.quantity}
                          </div>
                          <div className="text-sm font-extrabold text-slate-900">
                            {formatCurrency(lineTotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Footer ── */}
          {cartItems.length > 0 && (
            <div className="flex-shrink-0 p-4 sm:p-5 border-t border-slate-100 bg-white space-y-3">
              {/* Totals */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-500 font-medium">Items</span>
                  <span className="font-semibold text-slate-700">{totalCount} pcs</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-2xl font-black text-emerald-700">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base text-white shadow-lg shadow-emerald-600/25 transition-all cursor-pointer btn-press"
                style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
              >
                <span>Send Order via WhatsApp</span>
                <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-center text-xs text-slate-400 font-medium">
                Order is confirmed only after you send via WhatsApp
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
