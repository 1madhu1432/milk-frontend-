import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { RazorpayConfig } from '../../../models/integrations';
import {
  ShieldCheck,
  Key,
  Lock,
  ExternalLink,
  AlertCircle,
  Eye,
  EyeOff,
  CheckCircle2,
} from 'lucide-react';

interface RazorpayConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RazorpayConfig;
  onSave: (updates: Partial<RazorpayConfig>) => { success: boolean; errors?: string[] };
}

export const RazorpayConfigModal: React.FC<RazorpayConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [form, setForm] = useState<RazorpayConfig>({ ...config });
  const [showKeySecret, setShowKeySecret] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const result = onSave(form);
    if (result.success) {
      setErrors([]);
      onClose();
    } else if (result.errors) {
      setErrors(result.errors);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Razorpay Gateway" maxWidth="xl">
      <form onSubmit={handleSave} className="p-6 space-y-5 text-xs">
        {/* Security Banner */}
        <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px]">Server-Side Cryptographic Vault</p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              API Secrets are never exposed to customer browsers or delivery staff. Signatures and webhook verification are executed exclusively by the secure backend.
            </p>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5 text-xs">
              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
              <span>Please resolve the following:</span>
            </div>
            <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
              {errors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Environment / Mode */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Environment Mode</label>
            <select
              value={form.mode}
              onChange={e =>
                setForm({
                  ...form,
                  mode: e.target.value as 'test' | 'live',
                  keyId:
                    e.target.value === 'test' && form.keyId.startsWith('rzp_live_')
                      ? form.keyId.replace('rzp_live_', 'rzp_test_')
                      : e.target.value === 'live' && form.keyId.startsWith('rzp_test_')
                        ? form.keyId.replace('rzp_test_', 'rzp_live_')
                        : form.keyId,
                })
              }
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="test">Test Mode (Sandbox / Testing)</option>
              <option value="live">Live Production (Real Money)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Currency</label>
            <input
              type="text"
              value="INR (Indian Rupee ₹)"
              disabled
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 font-medium"
            />
          </div>
        </div>

        {/* Key ID */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Razorpay Key ID <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Key className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={form.mode === 'test' ? 'rzp_test_1234567890ABCD' : 'rzp_live_1234567890ABCD'}
              value={form.keyId}
              onChange={e => setForm({ ...form, keyId: e.target.value })}
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-mono text-xs"
              required
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Obtained from Razorpay Dashboard → Settings → API Keys
          </p>
        </div>

        {/* Key Secret */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Razorpay Key Secret <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showKeySecret ? 'text' : 'password'}
              placeholder="••••••••••••••••••••••••"
              value={form.keySecret}
              onChange={e => setForm({ ...form, keySecret: e.target.value })}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 font-mono text-xs"
              required
            />
            <button
              type="button"
              onClick={() => setShowKeySecret(!showKeySecret)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showKeySecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Webhook Secret */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Webhook Secret (for payment.captured & order.paid verification) <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showWebhookSecret ? 'text' : 'password'}
              placeholder="••••••••••••••••••••••••"
              value={form.webhookSecret}
              onChange={e => setForm({ ...form, webhookSecret: e.target.value })}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 font-mono text-xs"
              required
            />
            <button
              type="button"
              onClick={() => setShowWebhookSecret(!showWebhookSecret)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1 font-mono">
            Endpoint URL: <span className="text-emerald-700">https://your-domain.com/api/v1/payments/razorpay/webhook</span>
          </p>
        </div>

        {/* Business display details */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Merchant Name (Checkout Header)</label>
            <input
              type="text"
              value={form.merchantName}
              onChange={e => setForm({ ...form, merchantName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Brand Theme Color</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.themeColor || '#16803D'}
                onChange={e => setForm({ ...form, themeColor: e.target.value })}
                className="w-8 h-8 rounded border border-slate-200 p-0.5 cursor-pointer"
              />
              <input
                type="text"
                value={form.themeColor || '#16803D'}
                onChange={e => setForm({ ...form, themeColor: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <a
            href="https://dashboard.razorpay.com/#/app/keys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
          >
            <span>Open Razorpay Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white font-bold rounded-lg shadow-xs"
            >
              Save Credentials
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};

