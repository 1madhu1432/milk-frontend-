import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { Invoice } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { PaymentGatewayModal } from '../../components/common/PaymentGatewayModal';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  Receipt,
  Plus,
  Printer,
  Download,
  Search,
  CheckCircle2,
  Calendar,
  Send,
  Eye,
  FileCheck,
  CreditCard,
  Ban,
  ShieldCheck,
} from 'lucide-react';

export const MonthlyBilling: React.FC = () => {
  const {
    invoices,
    generateMonthlyInvoices,
    finalizeInvoice,
    voidInvoice,
    sendDemoNotification,
    routes,
    settings,
    addCustomerPayment,
    currentUser,
  } = useDairy();

  const now = new Date();
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthLabel = now.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const [selectedMonth, setSelectedMonth] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [gatewayInvoice, setGatewayInvoice] = useState<Invoice | null>(null);

  const handleGatewaySuccess = (paymentData: {
    paymentId: string;
    referenceNo: string;
    method: any;
    amount: number;
    date: string;
    notes?: string;
  }) => {
    if (!gatewayInvoice) return;
    addCustomerPayment({
      customerId: gatewayInvoice.customerId,
      customerName: gatewayInvoice.customerName,
      date: paymentData.date,
      amount: paymentData.amount,
      paymentMethod: 'Payment Gateway (Online)',
      referenceNo: paymentData.referenceNo,
      invoiceId: gatewayInvoice.id,
      recordedBy: currentUser.name,
      notes: paymentData.notes || `Invoice ${gatewayInvoice.invoiceNumber} paid via Gateway`,
    });
    setGatewayInvoice(null);
    if (viewingInvoice && viewingInvoice.id === gatewayInvoice.id) {
      setViewingInvoice(null);
    }
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesMonth = selectedMonth === 'ALL' || inv.month === selectedMonth;
    const matchesStatus = selectedStatus === 'ALL' || inv.status === selectedStatus;
    const matchesSearch =
      inv.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesStatus && matchesSearch;
  });

  const totalBilling = filteredInvoices.reduce((acc, i) => acc + i.totalPayable, 0);
  const totalCollected = filteredInvoices.reduce((acc, i) => acc + i.paymentsApplied, 0);
  const totalBalanceDue = filteredInvoices.reduce((acc, i) => acc + i.balanceRemaining, 0);

  const handleGenerateInvoices = () => {
    const targetMonth = selectedMonth === 'ALL' ? currentMonthKey : selectedMonth;
    const monthName = targetMonth === currentMonthKey ? currentMonthLabel : targetMonth;
    const count = generateMonthlyInvoices(targetMonth, monthName);
    if (count > 0) {
      alert(`Successfully generated ${count} monthly invoices for ${monthName}!`);
    } else {
      alert(`Invoices for all eligible customers in ${monthName} already exist.`);
    }
  };

  const handleExportCSV = () => {
    exportToCSV(filteredInvoices, `Invoices_Register_${selectedMonth}`, [
      { key: 'invoiceNumber', label: 'Invoice #' },
      { key: 'customerName', label: 'Customer' },
      { key: 'monthLabel', label: 'Billing Period' },
      { key: 'milkCharges', label: 'Milk Charges (₹)' },
      { key: 'productCharges', label: 'Product Charges (₹)' },
      { key: 'previousBalance', label: 'Previous Balance (₹)' },
      { key: 'paymentsApplied', label: 'Payments Applied (₹)' },
      { key: 'totalPayable', label: 'Total Payable (₹)' },
      { key: 'balanceRemaining', label: 'Balance Due (₹)' },
      { key: 'status', label: 'Status' },
      { key: 'dueDate', label: 'Due Date' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Monthly Customer Billing & Statements
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Postpaid Ledger Model
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Auto-generate month-end invoices from daily fulfilled milk & product deliveries
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Register</span>
          </button>

          <button
            onClick={handleGenerateInvoices}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Run Month-End Invoicing</span>
          </button>
        </div>
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase block">
            Total Invoiced Amount
          </span>
          <span className="text-xl font-extrabold text-slate-900">
            {formatCurrency(totalBilling)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            {filteredInvoices.length} Invoices in filter
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase block">
            Collections Applied
          </span>
          <span className="text-xl font-extrabold text-emerald-800">
            {formatCurrency(totalCollected)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Settled via UPI / Cash / Online
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase block">
            Outstanding Receivable
          </span>
          <span className="text-xl font-extrabold text-rose-700">
            {formatCurrency(totalBalanceDue)}
          </span>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Pending household settlement
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search invoice #, customer..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16803D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedMonth}
            onChange={e => setSelectedMonth(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Billing Months</option>
            <option value={currentMonthKey}>{currentMonthLabel} (Current MTD)</option>
            <option value="2026-10">October 2026</option>
            <option value="2026-09">September 2026</option>
          </select>

          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses</option>
            <option value="Draft">Draft</option>
            <option value="Finalized">Finalized</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Paid">Paid in Full</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Invoice Number</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Billing Month</th>
                <th className="px-4 py-3 text-right">Milk Charges</th>
                <th className="px-4 py-3 text-right">Products</th>
                <th className="px-4 py-3 text-right">Prev Balance</th>
                <th className="px-4 py-3 text-right">Total Payable</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-right">Balance Due</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map(inv => (
                <tr key={inv.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold font-mono text-slate-900">
                    {inv.invoiceNumber}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#17211B]">{inv.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{inv.customerId}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{inv.monthLabel}</td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatCurrency(inv.milkCharges)}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-600">
                    {inv.productCharges > 0 ? formatCurrency(inv.productCharges) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">
                    {inv.previousBalance > 0 ? formatCurrency(inv.previousBalance) : '-'}
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-[#14532D]">
                    {formatCurrency(inv.totalPayable)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-800">
                    {formatCurrency(inv.paymentsApplied)}
                  </td>
                  <td className="px-4 py-3 text-right font-bold">
                    <span
                      className={
                        inv.balanceRemaining > 0 ? 'text-rose-700' : 'text-emerald-700'
                      }
                    >
                      {formatCurrency(inv.balanceRemaining)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        inv.status === 'Paid'
                          ? 'green'
                          : inv.status === 'Draft' || inv.status === 'Partially Paid'
                          ? 'amber'
                          : 'red'
                      }
                    >
                      {inv.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingInvoice(inv)}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                        title="View / Print Tax Invoice"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {inv.status === 'Draft' && (
                        <button
                          onClick={() => {
                            finalizeInvoice(inv.id);
                            alert(`Invoice ${inv.invoiceNumber} finalized!`);
                          }}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded"
                          title="Finalize Invoice"
                        >
                          <FileCheck className="w-4 h-4" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          sendDemoNotification(inv.id);
                          alert(`Simulated WhatsApp bill message dispatched to ${inv.customerName}!`);
                        }}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                        title="Send Simulated WhatsApp Bill"
                      >
                        <Send className="w-4 h-4" />
                      </button>

                      {inv.balanceRemaining > 0 && (
                        <button
                          onClick={() => setGatewayInvoice(inv)}
                          className="p-1 text-emerald-700 hover:bg-emerald-100 rounded"
                          title="Collect via Payment Gateway"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Printable Tax Invoice Modal */}
      {viewingInvoice && (
        <Modal
          isOpen={!!viewingInvoice}
          onClose={() => setViewingInvoice(null)}
          title={`Monthly Tax Invoice: ${viewingInvoice.invoiceNumber}`}
          maxWidth="2xl"
        >
          <div className="space-y-4 text-xs font-sans">
            {/* Printable Invoice Container */}
            <div className="border border-slate-300 p-6 rounded-xl bg-white space-y-4 shadow-xs">
              {/* Header */}
              <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">🥛</span>
                    <h2 className="text-base font-bold text-slate-900 uppercase">
                      {settings.dairyName}
                    </h2>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{settings.address}</p>
                  <p className="text-[11px] text-slate-500">Phone: {settings.contactNumber} • GSTIN: {settings.gstNumber}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    TAX INVOICE
                  </span>
                  <p className="font-mono font-bold text-sm text-slate-900 mt-2">
                    {viewingInvoice.invoiceNumber}
                  </p>
                  <p className="text-[11px] text-slate-500">Generated: {formatDate(viewingInvoice.generatedDate)}</p>
                  <p className="text-[11px] text-rose-700 font-bold">Due Date: {formatDate(viewingInvoice.dueDate)}</p>
                </div>
              </div>

              {/* Billed To */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">BILLED TO:</span>
                  <p className="font-bold text-sm text-slate-900">{viewingInvoice.customerName}</p>
                  <p className="text-slate-600">{viewingInvoice.customerAddress}</p>
                  <p className="text-slate-600">Mobile: {viewingInvoice.customerMobile}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">BILLING PERIOD:</span>
                  <p className="font-bold text-slate-900">{viewingInvoice.monthLabel}</p>
                  <p className="text-slate-600">Route: {routes.find(r => r.id === viewingInvoice.routeId)?.name.split(' - ')[0]}</p>
                  <p className="text-slate-600">Payment Status: <strong className="uppercase">{viewingInvoice.status}</strong></p>
                </div>
              </div>

              {/* Line Items */}
              <table className="w-full text-left border">
                <thead className="bg-[#F7F9F7] border-b">
                  <tr>
                    <th className="p-2 border">Description</th>
                    <th className="p-2 border text-center">Delivered Qty</th>
                    <th className="p-2 border text-right">Unit Rate</th>
                    <th className="p-2 border text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {viewingInvoice.items.map((it, idx) => (
                    <tr key={idx} className="border-b">
                      <td className="p-2 border">
                        <span className="font-medium text-slate-900">{it.description}</span>
                        <span className="block text-[10px] text-slate-400">{it.date}</span>
                      </td>
                      <td className="p-2 border text-center">{it.quantity} {it.unit}</td>
                      <td className="p-2 border text-right">₹{it.rate}</td>
                      <td className="p-2 border text-right font-bold">{formatCurrency(it.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Calculation Summary Breakdown */}
              <div className="flex justify-end">
                <div className="w-72 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Milk Charges:</span>
                    <span>{formatCurrency(viewingInvoice.milkCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Dairy Product Orders:</span>
                    <span>{formatCurrency(viewingInvoice.productCharges)}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Previous Unpaid Dues:</span>
                    <span>{formatCurrency(viewingInvoice.previousBalance)}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Less Payments Received:</span>
                    <span>- {formatCurrency(viewingInvoice.paymentsApplied)}</span>
                  </div>
                  <div className="border-t border-slate-900 pt-2 flex justify-between text-sm font-extrabold text-slate-900">
                    <span>Net Amount Payable:</span>
                    <span className="text-[#14532D]">{formatCurrency(viewingInvoice.balanceRemaining)}</span>
                  </div>
                </div>
              </div>

              {/* Footer Payment Note */}
              <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 flex justify-between items-center">
                <div>
                  <p className="font-bold text-slate-700">Payment Modes Accepted:</p>
                  <p>Cash to delivery agent • UPI QR Scan at doorstep • Monthly Bank Transfer</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-slate-700">Authorized Signature</p>
                  <p className="text-[10px] italic">DairyNexa Operations</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 no-print">
              <button
                onClick={() => {
                  sendDemoNotification(viewingInvoice.id);
                  alert('WhatsApp demo notification sent!');
                }}
                className="px-3.5 py-2 bg-emerald-50 text-emerald-800 rounded-lg font-semibold flex items-center gap-1.5 border border-emerald-200 text-xs"
              >
                <Send className="w-4 h-4 text-emerald-700" />
                <span>Simulate WhatsApp Bill Send</span>
              </button>

              <div className="flex items-center gap-2">
                {viewingInvoice.balanceRemaining > 0 && (
                  <button
                    onClick={() => setGatewayInvoice(viewingInvoice)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg font-bold flex items-center gap-1.5 shadow-sm text-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-emerald-200" />
                    <span>Collect via Gateway ({formatCurrency(viewingInvoice.balanceRemaining)})</span>
                  </button>
                )}

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold flex items-center gap-1.5 text-xs"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Invoice</span>
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Gateway Modal */}
      {gatewayInvoice && (
        <PaymentGatewayModal
          isOpen={!!gatewayInvoice}
          onClose={() => setGatewayInvoice(null)}
          amount={gatewayInvoice.balanceRemaining}
          customerName={gatewayInvoice.customerName}
          customerMobile={gatewayInvoice.customerMobile}
          invoiceId={gatewayInvoice.id}
          invoiceNumber={gatewayInvoice.invoiceNumber}
          title={`Bill Payment: ${gatewayInvoice.invoiceNumber}`}
          onSuccess={handleGatewaySuccess}
        />
      )}
    </div>
  );
};
