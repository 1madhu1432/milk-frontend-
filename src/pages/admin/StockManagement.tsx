import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { StockTransaction } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatNumber, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  Boxes,
  Plus,
  AlertTriangle,
  Download,
  Milk,
  RotateCcw,
  CheckCircle2,
  Trash2,
  Sliders,
  History,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

export const StockManagement: React.FC = () => {
  const {
    currentStock,
    stockTransactions,
    products,
    adjustStock,
    currentUser,
  } = useDairy();

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('ALL');

  const [adjustData, setAdjustData] = useState({
    itemType: 'Cow Milk',
    quantity: 10,
    isDeduction: false,
    isWastage: false,
    reason: 'Physical dip-stick calibration adjustment',
  });

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalQty = adjustData.isDeduction
      ? -Math.abs(Number(adjustData.quantity))
      : Math.abs(Number(adjustData.quantity));

    const result = adjustStock(
      adjustData.itemType,
      finalQty,
      adjustData.reason,
      adjustData.isWastage
    );

    if (!result.success) {
      alert(`Error: ${result.message}`);
      return;
    }

    alert('Stock adjustment saved and logged successfully!');
    setIsAdjustModalOpen(false);
  };

  const filteredTransactions = stockTransactions.filter(tx => {
    if (filterType === 'ALL') return true;
    return tx.type === filterType;
  });

  const handleExportCSV = () => {
    exportToCSV(stockTransactions, 'Inventory_Movement_Ledger', [
      { key: 'id', label: 'TX ID' },
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Transaction Type' },
      { key: 'milkTypeOrProduct', label: 'Commodity' },
      { key: 'quantity', label: 'Movement Qty' },
      { key: 'sourceOrDestination', label: 'Source / Destination' },
      { key: 'responsibleUser', label: 'Responsible Staff' },
      { key: 'notes', label: 'Notes' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Chilling Plant Stock & Inventory Control
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Real-time Reconciliation
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor bulk insulated silos, route dispatches, packing spoilage, and finished product stock
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Movements</span>
          </button>

          <button
            onClick={() => setIsAdjustModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Sliders className="w-4 h-4" />
            <span>Record Adjustment / Wastage</span>
          </button>
        </div>
      </div>

      {/* Raw Milk Storage Tanks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Tank 1: Cow Milk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-50 text-blue-700 rounded-xl border border-blue-100">
                  <Milk className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211B]">
                    Insulated Silo 1 — Pure Cow Milk
                  </h3>
                  <p className="text-xs text-slate-400">Chilled at 3.8°C • Capacity: 800 Litres</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-[#EAF7EE] text-[#14532D] rounded-full border border-emerald-200">
                Active Chilling
              </span>
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Available Balance</span>
                <p className="text-3xl font-extrabold text-[#14532D]">{currentStock.cowMilk} Litres</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase">Daily Requirement</span>
                <p className="text-xl font-bold text-slate-700">~380 Litres</p>
              </div>
            </div>

            {/* Tank Capacity Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentStock.cowMilk / 800) * 100)}%` }}
                  className="bg-blue-600 h-full rounded-full transition-all"
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0 L</span>
                <span>{Math.round((currentStock.cowMilk / 800) * 100)}% Tank Fill</span>
                <span>800 L Max</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tank 2: Buffalo Milk */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100">
                  <Milk className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#17211B]">
                    Insulated Silo 2 — Creamy Buffalo Milk
                  </h3>
                  <p className="text-xs text-slate-400">Chilled at 4.0°C • Capacity: 600 Litres</p>
                </div>
              </div>
              <span className="px-2.5 py-1 text-xs font-bold bg-[#EAF7EE] text-[#14532D] rounded-full border border-emerald-200">
                Active Chilling
              </span>
            </div>

            <div className="mt-6 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Available Balance</span>
                <p className="text-3xl font-extrabold text-[#14532D]">{currentStock.buffaloMilk} Litres</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 font-semibold uppercase">Daily Requirement</span>
                <p className="text-xl font-bold text-slate-700">~305 Litres</p>
              </div>
            </div>

            {/* Tank Capacity Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, (currentStock.buffaloMilk / 600) * 100)}%` }}
                  className="bg-emerald-600 h-full rounded-full transition-all"
                ></div>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                <span>0 L</span>
                <span>{Math.round((currentStock.buffaloMilk / 600) * 100)}% Tank Fill</span>
                <span>600 L Max</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Finished Dairy Products Inventory Sub-Section */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-[#17211B] mb-3">
          Manufactured Dairy Products Inventory (Cold Storage & Pantry)
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {products.map(p => {
            const isLow = p.availableStock <= p.minimumStock;
            return (
              <div
                key={p.id}
                className={`p-3 rounded-xl border text-center transition-all ${
                  isLow
                    ? 'border-rose-200 bg-rose-50/50'
                    : 'border-slate-100 bg-[#F7F9F7]'
                }`}
              >
                <span className="text-2xl block mb-1">{p.image}</span>
                <p className="font-bold text-xs text-slate-900 truncate">{p.name}</p>
                <p className="text-[11px] text-slate-500 font-medium">{p.unitOrPackageSize}</p>
                <div className="mt-2 flex items-center justify-center gap-1.5">
                  <span className={`text-sm font-extrabold ${isLow ? 'text-rose-700' : 'text-emerald-800'}`}>
                    {p.availableStock}
                  </span>
                  <span className="text-[10px] text-slate-400">/ min {p.minimumStock}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stock Transactions Log */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 bg-[#F7F9F7]">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-slate-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Inventory Movement Audit Log
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              className="px-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-white"
            >
              <option value="ALL">All Types</option>
              <option value="Purchase Receipt">Purchase Receipts</option>
              <option value="Route Allocation">Route Dispatches</option>
              <option value="Wastage">Wastage / Spillage</option>
              <option value="Adjustment">Manual Adjustments</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-white text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Tx ID</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Commodity</th>
                <th className="px-4 py-3 text-right">Movement Quantity</th>
                <th className="px-4 py-3">Source / Destination</th>
                <th className="px-4 py-3">Staff / Auditor</th>
                <th className="px-4 py-3">Audit Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map(tx => {
                const isPositive = tx.quantity > 0;
                return (
                  <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-slate-900">{tx.id}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(tx.date)}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-700">
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{tx.milkTypeOrProduct}</td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <span
                        className={`font-bold flex items-center justify-end gap-1 ${
                          isPositive ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                        {isPositive ? `+${tx.quantity}` : tx.quantity} {tx.unit}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[200px]">
                      {tx.sourceOrDestination}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{tx.responsibleUser}</td>
                    <td className="px-4 py-3 text-slate-500 italic max-w-[220px] truncate">{tx.notes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Stock Adjustment / Wastage Modal */}
      <Modal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        title="Record Stock Adjustment or Spoilage Wastage"
        maxWidth="md"
      >
        <form onSubmit={handleAdjustSubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
            <p className="font-semibold">Inventory Accounting Safety Rule</p>
            <p className="text-[11px] text-amber-700 mt-0.5">
              The system prevents silent negative balances. If a deduction exceeds current storage balance, it will be rejected.
            </p>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Item *</label>
            <select
              value={adjustData.itemType}
              onChange={e => setAdjustData({ ...adjustData, itemType: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            >
              <option value="Cow Milk">Cow Milk (Raw Chilled Silo)</option>
              <option value="Buffalo Milk">Buffalo Milk (Raw Chilled Silo)</option>
              {products.map(p => (
                <option key={p.id} value={p.name}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Action Direction</label>
              <select
                value={adjustData.isDeduction ? 'deduct' : 'add'}
                onChange={e =>
                  setAdjustData({
                    ...adjustData,
                    isDeduction: e.target.value === 'deduct',
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="deduct">Deduct / Wastage (-)</option>
                <option value="add">Add Inward Surplus (+)</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">Quantity</label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                required
                value={adjustData.quantity}
                onChange={e => setAdjustData({ ...adjustData, quantity: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={adjustData.isWastage}
                onChange={e => setAdjustData({ ...adjustData, isWastage: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span className="font-medium text-slate-700">Mark explicitly as packaging wastage / spoilage</span>
            </label>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reason / Calibration Observation *</label>
            <input
              type="text"
              required
              value={adjustData.reason}
              onChange={e => setAdjustData({ ...adjustData, reason: e.target.value })}
              placeholder="e.g. Broken pouch seal during bottling"
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsAdjustModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold shadow-xs"
            >
              Apply Adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
