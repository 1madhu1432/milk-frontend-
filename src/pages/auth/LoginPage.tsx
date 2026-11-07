import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTenant } from '../../contexts/TenantContext';
import { useDairy } from '../../contexts/DairyContext';
import { GoogleAuthModal, GoogleLogoSvg } from '../../components/auth/GoogleAuthModal';
import {
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserCircle,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { login } = useDairy();

  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'admin' | 'employee' | 'customer' | 'auto'>('auto');

  const handleGoogleSuccess = (role: any, email: string, name: string, id?: string) => {
    login(role, email, name, id);
    if (role === 'admin') navigate('/admin/dashboard');
    else if (role === 'employee') navigate('/employee/deliveries');
    else navigate('/customer/portal');
  };

  const handleOpenGoogleForRole = (role: 'admin' | 'employee' | 'customer' | 'auto') => {
    setSelectedRole(role);
    setIsGoogleModalOpen(true);
  };

  const modules = [
    {
      id: 'customer',
      title: '1. User / Customer Portal',
      roleSubtitle: 'Household Milk Subscriber',
      description: 'Customer portal with daily milk calendar, weekday quotas, vacations pause/resume, extra milk orders & bills.',
      icon: UserCircle,
      emoji: '🥛',
      role: 'customer' as const,
      badge: 'Consumer Portal',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      credentials: 'Sign in with Google (Rajesh Reddy)',
      buttonText: 'Sign in with Google',
      btnClass: 'from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800',
    },
    {
      id: 'delivery',
      title: '2. Delivery Boy Portal',
      roleSubtitle: 'Route Rider / Delivery Staff',
      description: 'Mobile delivery portal with sequential route stops, GPS navigation, delivered milk quantities, cash/UPI collection.',
      icon: Truck,
      emoji: '🚚',
      role: 'employee' as const,
      badge: 'Rider Mobile App',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      credentials: 'Sign in with Google (Suresh Kumar)',
      buttonText: 'Sign in with Google',
      btnClass: 'from-teal-700 to-emerald-700 hover:from-teal-800 hover:to-emerald-800',
    },
    {
      id: 'admin',
      title: '3. Admin ERP Console',
      roleSubtitle: 'Dairy Business Owner / Operator',
      description: `Isolated ERP for ${currentTenant.name}. Customers, routes, milk procurement, quality tests, billing & custom domain.`,
      icon: ShieldCheck,
      emoji: '🏢',
      role: 'admin' as const,
      badge: 'Business ERP',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      credentials: 'Sign in with Google (Harish Reddy)',
      buttonText: 'Sign in with Google',
      btnClass: 'from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800',
    },
    {
      id: 'super-admin',
      title: '4. Super Admin Module',
      roleSubtitle: 'Platform SaaS Owner',
      description: 'Global multi-tenant dashboard, manage all dairy businesses, subscription tiers, platform revenue, and custom domains.',
      icon: ShieldAlert,
      emoji: '👑',
      role: null,
      to: '/super-admin',
      badge: 'Platform SaaS',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      credentials: 'Direct SaaS Platform Owner',
      buttonText: 'Open Super Admin',
      btnClass: 'from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#062614] to-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Header */}
      <div className="text-center mb-6 relative z-10 max-w-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-3xl mb-3 text-3xl backdrop-blur-md border border-white/20 shadow-xl ring-4 ring-emerald-500/20">
          🥛
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-3xl font-black tracking-tight text-white">MilkerP SaaS Platform</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Multi-Tenant
          </span>
        </div>
        <p className="text-sm text-emerald-200/90 font-medium">
          Protected with Google Single Sign-On (SSO) • Context: <span className="font-bold text-white">{currentTenant.name}</span>
        </p>

        {/* Central 1-Click Google Sign In Bar */}
        <div className="mt-5 max-w-md mx-auto">
          <button
            onClick={() => handleOpenGoogleForRole('auto')}
            className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm py-3 px-5 rounded-2xl border border-white/40 shadow-xl hover:shadow-2xl flex items-center justify-center gap-3 transition-all transform active:scale-[0.99] cursor-pointer group"
          >
            <GoogleLogoSvg className="w-5 h-5 group-hover:scale-105 transition-transform" />
            <span>Continue with Google (Auto-Detect Role)</span>
          </button>
        </div>
      </div>

      {/* 4 Application Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl w-full relative z-10">
        {modules.map(m => (
          <div
            key={m.id}
            onClick={() => {
              if (m.role) handleOpenGoogleForRole(m.role);
              else if (m.to) navigate(m.to);
            }}
            className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between cursor-pointer group hover:-translate-y-1"
          >
            <div>
              {/* Card Top */}
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-2xl shadow-inner group-hover:scale-105 transition-transform">
                  {m.emoji}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border ${m.badgeClass}`}>
                  {m.badge}
                </span>
              </div>

              <h2 className="text-base font-black text-slate-900 mt-4 leading-tight group-hover:text-emerald-800 transition-colors">
                {m.title}
              </h2>
              <p className="text-xs font-bold text-emerald-700 mt-0.5">
                {m.roleSubtitle}
              </p>

              <p className="text-xs text-slate-500 mt-3 leading-relaxed">
                {m.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
              <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-600 flex items-center gap-2">
                <GoogleLogoSvg className="w-3.5 h-3.5 shrink-0" />
                <span className="font-medium text-slate-700 truncate">{m.credentials}</span>
              </div>

              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  if (m.role) handleOpenGoogleForRole(m.role);
                  else if (m.to) navigate(m.to);
                }}
                className={`w-full py-3 bg-gradient-to-r ${m.btnClass} text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-2 group-hover:shadow-lg cursor-pointer`}
              >
                {m.role && <GoogleLogoSvg className="w-4 h-4" />}
                <span>{m.buttonText}</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center text-xs text-slate-400 relative z-10 font-medium space-y-1">
        <div>© 2026 MilkerP SaaS • Powered Exclusively by Google Single Sign-On (SSO)</div>
        <div className="text-[11px] text-slate-500">Multi-tenant Data Isolation • Tenant: {currentTenant.id} ({currentTenant.name})</div>
      </div>

      {/* Google Auth Modal */}
      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        targetRole={selectedRole}
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
};
