import React from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import {
  LayoutDashboard,
  Users,
  Truck,
  MapPin,
  Boxes,
  Milk,
  Receipt,
  ShoppingCart,
  BarChart3,
  Settings,
  X,
  LogOut,
  Calendar,
  Sparkles,
  Bot,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, currentUser } = useDairy();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Do you want to log out from the dashboard?')) {
      logout();
      navigate('/login/admin');
    }
  };

  const navItems = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true, hasSub: true, subLabel: 'Ecommerce' },
    { to: '/admin/customers', label: 'Customers', icon: Users, badge: '3.7k' },
    { to: '/admin/deliveries', label: 'Deliveries', icon: Truck },
    { to: '/admin/routes', label: 'Logistics & Routes', icon: MapPin },
    { to: '/admin/inventory', label: 'Stocks & Silos', icon: Boxes },
    { to: '/admin/purchases', label: 'Milk Purchases', icon: Milk },
    { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { to: '/admin/billing', label: 'Finance & Billing', icon: Receipt, isNew: true },
    { to: '/admin/reports', label: 'Analytics & P&L', icon: BarChart3, isNew: true },
    { to: '/admin/settings', label: 'Settings', icon: Settings },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 z-40 h-screen md:h-screen w-64 bg-white border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out shrink-0 select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Header matching TailAdmin */}
        <div className="flex items-center justify-between px-6 h-16 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#3C50E0] flex items-center justify-center text-white font-black text-sm shadow-sm shadow-[#3C50E0]/30">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold tracking-tight text-slate-900">TailAdmin</span>
              <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">ERP</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 md:hidden cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-6">
          {/* Main Menu Section */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Menu
            </div>
            <nav className="space-y-1">
              {navItems.map(item => {
                const isActive = item.exact
                  ? location.pathname === item.to || location.pathname === '/admin'
                  : location.pathname.startsWith(item.to);

                return (
                  <div key={item.to}>
                    <NavLink
                      to={item.to}
                      onClick={() => {
                        if (window.innerWidth < 768) onClose();
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? 'bg-[#3C50E0]/10 text-[#3C50E0] font-semibold'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <item.icon
                          className={`w-4 h-4 transition-colors ${
                            isActive ? 'text-[#3C50E0]' : 'text-slate-400 group-hover:text-slate-600'
                          }`}
                        />
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {item.isNew && (
                          <span className="text-[9px] font-bold tracking-wider text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase">
                            New
                          </span>
                        )}
                        {item.badge && (
                          <span className="text-[10px] font-medium text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.badge}
                          </span>
                        )}
                        {item.hasSub && (
                          <ChevronDown
                            className={`w-3.5 h-3.5 transition-transform ${
                              isActive ? 'rotate-180 text-[#3C50E0]' : 'text-slate-400'
                            }`}
                          />
                        )}
                      </div>
                    </NavLink>

                    {/* Sub-item for Dashboard */}
                    {item.hasSub && isActive && (
                      <div className="pl-9 pr-3 pt-1 space-y-1">
                        <div className="px-3 py-1.5 text-xs font-semibold text-[#3C50E0] bg-[#3C50E0]/5 rounded-lg flex items-center justify-between">
                          <span>{item.subLabel}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-[#3C50E0]" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>

          {/* Secondary Features Section matching TailAdmin */}
          <div>
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              Others
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Bot className="w-4 h-4 text-slate-400" />
                  <span>AI Assistant</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full uppercase">
                  New
                </span>
              </div>

              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-50 cursor-pointer">
                <div className="flex items-center gap-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>Calendar</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Session Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-[#3C50E0] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="truncate text-left">
              <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name || 'Harish Rao'}</p>
              <p className="text-[10px] text-slate-400 truncate capitalize">{currentUser.role || 'Admin'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
