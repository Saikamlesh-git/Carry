import React, { useState } from 'react';
import { X, Calendar, Clock, Hotel, Package, Loader2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '../../services/whatsapp';
import api from '../../services/api';

const STATUS_OPTIONS = ['New', 'Processing', 'Completed', 'Cancelled'];

export default function OrderDetailModal({ isOpen, onClose, order, onStatusUpdated }) {
  if (!isOpen || !order) return null;

  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  // Format date and time
  const orderDate = order.created_at ? new Date(order.created_at) : new Date();
  const formattedDate = orderDate.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
  const formattedTime = orderDate.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const handleStatusChange = async (newStatus) => {
    setCurrentStatus(newStatus);
    setUpdating(true);
    setMessage('');
    try {
      await api.patch(`/admin/orders/${order.id}/status`, { status: newStatus });
      setMessage(`Status updated to ${newStatus}`);
      if (onStatusUpdated) onStatusUpdated(order.id, newStatus);
    } catch (err) {
      console.error('Error updating status:', err);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-base font-extrabold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-lg border border-emerald-300">
                {order.order_number}
              </span>
              <span
                className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                  currentStatus === 'New'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : currentStatus === 'Processing'
                    ? 'bg-sky-100 text-sky-800 border border-sky-300'
                    : currentStatus === 'Completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {currentStatus}
              </span>
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 mt-2">
              Order Details
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Hotel & Timestamps Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-2xl p-4 border border-slate-200/80">
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Hotel className="w-3.5 h-3.5 text-emerald-600" />
                Hotel
              </span>
              <p className="text-sm font-extrabold text-slate-900 truncate">
                {order.hotel_name}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Date
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {formattedDate}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Time
              </span>
              <p className="text-sm font-semibold text-slate-800">
                {formattedTime}
              </p>
            </div>
          </div>

          {/* Status Change Strip */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider block">
                  Change Order Status
                </span>
                <span className="text-xs text-emerald-800">
                  Update customer fulfillment state in real-time
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {STATUS_OPTIONS.map((st) => (
                  <button
                    key={st}
                    disabled={updating}
                    onClick={() => handleStatusChange(st)}
                    className={`flex-1 sm:flex-initial text-center px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentStatus === st
                        ? 'bg-emerald-700 text-white shadow-sm'
                        : 'bg-white text-slate-700 hover:bg-emerald-100/50 border border-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {message && (
              <div className="flex items-center gap-1 text-xs text-emerald-800 font-semibold mt-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{message}</span>
              </div>
            )}
          </div>

          {/* Itemized Products Snapshot */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-slate-400" />
              <span>Products Ordered (Historical Price Snapshot)</span>
            </h4>

            <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="p-4 bg-white flex items-center justify-between gap-4 text-sm"
                >
                  <div>
                    <h5 className="font-bold text-slate-900">
                      {item.product_name_snapshot}
                    </h5>
                    <span className="text-xs text-slate-500">
                      Unit: {item.unit_type_snapshot}
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-500 block">
                      {item.quantity} × {formatCurrency(item.price_snapshot)}
                    </span>
                    <span className="font-bold text-slate-900 text-sm">
                      = {formatCurrency(item.total)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Grand Total */}
          <div className="p-4 bg-slate-900 text-white rounded-2xl flex items-center justify-between">
            <span className="text-base font-bold text-slate-300">Grand Total</span>
            <span className="text-2xl font-extrabold text-emerald-400">
              {formatCurrency(order.total_amount)}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-end bg-slate-50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
