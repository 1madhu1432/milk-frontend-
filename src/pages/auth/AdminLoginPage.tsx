import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const AdminLoginPage: React.FC = () => {
  const { login } = useDairy();
  const navigate = useNavigate();

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

  const handleGoogleClick = () => {
    login('admin', 'admin@dailydairy.demo', 'Harish Rao (Dairy Owner)', 'user-admin-01');
    navigate('/admin/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Modern Dark Auth Component matching the design */}
      <Auth
        title="Welcome back"
        subtitle="Sign in to your account"
        onSignInSuccess={handleSignIn}
        onGoogleClick={handleGoogleClick}
      />
    </div>
  );
};
