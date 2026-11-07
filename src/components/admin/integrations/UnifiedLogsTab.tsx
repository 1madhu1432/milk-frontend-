import React, { useState } from 'react';
import { useIntegrations } from '../../../contexts/IntegrationsContext';
import { UnifiedNotificationLog } from '../../../models/integrations';
import { Modal } from '../../common/Modal';
import {
  Download,
  Trash2,
  Search,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  MessageSquare,
  Mail,
  Smartphone,
  Eye,
  Check,
  ShieldCheck,
  Filter,
} from 'lucide-react';

export const UnifiedLogsTab: React.FC = () => {
  const { unifiedLogs, retryUnifiedNotification, clearUnifiedLogs, exportLogsCSV } = useIntegrations();

  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [inspectLog, setInspectLog] = useState<UnifiedNotificationLog | null>(null);

  // Statistics
  const totalCount = unifiedLogs.length;
  const deliveredCount = unifiedLogs.filter(l => l.status === 'Delivered').length;
  const simulatedCount = unifiedLogs.filter(l => l.status === 'Simulated').length;
  const failedCount = unifiedLogs.filter(l => l.status === 'Failed').length;

  // Filtered Logs
  const filteredLogs = unifiedLogs.filter(log => {
    if (channelFilter !== 'ALL' && log.channel !== channelFilter) return false;
    if (statusFilter !== 'ALL' && log.status !== statusFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchCust = log.customerName.toLowerCase().includes(term);
      const matchRec = log.recipient.toLowerCase().includes(term);
      const matchProv = log.provider.toLowerCase().includes(term);
      const matchPayload = log.payloadSummary?.toLowerCase().includes(term) || false;
      const matchId = log.id.toLowerCase().includes(term);
      const matchRef = log.providerMessageId?.toLowerCase().includes(term) || false;
      if (!matchCust && !matchRec && !matchProv && !matchPayload && !matchId && !matchRef) {
        return false;
      }
    }
    return true;
  });

  const handleRetry = async (logId: string) => {
    setRetryingId(logId);
    try {
      await retryUnifiedNotification(logId);
    } finally {
      setRetryingId(null);
    }
  };

  const getStatusBadge = (status: UnifiedNotificationLog['status']) => {
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
      case 'Sent':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            Sent
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
            {status}
          </span>
        );
    }
  };

  const getChannelIcon = (channel: UnifiedNotificationLog['channel']) => {
    switch (channel) {
      case 'whatsapp':
        return <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-3.5 h-3.5 text-blue-600" />;
      case 'sms':
        return <Smartphone className="w-3.5 h-3.5 text-purple-600" />;
    }
  };

  return (
    <div className="space-y-5">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-slate-500">Total Notifications</p>
          <p className="text-xl font-bold text-slate-900 mt-1">{totalCount}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Across all active channels</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-emerald-700">Verified Delivered</p>
          <p className="text-xl font-bold text-emerald-800 mt-1">{deliveredCount}</p>
          <p className="text-[10px] text-emerald-600 mt-0.5">Handled by live providers</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-amber-700">Simulated (Dev Mode)</p>
          <p className="text-xl font-bold text-amber-800 mt-1">{simulatedCount}</p>
          <p className="text-[10px] text-amber-600 mt-0.5">Mocked without live gateway</p>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <p className="text-[11px] font-medium text-rose-700">Delivery Errors</p>
          <p className="text-xl font-bold text-rose-800 mt-1">{failedCount}</p>
          <p className="text-[10px] text-rose-600 mt-0.5">Retry action available</p>
        </div>
      </div>

      {/* Filter and Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by customer, recipient, message ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
          />
        </div>

        {/* Filter dropdowns & action buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
          {/* Channel Filter */}
          <select
            value={channelFilter}
            onChange={e => setChannelFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="ALL">All Channels</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Simulated">Simulated (Dev)</option>
            <option value="Sent">Sent</option>
            <option value="Failed">Failed</option>
          </select>

          {/* Export CSV */}
          <button
            onClick={exportLogsCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          {/* Clear Logs */}
          <button
            onClick={clearUnifiedLogs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 text-xs font-medium rounded-lg transition-colors"
            title="Clear notification audit trail"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF9] text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Customer & Recipient</th>
                <th className="px-4 py-3">Event Trigger</th>
                <th className="px-4 py-3">Provider & Ref ID</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400">
                    No matching notification records found
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 font-semibold text-slate-800 capitalize">
                        {getChannelIcon(log.channel)}
                        {log.channel}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{log.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{log.recipient}</div>
                    </td>

                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium text-[10px] font-mono whitespace-nowrap">
                        {log.eventType}
                      </span>
                      {log.payloadSummary && (
                        <p className="text-[11px] text-slate-500 line-clamp-1 max-w-xs mt-0.5">
                          {log.payloadSummary}
                        </p>
                      )}
                    </td>

                    <td className="px-4 py-3">
                      <div className="text-slate-800 font-medium text-[11px]">{log.provider}</div>
                      <div className="text-[10px] font-mono text-slate-400 truncate max-w-[140px]">
                        {log.providerMessageId || '—'}
                      </div>
                    </td>

                    <td className="px-4 py-3 whitespace-nowrap">
                      {getStatusBadge(log.status)}
                      {log.retryCount > 0 && (
                        <span className="block text-[10px] text-slate-400 mt-0.5">
                          Retries: {log.retryCount}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setInspectLog(log)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View message payload & headers"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold rounded-lg border border-slate-200 transition-colors disabled:opacity-50"
                          title="Retry dispatching this notification"
                        >
                          <RotateCcw className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`} />
                          <span>Retry</span>
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

      {/* Inspect Log Modal */}
      {inspectLog && (
        <Modal isOpen={!!inspectLog} onClose={() => setInspectLog(null)} title="Notification Audit Details" maxWidth="lg">
          <div className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-medium">Log Record ID:</span>
                <span className="font-mono font-bold text-slate-800">{inspectLog.id}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Timestamp:</span>
                <span className="text-slate-800">{inspectLog.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Customer:</span>
                <span className="font-bold text-slate-800">{inspectLog.customerName} ({inspectLog.customerId})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Channel / Provider:</span>
                <span className="font-semibold text-slate-800 capitalize">{inspectLog.channel} • {inspectLog.provider}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-600 block font-semibold mb-1">Provider Message ID / Tracking Reference:</span>
              <p className="p-2.5 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-800 break-all select-all">
                {inspectLog.providerMessageId || 'N/A (Local Simulation)'}
              </p>
            </div>

            <div>
              <span className="text-slate-600 block font-semibold mb-1">Idempotency Key (Deduplication Lock):</span>
              <p className="p-2 bg-slate-100 rounded-lg font-mono text-[11px] text-slate-700">
                {inspectLog.idempotencyKey}
              </p>
            </div>

            <div>
              <span className="text-slate-600 block font-semibold mb-1">Dispatched Message Content:</span>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed font-sans text-xs">
                {inspectLog.payloadSummary}
              </div>
            </div>

            {inspectLog.errorDetails && (
              <div>
                <span className="text-rose-600 block font-semibold mb-1">Provider Error Response:</span>
                <p className="p-2.5 bg-rose-50 rounded-lg border border-rose-200 text-rose-800 font-mono text-[11px]">
                  {inspectLog.errorDetails}
                </p>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setInspectLog(null)}
                className="px-4 py-2 bg-slate-900 text-white font-semibold rounded-lg text-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

