import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { Truck, ShieldCheck, Loader2, Sparkles, Mail, Lock, AlertCircle } from 'lucide-react';

export const DeliveryLoginPage: React.FC = () => {
  const { login, settings } = useDairy();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await authApi.login(email.trim(), password);
      login('employee', res.user.email, res.user.name, res.user.id);
      navigate('/employee/deliveries');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 font-sans">
      {/* Mobile App Phone Frame */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 animate-fade-in">
        {/* Rider Top Header */}
        <div className="bg-gradient-to-br from-teal-900 via-emerald-900 to-slate-900 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl mb-2.5 shadow-md">
            🚚
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400/20 text-teal-200 border border-teal-400/30 px-3 py-0.5 rounded-full">
            Delivery Staff Only
          </span>
          <h1 className="text-xl font-black tracking-tight text-white mt-2">
            Rider Route Sign In
          </h1>
          <p className="text-[11px] text-teal-200/90 mt-0.5">
            Morning Shift Dispatch • Doorstep Milk Deliveries
          </p>
        </div>

        {/* Login Body */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Assigned Delivery Route Access
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your delivery rider credentials to view stops, record deliveries, and collect payments.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rider Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="rider@yourdairy.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Access Rider Dashboard</span>
              )}
            </button>
          </form>



          {/* Shift Note */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center gap-2 text-slate-600">
            <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
            <span className="text-[11px]">Strict multi-tenant security guarantees riders only see their assigned route stops.</span>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-teal-700 hover:underline"
            >
              ← Portal Switcher
            </button>
            <span className="text-slate-400">Rider App</span>
          </div>
        </div>
      </div>
    </div>
  );
};
