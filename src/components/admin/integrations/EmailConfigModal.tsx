import React, { useState } from 'react';
import { Modal } from '../../common/Modal';
import { EmailConfig, EmailProviderType } from '../../../models/integrations';
import {
  Mail,
  Server,
  Lock,
  ShieldCheck,
  AlertCircle,
  Eye,
  EyeOff,
  User,
} from 'lucide-react';

interface EmailConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: EmailConfig;
  onSave: (updates: Partial<EmailConfig>) => { success: boolean; errors?: string[] };
}

export const EmailConfigModal: React.FC<EmailConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [form, setForm] = useState<EmailConfig>({ ...config });
  const [showPassword, setShowPassword] = useState(false);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Configure Transactional Email Delivery" maxWidth="xl">
      <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
        {/* Security Alert */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <p className="font-bold text-[11px]">TLS / SSL Encrypted Email Relay</p>
            <p className="text-[11px] text-emerald-800 leading-relaxed">
              Invoices with PDF bill attachments and payment receipts are sent via authenticated SMTP or high-deliverability transactional APIs.
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

        {/* Provider selector */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Provider Type</label>
            <select
              value={form.provider}
              onChange={e => setForm({ ...form, provider: e.target.value as EmailProviderType })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white font-medium"
            >
              <option value="smtp">Custom SMTP Server (Postfix / Exchange / Gmail)</option>
              <option value="sendgrid">Twilio SendGrid API</option>
              <option value="resend">Resend Transactional API</option>
              <option value="postmark">Postmark</option>
              <option value="ses">Amazon SES</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Sender Display Name</label>
            <input
              type="text"
              placeholder="DairyNexa"
              value={form.fromName}
              onChange={e => setForm({ ...form, fromName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
              required
            />
          </div>
        </div>

        {/* Sender Email & Reply-To */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              From Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              placeholder="billing@dairynexa.in"
              value={form.fromEmail}
              onChange={e => setForm({ ...form, fromEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Reply-To Address</label>
            <input
              type="email"
              placeholder="support@dairynexa.in"
              value={form.replyToEmail}
              onChange={e => setForm({ ...form, replyToEmail: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>
        </div>

        {/* Conditional Provider Settings */}
        {form.provider === 'smtp' ? (
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-emerald-700" />
              <span>SMTP Connection Parameters</span>
            </h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  SMTP Host Server <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="smtp.sendgrid.net or smtp.gmail.com"
                  value={form.smtpHost}
                  onChange={e => setForm({ ...form, smtpHost: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Port (587/465)</label>
                <input
                  type="number"
                  placeholder="587"
                  value={form.smtpPort}
                  onChange={e => setForm({ ...form, smtpPort: parseInt(e.target.value) || 587 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SMTP Username <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="apikey or username"
                    value={form.smtpUser}
                    onChange={e => setForm({ ...form, smtpUser: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SMTP Password / API Key <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••••••••"
                    value={form.smtpPassword}
                    onChange={e => setForm({ ...form, smtpPassword: e.target.value })}
                    className="w-full pl-9 pr-9 py-2 rounded-lg border border-slate-200 font-mono"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.smtpSecure}
                onChange={e => setForm({ ...form, smtpSecure: e.target.checked })}
                className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 font-medium">Require TLS / SSL secure handshake (Recommended)</span>
            </label>
          </div>
        ) : (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-emerald-700" />
              <span>{form.provider.toUpperCase()} API Key</span>
            </h4>
            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                placeholder={`Enter your ${form.provider} API Secret Key`}
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
        )}

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

