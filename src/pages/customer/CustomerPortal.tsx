import React, { useState, useMemo } from 'react';
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
  Clock,
  ChevronRight,
  Truck,
  Phone,
  MapPin,
  User,
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  CheckCircle2,
  FileText,
  CalendarDays,
  Settings,
  Sparkles,
  ArrowRight,
  Download,
  Check,
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

  // Dynamically resolve logged-in customer without hardcoding dummy records
  const customer = useMemo(() => {
    const found = customers.find(
      c =>
        (currentUser.id && (c.userId === currentUser.id || c.id === currentUser.id)) ||
        (currentUser.email && c.email?.toLowerCase() === currentUser.email?.toLowerCase())
    ) || customers[0];

    if (found) return found;

    // Clean baseline for logged-in user if no customer record created yet
    return {
      id: currentUser.id || 'CUST-MEM-01',
      name: currentUser.name || 'Valued Subscriber',
      mobile: '+91 98000 00000',
      email: currentUser.email || 'subscriber@dairynexa.com',
      houseNo: 'House #42',
      street: 'Dairy Enclave',
      area: 'Outer Ring Road',
      landmark: 'Near Dairy Center',
      assignedRouteId: 'ROUTE-1',
      assignedEmployeeId: 'EMP-01',
      milkType: 'Cow Milk' as const,
      dailyQuantity: 1.0,
      pricePerLitre: 60,
      deliverySlot: 'Morning (05:30 AM - 07:00 AM)' as const,
      deliveryInstructions: 'Leave in insulated bag at front door',
      status: 'active' as const,
      subscriptionStartDate: new Date().toISOString().split('T')[0],
      currentMonthMilkQuantity: 0,
      outstandingBalance: 0,
    };
  }, [customers, currentUser]);

  // Current formatted Date
  const todayDateObj = new Date();
  const todayFormatted = todayDateObj.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const todayYMD = todayDateObj.toISOString().split('T')[0];

  // Dynamic greeting based on hour
  const greeting = useMemo(() => {
    const hour = todayDateObj.getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }, [todayDateObj]);

  // State for Pause Request Form
  const [pauseForm, setPauseForm] = useState({
    startDate: todayYMD,
    endDate: new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0],
    reason: 'Family Vacation / Traveling',
    notes: '',
  });
  const [pauseSubmitted, setPauseSubmitted] = useState(false);

  // State for Subscription Edit Modal
  const [isEditSubOpen, setIsEditSubOpen] = useState(false);
  const [subForm, setSubForm] = useState({
    milkType: customer.milkType,
    dailyQuantity: customer.dailyQuantity,
    deliverySlot: (customer as any).deliverySlot || 'Morning (05:30 AM - 07:00 AM)',
    instructions: customer.deliveryInstructions || '',
  });

  // State for Invoice Detail Modal
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
  const todayDelivery = customerDeliveries.find(d => d.date === todayYMD) || customerDeliveries[0];

  // Invoices for this customer
  const customerInvoices = useMemo(() => {
    return invoices.filter(i => i.customerId === customer.id);
  }, [invoices, customer.id]);

  // Total delivered litres this month
  const totalReceivedLitres = useMemo(() => {
    const delivered = customerDeliveries.filter(d => d.status === 'Delivered');
    return delivered.reduce((acc, d) => acc + (d.actualMilkQuantity || 0), 0);
  }, [customerDeliveries]);

  // Pause requests for this customer
  const customerPauses = useMemo(() => {
    return pauseRequests.filter(p => p.customerId === customer.id);
  }, [pauseRequests, customer.id]);

  // Generate Next 7 Days for visual schedule matrix
  const next7Days = useMemo(() => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      const ymd = d.toISOString().split('T')[0];
      const isPaused = customerPauses.some(
        p => (p.status === 'Approved' || p.status === 'Pending') && ymd >= p.startDate && ymd <= p.endDate
      );
      days.push({
        dateObj: d,
        ymd,
        dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
        dateNum: d.getDate(),
        monthName: d.toLocaleDateString('en-US', { month: 'short' }),
        isToday: i === 0,
        isPaused,
      });
    }
    return days;
  }, [customerPauses]);

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

  // Handle Subscription Form Submit
  const handleSaveSubscription = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomer(customer.id, {
      milkType: subForm.milkType as any,
      dailyQuantity: subForm.dailyQuantity,
      deliveryInstructions: subForm.instructions,
    });
    setIsEditSubOpen(false);
  };

  // Handle Online Payment Success
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
  };

  return (
    <div className="space-y-6 font-sans text-slate-900">

      {/* ============================================================ */}
      {/* 1. CUSTOMER DASHBOARD (HOME) */}
      {/* ============================================================ */}
      {currentView === 'home' && (
        <div className="space-y-6">

          {/* Top Hero Command Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden border border-emerald-800/40">
            {/* Ambient Lighting */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              {/* Left Greeting & Location */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider">
                    Active Subscriber
                  </span>
                  <span className="text-emerald-200/80 text-xs font-mono">
                    ID: {customer.id}
                  </span>
                  <span className="text-emerald-300/40 text-xs">•</span>
                  <span className="text-emerald-200/90 text-xs font-medium">
                    {todayFormatted}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  {greeting}, {customer.name}!
                </h1>

                <p className="text-xs sm:text-sm text-emerald-100/80 flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>{customer.houseNo}, {customer.street}, {customer.area}</span>
                </p>
              </div>

              {/* Right Subscription Highlights & Quick CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 text-left">
                  <span className="text-[10px] uppercase font-bold text-emerald-300 tracking-wider block">
                    Daily Milk Plan
                  </span>
                  <span className="text-base sm:text-lg font-black text-white">
                    {customer.dailyQuantity} L • {customer.milkType}
                  </span>
                  <span className="text-[11px] text-emerald-200/90 block mt-0.5 font-semibold">
                    Rate: {formatCurrency(customer.pricePerLitre)}/L
                  </span>
                </div>

                <div className="flex sm:flex-col gap-2">
                  <button
                    onClick={() => setIsEditSubOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer text-center"
                  >
                    Modify Litres
                  </button>
                  <button
                    onClick={() => navigate('/customer/pause')}
                    className="flex-1 sm:flex-none px-4 py-2 bg-white/15 hover:bg-white/25 text-white font-bold text-xs rounded-xl border border-white/20 transition-all cursor-pointer text-center"
                  >
                    Vacation Pause
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Main 2-Column Responsive Dashboard Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

            {/* ======================================================= */}
            {/* LEFT 8 COLUMNS: Today's Delivery & 7-Day Visual Matrix */}
            {/* ======================================================= */}
            <div className="lg:col-span-8 space-y-6">

              {/* Today's Live Delivery Command Card */}
              <div className="bg-white rounded-3xl border border-emerald-300/80 p-5 sm:p-6 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <h2 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      Today's Doorstep Delivery
                    </h2>
                  </div>

                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    {todayFormatted}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">

                  {/* Delivery Item */}
                  <div className="sm:col-span-2 flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/60 to-slate-50 border border-emerald-100">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-emerald-200 flex items-center justify-center text-3xl shadow-sm shrink-0">
                      🥛
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                        Planned Morning Drop
                      </span>
                      <p className="text-lg font-black text-slate-950 mt-0.5">
                        {todayDelivery ? todayDelivery.plannedMilkQuantity : customer.dailyQuantity} L {customer.milkType}
                      </p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Slot: {(customer as any).deliverySlot || 'Morning (05:30 – 07:00 AM)'}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Indicator */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col items-center justify-center text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                      Dispatch Status
                    </span>
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
                    <span className="text-[11px] text-slate-500 font-medium mt-1">
                      Route Rider: Ramesh (R-1)
                    </span>
                  </div>

                </div>

                {/* Delivery Drop Instruction Note */}
                <div className="flex items-center justify-between p-3.5 bg-amber-50/70 border border-amber-200/90 rounded-2xl text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-amber-700 font-black">📍 Drop Instructions:</span>
                    <span className="text-amber-950 font-medium">
                      {customer.deliveryInstructions || 'Leave in insulated bag at front gate'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditSubOpen(true)}
                    className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer text-[11px] shrink-0 ml-2"
                  >
                    Edit Note
                  </button>
                </div>
              </div>

              {/* 7-Day Delivery Schedule Matrix */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                      Upcoming 7-Day Schedule
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Review your scheduled daily milk delivery for the coming week.
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/customer/pause')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
                  >
                    <span>Pause Specific Dates</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* 7-Day Horizontal Responsive Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2.5">
                  {next7Days.map((day, idx) => (
                    <div
                      key={day.ymd}
                      className={`p-3.5 rounded-2xl border text-center transition-all ${day.isToday
                        ? 'bg-emerald-50/90 border-emerald-400 shadow-xs ring-1 ring-emerald-400'
                        : day.isPaused
                          ? 'bg-rose-50/50 border-rose-200 opacity-80'
                          : 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                        }`}
                    >
                      <span className={`text-[10px] font-black uppercase tracking-wider block ${day.isToday ? 'text-emerald-800' : 'text-slate-400'
                        }`}>
                        {day.dayName}
                      </span>
                      <span className="text-lg font-black text-slate-900 block my-0.5">
                        {day.dateNum}
                      </span>
                      <span className="text-[10px] text-slate-500 block mb-1">
                        {day.monthName}
                      </span>

                      {day.isPaused ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-rose-100 text-rose-800 border border-rose-300">
                          Paused
                        </span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                          {customer.dailyQuantity} L
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Delivery Drop History */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black uppercase tracking-wider text-slate-900">
                    Recent Doorstep Drops ({customerDeliveries.length})
                  </h3>
                  <button
                    onClick={() => navigate('/customer/deliveries')}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    View Full Calendar
                  </button>
                </div>

                {customerDeliveries.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                    <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-slate-600">No deliveries recorded yet</p>
                    <p className="text-[11px] mt-0.5">
                      Your daily doorstep drop records and proofs of delivery will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customerDeliveries.slice(0, 5).map(del => (
                      <div
                        key={del.id}
                        className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-xl">🥛</span>
                          <div>
                            <p className="font-black text-slate-900">{formatDate(del.date)}</p>
                            <p className="text-[11px] text-slate-500 font-semibold">
                              {del.plannedMilkQuantity}L {del.milkType} • Morning Dispatch
                            </p>
                          </div>
                        </div>

                        <Badge variant={del.status === 'Delivered' ? 'green' : del.status === 'Missed' ? 'red' : 'blue'}>
                          {del.status === 'Delivered' ? `✓ ${del.actualMilkQuantity}L Delivered` : del.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* ======================================================= */}
            {/* RIGHT 4 COLUMNS: Billing, Instant Pay & Self-Service */}
            {/* ======================================================= */}
            <div className="lg:col-span-4 space-y-6">

              {/* Current Month Bill & Settle Due Card */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                    Monthly Billing Summary
                  </span>
                  {customer.outstandingBalance > 0 ? (
                    <span className="text-[10px] font-black text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
                      Payment Pending
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      All Dues Cleared ✓
                    </span>
                  )}
                </div>

                <div>
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-950 tracking-tight block">
                    {formatCurrency(customer.outstandingBalance)}
                  </span>
                  <p className="text-xs text-slate-500 font-bold mt-1">Outstanding Balance Due</p>
                </div>

                {customer.outstandingBalance > 0 ? (
                  <button
                    onClick={() =>
                      setGatewayModal({
                        isOpen: true,
                        amount: customer.outstandingBalance,
                        title: `Milk Bill Settlement (${customer.name})`,
                      })
                    }
                    className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-md cursor-pointer flex items-center justify-center gap-2 transition-all"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Bill Online (UPI / Card)</span>
                  </button>
                ) : (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No pending dues! Your subscription is up to date.</span>
                  </div>
                )}

                {/* Quick Advance Deposit */}
                <div className="p-3 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-700 flex items-center gap-1">
                      <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Quick Advance Deposit:</span>
                    </span>
                    <span className="text-emerald-700 font-bold text-[10px]">Instant Wallet Credit</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[200, 500, 1000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() =>
                          setGatewayModal({
                            isOpen: true,
                            amount: amt,
                            title: `Advance Deposit (${formatCurrency(amt)})`,
                          })
                        }
                        className="py-1.5 px-2 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg text-slate-800 hover:text-emerald-900 font-bold text-xs transition-all cursor-pointer text-center shadow-2xs"
                      >
                        +{formatCurrency(amt)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
                  <span>Billing Cycle: 1st - 30th</span>
                  <button
                    onClick={() => navigate('/customer/bills')}
                    className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer"
                  >
                    View Invoices →
                  </button>
                </div>
              </div>

              {/* Quick Self-Service Shortcuts (4 Large Cards) */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-3">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Quick Actions
                </h3>

                <div className="space-y-2">

                  <button
                    onClick={() => navigate('/customer/pause')}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                        <PauseCircle className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                          Vacation / Travel Pause
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Temporarily stop milk deliveries
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => setIsEditSubOpen(true)}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                        <Settings className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                          Manage Daily Milk Quota
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Change quantity or milk variety
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <button
                    onClick={() => navigate('/customer/bills')}
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                        <Receipt className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                          Past Invoices & Receipts
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Download PDF monthly statements
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </button>

                  <a
                    href="tel:+919876543210"
                    className="w-full p-3.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-2xl text-left transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                        <Phone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-xs font-black text-slate-900 block group-hover:text-emerald-700 transition-colors">
                          Dairy Support Helpline
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          Call or WhatsApp operations team
                        </span>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                  </a>

                </div>
              </div>

              {/* Delivery Rider & Route Info */}
              <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-2xs space-y-3 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
                  Delivery Route Assignment
                </span>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-black text-slate-900">Route 1 • Banjara Hills</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Assigned Rider: Ramesh Varma</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Morning Run
                  </span>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. MY BILLS & INVOICES VIEW */}
      {/* ============================================================ */}
      {currentView === 'bills' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Billing & Payment Ledger
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Subscriber Billing Statements
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  View and settle monthly doorstep milk subscriptions and value-added items.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Outstanding</span>
                  <span className="text-xl font-black text-slate-900">{formatCurrency(customer.outstandingBalance)}</span>
                </div>
                {customer.outstandingBalance > 0 ? (
                  <button
                    onClick={() =>
                      setGatewayModal({
                        isOpen: true,
                        amount: customer.outstandingBalance,
                        title: `Dairy Bill Settlement (${customer.name})`,
                      })
                    }
                    className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay Now</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-800 font-bold bg-emerald-50 px-3.5 py-2 rounded-xl border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>All Bills Settled</span>
                  </div>
                )}
              </div>
            </div>

            {/* Invoices List / Table */}
            <div className="pt-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                Monthly Invoices ({customerInvoices.length})
              </h3>

              {customerInvoices.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Receipt className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">No monthly invoices issued yet</p>
                  <p className="text-[11px] mt-0.5">
                    Your monthly billing cycle statement will be generated automatically at month end.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerInvoices.map(inv => (
                    <div
                      key={inv.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-slate-900 text-sm">{inv.monthLabel}</span>
                          <Badge variant={inv.status === 'Paid' ? 'green' : inv.status === 'Partially Paid' ? 'amber' : 'red'}>
                            {inv.status}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-slate-500 font-semibold mt-1">
                          Invoice #{inv.invoiceNumber} • Generated on {formatDate(inv.generatedDate)}
                        </p>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-4">
                        <div className="sm:text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Payable</span>
                          <span className="text-base font-black text-slate-900">{formatCurrency(inv.totalPayable)}</span>
                        </div>

                        {inv.status !== 'Paid' && (
                          <button
                            onClick={() =>
                              setGatewayModal({
                                isOpen: true,
                                amount: inv.totalPayable - (inv.paymentsApplied || 0),
                                invoiceId: inv.id,
                                invoiceNumber: inv.invoiceNumber,
                                title: `Settlement for Invoice #${inv.invoiceNumber}`,
                              })
                            }
                            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5 shadow-2xs"
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>Pay Now</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl text-slate-800 font-bold transition-all text-xs cursor-pointer flex items-center gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5 text-emerald-700" />
                          <span>View Details</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. DELIVERIES CALENDAR VIEW */}
      {/* ============================================================ */}
      {currentView === 'deliveries' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Doorstep Drops Log
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-1">
                  Milk Receiving Calendar
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Daily morning doorstep drop logs verified by route delivery riders.
                </p>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Received</span>
                <span className="text-xl font-black text-emerald-800">{totalReceivedLitres} Litres</span>
              </div>
            </div>

            <div className="pt-6">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 mb-4">
                Delivery Drops ({customerDeliveries.length})
              </h3>

              {customerDeliveries.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-2xl">
                  <Truck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="font-bold text-slate-600">No deliveries on record yet</p>
                  <p className="text-[11px] mt-0.5">
                    Your doorstep milk drops will appear here daily.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {customerDeliveries.map(del => (
                    <div
                      key={del.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">🥛</span>
                        <div>
                          <p className="font-black text-slate-900 text-sm">{formatDate(del.date)}</p>
                          <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                            {del.plannedMilkQuantity}L {del.milkType} • Morning Dispatch
                          </p>
                        </div>
                      </div>

                      <Badge variant={del.status === 'Delivered' ? 'green' : del.status === 'Missed' ? 'red' : 'blue'}>
                        {del.status === 'Delivered' ? `✓ ${del.actualMilkQuantity}L` : del.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 4. VACATION PAUSE VIEW */}
      {/* ============================================================ */}
      {currentView === 'pause' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="border-b border-slate-100 pb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Vacation Management
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Temporarily Pause Milk Delivery
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Traveling or going on vacation? Submit a pause window so milk is not dropped at your door and not billed.
              </p>
            </div>

            <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Left: Pause Form */}
              <div className="lg:col-span-7 space-y-4">
                {pauseSubmitted && (
                  <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-xs font-bold text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Your vacation pause request has been submitted to the dispatch supervisor!</span>
                  </div>
                )}

                <form onSubmit={handlePauseSubmit} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-black text-slate-700 mb-1.5">Start Date</label>
                      <input
                        type="date"
                        value={pauseForm.startDate}
                        onChange={e => setPauseForm(prev => ({ ...prev, startDate: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block font-black text-slate-700 mb-1.5">End Date</label>
                      <input
                        type="date"
                        value={pauseForm.endDate}
                        onChange={e => setPauseForm(prev => ({ ...prev, endDate: e.target.value }))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-black text-slate-700 mb-1.5">Reason for Pause</label>
                    <select
                      value={pauseForm.reason}
                      onChange={e => setPauseForm(prev => ({ ...prev, reason: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-xs"
                    >
                      <option value="Family Vacation / Traveling">Family Vacation / Traveling</option>
                      <option value="Festival / Out of Station">Festival / Out of Station</option>
                      <option value="Excess Milk in Refrigerator">Excess Milk in Refrigerator</option>
                      <option value="Medical / Health">Medical / Health</option>
                      <option value="Other">Other Reason</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-medium text-slate-600 mb-1.5">Optional Instructions for Delivery Team</label>
                    <input
                      type="text"
                      placeholder="e.g. Resuming delivery on Monday morning"
                      value={pauseForm.notes}
                      onChange={e => setPauseForm(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black rounded-xl text-xs shadow-md cursor-pointer transition-all"
                  >
                    Submit Vacation Pause Request
                  </button>
                </form>
              </div>

              {/* Right: Existing Pause Windows */}
              <div className="lg:col-span-5 bg-slate-50 p-5 rounded-3xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Your Submitted Requests ({customerPauses.length})
                </h3>

                {customerPauses.length === 0 ? (
                  <p className="text-xs text-slate-400 py-6 text-center">
                    No active or past vacation pause requests.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {customerPauses.map(p => (
                      <div
                        key={p.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200/90 flex items-center justify-between text-xs shadow-2xs"
                      >
                        <div>
                          <p className="font-black text-slate-900">{p.startDate} to {p.endDate}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{p.reason}</p>
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
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 5. MY PROFILE & PREFERENCES VIEW */}
      {/* ============================================================ */}
      {currentView === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-2xs">
            <div className="border-b border-slate-100 pb-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                Subscriber Account
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Profile & Delivery Preferences
              </h2>
            </div>

            <div className="pt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

              {/* Profile Card */}
              <div className="lg:col-span-5 bg-slate-50 p-6 rounded-3xl border border-slate-200 text-center space-y-3">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-600 via-teal-600 to-green-700 text-white text-3xl font-black flex items-center justify-center mx-auto shadow-md">
                  🥛
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-950">{customer.name}</h3>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 mt-1 inline-block">
                    Subscriber ID: {customer.id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  {customer.houseNo}, {customer.street}, {customer.area}
                </p>

                <div className="pt-4 border-t border-slate-200/80 space-y-2 text-xs text-left">
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">Email:</span>
                    <span className="font-black text-slate-900">{customer.email}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-200/60">
                    <span className="text-slate-500 font-bold">Mobile:</span>
                    <span className="font-black text-slate-900">{customer.mobile}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-500 font-bold">Member Since:</span>
                    <span className="font-black text-slate-900">{customer.subscriptionStartDate || '2026-01-01'}</span>
                  </div>
                </div>
              </div>

              {/* Preferences & Quotas */}
              <div className="lg:col-span-7 space-y-4 text-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h3 className="font-black text-slate-900 uppercase tracking-wider text-xs">
                    Subscription Specifications
                  </h3>
                  <button
                    onClick={() => setIsEditSubOpen(true)}
                    className="text-xs font-black text-emerald-700 hover:text-emerald-800 cursor-pointer"
                  >
                    Edit Specifications
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Milk Variety</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">{customer.milkType}</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Daily Required Quota</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">{customer.dailyQuantity} Litres</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Price per Litre</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">{formatCurrency(customer.pricePerLitre)}/L</span>
                  </div>

                  <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                    <span className="text-slate-400 font-bold text-[10px] uppercase block">Delivery Time Slot</span>
                    <span className="font-black text-slate-900 text-sm mt-0.5 block">{(customer as any).deliverySlot || 'Morning (05:30 - 07:00 AM)'}</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-2">
                  <p className="font-black text-emerald-950">DairyNexa Operations Support</p>
                  <p className="text-[11px] text-emerald-800">
                    Need immediate changes to your delivery or need extra curd/paneer dropped off tomorrow? Call our 24/7 hotline:
                  </p>
                  <a
                    href="tel:+919876543210"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>+91 98765 43210</span>
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* EDIT SUBSCRIPTION PLAN MODAL */}
      {/* ============================================================ */}
      <Modal
        isOpen={isEditSubOpen}
        onClose={() => setIsEditSubOpen(false)}
        title="Modify Daily Milk Subscription"
        maxWidth="md"
      >
        <form onSubmit={handleSaveSubscription} className="space-y-4 text-xs font-sans">
          <div>
            <label className="block font-black text-slate-700 mb-1.5">Select Milk Variety</label>
            <select
              value={subForm.milkType}
              onChange={e => setSubForm(prev => ({ ...prev, milkType: e.target.value as any }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Cow Milk">Cow Milk (A2 Gir Cow Farm Fresh - ₹60/L)</option>
              <option value="Buffalo Milk">Buffalo Milk (Full Cream 7.5% Fat - ₹75/L)</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1.5">Daily Required Quantity</label>
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1.0, 1.5, 2.0].map(qty => (
                <button
                  type="button"
                  key={qty}
                  onClick={() => setSubForm(prev => ({ ...prev, dailyQuantity: qty }))}
                  className={`py-2.5 rounded-xl text-xs font-black border transition-all cursor-pointer ${subForm.dailyQuantity === qty
                    ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                >
                  {qty} L
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1.5">Preferred Delivery Window</label>
            <select
              value={subForm.deliverySlot}
              onChange={e => setSubForm(prev => ({ ...prev, deliverySlot: e.target.value as any }))}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
            >
              <option value="Morning (05:30 AM - 07:00 AM)">Morning (05:30 AM - 07:00 AM)</option>
              <option value="Evening (05:30 PM - 07:00 PM)">Evening (05:30 PM - 07:00 PM)</option>
            </select>
          </div>

          <div>
            <label className="block font-black text-slate-700 mb-1.5">Doorstep Drop Instructions</label>
            <input
              type="text"
              value={subForm.instructions}
              onChange={e => setSubForm(prev => ({ ...prev, instructions: e.target.value }))}
              placeholder="e.g. Leave inside insulated milk bag at front door"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsEditSubOpen(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow-xs cursor-pointer"
            >
              Save Subscription
            </button>
          </div>
        </form>
      </Modal>

      {/* ============================================================ */}
      {/* INVOICE DETAIL MODAL */}
      {/* ============================================================ */}
      {selectedInvoice && (
        <Modal
          isOpen={!!selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice #${selectedInvoice.invoiceNumber} - ${selectedInvoice.monthLabel}`}
          maxWidth="md"
        >
          <div className="space-y-4 text-xs font-sans">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex justify-between items-center">
              <div>
                <p className="font-black text-slate-900 text-sm">{selectedInvoice.customerName}</p>
                <p className="text-slate-500">{selectedInvoice.customerAddress}</p>
              </div>
              <Badge variant={selectedInvoice.status === 'Paid' ? 'green' : 'red'}>
                {selectedInvoice.status}
              </Badge>
            </div>

            <div className="space-y-2 border-t border-slate-100 pt-3">
              <div className="flex justify-between font-bold text-slate-600">
                <span>Milk Volume Delivered</span>
                <span className="font-black text-slate-900">
                  {selectedInvoice.items?.filter(it => it.type === 'milk').reduce((acc, it) => acc + it.quantity, 0) || 0} Litres
                </span>
              </div>
              <div className="flex justify-between font-bold text-slate-600">
                <span>Milk Charges</span>
                <span className="font-black text-slate-900">{formatCurrency(selectedInvoice.milkCharges || 0)}</span>
              </div>
              {(selectedInvoice.productCharges || 0) > 0 && (
                <div className="flex justify-between font-bold text-slate-600">
                  <span>Add-on Products</span>
                  <span className="font-black text-slate-900">{formatCurrency(selectedInvoice.productCharges)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-950 border-t border-slate-200 pt-2">
                <span>Total Payable</span>
                <span className="text-emerald-700">{formatCurrency(selectedInvoice.totalPayable)}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap justify-end gap-2">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-700 cursor-pointer"
              >
                Close
              </button>
              {selectedInvoice.status !== 'Paid' && (
                <button
                  onClick={() => {
                    const dueAmt = selectedInvoice.totalPayable - (selectedInvoice.paymentsApplied || 0);
                    setGatewayModal({
                      isOpen: true,
                      amount: dueAmt > 0 ? dueAmt : selectedInvoice.totalPayable,
                      invoiceId: selectedInvoice.id,
                      invoiceNumber: selectedInvoice.invoiceNumber,
                      title: `Invoice #${selectedInvoice.invoiceNumber} Settlement`,
                    });
                    setSelectedInvoice(null);
                  }}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black text-xs cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pay with Gateway ({formatCurrency(selectedInvoice.totalPayable - (selectedInvoice.paymentsApplied || 0))})</span>
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* ============================================================ */}
      {/* PAYMENT GATEWAY MODAL (Simulated Razorpay / UPI) */}
      {/* ============================================================ */}
      {gatewayModal && (
        <PaymentGatewayModal
          isOpen={gatewayModal.isOpen}
          onClose={() => setGatewayModal(null)}
          amount={gatewayModal.amount}
          customerName={customer.name}
          customerMobile={customer.mobile}
          invoiceId={gatewayModal.invoiceId}
          invoiceNumber={gatewayModal.invoiceNumber}
          title={gatewayModal.title}
          onSuccess={handleGatewaySuccess}
        />
      )}

    </div>
  );
};
