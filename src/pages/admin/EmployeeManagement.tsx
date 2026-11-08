import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { Employee } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Plus, Edit, UserCheck, Phone, Mail, Calendar, Truck, CreditCard } from 'lucide-react';

export const EmployeeManagement: React.FC = () => {
  const { employees, routes, customers, addEmployee, updateEmployee } = useDairy();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);
  const [formData, setFormData] = useState<Partial<Employee>>({
    name: '',
    phone: '+91 98480 ',
    email: '',
    assignedRouteIds: ['ROUTE-1'],
    joiningDate: new Date().toISOString().slice(0, 10),
    status: 'active',
  });

  const handleOpenAdd = () => {
    setEditingEmp(null);
    setFormData({
      name: '',
      phone: '+91 98480 ',
      email: '',
      assignedRouteIds: ['ROUTE-1'],
      joiningDate: new Date().toISOString().slice(0, 10),
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (emp: Employee) => {
    setEditingEmp(emp);
    setFormData(emp);
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill name and phone.');
      return;
    }

    if (editingEmp) {
      updateEmployee(editingEmp.id, formData);
      alert('Employee details updated!');
    } else {
      addEmployee({
        name: formData.name!,
        phone: formData.phone!,
        email: formData.email || `${formData.name!.toLowerCase().replace(/\s+/g, '')}@dairynexa.com`,
        assignedRouteIds: formData.assignedRouteIds || ['ROUTE-1'],
        joiningDate: formData.joiningDate || '2026-10-10',
        status: formData.status as any || 'active',
        dailyDeliveriesCompleted: 0,
        missedDeliveries: 0,
        collectionsRecorded: 0,
      });
      alert('New delivery staff registered!');
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Delivery Staff & Route Fleet
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {employees.length} Staff Members
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage field delivery boys, assigned routes, customer counts, and collection targets
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Delivery Staff</span>
        </button>
      </div>

      {/* Employees Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {employees.map(emp => {
          const assignedRoutes = routes.filter(r => emp.assignedRouteIds.includes(r.id));
          const assignedCustomerCount = customers.filter(c =>
            emp.assignedRouteIds.includes(c.assignedRouteId)
          ).length;

          return (
            <div
              key={emp.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EAF7EE] text-[#16803D] flex items-center justify-center font-bold text-base border border-emerald-100">
                      {emp.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#17211B]">{emp.name}</h3>
                      <p className="text-xs text-slate-400 font-mono">{emp.id}</p>
                    </div>
                  </div>
                  <Badge variant={emp.status === 'active' ? 'green' : 'amber'}>
                    {emp.status}
                  </Badge>
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{emp.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Joined: {formatDate(emp.joiningDate)}</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                    Assigned Delivery Routes
                  </label>
                  <div className="flex flex-wrap gap-1.5">
                    {assignedRoutes.length > 0 ? (
                      assignedRoutes.map(r => (
                        <span
                          key={r.id}
                          className="px-2 py-1 bg-emerald-50 text-emerald-800 text-[11px] font-semibold rounded-md border border-emerald-100"
                        >
                          {r.name.split(' - ')[0]}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400 italic">No routes assigned</span>
                    )}
                  </div>
                </div>

                {/* Metrics */}
                <div className="mt-4 grid grid-cols-3 gap-2 p-3 bg-[#F7F9F7] rounded-xl border border-slate-100 text-center">
                  <div>
                    <span className="text-[10px] text-slate-500 block">Households</span>
                    <span className="text-xs font-bold text-slate-900">
                      {assignedCustomerCount}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Deliveries</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {emp.dailyDeliveriesCompleted}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-500 block">Cash Collected</span>
                    <span className="text-xs font-bold text-slate-900">
                      {formatCurrency(emp.collectionsRecorded)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => handleOpenEdit(emp)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Staff / Routes</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEmp ? `Edit Staff: ${editingEmp.name}` : 'Register Delivery Employee'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Phone Number *</label>
            <input
              type="text"
              required
              value={formData.phone || ''}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email || ''}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Assign Routes (Hold Ctrl/Cmd to select multiple)
            </label>
            <select
              multiple
              value={formData.assignedRouteIds || []}
              onChange={e => {
                const selected = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, assignedRouteIds: selected });
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 h-28"
            >
              {routes.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Joining Date</label>
              <input
                type="date"
                value={formData.joiningDate || ''}
                onChange={e => setFormData({ ...formData, joiningDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold shadow-xs"
            >
              Save Employee
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
