import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { StatCard } from '../../components/common/StatCard';
import { Badge } from '../../components/common/Badge';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import {
  Users,
  Milk,
  Truck,
  ShoppingCart,
  Receipt,
  CreditCard,
  AlertTriangle,
  Building2,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Boxes,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const {
    customers,
    routes,
    vendors,
    deliveries,
    milkPurchases,
    products,
    productOrders,
    invoices,
    customerPayments,
    notificationLogs,
    currentStock,
  } = useDairy();

  const [dateFilter, setDateFilter] = useState('2026-10-10');

  // Dynamic calculations from shared state
  const totalCustomers = (customers || []).length;
  const activeCustomers = (customers || []).filter(c => c.status === 'active').length;
  const pausedCustomers = (customers || []).filter(c => c.status === 'paused').length;

  const todayPurchases = (milkPurchases || []).filter(p => p.date === dateFilter);
  const totalPurchasedToday =
    todayPurchases.length > 0
      ? todayPurchases.reduce((acc, p) => acc + (p.acceptedQuantity || 0), 0)
      : (milkPurchases || []).slice(0, 2).reduce((acc, p) => acc + (p.acceptedQuantity || 0), 0);

  const dateDeliveries = (deliveries || []).filter(d => d.date === dateFilter);
  const activeDeliveries = dateDeliveries.length > 0 ? dateDeliveries : (deliveries || []);

  const totalDeliveredToday = activeDeliveries
    .filter(d => d.status === 'Delivered' || d.status === 'Partially delivered')
    .reduce((acc, d) => acc + (d.actualMilkQuantity || 0), 0);

  const milkRequiredToday = activeDeliveries
    .filter(d => d.status !== 'Not required' && d.status !== 'Cancelled')
    .reduce((acc, d) => acc + (d.plannedMilkQuantity || 0), 0);

  const fulfillmentPercentage =
    milkRequiredToday > 0 ? Math.round((totalDeliveredToday / milkRequiredToday) * 100) : 94;

  const deliveryProductSales = activeDeliveries.reduce((acc, d) => {
    const prodTotal = (d.additionalProducts || []).reduce(
      (pAcc, p) => pAcc + (p.actualQty || 0) * (p.unitPrice || 0),
      0
    );
    return acc + prodTotal;
  }, 0);

  const orderProductSales = (productOrders || [])
    .filter(o => o.orderDate === dateFilter || o.requestedDeliveryDate === dateFilter)
    .reduce((acc, o) => acc + (o.totalAmount || 0), 0);

  const todayProductSales = deliveryProductSales + orderProductSales;

  const currentMonthInvoices = (invoices || []).filter(i => i.month === '2026-10');
  const currentMonthBilling = currentMonthInvoices.reduce((acc, i) => acc + (i.totalPayable || 0), 0);
  const paymentsCollectedTotal = (customerPayments || []).reduce((acc, p) => acc + (p.amount || 0), 0);

  const totalCustomerOutstanding = (customers || []).reduce(
    (acc, c) => acc + (c.outstandingBalance || 0),
    0
  );
  const totalVendorOutstanding = (vendors || []).reduce(
    (acc, v) => acc + (v.outstandingBalance || 0),
    0
  );

  const lowStockProducts = (products || []).filter(p => (p.availableStock || 0) <= (p.minimumStock || 0));

  // Chart data: Procurement vs Consumption (Last 5 days)
  const procurementVsConsumptionData = [
    { date: '06 Oct', procured: 740, delivered: 685 },
    { date: '07 Oct', procured: 760, delivered: 690 },
    { date: '08 Oct', procured: 755, delivered: 680 },
    { date: '09 Oct', procured: 770, delivered: 695 },
    { date: '10 Oct', procured: totalPurchasedToday, delivered: Math.round(totalDeliveredToday) },
  ];

  // Route wise delivery data computed from live deliveries
  const routeProgressData = (routes || []).map(r => {
    const rDeliveries = activeDeliveries.filter(d => d.routeId === r.id);
    return {
      name: (r.name || '').split(' - ')[0],
      delivered: rDeliveries.filter(d => d.status === 'Delivered').length,
      pending: rDeliveries.filter(d => d.status === 'Scheduled' || d.status === 'Partially delivered').length,
      missed: rDeliveries.filter(d => d.status === 'Missed' || d.status === 'Cancelled').length,
    };
  });

  const totalSiloStock = (currentStock?.cowMilk || 0) + (currentStock?.buffaloMilk || 0);

  return (
    <div className="space-y-6 font-sans">
      {/* Top Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-[#14532D] to-slate-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Dispatch Center
              </span>
              <span className="text-xs text-slate-300">Hyderabad Metro Logistics</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Good Morning, Operations Lead 🥛
            </h1>
            <p className="text-xs text-emerald-100 max-w-xl">
              5 routes active across Banjara Hills, Jubilee Hills, Madhapur, Gachibowli & Kondapur. Chilled silos operating at 3.8°C nominal.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-white/15 text-xs text-white">
              <Calendar className="w-4 h-4 text-emerald-300" />
              <span className="font-semibold text-slate-200">Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={() => navigate('/admin/deliveries')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-4 py-2 rounded-2xl text-xs font-extrabold shadow-md transition-all group"
            >
              <Truck className="w-4 h-4" />
              <span>Today's Dispatch</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Shortcuts Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Morning Dispatch', icon: Truck, to: '/admin/deliveries', color: 'from-emerald-600 to-green-700' },
          { label: 'Gateway Terminal', icon: ShieldCheck, to: '/admin/payments', color: 'from-teal-600 to-emerald-700' },
          { label: 'Monthly Billing', icon: Receipt, to: '/admin/billing', color: 'from-blue-600 to-indigo-700' },
          { label: 'Inward QC Intake', icon: Milk, to: '/admin/purchases', color: 'from-slate-700 to-slate-900' },
        ].map(act => {
          const Icon = act.icon;
          return (
            <button
              key={act.label}
              onClick={() => navigate(act.to)}
              className="bg-white hover:bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-3 transition-all group shadow-card-hover text-left"
            >
              <div className={`p-2.5 rounded-xl bg-gradient-to-br ${act.color} text-white shadow-xs group-hover:scale-105 transition-transform`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 leading-tight group-hover:text-emerald-800 transition-colors">
                  {act.label}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Quick Access</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* KPI Summary Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Customers"
          value={totalCustomers}
          subtitle={`${activeCustomers} active • ${pausedCustomers} paused`}
          icon={Users}
          variant="green"
          trend={{ value: '100% active circuit', isPositive: true }}
          onClick={() => navigate('/admin/customers')}
        />

        <StatCard
          title="Milk Purchased Today"
          value={`${formatNumber(totalPurchasedToday)} L`}
          subtitle={`Cow & Buffalo Milk batches`}
          icon={Milk}
          variant="blue"
          trend={{ value: 'QC Accepted', isPositive: true }}
          onClick={() => navigate('/admin/purchases')}
        />

        <StatCard
          title="Milk Required / Planned"
          value={`${formatNumber(milkRequiredToday)} L`}
          subtitle={`Across 5 delivery routes`}
          icon={Truck}
          variant="slate"
          onClick={() => navigate('/admin/routes')}
        />

        <StatCard
          title="Total Delivered Today"
          value={`${formatNumber(totalDeliveredToday, 1)} L`}
          subtitle={`Morning route fulfillment`}
          icon={CheckCircle2}
          variant="green"
          trend={{ value: `${fulfillmentPercentage}% Met`, isPositive: fulfillmentPercentage >= 85 }}
          onClick={() => navigate('/admin/deliveries')}
        />

        <StatCard
          title="Today's Product Sales"
          value={formatCurrency(todayProductSales)}
          subtitle="Paneer, Curd, Ghee, Makhan"
          icon={ShoppingCart}
          variant="green"
          trend={{ value: 'Add-on items', isPositive: true }}
          onClick={() => navigate('/admin/orders')}
        />

        <StatCard
          title="Current-Month Billing"
          value={formatCurrency(currentMonthBilling)}
          subtitle="October 2026 MTD Invoices"
          icon={Receipt}
          variant="amber"
          onClick={() => navigate('/admin/billing')}
        />

        <StatCard
          title="Customer Outstanding"
          value={formatCurrency(totalCustomerOutstanding)}
          subtitle="Uncollected household dues"
          icon={CreditCard}
          variant="amber"
          onClick={() => navigate('/admin/payments')}
        />

        <StatCard
          title="Vendor Outstanding"
          value={formatCurrency(totalVendorOutstanding)}
          subtitle="Payable to 2 farm suppliers"
          icon={Building2}
          variant="red"
          onClick={() => navigate('/admin/vendors')}
        />
      </div>

      {/* Stock warning banner if any */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500 text-white rounded-xl shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-950 uppercase tracking-wider">
                Low-Stock Threshold Alert ({lowStockProducts.length} Items Need Restock)
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {lowStockProducts.map(p => `${p.name} (${p.availableStock} units remaining)`).join(', ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/products')}
            className="text-xs font-bold text-amber-900 hover:text-amber-950 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-xl transition-colors flex items-center gap-1"
          >
            <span>Restock Catalogue</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Milk Procurement vs Consumption */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs shadow-card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Daily Milk Procurement vs Consumption (Litres)
              </h3>
              <p className="text-xs text-slate-400">
                Bulk purchased from vendors vs home doorstep deliveries
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/60 rounded-full">
              5-Day Spread
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={procurementVsConsumptionData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <Tooltip
                  formatter={(value: any) => [`${value} Litres`, '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#E2E8F0', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="procured" fill="#0284C7" name="Procured (L)" radius={[6, 6, 0, 0]} />
                <Bar dataKey="delivered" fill="#15803D" name="Delivered (L)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Route-wise Delivery Progress */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs shadow-card-hover">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Route-wise Delivery Progress (Today)
              </h3>
              <p className="text-xs text-slate-400">
                Fulfillment performance across all 5 delivery circuits
              </p>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200/60 rounded-full">
              Routes 1 – 5
            </span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeProgressData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#E2E8F0" />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748B' }} width={70} stroke="#E2E8F0" />
                <Tooltip contentStyle={{ borderRadius: '12px', fontSize: '12px', borderColor: '#E2E8F0' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="delivered" stackId="a" fill="#15803D" name="Delivered" radius={[0, 0, 0, 0]} />
                <Bar dataKey="pending" stackId="a" fill="#F59E0B" name="Pending" />
                <Bar dataKey="missed" stackId="a" fill="#E11D48" name="Missed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Sections Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route-wise Requirements */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Route Milk Requirements
              </h3>
              <button
                onClick={() => navigate('/admin/routes')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View Routes
              </button>
            </div>

            <div className="space-y-2.5">
              {routes.map(r => (
                <div
                  key={r.id}
                  className="p-3 bg-[#F8FAF9] rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{r.name}</h4>
                    <p className="text-[11px] text-slate-500">
                      {r.assignedCustomerCount} customers • {r.area}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-[#14532D]">
                      {r.totalMilkRequired} Litres
                    </p>
                    <span className="text-[10px] text-emerald-700 font-bold">
                      {r.completionPercentage}% Done
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Vendor Milk Procurement & Tank Silos */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900">
                Chilled Silos & Suppliers
              </h3>
              <button
                onClick={() => navigate('/admin/vendors')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View Vendors
              </button>
            </div>

            {/* Chilled Tanks Gauge */}
            <div className="p-3.5 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 rounded-2xl border border-emerald-100 mb-3 space-y-2.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Silo Chilling Tanks: {totalSiloStock} L
                </span>
                <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">
                  @ 3.8°C Nominal
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Cow Silo</span>
                  <span className="text-sm font-black text-emerald-800">{currentStock.cowMilk} L</span>
                </div>
                <div className="bg-white p-2 rounded-xl border border-emerald-100 text-center">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Buffalo Silo</span>
                  <span className="text-sm font-black text-emerald-800">{currentStock.buffaloMilk} L</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {vendors.map(v => (
                <div
                  key={v.id}
                  className="p-3 bg-[#F8FAF9] rounded-2xl border border-slate-100 space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{v.name}</h4>
                      <p className="text-[10px] text-slate-400">{v.contactNumber}</p>
                    </div>
                    <Badge variant={v.outstandingBalance > 30000 ? 'red' : 'amber'}>
                      Due: {formatCurrency(v.outstandingBalance)}
                    </Badge>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-600 border-t border-slate-200/50 pt-1">
                    <span>Supplied: <strong>{formatNumber(v.totalMilkPurchased)} L</strong></span>
                    <span>Paid: <strong>{formatCurrency(v.totalAmountPaid)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent WhatsApp Notification Attempts */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Bill Reminders</span>
              </h3>
              <button
                onClick={() => navigate('/admin/notifications')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View Logs
              </button>
            </div>

            <p className="text-[11px] text-slate-400 mb-2.5">
              Automated simulated dispatch of month-end invoice reminders
            </p>

            <div className="space-y-2">
              {notificationLogs.slice(0, 4).map(log => (
                <div
                  key={log.id}
                  className="p-2.5 bg-[#F8FAF9] rounded-2xl border border-slate-100 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <p className="font-bold text-slate-900 truncate">{log.customerName}</p>
                    <p className="text-[10px] text-slate-500">
                      Bill {log.billingMonth} • {formatCurrency(log.amountDue)}
                    </p>
                  </div>
                  <Badge
                    variant={
                      log.status === 'Delivered'
                        ? 'green'
                        : log.status === 'Sent'
                        ? 'blue'
                        : 'red'
                    }
                  >
                    {log.status}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/admin/notifications')}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100 text-emerald-900 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 border border-emerald-200/60"
            >
              <span>Broadcast Month-End WhatsApp Invoices</span>
              <ArrowRight className="w-3.5 h-3.5 text-emerald-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
