import React, { useState, useMemo } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { Delivery } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  Truck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Printer,
  Download,
  Calendar,
  Check,
  DollarSign,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export const DailyDeliveries: React.FC = () => {
  const {
    deliveries,
    routes,
    employees,
    markDelivered,
    markMissed,
    markPartialDelivery,
  } = useDairy();

  const [dateFilter, setDateFilter] = useState(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (deliveries.some(d => d.date === todayStr)) return todayStr;
    if (deliveries.length > 0 && deliveries[0].date) return deliveries[0].date;
    return todayStr;
  });
  const [routeFilter, setRouteFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 25;

  // Action Modals
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [actionType, setActionType] = useState<'deliver' | 'miss' | 'partial' | null>(null);
  const [actionForm, setActionForm] = useState({
    actualQty: 1.0,
    reason: 'Door locked / Gate latched',
    notes: '',
    collectedAmount: 0,
    collectedMethod: 'Cash' as 'Cash' | 'UPI',
  });

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchesDate = d.date === dateFilter;
      const matchesRoute = routeFilter === 'ALL' || d.routeId === routeFilter;
      const matchesStatus = statusFilter === 'ALL' || d.status === statusFilter;
      const matchesSearch =
        d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customerMobile.includes(searchTerm);
      return matchesDate && matchesRoute && matchesStatus && matchesSearch;
    });
  }, [deliveries, dateFilter, routeFilter, statusFilter, searchTerm]);

  const totalPages = Math.ceil(filteredDeliveries.length / pageSize) || 1;
  const paginatedDeliveries = filteredDeliveries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Today's Aggregate Metrics
  const totalPlannedLitres = filteredDeliveries.reduce((acc, d) => acc + d.plannedMilkQuantity, 0);
  const totalActualLitres = filteredDeliveries.reduce((acc, d) => acc + d.actualMilkQuantity, 0);
  const deliveredCount = filteredDeliveries.filter(d => d.status === 'Delivered').length;
  const missedCount = filteredDeliveries.filter(d => d.status === 'Missed').length;
  const scheduledCount = filteredDeliveries.filter(d => d.status === 'Scheduled').length;

  const handleOpenAction = (del: Delivery, type: 'deliver' | 'miss' | 'partial') => {
    setSelectedDelivery(del);
    setActionType(type);
    setActionForm({
      actualQty: type === 'partial' ? Math.max(0.5, del.plannedMilkQuantity - 0.5) : del.plannedMilkQuantity,
      reason: type === 'miss' ? 'Gate Locked / No Answer' : '',
      notes: '',
      collectedAmount: 0,
      collectedMethod: 'Cash',
    });
  };

  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery || !actionType) return;

    if (actionType === 'deliver') {
      markDelivered(
        selectedDelivery.id,
        actionForm.actualQty,
        actionForm.notes,
        actionForm.collectedAmount,
        actionForm.collectedMethod
      );
    } else if (actionType === 'miss') {
      markMissed(selectedDelivery.id, actionForm.reason);
    } else if (actionType === 'partial') {
      markPartialDelivery(selectedDelivery.id, actionForm.actualQty, actionForm.reason);
    }

    setActionType(null);
    setSelectedDelivery(null);
  };

  const handleExportCSV = () => {
    exportToCSV(filteredDeliveries, `Deliveries_${dateFilter}`, [
      { key: 'id', label: 'Delivery ID' },
      { key: 'date', label: 'Date' },
      { key: 'customerId', label: 'Cust ID' },
      { key: 'customerName', label: 'Customer Name' },
      { key: 'routeName', label: 'Route' },
      { key: 'milkType', label: 'Milk Type' },
      { key: 'plannedMilkQuantity', label: 'Planned Qty' },
      { key: 'actualMilkQuantity', label: 'Delivered Qty' },
      { key: 'status', label: 'Status' },
      { key: 'exceptionReason', label: 'Reason' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Daily Home Deliveries Dispatch
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Live Fleet Log
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor route progress, mark doorstep deliveries, record missed stops, and collect cash
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[#F7F9F7] px-3 py-1.5 rounded-lg border border-slate-200 text-xs">
            <Calendar className="w-4 h-4 text-slate-500" />
            <span className="font-medium text-slate-600">Date:</span>
            <input
              type="date"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
              className="bg-transparent font-semibold text-slate-900 focus:outline-none"
            />
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Sheet</span>
          </button>
        </div>
      </div>

      {/* Aggregate Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase block">Total Planned Milk</span>
          <span className="text-xl font-extrabold text-slate-900">{formatNumber(totalPlannedLitres, 1)} Litres</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase block">Actual Delivered</span>
          <span className="text-xl font-extrabold text-[#14532D]">{formatNumber(totalActualLitres, 1)} Litres</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase block">Delivered Customers</span>
          <span className="text-xl font-extrabold text-emerald-700">{deliveredCount} Completed</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-400 font-bold uppercase block">Exceptions / Missed</span>
          <span className="text-xl font-extrabold text-rose-700">{missedCount} Exceptions</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, route..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16803D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={routeFilter}
            onChange={e => {
              setRouteFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Routes (1-5)</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Delivery Statuses</option>
            <option value="Delivered">Delivered</option>
            <option value="Scheduled">Scheduled / Pending</option>
            <option value="Partially delivered">Partially Delivered</option>
            <option value="Missed">Missed</option>
            <option value="Cancelled">Cancelled (Paused)</option>
          </select>
        </div>
      </div>

      {/* Deliveries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Delivery ID</th>
                <th className="px-4 py-3">Customer & Address</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Milk Type</th>
                <th className="px-4 py-3 text-center">Planned Qty</th>
                <th className="px-4 py-3 text-center">Actual Delivered</th>
                <th className="px-4 py-3">Additional Items</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Exceptions / Notes</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedDeliveries.map(del => (
                <tr key={del.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-slate-900">
                    {del.id.slice(-8)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-[#17211B]">{del.customerName}</div>
                    <div className="text-[10px] text-slate-400">{del.customerMobile}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-slate-600">
                    {del.routeName.split(' - ')[0]}
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">{del.milkType}</td>
                  <td className="px-4 py-3 text-center text-slate-600">{del.plannedMilkQuantity}L</td>
                  <td className="px-4 py-3 text-center font-bold text-[#14532D]">
                    {del.actualMilkQuantity}L
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {del.additionalProducts && del.additionalProducts.length > 0 ? (
                      del.additionalProducts.map(p => `${p.productName} (${p.actualQty})`).join(', ')
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <Badge
                      variant={
                        del.status === 'Delivered'
                          ? 'green'
                          : del.status === 'Scheduled'
                          ? 'blue'
                          : del.status === 'Partially delivered'
                          ? 'amber'
                          : 'red'
                      }
                    >
                      {del.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-slate-500 italic max-w-[180px] truncate">
                    {del.exceptionReason || del.deliveryNotes || '-'}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {del.status === 'Scheduled' || del.status === 'Partially delivered' ? (
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenAction(del, 'deliver')}
                          className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold"
                          title="Mark Delivered"
                        >
                          Delivered
                        </button>
                        <button
                          onClick={() => handleOpenAction(del, 'partial')}
                          className="px-2 py-1 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded text-[11px] font-semibold border border-amber-200"
                          title="Partial Delivery"
                        >
                          Partial
                        </button>
                        <button
                          onClick={() => handleOpenAction(del, 'miss')}
                          className="px-2 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-[11px] font-semibold border border-rose-200"
                          title="Mark Missed"
                        >
                          Missed
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleOpenAction(del, 'deliver')}
                        className="text-xs text-slate-500 hover:text-slate-800 font-semibold"
                      >
                        Edit Status
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-[#F7F9F7] text-xs text-slate-600">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, filteredDeliveries.length)} of{' '}
            {filteredDeliveries.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Action Dialog Modal */}
      {selectedDelivery && actionType && (
        <Modal
          isOpen={!!selectedDelivery}
          onClose={() => {
            setSelectedDelivery(null);
            setActionType(null);
          }}
          title={`Delivery Action: ${selectedDelivery.customerName}`}
          maxWidth="md"
        >
          <form onSubmit={handleConfirmAction} className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <p className="font-semibold text-slate-800">
                Planned: {selectedDelivery.plannedMilkQuantity}L {selectedDelivery.milkType}
              </p>
              <p className="text-[11px] text-slate-500">
                Route: {selectedDelivery.routeName}
              </p>
            </div>

            {actionType === 'deliver' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Actual Quantity Delivered (Litres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={actionForm.actualQty}
                    onChange={e => setActionForm({ ...actionForm, actualQty: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                  />
                </div>

                <div className="border-t pt-3 space-y-3">
                  <label className="block font-semibold text-slate-800">
                    Collected Cash / Payment at Doorstep (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Amount Collected (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={actionForm.collectedAmount}
                        onChange={e => setActionForm({ ...actionForm, collectedAmount: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-500 mb-1">Payment Method</label>
                      <select
                        value={actionForm.collectedMethod}
                        onChange={e => setActionForm({ ...actionForm, collectedMethod: e.target.value as any })}
                        className="w-full px-3 py-2 rounded-lg border border-slate-200"
                      >
                        <option value="Cash">Cash</option>
                        <option value="UPI">UPI (QR Code)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </>
            )}

            {actionType === 'partial' && (
              <>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">
                    Partial Quantity Delivered (Litres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={actionForm.actualQty}
                    onChange={e => setActionForm({ ...actionForm, actualQty: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-700 mb-1">Reason for Partial Quantity</label>
                  <input
                    type="text"
                    required
                    value={actionForm.reason}
                    onChange={e => setActionForm({ ...actionForm, reason: e.target.value })}
                    placeholder="e.g. Customer took only 0.5L today"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200"
                  />
                </div>
              </>
            )}

            {actionType === 'miss' && (
              <div>
                <label className="block font-medium text-slate-700 mb-1">Reason for Missed Delivery</label>
                <select
                  value={actionForm.reason}
                  onChange={e => setActionForm({ ...actionForm, reason: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 mb-2"
                >
                  <option value="Door locked & gate latched">Door locked & gate latched</option>
                  <option value="Customer asked to skip via phone call">Customer asked to skip via phone call</option>
                  <option value="Milk bag not hung outside">Milk bag not hung outside</option>
                  <option value="Dog barking / inaccessible porch">Dog barking / inaccessible porch</option>
                  <option value="Address not found / gate security denied entry">Security denied entry</option>
                </select>
              </div>
            )}

            <div>
              <label className="block font-medium text-slate-700 mb-1">Notes / Remarks</label>
              <input
                type="text"
                value={actionForm.notes}
                onChange={e => setActionForm({ ...actionForm, notes: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t">
              <button
                type="button"
                onClick={() => {
                  setSelectedDelivery(null);
                  setActionType(null);
                }}
                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold shadow-xs"
              >
                Save Delivery State
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
