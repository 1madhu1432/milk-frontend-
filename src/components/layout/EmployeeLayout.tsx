import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import {
  Home,
  MapPin,
  Truck,
  History,
  User,
  LogOut,
} from 'lucide-react';

export const EmployeeLayout: React.FC = () => {
  const { currentUser, logout } = useDairy();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Sign out from Delivery Rider session?')) {
      logout();
      navigate('/login/delivery');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-100">
      {/* Mobile-First Sticky Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-3 sm:px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white text-xl shadow-sm shadow-emerald-700/20">
              🥛
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 tracking-tight">DairyNexa</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Rider
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-none mt-1 truncate max-w-[170px]">
                {currentUser.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-emerald-50 text-emerald-800 px-2.5 py-1 rounded-full border border-emerald-200 text-[10px] font-black">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>On Duty</span>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Mobile Content Area (Padded for sticky navigation) */}
      <main className="flex-1 max-w-md mx-auto w-full px-3 py-3 pb-28">
        <Outlet />
      </main>

      {/* Fixed Mobile Bottom Navigation Bar (5 Tabs, 44px+ touch targets) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl py-1 px-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <NavLink
            to="/employee/home"
            className={({ isActive }) =>
              `min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-black transition-all ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Home className="w-5 h-5 mb-0.5" />
            <span>Home</span>
          </NavLink>

          <NavLink
            to="/employee/route"
            className={({ isActive }) =>
              `min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <MapPin className="w-5 h-5 mb-0.5" />
            <span>My Route</span>
          </NavLink>

          <NavLink
            to="/employee/deliveries"
            className={({ isActive }) =>
              `min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Truck className="w-5 h-5 mb-0.5" />
            <span>Deliveries</span>
          </NavLink>

          <NavLink
            to="/employee/history"
            className={({ isActive }) =>
              `min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <History className="w-5 h-5 mb-0.5" />
            <span>History</span>
          </NavLink>

          <NavLink
            to="/employee/profile"
            className={({ isActive }) =>
              `min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <User className="w-5 h-5 mb-0.5" />
            <span>Profile</span>
          </NavLink>
        </div>
      </nav>
    </div>
  );
};
