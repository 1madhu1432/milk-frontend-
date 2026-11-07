import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { customerApi } from '../../services/api/customerApi';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { PaymentGatewayModal } from '../../components/common/PaymentGatewayModal';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import {
  Calendar,
  PauseCircle,
  Receipt,
  CreditCard,
  Check,
  Clock,
  Printer,
  ChevronRight,
  Truck,
  Sparkles,
  Phone,
  MapPin,
  User,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  Plus,
  Minus,
  ArrowRight,
  CheckCircle2,
  FileText,
  CalendarDays,
  Settings,
} from 'lucide-react';

interface CustomerPortalProps {
  defaultTab?: 'home' | 'bills' | 'deliveries' | 'pause' | 'profile';
}

export const CustomerPortal: React.FC<CustomerPortalProps> = ({ defaultTab }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const {
    currentUser,
    customers,
    updateCustomer,
    invoices,
    deliveries,
    pauseRequests,
    addPauseRequest,
    addCustomerPayment,
    getCustomerLedger,
    settings,
  } = useDairy();

  // Active view from URL or prop
  const currentView = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/customer/home')) return 'home';
    if (path.includes('/customer/bills')) return 'bills';
    if (path.includes('/customer/deliveries')) return 'deliveries';
    if (path.includes('/customer/pause')) return 'pause';
    if (path.includes('/customer/profile')) return 'profile';
    return defaultTab || 'home';
  }, [location.pathname, defaultTab]);

  // Dynamically resolve logged-in customer session
  const customer = useMemo(() => {
    return (
      customers.find(
        c =>
          (currentUser.id && (c.userId === currentUser.id || c.id === currentUser.id)) ||
          (currentUser.email && c.email?.toLowerCase() === currentUser.email?.toLowerCase())
      ) ||
      customers[0] || {
        id: 'CUST-1001',
        name: currentUser.name || 'Rajesh Reddy',
        mobile: '+91 98490 11001',
        email: currentUser.email || 'customer@dailydairy.demo',
        houseNo: 'Villa 14',
        street: 'Road No. 12',
        area: 'Banjara Hills',
        landmark: 'Near City Centre Mall',
        assignedRouteId: 'ROUTE-1',
        assignedEmployeeId: 'EMP-01',
        milkType: 'Cow Milk' as const,
        dailyQuantity: 1.5,
        pricePerLitre: 60,
        deliverySlot: 'Morning (05:30 AM - 07:00 AM)' as const,
        deliveryInstructions: 'Ring bell once and leave insulated milk can outside',
        status: 'active' as const,
        startDate: '2024-01-15',
        currentMonthMilkQuantity: 45,
        outstandingBalance: 2700,
      }
    );
  }, [customers, currentUser]);

  const customerId = customer.id;

  // State for Pause Request Form
  const [pauseForm, setPauseForm] = useState({
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    reason: 'Family Vacation / Traveling',
    notes: 'Please do not deliver during these 4 days',
  });
  const [pauseSubmitted, setPauseSubmitted] = useState(false);

  // State for Subscription Edit
  const [isEditSubOpen, setIsEditSubOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    milkType: customer.milkType,
    dailyQuantity: customer.dailyQuantity,
    deliverySlot: 'Morning (05:30 AM - 07:00 AM)',
    instructions: customer.deliveryInstructions,
  });

  // State for Invoice Detail Modal & Print View
  const [selectedInvoice, setSelectedInvoice] = useState<(typeof invoices)[0] | null>(null);

  // State for Payment Gateway Modal
  const [gatewayModal, setGatewayModal] = useState<{
    isOpen: boolean;
    amount: number;
    title: string;
    invoiceId?: string;
    invoiceNumber?: string;
  } | null>(null);

  // Deliveries for this customer
  const customerDeliveries = useMemo(() => {
    return deliveries.filter(d => d.customerId === customer.id);
  }, [deliveries, customer.id]);

  // Today's delivery for this customer
  const todayDelivery = customerDeliveries.find(d => d.date === '2026-10-10') || customerDeliveries[0];

  // Invoices for this customer
  const customerInvoices = useMemo(() => {
    return invoices.filter(i => i.customerId === customer.id);
  }, [invoices, customer.id]);

  // Total delivered litres this month
  const totalReceivedLitres = useMemo(() => {
    const delivered = customerDeliveries.filter(d => d.status === 'Delivered');
    return delivered.reduce((acc, d) => acc + d.actualMilkQuantity, 0);
  }, [customerDeliveries]);

  // Pause requests for this customer
  const customerPauses = useMemo(() => {
    return pauseRequests.filter(p => p.customerId === customer.id);
  }, [pauseRequests, customer.id]);

  // Handle Pause Form Submit
  const handlePauseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerApi.submitPause({
        startDate: pauseForm.startDate,
        endDate: pauseForm.endDate,
        reason: pauseForm.reason,
      });
    } catch (err) {
      console.debug('Customer pause API note:', err);
    }
    addPauseRequest({
      customerId: customer.id,
      customerName: customer.name,
      routeId: customer.assignedRouteId,
      startDate: pauseForm.startDate,
      endDate: pauseForm.endDate,
      reason: pauseForm.reason,
    });
    setPauseSubmitted(true);
    setTimeout(() => setPauseSubmitted(false), 4000);
  };

  // Handle Subscription Form Submit with Confirmation
  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    if (window.confirm(`Confirm updating daily milk subscription to ${subForm.dailyQuantity}L ${subForm.milkType}?`)) {
      updateCustomer(customer.id, {
        milkType: subForm.milkType as any,
        dailyQuantity: subForm.dailyQuantity,
        deliveryInstructions: subForm.instructions,
      });
      setIsEditSubOpen(false);
      alert('Subscription plan updated successfully!');
    }
  };

  // Handle Simulated Payment Success
  const handleGatewaySuccess = (paymentData: {
    paymentId: string;
    referenceNo: string;
    method: any;
    amount: number;
    date: string;
    notes?: string;
  }) => {
    if (!gatewayModal) return;

    addCustomerPayment({
      customerId: customer.id,
      customerName: customer.name,
      date: paymentData.date,
      amount: paymentData.amount,
      paymentMethod: 'Payment Gateway (Online)',
      referenceNo: paymentData.referenceNo,
      invoiceId: gatewayModal.invoiceId,
      recordedBy: 'Customer (Online Payment)',
      notes: paymentData.notes || 'Settled via Customer App UPI',
    });

    setGatewayModal(null);
    alert(`Payment of ${formatCurrency(paymentData.amount)} recorded successfully! Reference: ${paymentData.referenceNo}`);
  };

  return (
    <div className="space-y-4 font-sans text-slate-900">
      {/* ------------------------------------------------------------- */}
      {/* 1. CUSTOMER HOME SCREEN */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'home' && (
        <div className="space-y-4">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="bg-white/10 px-2.5 py-0.5 rounded-full border border-white/15 text-[10px] uppercase font-black tracking-wider text-emerald-200">
                  Welcome Back
                </span>
                <span className="text-emerald-200 text-[11px] font-mono">ID: {customer.id}</span>
              </div>

              <div>
                <h1 className="text-xl font-black text-white tracking-tight">
                  Good Morning, {customer.name}!
                </h1>
                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                  📍 {customer.houseNo}, {customer.street}, {customer.area}
                </p>
              </div>

              {/* Active Plan Highlights Strip */}
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-emerald-300 uppercase font-black block">Active Plan</span>
                  <span className="font-black text-white text-sm">
                    {customer.dailyQuantity} L • {customer.milkType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-emerald-300 uppercase font-bold block">Rate</span>
                  <span className="font-black text-white text-sm">
                    {formatCurrency(customer.pricePerLitre)}/L
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Scheduled Delivery & Live Status */}
          <div className="bg-white rounded-3xl border border-emerald-300/80 p-4 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Today's Delivery Status
              </span>
              <span className="text-xs font-bold text-slate-500">Saturday, 10 Oct</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🥛</span>
                <div>
                  <p className="font-black text-slate-900 text-sm">
                    {todayDelivery ? todayDelivery.plannedMilkQuantity : customer.dailyQuantity} L {customer.milkType}
                  </p>
                  <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                    Slot: Morning (05:30 – 07:00 AM)
                  </p>
                </div>
              </div>

              <Badge
                variant={
                  todayDelivery && todayDelivery.status === 'Delivered'
                    ? 'green'
                    : todayDelivery && todayDelivery.status === 'Missed'
                    ? 'red'
                    : 'blue'
                }
              >
                {todayDelivery ? todayDelivery.status : 'Scheduled'}
              </Badge>
            </div>

            {customer.deliveryInstructions && (
              <p className="text-[11px] text-slate-600 bg-amber-50/70 border border-amber-200/80 px-3 py-1.5 rounded-xl font-medium">
                📍 Drop Note: <span className="font-bold">{customer.deliveryInstructions}</span>
              </p>
            )}
          </div>

          {/* Current Month Bill Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                Current Month Bill (October 2026)
              </span>
              <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                Payment Pending
              </span>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(customer.outstandingBalance)}
                </span>
                <p className="text-[11px] text-slate-500 font-bold mt-0.5">Outstanding Balance Due</p>
              </div>

              <button
                onClick={() =>
                  setGatewayModal({
                    isOpen: true,
                    amount: customer.outstandingBalance,
                    title: `October 2026 Dairy Bill (${customer.name})`,
                  })
                }
                className="min-h-[44px] px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Now</span>
              </button>
            </div>
          </div>

          {/* Quick Action Grid (4 Large Touch Cards, >=44px) */}
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => navigate('/customer/bills')}
              className="min-h-[58px] p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-2xs transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <Receipt className="w-5 h-5 text-emerald-700 mb-1" />
                <span className="text-xs font-black text-slate-900 block">View Bills</span>
                <span className="text-[10px] text-slate-500 font-bold">Invoices & receipts</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/customer/bills')}
              className="min-h-[58px] p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-2xs transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <CreditCard className="w-5 h-5 text-emerald-700 mb-1" />
                <span className="text-xs font-black text-slate-900 block">Payment History</span>
                <span className="text-[10px] text-slate-500 font-bold">Ledger & transactions</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => setIsEditSubOpen(true)}
              className="min-h-[58px] p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-2xs transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <Settings className="w-5 h-5 text-emerald-700 mb-1" />
                <span className="text-xs font-black text-slate-900 block">Manage Plan</span>
                <span className="text-[10px] text-slate-500 font-bold">Edit milk litres</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>

            <button
              onClick={() => navigate('/customer/pause')}
              className="min-h-[58px] p-3.5 bg-white hover:bg-slate-50 border border-slate-200/90 rounded-2xl text-left shadow-2xs transition-all flex items-center justify-between cursor-pointer"
            >
              <div>
                <PauseCircle className="w-5 h-5 text-amber-600 mb-1" />
                <span className="text-xs font-black text-slate-900 block">Request Pause</span>
                <span className="text-[10px] text-slate-500 font-bold">Vacation / holiday</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MY BILLS VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'bills' && (
        <div className="space-y-4">
          {/* Current Billing Month Prominent Overview */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Billing Statement
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">October 2026 Month Bill</h2>
              </div>
              <span className="text-xs font-black text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-200">
                Unpaid
              </span>
            </div>

            {/* Bill Breakdown Cards */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-100">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold text-[10px] block">Milk Charges</span>
                <span className="font-black text-slate-900 text-sm">
                  {formatCurrency(45 * customer.pricePerLitre)}
                </span>
                <span className="text-[10px] text-slate-500 block">45 L @ ₹60/L</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold text-[10px] block">Add-on Products</span>
                <span className="font-black text-slate-900 text-sm">₹0.00</span>
                <span className="text-[10px] text-slate-500 block">No store orders</span>
              </div>

              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-400 font-bold text-[10px] block">Payments Received</span>
                <span className="font-black text-emerald-700 text-sm">₹0.00</span>
                <span className="text-[10px] text-emerald-600 block">Paid this month</span>
              </div>

              <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl">
                <span className="text-amber-800 font-bold text-[10px] block">Net Outstanding</span>
                <span className="font-black text-amber-900 text-sm">
                  {formatCurrency(customer.outstandingBalance)}
                </span>
                <span className="text-[10px] text-amber-700 block">Due by 15 Oct</span>
              </div>
            </div>

            {/* Settle Bill Button */}
            <button
              onClick={() =>
                setGatewayModal({
                  isOpen: true,
                  amount: customer.outstandingBalance,
                  title: `October 2026 Dairy Bill (${customer.name})`,
                })
              }
              className="w-full min-h-[48px] bg-emerald-700 hover:bg-emerald-800 text-white font-black py-2.5 px-4 rounded-xl text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Settle Outstanding Balance ({formatCurrency(customer.outstandingBalance)})</span>
            </button>
          </div>

          {/* Invoice History as Stacked Mobile Cards */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Invoice History ({customerInvoices.length})
            </h3>

            <div className="space-y-2.5">
              {customerInvoices.map(inv => (
                <div
                  key={inv.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-slate-900">{inv.monthLabel}</span>
                      <Badge variant={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'amber' : 'red'}>
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                      Inv #{inv.invoiceNumber} • {inv.items.filter(it => it.type === 'milk').reduce((acc, it) => acc + it.quantity, 0) || 45} L Milk
                    </p>
                    <p className="text-xs font-black text-slate-900 mt-1">
                      {formatCurrency(inv.totalPayable)}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="min-h-[40px] px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-700 font-bold transition-all text-[11px] cursor-pointer flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Details</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DELIVERIES HISTORY VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'deliveries' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Milk Receiving Calendar
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">October 2026 Deliveries</h2>
              </div>
              <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {totalReceivedLitres || 45} L Received
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Daily doorstep milk dropping logs verified by Harish Dairy route rider.
            </p>
          </div>

          {/* Delivery Calendar Log Cards */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Daily Drop Logs ({customerDeliveries.length})
            </h3>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {customerDeliveries.map((del, idx) => (
                <div
                  key={del.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                    del.status === 'Delivered'
                      ? 'bg-emerald-50/30 border-emerald-200'
                      : del.status === 'Missed'
                      ? 'bg-rose-50/30 border-rose-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">🥛</span>
                    <div>
                      <p className="font-black text-slate-900">
                        {formatDate(del.date)}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {del.plannedMilkQuantity}L {del.milkType} • Morning Slot
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <Badge variant={del.status === 'Delivered' ? 'green' : del.status === 'Missed' ? 'red' : 'blue'}>
                      {del.status === 'Delivered' ? `✓ ${del.actualMilkQuantity}L` : del.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. PAUSE REQUEST VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'pause' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              Vacation / Pause Request
            </span>
            <h2 className="text-lg font-black text-slate-900 mt-1">Temporarily Pause Milk Delivery</h2>
            <p className="text-xs text-slate-500 font-medium leading-relaxed">
              Going out of town? Submit a vacation pause so milk is not dropped at your door and not billed.
            </p>
          </div>

          {/* Submission Notice Banner */}
          <div className="p-3 bg-amber-50 border border-amber-200/90 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-snug">
              <strong>Notice:</strong> Please submit requests at least 12 hours before morning delivery.
              <em> A request is not an approved pause until approved by the dairy supervisor.</em>
            </p>
          </div>

          {/* Pause Submission Success Toast */}
          {pauseSubmitted && (
            <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-2 text-xs font-black text-emerald-900">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Vacation pause request submitted to dairy supervisor!</span>
            </div>
          )}

          {/* Pause Request Form */}
          <form onSubmit={handlePauseSubmit} className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 text-xs">
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block font-black text-slate-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={pauseForm.startDate}
                  onChange={e => setPauseForm(prev => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={pauseForm.endDate}
                  onChange={e => setPauseForm(prev => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-black text-slate-700 mb-1">Reason for Pause</label>
              <select
                value={pauseForm.reason}
                onChange={e => setPauseForm(prev => ({ ...prev, reason: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
              >
                <option value="Family Vacation / Traveling">Family Vacation / Traveling</option>
                <option value="Festival / Out of Station">Festival / Out of Station</option>
                <option value="Excess Milk in Refrigerator">Excess Milk in Refrigerator</option>
                <option value="Medical / Health">Medical / Health</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-600 mb-1">Optional Notes</label>
              <input
                type="text"
                placeholder="e.g. Returning Monday evening"
                value={pauseForm.notes}
                onChange={e => setPauseForm(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full min-h-[48px] bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black py-2.5 px-4 rounded-xl text-xs shadow-xs cursor-pointer transition-all"
            >
              Submit Vacation Pause Request
            </button>
          </form>

          {/* Previously Submitted Pause Requests */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Submitted Requests ({customerPauses.length})
            </h3>

            {customerPauses.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center">No vacation pause requests submitted yet.</p>
            ) : (
              <div className="space-y-2">
                {customerPauses.map(p => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-black text-slate-900">
                        {p.startDate} to {p.endDate}
                      </p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{p.reason}</p>
                    </div>

                    <Badge
                      variant={
                        p.status === 'Approved'
                          ? 'green'
                          : p.status === 'Pending'
                          ? 'amber'
                          : p.status === 'Rejected'
                          ? 'red'
                          : 'blue'
                      }
                    >
                      {p.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. CUSTOMER PROFILE & PLAN VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 text-white text-3xl font-black flex items-center justify-center mx-auto shadow-md">
              🥛
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{customer.name}</h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 mt-1 inline-block">
                Subscriber ID: {customer.id}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">
              {customer.houseNo}, {customer.street}, {customer.area}
            </p>
          </div>

          {/* Subscription Details & Management */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">
                Subscription Plan Details
              </h3>
              <button
                onClick={() => setIsEditSubOpen(true)}
                className="text-emerald-700 hover:text-emerald-800 font-black cursor-pointer"
              >
                Edit Plan
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Milk Product:</span>
                <span className="font-black text-slate-900">{customer.milkType}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Daily Quantity:</span>
                <span className="font-black text-slate-900">{customer.dailyQuantity} Litres</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Price Rate:</span>
                <span className="font-black text-slate-900">{formatCurrency(customer.pricePerLitre)} / Litre</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Delivery Slot:</span>
                <span className="font-black text-slate-900">Morning (05:30 AM - 07:00 AM)</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Assigned Rider:</span>
                <span className="font-black text-slate-900">Ramesh Varma (Route 1)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 mb-1.5">Harish Dairy Customer Care:</p>
              <a
                href="tel:+919876543210"
                className="w-full min-h-[44px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black rounded-xl p-3 flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Call Helpline (+91 98765 43210)</span>
              </a>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (window.confirm('Sign out from your customer subscriber account?')) {
                navigate('/login/customer');
              }
            }}
            className="w-full min-h-[48px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded-2xl p-3 flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer text-xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Sign Out from Customer Portal</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* EDIT SUBSCRIPTION PLAN MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isEditSubOpen}
        onClose={() => setIsEditSubOpen(false)}
        title="Manage Milk Subscription"
        maxWidth="sm"
      >
        <form onSubmit={handleSaveSubscription} className="space-y-3.5 text-xs font-sans">
          <div>
            <label className="block font-black text-slate-700 mb-1">Select Milk Variety</label>
            <select
              value={subForm.milkType}
              onChange={e => setSubForm(prev => ({ ...prev, milkType: e.target.value as any }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Cow Milk">Cow Milk (A2 Gir Cow Farm Fresh - ₹60/L)</option>
              <option value="Buffalo Milk">Buffalo Milk (Full Cream 7.5% Fat - ₹75/L)</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1">Daily Required Quantity</label>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1.0, 1.5, 2.0].map(qty => (
                <button
                  type="button"
                  key={qty}
                  onClick={() => setSubForm(prev => ({ ...prev, dailyQuantity: qty }))}
                  className={`py-2 rounded-xl text-xs font-black border transition-all cursor-pointer ${
                    subForm.dailyQuantity === qty
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}
                >
                  {qty} L
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1">Delivery Time Window</label>
            <select
              value={subForm.deliverySlot}
              onChange={e => setSubForm(prev => ({ ...prev, deliverySlot: e.target.value as any }))}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Morning (05:30 AM - 07:00 AM)">Morning (05:30 AM - 07:00 AM)</option>
              <option value="Evening (05:30 PM - 07:00 PM)">Evening (05:30 PM - 07:00 PM)</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-600 mb-1">Doorstep Drop Instructions</label>
            <input
              type="text"
              value={subForm.instructions}
              onChange={e => setSubForm(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g. Leave in bag at gate"
              className="w-full px-3 py-2 rounded-xl border border-slate-200"
            />
          </div>

          <div className="flex items-center gap-2 pt-2 border-t">
            <button
              type="button"
              onClick={() => setIsEditSubOpen(false)}
              className="flex-1 py-2.5 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black cursor-pointer shadow-xs"
            >
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* INVOICE DETAILS & PRINT MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Tax Invoice #${selectedInvoice.invoiceNumber}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-black text-sm text-slate-900">Harish Dairy Farm</h4>
                  <p className="text-[11px] text-slate-500 font-semibold">Banjara Hills, Hyderabad, TS</p>
                </div>
                <Badge variant={selectedInvoice.status === 'Paid' ? 'green' : 'red'}>
                  {selectedInvoice.status}
                </Badge>
              </div>

              <div className="border-t border-slate-200 pt-2 grid grid-cols-2 gap-2 text-[11px]">
                <p><strong>Customer:</strong> {selectedInvoice.customerName}</p>
                <p><strong>Billing Period:</strong> {selectedInvoice.monthLabel}</p>
                <p><strong>Total Milk Dropped:</strong> {selectedInvoice.items.filter(it => it.type === 'milk').reduce((acc, it) => acc + it.quantity, 0) || 45} L</p>
                <p><strong>Milk Charges:</strong> {formatCurrency(selectedInvoice.milkCharges)}</p>
              </div>

              <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm font-black text-slate-900">
                <span>Net Total Payable:</span>
                <span className="text-emerald-800">{formatCurrency(selectedInvoice.totalPayable)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t">
              <button
                onClick={() => window.print()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>

              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* ONLINE PAYMENT MODAL */}
      {/* ------------------------------------------------------------- */}
      {gatewayModal && (
        <PaymentGatewayModal
          isOpen={gatewayModal.isOpen}
          onClose={() => setGatewayModal(null)}
          amount={gatewayModal.amount}
          title={gatewayModal.title}
          invoiceNumber={gatewayModal.invoiceNumber}
          customerName={customer.name}
          customerMobile={customer.mobile}
          onSuccess={handleGatewaySuccess}
        />
      )}
    </div>
  );
};
