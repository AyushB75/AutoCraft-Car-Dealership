import React from 'react';
import { ShoppingBag, Edit3, PlusCircle, Trash2, Tag, Layers, Check, AlertTriangle } from 'lucide-react';

export default function VehicleCard({
  vehicle,
  onPurchase,
  onEdit,
  onRestock,
  onDelete,
  isAdmin,
  isPurchasing = false,
}) {
  const isOutOfStock = vehicle.quantity <= 0;
  const isLowStock = vehicle.quantity > 0 && vehicle.quantity <= 2;

  // Format price as USD currency
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  return (
    <article
      data-testid={`vehicle-card-${vehicle.id}`}
      className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
    >
      <div>
        {/* Card Header & Category */}
        <div className="p-5 pb-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase tracking-wider mb-2">
                <Tag className="w-3 h-3 text-slate-500" />
                {vehicle.category}
              </span>
              <h3 className="text-xl font-bold text-slate-900 tracking-tight leading-snug">
                {vehicle.make} {vehicle.model}
              </h3>
            </div>

            {/* Stock status badge */}
            <div>
              {isOutOfStock ? (
                <span
                  data-testid="badge-out-of-stock"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-red-100 text-red-800 border border-red-200"
                >
                  <AlertTriangle className="w-3 h-3 text-red-600" />
                  Out of Stock
                </span>
              ) : isLowStock ? (
                <span
                  data-testid="badge-low-stock"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200"
                >
                  <Layers className="w-3 h-3 text-amber-600" />
                  Only {vehicle.quantity} left
                </span>
              ) : (
                <span
                  data-testid="badge-in-stock"
                  className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200"
                >
                  <Check className="w-3 h-3 text-emerald-600" />
                  {vehicle.quantity} in stock
                </span>
              )}
            </div>
          </div>

          {/* Price display */}
          <div className="mt-4 flex items-baseline justify-between border-t border-slate-100 pt-3">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Retail Price</span>
              <p className="text-2xl font-extrabold text-slate-900">{formattedPrice}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="p-5 pt-2 bg-slate-50/50 border-t border-slate-100">
        <div className="flex flex-col gap-2.5">
          {/* Purchase Button */}
          <button
            onClick={() => onPurchase(vehicle)}
            disabled={isOutOfStock || isPurchasing}
            aria-disabled={isOutOfStock || isPurchasing}
            data-testid={`purchase-btn-${vehicle.id}`}
            className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all shadow-sm ${
              isOutOfStock
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none border border-slate-200'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-600/20 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-emerald-400'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? 'Sold Out' : isPurchasing ? 'Purchasing...' : 'Purchase Vehicle'}</span>
          </button>

          {/* Admin Controls */}
          {isAdmin && (
            <div className="flex items-center gap-1.5 pt-2 border-t border-slate-200/60">
              <button
                onClick={() => onEdit(vehicle)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors"
                title="Edit vehicle details"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>Edit</span>
              </button>
              <button
                onClick={() => onRestock(vehicle)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 px-2 bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-200 text-blue-700 text-xs font-medium rounded-lg transition-colors"
                title="Restock inventory"
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-500" />
                <span>Restock</span>
              </button>
              <button
                onClick={() => onDelete(vehicle)}
                className="flex items-center justify-center p-1.5 bg-white hover:bg-red-50 border border-slate-200 hover:border-red-200 text-red-600 rounded-lg transition-colors"
                title="Delete vehicle listing"
                aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
