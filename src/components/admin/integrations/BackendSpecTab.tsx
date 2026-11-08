import React, { useState } from 'react';
import {
  ShieldCheck,
  Server,
  Lock,
  Code,
  FileText,
  Copy,
  Check,
  ExternalLink,
  Terminal,
} from 'lucide-react';

export const BackendSpecTab: React.FC = () => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 3000);
  };

  const envFileContent = `# ==============================================================================
# MilkerP — Production Gateway Backend Environment Configuration (.env)
# ==============================================================================

# Server & Security
PORT=5000
NODE_ENV=production
APP_SECRET=milkerp_jwt_secret_min_32_characters_long
ALLOWED_ORIGIN=https://app.dairynexa.in

# ------------------------------------------------------------------------------
# 1. Razorpay Payment Gateway
# ------------------------------------------------------------------------------
RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxxxxxxxxxx
RAZORPAY_KEY_SECRET=yyyyyyyyyyyyyyyyyyyyyyyy
RAZORPAY_WEBHOOK_SECRET=zzzzzzzzzzzzzzzzzzzzzzzz
RAZORPAY_AUTO_CAPTURE=true

# ------------------------------------------------------------------------------
# 2. WhatsApp Business Cloud API (Meta Official)
# ------------------------------------------------------------------------------
WHATSAPP_PHONE_NUMBER_ID=104829104820194
WHATSAPP_WABA_ID=192837465019283
WHATSAPP_ACCESS_TOKEN=EAABwzLIX4TwBAxxxxxxxxxxxxxxxxxxxxxxxxxxxx
WHATSAPP_WEBHOOK_VERIFY_TOKEN=dairy_secure_webhook_token_2026

# ------------------------------------------------------------------------------
# 3. Email Delivery (SMTP / SendGrid / Resend)
# ------------------------------------------------------------------------------
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SMTP_FROM_EMAIL=billing@dairynexa.in
SMTP_FROM_NAME="DairyNexa Accounts"

# ------------------------------------------------------------------------------
# 4. SMS Gateway (Indian TRAI DLT Compliant)
# ------------------------------------------------------------------------------
SMS_PROVIDER=msg91
SMS_AUTH_KEY=xxxxxxxxxxxxxxxxxxxxxxxx
SMS_DLT_SENDER_ID=HRSHDY
SMS_DLT_PE_ID=1101567890123456789
DLT_TE_ID_DELIVERY=1107161234567890123
DLT_TE_ID_INVOICE=1107161234567890124
DLT_TE_ID_PAYMENT=1107161234567890125
DLT_TE_ID_OTP=1107161234567890126
`;

  return (
    <div className="space-y-6">
      {/* Overview Alert */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-800">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Backend Architecture & Zero-Trust Security Specification
            </h3>
            <p className="text-xs text-slate-500">
              Contract requirements for activating real production gateways with HTTPS cryptographic security
            </p>
          </div>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The frontend interface communicates via the service layer with your protected Node.js, Go, or Python backend. <strong>Live secrets (Razorpay Key Secret, WhatsApp System User Tokens, SMTP Passwords, SMS API Keys) must never be bundled into frontend JS artifacts or browser localStorage.</strong>
        </p>
      </div>

      {/* Backend API Endpoints Contract */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 bg-[#F8FAF9] flex items-center justify-between">
          <h4 className="font-bold text-slate-800 text-xs flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-700" />
            <span>Required Backend REST Endpoints Contract</span>
          </h4>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
            Base: /api/v1
          </span>
        </div>

        <div className="divide-y divide-slate-100 text-xs">
          {/* Endpoint 1 */}
          <div className="p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                POST
              </span>
              <span className="font-bold text-slate-900">/api/v1/integrations/:provider/test</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Admin-triggered connection test. The backend verifies credentials with the upstream provider and returns live status, latency, and verified account identifiers.
            </p>
          </div>

          {/* Endpoint 2 */}
          <div className="p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                POST
              </span>
              <span className="font-bold text-slate-900">/api/v1/payments/razorpay/create-order</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Creates a server-side Razorpay Order with strict amount (in paise), currency (INR), and receipt metadata. Returns order ID for checkout.
            </p>
          </div>

          {/* Endpoint 3 */}
          <div className="p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                POST
              </span>
              <span className="font-bold text-slate-900">/api/v1/payments/razorpay/verify-signature</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Verifies HMAC SHA-256 signature <code className="text-emerald-700 bg-slate-100 px-1 py-0.5 rounded font-mono">crypto.createHmac('sha256', secret).update(order_id + '|' + payment_id).digest('hex')</code>. Only credits customer balance upon verification.
            </p>
          </div>

          {/* Endpoint 4 */}
          <div className="p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                POST
              </span>
              <span className="font-bold text-slate-900">/api/v1/payments/razorpay/webhook</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Receives asynchronous Razorpay webhooks (<code className="text-purple-700 font-mono">payment.captured</code>, <code className="text-purple-700 font-mono">order.paid</code>). Verifies <code className="text-slate-700 font-mono">x-razorpay-signature</code> header.
            </p>
          </div>

          {/* Endpoint 5 */}
          <div className="p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                POST
              </span>
              <span className="font-bold text-slate-900">/api/v1/notifications/whatsapp/send</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Dispatches Meta Cloud API template messages to customer mobile numbers. Records provider message ID and delivery status.
            </p>
          </div>

          {/* Endpoint 6 */}
          <div className="p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                POST
              </span>
              <span className="font-bold text-slate-900">/api/v1/notifications/email/send</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Generates PDF billing attachments and sends transactional emails via configured SMTP or SendGrid/Resend API.
            </p>
          </div>

          {/* Endpoint 7 */}
          <div className="p-4 space-y-1.5 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                POST
              </span>
              <span className="font-bold text-slate-900">/api/v1/notifications/sms/send</span>
            </div>
            <p className="text-slate-600 text-[11px]">
              Dispatches DLT-compliant SMS notifications with verified Principal Entity ID and 6-character Header (Sender ID).
            </p>
          </div>
        </div>
      </div>

      {/* Production .env Specification */}
      <div className="bg-slate-950 rounded-2xl p-5 text-white shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="font-bold text-xs">Production Server Environment Variables (.env.example)</h4>
          </div>

          <button
            onClick={() => copyToClipboard(envFileContent, 'env')}
            className="flex items-center gap-1.5 px-3 py-1 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors"
          >
            {copiedSection === 'env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedSection === 'env' ? 'Copied!' : 'Copy .env Spec'}</span>
          </button>
        </div>

        <pre className="font-mono text-[11px] text-emerald-300/90 overflow-x-auto p-2 bg-black/40 rounded-xl leading-relaxed">
          {envFileContent}
        </pre>
      </div>
    </div>
  );
};

