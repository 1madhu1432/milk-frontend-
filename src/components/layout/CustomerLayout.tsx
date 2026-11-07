import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import {
  Home,
  Receipt,
  Truck,
  PauseCircle,
  User,
  LogOut,
} from 'lucide-react';

export const CustomerLayout: React.FC = () => {
  const { currentUser, logout, customers } = useDairy();
  const navigate = useNavigate();

  const customerId = currentUser.id || 'CUST-1001';
  const customer = customers.find(c => c.id === customerId) || customers[0];

  const handleLogout = () => {
    if (window.confirm('Sign out from your subscriber account?')) {
      logout();
      navigate('/login/customer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col font-sans text-slate-900 selection:bg-emerald-100">
      {/* Mobile-First Sticky Customer Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-2xs px-3 sm:px-4 py-2.5">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 flex items-center justify-center text-white text-xl shadow-sm shadow-emerald-700/20">
              🥛
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm text-slate-900 tracking-tight">Harish Dairy</span>
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                  Member
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-bold leading-none mt-1 truncate max-w-[170px]">
                {customer ? `${customer.name} • ${customer.houseNo}` : currentUser.name}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden xs:inline-flex text-[10px] font-black uppercase bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full">
              Active Plan
            </span>

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

      {/* Main Mobile Content Area (Padded to clear bottom navigation) */}
      <main className="flex-1 max-w-md mx-auto w-full px-3 py-3 pb-28">
        <Outlet />
      </main>

      {/* Sticky Mobile Bottom App Navigation (5 Tabs, 44px+ touch targets) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl py-1 px-2">
        <div className="max-w-md mx-auto grid grid-cols-5 gap-1">
          <NavLink
            to="/customer/home"
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
            to="/customer/bills"
            className={({ isActive }) =>
              `min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <Receipt className="w-5 h-5 mb-0.5" />
            <span>My Bills</span>
          </NavLink>

          <NavLink
            to="/customer/deliveries"
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
            to="/customer/pause"
            className={({ isActive }) =>
              `min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-all ${
                isActive
                  ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                  : 'text-slate-500 hover:text-slate-900'
              }`
            }
          >
            <PauseCircle className="w-5 h-5 mb-0.5" />
            <span>Pause</span>
          </NavLink>

          <NavLink
            to="/customer/profile"
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
