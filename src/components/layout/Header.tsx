import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { Modal } from '../common/Modal';
import {
  Bell,
  RefreshCw,
  Menu,
  LogOut,
  Sparkles,
  Database,
  Share2,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  Users,
  Truck,
  Globe,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, settings, isDemoMode, clearAllData, loadDemoData, resetDemoData, notificationLogs, logout } = useDairy();
  const navigate = useNavigate();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const customerUrl = `${origin}/login/customer`;
  const deliveryUrl = `${origin}/login/delivery`;
  const universalUrl = `${origin}/login`;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        'Switch to Clean Production Mode? This will remove all 150 dummy customers and mock deliveries, leaving a clean slate for real operational dairy data.'
      )
    ) {
      clearAllData();
      alert('Clean Production Mode activated! All dummy records cleared.');
    }
  };

  const handleLoadDemo = () => {
    if (
      window.confirm(
        'Restore Sample Demo Data? This will load 150 sample households, 5 delivery routes, and test billing.'
      )
    ) {
      loadDemoData();
      alert('Sample demo dataset loaded!');
    }
  };

  const handleReset = () => {
    if (
      window.confirm(
        'Are you sure you want to reset demo data? This will restore 150 sample customers, 5 routes, vendors, inventory, and initial transactions.'
      )
    ) {
      resetDemoData();
      alert('Demo data has been reset successfully!');
    }
  };

  const handleLogout = () => {
    if (window.confirm('Do you want to log out and return to the login screen?')) {
      logout();
      navigate('/login');
    }
  };

  const pendingNotifs = notificationLogs.filter(n => n.status === 'Pending').length;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="flex items-center gap-3">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 md:hidden transition-colors"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="flex items-center justify-center w-10 h-10 text-xl bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200/60 ring-2 ring-emerald-500/10">
              🥛
            </span>
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white"></span>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold text-slate-900 tracking-tight">
                {settings?.dairyName || 'DairyNexa'}
              </h1>
              {isDemoMode ? (
                <span
                  className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200 px-1.5 py-0.5 rounded-md"
                  title="Displaying sample mock customers and delivery records"
                >
                  🧪 Demo Data Active
                </span>
              ) : (
                <span
                  className="hidden sm:inline-block text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200 px-1.5 py-0.5 rounded-md"
                  title="Clean production workspace for real dairy operations"
                >
                  🟢 Clean Production
                </span>
              )}
            </div>
            <p className="text-[11px] text-emerald-700 font-semibold tracking-wide">
              {settings?.tagline || 'Farm Fresh Delivery & ERP SaaS'}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle Mode: Switch to Clean vs Sample Demo */}
        {isDemoMode ? (
          <button
            onClick={handleClearData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-all border border-amber-300 shadow-2xs"
            title="Clear all 150 dummy records and start fresh for real dairy management"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">Clear Dummy Data</span>
          </button>
        ) : (
          <button
            onClick={handleLoadDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl transition-all border border-slate-200 shadow-2xs"
            title="Load sample 150 customer demo dataset for testing"
          >
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">Load Sample Data</span>
          </button>
        )}

        {/* Share Website Links Button for Admin */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-all border border-blue-200/80 shadow-2xs"
          title="View & share website link for customers and delivery staff"
        >
          <Share2 className="w-3.5 h-3.5 text-blue-600" />
          <span className="hidden sm:inline">Share Website</span>
        </button>

        {/* Notifications Icon with Pulse */}
        <div className="relative">
          <button
            className="p-2 text-slate-500 rounded-xl hover:text-slate-800 hover:bg-slate-100 transition-colors"
            title="Operational Alerts"
          >
            <Bell className="w-4 h-4" />
            {pendingNotifs > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white animate-pulse"></span>
            )}
          </button>
        </div>

        {/* User Profile Badge */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white font-extrabold text-xs shadow-xs">
            {currentUser.name ? currentUser.name.charAt(0) : 'U'}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">
              {currentUser.name || 'User'}
            </p>
            <p className="text-[10px] text-emerald-700 font-semibold capitalize">
              {currentUser.role}
            </p>
          </div>
        </div>

        {/* Explicit Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 hover:text-rose-800 rounded-xl transition-all border border-rose-200/80 shadow-2xs"
          title="Log out and return to Login Screen"
        >
          <LogOut className="w-3.5 h-3.5 text-rose-600" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Share Portals Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Website Links With Users"
        maxWidth="lg"
      >
        <div className="space-y-5 p-1 text-slate-800">
          <p className="text-xs text-slate-500 leading-relaxed">
            Copy or directly dispatch portal access links to your household milk subscribers and delivery route staff.
          </p>

          {/* 1. Customer Portal Card */}
          <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-blue-950">Customer / Subscriber Portal</h4>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold uppercase">
                      For Households
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700/90 mt-0.5">
                    Customers view daily calendars, pause vacations & pay monthly bills.
                  </p>
                </div>
              </div>
            </div>

            {/* URL Box & Actions */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={customerUrl}
                className="w-full text-xs font-mono bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none select-all"
              />
              <button
                onClick={() => handleCopy('customer', customerUrl)}
                className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-2xs"
              >
                {copiedKey === 'customer' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-blue-200/60">
              <span className="text-[10px] text-blue-700 font-medium">
                Authentication: <strong>1-Tap Google Sign-In</strong> (No passwords required)
              </span>
              <div className="flex items-center gap-1.5">
                <a
                  href={`https://wa.me/?text=${encodeURIComponent(`Hello! Access your Dairy Milk Portal here to manage deliveries, pause vacations, and pay bills: ${customerUrl}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 hover:bg-emerald-200 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-3 h-3 text-emerald-600" />
                  <span>WhatsApp Share</span>
                </a>
                <a
                  href={customerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-white hover:bg-blue-100/60 border border-blue-200 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </a>
              </div>
            </div>
          </div>

          {/* 2. Delivery Boy Portal Card */}
          <div className="p-4 bg-gradient-to-br from-teal-50/70 to-emerald-50/50 rounded-2xl border border-teal-200/80 shadow-2xs space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
                <Truck className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-teal-950">Delivery Boy / Rider Portal</h4>
                  <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded-full font-bold uppercase">
                    For Riders
                  </span>
                </div>
                <p className="text-[11px] text-teal-700/90 mt-0.5">
                  Route navigation, doorstep delivery checklist & cash collection.
                </p>
              </div>
            </div>

            {/* URL Box & Actions */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={deliveryUrl}
                className="w-full text-xs font-mono bg-white border border-teal-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none select-all"
              />
              <button
                onClick={() => handleCopy('delivery', deliveryUrl)}
                className="flex items-center gap-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shrink-0 transition-colors shadow-2xs"
              >
                {copiedKey === 'delivery' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-200" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center justify-between gap-2 pt-1 border-t border-teal-200/60">
              <span className="text-[10px] text-teal-700 font-medium">
                Authentication: <strong>1-Tap Google Sign-In</strong> (No passwords required)
              </span>
              <a
                href={deliveryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-teal-800 bg-white hover:bg-teal-100/60 border border-teal-200 rounded-lg transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Open</span>
              </a>
            </div>
          </div>

          {/* 3. Central Login Switcher */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-slate-500" />
              <div>
                <p className="font-bold text-slate-800 text-[11px]">Universal Login Hub</p>
                <p className="text-[10px] text-slate-500">{universalUrl}</p>
              </div>
            </div>
            <button
              onClick={() => handleCopy('universal', universalUrl)}
              className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[11px] font-bold rounded-lg transition-colors"
            >
              {copiedKey === 'universal' ? 'Copied!' : 'Copy Hub Link'}
            </button>
          </div>
        </div>
      </Modal>
    </header>
  );
};
