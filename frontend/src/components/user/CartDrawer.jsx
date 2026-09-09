import React from 'react';
import { X, ShoppingBag, ArrowRight, Trash2, Hotel } from 'lucide-react';
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
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-0 sm:pl-10">
        {/* Drawer Panel */}
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 leading-tight">
                  Your Order
                </h2>
                <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium mt-0.5">
                  <Hotel className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="font-bold text-slate-800 truncate max-w-[200px]">
                    Hotel: {hotelName || 'Valued Partner'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {cartItems.length > 0 && (
                <button
                  onClick={clearCart}
                  title="Clear Cart"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors text-xs font-semibold"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg transition-colors"
                aria-label="Close cart"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 divide-y divide-slate-100">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-slate-800">
                    Your cart is empty
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Start adding products to create your order.
                  </p>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                >
                  Browse Products
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => {
                  const lineTotal = item.product.price * item.quantity;
                  return (
                    <div
                      key={item.product.id}
                      className="pt-4 first:pt-0 flex flex-col gap-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-slate-900 text-sm leading-snug">
                            {item.product.name}
                          </h4>
                          <span className="text-xs text-slate-500 font-medium">
                            Unit: {item.product.unit_type}
                          </span>
                        </div>
                        <button
                          onClick={() => removeProduct(item.product.id)}
                          className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                          title="Remove item"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        {/* Stepper */}
                        <QuantitySelector
                          quantity={item.quantity}
                          onIncrement={() => incrementProduct(item.product)}
                          onDecrement={() => decrementProduct(item.product)}
                          size="small"
                        />

                        {/* Calculation preview: ₹250 × 5 = ₹1,250 */}
                        <div className="text-right">
                          <div className="text-xs text-slate-500 font-medium">
                            {formatCurrency(item.product.price)} × {item.quantity}
                          </div>
                          <div className="text-sm font-extrabold text-slate-900">
                            = {formatCurrency(lineTotal)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with Summary & Checkout */}
          {cartItems.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50/90 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-slate-600 font-medium">
                  <span>Selected Items</span>
                  <span>{totalCount} items</span>
                </div>
                <div className="flex items-center justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200/80">
                  <span className="text-lg">Total</span>
                  <span className="text-2xl font-extrabold text-emerald-700">
                    {formatCurrency(totalAmount)}
                  </span>
                </div>
              </div>

              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <span>Place Order on WhatsApp</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
