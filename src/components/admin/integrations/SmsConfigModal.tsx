import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { SmsConfig, SmsProviderType } from '../../../models/integrations';
import {
  Smartphone,
  Lock,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Building,
  Hash,
} from 'lucide-react';

interface SmsConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SmsConfig;
  onSave: (updates: Partial<SmsConfig>) => { success: boolean; errors?: string[] };
}

export const SmsConfigModal: React.FC<SmsConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [form, setForm] = useState<SmsConfig>({ ...config });
  const [showApiKey, setShowApiKey] = useState(false);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Configure SMS Gateway & Indian DLT" maxWidth="xl">
      <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
        {/* Security Alert & DLT explanation */}
        <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px]">TRAI Mandated Indian DLT Compliance</p>
            <p className="text-[11px] text-amber-800 leading-relaxed">
              Transactional delivery notifications and OTPs require registered 6-character Headers (Sender ID) and pre-approved 19-digit Template IDs registered with Vilpower / Jio / Airtel DLT portals.
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

        {/* Provider selection & Auth Key */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">SMS Provider</label>
            <select
              value={form.provider}
              onChange={e => setForm({ ...form, provider: e.target.value as SmsProviderType })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="msg91">MSG91 Enterprise (DLT Integrated)</option>
              <option value="fast2sms">Fast2SMS Indian Gateway</option>
              <option value="twilio_sms">Twilio Programmable SMS</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Gateway API Key / Auth Token <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder="••••••••••••••••••••••••"
                value={form.apiKey}
                onChange={e => setForm({ ...form, apiKey: e.target.value })}
                className="w-full px-3 py-2 pr-9 rounded-lg border border-slate-200 font-mono text-xs"
                required
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Sender ID & Principal Entity ID */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              DLT Sender ID (Header) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Hash className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="HRSHDY"
                maxLength={6}
                value={form.senderId}
                onChange={e => setForm({ ...form, senderId: e.target.value.toUpperCase().trim() })}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-mono font-bold uppercase tracking-wider"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">Exactly 6 alphabets approved on DLT</p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              DLT Principal Entity ID (PE ID) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="1101567890123456789"
                value={form.principalEntityId}
                onChange={e => setForm({ ...form, principalEntityId: e.target.value.trim() })}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-mono"
                required
              />
            </div>
            <p className="text-[10px] text-slate-500 mt-1">16 to 20-digit enterprise ID</p>
          </div>
        </div>

        {/* DLT Registered Content Template IDs */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Smartphone className="w-3.5 h-3.5 text-emerald-700" />
            <span>TRAI Approved DLT Content Template IDs</span>
          </h4>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Daily Delivery Template ID</label>
              <input
                type="text"
                placeholder="1107161234567890123"
                value={form.dltTemplateDelivery}
                onChange={e => setForm({ ...form, dltTemplateDelivery: e.target.value.trim() })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Monthly Invoice Template ID</label>
              <input
                type="text"
                placeholder="1107161234567890124"
                value={form.dltTemplateInvoice}
                onChange={e => setForm({ ...form, dltTemplateInvoice: e.target.value.trim() })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Payment Confirmation Template ID</label>
              <input
                type="text"
                placeholder="1107161234567890125"
                value={form.dltTemplatePayment}
                onChange={e => setForm({ ...form, dltTemplatePayment: e.target.value.trim() })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Login OTP Template ID</label>
              <input
                type="text"
                placeholder="1107161234567890126"
                value={form.dltTemplateOtp}
                onChange={e => setForm({ ...form, dltTemplateOtp: e.target.value.trim() })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
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
      </form>
    </Modal>
  );
};

