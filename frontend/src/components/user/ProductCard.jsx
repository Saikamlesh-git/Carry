import React from 'react';
import { Check, Sparkles } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/whatsapp';

export default function ProductCard({ product }) {
  const { getItemQuantity, incrementProduct, decrementProduct } = useCart();
  const quantity = getItemQuantity(product.id);
  const isSelected = quantity > 0;

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 sm:p-5 cursor-default ${
        isSelected
          ? 'bg-gradient-to-br from-emerald-50/80 to-teal-50/40 product-card-glow'
          : 'bg-white border-slate-200/80 shadow-sm hover:shadow-md hover:border-slate-300/80 hover:-translate-y-0.5'
      }`}
    >
      {/* Selected indicator ribbon */}
      {isSelected && (
        <div
          className="absolute top-0 right-0 w-12 h-12 overflow-hidden rounded-tr-2xl pointer-events-none"
          aria-hidden="true"
        >
          <div
            className="absolute top-0 right-0 w-10 h-10 translate-x-1/2 -translate-y-1/2 rotate-45"
            style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
          />
        </div>
      )}

      {/* Top row */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-2.5">
          {/* Category tag */}
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-lg transition-colors ${
            isSelected
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-700'
          }`}>
            <Sparkles className="w-2.5 h-2.5" />
            <span>{product.category_name}</span>
          </span>

          {/* Qty badge or SKU */}
          {isSelected ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-extrabold rounded-full text-white"
              style={{ background: 'linear-gradient(135deg, #059669 0%, #0d9488 100%)' }}
            >
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{quantity}</span>
            </span>
          ) : product.sku ? (
            <span className="text-[10px] font-mono font-semibold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-100">
              {product.sku}
            </span>
          ) : null}
        </div>

        {/* Product Name */}
        <h3 className={`font-extrabold text-base sm:text-lg leading-snug tracking-tight transition-colors ${
          isSelected ? 'text-emerald-900' : 'text-slate-900 group-hover:text-emerald-800'
        }`}>
          {product.name}
        </h3>

        {/* Description snippet */}
        {product.description && (
          <p className="mt-1 text-xs text-slate-500 line-clamp-2 font-medium leading-relaxed">
            {product.description}
          </p>
        )}
      </div>

      {/* Price + Stepper */}
      <div className={`pt-3.5 mt-3 border-t flex items-center justify-between gap-3 ${
        isSelected ? 'border-emerald-200/60' : 'border-slate-100'
      }`}>
        <div className="flex flex-col leading-tight">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Price</span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs font-bold text-slate-400">
              / {product.unit_type}
            </span>
          </div>
        </div>

        <QuantitySelector
          quantity={quantity}
          onIncrement={() => incrementProduct(product)}
          onDecrement={() => decrementProduct(product)}
        />
      </div>
    </div>
  );
}
