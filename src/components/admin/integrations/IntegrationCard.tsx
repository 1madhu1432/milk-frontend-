import React, { useState } from 'react';
import {
  IntegrationStatus,
  ConnectionTestResult,
} from '../../../models/integrations';
import { maskSecret } from '../../../services/integrations/configStorage';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Shield,
  RefreshCw,
  Settings,
  Unlink,
  ExternalLink,
  Eye,
  EyeOff,
  Check,
} from 'lucide-react';

interface IntegrationCardProps {
  id: 'razorpay' | 'whatsapp' | 'email' | 'sms';
  title: string;
  providerLabel: string;
  description: string;
  status: IntegrationStatus;
  enabled: boolean;
  icon: React.ReactNode;
  iconBg: string;
  badgeText?: string;
  maskedFields: Array<{ label: string; value: string }>;
  lastTestedAt?: string;
  lastTestResult?: ConnectionTestResult;
  isTesting: boolean;
  onConfigure: () => void;
  onTestConnection: () => void;
  onToggleEnabled: (enabled: boolean) => void;
  onDisconnect: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  id,
  title,
  providerLabel,
  description,
  status,
  enabled,
  icon,
  iconBg,
  badgeText,
  maskedFields,
  lastTestedAt,
  lastTestResult,
  isTesting,
  onConfigure,
  onTestConnection,
  onToggleEnabled,
  onDisconnect,
}) => {
  const [showSecrets, setShowSecrets] = useState(false);

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Connected
          </span>
        );
      case 'configured':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            Configured
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3.5 h-3.5 text-rose-600" />
            Error
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <AlertTriangle className="w-3.5 h-3.5 text-slate-500" />
            Disabled
          </span>
        );
      case 'not_configured':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
            Not Configured
          </span>
        );
    }
  };

  return (
    <div className={`bg-white rounded-2xl border transition-all duration-200 shadow-xs flex flex-col justify-between ${
      status === 'connected'
        ? 'border-emerald-200 ring-1 ring-emerald-50'
        : status === 'error'
        ? 'border-rose-200'
        : 'border-slate-200 hover:border-slate-300'
    }`}>
      <div className="p-5 space-y-4">
        {/* Card Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
              {icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm leading-tight">{title}</h3>
                {badgeText && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    {badgeText}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{providerLabel}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {getStatusBadge()}
            {status !== 'not_configured' && (
              <label className="relative inline-flex items-center cursor-pointer ml-1">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={e => onToggleEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16803D]"></div>
              </label>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-600 leading-relaxed">{description}</p>

        {/* Credential previews (Masked) */}
        {status !== 'not_configured' && (
          <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-slate-500 border-b border-slate-200/60 pb-1">
              <span className="font-medium flex items-center gap-1">
                <Shield className="w-3 h-3 text-slate-400" />
                Protected Credentials
              </span>
              <button
                type="button"
                onClick={() => setShowSecrets(!showSecrets)}
                className="text-emerald-700 hover:text-emerald-800 font-semibold flex items-center gap-1"
              >
                {showSecrets ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                <span>{showSecrets ? 'Mask' : 'Reveal'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              {maskedFields.map((field, idx) => (
                <div key={idx} className="flex flex-col">
                  <span className="text-slate-400 font-medium">{field.label}:</span>
                  <span className="font-mono text-slate-700 truncate">
                    {showSecrets ? field.value : maskSecret(field.value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Test Result Message & Latency */}
        {lastTestResult && (
          <div
            className={`p-3 rounded-xl text-xs space-y-1 border ${
              lastTestResult.success
                ? lastTestResult.isSimulated
                  ? 'bg-amber-50/70 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center justify-between font-semibold text-[11px]">
              <span className="flex items-center gap-1.5">
                {lastTestResult.success ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                )}
                {lastTestResult.success
                  ? lastTestResult.isSimulated
                    ? 'Development Test Passed'
                    : 'Real Provider Verified'
                  : 'Test Verification Failed'}
              </span>
              {lastTestResult.latencyMs !== undefined && (
                <span className="text-[10px] font-mono opacity-80">{lastTestResult.latencyMs}ms</span>
              )}
            </div>

            <p className="text-[11px] leading-tight opacity-90">{lastTestResult.message}</p>

            {lastTestedAt && (
              <p className="text-[10px] opacity-70 pt-0.5">
                Last checked: {new Date(lastTestedAt).toLocaleDateString()} {new Date(lastTestedAt).toLocaleTimeString()}
              </p>
            )}
          </div>
        )}

        {/* Development mode hint banner if simulated */}
        {status === 'configured' && lastTestResult?.isSimulated && (
          <div className="p-2.5 bg-amber-50/60 rounded-lg border border-amber-200/80 text-[11px] text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              <strong>Demo/Dev Mode:</strong> Format validated locally. Backend API proxy is currently offline. Real payments/messages will not be dispatched until connected to live server.
            </p>
          </div>
        )}
      </div>

      {/* Card Actions Footer */}
      <div className="p-4 bg-slate-50 border-t border-slate-100 rounded-b-2xl flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={onConfigure}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 shadow-2xs transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-slate-500" />
            <span>{status === 'not_configured' ? 'Configure Provider' : 'Edit Credentials'}</span>
          </button>

          {status !== 'not_configured' && (
            <button
              onClick={onDisconnect}
              className="flex items-center gap-1 px-2.5 py-1.5 text-slate-500 hover:text-rose-600 text-xs font-medium rounded-lg hover:bg-rose-50 transition-colors"
              title="Clear credentials and disconnect"
            >
              <Unlink className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          )}
        </div>

        {status !== 'not_configured' && (
          <button
            onClick={onTestConnection}
            disabled={isTesting}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
          </button>
        )}
      </div>
    </div>
  );
};

