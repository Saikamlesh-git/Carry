import React, { useState } from 'react';
import { CheckCircle2, MessageSquare, ArrowLeft, Loader2, Hotel } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import {
  formatCurrency,
  generateWhatsAppMessage,
  buildWhatsAppUrl,
} from '../../services/whatsapp';

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
  const [submitting, setSubmitting] = useState(false);

  if (!isConfirmModalOpen) return null;

  const handleConfirmAndSend = async () => {
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

    setSubmitting(true);
    try {
      // 1. Store order in database
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

      // 2. Generate WhatsApp message & dispatch
      const messageText = generateWhatsAppMessage({
        hotelName,
        items: cartItems,
        totalAmount,
      });

      const targetNumber = whatsappNumber || '+919876543210';
      const waUrl = buildWhatsAppUrl(targetNumber, messageText);

      // Open WhatsApp in new tab
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // 3. Clear cart and redirect to order-success page
      clearCart();
      setIsConfirmModalOpen(false);

      navigate('/order-success', {
        state: {
          order: savedOrder,
          items: cartItems,
          hotelName,
          waUrl,
        },
      });
    } catch (err) {
      console.error('Order submission error:', err);
      addToast(
        err.response?.data?.detail || 'Unable to submit order. Please try again.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-extrabold tracking-tight">
            Confirm Your Order
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Review your order before sending directly to WhatsApp
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Hotel Name Highlight */}
          <div className="bg-emerald-50 border border-emerald-200/70 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
              <Hotel className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                Hotel Name
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {hotelName}
              </span>
            </div>
          </div>

          {/* Product Items List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Products
            </span>
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 border border-slate-200/80 rounded-2xl p-3 bg-slate-50/50">
              {cartItems.map((item) => (
                <div
                  key={item.product.id}
                  className="pt-2 first:pt-0 flex items-center justify-between text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 flex-shrink-0" />
                    <span className="font-semibold text-slate-800">
                      {item.product.name}
                    </span>
                    <span className="text-xs text-slate-500 font-bold">
                      × {item.quantity}
                    </span>
                  </div>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-100 border border-slate-200">
            <span className="text-base font-bold text-slate-700">Total</span>
            <span className="text-2xl font-extrabold text-emerald-700">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={handleConfirmAndSend}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Processing Order...</span>
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  <span>Confirm & Send to WhatsApp</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-2xl font-bold text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Go Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
