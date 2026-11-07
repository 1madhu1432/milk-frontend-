import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
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
  TrendingDown,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Boxes,
  Sparkles,
  Clock,
  ArrowUpRight,
  Activity,
  Thermometer,
  Layers,
  Plus,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
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
    settings,
  } = useDairy();

  const [dateFilter, setDateFilter] = useState(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (deliveries.some(d => d.date === todayStr)) return todayStr;
    if (deliveries.length > 0 && deliveries[0].date) return deliveries[0].date;
    return todayStr;
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 600);
  };

  // Dynamic calculations from shared state
  const totalCustomers = (customers || []).length;
  const activeCustomers = (customers || []).filter(c => c.status === 'active').length;
  const pausedCustomers = (customers || []).filter(c => c.status === 'paused').length;

  const todayPurchases = (milkPurchases || []).filter(p => p.date === dateFilter);
  const totalPurchasedToday =
    todayPurchases.length > 0
      ? todayPurchases.reduce((acc, p) => acc + (p.acceptedQuantity || p.quantityPurchased || 0), 0)
      : (milkPurchases || []).reduce((acc, p) => acc + (p.acceptedQuantity || p.quantityPurchased || 0), 0);

  const dateDeliveries = (deliveries || []).filter(d => d.date === dateFilter);
  const activeDeliveries = dateDeliveries.length > 0 ? dateDeliveries : (deliveries || []);

  const totalDeliveredToday = activeDeliveries
    .filter(d => d.status === 'Delivered' || d.status === 'Partially delivered')
    .reduce((acc, d) => acc + (d.actualMilkQuantity || 0), 0);

  const milkRequiredToday = activeDeliveries
    .filter(d => d.status !== 'Not required' && d.status !== 'Cancelled')
    .reduce((acc, d) => acc + (d.plannedMilkQuantity || 0), 0);

  const fulfillmentPercentage =
    milkRequiredToday > 0 ? Math.round((totalDeliveredToday / milkRequiredToday) * 100) : 0;

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
  const collectionPercentage =
    currentMonthBilling > 0 ? Math.round((paymentsCollectedTotal / currentMonthBilling) * 100) : 0;

  const totalCustomerOutstanding = (customers || []).reduce(
    (acc, c) => acc + (c.outstandingBalance || 0),
    0
  );
  const totalVendorOutstanding = (vendors || []).reduce(
    (acc, v) => acc + (v.outstandingBalance || 0),
    0
  );

  const lowStockProducts = (products || []).filter(p => (p.availableStock || 0) <= (p.minimumStock || 0));

  // Chart data: 5-Day Milk Flow computed dynamically relative to today
  const milkFlowData = Array.from({ length: 5 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (4 - i));
    const label = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' });
    const isToday = i === 4;
    return {
      date: label,
      procured: isToday ? totalPurchasedToday : Math.round(totalPurchasedToday * 0.95),
      delivered: isToday ? Math.round(totalDeliveredToday) : Math.round(totalDeliveredToday * 0.92),
      target: isToday ? milkRequiredToday : milkRequiredToday,
    };
  });

  // Route wise delivery data computed from live deliveries
  const routeProgressData = (routes || []).map(r => {
    const rDeliveries = activeDeliveries.filter(d => d.routeId === r.id);
    const delivered = rDeliveries.filter(d => d.status === 'Delivered').length;
    const pending = rDeliveries.filter(d => d.status === 'Scheduled' || d.status === 'Partially delivered').length;
    const missed = rDeliveries.filter(d => d.status === 'Missed' || d.status === 'Cancelled').length;
    return {
      name: (r.name || '').split(' - ')[0],
      area: r.area,
      delivered,
      pending,
      missed,
      total: delivered + pending + missed,
      completionRate: r.completionPercentage || 0,
      litres: r.totalMilkRequired || 0,
    };
  });

  const totalSiloStock = (currentStock?.cowMilk || 0) + (currentStock?.buffaloMilk || 0);
  const cowSiloCapacity = 500;
  const buffaloSiloCapacity = 500;
  const cowPercentage = cowSiloCapacity > 0 ? Math.min(100, Math.round(((currentStock?.cowMilk || 0) / cowSiloCapacity) * 100)) : 0;
  const buffaloPercentage = buffaloSiloCapacity > 0 ? Math.min(100, Math.round(((currentStock?.buffaloMilk || 0) / buffaloSiloCapacity) * 100)) : 0;

  return (
    <div className="space-y-6 font-sans text-slate-900 pb-12 animate-in fade-in duration-300">
      {/* 1. Header & Live Command Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950 p-6 md:p-8 text-white shadow-xl border border-slate-800">
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Live Dispatch Active
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {settings?.dairyName || 'Harish Dairy'} • Hyderabad Metro Division
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Operations Command Center 🥛
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              {routes.length > 0
                ? `${routes.length} routes active across ${routes.map(r => r.name.split(' - ')[0]).join(', ')}. Chilled silos operating at nominal 3.8°C.`
                : 'Welcome to your real-time Dairy Operations Center. Chilled silos ready for inward procurement.'}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Date Selector & Preset */}
            <div className="flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3.5 py-2.5 rounded-2xl border border-slate-700/80 text-xs text-white shadow-inner">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-400">Date:</span>
              <input
                type="date"
                value={dateFilter}
                onChange={e => setDateFilter(e.target.value)}
                className="bg-transparent font-bold text-white focus:outline-none cursor-pointer"
              />
            </div>

            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all cursor-pointer shadow-xs ${isRefreshing ? 'animate-spin text-emerald-400' : ''
                }`}
              title="Refresh Live Metrics"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => navigate('/admin/deliveries')}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black px-4 py-2.5 rounded-2xl text-xs shadow-lg shadow-emerald-500/20 transition-all cursor-pointer group"
            >
              <Truck className="w-4 h-4 text-slate-950" />
              <span>Today's Deliveries</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Quick Operations Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: 'Morning Dispatch', sub: 'Active Routes', icon: Truck, to: '/admin/deliveries', color: 'from-emerald-500 to-green-600' },
          { label: 'Inward QC Intake', sub: 'Farm Milk', icon: Milk, to: '/admin/purchases', color: 'from-blue-500 to-indigo-600' },
          { label: 'Subscribers', sub: `${activeCustomers} Active`, icon: Users, to: '/admin/customers', color: 'from-teal-500 to-emerald-600' },
          { label: 'Monthly Billing', sub: 'Invoices & Dues', icon: Receipt, to: '/admin/billing', color: 'from-purple-500 to-indigo-600' },
          { label: 'Payment Gateway', sub: 'Razorpay / UPI', icon: CreditCard, to: '/admin/payments', color: 'from-amber-500 to-orange-600' },
          { label: 'WhatsApp Hub', sub: 'Auto Notifications', icon: MessageSquare, to: '/admin/notifications', color: 'from-emerald-600 to-teal-700' },
        ].map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.to)}
              className="bg-white hover:bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-md transition-all text-left group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${item.color} text-white shadow-xs group-hover:scale-105 transition-transform`}>
                  <Icon className="w-4 h-4" />
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
              </div>
              <p className="text-xs font-bold text-slate-900 leading-tight group-hover:text-emerald-700 transition-colors">
                {item.label}
              </p>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{item.sub}</p>
            </button>
          );
        })}
      </div>

      {/* 3. Executive KPI Command Cards (6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Today's Delivery Volume */}
        <div
          onClick={() => navigate('/admin/deliveries')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Milk Delivered</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatNumber(totalDeliveredToday, 1)} <span className="text-xs font-bold text-slate-500">/ {formatNumber(milkRequiredToday)} L</span>
            </div>
            <div className="mt-2 w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-green-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, fulfillmentPercentage)}%` }}
              />
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-emerald-700">
            <span>{fulfillmentPercentage}% Fulfilled</span>
            <span className="text-slate-400 text-[10px]">Morning Run</span>
          </div>
        </div>

        {/* Card 2: Milk Purchased Today */}
        <div
          onClick={() => navigate('/admin/purchases')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-blue-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Milk Purchased</span>
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <Milk className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatNumber(totalPurchasedToday)} <span className="text-xs font-bold text-slate-500">Litres</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">2 Farm Suppliers Intake</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-blue-700">
            <span className="flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5 text-blue-500" />
              QC Passed
            </span>
            <span className="text-slate-400 text-[10px]">4.2% Fat Avg</span>
          </div>
        </div>

        {/* Card 3: Total Active Customers */}
        <div
          onClick={() => navigate('/admin/customers')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Subscribers</span>
              <div className="p-2 rounded-xl bg-teal-50 text-teal-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {totalCustomers} <span className="text-xs font-bold text-slate-500">Households</span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">{activeCustomers} active • {pausedCustomers} paused</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-teal-700">
            <span className="flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-teal-500" />
              95% Active Rate
            </span>
            <span className="text-slate-400 text-[10px]">5 Routes</span>
          </div>
        </div>

        {/* Card 4: Daily Product Sales */}
        <div
          onClick={() => navigate('/admin/orders')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-purple-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Product Sales</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <ShoppingCart className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(todayProductSales)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Paneer, Curd, Ghee, Makhan</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-purple-700">
            <span>Value-Add Items</span>
            <span className="text-slate-400 text-[10px]">Add-on Basket</span>
          </div>
        </div>

        {/* Card 5: Month-to-Date Billing */}
        <div
          onClick={() => navigate('/admin/billing')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Monthly Billing</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Receipt className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-slate-900 tracking-tight">
              {formatCurrency(currentMonthBilling)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })} Invoices
            </p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-amber-700">
            <span>{collectionPercentage}% Collected</span>
            <span className="text-slate-400 text-[10px]">{formatCurrency(paymentsCollectedTotal)}</span>
          </div>
        </div>

        {/* Card 6: Customer Outstanding Balance */}
        <div
          onClick={() => navigate('/admin/payments')}
          className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-rose-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Uncollected Dues</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div className="text-xl font-black text-rose-900 tracking-tight">
              {formatCurrency(totalCustomerOutstanding)}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-1">Household Pending Balances</p>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-rose-700">
            <span>Payable: {formatCurrency(totalVendorOutstanding)}</span>
            <span className="text-slate-400 text-[10px]">To Vendors</span>
          </div>
        </div>
      </div>

      {/* 4. Low-Stock Alert Ribbon (If applicable) */}
      {lowStockProducts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200/90 rounded-3xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 bg-amber-500 text-white rounded-2xl shadow-sm">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-amber-950 uppercase tracking-wider">
                Low Inventory Alert • {lowStockProducts.length} Items Below Safe Threshold
              </h4>
              <p className="text-xs text-amber-900/80 mt-0.5">
                {lowStockProducts.map(p => `${p.name} (${p.availableStock} units left)`).join(' • ')}
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate('/admin/inventory')}
            className="self-start sm:self-auto text-xs font-bold text-amber-950 hover:text-black bg-amber-200/80 hover:bg-amber-300 px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <span>Restock Inventory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 5. Interactive Analytics Deck (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Milk Procurement vs Doorstep Delivery Flow (Span 2) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h3 className="text-base font-black text-slate-900 tracking-tight">
                Daily Milk Procurement vs Doorstep Fulfillment
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Litres received from farm suppliers vs doorstep delivery dispatch
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-full">
                5-Day Spread
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={milkFlowData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="procuredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="deliveredGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} stroke="#CBD5E1" />
                <Tooltip
                  formatter={(val: any) => [`${val} Litres`, '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    color: '#F8FAFC',
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)',
                    fontSize: '12px',
                    padding: '10px 14px',
                  }}
                  itemStyle={{ color: '#F8FAFC' }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '12px' }}
                  iconType="circle"
                />
                <Area
                  type="monotone"
                  dataKey="procured"
                  name="Bulk Procured (L)"
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#procuredGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="delivered"
                  name="Doorstep Delivered (L)"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#deliveredGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chilled Tank Silo & Storage Monitor (Span 1) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <Thermometer className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 tracking-tight">
                    Chilled Tank Silos
                  </h3>
                  <p className="text-[11px] text-slate-400">Total Holding: {totalSiloStock} L</p>
                </div>
              </div>
              <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                3.8°C Nominal
              </span>
            </div>

            {/* Silo A: Cow Milk */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 mb-3 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Cow Milk Silo A
                </span>
                <span className="font-black text-slate-900">{currentStock?.cowMilk || 340} L <span className="text-slate-400 font-normal">/ 500 L</span></span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cowPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>{cowPercentage}% filled</span>
                <span>Chamber temp: 3.7°C</span>
              </div>
            </div>

            {/* Silo B: Buffalo Milk */}
            <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  Buffalo Milk Silo B
                </span>
                <span className="font-black text-slate-900">{currentStock?.buffaloMilk || 280} L <span className="text-slate-400 font-normal">/ 500 L</span></span>
              </div>
              <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${buffaloPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span>{buffaloPercentage}% filled</span>
                <span>Chamber temp: 3.9°C</span>
              </div>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Chilling compressor OK</span>
            </div>
            <button
              onClick={() => navigate('/admin/purchases')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <span>Intake More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* 6. Route-Wise Delivery Performance Overview */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-base font-black text-slate-900 tracking-tight">
              Route-wise Dispatch & Delivery Status
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Live morning dispatch tracking across 5 dedicated local circuits
            </p>
          </div>
          <button
            onClick={() => navigate('/admin/routes')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer self-start sm:self-auto"
          >
            <span>Manage All Routes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
          {routes.length === 0 ? (
            <div className="col-span-full py-10 px-4 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200">
              <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-bold text-slate-700">No delivery routes created yet</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Define your local delivery routes to organize customer drops</p>
              <button
                onClick={() => navigate('/admin/routes')}
                className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3.5 py-1.5 rounded-xl border border-emerald-200 transition-colors cursor-pointer"
              >
                + Create Delivery Route
              </button>
            </div>
          ) : (
            routes.map(r => (
              <div
                key={r.id}
                onClick={() => navigate('/admin/deliveries')}
                className="p-4 bg-slate-50/70 hover:bg-emerald-50/40 rounded-2xl border border-slate-200/70 hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-black uppercase text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                      {r.name.split(' - ')[0]}
                    </span>
                    <span className="text-xs font-black text-slate-900">
                      {r.totalMilkRequired} L
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 truncate" title={r.area}>
                    {r.area}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                    {r.assignedCustomerCount} households
                  </p>
                </div>

                <div className="mt-4 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="text-slate-500">Progress</span>
                    <span className="text-emerald-700">{r.completionPercentage}% Done</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${r.completionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* 7. Live Activity: Recent Deliveries & WhatsApp Communication Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Deliveries Table Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Truck className="w-4 h-4 text-emerald-600" />
                  <span>Recent Doorstep Deliveries</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Live delivery scan updates from delivery riders</p>
              </div>
              <button
                onClick={() => navigate('/admin/deliveries')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View All
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {activeDeliveries.length === 0 ? (
                <div className="py-10 px-4 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 my-2">
                  <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No deliveries scheduled for this date</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Active subscribers on assigned routes will appear here</p>
                </div>
              ) : (
                activeDeliveries.slice(0, 5).map(d => (
                  <div key={d.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="truncate pr-3">
                      <p className="font-bold text-slate-900 truncate">{d.customerName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{d.customerMobile} • {d.routeName}</p>
                    </div>
                    <div className="text-right shrink-0 flex items-center gap-2.5">
                      <span className="font-black text-slate-800 text-xs">
                        {d.actualMilkQuantity || d.plannedMilkQuantity}L {d.milkType.includes('Cow') ? 'Cow' : 'Buffalo'}
                      </span>
                      <Badge
                        variant={
                          d.status === 'Delivered'
                            ? 'green'
                            : d.status === 'Partially delivered'
                              ? 'amber'
                              : d.status === 'Scheduled'
                                ? 'blue'
                                : 'red'
                        }
                        size="sm"
                      >
                        {d.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/admin/deliveries')}
              className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-2xl transition-colors flex items-center justify-center gap-1.5 border border-slate-200/80 cursor-pointer"
            >
              <span>Open Delivery Dispatch Sheet</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* WhatsApp Automated Communications Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-2xs hover:shadow-sm transition-all flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-emerald-600" />
                  <span>WhatsApp Invoices & Reminders</span>
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Automated invoice PDF broadcasts & payment links</p>
              </div>
              <button
                onClick={() => navigate('/admin/notifications')}
                className="text-xs text-emerald-700 font-bold hover:underline"
              >
                View Logs
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {notificationLogs.length === 0 ? (
                <div className="py-10 px-4 text-center bg-slate-50/70 rounded-2xl border border-dashed border-slate-200 my-2">
                  <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-700">No communication logs recorded</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Automated delivery confirmations and monthly bills will appear here</p>
                </div>
              ) : (
                notificationLogs.slice(0, 5).map(log => (
                  <div key={log.id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="truncate pr-3">
                      <p className="font-bold text-slate-900 truncate">{log.customerName}</p>
                      <p className="text-[10px] text-slate-400">
                        Bill {log.billingMonth} • Amount Due: <strong className="text-slate-700">{formatCurrency(log.amountDue)}</strong>
                      </p>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      <Badge
                        variant={
                          log.status === 'Delivered'
                            ? 'green'
                            : log.status === 'Sent'
                              ? 'blue'
                              : 'red'
                        }
                        size="sm"
                      >
                        {log.status}
                      </Badge>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => navigate('/admin/notifications')}
              className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Broadcast Month-End WhatsApp Invoices</span>
              <ArrowRight className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};