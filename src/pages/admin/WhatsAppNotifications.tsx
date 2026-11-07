import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { useIntegrations } from '../../contexts/IntegrationsContext';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency } from '../../utils/formatters';
import {
  MessageSquare,
  Send,
  RotateCcw,
  Search,
  CheckCircle2,
  AlertTriangle,
  Download,
  Eye,
  Smartphone,
  Settings,
  Clock,
  XCircle,
} from 'lucide-react';

export const WhatsAppNotifications: React.FC = () => {
  const navigate = useNavigate();
  const { invoices, customers, settings } = useDairy();
  const {
    integrations,
    unifiedLogs,
    triggerBusinessEvent,
    retryUnifiedNotification,
    exportLogsCSV,
  } = useIntegrations();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoices.find(i => i.balanceRemaining > 0)?.id || invoices[0]?.id || ''
  );
  const [isSending, setIsSending] = useState(false);
  const [selectedLogForPreview, setSelectedLogForPreview] = useState<any | null>(null);

  const whatsappConfig = integrations.whatsapp;

  // Selected Invoice Details for Live WhatsApp bubble preview
  const activeInvoice = invoices.find(i => i.id === selectedInvoiceId) || invoices[0];
  const activeCustomer = activeInvoice
    ? customers.find(c => c.id === activeInvoice.customerId)
    : null;

  const livePreviewText = activeInvoice
    ? settings.notificationTemplate
      .replace('{{customerName}}', activeInvoice.customerName)
      .replace('{{billingMonth}}', activeInvoice.monthLabel)
      .replace('{{milkCharges}}', `₹${activeInvoice.milkCharges.toLocaleString('en-IN')}`)
      .replace('{{productCharges}}', `₹${activeInvoice.productCharges.toLocaleString('en-IN')}`)
      .replace('{{previousBalance}}', `₹${activeInvoice.previousBalance.toLocaleString('en-IN')}`)
      .replace('{{paymentsApplied}}', `₹${activeInvoice.paymentsApplied.toLocaleString('en-IN')}`)
      .replace('{{amountDue}}', `₹${activeInvoice.balanceRemaining.toLocaleString('en-IN')}`)
    : '';

  const handleSendSingle = async () => {
    if (!activeInvoice || !activeCustomer) return;
    setIsSending(true);
    try {
      await triggerBusinessEvent('invoice_generated', activeCustomer.id, activeInvoice.id, {
        invoice: activeInvoice,
      });
      alert(
        whatsappConfig.status === 'connected'
          ? `Live WhatsApp message dispatched to ${activeInvoice.customerName} via Meta Cloud API!`
          : `Simulated WhatsApp notification recorded for ${activeInvoice.customerName} (Dev Mode)!`
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSendBatch = async () => {
    setIsSending(true);
    try {
      const unnotified = invoices.filter(
        inv => !unifiedLogs.some(log => log.relatedEntityId === inv.id && log.channel === 'whatsapp' && log.status === 'Delivered')
      );
      const batch = unnotified.slice(0, 10);
      for (const inv of batch) {
        await triggerBusinessEvent('invoice_generated', inv.customerId, inv.id, {
          invoice: inv,
        });
      }
      alert(`Batch of ${batch.length} notifications dispatched across active channels!`);
    } finally {
      setIsSending(false);
    }
  };

  // WhatsApp logs from unified audit trail
  const whatsAppLogs = unifiedLogs.filter(l => l.channel === 'whatsapp');

  const filteredLogs = whatsAppLogs.filter(log => {
    return (
      log.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recipient.includes(searchTerm) ||
      (log.providerMessageId && log.providerMessageId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Delivered
          </span>
        );
      case 'Simulated':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Simulated (Dev)
          </span>
        );
      case 'Failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            Failed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            WhatsApp Business Notifications
            {whatsappConfig.status === 'connected' ? (
              <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Live Meta Cloud API Connected
              </span>
            ) : whatsappConfig.status === 'configured' ? (
              <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full border border-amber-200 flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                Configured (Dev Mode)
              </span>
            ) : (
              <span className="text-xs bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 rounded-full border border-slate-200 flex items-center gap-1">
                Not Configured (Demo Mode)
              </span>
            )}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Personalized month-end bill reminders, dues summaries, and delivery statuses
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
            title="Configure WhatsApp API credentials in Admin Settings"
          >
            <Settings className="w-3.5 h-3.5 text-slate-600" />
            <span>Gateway Settings</span>
          </button>

          <button
            onClick={exportLogsCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Logs</span>
          </button>

          <button
            onClick={handleSendBatch}
            disabled={isSending}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send Batch (Next 10 Bills)</span>
          </button>
        </div>
      </div>

      {/* Interactive Message Dispatch & Phone Mockup Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Dispatch Controller */}
        <div className="lg:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-[#17211B] flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-emerald-700" />
            <span>Select Customer Invoice to Notify</span>
          </h3>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Finalized or Draft Customer Invoices
            </label>
            <select
              value={selectedInvoiceId}
              onChange={e => setSelectedInvoiceId(e.target.value)}
              className="w-full px-3 py-2.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              {invoices.slice(0, 30).map(inv => (
                <option key={inv.id} value={inv.id}>
                  {inv.customerName} — {inv.invoiceNumber} ({inv.monthLabel}) • Due: {formatCurrency(inv.balanceRemaining)}
                </option>
              ))}
            </select>
          </div>

          {activeInvoice && (
            <div className="p-3 bg-[#F7F9F7] rounded-xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Customer Mobile:</span>
                <span className="font-semibold">{activeInvoice.customerMobile}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">WhatsApp Gateway:</span>
                <span className="font-semibold text-emerald-700">
                  {whatsappConfig.provider === 'meta_cloud_api' ? 'Meta Cloud API' : whatsappConfig.provider.toUpperCase()} ({whatsappConfig.fromPhoneNumber || 'Harish Dairy Official'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Invoice Total Due:</span>
                <span className="font-bold text-[#14532D]">{formatCurrency(activeInvoice.balanceRemaining)}</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex items-center justify-between">
            {whatsappConfig.status === 'connected' ? (
              <span className="text-[11px] text-emerald-800 font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-200 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                Live Mode: Messages sent via Meta API
              </span>
            ) : (
              <span className="text-[11px] text-amber-700 font-medium bg-amber-50 px-2 py-1 rounded border border-amber-200 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-600" />
                Dev Mode: Simulated action (Gateway offline)
              </span>
            )}

            <button
              onClick={handleSendSingle}
              disabled={isSending}
              className="flex items-center gap-2 px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg shadow-xs transition-colors disabled:opacity-50"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSending ? 'Sending...' : 'Dispatch Message'}</span>
            </button>
          </div>
        </div>

        {/* Right: WhatsApp Chat Bubble Mockup */}
        <div className="lg:col-span-5 bg-[#0B141A] rounded-2xl p-4 text-white shadow-md flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-600 flex items-center justify-center font-bold text-xs">
                🥛
              </div>
              <div>
                <p className="text-xs font-bold leading-tight">Harish Dairy (Official)</p>
                <p className="text-[10px] text-emerald-400">Verified Business Account</p>
              </div>
            </div>
            <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-slate-300">
              Live Preview
            </span>
          </div>

          {/* WhatsApp message bubble */}
          <div className="my-4 flex justify-end">
            <div className="max-w-[90%] bg-[#005C4B] p-3.5 rounded-2xl rounded-tr-xs text-xs text-white shadow-xs space-y-2 font-sans">
              <p className="whitespace-pre-line leading-relaxed text-[11px]">
                {livePreviewText}
              </p>
              <div className="flex items-center justify-end gap-1 text-[10px] text-emerald-200 pt-1">
                <span>10:42 AM</span>
                <span className="text-blue-300 font-bold">✓✓</span>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-2 text-center text-[10px] text-slate-400">
            End-to-End Encrypted Message Preview
          </div>
        </div>
      </div>

      {/* Notification Logs Register */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F7F9F7]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">
              WhatsApp Notification Audit Log ({whatsAppLogs.length} Records)
            </h3>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search WhatsApp logs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Log ID</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">WhatsApp Number</th>
                <th className="px-4 py-3">Provider Ref ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No WhatsApp logs found
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500">{log.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-slate-600">{log.timestamp}</td>
                    <td className="px-4 py-3 font-medium text-slate-800">{log.customerName}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{log.recipient}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500 max-w-[150px] truncate">
                      {log.providerMessageId || '—'}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{getStatusBadge(log.status)}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setSelectedLogForPreview(log)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Preview payload"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => retryUnifiedNotification(log.id)}
                          className="p-1.5 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Retry notification"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Preview Modal */}
      {selectedLogForPreview && (
        <Modal
          isOpen={!!selectedLogForPreview}
          onClose={() => setSelectedLogForPreview(null)}
          title="WhatsApp Message Payload"
          maxWidth="md"
        >
          <div className="p-5 space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient:</span>
                <span className="font-mono font-semibold">{selectedLogForPreview.recipient}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Provider Message ID:</span>
                <span className="font-mono text-slate-700">{selectedLogForPreview.providerMessageId || 'Simulated'}</span>
              </div>
            </div>

            <div>
              <span className="font-semibold text-slate-700 block mb-1">Message Body:</span>
              <p className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-slate-800 whitespace-pre-wrap leading-relaxed">
                {selectedLogForPreview.payloadSummary}
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setSelectedLogForPreview(null)}
                className="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
