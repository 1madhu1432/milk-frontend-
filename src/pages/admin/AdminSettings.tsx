import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { useIntegrations } from '../../contexts/IntegrationsContext';
import { BusinessSettings } from '../../models/types';
import {
  Save,
  RefreshCw,
  Building2,
  Sliders,
  Plug,
  Zap,
  ScrollText,
  ShieldCheck,
  CreditCard,
  MessageSquare,
  Mail,
  Smartphone,
  Lock,
  AlertTriangle,
  Server,
  Database,
  Sparkles,
  CheckCircle2,
  Download,
  Upload,
  Trash2,
} from 'lucide-react';
import { IntegrationCard } from '../../components/admin/integrations/IntegrationCard';
import { RazorpayConfigModal } from '../../components/admin/integrations/RazorpayConfigModal';
import { WhatsAppConfigModal } from '../../components/admin/integrations/WhatsAppConfigModal';
import { EmailConfigModal } from '../../components/admin/integrations/EmailConfigModal';
import { SmsConfigModal } from '../../components/admin/integrations/SmsConfigModal';
import { AutomationRulesTab } from '../../components/admin/integrations/AutomationRulesTab';
import { UnifiedLogsTab } from '../../components/admin/integrations/UnifiedLogsTab';
import { BackendSpecTab } from '../../components/admin/integrations/BackendSpecTab';

type SettingsTab = 'business' | 'integrations' | 'automations' | 'logs' | 'spec' | 'data';

