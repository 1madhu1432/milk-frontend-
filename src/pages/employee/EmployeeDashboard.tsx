import React, { useState, useMemo, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDairy } from '../../contexts/DairyContext';
import { deliveryApi } from '../../services/api/deliveryApi';
import { Delivery, Route } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import {
  Truck,
  CheckCircle2,
  AlertCircle,
  Search,
  Phone,
  MapPin,
  Check,
  Clock,
  Navigation,
  Sparkles,
  RotateCcw,
  User,
  ShieldCheck,
  ChevronRight,
  Play,
  Calendar,
  Layers,
  CheckCheck,
  XCircle,
  HelpCircle,
  ArrowRight,
} from 'lucide-react';

interface EmployeeDashboardProps {
  defaultTab?: 'home' | 'route' | 'deliveries' | 'history' | 'profile';
}

export const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({ defaultTab }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    currentUser,
    deliveries,
    routes,
    customers,
    markDelivered,
    markMissed,
    markPartialDelivery,
  } = useDairy();

  // Determine active view from URL path or prop
  const currentView = useMemo(() => {
    const path = location.pathname;
    if (path.includes('/employee/home')) return 'home';
    if (path.includes('/employee/route')) return 'route';
    if (path.includes('/employee/history')) return 'history';
    if (path.includes('/employee/profile')) return 'profile';
    if (path.includes('/employee/deliveries')) return 'deliveries';
    return defaultTab || 'home';
  }, [location.pathname, defaultTab]);

  // Selected Route (dynamically synced to assigned route)
  const [selectedRouteId, setSelectedRouteId] = useState('ROUTE-2');
  const [liveRiderData, setLiveRiderData] = useState<any>(null);
  const [isLoadingRider, setIsLoadingRider] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchRiderStops() {
      setIsLoadingRider(true);
      try {
        const data = await deliveryApi.getDashboard();
        if (isMounted && data) {
          setLiveRiderData(data);
          if (data.rider?.routes?.[0]?.id) {
            setSelectedRouteId(data.rider.routes[0].id);
          }
        }
      } catch (err) {
        console.debug('Live rider API note:', err);
      } finally {
        if (isMounted) setIsLoadingRider(false);
      }
    }
    fetchRiderStops();
    return () => { isMounted = false; };
  }, [currentUser.id]);

  const fallbackRoute: Route = useMemo(() => ({
    id: selectedRouteId || 'ROUTE-EMPTY',
    tenantId: 'tenant-harish-dairy',
    name: 'No Active Route Assigned',
    area: 'Unassigned Area',
    assignedEmployeeIds: [],
    assignedCustomerCount: 0,
    totalMilkRequired: 0,
    totalAdditionalProducts: 0,
    completedDeliveries: 0,
    pendingDeliveries: 0,
    missedDeliveries: 0,
    completionPercentage: 0,
  }), [selectedRouteId]);

  const assignedRoute: Route =
    routes.find(r => r.id === selectedRouteId) ||
    routes[0] ||
    fallbackRoute;

  const today = useMemo(() => {
    const todayStr = new Date().toISOString().slice(0, 10);
    if (deliveries.some(d => d.date === todayStr)) return todayStr;
    if (deliveries.length > 0 && deliveries[0].date) return deliveries[0].date;
    return todayStr;
  }, [deliveries]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'DELIVERED' | 'MISSED'>('ALL');

  // Confirmation / Action Sheet State
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [actionType, setActionType] = useState<'deliver' | 'miss' | 'partial' | null>(null);
  const [actualQty, setActualQty] = useState(1.0);
  const [missedReason, setMissedReason] = useState('Door locked & gate latched');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isReconcileModalOpen, setIsReconcileModalOpen] = useState(false);

  // Deliveries for today on this selected route
  const routeDeliveries = useMemo(() => {
    return deliveries.filter(d => (d.routeId === selectedRouteId || d.routeId === assignedRoute.id) && d.date === today);
  }, [deliveries, selectedRouteId, assignedRoute.id, today]);

  // Route metrics
  const totalPlannedLitres = routeDeliveries.reduce((acc, d) => acc + d.plannedMilkQuantity, 0);
  const totalDeliveredLitres = routeDeliveries.reduce((acc, d) => acc + d.actualMilkQuantity, 0);
  const deliveredList = routeDeliveries.filter(d => d.status === 'Delivered');
  const deliveredCount = deliveredList.length;
  const missedList = routeDeliveries.filter(d => d.status === 'Missed');
  const missedCount = missedList.length;
  const pendingList = routeDeliveries.filter(d => d.status === 'Scheduled' || d.status === 'Partially delivered');
  const pendingCount = pendingList.length;
  const completionPercent = routeDeliveries.length > 0 ? Math.round((deliveredCount / routeDeliveries.length) * 100) : 0;

  // Next Pending Customer (in sequence)
  const nextCustomer = pendingList[0] || null;
  const nextCustomerData = nextCustomer ? customers.find(c => c.id === nextCustomer.customerId) : null;

  // Filtered deliveries for list view
  const filteredDeliveries = useMemo(() => {
    return routeDeliveries.filter(d => {
      const matchesSearch =
        d.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.customerMobile.includes(searchTerm);
      if (filterStatus === 'PENDING') return matchesSearch && (d.status === 'Scheduled' || d.status === 'Partially delivered');
      if (filterStatus === 'DELIVERED') return matchesSearch && d.status === 'Delivered';
      if (filterStatus === 'MISSED') return matchesSearch && d.status === 'Missed';
      return matchesSearch;
    });
  }, [routeDeliveries, searchTerm, filterStatus]);

  // Open confirmation sheet
  const handleOpenAction = (del: Delivery, type: 'deliver' | 'miss' | 'partial') => {
    setSelectedDelivery(del);
    setActionType(type);
    setActualQty(del.plannedMilkQuantity);
    setMissedReason('Door locked & gate latched');
    setNotes('');
  };

  // 1-Tap Quick Deliver from cards
  const handleQuickDeliver = (del: Delivery) => {
    setSelectedDelivery(del);
    setActionType('deliver');
    setActualQty(del.plannedMilkQuantity);
    setNotes('Doorstep drop');
  };

  // Submit delivery confirmation sheet
  const handleConfirmAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDelivery || !actionType || isSubmitting) return;

    setIsSubmitting(true);

    try {
      if (actionType === 'deliver') {
        markDelivered(selectedDelivery.id, actualQty, notes, undefined, undefined);
        showToast(`✓ Delivered ${actualQty}L to ${selectedDelivery.customerName}`);
      } else if (actionType === 'miss') {
        markMissed(selectedDelivery.id, missedReason);
        showToast(`⚠️ Missed delivery recorded for ${selectedDelivery.customerName}`);
      } else if (actionType === 'partial') {
        markPartialDelivery(selectedDelivery.id, actualQty, missedReason);
        showToast(`✓ Partial delivery (${actualQty}L) recorded`);
      }
    } finally {
      setIsSubmitting(false);
      setSelectedDelivery(null);
      setActionType(null);
    }
  };

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3000);
  };

  return (
    <div className="space-y-4 font-sans text-slate-900">
      {/* Visual Success Toast */}
      {successToast && (
        <div className="fixed top-16 left-3 right-3 max-w-md mx-auto z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-black animate-in fade-in slide-in-from-top-4 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. MOBILE HOME SCREEN VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'home' && (
        <div className="space-y-4">
          {/* Header Card: Today's Shift & Route */}
          <div className="bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 bg-white/10 px-2.5 py-1 rounded-full border border-white/15 text-[10px] uppercase font-black tracking-wider text-emerald-200">
                  <Calendar className="w-3 h-3 text-emerald-300" />
                  {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-emerald-200 text-[11px] font-semibold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  05:30 – 08:30 AM
                </span>
              </div>

              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-300">
                  Assigned Route
                </p>
                <h1 className="text-xl font-black text-white mt-0.5 tracking-tight">
                  {assignedRoute.name}
                </h1>
                <p className="text-xs text-emerald-100/90 font-medium mt-0.5">
                  📍 {assignedRoute.area}
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-black">
                  <span className="text-emerald-200">Route Completion</span>
                  <span className="text-white bg-emerald-700/80 px-2 py-0.5 rounded-lg text-[11px]">
                    {deliveredCount} / {routeDeliveries.length} Doors ({completionPercent}%)
                  </span>
                </div>
                <div className="w-full bg-black/30 rounded-full h-3 overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${completionPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 4 Large Summary Cards */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Total Doors</span>
                <Layers className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-black text-slate-900 mt-1">{routeDeliveries.length}</p>
              <p className="text-[11px] text-slate-500 font-bold mt-0.5">{totalPlannedLitres} L Total</p>
            </div>

            <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Completed</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-2xl font-black text-emerald-800 mt-1">{deliveredCount}</p>
              <p className="text-[11px] text-emerald-700 font-bold mt-0.5">{totalDeliveredLitres} L Delivered</p>
            </div>

            <div className="bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-700">Pending</span>
                <Clock className="w-4 h-4 text-amber-600" />
              </div>
              <p className="text-2xl font-black text-amber-800 mt-1">{pendingCount}</p>
              <p className="text-[11px] text-amber-700 font-bold mt-0.5">To Be Dropped</p>
            </div>

            <div className="bg-rose-50/70 p-3.5 rounded-2xl border border-rose-200/90 shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-700">Missed</span>
                <XCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-2xl font-black text-rose-800 mt-1">{missedCount}</p>
              <p className="text-[11px] text-rose-700 font-bold mt-0.5">Skipped / Locked</p>
            </div>
          </div>

          {/* Prominent Action Button: Start / Continue Route */}
          <button
            onClick={() => navigate('/employee/deliveries')}
            className="w-full min-h-[52px] bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white font-black py-3.5 px-4 rounded-2xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{pendingCount > 0 ? `Continue Route (${pendingCount} Doors Left)` : 'Review Daily Deliveries'}</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </button>

          {/* Next Customer Card */}
          {nextCustomer && (
            <div className="bg-white rounded-3xl border border-emerald-300/90 p-4 shadow-sm space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  Next Stop in Queue
                </span>
                <span className="text-xs font-black text-slate-400">Stop #{nextCustomer.id.slice(-2)}</span>
              </div>

              <div>
                <div className="flex items-center gap-1.5 text-slate-900 font-black text-base">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{nextCustomerData ? `${nextCustomerData.houseNo}, ${nextCustomerData.street}` : nextCustomer.customerName}</span>
                </div>
                <p className="text-xs text-slate-600 font-bold mt-0.5">
                  {nextCustomer.customerName} {nextCustomerData ? `• ${nextCustomerData.area}` : ''}
                </p>
              </div>

              {/* Milk Details */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">🥛</span>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-black block">Milk Requirement</span>
                    <span className="font-black text-slate-900 text-sm">{nextCustomer.plannedMilkQuantity} Litres • {nextCustomer.milkType}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Next Stop */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <a
                  href={`tel:${nextCustomer.customerMobile}`}
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Call</span>
                </a>

                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    nextCustomerData ? `${nextCustomerData.houseNo}, ${nextCustomerData.street}, Hyderabad` : nextCustomer.customerName
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="min-h-[44px] flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
                >
                  <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Map</span>
                </a>

                <button
                  onClick={() => handleQuickDeliver(nextCustomer)}
                  className="min-h-[44px] flex items-center justify-center gap-1 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black shadow-xs cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Deliver</span>
                </button>
              </div>
            </div>
          )}

          {!nextCustomer && (
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 text-center space-y-2 shadow-2xs">
              <Truck className="w-10 h-10 text-slate-300 mx-auto" />
              <h3 className="text-sm font-black text-slate-800">No Pending Stops in Queue</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Customer delivery drops for today will automatically appear here once subscriptions and routes are configured in the Admin workspace.
              </p>
            </div>
          )}

          {/* Quick Shift Reconciliation Footer Button */}
          <button
            onClick={() => setIsReconcileModalOpen(true)}
            className="w-full py-3 px-4 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-2xl text-xs font-black transition-all flex items-center justify-center gap-2 shadow-2xs cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Shift Reconcile & Canister Count</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. MY ROUTE VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'route' && (
        <div className="space-y-4">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200/90 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                {routes.length} Daily Routes Available
              </span>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Tap to switch
              </span>
            </div>

            {/* Route Pills Switcher */}
            {routes.length === 0 ? (
              <p className="text-xs text-slate-500 py-3 text-center font-medium">
                No delivery routes created yet. Add routes in Admin workspace.
              </p>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {routes.map(r => {
                  const isSelected = selectedRouteId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRouteId(r.id)}
                      className={`min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-2 border ${isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                      <span>{(r.name || '').split(' - ')[0]}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                      >
                        {r.assignedCustomerCount || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Route Details Card */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Active Selection
              </span>
              <h2 className="text-lg font-black text-slate-900 mt-1">{assignedRoute.name}</h2>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">Area: {assignedRoute.area}</p>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-100 text-center">
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-black block">Customers</span>
                <span className="text-sm font-black text-slate-900">{assignedRoute.assignedCustomerCount} Doors</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-black block">Milk Need</span>
                <span className="text-sm font-black text-slate-900">{totalPlannedLitres} Litres</span>
              </div>
              <div className="p-2 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-400 font-black block">Add-ons</span>
                <span className="text-sm font-black text-slate-900">8 Packs</span>
              </div>
            </div>
          </div>

          {/* Sequence Stop Roadmap (Delivery Order) */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Delivery Sequence Stops ({routeDeliveries.length})
              </h3>
              <span className="text-[11px] text-slate-500 font-bold">1-to-N order</span>
            </div>

            {routeDeliveries.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center font-medium bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                No delivery sequence stops assigned for this route today.
              </p>
            ) : (
              <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                {routeDeliveries.map((del, idx) => {
                  const isDelivered = del.status === 'Delivered';
                  const isMissed = del.status === 'Missed';
                  const cust = customers.find(c => c.id === del.customerId);

                  return (
                    <div
                      key={del.id}
                      className={`p-3 rounded-2xl border flex items-center justify-between gap-2 transition-all ${isDelivered
                        ? 'bg-emerald-50/40 border-emerald-200/80'
                        : isMissed
                          ? 'bg-rose-50/40 border-rose-200/80'
                          : 'bg-slate-50/80 border-slate-200 hover:border-emerald-300'
                        }`}
                    >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-[11px] shrink-0 ${isDelivered
                          ? 'bg-emerald-600 text-white'
                          : isMissed
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-200 text-slate-700'
                          }`}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="font-black text-xs text-slate-900 leading-tight">
                          {cust ? `${cust.houseNo}` : del.customerName}
                        </p>
                        <p className="text-[11px] text-slate-500 font-bold truncate max-w-[170px]">
                          {del.customerName} • {del.plannedMilkQuantity}L {del.milkType.split(' ')[0]}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {isDelivered ? (
                        <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-lg border border-emerald-300">
                          ✓ {del.actualMilkQuantity}L
                        </span>
                      ) : isMissed ? (
                        <span className="text-[10px] font-black text-rose-800 bg-rose-100 px-2 py-0.5 rounded-lg border border-rose-300">
                          Missed
                        </span>
                      ) : (
                        <button
                          onClick={() => handleQuickDeliver(del)}
                          className="min-h-[36px] px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black shadow-2xs cursor-pointer"
                        >
                          Deliver
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. DELIVERIES LIST & COMPLETE FLOW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'deliveries' && (
        <div className="space-y-3.5">
          {/* Route Switcher */}
          <div className="bg-white p-2.5 rounded-2xl border border-slate-200/90 shadow-2xs">
            {routes.length === 0 ? (
              <p className="text-xs text-slate-500 py-1.5 text-center font-medium">
                No delivery routes configured yet
              </p>
            ) : (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {routes.map(r => {
                  const isSelected = selectedRouteId === r.id;
                  return (
                    <button
                      key={r.id}
                      onClick={() => setSelectedRouteId(r.id)}
                      className={`min-h-[44px] px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 cursor-pointer flex items-center gap-1.5 border ${isSelected
                        ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                    >
                      <span>{(r.name || '').split(' - ')[0]}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-700'
                          }`}
                      >
                        {r.assignedCustomerCount || 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Filter Chips (Min 44px touch targets) */}
          <div className="grid grid-cols-4 bg-white p-1 rounded-2xl border border-slate-200/90 shadow-2xs text-xs font-black gap-1">
            <button
              onClick={() => setFilterStatus('ALL')}
              className={`min-h-[44px] rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center ${filterStatus === 'ALL'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span>All</span>
              <span className="text-[10px] opacity-80">({routeDeliveries.length})</span>
            </button>
            <button
              onClick={() => setFilterStatus('PENDING')}
              className={`min-h-[44px] rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center ${filterStatus === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span>Pending</span>
              <span className="text-[10px] opacity-80">({pendingCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('DELIVERED')}
              className={`min-h-[44px] rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center ${filterStatus === 'DELIVERED'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span>Done</span>
              <span className="text-[10px] opacity-80">({deliveredCount})</span>
            </button>
            <button
              onClick={() => setFilterStatus('MISSED')}
              className={`min-h-[44px] rounded-xl transition-all cursor-pointer text-center flex flex-col items-center justify-center ${filterStatus === 'MISSED'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
                }`}
            >
              <span>Missed</span>
              <span className="text-[10px] opacity-80">({missedCount})</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search flat, house number, customer..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs rounded-2xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 shadow-2xs font-semibold"
            />
          </div>

          {/* Vertical Mobile Delivery Cards */}
          <div className="space-y-3">
            {filteredDeliveries.length === 0 ? (
              <div className="py-12 px-4 text-center bg-white rounded-3xl border border-dashed border-slate-200 shadow-2xs">
                <Truck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-700">No deliveries found</p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {searchTerm ? 'No stops match your search criteria' : 'Deliveries will appear here once customers and subscriptions are scheduled'}
                </p>
              </div>
            ) : (
              filteredDeliveries.map((del, idx) => {
              const isDone = del.status === 'Delivered';
              const isMissed = del.status === 'Missed';
              const isPending = del.status === 'Scheduled' || del.status === 'Partially delivered';
              const cust = customers.find(c => c.id === del.customerId);
              const stopNumber = (idx + 1).toString().padStart(2, '0');

              return (
                <div
                  key={del.id}
                  className={`bg-white rounded-3xl border p-4 shadow-xs transition-all space-y-3 ${isDone
                    ? 'border-emerald-200/80 bg-emerald-50/20'
                    : isMissed
                      ? 'border-rose-200/80 bg-rose-50/20'
                      : 'border-slate-200/90 shadow-sm'
                    }`}
                >
                  {/* Card Header: Stop Number, House Number, Customer Name */}
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5">
                      <span
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${isDone
                          ? 'bg-emerald-600 text-white'
                          : isMissed
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-900 text-white'
                          }`}
                      >
                        #{stopNumber}
                      </span>

                      <div>
                        <div className="flex items-center gap-1.5 text-slate-900 font-black text-sm">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          <span className="leading-tight">
                            {cust ? `${cust.houseNo}, ${cust.street}` : del.routeName}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-bold mt-0.5">
                          {del.customerName} {cust ? `• ${cust.area}` : ''}
                        </p>
                      </div>
                    </div>

                    <Badge variant={isDone ? 'green' : isPending ? 'blue' : isMissed ? 'red' : 'amber'}>
                      {del.status}
                    </Badge>
                  </div>

                  {/* Milk Requirement Specs */}
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl">🥛</span>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-black block leading-none mb-1">
                          Milk Requirement
                        </span>
                        <span className="font-black text-sm text-slate-900">
                          {del.plannedMilkQuantity} L • {del.milkType}
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block leading-none mb-1">
                        {isDone ? 'Dropped' : 'Slot'}
                      </span>
                      <span
                        className={`font-black text-sm ${isDone ? 'text-emerald-700' : 'text-slate-700'
                          }`}
                      >
                        {isDone ? `${del.actualMilkQuantity} L` : 'Morning'}
                      </span>
                    </div>
                  </div>

                  {/* Add-on Dairy Products Tag */}
                  {del.additionalProducts && del.additionalProducts.length > 0 && (
                    <div className="text-xs font-black text-emerald-900 bg-emerald-100/70 border border-emerald-300/60 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                      <span>
                        Add-ons: {del.additionalProducts.map(p => `${p.productName} (${p.actualQty})`).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* Delivery Note */}
                  {del.deliveryNotes && (
                    <div className="text-[11px] text-amber-900 bg-amber-50 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
                      <span className="text-amber-700 shrink-0">📍 Drop Note:</span>
                      <span>{del.deliveryNotes}</span>
                    </div>
                  )}

                  {/* Missed Exception Reason */}
                  {del.exceptionReason && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 border border-rose-200/80 px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{del.exceptionReason}</span>
                    </div>
                  )}

                  {/* Touch-Friendly Action Bar (Min 44px Height) */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <a
                      href={`tel:${del.customerMobile}`}
                      className="min-h-[44px] inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
                      title="Call Customer"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Call</span>
                    </a>

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        cust ? `${cust.houseNo}, ${cust.street}, Hyderabad` : del.routeName
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="min-h-[44px] inline-flex items-center justify-center gap-1 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors shrink-0"
                      title="Navigate via Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Map</span>
                    </a>

                    {isPending ? (
                      <div className="flex items-center gap-1.5 flex-1 justify-end">
                        <button
                          onClick={() => handleOpenAction(del, 'deliver')}
                          className="flex-1 min-h-[44px] py-2 px-3 bg-gradient-to-r from-emerald-600 to-green-700 hover:from-emerald-700 hover:to-green-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        >
                          <Check className="w-4 h-4" />
                          <span>Deliver {del.plannedMilkQuantity}L</span>
                        </button>

                        <button
                          onClick={() => handleOpenAction(del, 'partial')}
                          className="min-h-[44px] px-2.5 py-2 bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Partial
                        </button>

                        <button
                          onClick={() => handleOpenAction(del, 'miss')}
                          className="min-h-[44px] px-2.5 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl text-[11px] font-bold transition-all cursor-pointer"
                        >
                          Missed
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 justify-end">
                        <span className="text-xs font-black text-emerald-800 bg-emerald-100/70 border border-emerald-200 px-3 py-2 rounded-xl flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Dropped ({del.actualMilkQuantity}L)</span>
                        </span>

                        <button
                          onClick={() => handleOpenAction(del, 'deliver')}
                          className="min-h-[44px] px-3 py-2 text-xs text-slate-600 hover:text-slate-900 font-bold hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. HISTORY VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'history' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  Shift Delivery History
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">Today's Completed Drops</h2>
              </div>
              <span className="text-sm font-black text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {deliveredCount} Delivered
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-center pt-1 border-t border-slate-100">
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-black uppercase">Delivered Litres</span>
                <p className="text-xl font-black text-emerald-700 mt-0.5">{totalDeliveredLitres} L</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl">
                <span className="text-[10px] text-slate-400 font-black uppercase">On-Time Drops</span>
                <p className="text-xl font-black text-slate-900 mt-0.5">100%</p>
              </div>
            </div>
          </div>

          {/* Delivery Log List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-2.5">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Drop Logs ({deliveredList.length})
            </h3>

            {deliveredList.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No deliveries marked completed yet.</p>
            ) : (
              <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
                {deliveredList.map((del, idx) => (
                  <div
                    key={del.id}
                    className="p-3 rounded-2xl bg-emerald-50/30 border border-emerald-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-black text-slate-900">{del.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-semibold mt-0.5">
                        {del.plannedMilkQuantity}L {del.milkType} • Dropped: {del.actualMilkQuantity}L
                      </p>
                      {del.deliveryNotes && (
                        <p className="text-[10px] text-emerald-800 italic mt-0.5">Note: {del.deliveryNotes}</p>
                      )}
                    </div>
                    <span className="text-[11px] font-black text-emerald-800 bg-emerald-100 px-2 py-1 rounded-xl">
                      ✓ Done
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Empty Canister Checklist */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-4 shadow-2xs space-y-2">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">Canister & Cold Room Return</h3>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-xs text-slate-700">
              <p className="flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Empty milk canisters returned to cold storage</span>
              </p>
              <p className="flex items-center gap-1.5 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Zero leakage or spillage recorded</span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. PROFILE VIEW */}
      {/* ------------------------------------------------------------- */}
      {currentView === 'profile' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-2xs text-center space-y-2">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-emerald-600 to-green-700 text-white text-3xl font-black flex items-center justify-center mx-auto shadow-md">
              🥛
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900">{currentUser.name}</h2>
              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full border border-emerald-300 mt-1 inline-block">
                Staff ID: {currentUser.id || 'EMP-02'}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">Delivery Partner • Harish Dairy Fleet</p>
          </div>

          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-2xs space-y-3 text-xs">
            <h3 className="font-black text-slate-900 uppercase tracking-wider text-[11px]">Staff Details</h3>

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Assigned Hub:</span>
                <span className="font-black text-slate-900">Madhapur Cold Hub, Cluster 2</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Shift Schedule:</span>
                <span className="font-black text-slate-900">Morning 05:30 AM – 08:30 AM</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
                <span className="text-slate-500 font-bold">Delivery Vehicle:</span>
                <span className="font-black text-slate-900">TVS King Cargo (TS 09 UA 4412)</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100">
              <p className="text-[11px] font-bold text-slate-500 mb-1.5">Dairy Supervisor Emergency Line:</p>
              <a
                href="tel:+919876543210"
                className="w-full min-h-[44px] bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-black rounded-xl p-3 flex items-center justify-center gap-2 border border-emerald-200 transition-colors"
              >
                <Phone className="w-4 h-4 text-emerald-700" />
                <span>Call Dairy Hub (+91 98765 43210)</span>
              </a>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            onClick={() => {
              if (window.confirm('Sign out from Delivery Rider session?')) {
                navigate('/login/delivery');
              }
            }}
            className="w-full min-h-[48px] bg-rose-50 hover:bg-rose-100 text-rose-700 font-black rounded-2xl p-3 flex items-center justify-center gap-2 border border-rose-200 transition-colors cursor-pointer text-xs"
          >
            <RotateCcw className="w-4 h-4 text-rose-600" />
            <span>Sign Out from Rider App</span>
          </button>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* CONFIRMATION / ACTION SHEET MODAL */}
      {/* ------------------------------------------------------------- */}
      {selectedDelivery && actionType && (
        <Modal
          isOpen={!!selectedDelivery}
          onClose={() => {
            setSelectedDelivery(null);
            setActionType(null);
          }}
          title={
            actionType === 'deliver'
              ? 'Confirm Doorstep Milk Drop'
              : actionType === 'partial'
                ? 'Record Partial Milk Drop'
                : 'Mark Missed Delivery'
          }
          maxWidth="sm"
        >
          <form onSubmit={handleConfirmAction} className="space-y-4 text-xs font-sans">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <p className="font-black text-sm text-slate-900">{selectedDelivery.customerName}</p>
              <p className="text-slate-600 font-medium mt-0.5">
                Scheduled: {selectedDelivery.plannedMilkQuantity}L • {selectedDelivery.milkType}
              </p>
            </div>

            {actionType === 'deliver' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Actual Dropped Quantity (Litres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="10"
                    value={actualQty}
                    onChange={e => setActualQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 font-black text-xl text-emerald-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">
                    Drop Note / Verification (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Left in cooler bag outside door"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs"
                  />
                </div>
              </div>
            )}

            {actionType === 'partial' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">
                    Actual Delivered Quantity (Litres)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={actualQty}
                    onChange={e => setActualQty(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-3 rounded-xl border border-slate-300 font-black text-xl text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Reason for Shortage</label>
                  <select
                    value={missedReason}
                    onChange={e => setMissedReason(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold outline-none"
                  >
                    <option value="Customer asked for less quantity today">Customer asked for less quantity today</option>
                    <option value="Vehicle morning canister stock limit">Vehicle morning canister stock limit</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>
            )}

            {actionType === 'miss' && (
              <div className="space-y-3">
                <div>
                  <label className="block font-black text-slate-700 mb-1">Missed Exception Reason *</label>
                  <select
                    value={missedReason}
                    onChange={e => setMissedReason(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-rose-500 outline-none"
                  >
                    <option value="Door locked & gate latched">Door locked & gate latched</option>
                    <option value="Customer requested skip / vacation">Customer requested skip / vacation</option>
                    <option value="Milk can/bag not kept outside">Milk can/bag not kept outside</option>
                    <option value="Apartment gate locked / guard denied entry">Apartment gate locked / guard denied entry</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block font-medium text-slate-600 mb-1">Staff Note</label>
                  <input
                    type="text"
                    placeholder="e.g. Called customer 2 times, no answer"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300"
                  />
                </div>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2 border-t">
              <button
                type="button"
                onClick={() => {
                  setSelectedDelivery(null);
                  setActionType(null);
                }}
                className="flex-1 min-h-[44px] px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 min-h-[44px] px-3 py-2.5 text-white rounded-xl font-black shadow-xs cursor-pointer ${actionType === 'miss'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
              >
                {isSubmitting ? 'Saving...' : actionType === 'miss' ? 'Confirm Missed' : 'Confirm Drop'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SHIFT RECONCILIATION MODAL */}
      {/* ------------------------------------------------------------- */}
      <Modal
        isOpen={isReconcileModalOpen}
        onClose={() => setIsReconcileModalOpen(false)}
        title="Morning Shift Reconcile"
        maxWidth="sm"
      >
        <div className="space-y-3 text-xs font-sans">
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1.5 text-emerald-950">
            <h4 className="font-black text-sm text-emerald-900">{assignedRoute.name}</h4>
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <p>• Planned: <strong>{totalPlannedLitres} L</strong></p>
              <p>• Dropped: <strong>{totalDeliveredLitres} L</strong></p>
              <p>• Completed: <strong>{deliveredCount} Doors</strong></p>
              <p>• Missed: <strong>{missedCount} Doors</strong></p>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed font-medium">
            Customer accounts and statements are automatically synchronized with the dairy billing system.
          </p>

          <div className="flex justify-end gap-2 pt-2 border-t">
            <button
              onClick={() => setIsReconcileModalOpen(false)}
              className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => {
                alert('Shift milk log synchronized successfully with dairy cold room!');
                setIsReconcileModalOpen(false);
              }}
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-black shadow-xs cursor-pointer"
            >
              Submit Shift Log
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
