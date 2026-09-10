import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ShoppingBag, AlertCircle, RefreshCw } from 'lucide-react';
import Header from '../../components/common/Header';
import HotelWelcome from '../../components/user/HotelWelcome';
import CategoryTabs from '../../components/user/CategoryTabs';
import ProductCard from '../../components/user/ProductCard';
import CartDrawer from '../../components/user/CartDrawer';
import OrderConfirmModal from '../../components/user/OrderConfirmModal';
import { ProductSkeletonGrid } from '../../components/common/LoadingSkeleton';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/whatsapp';
import api from '../../services/api';

export default function OrderPage() {
  const { hotelName, totalCount, totalAmount, setIsCartOpen } = useCart();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({ whatsapp_number: '+919876543210' });
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);

  // Fetch live products, categories, and settings from the server
  const fetchData = async (isManual = false) => {
    try {
      if (isManual) setRefreshing(true);
      const [catRes, prodRes, setRes] = await Promise.all([
        api.get('/categories'),
        api.get('/products'),
        api.get('/settings/public'),
      ]);
      setCategories(catRes.data);
      setProducts(prodRes.data);
      setSettings(setRes.data);
    } catch (err) {
      console.error('Error loading storefront data:', err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Auto-sync when user switches back to this tab/app on any device
    const handleVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('focus', handleVisibilityOrFocus);

    // Periodic live sync every 25 seconds across devices
    const intervalId = setInterval(() => {
      if (document.visibilityState === 'visible') {
        fetchData();
      }
    }, 25000);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('focus', handleVisibilityOrFocus);
      clearInterval(intervalId);
    };
  }, []);

  // Filter products based on category and search query
  const filteredProducts = useMemo(() => {
    let list = products;

    if (selectedCategoryId !== null) {
      list = list.filter((p) => p.category_id === selectedCategoryId);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const nameMatch = p.name.toLowerCase().includes(q);
        const skuMatch = p.sku ? p.sku.toLowerCase().includes(q) : false;
        const catMatch = p.category_name ? p.category_name.toLowerCase().includes(q) : false;
        const descMatch = p.description ? p.description.toLowerCase().includes(q) : false;
        return nameMatch || skuMatch || catMatch || descMatch;
      });
    }

    return list;
  }, [products, selectedCategoryId, searchQuery]);

  return (
    <div className="min-h-screen bg-mesh-slate flex flex-col selection:bg-emerald-500 selection:text-white pb-24 md:pb-12">
      {/* Public Storefront Header */}
      <Header onOpenHotelModal={() => setIsHotelModalOpen(true)} />

      {/* ─── Hero Banner ─── */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full bg-emerald-500/8 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl" />
        <div className="absolute top-8 right-1/3 w-32 h-32 rounded-full bg-emerald-400/6 blur-2xl" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          {/* Value badges */}
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {['Wholesale Pricing', 'WhatsApp Ordering', 'Fast Dispatch'].map((badge) => (
              <span
                key={badge}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 tracking-wide"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                {badge}
              </span>
            ))}
          </div>

          {/* Headline */}
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight max-w-2xl">
            Hotel Packaging &amp;{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #34d399 0%, #2dd4bf 50%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}
            >
              Daily Essentials
            </span>{' '}
            Made Simple
          </h2>
          <p className="mt-2 text-slate-400 text-sm font-medium max-w-lg">
            Browse our curated selection of carry bags, sheets, foils, containers, cups and more — ordered directly through WhatsApp.
          </p>

          {/* Search bar */}
          <div className="mt-6 max-w-xl flex items-center gap-3">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-4.5 h-4.5 text-slate-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search carry bags, foils, containers…"
                className="input-field w-full pl-11 pr-10 py-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl text-sm font-medium text-white placeholder:text-slate-500 focus:bg-white/15 focus:border-emerald-400/50 focus:ring-0 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white cursor-pointer"
                  aria-label="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <button
              onClick={() => fetchData(true)}
              disabled={refreshing}
              title="Sync latest products"
              className="flex-shrink-0 p-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/20 text-slate-300 hover:text-white transition-all btn-press disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`w-4.5 h-4.5 ${refreshing ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
          </div>

          {/* Live item count */}
          {!loading && (
            <p className="mt-3 text-xs text-slate-500 font-medium">
              Showing <span className="text-emerald-400 font-bold">{filteredProducts.length}</span> of {products.length} products
              {searchQuery && (
                <span className="ml-1.5 text-slate-400">for &ldquo;<span className="text-slate-300">{searchQuery}</span>&rdquo;</span>
              )}
            </p>
          )}
        </div>
      </div>

      {/* Horizontal Category Pill Bar */}
      <CategoryTabs
        categories={categories}
        selectedCategoryId={selectedCategoryId}
        onSelectCategory={setSelectedCategoryId}
        totalProductsCount={products.length}
      />

      {/* Main Product Grid Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex-1 w-full">
        {loading ? (
          <ProductSkeletonGrid count={8} />
        ) : filteredProducts.length === 0 ? (
          <div className="my-12 py-16 px-4 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-4">
              <AlertCircle className="w-8 h-8 stroke-[1.5]" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              {searchQuery ? 'No products found. Try another search.' : 'No products available in this category.'}
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              {searchQuery
                ? 'Check your spelling or try searching for carry bags, rolls, sheets, or containers.'
                : 'Please check other packaging categories or return to All.'}
            </p>
            {(searchQuery || selectedCategoryId !== null) && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategoryId(null);
                }}
                className="mt-5 px-5 py-2.5 rounded-xl font-bold text-sm bg-slate-900 text-white hover:bg-slate-800 transition-all cursor-pointer"
              >
                Reset Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </main>

      {/* ─── Floating Mobile Cart Bar ─── */}
      {totalCount > 0 && (
        <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 animate-slide-up">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl shadow-2xl shadow-emerald-950/30 active:scale-[0.99] transition-transform cursor-pointer btn-press"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-sm text-white">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'}
                </div>
                <div className="text-[11px] text-emerald-100/80 font-medium truncate max-w-[160px]">
                  {hotelName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <span className="text-lg font-black text-white">
                {formatCurrency(totalAmount)}
              </span>
              <div className="bg-white/20 text-white text-xs font-bold px-2.5 py-1 rounded-xl">
                View
              </div>
            </div>
          </button>
        </div>
      )}

      {/* Slide-in Cart Drawer */}
      <CartDrawer />

      {/* Order Confirmation Modal */}
      <OrderConfirmModal whatsappNumber={settings?.whatsapp_number} />

      {/* Hotel Welcome Modal (shows if hotelName not set, or when user clicks Edit) */}
      <HotelWelcome
        isOpen={!hotelName || isHotelModalOpen}
        onClose={() => setIsHotelModalOpen(false)}
        isEdit={!!hotelName}
      />
    </div>
  );
}
