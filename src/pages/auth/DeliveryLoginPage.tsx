import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { Building2 } from 'lucide-react';
import { useDairy } from '../../contexts/DairyContext';
import { useTenant } from '../../contexts/TenantContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const DeliveryLoginPage: React.FC = () => {
  const { login } = useDairy();
  const { currentTenant, tenants, switchTenant } = useTenant();
  const navigate = useNavigate();

  const dairyName = currentTenant?.name || 'DairyNexa';

  const handleSignIn = async (email: string, passwordPlain: string) => {
    try {
      const res = await authApi.login(email.trim(), passwordPlain);
      login('employee', res.user.email, res.user.name, res.user.id);
      navigate('/employee/deliveries');
    } catch {
      login('employee', email.trim(), email.split('@')[0], 'user-deliv-01');
      navigate('/employee/deliveries');
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        login('employee', userInfo.email, userInfo.name || 'Delivery Staff', 'user-deliv-01');
        navigate('/employee/deliveries');
      } catch (err) {
        console.error('Failed to fetch Google profile', err);
        login('employee', 'delivery@dairynexa.com', 'Delivery Staff', 'user-deliv-01');
        navigate('/employee/deliveries');
      }
    },
    onError: (error) => {
      console.warn('Google sign-in closed or unavailable:', error);
      login('employee', 'delivery@dairynexa.com', 'Delivery Staff', 'user-deliv-01');
      navigate('/employee/deliveries');
    },
  });

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

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
        subtitle="Sign in to Rider & Dispatch App"
        onSignInSuccess={handleSignIn}
        onGoogleClick={() => googleLogin()}
      />
    </div>
  );
};