export const AdminSettings: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetDemoData,
    isDemoMode,
    clearAllData,
    loadDemoData,
    customers,
    routes,
    deliveries,
    invoices,
    currentUser,
  } = useDairy();
  const {
    integrations,
    updateIntegrationConfig,
    testIntegrationConnection,
    disconnectIntegration,
    toggleIntegrationEnabled,
    isTesting,
  } = useIntegrations();

  const [activeTab, setActiveTab] = useState<SettingsTab>('integrations');
  const [form, setForm] = useState<BusinessSettings>(settings);
  const [activeModal, setActiveModal] = useState<'razorpay' | 'whatsapp' | 'email' | 'sms' | null>(null);

  // Security check: restrict settings to authorized admin roles
  if (currentUser.role !== 'admin') {
    return (
      <div className="max-w-xl mx-auto mt-12 p-6 bg-white rounded-2xl border border-rose-200 shadow-sm text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Access Restricted</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Integration credentials, operational pricing, and business settings are restricted to authorized administrators. Delivery staff and customers cannot view or modify these parameters.
        </p>
      </div>
    );
  }

  const handleSaveBusiness = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    alert('Business operational settings saved successfully!');
  };

  const handleResetData = () => {
    if (
      window.confirm(
        '⚠️ RESET DEMO DATA WARNING: This will reset all customers, routes, inventory, and restores demo factory settings. Proceed?'
      )
    ) {
      resetDemoData();
      alert('All factory demo data restored!');
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Dairy Business & Gateway Integrations
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Admin Console
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure real provider gateways (Razorpay, WhatsApp, Email, SMS), event automation, and business operational rules
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isDemoMode ? (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Switch to Clean Production Mode? This will remove all 150 dummy customers and mock deliveries, leaving a clean slate for real operational dairy data.'
                  )
                ) {
                  clearAllData();
                  alert('Clean Production Mode activated! All dummy records cleared.');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 text-xs font-bold rounded-lg transition-colors border border-amber-300"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Clear Dummy Data</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (
                  window.confirm(
                    'Load Sample Demo Data? This will restore 150 sample households, 5 routes, and test billing for demonstration.'
                  )
                ) {
                  loadDemoData();
                  alert('Sample demo dataset loaded!');
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span>Load Sample Data</span>
            </button>
          )}

          <button
            onClick={handleResetData}
            className="flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors border border-rose-200"
            title="Reset to factory demo state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Factory</span>
          </button>
        </div>
      </div>

      {/* Modern Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 bg-slate-100 rounded-2xl overflow-x-auto border border-slate-200">
        <button
          onClick={() => setActiveTab('integrations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'integrations'
              ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Plug className="w-4 h-4 text-emerald-700" />
          <span>Provider Integrations</span>
          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
        </button>

        <button
          onClick={() => setActiveTab('automations')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'automations'
              ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Zap className="w-4 h-4 text-emerald-700" />
          <span>Notification Automations</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'logs'
              ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <ScrollText className="w-4 h-4 text-emerald-700" />
          <span>Integration Audit Logs</span>
        </button>

        <button
          onClick={() => setActiveTab('business')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'business'
              ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Building2 className="w-4 h-4 text-slate-600" />
          <span>Dairy Profile & Operations</span>
        </button>

        <button
          onClick={() => setActiveTab('spec')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'spec'
              ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <ShieldCheck className="w-4 h-4 text-slate-600" />
          <span>Backend Security & Env Spec</span>
        </button>

        <button
          onClick={() => setActiveTab('data')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${activeTab === 'data'
              ? 'bg-white text-emerald-900 shadow-xs ring-1 ring-slate-200'
              : 'text-slate-600 hover:text-slate-900'
            }`}
        >
          <Database className="w-4 h-4 text-emerald-700" />
          <span>Data Mode & Clean Slate</span>
          {isDemoMode ? (
            <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded">
              Demo Data
            </span>
          ) : (
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
              Clean Slate
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Provider Integrations */}
      {activeTab === 'integrations' && (
        <div className="space-y-6 animate-fade-in">
          {/* Security Notice */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Production Multi-Provider Service Architecture</h4>
                <p className="text-[11px] text-emerald-800">
                  Separated service layers for Razorpay, WhatsApp Cloud API, SMTP Email, and Indian DLT SMS. All sensitive API keys and secrets are masked.
                </p>
              </div>
            </div>

            <div className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-3 py-1.5 rounded-lg border border-emerald-300 shrink-0">
              Zero-Exposure Client Security
            </div>
          </div>

          {/* 4 Gateway Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. Razorpay */}
            <IntegrationCard
              id="razorpay"
              title="Razorpay Payment Gateway"
              providerLabel={`UPI, Cards, NetBanking, Autopay • ${integrations.razorpay.mode.toUpperCase()} Mode`}
              description="Collect online subscription renewals, bill settlements, and wallet top-ups. Signatures verified by server-side HMAC SHA-256."
              status={integrations.razorpay.status}
              enabled={integrations.razorpay.enabled}
              icon={<CreditCard className="w-5 h-5 text-blue-600" />}
              iconBg="bg-blue-100"
              badgeText={integrations.razorpay.mode === 'test' ? 'Test Sandbox' : 'Live Production'}
              maskedFields={[
                { label: 'Key ID', value: integrations.razorpay.keyId || 'Not set' },
                { label: 'Key Secret', value: integrations.razorpay.keySecret || 'Not set' },
                { label: 'Webhook Secret', value: integrations.razorpay.webhookSecret || 'Not set' },
                { label: 'Auto Capture', value: integrations.razorpay.autoCapture ? 'Enabled (Instant)' : 'Disabled' },
              ]}
              lastTestedAt={integrations.razorpay.lastTestedAt}
              lastTestResult={integrations.razorpay.lastTestResult}
              isTesting={isTesting.razorpay}
              onConfigure={() => setActiveModal('razorpay')}
              onTestConnection={() => testIntegrationConnection('razorpay')}
              onToggleEnabled={val => toggleIntegrationEnabled('razorpay', val)}
              onDisconnect={() => disconnectIntegration('razorpay')}
            />

            {/* 2. WhatsApp Business */}
            <IntegrationCard
              id="whatsapp"
              title="WhatsApp Business API"
              providerLabel={`${integrations.whatsapp.provider === 'meta_cloud_api' ? 'Meta Official Cloud API' : integrations.whatsapp.provider.toUpperCase()} • Templates`}
              description="Instant delivery confirmations, monthly bill breakdowns, payment receipts, and delivery cutoff reminders over official WhatsApp."
              status={integrations.whatsapp.status}
              enabled={integrations.whatsapp.enabled}
              icon={<MessageSquare className="w-5 h-5 text-emerald-600" />}
              iconBg="bg-emerald-100"
              badgeText="Official WABA"
              maskedFields={[
                { label: 'Phone Number ID', value: integrations.whatsapp.phoneNumberId || 'Not set' },
                { label: 'WABA ID', value: integrations.whatsapp.wabaId || 'Not set' },
                { label: 'System Access Token', value: integrations.whatsapp.accessToken || 'Not set' },
                { label: 'Sender Display #', value: integrations.whatsapp.fromPhoneNumber || 'Not set' },
              ]}
              lastTestedAt={integrations.whatsapp.lastTestedAt}
              lastTestResult={integrations.whatsapp.lastTestResult}
              isTesting={isTesting.whatsapp}
              onConfigure={() => setActiveModal('whatsapp')}
              onTestConnection={() => testIntegrationConnection('whatsapp')}
              onToggleEnabled={val => toggleIntegrationEnabled('whatsapp', val)}
              onDisconnect={() => disconnectIntegration('whatsapp')}
            />

            {/* 3. Transactional Email */}
            <IntegrationCard
              id="email"
              title="Email Delivery Service"
              providerLabel={`${integrations.email.provider.toUpperCase()} • TLS Encrypted`}
              description="Dispatch monthly billing invoices with attached PDF invoices, payment receipts, and subscription account statement ledgers."
              status={integrations.email.status}
              enabled={integrations.email.enabled}
              icon={<Mail className="w-5 h-5 text-indigo-600" />}
              iconBg="bg-indigo-100"
              badgeText="SMTP / API"
              maskedFields={[
                { label: 'Sender From Email', value: integrations.email.fromEmail || 'Not set' },
                { label: 'SMTP Host', value: integrations.email.smtpHost || 'Not set' },
                { label: 'Port & TLS', value: `${integrations.email.smtpPort} • ${integrations.email.smtpSecure ? 'TLS Active' : 'Plain'}` },
                { label: 'SMTP Password / Key', value: integrations.email.smtpPassword || integrations.email.apiKey || 'Not set' },
              ]}
              lastTestedAt={integrations.email.lastTestedAt}
              lastTestResult={integrations.email.lastTestResult}
              isTesting={isTesting.email}
              onConfigure={() => setActiveModal('email')}
              onTestConnection={() => testIntegrationConnection('email')}
              onToggleEnabled={val => toggleIntegrationEnabled('email', val)}
              onDisconnect={() => disconnectIntegration('email')}
            />

            {/* 4. SMS Gateway (Indian DLT) */}
            <IntegrationCard
              id="sms"
              title="SMS Gateway (Indian DLT)"
              providerLabel={`${integrations.sms.provider.toUpperCase()} • TRAI Compliant`}
              description="Doorstep delivery notifications, customer login OTPs, and payment confirmation SMS with 19-digit DLT Principal Entity ID registration."
              status={integrations.sms.status}
              enabled={integrations.sms.enabled}
              icon={<Smartphone className="w-5 h-5 text-purple-600" />}
              iconBg="bg-purple-100"
              badgeText="DLT Header: HRSHDY"
              maskedFields={[
                { label: 'DLT Sender ID (Header)', value: integrations.sms.senderId || 'Not set' },
                { label: 'DLT Principal Entity ID', value: integrations.sms.principalEntityId || 'Not set' },
                { label: 'Gateway API Key', value: integrations.sms.apiKey || 'Not set' },
                { label: 'Delivery Template ID', value: integrations.sms.dltTemplateDelivery || 'Not set' },
              ]}
              lastTestedAt={integrations.sms.lastTestedAt}
              lastTestResult={integrations.sms.lastTestResult}
              isTesting={isTesting.sms}
              onConfigure={() => setActiveModal('sms')}
              onTestConnection={() => testIntegrationConnection('sms')}
              onToggleEnabled={val => toggleIntegrationEnabled('sms', val)}
              onDisconnect={() => disconnectIntegration('sms')}
            />
          </div>
        </div>
      )}

      {/* Tab 2: Notification Automation Matrix */}
      {activeTab === 'automations' && (
        <div className="animate-fade-in">
          <AutomationRulesTab />
        </div>
      )}

      {/* Tab 3: Unified Audit Logs */}
      {activeTab === 'logs' && (
        <div className="animate-fade-in">
          <UnifiedLogsTab />
        </div>
      )}

      {/* Tab 4: Dairy Profile & Operational Parameters (Existing Settings) */}
      {activeTab === 'business' && (
        <form onSubmit={handleSaveBusiness} className="space-y-6 animate-fade-in">
          {/* Company Profile */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17211B] border-b pb-2 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-700" />
              <span>Dairy Farm Identity & Address</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Dairy Business Name</label>
                <input
                  type="text"
                  value={form.dairyName}
                  onChange={e => setForm({ ...form, dairyName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Tagline</label>
                <input
                  type="text"
                  value={form.tagline}
                  onChange={e => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block font-medium text-slate-700 mb-1">Physical Facility Address</label>
                <input
                  type="text"
                  value={form.address}
                  onChange={e => setForm({ ...form, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Official Helpline Phone</label>
                <input
                  type="text"
                  value={form.contactNumber}
                  onChange={e => setForm({ ...form, contactNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">GSTIN Number</label>
                <input
                  type="text"
                  value={form.gstNumber}
                  onChange={e => setForm({ ...form, gstNumber: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Operational Cutoff Times & Pricing */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17211B] border-b pb-2 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-700" />
              <span>Delivery Schedule & Subscription Pricing Defaults</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Default Cow Milk Retail Rate (₹ / Litre)
                </label>
                <input
                  type="number"
                  value={form.defaultCowMilkRate}
                  onChange={e => setForm({ ...form, defaultCowMilkRate: parseFloat(e.target.value) || 60 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Default Buffalo Milk Retail Rate (₹ / Litre)
                </label>
                <input
                  type="number"
                  value={form.defaultBuffaloMilkRate}
                  onChange={e => setForm({ ...form, defaultBuffaloMilkRate: parseFloat(e.target.value) || 75 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Next-Day Delivery Cutoff Time
                </label>
                <input
                  type="time"
                  value={form.deliveryCutoffTime}
                  onChange={e => setForm({ ...form, deliveryCutoffTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Customer Pause / Vacation Cutoff Time
                </label>
                <input
                  type="time"
                  value={form.pauseCutoffTime}
                  onChange={e => setForm({ ...form, pauseCutoffTime: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>

          {/* Invoicing Parameters */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-[#17211B] border-b pb-2">
              Billing Parameters & Defaults
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">Invoice Number Prefix</label>
                <input
                  type="text"
                  value={form.invoicePrefix}
                  onChange={e => setForm({ ...form, invoicePrefix: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 font-mono"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Month-End Bill Generation Day
                </label>
                <input
                  type="number"
                  value={form.invoiceGenerationDay}
                  onChange={e => setForm({ ...form, invoiceGenerationDay: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
              <div>
                <label className="block font-medium text-slate-700 mb-1">Payment Due Day of Month</label>
                <input
                  type="number"
                  value={form.paymentDueDate}
                  onChange={e => setForm({ ...form, paymentDueDate: parseInt(e.target.value) || 7 })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Operational Settings</span>
            </button>
          </div>
        </form>
      )}

      {/* Tab 5: Backend Security & Env Spec */}
      {activeTab === 'spec' && (
        <div className="animate-fade-in">
          <BackendSpecTab />
        </div>
      )}

      {/* Tab 6: Data Environment & Clean Slate */}
      {activeTab === 'data' && (
        <div className="space-y-6 animate-fade-in">
          {/* Active Mode Banner */}
          <div
            className={`p-5 rounded-2xl border ${
              isDemoMode
                ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-200 text-emerald-950'
            }`}
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    isDemoMode ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isDemoMode ? <Sparkles className="w-6 h-6" /> : <CheckCircle2 className="w-6 h-6" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-extrabold tracking-tight">
                      {isDemoMode
                        ? '🧪 Sample Demo Dataset Active (150 Households)'
                        : '🟢 Clean Production Mode (Ready for Real Dairy Operations)'}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        isDemoMode
                          ? 'bg-amber-200 text-amber-900 border border-amber-300'
                          : 'bg-emerald-200 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {isDemoMode ? 'Demo Mode' : 'Production Slate'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                    {isDemoMode
                      ? 'The application is currently pre-loaded with 150 simulated customer accounts (e.g., Rajesh Reddy, Harish Rao), 5 routes, and mock billing history for evaluation. To start running your dairy with your real customers and routes, click "Clear Dummy Data & Start Clean" below.'
                      : 'You are running with a clean, unpolluted workspace. All customers, routes, delivery orders, milk procurement logs, and invoices reflect real data entered by you.'}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                {isDemoMode ? (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Switch to Clean Production Mode? This will remove all 150 dummy customers and mock deliveries, leaving a clean slate for real operational dairy data.'
                        )
                      ) {
                        clearAllData();
                        alert('Clean Production Mode activated! All dummy records cleared.');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Clear Dummy Data & Start Clean</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          'Load Sample Demo Data? This will restore 150 sample households, 5 routes, and test billing for demonstration.'
                        )
                      ) {
                        loadDemoData();
                        alert('Sample demo dataset loaded!');
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                  >
                    <Database className="w-4 h-4" />
                    <span>Load 150 Demo Records</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Database Live Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Active Customers</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{customers.length}</p>
              <span className="text-[11px] text-slate-400">
                {isDemoMode ? '150 Mock households' : 'Clean registered customers'}
              </span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Delivery Routes</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{routes.length}</p>
              <span className="text-[11px] text-slate-400">Active delivery sectors</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Deliveries Tracked</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{deliveries.length}</p>
              <span className="text-[11px] text-slate-400">Daily delivery logs</span>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500">Invoices Generated</span>
              <p className="text-2xl font-black text-slate-900 mt-1">{invoices.length}</p>
              <span className="text-[11px] text-slate-400">Monthly customer bills</span>
            </div>
          </div>

          {/* Data Actions & Backup Card */}
          <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-700" />
              Data Import / Export & Local Backup
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Export your customer accounts, routes, and billing ledger as a JSON file for backup or import an existing dairy database.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  const exportObj = {
                    version: 'milkerp-v1',
                    exportedAt: new Date().toISOString(),
                    settings,
                    customers,
                    routes,
                    deliveries,
                    invoices,
                  };
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportObj, null, 2));
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute('download', `milkerp_dairy_backup_${new Date().toISOString().slice(0, 10)}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors border border-slate-300"
              >
                <Download className="w-3.5 h-3.5 text-slate-600" />
                <span>Export Dairy Data (JSON)</span>
              </button>

              <label className="flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors border border-slate-300 cursor-pointer">
                <Upload className="w-3.5 h-3.5 text-slate-600" />
                <span>Import Dairy Data (JSON)</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = event => {
                      try {
                        const parsed = JSON.parse(event.target?.result as string);
                        if (parsed.customers && Array.isArray(parsed.customers)) {
                          localStorage.setItem('milkerp_data_mode', 'clean');
                          localStorage.setItem('harish_dairy_app_state_v3', JSON.stringify(parsed));
                          alert(`Successfully imported ${parsed.customers.length} customers and operational data! Reloading...`);
                          window.location.reload();
                        } else {
                          alert('Invalid backup file format: missing customers list.');
                        }
                      } catch (err) {
                        alert('Failed to parse backup JSON file.');
                      }
                    };
                    reader.readAsText(file);
                  }}
                />
              </label>

              <button
                onClick={() => {
                  if (
                    window.confirm(
                      'Are you sure you want to completely erase all data and reset? This cannot be undone.'
                    )
                  ) {
                    clearAllData();
                    alert('Data cleared successfully.');
                  }
                }}
                className="flex items-center gap-2 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-xl transition-colors border border-rose-200"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear All Records</span>
              </button>
            </div>
          </div>

          {/* Backend Connectivity Status */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-600">
            <div className="flex items-center gap-2.5">
              <Server className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-bold text-slate-800">REST API Server: </span>
                <span className="font-mono text-emerald-700">http://localhost:4000/api/v1</span>
                <span className="ml-2 px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  Online & Active
                </span>
              </div>
            </div>
            <div className="text-[11px] text-slate-500">
              Dual-Mode Data Store: Resilient Fallback Store & PostgreSQL Prisma
            </div>
          </div>
        </div>
      )}

      {/* Configuration Modals */}
      {activeModal === 'razorpay' && (
        <RazorpayConfigModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          config={integrations.razorpay}
          onSave={updates => updateIntegrationConfig('razorpay', updates)}
        />
      )}

      {activeModal === 'whatsapp' && (
        <WhatsAppConfigModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          config={integrations.whatsapp}
          onSave={updates => updateIntegrationConfig('whatsapp', updates)}
        />
      )}

      {activeModal === 'email' && (
        <EmailConfigModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          config={integrations.email}
          onSave={updates => updateIntegrationConfig('email', updates)}
        />
      )}

      {activeModal === 'sms' && (
        <SmsConfigModal
          isOpen={true}
          onClose={() => setActiveModal(null)}
          config={integrations.sms}
          onSave={updates => updateIntegrationConfig('sms', updates)}
        />
      )}
    </div>
  );
};
