import React, { useState, useEffect } from 'react';
import {
  Package,
  FolderTree,
  ShoppingBag,
  TrendingUp,
  AlertCircle,
  Eye,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../services/whatsapp';
import { useToast } from '../../context/ToastContext';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

export default function AdminDashboard() {
  const { addToast } = useToast();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);

  // Delete order state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteOrderConfirm = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/orders/${orderToDelete.id}`);
      addToast(`Order ${orderToDelete.order_number} deleted successfully.`);
      setStats((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          total_orders: Math.max(0, prev.total_orders - 1),
          recent_orders: prev.recent_orders.filter((o) => o.id !== orderToDelete.id),
        };
      });
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      addToast('Error deleting order.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleViewOrder = async (orderId) => {
    setSelectedOrderLoading(true);
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Error fetching order details:', err);
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  const handleStatusUpdated = (orderId, newStatus) => {
    setStats((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        recent_orders: prev.recent_orders.map((o) =>
          o.id === orderId ? { ...o, status: newStatus } : o
        ),
      };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Real-time catalog metrics and incoming hotel order requests
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors self-start cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 5 KPI Stat Cards (Responsive Grid: 2 cols on mobile, 5 on desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-4">
        {/* Total Products */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <Package className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
              Products
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {loading ? '—' : stats?.total_products ?? 0}
            </span>
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center flex-shrink-0">
            <FolderTree className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
              Categories
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {loading ? '—' : stats?.total_categories ?? 0}
            </span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <ShoppingBag className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
              Total Orders
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900">
              {loading ? '—' : stats?.total_orders ?? 0}
            </span>
          </div>
        </div>

        {/* New Orders */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
              New Orders
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-600">
              {loading ? '—' : stats?.new_orders ?? 0}
            </span>
          </div>
        </div>

        {/* Total Order Value */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-200/80 shadow-xs flex items-center gap-3 col-span-2 sm:col-span-1">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-wider block truncate">
              Total Value
            </span>
            <span className="text-lg sm:text-xl font-black text-slate-900">
              {loading ? '—' : formatCurrency(stats?.total_order_value ?? 0)}
            </span>
          </div>
        </div>
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
              Recent Orders
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest transactions placed from hotel partners
            </p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 text-sm">
            Loading recent orders...
          </div>
        ) : stats?.recent_orders?.length === 0 ? (
          <div className="py-8 text-center text-slate-500 font-medium text-sm">
            No orders yet.
          </div>
        ) : (
          <>
            {/* Mobile Recent Orders Cards (< md) */}
            <div className="md:hidden divide-y divide-slate-100">
              {stats?.recent_orders?.map((ord) => {
                const d = new Date(ord.created_at);
                const formatted = d.toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                });

                return (
                  <div key={ord.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                        {ord.order_number}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                          ord.status === 'New'
                            ? 'bg-amber-100 text-amber-800'
                            : ord.status === 'Processing'
                            ? 'bg-sky-100 text-sky-800'
                            : ord.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {ord.hotel_name}
                        </h4>
                        <span className="text-[11px] text-slate-400 font-medium">
                          {formatted}
                        </span>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-black text-slate-900">
                          {formatCurrency(ord.total_amount)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-1">
                      <button
                        onClick={() => handleViewOrder(ord.id)}
                        disabled={selectedOrderLoading}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                      <button
                        onClick={() => {
                          setOrderToDelete(ord);
                          setDeleteDialogOpen(true);
                        }}
                        className="inline-flex items-center p-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Desktop Table (>= md) */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <th className="px-6 py-3.5">Order ID</th>
                    <th className="px-6 py-3.5">Hotel Name</th>
                    <th className="px-6 py-3.5">Date</th>
                    <th className="px-6 py-3.5">Total</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {stats?.recent_orders?.map((ord) => {
                    const d = new Date(ord.created_at);
                    const formatted = d.toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    });

                    return (
                      <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-emerald-700">
                          {ord.order_number}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {ord.hotel_name}
                        </td>
                        <td className="px-6 py-4 text-slate-500 text-xs font-medium">
                          {formatted}
                        </td>
                        <td className="px-6 py-4 font-extrabold text-slate-900">
                          {formatCurrency(ord.total_amount)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-2.5 py-1 text-xs font-bold rounded-full ${
                              ord.status === 'New'
                                ? 'bg-amber-100 text-amber-800'
                                : ord.status === 'Processing'
                                ? 'bg-sky-100 text-sky-800'
                                : ord.status === 'Completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="inline-flex items-center gap-1.5 justify-end">
                            <button
                              onClick={() => handleViewOrder(ord.id)}
                              disabled={selectedOrderLoading}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                              title="View Order"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>View</span>
                            </button>
                            <button
                              onClick={() => {
                                setOrderToDelete(ord);
                                setDeleteDialogOpen(true);
                              }}
                              className="inline-flex items-center p-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              title="Delete Order"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Delete Order Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Order Data"
        message={`Are you sure you want to delete order "${orderToDelete?.order_number}" for ${orderToDelete?.hotel_name}?`}
        confirmText="Delete Order"
        loading={deleting}
        danger={true}
        onConfirm={handleDeleteOrderConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setOrderToDelete(null);
        }}
      />
    </div>
  );
}
