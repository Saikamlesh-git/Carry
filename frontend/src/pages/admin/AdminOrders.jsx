import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  ShoppingBag,
  Eye,
  Trash2,
  Filter,
  RefreshCw,
} from 'lucide-react';
import api from '../../services/api';
import { formatCurrency } from '../../services/whatsapp';
import { useToast } from '../../context/ToastContext';
import OrderDetailModal from '../../components/admin/OrderDetailModal';
import ConfirmDialog from '../../components/admin/ConfirmDialog';

const STATUS_FILTERS = ['All', 'New', 'Processing', 'Completed', 'Cancelled'];

export default function AdminOrders() {
  const { addToast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedOrderLoading, setSelectedOrderLoading] = useState(false);

  // Delete single order dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Clear all orders dialog state
  const [clearAllDialogOpen, setClearAllDialogOpen] = useState(false);
  const [clearingAll, setClearingAll] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/orders');
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching admin orders:', err);
      addToast('Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleViewOrder = async (orderId) => {
    setSelectedOrderLoading(true);
    try {
      const res = await api.get(`/admin/orders/${orderId}`);
      setSelectedOrder(res.data);
    } catch (err) {
      console.error('Error loading order details:', err);
      addToast('Unable to fetch order details', 'error');
    } finally {
      setSelectedOrderLoading(false);
    }
  };

  const handleStatusUpdated = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleDeleteOrderConfirm = async () => {
    if (!orderToDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/admin/orders/${orderToDelete.id}`);
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      addToast(`Order ${orderToDelete.order_number} deleted successfully.`);
      setDeleteDialogOpen(false);
      setOrderToDelete(null);
    } catch (err) {
      addToast('Error deleting order.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleClearAllOrdersConfirm = async () => {
    setClearingAll(true);
    try {
      const res = await api.delete('/admin/orders');
      setOrders([]);
      addToast(res.data?.message || 'All orders have been cleared.');
      setClearAllDialogOpen(false);
    } catch (err) {
      addToast('Error clearing orders.', 'error');
    } finally {
      setClearingAll(false);
    }
  };

  // Filter orders by status, search, and date
  const filteredOrders = useMemo(() => {
    return orders.filter((ord) => {
      // Status Filter
      const statusMatch =
        statusFilter === 'All' || ord.status.toLowerCase() === statusFilter.toLowerCase();

      // Search (Hotel name or Order ID)
      const q = searchQuery.toLowerCase().trim();
      const searchMatch =
        !q ||
        ord.order_number.toLowerCase().includes(q) ||
        ord.hotel_name.toLowerCase().includes(q);

      // Date Filter (YYYY-MM-DD match)
      let dateMatch = true;
      if (dateFilter) {
        const orderDateStr = new Date(ord.created_at).toISOString().split('T')[0];
        dateMatch = orderDateStr === dateFilter;
      }

      return statusMatch && searchMatch && dateMatch;
    });
  }, [orders, statusFilter, searchQuery, dateFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Order Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
            Monitor, inspect and manage orders placed across all hotel & catering businesses
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {orders.length > 0 && (
            <button
              onClick={() => setClearAllDialogOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 hover:bg-rose-100 shadow-2xs transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Orders</span>
            </button>
          )}

          <button
            onClick={loadOrders}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Orders</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
          {STATUS_FILTERS.map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        {/* Search & Date Filter Row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Hotel Name or Order Number..."
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
              Date:
            </span>
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
            />
            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="text-xs text-slate-400 hover:text-slate-700 font-bold px-1 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                <th className="px-6 py-3.5">Order ID</th>
                <th className="px-6 py-3.5">Hotel Name</th>
                <th className="px-6 py-3.5">Date</th>
                <th className="px-6 py-3.5">Items</th>
                <th className="px-6 py-3.5">Total Amount</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan="7" className="px-6 py-10 text-center text-slate-400">
                    Loading orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                    <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto mb-2 stroke-[1.5]" />
                    <p className="font-bold">No orders found</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      No matching records found for this filter criteria.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const d = new Date(ord.created_at);
                  const formattedDate = d.toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  });
                  const formattedTime = d.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                  });

                  return (
                    <tr key={ord.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-emerald-700">
                        {ord.order_number}
                      </td>

                      <td className="px-6 py-4 font-bold text-slate-900">
                        {ord.hotel_name}
                      </td>

                      <td className="px-6 py-4 text-xs text-slate-600">
                        <span className="font-semibold block">{formattedDate}</span>
                        <span className="text-slate-400">{formattedTime}</span>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-700">
                          {ord.item_count} items
                        </span>
                      </td>

                      <td className="px-6 py-4 font-extrabold text-slate-950">
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
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            onClick={() => handleViewOrder(ord.id)}
                            disabled={selectedOrderLoading}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                            title="View Order Details"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setOrderToDelete(ord);
                              setDeleteDialogOpen(true);
                            }}
                            className="inline-flex items-center justify-center p-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                            title="Delete Order Data"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <OrderDetailModal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        order={selectedOrder}
        onStatusUpdated={handleStatusUpdated}
      />

      {/* Delete Single Order Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        title="Delete Order Data"
        message={`Are you sure you want to permanently delete order "${orderToDelete?.order_number}" for ${orderToDelete?.hotel_name}? This action cannot be undone.`}
        confirmText="Delete Order"
        loading={deleting}
        danger={true}
        onConfirm={handleDeleteOrderConfirm}
        onCancel={() => {
          setDeleteDialogOpen(false);
          setOrderToDelete(null);
        }}
      />

      {/* Clear All Orders Confirm Dialog */}
      <ConfirmDialog
        isOpen={clearAllDialogOpen}
        title="Clear All Orders"
        message={`Are you sure you want to permanently delete ALL ${orders.length} orders from the database? This action cannot be undone.`}
        confirmText="Clear All Data"
        loading={clearingAll}
        danger={true}
        onConfirm={handleClearAllOrdersConfirm}
        onCancel={() => setClearAllDialogOpen(false)}
      />
    </div>
  );
}
