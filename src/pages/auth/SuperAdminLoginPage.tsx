import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const SuperAdminLoginPage: React.FC = () => {
  const { login } = useDairy();
  const navigate = useNavigate();

  const handleSignIn = async (email: string, passwordPlain: string) => {
    const res = await authApi.login(email.trim(), passwordPlain);
    login('super_admin', res.user.email, res.user.name, res.user.id);
    navigate('/super-admin');
  };

  const handleGoogleClick = () => {
    login('super_admin', 'platform.owner@milkerp.com', 'MilkerP Platform Owner', 'user-super-01');
    navigate('/super-admin');
  };

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Auth
        title="Welcome back"
        subtitle="Sign in to your account"
        onSignInSuccess={handleSignIn}
        onGoogleClick={handleGoogleClick}
      />
    </div>
  );
};
