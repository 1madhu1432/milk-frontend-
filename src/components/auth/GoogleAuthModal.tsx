import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useDairy } from '../../contexts/DairyContext';
import { UserRole } from '../../models/types';
import { authApi } from '../../services/api/authApi';
import { Loader2, ArrowRight, ShieldCheck, X, AlertCircle } from 'lucide-react';

export const GoogleLogoSvg = ({ className = 'w-5 h-5' }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

function mapBackendRole(roleStr: string): UserRole {
  switch (roleStr?.toUpperCase()) {
    case 'SUPER_ADMIN':
      return 'super_admin';
    case 'ADMIN':
      return 'admin';
    case 'DELIVERY_BOY':
      return 'employee';
    case 'CUSTOMER':
    default:
      return 'customer';
  }
}

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole: UserRole | 'auto';
  onSuccess: (role: UserRole, email: string, name: string, id?: string) => void;
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({
  isOpen,
  onClose,
  targetRole,
  onSuccess,
}) => {
  const { settings } = useDairy();
  const navigate = useNavigate();

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [googleIdToken, setGoogleIdToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const processGoogleToken = async (idToken: string) => {
    if (!idToken.trim()) {
      setError('Please provide a valid Google ID token.');
      return;
    }

    setError(null);
    setIsAuthenticating(true);

    try {
      const res = await authApi.loginWithGoogle(idToken.trim());
      setIsAuthenticating(false);
      const mappedRole = mapBackendRole(res.user.role);
      onSuccess(mappedRole, res.user.email, res.user.name, res.user.id);
      onClose();
    } catch (err: any) {
      setIsAuthenticating(false);
      setError(err.message || 'Google token verification failed with server.');
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    processGoogleToken(googleIdToken);
  };

  const getPortalLink = () => {
    if (targetRole === 'admin') return { label: 'Admin Login', path: '/login/admin' };
    if (targetRole === 'employee') return { label: 'Rider Login', path: '/login/delivery' };
    if (targetRole === 'customer') return { label: 'Customer Login', path: '/login/customer' };
    return { label: 'All Portals Login', path: '/login' };
  };

  const portal = getPortalLink();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fade-in font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden relative animate-scale-in">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors z-10"
          title="Cancel"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-slate-100 text-center">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-center shadow-xs mb-3">
            <GoogleLogoSvg className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Google OAuth / OIDC Single Sign-On
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Genuine backend token verification for{' '}
            <strong className="text-slate-800 font-semibold">
              {settings?.dairyName || 'Harish Dairy Farm'}
            </strong>
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Authentication Rejected</p>
                <p className="text-[11px] leading-relaxed">{error}</p>
              </div>
            </div>
          )}

          {isAuthenticating ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
              <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              <p className="text-sm font-bold text-slate-800">
                Verifying Google ID Token...
              </p>
              <p className="text-xs text-slate-500">
                Authoritatively contacting Google & authenticating backend session
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Official Google Login Button Component */}
              <div className="flex justify-center py-2">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    if (credentialResponse.credential) {
                      processGoogleToken(credentialResponse.credential);
                    } else {
                      setError('Google did not return an ID token.');
                    }
                  }}
                  onError={() => {
                    setError('Google Sign-In failed or was cancelled.');
                  }}
                  theme="outline"
                  size="large"
                  text="continue_with"
                  shape="rectangular"
                  width="320"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Or Token Entry (Sandbox / CLI)
                </span>
                <div className="flex-1 h-px bg-slate-200" />
              </div>

              {/* Developer / Testing Manual ID Token Option */}
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Google ID Token (JWT)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="eyJhbGciOiJSUzI1NiIsImtpZCI6..."
                    value={googleIdToken}
                    onChange={e => setGoogleIdToken(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-mono rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-slate-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={!googleIdToken.trim()}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <GoogleLogoSvg className="w-3.5 h-3.5" />
                  <span>Verify Pasted Token</span>
                </button>
              </form>
            </div>
          )}

          {/* Alternative Email/Password Login */}
          <div className="pt-3 border-t border-slate-100">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">Prefer Email & Password?</p>
                <p className="text-[11px] text-slate-500">Sign in directly with your dairy account credentials.</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  navigate(portal.path);
                }}
                className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>{portal.label}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Security Compliance Footer */}
          <div className="pt-2 flex items-center justify-between text-[10px] text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Strict OIDC Verification</span>
            </span>
            <span>Zero In-Memory Fallbacks</span>
          </div>
        </div>
      </div>
    </div>
  );
};
