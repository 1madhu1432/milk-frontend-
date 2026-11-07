import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { authApi } from '../../services/api/authApi';
import { GoogleAuthModal } from '../../components/auth/GoogleAuthModal';
import { Auth } from '@/components/ui/auth-form-1';
import { Sparkles, ArrowRight } from 'lucide-react';

export const CustomerLoginPage: React.FC = () => {
  const { login } = useDairy();
  const navigate = useNavigate();
  const [isGoogleModalOpen, setIsGoogleModalOpen] = useState(false);

  const handleSignIn = async (email: string, passwordPlain: string) => {
    const res = await authApi.login(email.trim(), passwordPlain);
    login('customer', res.user.email, res.user.name, res.user.id);
    navigate('/customer/home');
  };

  const handleGoogleSuccess = (_role: any, email: string, name: string, id?: string) => {
    login('customer', email, name, id);
    navigate('/customer/home');
  };

  return (
    <div className="min-h-screen bg-[#090A0C] flex flex-col justify-center items-center px-4 py-8 relative font-sans text-white">
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <Auth
        title="Welcome back"
        subtitle="Sign in to your milk subscriber account"
        defaultEmail="customer@dailydairy.demo"
        defaultPassword="customer123"
        onSignInSuccess={handleSignIn}
        onGoogleClick={() => setIsGoogleModalOpen(true)}
      />

      <div className="mt-4 flex items-center gap-3 relative z-10 text-xs">
        <button
          type="button"
          onClick={() => {
            login('customer', 'customer@dailydairy.demo', 'Rajesh Reddy', 'user-cust-01');
            navigate('/customer/home');
          }}
          className="text-slate-400 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer bg-slate-900/60 hover:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-800"
        >
          <Sparkles className="w-3.5 h-3.5 text-blue-400" />
          <span>Quick 1-Click Demo Customer Access</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      <GoogleAuthModal
        isOpen={isGoogleModalOpen}
        onClose={() => setIsGoogleModalOpen(false)}
        targetRole="customer"
        onSuccess={handleGoogleSuccess}
      />
    </div>
  );
};
