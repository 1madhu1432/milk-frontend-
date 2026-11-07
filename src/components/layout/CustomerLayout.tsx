import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import {
  Home,
  Receipt,
  Truck,
  PauseCircle,
  User,
  LogOut,
  CreditCard,
  Sparkles,
} from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

export const CustomerLayout: React.FC = () => {
  const { currentUser, logout, customers, settings } = useDairy();
  const navigate = useNavigate();
  const location = useLocation();

  // Find customer matching logged-in user, or first customer
  const customer = customers.find(
    c =>
      (currentUser.id && (c.userId === currentUser.id || c.id === currentUser.id)) ||
      (currentUser.email && c.email?.toLowerCase() === currentUser.email?.toLowerCase())
  ) || customers[0];

  const handleLogout = () => {
    if (window.confirm('Sign out from your subscriber account?')) {
      logout();
      navigate('/login/customer');
    }
  };

  const navItems = [
    { label: 'Dashboard', path: '/customer/home', icon: Home },
    { label: 'Deliveries', path: '/customer/deliveries', icon: Truck },
    { label: 'My Bills', path: '/customer/bills', icon: Receipt },
    { label: 'Vacation Pause', path: '/customer/pause', icon: PauseCircle },
    { label: 'My Profile', path: '/customer/profile', icon: User },
  ];

  const dairyName = settings?.dairyName || 'Harish Dairy Farm';
  const customerName = customer?.name || currentUser?.name || 'Valued Subscriber';
  const customerAddress = customer ? `${customer.houseNo}, ${customer.area}` : 'Daily Doorstep Delivery';
  const outstandingDue = customer?.outstandingBalance || 0;

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-sans text-slate-900 selection:bg-emerald-100 antialiased">
      {/* ======================================================== */}
      {/* RESPONSIVE DESKTOP & MOBILE TOP NAVBAR */}
      {/* ======================================================== */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/90 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">

            {/* Left: Brand Identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 flex items-center justify-center text-white text-xl sm:text-2xl shadow-md shadow-emerald-700/20 shrink-0">
                🥛
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base sm:text-lg text-slate-950 tracking-tight leading-none">
                    {dairyName}
                  </span>
                  <span className="hidden sm:inline-flex text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300">
                    Customer Portal
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-semibold mt-1 truncate max-w-[200px] sm:max-w-none">
                  {customerName} • <span className="text-slate-400 font-normal">{customerAddress}</span>
                </p>
              </div>
            </div>

            {/* Center: Desktop Navigation Tabs (Hidden on mobile) */}
            <nav className="hidden md:flex items-center gap-1.5 lg:gap-2">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${isActive
                        ? 'bg-emerald-50 text-emerald-800 shadow-2xs font-black'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100/80'
                      }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </NavLink>
                );
              })}
            </nav>

            {/* Right: Balance Pill & Profile Actions */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Outstanding Due Pill on Desktop */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Balance:</span>
                <span className={`text-xs font-black ${outstandingDue > 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                  {formatCurrency(outstandingDue)}
                </span>
              </div>

              {/* User Avatar Pill */}
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300/80 flex items-center justify-center text-xs font-black text-slate-700 uppercase">
                  {customerName.charAt(0)}
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/80 transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MAIN CONTAINER: FULL RESPONSIVE MAX-W-7XL */}
      {/* ======================================================== */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 pb-24 md:pb-12">
        <Outlet />
      </main>

      {/* ======================================================== */}
      {/* MOBILE STICKY BOTTOM APP BAR (Hidden on desktop md:) */}
      {/* ======================================================== */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200 shadow-2xl py-1 px-3">
        <div className="grid grid-cols-5 gap-1 max-w-md mx-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`min-h-[48px] flex flex-col items-center justify-center py-1 rounded-xl text-[10px] font-bold transition-all ${isActive
                    ? 'text-emerald-800 bg-emerald-50 shadow-2xs font-black'
                    : 'text-slate-500 hover:text-slate-900'
                  }`}
              >
                <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-emerald-700' : 'text-slate-400'}`} />
                <span className="truncate max-w-[56px] text-center">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
