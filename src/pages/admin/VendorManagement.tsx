import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { Vendor } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  Building2,
  Plus,
  CreditCard,
  Download,
  Phone,
  MapPin,
  Milk,
  Receipt,
  Eye,
  Edit,
  ArrowUpRight,
} from 'lucide-react';

export const VendorManagement: React.FC = () => {
  const { vendors, milkPurchases, vendorPayments, addVendor, updateVendor, addVendorPayment } = useDairy();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [viewingVendor, setViewingVendor] = useState<Vendor | null>(null);
  const [selectedVendorForPay, setSelectedVendorForPay] = useState<Vendor | null>(null);

  const [formData, setFormData] = useState<Partial<Vendor>>({
    name: '',
    contactNumber: '+91 9440',
    address: 'Medchal Dairy Cluster, Telangana',
    milkTypesSupplied: ['Cow Milk', 'Buffalo Milk'],
    defaultPurchaseRate: 42,
    paymentTerms: 'Weekly Settlement (Mondays)',
    openingBalance: 0,
    status: 'active',
    notes: '',
  });

  const [paymentData, setPaymentData] = useState({
    amount: 15000,
    paymentMethod: 'Bank Transfer' as const,
    referenceNo: 'NEFT-SBIN-',
    notes: 'Procurement settlement payout',
    date: new Date().toISOString().slice(0, 10),
  });

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      contactNumber: '+91 9440',
      address: '',
      milkTypesSupplied: ['Cow Milk', 'Buffalo Milk'],
      defaultPurchaseRate: 42,
      paymentTerms: 'Weekly Settlement',
      openingBalance: 0,
      status: 'active',
      notes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.contactNumber) {
      alert('Please fill vendor name and contact.');
      return;
    }

    addVendor({
      name: formData.name,
      contactNumber: formData.contactNumber,
      address: formData.address || '',
      milkTypesSupplied: formData.milkTypesSupplied || ['Cow Milk'],
      defaultPurchaseRate: formData.defaultPurchaseRate || 42,
      paymentTerms: formData.paymentTerms || 'Weekly',
      openingBalance: formData.openingBalance || 0,
      status: 'active',
      notes: formData.notes || '',
      totalMilkPurchased: 0,
      totalPurchaseValue: 0,
      totalAmountPaid: 0,
      purchaseReturns: 0,
      outstandingBalance: formData.openingBalance || 0,
    });
    alert('New vendor registered!');
    setIsAddModalOpen(false);
  };

  const handleRecordPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendorForPay || paymentData.amount <= 0) {
      alert('Please enter valid payment amount.');
      return;
    }

    addVendorPayment({
      vendorId: selectedVendorForPay.id,
      vendorName: selectedVendorForPay.name,
      date: paymentData.date,
      amount: Number(paymentData.amount),
      paymentMethod: paymentData.paymentMethod,
      referenceNo: paymentData.referenceNo,
      notes: paymentData.notes,
    });

    alert(`Payment of ${formatCurrency(paymentData.amount)} recorded for ${selectedVendorForPay.name}.`);
    setIsPaymentModalOpen(false);
  };

  const handleExportVendors = () => {
    exportToCSV(vendors, 'Harish_Dairy_Vendors_Statement', [
      { key: 'id', label: 'Vendor ID' },
      { key: 'name', label: 'Vendor Name' },
      { key: 'contactNumber', label: 'Phone' },
      { key: 'totalMilkPurchased', label: 'Total Litres Supplied' },
      { key: 'totalPurchaseValue', label: 'Total Invoiced Value (₹)' },
      { key: 'totalAmountPaid', label: 'Total Paid (₹)' },
      { key: 'outstandingBalance', label: 'Current Outstanding (₹)' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Milk Vendors & Farm Suppliers
            <span className="text-xs bg-blue-100 text-blue-800 font-semibold px-2.5 py-0.5 rounded-full">
              {vendors.length} Farm Sources
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage bulk milk procurement, contractual purchase rates, supplier ledgers, and payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportVendors}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Statements</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Vendor Cards List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {vendors.map(v => (
          <div
            key={v.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold border border-blue-100">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-[#17211B]">{v.name}</h3>
                    <p className="text-xs text-slate-400 font-mono">{v.id} • {v.paymentTerms}</p>
                  </div>
                </div>
                <Badge variant={v.outstandingBalance > 20000 ? 'amber' : 'green'}>
                  {v.status}
                </Badge>
              </div>

              <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{v.contactNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{v.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Milk className="w-3.5 h-3.5 text-slate-400" />
                  <span>Supplies: {v.milkTypesSupplied.join(', ')} • Base Rate: ₹{v.defaultPurchaseRate}/L</span>
                </div>
              </div>

              {/* Financial Ledger Summary Cards */}
              <div className="mt-5 grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Supplied
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatNumber(v.totalMilkPurchased)} L
                  </span>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-bold uppercase">
                    Invoiced
                  </span>
                  <span className="text-xs font-bold text-slate-900">
                    {formatCurrency(v.totalPurchaseValue)}
                  </span>
                </div>
                <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-100">
                  <span className="text-[10px] text-emerald-800 block font-bold uppercase">
                    Paid
                  </span>
                  <span className="text-xs font-bold text-emerald-800">
                    {formatCurrency(v.totalAmountPaid)}
                  </span>
                </div>
                <div className="p-2.5 bg-rose-50/70 rounded-xl border border-rose-100">
                  <span className="text-[10px] text-rose-800 block font-bold uppercase">
                    Due Balance
                  </span>
                  <span className="text-xs font-extrabold text-rose-700">
                    {formatCurrency(v.outstandingBalance)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => setViewingVendor(v)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>View Full Vendor Ledger</span>
              </button>

              <button
                onClick={() => {
                  setSelectedVendorForPay(v);
                  setIsPaymentModalOpen(true);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Record Payout</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Record Vendor Payment Modal */}
      {selectedVendorForPay && (
        <Modal
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          title={`Record Supplier Payment to ${selectedVendorForPay.name}`}
          maxWidth="md"
        >
          <form onSubmit={handleRecordPayment} className="space-y-4 text-xs">
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
              <p className="font-semibold">Current Balance Owed: {formatCurrency(selectedVendorForPay.outstandingBalance)}</p>
              <p className="text-[11px] text-amber-700 mt-0.5">Recording this payout will deduct immediately from the vendor's ledger balance.</p>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Amount (₹) *</label>
              <input
                type="number"
                required
                min="1"
                value={paymentData.amount}
                onChange={e => setPaymentData({ ...paymentData, amount: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold text-sm text-[#14532D]"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={paymentData.paymentMethod}
                onChange={e => setPaymentData({ ...paymentData, paymentMethod: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="UPI">UPI / Instant Transfer</option>
                <option value="Cheque">Cheque</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Reference / UTR / Cheque Number</label>
              <input
                type="text"
                value={paymentData.referenceNo}
                onChange={e => setPaymentData({ ...paymentData, referenceNo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Date</label>
              <input
                type="date"
                value={paymentData.date}
                onChange={e => setPaymentData({ ...paymentData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Notes / Remarks</label>
              <input
                type="text"
                value={paymentData.notes}
                onChange={e => setPaymentData({ ...paymentData, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold shadow-xs"
              >
                Confirm Payout
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Vendor Profile & Ledger Modal */}
      {viewingVendor && (
        <Modal
          isOpen={!!viewingVendor}
          onClose={() => setViewingVendor(null)}
          title={`Supplier Ledger: ${viewingVendor.name}`}
          maxWidth="4xl"
        >
          <div className="space-y-4 text-xs">
            {/* Summary */}
            <div className="p-4 bg-[#F7F9F7] rounded-xl border border-slate-200 grid grid-cols-4 gap-3 text-center">
              <div>
                <span className="text-slate-400 block font-bold">Total Milk Received</span>
                <span className="text-sm font-extrabold text-slate-900">{formatNumber(viewingVendor.totalMilkPurchased)} L</span>
              </div>
              <div>
                <span className="text-slate-400 block font-bold">Gross Invoiced Value</span>
                <span className="text-sm font-extrabold text-slate-900">{formatCurrency(viewingVendor.totalPurchaseValue)}</span>
              </div>
              <div>
                <span className="text-emerald-700 block font-bold">Total Settled</span>
                <span className="text-sm font-extrabold text-emerald-800">{formatCurrency(viewingVendor.totalAmountPaid)}</span>
              </div>
              <div>
                <span className="text-rose-700 block font-bold">Outstanding Payable</span>
                <span className="text-sm font-extrabold text-rose-700">{formatCurrency(viewingVendor.outstandingBalance)}</span>
              </div>
            </div>

            {/* Procurement history for this vendor */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Recent Milk Purchases Received</h4>
              <table className="w-full text-left border">
                <thead className="bg-[#F7F9F7] border-b">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Batch / Inv #</th>
                    <th className="p-2">Type</th>
                    <th className="p-2 text-right">Qty Received</th>
                    <th className="p-2 text-right">Rate</th>
                    <th className="p-2 text-right">Total (₹)</th>
                    <th className="p-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {milkPurchases
                    .filter(p => p.vendorId === viewingVendor.id)
                    .map(p => (
                      <tr key={p.id}>
                        <td className="p-2">{formatDate(p.date)}</td>
                        <td className="p-2 font-mono">{p.supplierInvoiceNo}</td>
                        <td className="p-2">{p.milkType}</td>
                        <td className="p-2 text-right font-bold">{p.acceptedQuantity}L</td>
                        <td className="p-2 text-right">₹{p.purchaseRatePerLitre}</td>
                        <td className="p-2 text-right font-bold">{formatCurrency(p.purchaseTotal)}</td>
                        <td className="p-2 text-center">
                          <Badge variant="green">{p.paymentStatus}</Badge>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>

            {/* Payout history for this vendor */}
            <div>
              <h4 className="font-bold text-slate-800 mb-2">Payments Released to Vendor</h4>
              <table className="w-full text-left border">
                <thead className="bg-[#F7F9F7] border-b">
                  <tr>
                    <th className="p-2">Date</th>
                    <th className="p-2">Payment ID</th>
                    <th className="p-2">Method</th>
                    <th className="p-2">Reference No</th>
                    <th className="p-2 text-right">Amount Paid</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {vendorPayments
                    .filter(vp => vp.vendorId === viewingVendor.id)
                    .map(vp => (
                      <tr key={vp.id}>
                        <td className="p-2">{formatDate(vp.date)}</td>
                        <td className="p-2 font-mono">{vp.id}</td>
                        <td className="p-2">{vp.paymentMethod}</td>
                        <td className="p-2 font-mono text-slate-500">{vp.referenceNo}</td>
                        <td className="p-2 text-right font-bold text-emerald-700">{formatCurrency(vp.amount)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </Modal>
      )}

      {/* Add Vendor Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Register New Milk Vendor / Farm"
        maxWidth="md"
      >
        <form onSubmit={handleSaveVendor} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Vendor / Farm Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Contact Phone *</label>
            <input
              type="text"
              required
              value={formData.contactNumber || ''}
              onChange={e => setFormData({ ...formData, contactNumber: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Farm Address / Location</label>
            <input
              type="text"
              value={formData.address || ''}
              onChange={e => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Base Rate / L (₹)</label>
              <input
                type="number"
                value={formData.defaultPurchaseRate || 42}
                onChange={e => setFormData({ ...formData, defaultPurchaseRate: parseFloat(e.target.value) || 42 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Opening Balance (₹)</label>
              <input
                type="number"
                value={formData.openingBalance || 0}
                onChange={e => setFormData({ ...formData, openingBalance: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Payment Settlement Terms</label>
            <input
              type="text"
              value={formData.paymentTerms || ''}
              onChange={e => setFormData({ ...formData, paymentTerms: e.target.value })}
              placeholder="e.g. Weekly on Mondays"
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold"
            >
              Save Vendor
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
