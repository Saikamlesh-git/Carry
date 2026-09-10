import React, { useState } from 'react';
import {
  CheckCircle2, MessageSquare, ArrowLeft, Loader2, Hotel,
  ExternalLink, Send, XCircle, RefreshCw, ShoppingBag
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  formatCurrency,
  generateWhatsAppMessage,
  buildWhatsAppUrl,
} from '../../services/whatsapp';

// step: 'review' | 'verify'
export default function OrderConfirmModal({ whatsappNumber }) {
  const {
    isConfirmModalOpen,
    setIsConfirmModalOpen,
    hotelName,
    cartItems,
    totalAmount,
    clearCart,
  } = useCart();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState('review');
  const [waUrl, setWaUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isConfirmModalOpen) return null;

  const totalCount = cartItems.reduce((sum, i) => sum + i.quantity, 0);

  const handleOpenWhatsApp = () => {
    if (!hotelName) {
      addToast('Hotel name is required to place an order.', 'error');
      setIsConfirmModalOpen(false);
      return;
    }
    if (cartItems.length === 0) {
      addToast('Your cart is empty.', 'error');
      setIsConfirmModalOpen(false);
      return;
    }

    const messageText = generateWhatsAppMessage({ hotelName, items: cartItems, totalAmount });
    const targetNumber = whatsappNumber || '+919876543210';
    const url = buildWhatsAppUrl(targetNumber, messageText);
    setWaUrl(url);

    window.open(url, '_blank', 'noopener,noreferrer');
    setStep('verify');
  };

  const handleConfirmSent = async () => {
    setSubmitting(true);
    try {
      const orderPayload = {
        hotel_name: hotelName,
        items: cartItems.map((it) => ({
          product_id: it.product.id,
          quantity: it.quantity,
        })),
        notes: 'Placed via WhatsApp customer portal',
      };

      const res = await api.post('/orders', orderPayload);
      const savedOrder = res.data;

      clearCart();
      setIsConfirmModalOpen(false);
      setStep('review');
      navigate('/order-success', {
        state: {
          order: savedOrder,
          items: cartItems,
          hotelName,
          waUrl,
        },
      });
    } catch (err) {
      console.error('Order save error:', err);
      addToast(
        err.response?.data?.detail || 'Unable to save order. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setIsConfirmModalOpen(false);
    setStep('review');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/70 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-h-[95vh] flex flex-col animate-in fade-in slide-in-from-bottom duration-300">

        {/* ─── STEP 1: REVIEW ─── */}
        {step === 'review' && (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 text-white text-center flex-shrink-0">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-transparent to-transparent" />
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-950/30">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">Review Your Order</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Verify items, then send directly via WhatsApp
                </p>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Hotel Pill */}
              <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200/70 rounded-2xl p-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 shadow-md shadow-emerald-600/20">
                  <Hotel className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest block">
                    Ordering For
                  </span>
                  <span className="text-base font-extrabold text-slate-900 leading-tight">{hotelName}</span>
                </div>
              </div>

              {/* Items List */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  {totalCount} Item{totalCount !== 1 ? 's' : ''}
                </span>
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50 bg-slate-50/50 max-h-44 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.product.id}
                      className="px-4 py-2.5 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{item.product.name}</span>
                        <span className="text-xs font-bold text-slate-400 flex-shrink-0">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 flex-shrink-0 ml-3">
                        {formatCurrency(item.product.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grand Total */}
              <div className="flex items-center justify-between px-4 py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700">
                <span className="text-sm font-bold text-slate-300">Grand Total</span>
                <span className="text-2xl font-black text-emerald-400">{formatCurrency(totalAmount)}</span>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-4 space-y-2.5 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
              <button
                onClick={handleOpenWhatsApp}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.99] shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <MessageSquare className="w-5 h-5" />
                <span>Open WhatsApp to Send</span>
                <ExternalLink className="w-4 h-4 opacity-70" />
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Go Back to Cart</span>
              </button>
            </div>
          </>
        )}

        {/* ─── STEP 2: VERIFY ─── */}
        {step === 'verify' && (
          <>
            {/* Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 p-6 text-white text-center flex-shrink-0 overflow-hidden">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
              <div className="relative">
                <div className="w-14 h-14 rounded-full bg-white/20 border border-white/30 flex items-center justify-center mx-auto mb-3 shadow-lg">
                  <Send className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-extrabold tracking-tight">Did You Send the Order?</h3>
                <p className="text-xs text-emerald-100 mt-1.5 max-w-xs mx-auto">
                  WhatsApp was opened with your order message. Confirm only after you've sent it — your order is saved only upon confirmation.
                </p>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-5 space-y-4 flex-1">
              {/* Order Summary Pill */}
              <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
                    <Hotel className="w-4.5 h-4.5 text-emerald-700" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Hotel</span>
                    <span className="text-sm font-extrabold text-slate-900">{hotelName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total</span>
                  <span className="text-base font-black text-emerald-700">{formatCurrency(totalAmount)}</span>
                </div>
              </div>

              {/* Reopen link */}
              {waUrl && (
                <div className="flex items-center gap-3 bg-amber-50 border border-amber-200/80 rounded-2xl p-4">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-4 h-4 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-amber-900 block">WhatsApp didn't open?</span>
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-amber-700 font-semibold underline hover:text-amber-900 flex items-center gap-1 mt-0.5"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Reopen WhatsApp
                    </a>
                  </div>
                </div>
              )}

              <p className="text-xs text-center text-slate-400 font-medium px-2">
                ⚠️ Your order will <strong className="text-slate-600">only</strong> be recorded after you confirm it was sent.
              </p>
            </div>

            {/* Footer Actions */}
            <div className="p-4 space-y-2.5 border-t border-slate-100 bg-slate-50/60 flex-shrink-0">
              <button
                onClick={handleConfirmSent}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl font-bold text-base text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-[0.99] shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Saving Order...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Yes, Order Sent on WhatsApp</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                <span>No, I Didn't Send / Cancel</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
