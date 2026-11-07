import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';
import { Auth } from '@/components/ui/auth-form-1';

export const SuperAdminLoginPage: React.FC = () => {
  const { login } = useDairy();
  const navigate = useNavigate();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSignIn = async (email: string, passwordPlain: string) => {
    const res = await authApi.login(email.trim(), passwordPlain);
    login('super_admin', res.user.email, res.user.name, res.user.id);
    navigate('/super-admin');
  };

  const handleGoogleSuccess = (_role: any, email: string, name: string, id?: string) => {
    login('super_admin', email, name, id);
    navigate('/super-admin');
  };

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Auth
        title="Welcome back"
        subtitle="Sign in to Platform Super Admin"
        defaultEmail="platform.owner@milkerp.com"
        defaultPassword="admin123"
        onSignInSuccess={handleSignIn}
        onGoogleClick={() => setIsGoogleModalOpen(true)}
      />

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        targetRole="admin"
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
};
