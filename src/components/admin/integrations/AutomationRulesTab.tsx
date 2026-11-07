import React, { useState } from 'react';
import { useIntegrations } from '../../../contexts/IntegrationsContext';
import { useDairy } from '../../../contexts/DairyContext';
import { NotificationEventType, AutomationRule } from '../../../models/integrations';
import {
  Zap,
  CheckCircle2,
  Clock,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  Info,
  Play,
  RotateCcw,
} from 'lucide-react';

export const AutomationRulesTab: React.FC = () => {
  const { automationRules, updateAutomationRule, triggerBusinessEvent, integrations } = useIntegrations();
  const { customers, invoices, deliveries } = useDairy();

  const [triggeringEvent, setTriggeringEvent] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleToggleChannel = (ruleId: string, channel: 'whatsapp' | 'email' | 'sms') => {
    const rule = automationRules.find(r => r.id === ruleId);
    if (!rule) return;

    updateAutomationRule(ruleId, {
      channels: {
        ...rule.channels,
        [channel]: !rule.channels[channel],
      },
    });
  };

  const handleTestTrigger = async (rule: AutomationRule) => {
    setTriggeringEvent(rule.id);
    setSuccessNotice(null);

    const sampleCustomer = customers[0] || {
      id: 'CUST-1001',
      name: 'Aarav Sharma',
      mobile: '9823456789',
      whatsapp: '9823456789',
      email: 'aarav.sharma@example.com',
    };

    const sampleInvoice = invoices[0];
    const sampleDelivery = deliveries[0];

    try {
      await triggerBusinessEvent(rule.eventType, sampleCustomer.id, `TEST-${Date.now().toString().slice(-4)}`, {
        delivery: sampleDelivery,
        invoice: sampleInvoice,
        overdueAmount: 2150,
        dueDate: '7th November 2026',
      });

      const activeChannels = Object.entries(rule.channels)
        .filter(([_, enabled]) => enabled)
        .map(([ch]) => ch.toUpperCase())
        .join(', ');

      setSuccessNotice(`Triggered '${rule.title}' test dispatch to ${activeChannels || 'no channels'}. Check 'Audit Logs' tab for full details!`);
      setTimeout(() => setSuccessNotice(null), 6000);
    } finally {
      setTriggeringEvent(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-600" />
            <span>Event-Driven Notification Rules Matrix</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically dispatch personalized alerts when operational lifecycle events occur
          </p>
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200 flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          <span>Only enabled & configured gateway channels receive notifications</span>
        </div>
      </div>

      {successNotice && (
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successNotice}</span>
        </div>
      )}

      {/* Rules Grid */}
      <div className="grid grid-cols-1 gap-4">
        {automationRules.map(rule => {
          const isWhatsAppAvailable = integrations.whatsapp.status === 'connected' || integrations.whatsapp.status === 'configured';
          const isEmailAvailable = integrations.email.status === 'connected' || integrations.email.status === 'configured';
          const isSmsAvailable = integrations.sms.status === 'connected' || integrations.sms.status === 'configured';

          return (
            <div
              key={rule.id}
              className={`p-5 rounded-2xl border transition-all duration-150 ${
                rule.enabled
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50/70 border-slate-200 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Event Info */}
                <div className="space-y-1 max-w-xl">
                  <div className="flex items-center gap-2.5">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={rule.enabled}
                        onChange={e => updateAutomationRule(rule.id, { enabled: e.target.checked })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#16803D]"></div>
                    </label>

                    <h4 className="font-bold text-slate-900 text-sm">{rule.title}</h4>

                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium border border-slate-200">
                      event: {rule.eventType}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 pl-11">{rule.description}</p>
                </div>

                {/* Channel Selector Pills & Test Trigger */}
                <div className="flex flex-wrap items-center gap-3 pl-11 md:pl-0">
                  {/* WhatsApp Pill */}
                  <button
                    type="button"
                    disabled={!rule.enabled}
                    onClick={() => handleToggleChannel(rule.id, 'whatsapp')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      rule.channels.whatsapp
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs'
                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={isWhatsAppAvailable ? 'WhatsApp Gateway Configured' : 'WhatsApp Gateway not yet configured'}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                    {rule.channels.whatsapp && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>}
                  </button>

                  {/* Email Pill */}
                  <button
                    type="button"
                    disabled={!rule.enabled}
                    onClick={() => handleToggleChannel(rule.id, 'email')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      rule.channels.email
                        ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-2xs'
                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={isEmailAvailable ? 'Email Gateway Configured' : 'Email Gateway not yet configured'}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email</span>
                    {rule.channels.email && <span className="w-1.5 h-1.5 rounded-full bg-blue-600"></span>}
                  </button>

                  {/* SMS Pill */}
                  <button
                    type="button"
                    disabled={!rule.enabled}
                    onClick={() => handleToggleChannel(rule.id, 'sms')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      rule.channels.sms
                        ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-2xs'
                        : 'bg-white text-slate-400 border-slate-200 hover:text-slate-600'
                    }`}
                    title={isSmsAvailable ? 'SMS Gateway Configured' : 'SMS Gateway not yet configured'}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS</span>
                    {rule.channels.sms && <span className="w-1.5 h-1.5 rounded-full bg-purple-600"></span>}
                  </button>

                  {/* Test Dispatch Button */}
                  <button
                    type="button"
                    onClick={() => handleTestTrigger(rule)}
                    disabled={!rule.enabled || triggeringEvent === rule.id}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg border border-slate-200 transition-colors disabled:opacity-40"
                    title="Simulate firing this business event for a test customer"
                  >
                    <Play className="w-3 h-3 fill-current text-slate-500" />
                    <span>{triggeringEvent === rule.id ? 'Firing...' : 'Test Trigger'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

