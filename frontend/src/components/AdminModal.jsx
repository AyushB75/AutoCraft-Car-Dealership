import React, { useState } from 'react';
import useDialog from '../hooks/useDialog';
import { X, PlusCircle, Edit3, RefreshCw, Trash2, AlertTriangle } from 'lucide-react';

const CATEGORIES = ['Sedan', 'SUV', 'Coupe', 'Hatchback', 'Electric', 'Truck'];

function AdminModalForm({
  isOpen,
  mode, // 'add' | 'edit' | 'restock' | 'delete'
  vehicle,
  onClose,
  onSubmit,
  loading = false,
  error = '',
}) {
  const [formData, setFormData] = useState(() => ({
    make: vehicle?.make || '', model: vehicle?.model || '', category: vehicle?.category || 'Sedan',
    price: vehicle?.price !== undefined ? String(vehicle.price) : '', quantity: vehicle?.quantity !== undefined ? String(vehicle.quantity) : '',
  }));

  const [restockQty, setRestockQty] = useState('');

  const dialogRef = useDialog(isOpen, onClose, loading);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (mode === 'add') {
      onSubmit({
        make: formData.make.trim(),
        model: formData.model.trim(),
        category: formData.category,
        price: Number(formData.price),
        quantity: Number(formData.quantity),
      });
    } else if (mode === 'edit') {
      onSubmit({
        id: vehicle.id,
        data: {
          make: formData.make.trim(),
          model: formData.model.trim(),
          category: formData.category,
          price: Number(formData.price),
        },
      });
    } else if (mode === 'restock') {
      onSubmit({
        id: vehicle.id,
        quantity: Number(restockQty),
      });
    } else if (mode === 'delete') {
      onSubmit(vehicle.id);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dialog-title"
      ref={dialogRef}
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            {mode === 'add' && <PlusCircle className="w-5 h-5 text-blue-600" />}
            {mode === 'edit' && <Edit3 className="w-5 h-5 text-indigo-600" />}
            {mode === 'restock' && <RefreshCw className="w-5 h-5 text-emerald-600" />}
            {mode === 'delete' && <Trash2 className="w-5 h-5 text-red-600" />}
            <h3 id="admin-dialog-title" className="text-lg font-bold text-slate-900">
              {mode === 'add' && 'Add New Vehicle'}
              {mode === 'edit' && `Edit ${vehicle?.make} ${vehicle?.model}`}
              {mode === 'restock' && `Restock ${vehicle?.make} ${vehicle?.model}`}
              {mode === 'delete' && 'Delete Vehicle'}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error alert inside modal */}
        {error && (
          <div className="p-4 mx-5 mt-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {(mode === 'add' || mode === 'edit') && (
            <>
              <div>
                <label htmlFor="admin-make" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Make
                </label>
                <input
                  id="admin-make"
                  type="text"
                  required
                  placeholder="e.g. Toyota, Tesla"
                  value={formData.make}
                  onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="admin-model" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Model
                </label>
                <input
                  id="admin-model"
                  type="text"
                  required
                  placeholder="e.g. Camry, Model 3"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label htmlFor="admin-category" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Category
                </label>
                <select
                  id="admin-category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="admin-price" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                  Price ($)
                </label>
                <input
                  id="admin-price"
                  type="number"
                  required
                  min="0"
                  step="1"
                  placeholder="e.g. 28000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {mode === 'add' && (
                <div>
                  <label htmlFor="admin-quantity" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                    Initial Stock Quantity
                  </label>
                  <input
                  id="admin-quantity"
                    type="number"
                    required
                    min="0"
                    step="1"
                    placeholder="e.g. 5"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  />
                </div>
              )}
            </>
          )}

          {mode === 'restock' && (
            <div>
              <p className="text-sm text-slate-600 mb-3">
                Current inventory stock is{' '}
                <strong className="text-slate-900">{vehicle?.quantity || 0} units</strong>.
              </p>
              <label htmlFor="admin-restock" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
                Quantity to Add (Positive Integer)
              </label>
              <input
                  id="admin-restock"
                type="number"
                required
                min="1"
                step="1"
                placeholder="e.g. 5"
                value={restockQty}
                onChange={(e) => setRestockQty(e.target.value)}
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                autoFocus
              />
            </div>
          )}

          {mode === 'delete' && (
            <div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Are you sure you want to permanently delete{' '}
                <strong className="text-slate-900">
                  {vehicle?.make} {vehicle?.model}
                </strong>{' '}
                from the catalog?
              </p>
              {vehicle?.quantity > 0 && (
                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 font-medium flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Note: This vehicle currently has {vehicle.quantity} units remaining in stock.</span>
                </div>
              )}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-5 py-2 text-white text-sm font-semibold rounded-xl shadow-sm transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${
                mode === 'delete'
                  ? 'bg-red-600 hover:bg-red-500 focus:ring-red-400'
                  : 'bg-blue-600 hover:bg-blue-500 focus:ring-blue-400'
              }`}
            >
              {loading
                ? 'Processing...'
                : mode === 'add'
                ? 'Create Vehicle'
                : mode === 'edit'
                ? 'Save Changes'
                : mode === 'restock'
                ? 'Restock Inventory'
                : 'Confirm Deletion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminModal(props) {
  return props.isOpen ? <AdminModalForm key={`${props.mode}-${props.vehicle?.id || 'new'}`} {...props} /> : null;
}
