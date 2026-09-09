import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, MessageSquare, ArrowRight, Home, Package, Hotel } from 'lucide-react';
import Header from '../../components/common/Header';
import { formatCurrency } from '../../services/whatsapp';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state || {};
  const { order, hotelName, waUrl } = state;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header onOpenHotelModal={() => {}} />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8 sm:py-12 flex flex-col items-center justify-center">
        <div className="bg-white w-full rounded-3xl border border-slate-200 shadow-xl overflow-hidden text-center">
          {/* Top Success Banner */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white relative">
            <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center mx-auto mb-4 border border-white/30 shadow-inner">
              <CheckCircle2 className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Order Dispatched!
            </h1>
            <p className="text-emerald-100 text-sm mt-1 max-w-sm mx-auto">
              Your order was saved and dispatched directly to WhatsApp.
            </p>
          </div>

          {/* Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Order Number
                </span>
                <span className="font-mono text-base font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                  {order?.order_number || 'ORD-COMPLETED'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Hotel className="w-4 h-4 text-slate-400" />
                  Hotel Name
                </span>
                <span className="font-bold text-slate-900">
                  {hotelName || order?.hotel_name || 'Sri Krishna Hotel'}
                </span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 font-medium flex items-center gap-1.5">
                  <Package className="w-4 h-4 text-slate-400" />
                  Total Amount
                </span>
                <span className="font-extrabold text-slate-900 text-base">
                  {formatCurrency(order?.total_amount || 0)}
                </span>
              </div>
            </div>

            {/* WhatsApp Reminder Button */}
            {waUrl && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-left flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4 text-emerald-700" />
                    WhatsApp not opened?
                  </h4>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Click here to manually open WhatsApp and send your message.
                  </p>
                </div>
                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex-shrink-0"
                >
                  <span>Open WhatsApp</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Navigation back */}
            <div className="pt-2">
              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-base bg-slate-900 text-white hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Start New Order</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
