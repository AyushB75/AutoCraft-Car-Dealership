import React, { useState } from 'react';
import {
  ShoppingBag,
  Edit3,
  PlusCircle,
  Trash2,
  Tag,
  Layers,
  Check,
  AlertTriangle,
  CarFront,
} from 'lucide-react';

const vehicleImages = {
  'Toyota Camry Hybrid':
    'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80',
  'Honda CR-V EX-L':
    'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=900&q=80',
  'Tesla Model 3 Long Range':
    'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=900&q=80',
  'Ford F-150 Lightning':
    'https://images.unsplash.com/photo-1551830820-330a71b99659?auto=format&fit=crop&w=900&q=80',
  'BMW M340i xDrive':
    'https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=900&q=80',
  'Porsche 911 Carrera':
    'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=900&q=80',
  'Hyundai Ioniq 5 Limited':
    'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=900&q=80',
  'Chevrolet Corvette Stingray':
    'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=900&q=80',
  'Jeep Grand Cherokee':
    'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=900&q=80',
  'Volkswagen Golf GTI':
    'https://images.unsplash.com/photo-1502161254066-6c74afbf07aa?auto=format&fit=crop&w=900&q=80',
};

function VehicleImage({ make, model, category }) {
  const [failed, setFailed] = useState(false);
  const imageUrl = vehicleImages[`${make} ${model}`];

  return (
    <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
      {imageUrl && !failed ? (
        <img
          src={imageUrl}
          alt={`${make} ${model}`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.03]"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="flex h-full min-h-40 flex-col items-center justify-center gap-2 text-slate-400"
          role="img"
          aria-label={`Image unavailable for ${make} ${model}`}
        >
          <CarFront className="h-12 w-12" aria-hidden="true" />
          <span className="text-xs font-medium">Photo unavailable</span>
          <span className="text-[11px] text-slate-400">{category}</span>
        </div>
      )}
      <span className="absolute left-3 top-3 rounded-full border border-white/70 bg-white/90 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-700 shadow-sm backdrop-blur">
        {category}
      </span>
    </div>
  );
}

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

  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(vehicle.price);

  return (
    <article
      data-testid={`vehicle-card-${vehicle.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      <VehicleImage
        make={vehicle.make}
        model={vehicle.model}
        category={vehicle.category}
      />

      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Vehicle
            </p>
            <h3 className="mt-1 break-words text-lg font-bold leading-snug tracking-tight text-slate-900">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>

          <span
            className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
              isOutOfStock
                ? 'border border-red-200 bg-red-50 text-red-700'
                : isLowStock
                  ? 'border border-amber-200 bg-amber-50 text-amber-800'
                  : 'border border-emerald-200 bg-emerald-50 text-emerald-700'
            }`}
            aria-label={`Stock status: ${
              isOutOfStock
                ? 'out of stock'
                : isLowStock
                  ? `low stock, ${vehicle.quantity} remaining`
                  : `${vehicle.quantity} in stock`
            }`}
          >
            {isOutOfStock ? (
              <span className="inline-flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                Sold out
              </span>
            ) : isLowStock ? (
              <span className="inline-flex items-center gap-1">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                {vehicle.quantity} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
                {vehicle.quantity} in stock
              </span>
            )}
          </span>
        </div>

        <div className="mt-5 flex items-end justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
              Price
            </p>
            <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
              {formattedPrice}
            </p>
          </div>
          <span className="pb-1 text-xs text-slate-400">USD</span>
        </div>

        <div className="mt-auto pt-5">
          <button
            type="button"
            onClick={() => onPurchase(vehicle)}
            disabled={isOutOfStock || isPurchasing}
            aria-disabled={isOutOfStock || isPurchasing}
            data-testid={`purchase-btn-${vehicle.id}`}
            className={`flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed ${
              isOutOfStock
                ? 'border border-slate-200 bg-slate-100 text-slate-400 focus:ring-slate-300'
                : 'bg-emerald-600 text-white shadow-sm shadow-emerald-700/15 hover:bg-emerald-700 focus:ring-emerald-500 disabled:opacity-60'
            }`}
          >
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {isOutOfStock
              ? 'Out of stock'
              : isPurchasing
                ? 'Processing purchase…'
                : 'Purchase vehicle'}
          </button>

          {isAdmin && (
            <div className="mt-3 grid grid-cols-[1fr_1fr_auto] gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => onEdit(vehicle)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-300"
                title="Edit vehicle details"
              >
                <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                Edit
              </button>
              <button
                type="button"
                onClick={() => onRestock(vehicle)}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-blue-200 bg-blue-50 px-2 py-2 text-xs font-semibold text-blue-800 transition hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300"
                title="Restock inventory"
              >
                <PlusCircle className="h-3.5 w-3.5" aria-hidden="true" />
                Restock
              </button>
              <button
                type="button"
                onClick={() => onDelete(vehicle)}
                className="inline-flex items-center justify-center rounded-lg border border-red-200 bg-white p-2 text-red-600 transition hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-300"
                title="Delete vehicle listing"
                aria-label={`Delete ${vehicle.make} ${vehicle.model}`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
