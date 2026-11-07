import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { Modal } from '../common/Modal';
import {
  Bell,
  Menu,
  Search,
  Moon,
  ChevronDown,
  LogOut,
  Share2,
  Database,
  Sparkles,
  Users,
  Copy,
  Check,
} from 'lucide-react';

interface HeaderProps {
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar }) => {
  const { currentUser, isDemoMode, clearAllData, loadDemoData, logout } = useDairy();
  const navigate = useNavigate();

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = typeof window !== 'undefined' ? window.location.origin : '';
  const customerUrl = `${origin}/login/customer`;
  const deliveryUrl = `${origin}/login/delivery`;

  const handleCopy = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleLogout = () => {
    if (window.confirm('Do you want to sign out from the ERP dashboard?')) {
      logout();
      navigate('/login/admin');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-7 bg-white border-b border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
      {/* Left: Hamburger & Search */}
      <div className="flex items-center gap-3 md:gap-5 flex-1">
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className="p-2 text-slate-500 rounded-xl hover:bg-slate-100 md:hidden transition-colors cursor-pointer"
            title="Toggle Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* TailAdmin Search Bar */}
        <div className="hidden sm:flex items-center gap-2.5 bg-slate-50/80 hover:bg-slate-50 border border-slate-200/80 rounded-xl px-3.5 py-2 text-xs text-slate-400 w-64 md:w-80 transition-colors">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <span className="text-slate-400 font-normal truncate">Search or type command...</span>
          <kbd className="ml-auto text-[10px] font-semibold bg-white border border-slate-200 text-slate-500 px-1.5 py-0.5 rounded shadow-2xs">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right: Actions, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Clean Mode / Demo Toggle */}
        {isDemoMode ? (
          <button
            onClick={() => {
              if (window.confirm('Clear dummy records and switch to clean slate?')) {
                clearAllData();
              }
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl border border-amber-200/80 transition-all cursor-pointer"
            title="Switch to Clean Production Mode"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>Demo Data</span>
          </button>
        ) : (
          <button
            onClick={() => {
              if (window.confirm('Load sample households and delivery routes?')) {
                loadDemoData();
              }
            }}
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition-all cursor-pointer"
            title="Load Sample Demo Dataset"
          >
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Load Demo</span>
          </button>
        )}

        {/* Share Link */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
          title="Share customer and delivery login links"
        >
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Share</span>
        </button>

        {/* Night Mode Icon */}
        <button
          className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer"
          title="Dark mode"
        >
          <Moon className="w-4 h-4 text-slate-600" />
        </button>

        {/* Notification Bell with Orange Dot */}
        <div className="relative">
          <button
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-50 rounded-xl border border-transparent hover:border-slate-200 transition-all cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-4 h-4 text-slate-600" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-amber-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile Pill matching TailAdmin */}
        <div className="relative pl-1">
          <button
            onClick={() => setIsProfileOpen(prev => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm shadow-blue-500/20 ring-2 ring-white">
              {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'H'}
            </div>
            <div className="hidden md:flex items-center gap-1 text-left">
              <span className="text-xs font-bold text-slate-800">
                {currentUser.name?.split(' ')[0] || 'Harish'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </div>
          </button>

          {/* Profile Dropdown */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-1.5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{currentUser.name}</p>
                <p className="text-[10px] text-slate-400 capitalize font-medium">{currentUser.role || 'Admin'}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-500" />
                <span>Log out</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Share Portals Modal */}
      <Modal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        title="Share Access Links"
        maxWidth="md"
      >
        <div className="space-y-4 p-2 text-slate-800">
          <p className="text-xs text-slate-500">
            Send direct portal login links to your customers and route riders.
          </p>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Customer Portal</span>
              <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">Households</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={customerUrl}
                className="w-full bg-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600"
              />
              <button
                onClick={() => handleCopy('cust', customerUrl)}
                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                {copiedKey === 'cust' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900">Delivery Rider Portal</span>
              <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Riders</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={deliveryUrl}
                className="w-full bg-white text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600"
              />
              <button
                onClick={() => handleCopy('deliv', deliveryUrl)}
                className="p-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-700 cursor-pointer"
              >
                {copiedKey === 'deliv' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-500" />}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </header>
  );
};
