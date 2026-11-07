import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { Auth } from '@/components/ui/auth-form-1';

export const DeliveryLoginPage: React.FC = () => {
  const { login } = useDairy();
  const navigate = useNavigate();

  const handleSignIn = async (email: string, passwordPlain: string) => {
    const res = await authApi.login(email.trim(), passwordPlain);
    login('employee', res.user.email, res.user.name, res.user.id);
    navigate('/employee/deliveries');
  };

  const handleGoogleClick = () => {
    login('employee', 'delivery@dailydairy.demo', 'Suresh Kumar Goud', 'user-deliv-01');
    navigate('/employee/deliveries');
  };

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <Auth
        title="Welcome back"
        subtitle="Sign in to your account"
        onSignInSuccess={handleSignIn}
        onGoogleClick={handleGoogleClick}
      />
    </div>
  );
};
