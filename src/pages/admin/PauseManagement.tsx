import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { PauseRequest } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatDate } from '../../utils/formatters';
import {
  PauseCircle,
  PlayCircle,
  Plus,
  Check,
  X,
  Search,
  Filter,
  Calendar,
  AlertCircle,
  Clock,
} from 'lucide-react';

export const PauseManagement: React.FC = () => {
  const { customers, pauseRequests, addPauseRequest, updatePauseStatus, routes } = useDairy();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    customerId: customers[0]?.id || 'CUST-1001',
    startDate: '2026-10-15',
    endDate: '2026-10-20',
    reason: 'Family out of station / Festival travel',
    adminNotes: 'Requested via WhatsApp customer helpline',
  });

  const handleOpenAdd = () => {
    setFormData({
      customerId: customers[0]?.id || 'CUST-1001',
      startDate: '2026-10-15',
      endDate: '2026-10-20',
      reason: 'Out of town travel',
      adminNotes: '',
    });
    setIsAddModalOpen(true);
  };

  const handleCreatePause = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find(c => c.id === formData.customerId);
    if (!cust) return;

    addPauseRequest({
      customerId: cust.id,
      customerName: cust.name,
      routeId: cust.assignedRouteId,
      startDate: formData.startDate,
      endDate: formData.endDate,
      reason: formData.reason,
      adminNotes: formData.adminNotes,
    });

    alert(`Pause request logged for ${cust.name}!`);
    setIsAddModalOpen(false);
  };

  const filteredRequests = pauseRequests.filter(req => {
    const matchesSearch =
      req.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.customerId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingCount = pauseRequests.filter(p => p.status === 'Pending').length;
  const approvedCount = pauseRequests.filter(p => p.status === 'Approved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Subscription Pause & Vacation Requests
            <span className="text-xs bg-amber-100 text-amber-800 font-semibold px-2.5 py-0.5 rounded-full">
              {pendingCount} Pending Review
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatic exclusion from delivery route lists, procurement calculations, and monthly bills
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Customer Pause</span>
        </button>
      </div>

      {/* Info notice about billing and dispatch cutoff */}
      <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-4 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <Clock className="w-5 h-5 text-emerald-700" />
          <div>
            <p className="font-bold text-emerald-950">Daily Route Pause Cutoff: 9:00 PM</p>
            <p className="text-emerald-800">
              Approved pauses automatically update morning route sheets and deduct unconsumed days from month-end customer invoices.
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
            placeholder="Search customer, ID..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16803D]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700"
          >
            <option value="ALL">All Statuses ({pauseRequests.length})</option>
            <option value="Pending">Pending ({pendingCount})</option>
            <option value="Approved">Approved Active ({approvedCount})</option>
            <option value="Rejected">Rejected</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Customer Name</th>
                <th className="px-4 py-3">Assigned Route</th>
                <th className="px-4 py-3">Pause Period</th>
                <th className="px-4 py-3">Reason</th>
                <th className="px-4 py-3">Requested On</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Admin Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.map(req => {
                const route = routes.find(r => r.id === req.routeId);
                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold font-mono text-slate-900">{req.id}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#17211B]">{req.customerName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{req.customerId}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {route ? route.name.split(' - ')[0] : req.routeId}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-800">
                      {formatDate(req.startDate)} → {formatDate(req.endDate)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 italic max-w-[200px] truncate">
                      {req.reason}
                    </td>
                    <td className="px-4 py-3 text-slate-500">{formatDate(req.requestDate)}</td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          req.status === 'Approved'
                            ? 'green'
                            : req.status === 'Pending'
                            ? 'amber'
                            : 'red'
                        }
                      >
                        {req.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {req.status === 'Pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updatePauseStatus(req.id, 'Approved', 'Approved by Operations')}
                            className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-md text-[11px] font-bold flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => updatePauseStatus(req.id, 'Rejected', 'Cutoff missed')}
                            className="px-2.5 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md text-[11px] font-semibold border border-rose-200"
                          >
                            <X className="w-3 h-3" />
                            <span>Reject</span>
                          </button>
                        </div>
                      ) : req.status === 'Approved' ? (
                        <button
                          onClick={() => updatePauseStatus(req.id, 'Cancelled', 'Cancelled early by customer request')}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-semibold"
                        >
                          Resume Early
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Pause Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Milk Delivery Pause"
        maxWidth="md"
      >
        <form onSubmit={handleCreatePause} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Select Customer *</label>
            <select
              value={formData.customerId}
              onChange={e => setFormData({ ...formData, customerId: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            >
              {customers.slice(0, 50).map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.id} - {c.area})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Pause Start Date *</label>
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Pause End Date *</label>
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Reason for Pause</label>
            <input
              type="text"
              required
              value={formData.reason}
              onChange={e => setFormData({ ...formData, reason: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Internal Admin Notes</label>
            <input
              type="text"
              value={formData.adminNotes}
              onChange={e => setFormData({ ...formData, adminNotes: e.target.value })}
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
              Confirm Pause Period
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
