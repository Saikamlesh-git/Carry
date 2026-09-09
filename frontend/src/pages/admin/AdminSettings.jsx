import React, { useState, useEffect } from 'react';
import { Settings, Save, Loader2, MessageSquare, Building2, Tag, CheckCircle2 } from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    whatsapp_number: '',
    business_name: '',
    currency: '₹',
    order_prefix: 'ORD-',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/settings');
      setFormData(res.data);
    } catch (err) {
      console.error('Error loading settings:', err);
      addToast('Error fetching settings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.whatsapp_number.trim()) {
      addToast('WhatsApp number is required.', 'error');
      return;
    }

    setSaving(true);
    setSuccessMessage('');
    try {
      const res = await api.put('/admin/settings', formData);
      setFormData(res.data);
      setSuccessMessage('Settings saved successfully!');
      addToast('System settings updated successfully.');
    } catch (err) {
      addToast('Error updating settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          System Settings
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 font-medium">
          Configure WhatsApp order receiver, business identity and operational preferences
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8">
        {loading ? (
          <div className="py-12 text-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-emerald-600" />
            <span className="text-sm font-medium">Loading settings...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {successMessage && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* WhatsApp Business Number */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Business Number *</span>
              </label>
              <div className="relative max-w-md">
                <input
                  type="text"
                  required
                  value={formData.whatsapp_number}
                  onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                  placeholder="+919876543210"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
              <p className="text-xs text-slate-500 max-w-lg leading-relaxed">
                All customer WhatsApp orders from the store will be dispatched directly to this WhatsApp contact number. Include country code (e.g. <code>+919876543210</code>).
              </p>
            </div>

            {/* Business Name */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-emerald-600" />
                <span>Business / Trading Name</span>
              </label>
              <div className="relative max-w-md">
                <input
                  type="text"
                  required
                  value={formData.business_name}
                  onChange={(e) => setFormData({ ...formData, business_name: e.target.value })}
                  placeholder="Carry Hotel Supplies"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
              </div>
              <p className="text-xs text-slate-500">
                Official entity name shown on receipts and administrative portals.
              </p>
            </div>

            {/* Currency Symbol & Order Prefix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-600" />
                  <span>Currency Symbol</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  placeholder="₹"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <p className="text-xs text-slate-500">
                  Default currency symbol: <strong>₹ (INR)</strong>
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Settings className="w-4 h-4 text-emerald-600" />
                  <span>Order Number Prefix</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.order_prefix}
                  onChange={(e) => setFormData({ ...formData, order_prefix: e.target.value })}
                  placeholder="ORD-"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 outline-none"
                />
                <p className="text-xs text-slate-500">
                  Sequential order numbering prefix (e.g. <code>ORD-000123</code>).
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span>Save Settings</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
