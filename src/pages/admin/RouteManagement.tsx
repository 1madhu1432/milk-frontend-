import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { Route } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatNumber, formatDate } from '../../utils/formatters';
import {
  MapPin,
  Plus,
  Printer,
  Users,
  Truck,
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const RouteManagement: React.FC = () => {
  const { routes, employees, customers, deliveries, addRoute, updateRoute } = useDairy();

  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);

  const [formData, setFormData] = useState<Partial<Route>>({
    name: '',
    area: '',
    assignedEmployeeIds: ['EMP-01'],
  });

  const handleOpenPrint = (route: Route) => {
    setSelectedRoute(route);
    setIsPrintModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Delivery Routes & Clusters
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              5 Core Distribution Circuits
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Optimize morning distribution across 500 customers and print delivery run-sheets
          </p>
        </div>

        <button
          onClick={() => {
            setEditingRoute(null);
            setFormData({ name: `Route ${routes.length + 1} - New Area`, area: 'New Area', assignedEmployeeIds: ['EMP-01'] });
            setIsEditModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Create Route</span>
        </button>
      </div>

      {/* Routes Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {routes.map(r => {
          const routeDeliveries = deliveries.filter(d => d.routeId === r.id);
          const assignedEmps = employees.filter(e => r.assignedEmployeeIds.includes(e.id));
          const routeCustCount = customers.filter(c => c.assignedRouteId === r.id).length;

          return (
            <div
              key={r.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-xl bg-[#EAF7EE] text-[#16803D] border border-emerald-100">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#17211B]">{r.name}</h3>
                      <p className="text-xs text-slate-400">{r.area}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    {r.completionPercentage}% Done
                  </span>
                </div>

                {/* Assigned Drivers */}
                <div className="mt-4 flex items-center justify-between text-xs text-slate-600 bg-[#F7F9F7] p-2.5 rounded-xl border border-slate-100">
                  <span className="text-slate-400 font-medium">Assigned Delivery:</span>
                  <span className="font-bold text-slate-800">
                    {assignedEmps.map(e => e.name).join(', ') || 'Unassigned'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${r.completionPercentage}%` }}
                      className="bg-[#16803D] h-full"
                    ></div>
                    <div
                      style={{
                        width: `${Math.round(
                          (r.pendingDeliveries / (r.completedDeliveries + r.pendingDeliveries + r.missedDeliveries || 1)) * 100
                        )}%`,
                      }}
                      className="bg-amber-400 h-full"
                    ></div>
                    <div
                      style={{
                        width: `${Math.round(
                          (r.missedDeliveries / (r.completedDeliveries + r.pendingDeliveries + r.missedDeliveries || 1)) * 100
                        )}%`,
                      }}
                      className="bg-rose-500 h-full"
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>
                      {r.completedDeliveries} Delivered
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                      {r.pendingDeliveries} Pending
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                      {r.missedDeliveries} Missed
                    </span>
                  </div>
                </div>

                {/* Key Numbers */}
                <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      Households
                    </span>
                    <span className="text-sm font-extrabold text-slate-800">
                      {routeCustCount}
                    </span>
                  </div>
                  <div className="p-2.5 bg-[#EAF7EE]/60 rounded-xl border border-emerald-100">
                    <span className="text-[10px] text-emerald-800 block uppercase font-bold">
                      Milk Required
                    </span>
                    <span className="text-sm font-extrabold text-[#14532D]">
                      {r.totalMilkRequired} Litres
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleOpenPrint(r)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-[#EAF7EE] hover:bg-emerald-100 rounded-lg transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Route Sheet</span>
                </button>

                <button
                  onClick={() => {
                    setEditingRoute(r);
                    setFormData(r);
                    setIsEditModalOpen(true);
                  }}
                  className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Edit Route
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Printable Route Delivery Sheet Modal */}
      {selectedRoute && (
        <Modal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={`Printable Route Delivery Sheet: ${selectedRoute.name}`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-[#F7F9F7] p-4 rounded-xl border no-print">
              <p className="text-xs text-slate-600">
                Generated run-sheet for delivery boy morning route. Includes addresses, quantities, products and signature columns.
              </p>
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-bold rounded-lg shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>Print Route Manifest</span>
              </button>
            </div>

            {/* Print Document Content */}
            <div className="p-6 bg-white border border-slate-200 rounded-xl space-y-4 font-sans text-xs">
              <div className="border-b-2 border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 uppercase">
                    Harish Dairy — Morning Delivery Manifest
                  </h2>
                  <p className="text-xs text-slate-600">
                    Route: {selectedRoute.name} • Area: {selectedRoute.area}
                  </p>
                  <p className="text-xs text-slate-600">
                    Assigned Staff: {employees.find(e => selectedRoute.assignedEmployeeIds.includes(e.id))?.name || 'Staff'} ({employees.find(e => selectedRoute.assignedEmployeeIds.includes(e.id))?.phone})
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-sm">Date: 10-Oct-2026</p>
                  <p className="text-slate-500">Dispatch Time: 05:00 AM</p>
                  <p className="font-bold text-emerald-800">Total Milk: {selectedRoute.totalMilkRequired} Litres</p>
                </div>
              </div>

              {/* Customers Run Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-300 bg-slate-50 font-bold">
                      <th className="p-2 border">#</th>
                      <th className="p-2 border">Cust ID</th>
                      <th className="p-2 border">Customer & Address</th>
                      <th className="p-2 border">Mobile</th>
                      <th className="p-2 border text-center">Milk Qty</th>
                      <th className="p-2 border">Extra Products</th>
                      <th className="p-2 border text-center">Status</th>
                      <th className="p-2 border text-center">Delivered Qty</th>
                      <th className="p-2 border">Customer Sign / Remarks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter(c => c.assignedRouteId === selectedRoute.id)
                      .slice(0, 30) // Preview first 30 for sheet
                      .map((cust, idx) => (
                        <tr key={cust.id} className="border-b border-slate-200">
                          <td className="p-2 border font-bold text-slate-500">{idx + 1}</td>
                          <td className="p-2 border font-mono">{cust.id}</td>
                          <td className="p-2 border">
                            <span className="font-bold text-slate-900">{cust.name}</span>
                            <span className="block text-[10px] text-slate-500">
                              {cust.houseNo}, {cust.street}, {cust.landmark}
                            </span>
                          </td>
                          <td className="p-2 border whitespace-nowrap">{cust.mobile}</td>
                          <td className="p-2 border text-center font-bold">
                            {cust.status === 'paused' ? 'PAUSED' : `${cust.dailyQuantity}L (${cust.milkType})`}
                          </td>
                          <td className="p-2 border text-slate-600">
                            {idx % 5 === 0 ? 'Paneer 200g (1)' : idx % 8 === 0 ? 'Dahi 500g (2)' : '-'}
                          </td>
                          <td className="p-2 border text-center">
                            {cust.status === 'paused' ? '[  ] Paused' : '[  ] Delivered'}
                          </td>
                          <td className="p-2 border text-center">_______ L</td>
                          <td className="p-2 border text-slate-300">_________________</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Route Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={editingRoute ? `Edit Route: ${editingRoute.name}` : 'Create New Route'}
        maxWidth="md"
      >
        <form
          onSubmit={e => {
            e.preventDefault();
            if (editingRoute) {
              updateRoute(editingRoute.id, formData);
              alert('Route updated!');
            } else {
              addRoute({
                name: formData.name || 'New Route',
                area: formData.area || 'Hyderabad Locality',
                assignedEmployeeIds: formData.assignedEmployeeIds || ['EMP-01'],
                assignedCustomerCount: 0,
                totalMilkRequired: 0,
                totalAdditionalProducts: 0,
                completedDeliveries: 0,
                pendingDeliveries: 0,
                missedDeliveries: 0,
                completionPercentage: 0,
              });
              alert('Route created!');
            }
            setIsEditModalOpen(false);
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block font-medium text-slate-700 mb-1">Route Name</label>
            <input
              type="text"
              required
              value={formData.name || ''}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Area / Localities Covered</label>
            <input
              type="text"
              required
              value={formData.area || ''}
              onChange={e => setFormData({ ...formData, area: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Assign Delivery Staff</label>
            <select
              value={formData.assignedEmployeeIds?.[0] || 'EMP-01'}
              onChange={e => setFormData({ ...formData, assignedEmployeeIds: [e.target.value] })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} ({emp.phone})
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold"
            >
              Save Route
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
