import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { CustomerPayment } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { PaymentGatewayModal } from '../../components/common/PaymentGatewayModal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  CreditCard,
  Plus,
  Printer,
  Download,
  Search,
  CheckCircle2,
  Calendar,
  DollarSign,
  User,
  Receipt,
  ShieldCheck,
  QrCode,
} from 'lucide-react';

export const PaymentManagement: React.FC = () => {
  const {
    customers,
    invoices,
    customerPayments,
    addCustomerPayment,
    currentUser,
  } = useDairy();

  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [printingPayment, setPrintingPayment] = useState<CustomerPayment | null>(null);

  // Gateway Modal State
  const [gatewayState, setGatewayState] = useState<{
    isOpen: boolean;
    amount: number;
    customerId: string;
    customerName: string;
    customerMobile?: string;
    invoiceId?: string;
    invoiceNumber?: string;
  } | null>(null);

  const handleGatewaySuccess = (paymentData: {
    paymentId: string;
    referenceNo: string;
    method: any;
    amount: number;
    date: string;
    notes?: string;
  }) => {
    if (!gatewayState) return;
    addCustomerPayment({
      customerId: gatewayState.customerId,
      customerName: gatewayState.customerName,
      date: paymentData.date,
      amount: paymentData.amount,
      paymentMethod: 'Payment Gateway (Online)',
      referenceNo: paymentData.referenceNo,
      invoiceId: gatewayState.invoiceId,
      recordedBy: currentUser.name,
      notes: paymentData.notes || `Collected via Payment Gateway Terminal`,
    });
    setGatewayState(null);
    setIsModalOpen(false);
  };

  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || 'CUST-1001',
    amount: 1800,
    paymentMethod: 'UPI' as CustomerPayment['paymentMethod'],
    referenceNo: `UPI/2026/${Math.floor(100000 + Math.random() * 900000)}`,
    invoiceId: '',
    date: new Date().toISOString().slice(0, 10),
    notes: 'Collected via Doorstep QR scan',
  });

  const handleOpenAdd = () => {
    const cust = customers[0] || { id: 'CUST-1001', outstandingBalance: 1800 };
    setFormData({
      customerId: cust.id,
      amount: cust.outstandingBalance > 0 ? cust.outstandingBalance : 1800,
      paymentMethod: 'UPI',
      referenceNo: `UPI/2026/${Math.floor(100000 + Math.random() * 900000)}`,
      invoiceId: '',
      date: new Date().toISOString().slice(0, 10),
      notes: 'Customer payment recorded',
    });
    setIsModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formData.customerId);
    if (!cust || formData.amount <= 0) {
      alert('Please enter valid customer and amount.');
      return;
    }

    addCustomerPayment({
      customerId: cust.id,
      customerName: cust.name,
      date: formData.date,
      amount: Number(formData.amount),
      paymentMethod: formData.paymentMethod,
      referenceNo: formData.referenceNo,
      invoiceId: formData.invoiceId || undefined,
      recordedBy: currentUser.name,
      notes: formData.notes,
    });

    alert(
      `Payment of ${formatCurrency(formData.amount)} received from ${cust.name}! Customer balance updated.`
    );
    setIsModalOpen(false);
  };

  const filteredPayments = customerPayments.filter(p => {
    const matchesSearch =
      p.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.referenceNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const totalCollected = filteredPayments.reduce((acc, p) => acc + p.amount, 0);

  const handleExportCSV = () => {
    exportToCSV(customerPayments, 'Customer_Collections_Register', [
      { key: 'id', label: 'Payment ID' },
      { key: 'date', label: 'Date' },
      { key: 'customerId', label: 'Customer ID' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'amount', label: 'Amount Collected (₹)' },
      { key: 'paymentMethod', label: 'Payment Method' },
      { key: 'referenceNo', label: 'Reference #' },
      { key: 'recordedBy', label: 'Collected By' },
      { key: 'notes', label: 'Remarks' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Payment Receipts & Collections Register
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {customerPayments.length} Receipts Issued
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log doorstep cash collections, UPI QR code transfers, and bank settlements
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Receipts</span>
          </button>

          <button
            onClick={() => {
              const cust = customers.find(c => c.outstandingBalance > 0) || customers[0];
              setGatewayState({
                isOpen: true,
                amount: cust.outstandingBalance > 0 ? cust.outstandingBalance : 1800,
                customerId: cust.id,
                customerName: cust.name,
                customerMobile: cust.mobile,
              });
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-lg shadow-sm transition-all"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-200" />
            <span>Open Gateway Terminal</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* Aggregate Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Collections in Filter</p>
            <p className="text-xl font-extrabold text-[#14532D]">{formatCurrency(totalCollected)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">UPI / Digital Share</p>
            <p className="text-xl font-extrabold text-blue-800">
              {formatCurrency(
                customerPayments.filter(p => p.paymentMethod === 'UPI').reduce((a, b) => a + b.amount, 0)
              )}
            </p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-amber-50 text-amber-700 rounded-lg">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Doorstep Cash Collected</p>
            <p className="text-xl font-extrabold text-amber-800">
              {formatCurrency(
                customerPayments.filter(p => p.paymentMethod === 'Cash').reduce((a, b) => a + b.amount, 0)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, reference #..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16803D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Payment Methods</option>
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Simulated Online">Simulated Online</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Receipt ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3 text-right">Amount Received</th>
                <th className="px-4 py-3">Payment Method</th>
                <th className="px-4 py-3">Reference / Tx No</th>
                <th className="px-4 py-3">Allocated Invoice</th>
                <th className="px-4 py-3">Collected By</th>
                <th className="px-4 py-3 text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold font-mono text-slate-900">{p.id}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(p.date)}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#17211B]">{p.customerName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{p.customerId}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-extrabold text-[#14532D]">
                    {formatCurrency(p.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                      {p.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-slate-600">{p.referenceNo}</td>
                  <td className="px-4 py-3 font-mono text-slate-500">
                    {p.invoiceId || 'Account Ledger'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">{p.recordedBy}</td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPrintingPayment(p)}
                      className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                      title="Print Money Receipt"
                    >
                      <Printer className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Record Customer Payment Receipt"
        maxWidth="md"
      >
        <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Customer *</label>
            <select
              value={formData.customerId}
              onChange={e => {
                const c = customers.find(cust => cust.id === e.target.value);
                setFormData({
                  ...formData,
                  customerId: e.target.value,
                  amount: c && c.outstandingBalance > 0 ? c.outstandingBalance : 1800,
                });
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            >
              {customers.slice(0, 50).map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id} - Dues: {formatCurrency(c.outstandingBalance)})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Amount Received (₹) *</label>
            <input
              type="number"
              required
              min="1"
              value={formData.amount}
              onChange={e => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 font-extrabold text-base text-[#14532D]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="UPI">UPI (GooglePay / PhonePe / Paytm)</option>
                <option value="Cash">Cash Collected</option>
                <option value="Bank Transfer">Bank Transfer (NEFT/IMPS)</option>
                <option value="Simulated Online">Simulated Online Payment</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Receipt Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reference / UTR / Cash Voucher No</label>
            <input
              type="text"
              required
              value={formData.referenceNo}
              onChange={e => setFormData({ ...formData, referenceNo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Link to Unpaid Invoice (Optional)</label>
            <select
              value={formData.invoiceId}
              onChange={e => setFormData({ ...formData, invoiceId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            >
              <option value="">General Account Credit</option>
              {invoices
                .filter(i => i.customerId === formData.customerId && i.balanceRemaining > 0)
                .map(inv => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoiceNumber} ({inv.monthLabel} - Due: {formatCurrency(inv.balanceRemaining)})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Notes / Collection Remarks</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                const c = customers.find(cust => cust.id === formData.customerId) || customers[0];
                const inv = invoices.find(i => i.id === formData.invoiceId);
                setGatewayState({
                  isOpen: true,
                  amount: formData.amount,
                  customerId: c.id,
                  customerName: c.name,
                  customerMobile: c.mobile,
                  invoiceId: inv?.id,
                  invoiceNumber: inv?.invoiceNumber,
                });
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white rounded-lg font-bold shadow-xs flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-200" />
              <span>Collect via Gateway ({formatCurrency(formData.amount)})</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-semibold shadow-xs"
            >
              Save Manual Entry
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Payment Money Receipt */}
      {printingPayment && (
        <Modal
          isOpen={!!printingPayment}
          onClose={() => setPrintingPayment(null)}
          title={`Money Receipt: ${printingPayment.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="border border-slate-300 p-6 rounded-xl bg-white space-y-3">
              <div className="text-center border-b pb-3">
                <h3 className="text-base font-bold text-slate-900">HARISH DAIRY</h3>
                <p className="text-[11px] text-slate-500">OFFICIAL MONEY RECEIPT & ACKNOWLEDGEMENT</p>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Receipt No:</span>
                  <span className="font-mono font-bold text-slate-900">{printingPayment.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date:</span>
                  <span>{formatDate(printingPayment.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Received From:</span>
                  <span className="font-bold text-slate-900">{printingPayment.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer ID:</span>
                  <span className="font-mono">{printingPayment.customerId}</span>
                </div>
                <div className="flex justify-between border-t border-b py-2 my-2 font-bold text-sm">
                  <span>Amount Received:</span>
                  <span className="text-emerald-800 font-extrabold">{formatCurrency(printingPayment.amount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Payment Mode:</span>
                  <span className="font-medium">{printingPayment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Reference / Tx ID:</span>
                  <span className="font-mono">{printingPayment.referenceNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Recorded By:</span>
                  <span>{printingPayment.recordedBy}</span>
                </div>
              </div>

              <div className="pt-4 border-t text-center text-[10px] text-slate-400">
                This is a computer-generated money receipt from Harish Dairy Operations.
              </div>
            </div>

            <div className="flex justify-end no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Receipt</span>
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Payment Gateway Modal */}
      {gatewayState && (
        <PaymentGatewayModal
          isOpen={gatewayState.isOpen}
          onClose={() => setGatewayState(null)}
          amount={gatewayState.amount}
          customerName={gatewayState.customerName}
          customerMobile={gatewayState.customerMobile}
          invoiceId={gatewayState.invoiceId}
          invoiceNumber={gatewayState.invoiceNumber}
          title="Payment Gateway Terminal"
          onSuccess={handleGatewaySuccess}
        />
      )}
    </div>
  );
};
