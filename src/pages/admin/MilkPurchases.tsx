import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { MilkPurchase } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  Milk,
  Plus,
  Printer,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  DollarSign,
  AlertCircle,
} from 'lucide-react';

export const MilkPurchases: React.FC = () => {
  const { vendors, milkPurchases, addMilkPurchase } = useDairy();

  const [searchTerm, setSearchTerm] = useState('');
  const [vendorFilter, setVendorFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [printingPurchase, setPrintingPurchase] = useState<MilkPurchase | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    vendorId: vendors[0]?.id || 'VEND-01',
    date: new Date().toISOString().slice(0, 10),
    supplierInvoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
    milkType: 'Cow Milk' as 'Cow Milk' | 'Buffalo Milk',
    quantityPurchased: 450,
    acceptedQuantity: 440,
    rejectedQuantity: 10,
    purchaseRatePerLitre: 42,
    additionalCharges: 100,
    amountPaid: 15000,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Completed' as MilkPurchase['paymentStatus'],
    notes: 'Morning fresh procurement batch',
  });

  const calculatedTotal =
    formData.acceptedQuantity * formData.purchaseRatePerLitre + formData.additionalCharges;

  const handleOpenAdd = () => {
    const defaultVendor = vendors[0] || { id: 'VEND-01', name: 'Vendor', defaultPurchaseRate: 42 };
    setFormData({
      vendorId: defaultVendor.id,
      date: new Date().toISOString().slice(0, 10),
      supplierInvoiceNo: `INV-${Math.floor(1000 + Math.random() * 9000)}`,
      milkType: 'Cow Milk',
      quantityPurchased: 450,
      acceptedQuantity: 440,
      rejectedQuantity: 10,
      purchaseRatePerLitre: defaultVendor.defaultPurchaseRate || 42,
      additionalCharges: 100,
      amountPaid: 15000,
      paymentMethod: 'Bank Transfer',
      paymentStatus: 'Completed',
      notes: 'Morning intake tested for SNF and fat content',
    });
    setIsAddModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const vendor = vendors.find(v => v.id === formData.vendorId);
    if (!vendor) return;

    addMilkPurchase({
      vendorId: vendor.id,
      vendorName: vendor.name,
      date: formData.date,
      supplierInvoiceNo: formData.supplierInvoiceNo,
      milkType: formData.milkType,
      quantityPurchased: Number(formData.quantityPurchased),
      acceptedQuantity: Number(formData.acceptedQuantity),
      rejectedQuantity: Number(formData.rejectedQuantity),
      purchaseRatePerLitre: Number(formData.purchaseRatePerLitre),
      additionalCharges: Number(formData.additionalCharges),
      purchaseTotal: calculatedTotal,
      amountPaid: Number(formData.amountPaid),
      paymentMethod: formData.paymentMethod,
      paymentStatus: formData.paymentStatus,
      notes: formData.notes,
    });

    alert(
      `Purchase entry created! Stock increased by ${formData.acceptedQuantity}L of ${formData.milkType}, and vendor ledger updated.`
    );
    setIsAddModalOpen(false);
  };

  const filteredPurchases = milkPurchases.filter(p => {
    const matchesSearch =
      p.vendorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.supplierInvoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesVendor = vendorFilter === 'ALL' || p.vendorId === vendorFilter;
    return matchesSearch && matchesVendor;
  });

  const totalProcuredL = filteredPurchases.reduce((acc, p) => acc + p.acceptedQuantity, 0);
  const totalSpend = filteredPurchases.reduce((acc, p) => acc + p.purchaseTotal, 0);
  const totalRejectedL = filteredPurchases.reduce((acc, p) => acc + p.rejectedQuantity, 0);

  const handleExportCSV = () => {
    exportToCSV(milkPurchases, 'Milk_Purchases_Log', [
      { key: 'id', label: 'Purchase ID' },
      { key: 'date', label: 'Date' },
      { key: 'vendorName', label: 'Vendor' },
      { key: 'supplierInvoiceNo', label: 'Supplier Invoice #' },
      { key: 'milkType', label: 'Milk Type' },
      { key: 'acceptedQuantity', label: 'Accepted Litres' },
      { key: 'rejectedQuantity', label: 'Rejected Litres' },
      { key: 'purchaseRatePerLitre', label: 'Rate/L' },
      { key: 'purchaseTotal', label: 'Purchase Total (₹)' },
      { key: 'amountPaid', label: 'Amount Paid (₹)' },
      { key: 'paymentStatus', label: 'Status' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Raw Milk Procurement & Inward Intake
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {milkPurchases.length} Batches
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record morning & evening farm milk reception, quality QC inspection, and supplier billing
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Record Milk Purchase</span>
          </button>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg">
            <Milk className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Accepted Milk</p>
            <p className="text-xl font-extrabold text-[#17211B]">{formatNumber(totalProcuredL)} Litres</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">Total Procurement Value</p>
            <p className="text-xl font-extrabold text-emerald-800">{formatCurrency(totalSpend)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-rose-50 text-rose-700 rounded-lg">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-medium">QC Rejection / Returned</p>
            <p className="text-xl font-extrabold text-rose-700">{formatNumber(totalRejectedL)} Litres</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by invoice #, vendor..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16803D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={vendorFilter}
            onChange={e => setVendorFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Farm Vendors</option>
            {vendors.map(v => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Purchases Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Purchase ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Supplier & Invoice</th>
                <th className="px-4 py-3">Milk Type</th>
                <th className="px-4 py-3 text-right">Inward Qty</th>
                <th className="px-4 py-3 text-right">Accepted Qty</th>
                <th className="px-4 py-3 text-right">Rejected</th>
                <th className="px-4 py-3 text-right">Rate/L</th>
                <th className="px-4 py-3 text-right">Total Payable</th>
                <th className="px-4 py-3 text-right">Paid</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPurchases.map(p => (
                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{p.id}</td>
                  <td className="px-4 py-3 text-slate-600">{formatDate(p.date)}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#17211B]">{p.vendorName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">Inv: {p.supplierInvoiceNo}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-medium">
                      {p.milkType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right text-slate-500">{p.quantityPurchased}L</td>
                  <td className="px-4 py-3 text-right font-extrabold text-emerald-800">
                    {p.acceptedQuantity}L
                  </td>
                  <td className="px-4 py-3 text-right text-rose-600 font-medium">
                    {p.rejectedQuantity > 0 ? `${p.rejectedQuantity}L` : '-'}
                  </td>
                  <td className="px-4 py-3 text-right">₹{p.purchaseRatePerLitre}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    {formatCurrency(p.purchaseTotal)}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-emerald-700">
                    {formatCurrency(p.amountPaid)}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge variant="green">{p.paymentStatus}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => setPrintingPurchase(p)}
                      className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded"
                      title="Print Inward Receipt"
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

      {/* Record Purchase Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Record Raw Milk Inward Purchase"
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Select Farm Vendor *</label>
              <select
                value={formData.vendorId}
                onChange={e => {
                  const vend = vendors.find(v => v.id === e.target.value);
                  setFormData({
                    ...formData,
                    vendorId: e.target.value,
                    purchaseRatePerLitre: vend?.defaultPurchaseRate || 42,
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                {vendors.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.name} (Base Rate: ₹{v.defaultPurchaseRate})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Reception Date</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={e => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Supplier Challan / Invoice #</label>
              <input
                type="text"
                required
                value={formData.supplierInvoiceNo}
                onChange={e => setFormData({ ...formData, supplierInvoiceNo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Milk Type</label>
              <select
                value={formData.milkType}
                onChange={e => setFormData({ ...formData, milkType: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="Cow Milk">Cow Milk</option>
                <option value="Buffalo Milk">Buffalo Milk</option>
              </select>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Purchased Qty (L)</label>
              <input
                type="number"
                min="1"
                value={formData.quantityPurchased}
                onChange={e => {
                  const qty = parseFloat(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    quantityPurchased: qty,
                    acceptedQuantity: Math.max(0, qty - formData.rejectedQuantity),
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Rejected Qty (L)</label>
              <input
                type="number"
                min="0"
                value={formData.rejectedQuantity}
                onChange={e => {
                  const rej = parseFloat(e.target.value) || 0;
                  setFormData({
                    ...formData,
                    rejectedQuantity: rej,
                    acceptedQuantity: Math.max(0, formData.quantityPurchased - rej),
                  });
                }}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Accepted Inward (L)</label>
              <input
                type="number"
                readOnly
                value={formData.acceptedQuantity}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-emerald-50 text-emerald-900 font-bold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Rate per Litre (₹)</label>
              <input
                type="number"
                value={formData.purchaseRatePerLitre}
                onChange={e => setFormData({ ...formData, purchaseRatePerLitre: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Additional Charges (Freight)</label>
              <input
                type="number"
                value={formData.additionalCharges}
                onChange={e => setFormData({ ...formData, additionalCharges: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Calculated Total</label>
              <div className="px-3 py-2 bg-slate-100 rounded-lg font-extrabold text-[#14532D] text-sm">
                {formatCurrency(calculatedTotal)}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Amount Paid Immediately (₹)</label>
              <input
                type="number"
                value={formData.amountPaid}
                onChange={e => setFormData({ ...formData, amountPaid: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Payment Method</label>
              <select
                value={formData.paymentMethod}
                onChange={e => setFormData({ ...formData, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="UPI">UPI</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Intake Notes / Quality Remarks</label>
            <input
              type="text"
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
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
              className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold shadow-xs"
            >
              Confirm Purchase & Update Stock
            </button>
          </div>
        </form>
      </Modal>

      {/* Printable Purchase Inward Receipt */}
      {printingPurchase && (
        <Modal
          isOpen={!!printingPurchase}
          onClose={() => setPrintingPurchase(null)}
          title={`Inward Milk Receipt: ${printingPurchase.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="border border-slate-300 p-6 rounded-xl bg-white space-y-3">
              <div className="text-center border-b pb-3">
                <h3 className="text-base font-bold text-slate-900">HARISH DAIRY</h3>
                <p className="text-[11px] text-slate-500">RAW MILK INWARD & QC ACCEPTANCE VOUCHER</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <p><strong>Receipt #:</strong> {printingPurchase.id}</p>
                <p><strong>Date:</strong> {formatDate(printingPurchase.date)}</p>
                <p><strong>Farm Supplier:</strong> {printingPurchase.vendorName}</p>
                <p><strong>Supplier Inv #:</strong> {printingPurchase.supplierInvoiceNo}</p>
                <p><strong>Milk Type:</strong> {printingPurchase.milkType}</p>
                <p><strong>Payment Status:</strong> {printingPurchase.paymentStatus}</p>
              </div>

              <table className="w-full text-left border mt-2">
                <thead className="bg-slate-50 border-b">
                  <tr>
                    <th className="p-1.5 border">Parameter</th>
                    <th className="p-1.5 border text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-1.5 border">Supplied Quantity</td>
                    <td className="p-1.5 border text-right">{printingPurchase.quantityPurchased} Litres</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border">Rejected / Returned (Temperature / Acidity)</td>
                    <td className="p-1.5 border text-right text-rose-700">{printingPurchase.rejectedQuantity} Litres</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border font-bold">Net Accepted Quantity</td>
                    <td className="p-1.5 border text-right font-bold text-emerald-800">{printingPurchase.acceptedQuantity} Litres</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border">Contractual Purchase Rate</td>
                    <td className="p-1.5 border text-right">₹{printingPurchase.purchaseRatePerLitre} / L</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border">Freight & Charges</td>
                    <td className="p-1.5 border text-right">{formatCurrency(printingPurchase.additionalCharges)}</td>
                  </tr>
                  <tr className="bg-slate-50 font-bold">
                    <td className="p-1.5 border">Gross Purchase Payable</td>
                    <td className="p-1.5 border text-right">{formatCurrency(printingPurchase.purchaseTotal)}</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border">Amount Paid On Reception</td>
                    <td className="p-1.5 border text-right text-emerald-800">{formatCurrency(printingPurchase.amountPaid)}</td>
                  </tr>
                  <tr className="font-bold text-rose-800">
                    <td className="p-1.5 border">Carried to Supplier Balance</td>
                    <td className="p-1.5 border text-right">{formatCurrency(printingPurchase.purchaseTotal - printingPurchase.amountPaid)}</td>
                  </tr>
                </tbody>
              </table>

              <div className="pt-4 flex justify-between text-[11px] text-slate-500">
                <span>Receiver QC Signature: ____________</span>
                <span>Tanker Driver Signature: ____________</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 no-print">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Voucher</span>
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
