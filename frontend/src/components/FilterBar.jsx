import React from 'react';
import { Search, RotateCcw, SlidersHorizontal, DollarSign } from 'lucide-react';

const CATEGORIES = ['All', 'Sedan', 'SUV', 'Coupe', 'Hatchback', 'Electric', 'Truck'];

export default function FilterBar({ filters, setFilters, onReset, totalCount, resultCount }) {
  const handleChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const hasActiveFilters = Boolean(
    filters.make || filters.model || (filters.category && filters.category !== 'All') || filters.minPrice || filters.maxPrice
  );

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 mb-8">
      {/* Search inputs row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4">
        {/* Make Search */}
        <div>
          <label htmlFor="filter-make" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Make
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="filter-make"
              type="text"
              placeholder="e.g. Toyota, Tesla..."
              value={filters.make}
              onChange={(e) => handleChange('make', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Model Search */}
        <div>
          <label htmlFor="filter-model" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Model
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="filter-model"
              type="text"
              placeholder="e.g. Camry, Model 3..."
              value={filters.model}
              onChange={(e) => handleChange('model', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Min Price */}
        <div>
          <label htmlFor="filter-min-price" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Min Price
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="filter-min-price"
              type="number"
              min="0"
              step="1000"
              placeholder="Min ($)"
              value={filters.minPrice}
              onChange={(e) => handleChange('minPrice', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Max Price */}
        <div>
          <label htmlFor="filter-max-price" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Max Price
          </label>
          <div className="relative">
            <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="filter-max-price"
              type="number"
              min="0"
              step="1000"
              placeholder="Max ($)"
              value={filters.maxPrice}
              onChange={(e) => handleChange('maxPrice', e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
        </div>
      </div>

      {/* Category Pills & Reset button */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 max-w-full">
          <span className="text-xs font-semibold text-slate-400 mr-1 hidden sm:inline">Category:</span>
          {CATEGORIES.map(cat => {
            const isSelected = (filters.category || 'All') === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleChange('category', cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Reset & Count */}
        <div className="flex items-center gap-3 ml-auto">
          <span className="text-xs text-slate-500 font-medium">
            Showing <strong className="text-slate-800">{resultCount}</strong> of {totalCount}
          </span>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-blue-600 px-2 py-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
