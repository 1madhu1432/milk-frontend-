import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useDairy } from '../../contexts/DairyContext';
import { useTenantBranding } from '../../contexts/TenantBrandingContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const CustomerLoginPage: React.FC = () => {
  const { login } = useDairy();
  const { branding } = useTenantBranding();
  const navigate = useNavigate();

  const dairyName = branding.name || 'DairyNexa';

  const handleSignIn = async (email: string, passwordPlain: string) => {
    const res = await authApi.login(email.trim(), passwordPlain);
    login('customer', res.user.email, res.user.name, res.user.id);
    navigate('/customer/home');
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const userInfo = await userInfoRes.json();
        if (userInfo.email) {
          login('customer', userInfo.email, userInfo.name || 'Valued Subscriber', 'user-cust-01');
          navigate('/customer/home');
        }
      } catch (err) {
        console.error('Failed to fetch Google profile', err);
      }
    },
    onError: (error) => {
      console.warn('Google sign-in closed or unavailable:', error);
    },
  });

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Auth
        title={`Welcome to ${dairyName}`}
        subtitle="Sign in to Customer Doorstep Portal"
        onSignInSuccess={handleSignIn}
        onGoogleClick={() => googleLogin()}
      />
    </div>
  );
};
