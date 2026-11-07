import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Search,
  Filter,
  RefreshCw,
  ExternalLink,
  X,
  Building2,
  Calendar,
  ShieldCheck,
  Check,
} from 'lucide-react';
import { superAdminApi } from '../../../services/api/superAdminApi';

interface BillingTabProps {
  onRefresh?: () => void;
}

export const BillingTab: React.FC<BillingTabProps> = ({ onRefresh }) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [billingSummary, setBillingSummary] = useState<{
    mrr: number;
    arr: number;
    totalInvoices: number;
    paidInvoices: number;
    pendingInvoices: number;
    totalCollected: number;
    paymentGatewayConfigured: boolean;
    supportedMethods: string[];
  } | null>(null);

  const [activeSubTab, setActiveSubTab] = useState<'invoices' | 'payments'>('invoices');

  // Invoices state
  const [invoices, setInvoices] = useState<any[]>([]);
  const [invoicePage, setInvoicePage] = useState<number>(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState<number>(1);
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [invoiceSearch, setInvoiceSearch] = useState<string>('');

  // Payments state
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentPage, setPaymentPage] = useState<number>(1);
  const [paymentTotalPages, setPaymentTotalPages] = useState<number>(1);

  // Selected invoice for receipt modal
  const [selectedInvoice, setSelectedInvoice] = useState<any | null>(null);

  useEffect(() => {
    loadBillingData();
  }, [invoicePage, invoiceStatusFilter, paymentPage]);

  const loadBillingData = async () => {
    setLoading(true);
    try {
      const summary = await superAdminApi.getBillingSummary();
      setBillingSummary(summary);

      const invRes = await superAdminApi.listInvoices({
        page: invoicePage,
        limit: 10,
        status: invoiceStatusFilter !== 'all' ? invoiceStatusFilter : undefined,
      });
      setInvoices(invRes.invoices || []);
      setInvoiceTotalPages(invRes.pagination?.totalPages || 1);

      const payRes = await superAdminApi.listPayments({
        page: paymentPage,
        limit: 10,
      });
      setPayments(payRes.payments || []);
      setPaymentTotalPages(payRes.pagination?.totalPages || 1);
    } catch (err) {
      console.error('Failed to load billing data', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
      case 'SUCCESS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'PENDING':
      case 'FINALIZED':
      case 'PARTIALLY_PAID':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      case 'OVERDUE':
      case 'FAILED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            Platform Billing & Revenue
          </h2>
          <p className="text-sm text-slate-500">
            Manage SaaS subscription billings, payment logs, and tenant invoices.
          </p>
        </div>
        <button
          onClick={loadBillingData}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xl">
            ₹
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Monthly Recurring (MRR)</div>
            <div className="text-2xl font-bold text-slate-800">
              ₹{(billingSummary?.mrr || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
              <TrendingUp className="w-3 h-3" />
              ARR: ₹{(billingSummary?.arr || 0).toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Invoices</div>
            <div className="text-2xl font-bold text-slate-800">
              {billingSummary?.totalInvoices || 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {billingSummary?.paidInvoices || 0} paid • {billingSummary?.pendingInvoices || 0} pending
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Collections</div>
            <div className="text-2xl font-bold text-slate-800">
              ₹{(billingSummary?.totalCollected || 0).toLocaleString('en-IN')}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              Across all tenant payments
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Gateway Status</div>
            <div className="text-sm font-semibold text-slate-700">
              {billingSummary?.paymentGatewayConfigured ? (
                <span className="text-emerald-600">Active (Razorpay/Stripe)</span>
              ) : (
                <span className="text-amber-600">Direct Banking & UPI</span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {billingSummary?.supportedMethods?.join(', ') || 'UPI, NetBanking, Card'}
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs: Invoices vs Payments */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setActiveSubTab('invoices')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${activeSubTab === 'invoices'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Subscription Invoices ({billingSummary?.totalInvoices || 0})
            </button>
            <button
              onClick={() => setActiveSubTab('payments')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition ${activeSubTab === 'payments'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
                }`}
            >
              Payment Transactions
            </button>
          </div>

          {activeSubTab === 'invoices' && (
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={invoiceStatusFilter}
                onChange={e => {
                  setInvoiceStatusFilter(e.target.value);
                  setInvoicePage(1);
                }}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-700 bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="all">All Statuses</option>
                <option value="PAID">PAID</option>
                <option value="FINALIZED">PENDING / FINALIZED</option>
                <option value="OVERDUE">OVERDUE</option>
                <option value="DRAFT">DRAFT</option>
              </select>
            </div>
          )}
        </div>

        {/* Invoices List */}
        {activeSubTab === 'invoices' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Invoice #</th>
                  <th className="px-6 py-3">Tenant / Dairy</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Due Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No invoices found matching criteria.
                    </td>
                  </tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono font-medium text-slate-800">
                        {inv.invoiceNumber || inv.id}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800">
                          {inv.tenant?.name || inv.tenantName || 'Tenant'}
                        </div>
                        <div className="text-xs text-slate-400">
                          {inv.tenant?.slug ? `${inv.tenant.slug}.milkerp.com` : inv.tenantId}
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{Number(inv.totalPayable || inv.totalAmount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(inv.status)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3 py-1 text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg transition"
                        >
                          View Receipt
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {invoiceTotalPages > 1 && (
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <span>Page {invoicePage} of {invoiceTotalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={invoicePage <= 1}
                    onClick={() => setInvoicePage(p => p - 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={invoicePage >= invoiceTotalPages}
                    onClick={() => setInvoicePage(p => p + 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Payments List */}
        {activeSubTab === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="px-6 py-3">Transaction ID</th>
                  <th className="px-6 py-3">Tenant</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Method</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Recorded At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  payments.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4 font-mono text-xs font-medium text-slate-700">
                        {p.transactionId || p.referenceId || p.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        {p.tenant?.name || p.tenantName || p.tenantId || 'Tenant'}
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-800">
                        ₹{Number(p.amount || 0).toLocaleString('en-IN')}
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {p.paymentMethod || p.method || 'UPI / NetBanking'}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(p.status)}
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">
                        {p.createdAt ? new Date(p.createdAt).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* Pagination */}
            {paymentTotalPages > 1 && (
              <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500">
                <span>Page {paymentPage} of {paymentTotalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={paymentPage <= 1}
                    onClick={() => setPaymentPage(p => p - 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    disabled={paymentPage >= paymentTotalPages}
                    onClick={() => setPaymentPage(p => p + 1)}
                    className="px-3 py-1 bg-white border border-slate-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Invoice Receipt Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  MilkerP SaaS Invoice
                </span>
                <h3 className="text-xl font-bold text-slate-800 mt-1">
                  {selectedInvoice.invoiceNumber || selectedInvoice.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Billed Dairy / Tenant:</span>
                <span className="font-semibold text-slate-800">
                  {selectedInvoice.tenant?.name || selectedInvoice.tenantName || 'Tenant'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Billing Status:</span>
                <span>{getStatusBadge(selectedInvoice.status)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500">Billing Period:</span>
                <span className="text-slate-700">
                  {selectedInvoice.periodStart ? new Date(selectedInvoice.periodStart).toLocaleDateString() : 'Current Month'} - {selectedInvoice.periodEnd ? new Date(selectedInvoice.periodEnd).toLocaleDateString() : 'Next Month'}
                </span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-base font-bold text-slate-900">
                <span>Total Amount:</span>
                <span className="text-emerald-700">
                  ₹{Number(selectedInvoice.totalPayable || selectedInvoice.totalAmount || 0).toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

