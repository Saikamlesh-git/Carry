import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  CheckCircle2, MessageSquare, Home, Package, Hotel, ArrowRight, Clock
} from 'lucide-react';
import Header from '../../components/common/Header';
import { formatCurrency } from '../../services/whatsapp';

export default function OrderSuccessPage() {
  const location = useLocation();
  const state = location.state || {};
  const { order, items = [], hotelName, waUrl } = state;

  const orderDate = order?.created_at ? new Date(order.created_at) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });
  const formattedTime = orderDate.toLocaleTimeString('en-US', {
    hour: 'numeric', minute: '2-digit', hour12: true
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50/30 flex flex-col">
      <Header onOpenHotelModal={() => {}} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="bg-white w-full rounded-3xl border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden">

          {/* ── Success Banner ── */}
          <div className="relative bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white text-center overflow-hidden">
            {/* Decorative circles */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5" />
            <div className="absolute -bottom-14 -left-14 w-56 h-56 rounded-full bg-white/5" />

            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-emerald-950/30 animate-in zoom-in duration-500">
                <CheckCircle2 className="w-10 h-10 text-white stroke-[1.8]" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Order Confirmed! 🎉</h1>
              <p className="text-emerald-100/90 text-sm mt-2 max-w-sm mx-auto font-medium">
                Your order has been recorded and dispatched to WhatsApp successfully.
              </p>

              {/* Order Number Badge */}
              {order?.order_number && (
                <div className="inline-flex items-center gap-2 mt-4 bg-white/15 border border-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Package className="w-4 h-4 text-emerald-200" />
                  <span className="font-mono text-base font-extrabold text-white tracking-wide">
                    {order.order_number}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ── Details ── */}
          <div className="p-6 sm:p-8 space-y-5">

            {/* Meta row */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                  <Hotel className="w-3 h-3" /> Hotel
                </span>
                <span className="font-extrabold text-slate-900 text-sm leading-tight">
                  {hotelName || order?.hotel_name || '—'}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Time
                </span>
                <span className="font-bold text-slate-700 text-sm leading-tight">
                  {formattedDate}<br />
                  <span className="text-xs text-slate-500 font-medium">{formattedTime}</span>
                </span>
              </div>
            </div>

            {/* Items receipt */}
            {items.length > 0 && (
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                  Items Ordered
                </span>
                <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-50 bg-slate-50/50">
                  {items.map((item) => (
                    <div
                      key={item.product?.id}
                      className="px-4 py-2.5 flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                        <span className="font-semibold text-slate-800 truncate">{item.product?.name}</span>
                        <span className="text-xs font-bold text-slate-400 flex-shrink-0">× {item.quantity}</span>
                      </div>
                      <span className="font-bold text-slate-900 flex-shrink-0 ml-2">
                        {formatCurrency(item.product?.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Grand Total */}
            <div className="flex items-center justify-between px-5 py-4 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 border border-slate-700">
              <span className="text-sm font-bold text-slate-300">Grand Total</span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCurrency(order?.total_amount || 0)}
              </span>
            </div>

            {/* WhatsApp reminder */}
            {waUrl && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    Need to re-send?
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                    Open WhatsApp again to resend the same order message.
                  </p>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex-shrink-0 shadow-md shadow-emerald-600/20"
                >
                  Open WhatsApp
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* CTA */}
            <Link
              to="/"
              className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-base bg-gradient-to-r from-slate-900 to-slate-800 text-white hover:from-slate-800 hover:to-slate-700 transition-all shadow-lg shadow-slate-900/15 cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>Start a New Order</span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
