import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './context/AuthContext';
import api from './services/api';
import Navbar from './components/Navbar';
import VehicleCard from './components/VehicleCard';
import FilterBar from './components/FilterBar';
import AdminModal from './components/AdminModal';
import AuthModal from './components/AuthModal';
import Alert from './components/Alert';
import { Car, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';

export default function App() {
  const { isAdmin, isAuthenticated, openAuthModal } = useAuth();

  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notification, setNotification] = useState(null); // { type, message }

  // Search & Filter state
  const [filters, setFilters] = useState({
    make: '',
    model: '',
    category: 'All',
    minPrice: '',
    maxPrice: '',
  });

  // Admin Modal state
  const [adminModal, setAdminModal] = useState({
    isOpen: false,
    mode: 'add', // 'add' | 'edit' | 'restock' | 'delete'
    vehicle: null,
    loading: false,
    error: '',
  });

  // Purchasing tracking
  const [purchasingId, setPurchasingId] = useState(null);

  // Fetch vehicles (either all or filtered)
  const fetchVehicles = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const hasFilters = Boolean(
        filters.make ||
        filters.model ||
        (filters.category && filters.category !== 'All') ||
        filters.minPrice ||
        filters.maxPrice
      );

      let data;
      if (hasFilters) {
        data = await api.searchVehicles(filters);
      } else {
        data = await api.getVehicles();
      }
      setVehicles(data.vehicles || []);
    } catch (err) {
      setError(err.message || 'Failed to load vehicles from dealership catalog.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleResetFilters = () => {
    setFilters({
      make: '',
      model: '',
      category: 'All',
      minPrice: '',
      maxPrice: '',
    });
  };

  // Purchase Handler
  const handlePurchase = async (vehicle) => {
    if (!isAuthenticated) {
      setNotification({
        type: 'warning',
        message: 'Please sign in or register to purchase vehicles.',
      });
      openAuthModal('login');
      return;
    }

    if (vehicle.quantity <= 0) {
      setNotification({
        type: 'error',
        message: `Sorry, ${vehicle.make} ${vehicle.model} is currently out of stock.`,
      });
      return;
    }

    setPurchasingId(vehicle.id);
    try {
      const result = await api.purchaseVehicle(vehicle.id);
      // Update local state with the returned updated vehicle
      setVehicles(prev =>
        prev.map(v => (v.id === vehicle.id ? result.vehicle : v))
      );
      setNotification({
        type: 'success',
        message: `Congratulations! You successfully purchased the ${vehicle.make} ${vehicle.model}. Remaining stock: ${result.vehicle.quantity}.`,
      });
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Purchase failed. Please try again.',
      });
      // Refresh catalog to reflect real database quantity
      fetchVehicles();
    } finally {
      setPurchasingId(null);
    }
  };

  // Admin Actions
  const handleOpenAddModal = () => {
    setAdminModal({
      isOpen: true,
      mode: 'add',
      vehicle: null,
      loading: false,
      error: '',
    });
  };

  const handleOpenEditModal = (vehicle) => {
    setAdminModal({
      isOpen: true,
      mode: 'edit',
      vehicle,
      loading: false,
      error: '',
    });
  };

  const handleOpenRestockModal = (vehicle) => {
    setAdminModal({
      isOpen: true,
      mode: 'restock',
      vehicle,
      loading: false,
      error: '',
    });
  };

  const handleOpenDeleteModal = (vehicle) => {
    setAdminModal({
      isOpen: true,
      mode: 'delete',
      vehicle,
      loading: false,
      error: '',
    });
  };

  const handleCloseAdminModal = () => {
    setAdminModal(prev => ({ ...prev, isOpen: false, error: '' }));
  };

  const handleAdminSubmit = async (payload) => {
    setAdminModal(prev => ({ ...prev, loading: true, error: '' }));
    try {
      if (adminModal.mode === 'add') {
        const res = await api.createVehicle(payload);
        setVehicles(prev => [res.vehicle, ...prev]);
        setNotification({
          type: 'success',
          message: `Vehicle ${res.vehicle.make} ${res.vehicle.model} added to inventory.`,
        });
      } else if (adminModal.mode === 'edit') {
        const res = await api.updateVehicle(payload.id, payload.data);
        setVehicles(prev => prev.map(v => (v.id === payload.id ? res.vehicle : v)));
        setNotification({
          type: 'success',
          message: `Vehicle ${res.vehicle.make} ${res.vehicle.model} updated successfully.`,
        });
      } else if (adminModal.mode === 'restock') {
        const res = await api.restockVehicle(payload.id, payload.quantity);
        setVehicles(prev => prev.map(v => (v.id === payload.id ? res.vehicle : v)));
        setNotification({
          type: 'success',
          message: `Restocked ${res.vehicle.make} ${res.vehicle.model}. Current stock: ${res.vehicle.quantity}.`,
        });
      } else if (adminModal.mode === 'delete') {
        await api.deleteVehicle(payload);
        setVehicles(prev => prev.filter(v => v.id !== payload));
        setNotification({
          type: 'success',
          message: 'Vehicle removed from catalog successfully.',
        });
      }
      handleCloseAdminModal();
    } catch (err) {
      setAdminModal(prev => ({
        ...prev,
        loading: false,
        error: err.message || 'Operation failed.',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <Navbar onOpenAddModal={handleOpenAddModal} />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner Alert */}
        {notification && (
          <Alert
            type={notification.type}
            message={notification.message}
            onClose={() => setNotification(null)}
          />
        )}

        {/* Hero Section */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Vehicle Inventory
            </h1>
            <p className="mt-1 text-slate-500 text-sm sm:text-base">
              Browse available dealership cars, filter by make, model, category, and secure your purchase instantly.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchVehicles}
              disabled={loading}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors"
              title="Refresh inventory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          onReset={handleResetFilters}
          totalCount={vehicles.length}
          resultCount={vehicles.length}
        />

        {/* Error State */}
        {error && (
          <div className="p-8 text-center bg-red-50 border border-red-200 rounded-2xl mb-8">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-900 mb-1">Failed to Load Inventory</h3>
            <p className="text-sm text-red-700 max-w-md mx-auto mb-4">{error}</p>
            <button
              onClick={fetchVehicles}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white text-xs font-semibold rounded-xl shadow-sm"
            >
              Retry Connection
            </button>
          </div>
        )}

        {/* Vehicle Grid / States */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <div
                key={n}
                className="bg-white rounded-2xl border border-slate-200 p-5 h-72 animate-pulse flex flex-col justify-between"
              >
                <div>
                  <div className="w-20 h-5 bg-slate-200 rounded-full mb-3" />
                  <div className="w-48 h-6 bg-slate-200 rounded-lg mb-4" />
                  <div className="w-24 h-4 bg-slate-100 rounded mb-2" />
                  <div className="w-32 h-8 bg-slate-200 rounded-lg" />
                </div>
                <div className="w-full h-10 bg-slate-200 rounded-xl" />
              </div>
            ))}
          </div>
        ) : vehicles.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
              <Car className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-1">No Vehicles Found</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-5">
              No dealership vehicles match your current search and filter criteria. Try adjusting your parameters.
            </p>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl shadow-sm transition-all"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {vehicles.map(vehicle => (
              <VehicleCard
                key={vehicle.id}
                vehicle={vehicle}
                onPurchase={handlePurchase}
                onEdit={handleOpenEditModal}
                onRestock={handleOpenRestockModal}
                onDelete={handleOpenDeleteModal}
                isAdmin={isAdmin}
                isPurchasing={purchasingId === vehicle.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-400">
        <p>AutoCraft Car Dealership Inventory System &bull; Built with TDD, React &amp; Node.js</p>
      </footer>

      {/* Modals */}
      <AdminModal
        isOpen={adminModal.isOpen}
        mode={adminModal.mode}
        vehicle={adminModal.vehicle}
        onClose={handleCloseAdminModal}
        onSubmit={handleAdminSubmit}
        loading={adminModal.loading}
        error={adminModal.error}
      />
      <AuthModal />
    </div>
  );
}
