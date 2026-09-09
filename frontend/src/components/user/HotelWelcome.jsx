import React, { useState } from 'react';
import { ArrowRight, Utensils, AlertCircle } from 'lucide-react';
import Logo from '../common/Logo';
import { useCart } from '../../context/CartContext';

export default function HotelWelcome({ isOpen, onClose, isEdit = false }) {
  const { hotelName, setHotelName } = useCart();
  const [nameInput, setNameInput] = useState(hotelName || '');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = nameInput.trim();
    if (!trimmed) {
      setError('Please enter your hotel name to continue.');
      return;
    }
    setError('');
    setHotelName(trimmed);
    if (onClose) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md transition-opacity">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all duration-300 animate-in fade-in zoom-in-95">
        {/* Top Decorative Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-800 p-8 text-white relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="flex flex-col items-center text-center relative z-10">
            <Logo size="large" variant="dark" />
            <h2 className="mt-4 text-xl sm:text-2xl font-bold tracking-tight text-white">
              Hotel Essentials. Simple Ordering.
            </h2>
            <p className="mt-2 text-emerald-100 text-xs sm:text-sm leading-relaxed max-w-xs font-normal">
              Order carry bags, sheets, rolls, containers, cups and other hotel essentials quickly and easily.
            </p>
          </div>
        </div>

        {/* Input Form Body */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="hotel-input" className="block text-sm font-bold text-slate-800 mb-1.5 flex items-center gap-1.5">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>Enter Hotel Name</span>
              </label>
              <input
                id="hotel-input"
                type="text"
                autoFocus
                value={nameInput}
                onChange={(e) => {
                  setNameInput(e.target.value);
                  if (error) setError('');
                }}
                placeholder="Enter your hotel / restaurant name"
                className={`w-full px-4 py-3.5 rounded-xl border text-base font-medium transition-colors outline-none focus:ring-2 ${
                  error
                    ? 'border-rose-300 bg-rose-50/40 focus:ring-rose-500/20 focus:border-rose-500 text-slate-900'
                    : 'border-slate-300 bg-white focus:ring-emerald-500/20 focus:border-emerald-600 text-slate-900'
                }`}
              />
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2 font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-base text-white bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
              >
                <span>{isEdit ? 'Update Hotel Name' : 'Continue'}</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>

            {isEdit && (
              <button
                type="button"
                onClick={onClose}
                className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
