import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';
import { Auth } from '@/components/ui/auth-form-1';

export const AdminLoginPage: React.FC = () => {
  const { login } = useDairy();
  const navigate = useNavigate();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSignIn = async (email: string, passwordPlain: string) => {
    const res = await authApi.login(email.trim(), passwordPlain);
    login('admin', res.user.email, res.user.name, res.user.id);
    navigate('/admin/dashboard');
  };

  const handleGoogleSuccess = (_role: any, email: string, name: string, id?: string) => {
    login('admin', email, name, id);
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
        defaultEmail="admin@dailydairy.demo"
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
