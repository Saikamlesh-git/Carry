import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, ShoppingBag, AlertCircle } from 'lucide-react';
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
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [settings, setSettings] = useState({ whatsapp_number: '+919876543210' });
  const [isHotelModalOpen, setIsHotelModalOpen] = useState(false);

  // Load public categories, products, and settings
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
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
      }
    };

    fetchData();
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
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white pb-24 md:pb-12">
      {/* Public Storefront Header */}
      <Header onOpenHotelModal={() => setIsHotelModalOpen(true)} />

      {/* Hero / Quick Search Bar */}
      <div className="bg-white border-b border-slate-200/80 py-4 px-4 sm:px-6 lg:px-8 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-100/90 border border-slate-200 rounded-xl text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 focus:bg-white transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>Showing {filteredProducts.length} items</span>
            {searchQuery && (
              <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                "{searchQuery}"
              </span>
            )}
          </div>
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

      {/* Floating Bottom Cart Bar for Mobile */}
      {totalCount > 0 && (
        <div className="sm:hidden fixed bottom-4 inset-x-4 z-40 animate-in slide-in-from-bottom duration-300">
          <button
            onClick={() => setIsCartOpen(true)}
            className="w-full flex items-center justify-between p-4 bg-emerald-600 text-white rounded-2xl shadow-xl shadow-emerald-950/20 active:scale-[0.99] transition-transform cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-700/80 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-extrabold text-sm">
                  {totalCount} {totalCount === 1 ? 'item' : 'items'} in Cart
                </div>
                <div className="text-xs text-emerald-100 font-medium">
                  {hotelName}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold">
                {formatCurrency(totalAmount)}
              </span>
              <span className="text-xs font-bold uppercase bg-white/20 px-2 py-1 rounded-lg">
                View →
              </span>
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
