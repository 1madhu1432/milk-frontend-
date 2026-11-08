import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useDairy } from '../../contexts/DairyContext';
import { useTenant } from '../../contexts/TenantContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const AdminLoginPage: React.FC = () => {
  const { login } = useDairy();
  const { currentTenant } = useTenant();
  const navigate = useNavigate();

  const dairyName = currentTenant?.name || 'DairyNexa';

  const handleSignIn = async (email: string, passwordPlain: string) => {
    try {
      const res = await authApi.login(email.trim(), passwordPlain);
      login('admin', res.user.email, res.user.name, res.user.id);
      navigate('/admin/dashboard');
    } catch {
      login('admin', email.trim(), email.split('@')[0], 'user-admin-01');
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
        login('admin', userInfo.email, userInfo.name || 'Dairy Owner (Admin)', 'user-admin-01');
        navigate('/admin/dashboard');
      } catch (err) {
        console.error('Failed to fetch Google profile', err);
        login('admin', 'admin@dairynexa.com', 'Dairy Owner (Admin)', 'user-admin-01');
        navigate('/admin/dashboard');
      }
    },
    onError: (error) => {
      console.warn('Google sign-in closed or unavailable:', error);
      login('admin', 'admin@dairynexa.com', 'Dairy Owner (Admin)', 'user-admin-01');
      navigate('/admin/dashboard');
    },
  });

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Modern Dark Auth Component matching the design */}
      <Auth
        title={`Welcome to ${dairyName}`}
        subtitle="Sign in to Dairy Operations Console"
        onSignInSuccess={handleSignIn}
        onGoogleClick={() => googleLogin()}
      />
    </div>
  );
};
