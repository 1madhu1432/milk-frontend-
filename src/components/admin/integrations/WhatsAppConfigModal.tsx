import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { WhatsAppConfig, WhatsAppProviderType } from '../../../models/integrations';
import {
  MessageSquare,
  Key,
  Lock,
  Phone,
  ShieldCheck,
  ExternalLink,
  AlertCircle,
  Eye,
  EyeOff,
  Layers,
} from 'lucide-react';

interface WhatsAppConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WhatsAppConfig;
  onSave: (updates: Partial<WhatsAppConfig>) => { success: boolean; errors?: string[] };
}

export const WhatsAppConfigModal: React.FC<WhatsAppConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [form, setForm] = useState<WhatsAppConfig>({ ...config });
  const [showToken, setShowToken] = useState(false);
  const [showVerifyToken, setShowVerifyToken] = useState(false);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Configure WhatsApp Business API" maxWidth="xl">
      <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
        {/* Security Alert */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px]">Official Meta Cloud API & Webhooks</p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Permanent System User tokens with `whatsapp_business_messaging` and `whatsapp_business_management` permissions are securely stored on backend servers.
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

        {/* Provider Architecture */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">WhatsApp Provider</label>
            <select
              value={form.provider}
              onChange={e => setForm({ ...form, provider: e.target.value as WhatsAppProviderType })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="meta_cloud_api">Meta WhatsApp Cloud API (Direct Official)</option>
              <option value="twilio">Twilio WhatsApp Business</option>
              <option value="gupshup">Gupshup Enterprise Messaging</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Sender Mobile Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="+91 98765 43210"
                value={form.fromPhoneNumber}
                onChange={e => setForm({ ...form, fromPhoneNumber: e.target.value })}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200"
                required
              />
            </div>
          </div>
        </div>

        {/* Phone Number ID & WABA ID */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Phone Number ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 104829104820194"
              value={form.phoneNumberId}
              onChange={e => setForm({ ...form, phoneNumberId: e.target.value.trim() })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              WhatsApp Business Account ID (WABA ID) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. 192837465019283"
              value={form.wabaId}
              onChange={e => setForm({ ...form, wabaId: e.target.value.trim() })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
              required
            />
          </div>
        </div>

        {/* Permanent System User Access Token */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Permanent System User Access Token <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showToken ? 'text' : 'password'}
              placeholder="EAABwzLIX4TwBA..."
              value={form.accessToken}
              onChange={e => setForm({ ...form, accessToken: e.target.value })}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 font-mono text-xs"
              required
            />
            <button
              type="button"
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            Meta Business Manager → System Users → Generate Token with `whatsapp_business_messaging` scope
          </p>
        </div>

        {/* Webhook Token */}
        <div>
          <label className="block font-semibold text-slate-700 mb-1">Webhook Verify Token</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type={showVerifyToken ? 'text' : 'password'}
              placeholder="dairy_webhook_secret_token_123"
              value={form.webhookVerifyToken}
              onChange={e => setForm({ ...form, webhookVerifyToken: e.target.value })}
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 font-mono text-xs"
            />
            <button
              type="button"
              onClick={() => setShowVerifyToken(!showVerifyToken)}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              {showVerifyToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Meta Approved Templates */}
        <div className="pt-2 border-t border-slate-100 space-y-2">
          <div className="flex items-center gap-1.5 font-bold text-slate-800">
            <Layers className="w-3.5 h-3.5 text-emerald-700" />
            <span>Approved Meta Message Template Names</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Delivery Update Template</label>
              <input
                type="text"
                value={form.templateDeliveryCompleted}
                onChange={e => setForm({ ...form, templateDeliveryCompleted: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Monthly Invoice Template</label>
              <input
                type="text"
                value={form.templateInvoiceGenerated}
                onChange={e => setForm({ ...form, templateInvoiceGenerated: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Payment Receipt Template</label>
              <input
                type="text"
                value={form.templatePaymentReminder}
                onChange={e => setForm({ ...form, templatePaymentReminder: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-600 mb-0.5">Order Dispatch Template</label>
              <input
                type="text"
                value={form.templateOrderDispatched}
                onChange={e => setForm({ ...form, templateOrderDispatched: e.target.value })}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-200 font-mono text-[11px]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100">
          <a
            href="https://business.facebook.com/wa/manage/phone-numbers/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-700 hover:underline flex items-center gap-1 font-semibold text-[11px]"
          >
            <span>Meta Business Suite</span>
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

