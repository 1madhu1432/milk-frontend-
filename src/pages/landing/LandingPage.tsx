import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { useTenant } from '../../contexts/TenantContext';
import {
  ShieldCheck,
  Truck,
  UserCircle,
  ArrowRight,
  CheckCircle2,
  Calendar,
  CreditCard,
  Droplet,
  Smartphone,
  ChevronRight,
  Sparkles,
  Zap,
  BarChart3,
  Clock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentTenant } = useTenant();
  const { login } = useDairy();

  const handleQuickDemo = (role: 'admin' | 'employee' | 'customer' | 'super_admin') => {
    if (role === 'admin') {
      login('admin', 'admin@dairynexa.com', 'Dairy Owner (Admin)', 'user-admin-01');
      navigate('/admin/dashboard');
    } else if (role === 'employee') {
      login('employee', 'delivery@dairynexa.com', 'Suresh Kumar Goud', 'user-deliv-01');
      navigate('/employee/deliveries');
    } else if (role === 'customer') {
      login('customer', 'subscriber@dairynexa.com', 'Valued Customer', 'user-cust-01');
      navigate('/customer/home');
    } else if (role === 'super_admin') {
      login('super_admin', 'platform.owner@dairynexa.com', 'DairyNexa Platform Owner', 'user-super-01');
      navigate('/super-admin');
    }
  };

  const coreFeatures = [
    {
      icon: Truck,
      title: 'Smart Dispatch Routes',
      description: 'Generate morning and evening delivery run-sheets organized sequentially by house number, building, and street.',
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: Calendar,
      title: 'Vacations & Pause Controls',
      description: 'Subscribers can pause and resume daily deliveries in 1 tap with automatic billing deductions and zero milk wastage.',
      color: 'text-blue-400',
      bg: 'bg-blue-500/10 border-blue-500/20',
    },
    {
      icon: CreditCard,
      title: 'Integrated Razorpay & UPI',
      description: 'Collect payments through Google Pay, PhonePe, Paytm, cards, and netbanking with instant invoice reconciliation.',
      color: 'text-violet-400',
      bg: 'bg-violet-500/10 border-violet-500/20',
    },
    {
      icon: Droplet,
      title: 'Milk Procurement & Silos',
      description: 'Test incoming cow and buffalo milk batches for FAT% and SNF%, calculate automated farmer rates, and track silo stock.',
      color: 'text-cyan-400',
      bg: 'bg-cyan-500/10 border-cyan-500/20',
    },
    {
      icon: Smartphone,
      title: 'Mobile Delivery Rider App',
      description: 'Delivery boys update quantities, record missed deliveries, and log doorstep drops right from their smartphone browsers.',
      color: 'text-amber-400',
      bg: 'bg-amber-500/10 border-amber-500/20',
    },
    {
      icon: BarChart3,
      title: 'Executive P&L Analytics',
      description: 'Track daily procurement vs delivery milk balance, monthly billing registers, collection ratios, and outstanding dues.',
      color: 'text-rose-400',
      bg: 'bg-rose-500/10 border-rose-500/20',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Procure & Test Milk',
      desc: 'Record morning farm collections with FAT/SNF readings and monitor real-time silo storage.',
    },
    {
      step: '02',
      title: 'Automate Route Dispatch',
      desc: 'System aggregates subscriber quotas, handles vacation pauses, and generates route manifests.',
    },
    {
      step: '03',
      title: 'Doorstep Drop Delivery',
      desc: 'Riders deliver following turn-by-turn house sequences and confirm drops with zero paperwork.',
    },
    {
      step: '04',
      title: 'Instant 1-Tap UPI Billing',
      desc: 'Automated invoices generated monthly; customers clear outstanding balances via UPI in seconds.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 font-sans selection:bg-emerald-500 selection:text-black relative overflow-x-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-[800px] -left-48 w-96 h-96 bg-blue-500/10 blur-3xl pointer-events-none rounded-full" />
      <div className="absolute top-[1400px] -right-48 w-96 h-96 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

      {/* 1. Sticky Navigation Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090E]/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              🥛
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                {currentTenant.name}
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  ERP
                </span>
              </span>
              <p className="text-[10px] text-slate-400 font-medium">Daily Milk Delivery SaaS</p>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#workflow" className="hover:text-emerald-400 transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-emerald-400 transition-colors">Instant Demo</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="px-3.5 py-2 text-xs font-bold text-slate-300 hover:text-white transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => handleQuickDemo('admin')}
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 hover:from-emerald-400 hover:to-teal-400 shadow-md shadow-emerald-500/25 transition-all flex items-center gap-1.5 cursor-pointer group hover:scale-[1.02]"
            >
              <span>Launch Admin ERP</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold mb-6 animate-pulse">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Complete Cloud Dairy & Milk Delivery Platform</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
          Automate Milk Deliveries,{' '}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
            Household Subscriptions
          </span>{' '}
          & Collections.
        </h1>

        <p className="mt-6 text-sm sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
          From morning farm procurement and fat testing to route packing, sequential doorstep delivery checklists, vacation pauses, and automated UPI billing on WhatsApp.
        </p>

        {/* CTA Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => handleQuickDemo('admin')}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center gap-2 cursor-pointer group hover:scale-105"
          >
            <span>Open Dairy Admin ERP</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => handleQuickDemo('customer')}
            className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 shadow-md transition-all flex items-center gap-2 cursor-pointer hover:border-slate-600"
          >
            <UserCircle className="w-4 h-4 text-blue-400" />
            <span>Customer Portal</span>
          </button>

          <button
            onClick={() => handleQuickDemo('employee')}
            className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-white font-bold text-sm border border-slate-700/80 shadow-md transition-all flex items-center gap-2 cursor-pointer hover:border-slate-600"
          >
            <Truck className="w-4 h-4 text-teal-400" />
            <span>Delivery Staff App</span>
          </button>
        </div>

        {/* Real-Time Stats Highlights */}
        <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-slate-800/60">
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
            <span className="text-2xl sm:text-3xl font-black text-emerald-400 block">99.8%</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              On-Time Drops
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
            <span className="text-2xl sm:text-3xl font-black text-blue-400 block">₹0</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              Billing Leakage
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
            <span className="text-2xl sm:text-3xl font-black text-teal-400 block">1-Tap</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              UPI Payments
            </span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 text-center">
            <span className="text-2xl sm:text-3xl font-black text-purple-400 block">100%</span>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mt-1 block">
              Cloud Managed
            </span>
          </div>
        </div>
      </section>

      {/* 4. Core Features Grid */}
      <section id="features" className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-black uppercase tracking-wider text-teal-400 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20">
            Enterprise Capabilities
          </span>
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mt-3">
            Built Specifically For Daily Dairy Operations
          </h2>
          <p className="text-sm text-slate-400 mt-2 font-medium">
            Everything your milk business needs to scale from 50 households to 50,000 daily doorstep subscribers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/70 transition-all group"
              >
                <div className={`w-12 h-12 rounded-2xl ${feat.bg} flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon className={`w-6 h-6 ${feat.color}`} />
                </div>
                <h3 className="text-base font-black text-white">{feat.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. How It Works Workflow Infographic */}
      <section id="workflow" className="py-16 md:py-20 bg-slate-950/60 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Turnkey Daily Routine
            </span>
            <h2 className="text-3xl font-black tracking-tight text-white mt-3">
              How DairyNexa Runs Your Daily Business
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((st, i) => (
              <div key={i} className="relative p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
                <span className="text-4xl font-black text-emerald-500/30 block mb-2 font-mono">
                  {st.step}
                </span>
                <h3 className="text-base font-black text-white">{st.title}</h3>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{st.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. Footer */}
      <footer className="border-t border-slate-800 bg-[#06080B] py-12 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-base border border-emerald-500/30">
              🥛
            </div>
            <div>
              <span className="font-bold text-white text-sm">{currentTenant.name}</span>
              <p className="text-[11px] text-slate-500">© 2026 DairyNexa Platform. All rights reserved.</p>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs font-semibold">
            <span
              onClick={() => handleQuickDemo('admin')}
              className="hover:text-emerald-400 cursor-pointer transition-colors"
            >
              Admin Dashboard
            </span>
            <span
              onClick={() => handleQuickDemo('customer')}
              className="hover:text-emerald-400 cursor-pointer transition-colors"
            >
              Customer Portal
            </span>
            <span
              onClick={() => handleQuickDemo('employee')}
              className="hover:text-emerald-400 cursor-pointer transition-colors"
            >
              Delivery App
            </span>
            <span
              onClick={() => handleQuickDemo('super_admin')}
              className="hover:text-emerald-400 cursor-pointer transition-colors"
            >
              Super Admin
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
