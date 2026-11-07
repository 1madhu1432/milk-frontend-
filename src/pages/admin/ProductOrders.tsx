import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { ProductOrder } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  ShoppingCart,
  Search,
  CheckCircle2,
  Truck,
  Download,
  Calendar,
  Eye,
  Check,
} from 'lucide-react';

export const ProductOrders: React.FC = () => {
  const { productOrders, updateOrderStatus, routes } = useDairy();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [viewingOrder, setViewingOrder] = useState<ProductOrder | null>(null);

  const filteredOrders = productOrders.filter(o => {
    const matchesSearch =
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerMobile.includes(searchTerm);
    const matchesStatus = statusFilter === 'ALL' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExportCSV = () => {
    exportToCSV(productOrders, 'Customer_Product_Orders', [
      { key: 'id', label: 'Order ID' },
      { key: 'orderDate', label: 'Order Date' },
      { key: 'customerName', label: 'Customer' },
      { key: 'customerMobile', label: 'Mobile' },
      { key: 'routeId', label: 'Route ID' },
      { key: 'totalAmount', label: 'Total Value (₹)' },
      { key: 'status', label: 'Status' },
    ]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Household Product Orders
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {productOrders.length} Orders Placed
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Store purchases dispatched alongside daily milk deliveries and billed onto monthly statements
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
        >
          <Download className="w-3.5 h-3.5 text-slate-600" />
          <span>Export Orders</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search order ID, customer..."
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
            <option value="ALL">All Statuses</option>
            <option value="Confirmed">Confirmed / To Dispatch</option>
            <option value="Scheduled">Scheduled on Route</option>
            <option value="Delivered">Delivered & Billed</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
              <tr>
                <th className="px-4 py-3">Order ID</th>
                <th className="px-4 py-3">Order Date</th>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3">Items Ordered</th>
                <th className="px-4 py-3">Delivery Date</th>
                <th className="px-4 py-3 text-right">Order Total</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOrders.map(order => {
                const route = routes.find(r => r.id === order.routeId);
                return (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold font-mono text-slate-900">{order.id}</td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(order.orderDate)}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#17211B]">{order.customerName}</div>
                      <div className="text-[10px] text-slate-400">{order.customerMobile}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {route ? route.name.split(' - ')[0] : order.routeId}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {order.items.map(it => `${it.productName} (${it.quantity})`).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-slate-600">{formatDate(order.requestedDeliveryDate)}</td>
                    <td className="px-4 py-3 text-right font-extrabold text-[#14532D]">
                      {formatCurrency(order.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge
                        variant={
                          order.status === 'Delivered'
                            ? 'green'
                            : order.status === 'Confirmed'
                            ? 'blue'
                            : 'amber'
                        }
                      >
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        {order.status === 'Confirmed' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'Delivered')}
                            className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-[11px] font-bold flex items-center gap-1"
                            title="Mark Delivered & Added to Bill"
                          >
                            <Check className="w-3 h-3" /> Deliver
                          </button>
                        )}
                        <button
                          onClick={() => setViewingOrder(order)}
                          className="p-1 text-slate-400 hover:text-slate-700 rounded"
                          title="View Order Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {viewingOrder && (
        <Modal
          isOpen={!!viewingOrder}
          onClose={() => setViewingOrder(null)}
          title={`Order Details: ${viewingOrder.id}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
              <p><strong>Customer:</strong> {viewingOrder.customerName} ({viewingOrder.customerMobile})</p>
              <p><strong>Order Date:</strong> {formatDate(viewingOrder.orderDate)}</p>
              <p><strong>Delivery Date:</strong> {formatDate(viewingOrder.requestedDeliveryDate)}</p>
              <p><strong>Instructions:</strong> {viewingOrder.deliveryInstructions || 'Deliver with morning milk'}</p>
            </div>

            <table className="w-full text-left border">
              <thead className="bg-[#F7F9F7] border-b">
                <tr>
                  <th className="p-2">Item</th>
                  <th className="p-2 text-center">Qty</th>
                  <th className="p-2 text-right">Price</th>
                  <th className="p-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {viewingOrder.items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="p-2 font-medium">{it.productName}</td>
                    <td className="p-2 text-center">{it.quantity} {it.unit}</td>
                    <td className="p-2 text-right">{formatCurrency(it.unitPrice)}</td>
                    <td className="p-2 text-right font-bold">{formatCurrency(it.unitPrice * it.quantity)}</td>
                  </tr>
                ))}
                <tr className="bg-slate-50 font-bold">
                  <td colSpan={3} className="p-2 text-right">Grand Total:</td>
                  <td className="p-2 text-right text-emerald-800 font-extrabold">{formatCurrency(viewingOrder.totalAmount)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};
