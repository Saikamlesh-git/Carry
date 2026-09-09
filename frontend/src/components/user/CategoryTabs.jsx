import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function CategoryTabs({ categories, selectedCategoryId, onSelectCategory, totalProductsCount }) {
  const scrollContainerRef = useRef(null);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative border-b border-slate-200 bg-white shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative flex items-center">
        {/* Desktop Left Scroll Arrow */}
        <button
          onClick={() => scroll('left')}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 absolute left-2 z-10 -translate-x-1/2 transition-opacity"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="flex items-center gap-2 overflow-x-auto py-3 no-scrollbar scroll-smooth w-full"
        >
          {/* "All" Tab */}
          <button
            onClick={() => onSelectCategory(null)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
              selectedCategoryId === null
                ? 'bg-slate-900 text-white shadow-md shadow-slate-900/15'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            <span>All</span>
            {totalProductsCount !== undefined && (
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  selectedCategoryId === null
                    ? 'bg-slate-800 text-slate-200'
                    : 'bg-slate-200 text-slate-600'
                }`}
              >
                {totalProductsCount}
              </span>
            )}
          </button>

          {/* Dynamic DB Categories */}
          {categories.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span>{cat.name}</span>
                {cat.product_count > 0 && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                      isSelected ? 'bg-emerald-800 text-emerald-100' : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {cat.product_count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Desktop Right Scroll Arrow */}
        <button
          onClick={() => scroll('right')}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-full bg-white shadow-sm border border-slate-200 text-slate-500 hover:text-slate-900 absolute right-2 z-10 translate-x-1/2 transition-opacity"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
