import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Car, Shield, User as UserIcon, LogOut, PlusCircle, LogIn, UserPlus } from 'lucide-react';

export default function Navbar({ onOpenAddModal }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-xl shadow-lg">
            <Car className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-blue-200 bg-clip-text text-transparent">
              AutoCraft
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold uppercase tracking-wider text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded-full border border-blue-800">
              Dealership
            </span>
          </div>
        </div>

        {/* Right Navigation */}
        <div className="flex items-center space-x-3 sm:space-x-4">
          {isAuthenticated ? (
            <>
              {isAdmin && (
                <button
                  onClick={onOpenAddModal}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
                  aria-label="Add new vehicle to inventory"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Vehicle</span>
                </button>
              )}

              {/* User badge */}
              <div className="flex items-center space-x-2 bg-slate-800/80 border border-slate-700/60 px-3 py-1.5 rounded-lg text-sm">
                <UserIcon className="w-4 h-4 text-slate-300" />
                <span className="font-medium text-slate-200 hidden sm:inline max-w-[120px] truncate">
                  {user?.name}
                </span>
                {isAdmin ? (
                  <span className="flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full">
                    <Shield className="w-3 h-3" />
                    <span>Admin</span>
                  </span>
                ) : (
                  <span className="text-xs font-medium px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">
                    Customer
                  </span>
                )}
              </div>

              {/* Logout button */}
              <button
                onClick={logout}
                className="flex items-center space-x-1 p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-400"
                title="Log out"
                aria-label="Log out"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline text-xs font-medium">Logout</span>
              </button>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => openAuthModal('login')}
                className="flex items-center space-x-1.5 px-3 py-1.5 text-slate-300 hover:text-white hover:bg-slate-800 text-sm font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </button>
              <button
                onClick={() => openAuthModal('register')}
                className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <UserPlus className="w-4 h-4" />
                <span>Register</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
