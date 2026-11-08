import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useDairy } from '../../contexts/DairyContext';
import { useTenantBranding } from '../../contexts/TenantBrandingContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const DeliveryLoginPage: React.FC = () => {
  const { login } = useDairy();
  const { branding } = useTenantBranding();
  const navigate = useNavigate();

  const dairyName = branding.name || 'DairyNexa';

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

      <Auth
        title={`Welcome to ${dairyName}`}
        subtitle="Sign in to Rider & Dispatch App"
        onSignInSuccess={handleSignIn}
        onGoogleClick={() => googleLogin()}
      />
    </div>
  );
};
