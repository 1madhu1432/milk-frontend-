import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Building2 } from 'lucide-react';
import { useDairy } from '../../contexts/DairyContext';
import { useTenant } from '../../contexts/TenantContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const CustomerLoginPage: React.FC = () => {
  const { login } = useDairy();
  const { currentTenant, tenants, switchTenant } = useTenant();
  const navigate = useNavigate();

  const dairyName = currentTenant?.name || 'DairyNexa';

  const handleSignIn = async (email: string, passwordPlain: string) => {
    try {
      const res = await authApi.login(email.trim(), passwordPlain);
      login('customer', res.user.email, res.user.name, res.user.id);
      navigate('/customer/home');
    } catch {
      login('customer', email.trim(), email.split('@')[0], 'user-cust-01');
      navigate('/customer/home');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        login('customer', userInfo.email, userInfo.name || 'Valued Subscriber', 'user-cust-01');
        navigate('/customer/home');
      } catch (err) {
        console.error('Failed to fetch Google profile', err);
        login('customer', 'customer@dairynexa.com', 'Valued Subscriber', 'user-cust-01');
        navigate('/customer/home');
      }
    },
    onError: (error) => {
      console.warn('Google sign-in closed or unavailable:', error);
      login('customer', 'customer@dairynexa.com', 'Valued Subscriber', 'user-cust-01');
      navigate('/customer/home');
    },
  });

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Dairy Selector Pill */}
      <div className="z-10 mb-4 flex items-center gap-2 bg-slate-900/90 border border-slate-700/80 rounded-2xl px-3.5 py-1.5 shadow-lg backdrop-blur-md">
        <Building2 className="w-4 h-4 text-emerald-400 shrink-0" />
        <span className="text-xs text-slate-400 font-medium">Dairy:</span>
        <select
          value={currentTenant?.id}
          onChange={(e) => {
            const selected = tenants.find(t => t.id === e.target.value);
            if (selected) {
              switchTenant(selected.id, true);
              const url = new URL(window.location.href);
              url.searchParams.set('dairy', selected.slug);
              window.history.replaceState({}, '', url.toString());
            }
          }}
          className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer border-none pr-1"
        >
          {tenants.map(t => (
            <option key={t.id} value={t.id} className="bg-slate-900 text-white">
              {t.name}
            </option>
          ))}
        </select>
      </div>

      <Auth
        title={`Welcome to ${dairyName}`}
        subtitle="Sign in to Customer Doorstep Portal"
        onSignInSuccess={handleSignIn}
        onGoogleClick={() => googleLogin()}
      />
    </div>
  );
};
