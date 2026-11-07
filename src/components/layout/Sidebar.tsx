import React, { useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  MapPin,
  Building2,
  Milk,
  Boxes,
  PauseCircle,
  Truck,
  PackageCheck,
  ShoppingCart,
  Receipt,
  CreditCard,
  MessageSquare,
  BarChart3,
  Settings,
  X,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavSection {
  title: string;
  items: {
    to: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { logout, currentUser } = useDairy();
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Do you want to log out and return to the login screen?')) {
      logout();
      navigate('/login');
    }
  };

  const navSections: NavSection[] = useMemo(() => {
    if (currentUser.role === 'employee') {
      return [
        {
          title: 'Delivery Staff Actions',
          items: [
            { to: '/employee/deliveries', label: "Today's Deliveries", icon: Truck, badge: 'Live' },
            { to: '/admin/routes', label: 'Route Stops & Circuits', icon: MapPin },
            { to: '/admin/inventory', label: 'Cold Room Silo Stock', icon: Boxes },
          ],
        },
      ];
    }

    if (currentUser.role === 'customer') {
      return [
        {
          title: 'Customer Dashboard',
          items: [
            { to: '/customer/portal', label: 'My Milk Subscription', icon: Milk },
            { to: '/customer/portal', label: 'Dairy Store & Add-ons', icon: ShoppingCart },
            { to: '/customer/portal', label: 'Monthly Bills & Invoices', icon: Receipt },
            { to: '/customer/portal', label: 'Vacation Pause Calendar', icon: PauseCircle },
            { to: '/customer/portal', label: 'Account Statement Ledger', icon: BarChart3 },
          ],
        },
      ];
    }

    // Default Admin Navigation
    return [
      {
        title: 'Operations & Fleet',
        items: [
          { to: '/admin/dashboard', label: 'Admin ERP Console', icon: LayoutDashboard },
          { to: '/admin/deliveries', label: 'Master Deliveries', icon: Truck },
          { to: '/admin/inventory', label: 'Stock & Silos', icon: Boxes },
          { to: '/admin/purchases', label: 'Milk Purchases', icon: Milk },
          { to: '/admin/routes', label: 'Delivery Circuits', icon: MapPin },
        ],
      },
      {
        title: 'Subscribers & Staff',
        items: [
          { to: '/admin/customers', label: 'Customer Directory', icon: Users, badge: '500' },
          { to: '/admin/employees', label: 'Delivery Staff List', icon: UserCheck },
          { to: '/admin/pauses', label: 'Vacation Pauses', icon: PauseCircle },
        ],
      },
      {
        title: 'Sales & Billing',
        items: [
          { to: '/admin/products', label: 'Dairy Catalogue', icon: PackageCheck },
          { to: '/admin/orders', label: 'Product Orders', icon: ShoppingCart },
          { to: '/admin/billing', label: 'Monthly Billing', icon: Receipt },
          { to: '/admin/payments', label: 'Payment Gateway', icon: CreditCard },
          { to: '/admin/vendors', label: 'Milk Vendors', icon: Building2 },
        ],
      },
      {
        title: 'Analytics & Controls',
        items: [
          { to: '/admin/notifications', label: 'WhatsApp Alerts', icon: MessageSquare },
          { to: '/admin/reports', label: 'Reports & P&L', icon: BarChart3 },
          { to: '/admin/settings', label: 'Business Settings', icon: Settings },
        ],
      },
    ];
  }, [currentUser.role]);

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs md:hidden"
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 h-screen md:h-[calc(100vh-4rem)] w-64 bg-white/95 backdrop-blur-md border-r border-slate-200/80 flex flex-col transition-transform duration-200 ease-in-out shrink-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Mobile Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-100 md:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xl">🥛</span>
            <span className="font-extrabold text-slate-900 text-sm">Harish Dairy Menu</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Account Session Card in Sidebar */}
        <div className="p-3.5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Signed In As
            </span>
            <span
              className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                currentUser.role === 'admin'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : currentUser.role === 'employee'
                  ? 'bg-teal-100 text-teal-800 border border-teal-300'
                  : 'bg-blue-100 text-blue-800 border border-blue-300'
              }`}
            >
              {currentUser.role === 'admin' ? 'Owner / Admin' : currentUser.role === 'employee' ? 'Delivery Driver' : 'Customer'}
            </span>
          </div>

          <p className="text-xs font-black text-slate-900 mt-1 truncate">
            {currentUser.name}
          </p>
          <p className="text-[11px] text-slate-500 font-medium truncate">
            {currentUser.email}
          </p>
        </div>

        {/* Scrollable Navigation Sections */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {navSections.map(section => (
            <div key={section.title} className="space-y-1">
              <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-400">
                {section.title}
              </p>
              {section.items.map(item => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => {
                      if (window.innerWidth < 768) onClose();
                    }}
                    className={({ isActive }) =>
                      `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-gradient-to-r from-emerald-600 to-green-700 text-white shadow-xs font-bold shadow-emerald-700/20'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`w-4 h-4 transition-transform group-hover:scale-110 ${
                              isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-700'
                            }`}
                          />
                          <span className="truncate">{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                              isActive
                                ? 'bg-white/20 text-white'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-slate-100 space-y-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all border border-rose-200"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Session</span>
          </button>
        </div>
      </aside>
    </>
  );
};
