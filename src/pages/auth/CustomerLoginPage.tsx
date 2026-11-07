import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { ShieldCheck, Loader2, Sparkles, CheckCircle2, Mail, Lock, AlertCircle } from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
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
      login('customer', res.user.email, res.user.name, res.user.id);
      navigate('/customer/portal');
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a1f33] to-slate-900 flex flex-col justify-center items-center px-4 py-8 font-sans">
      {/* Mobile-friendly Card Frame */}
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-700/50 animate-fade-in">
        {/* Customer Top Header */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 p-6 text-white text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl mb-2.5 shadow-md">
            🥛
          </div>
          <span className="text-[10px] font-black uppercase tracking-wider bg-blue-400/20 text-blue-200 border border-blue-400/30 px-3 py-0.5 rounded-full">
            Customer / Household Portal
          </span>
          <h1 className="text-xl font-black tracking-tight text-white mt-2">
            Subscriber Sign In
          </h1>
          <p className="text-[11px] text-blue-200/90 mt-0.5">
            {settings?.dairyName || 'Harish Dairy Farm'} • Fresh Doorstep Milk
          </p>
        </div>

        {/* Login Body */}
        <div className="p-6 space-y-5">
          <div className="text-center space-y-1">
            <h2 className="text-sm font-bold text-slate-900">
              Welcome to Your Milk Account
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Sign in with your subscriber credentials to manage daily milk deliveries, vacation pauses, and bills.
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
                Registered Email / Mobile
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="customer@example.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>Access Customer Portal</span>
              )}
            </button>
          </form>



          {/* Perks Highlight Box */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Included in Customer Portal:
            </p>
            <ul className="text-slate-600 text-[11px] space-y-1.5 pl-1">
              <li>• Live daily delivery status & bottle count</li>
              <li>• Vacation schedule pause and instant resume</li>
              <li>• Monthly invoices and secure online payments</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-blue-700 hover:underline"
            >
              ← Portal Switcher
            </button>
            <span className="text-slate-400">Subscriber App</span>
          </div>
        </div>
      </div>
    </div>
  );
};
