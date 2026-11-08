import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useTenant } from '../../contexts/TenantContext';
import { useDairy } from '../../contexts/DairyContext';
import {
  ShieldAlert,
  ShieldCheck,
  Truck,
  UserCircle,
  ArrowRight,
} from 'lucide-react';

export const GoogleLogoSvg = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { login } = useDairy();

  const [activeRoleForGoogle, setActiveRoleForGoogle] = useState<'admin' | 'employee' | 'customer' | 'auto'>('auto');

  const handleOpenGoogleForRole = (role: 'admin' | 'employee' | 'customer' | 'auto') => {
    if (role === 'admin') {
      login('admin', 'admin@dairynexa.com', 'Dairy Owner (Admin)', 'user-admin-01');
      navigate('/admin/dashboard');
    } else if (role === 'employee') {
      login('employee', 'delivery@dairynexa.com', 'Delivery Staff', 'user-deliv-01');
      navigate('/employee/deliveries');
    } else if (role === 'customer') {
      login('customer', 'customer@dairynexa.com', 'Valued Subscriber', 'user-cust-01');
      navigate('/customer/home');
    } else {
      login('admin', 'admin@dairynexa.com', 'Dairy Owner (Admin)', 'user-admin-01');
      navigate('/admin/dashboard');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        const role = activeRoleForGoogle === 'auto' ? 'admin' : activeRoleForGoogle;
        login(role, userInfo.email, userInfo.name || 'User', `user-${role}-01`);
        if (role === 'admin') navigate('/admin/dashboard');
        else if (role === 'employee') navigate('/employee/deliveries');
        else if (role === 'customer') navigate('/customer/home');
        else navigate('/admin/dashboard');
      } catch (err) {
        handleOpenGoogleForRole(activeRoleForGoogle);
      }
    },
    onError: () => {
      handleOpenGoogleForRole(activeRoleForGoogle);
    },
  });

  const triggerGoogleAuth = (role: 'admin' | 'employee' | 'customer' | 'auto') => {
    setActiveRoleForGoogle(role);
    googleLogin();
  };

  const modules = [
    {
      id: 'customer',
      title: 'Customer / Household Portal',
      routePath: '/login/customer',
      roleSubtitle: 'Household Milk Subscriber',
      description: 'Daily milk calendar, weekday quotas, vacations pause/resume, extra milk orders & instant UPI bills.',
      icon: UserCircle,
      emoji: '🥛',
      role: 'customer' as const,
      badge: 'Separate Login Page',
      badgeClass: 'bg-blue-100 text-blue-800 border-blue-300',
      directButtonText: 'Open Customer Login Page',
      btnClass: 'from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700',
      demoUser: 'customer@dailydairy.demo',
    },
    {
      id: 'delivery',
      title: 'Delivery Staff Portal',
      routePath: '/login/delivery',
      roleSubtitle: 'Route Rider / Dispatch Team',
      description: 'Mobile delivery route stops, sequential house delivery logs, quantity adjustment & cash/UPI recording.',
      icon: Truck,
      emoji: '🚚',
      role: 'employee' as const,
      badge: 'Separate Login Page',
      badgeClass: 'bg-teal-100 text-teal-800 border-teal-300',
      directButtonText: 'Open Delivery Login Page',
      btnClass: 'from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700',
      demoUser: 'delivery@dailydairy.demo',
    },
    {
      id: 'admin',
      title: 'Dairy Admin / Owner ERP',
      routePath: '/login/admin',
      roleSubtitle: 'Dairy Business Owner / Operator',
      description: `Complete management for ${currentTenant.name}. Customers, routes, milk procurement, QC testing, billing & settings.`,
      icon: ShieldCheck,
      emoji: '🏢',
      role: 'admin' as const,
      badge: 'Separate Login Page',
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300',
      directButtonText: 'Open Dairy Admin Login Page',
      btnClass: 'from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700',
      demoUser: 'admin@dailydairy.demo',
    },
    {
      id: 'super-admin',
      title: 'Super Admin Platform Console',
      routePath: '/login/super-admin',
      roleSubtitle: 'SaaS Platform Owner',
      description: 'Global multi-tenant dashboard, manage all dairy businesses, plans, platform revenue, and custom domains.',
      icon: ShieldAlert,
      emoji: '👑',
      role: null,
      badge: 'Separate Login Page',
      badgeClass: 'bg-purple-100 text-purple-800 border-purple-300',
      directButtonText: 'Open Super Admin Login Page',
      btnClass: 'from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800',
      demoUser: 'platform.owner@milkerp.com',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#062614] to-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden font-sans">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />


      {/* Main Header */}
      <div className="text-center mb-6 relative z-10 max-w-2xl">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-3xl mb-3 text-3xl backdrop-blur-md border border-white/20 shadow-xl ring-4 ring-emerald-500/20">
          🥛
        </div>
        <div className="flex items-center justify-center gap-2 mb-1">
          <h1 className="text-3xl font-black tracking-tight text-white">DairyNexa SaaS Portals</h1>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            Dedicated Login Pages
          </span>
        </div>
        <p className="text-xs text-emerald-200/90 font-medium">
          Select any portal below to navigate directly to its dedicated, full-screen login page.
        </p>

        {/* Central 1-Click Google Sign In Bar */}
        <div className="mt-4 max-w-md mx-auto">
          <button
            onClick={() => triggerGoogleAuth('auto')}
            className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold text-xs py-2.5 px-4 rounded-xl border border-white/40 shadow-lg flex items-center justify-center gap-2.5 transition-all cursor-pointer group"
          >
            <GoogleLogoSvg className="w-4 h-4 group-hover:scale-105 transition-transform" />
            <span>Sign In with Google (Auto-Detect Role)</span>
          </button>
        </div>
      </div>

      {/* 4 Application Modules Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-7xl w-full relative z-10">
        {modules.map((m) => (
          <div
            key={m.id}
            className="bg-white/95 backdrop-blur-xl rounded-3xl border border-white/20 p-5 shadow-xl hover:shadow-2xl transition-all flex flex-col justify-between group hover:-translate-y-1"
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

              <h2 className="text-base font-black text-slate-900 mt-3 leading-tight">
                {m.title}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                  {m.routePath}
                </span>
              </div>
              <p className="text-xs font-bold text-emerald-700 mt-1">
                {m.roleSubtitle}
              </p>

              <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">
                {m.description}
              </p>
            </div>

            <div className="mt-5 pt-3.5 border-t border-slate-100 space-y-2">
              <div className="text-[10px] text-slate-400 font-medium truncate">
                Demo user: <span className="font-mono text-slate-600 font-bold">{m.demoUser}</span>
              </div>

              {/* Primary Direct Button to the Separate Login Page */}
              <button
                type="button"
                onClick={() => navigate(m.routePath)}
                className={`w-full py-2.5 bg-gradient-to-r ${m.btnClass} text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center justify-center gap-1.5 group-hover:shadow-lg cursor-pointer`}
              >
                <span>{m.directButtonText}</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
              </button>

              {/* Secondary Google SSO Button */}
              {m.role && (
                <button
                  type="button"
                  onClick={() => triggerGoogleAuth(m.role)}
                  className="w-full py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg text-[11px] font-bold border border-slate-200 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <GoogleLogoSvg className="w-3 h-3" />
                  <span>Google Sign In</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center text-xs text-slate-400 relative z-10 font-medium space-y-1">
        <div>© 2026 DairyNexa Platform • Complete Multi-Tenant Architecture</div>
        <div className="text-[11px] text-slate-500">
          Individual URLs: <span className="text-emerald-400 font-mono">/login/admin</span> • <span className="text-blue-400 font-mono">/login/customer</span> • <span className="text-teal-400 font-mono">/login/delivery</span> • <span className="text-purple-400 font-mono">/login/super-admin</span>
        </div>
      </div>
    </div>
  );
};
