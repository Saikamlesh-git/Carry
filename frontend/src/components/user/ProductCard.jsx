import React from 'react';
import { Tag, Check } from 'lucide-react';
import QuantitySelector from './QuantitySelector';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../services/whatsapp';

export default function ProductCard({ product }) {
  const { getItemQuantity, incrementProduct, decrementProduct } = useCart();
  const quantity = getItemQuantity(product.id);

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 flex flex-col justify-between p-4 sm:p-5 ${
        quantity > 0
          ? 'bg-emerald-50/40 border-emerald-500 shadow-md shadow-emerald-600/10 ring-1 ring-emerald-500/20'
          : 'bg-white border-slate-200/90 shadow-2xs hover:shadow-md hover:border-slate-300 hover:-translate-y-0.5'
      }`}
    >
      {/* Top Meta: Category & Quantity Indicator */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-bold tracking-wide rounded-lg bg-slate-100 text-slate-700 group-hover:bg-emerald-100 group-hover:text-emerald-800 transition-colors">
            <Tag className="w-3 h-3 text-emerald-600" />
            <span>{product.category_name}</span>
          </span>

          {quantity > 0 ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-extrabold rounded-full bg-emerald-600 text-white shadow-xs">
              <Check className="w-3 h-3 stroke-[3]" />
              <span>{quantity}</span>
            </span>
          ) : product.sku ? (
            <span className="text-[10px] font-mono font-medium text-slate-400">
              {product.sku}
            </span>
          ) : null}
        </div>

        {/* Product Title */}
        <h3 className="font-extrabold text-slate-900 text-base sm:text-lg leading-snug tracking-tight group-hover:text-emerald-700 transition-colors">
          {product.name}
        </h3>
      </div>

      {/* Price & Quantity Row */}
      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Price
          </span>
          <div className="flex items-baseline gap-1">
            <span className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {formatCurrency(product.price)}
            </span>
            <span className="text-xs font-bold text-slate-500">
              / {product.unit_type}
            </span>
          </div>
        </div>

        {/* Stepper */}
        <QuantitySelector
          quantity={quantity}
          onIncrement={() => incrementProduct(product)}
          onDecrement={() => decrementProduct(product)}
        />
      </div>
    </div>
  );
}
