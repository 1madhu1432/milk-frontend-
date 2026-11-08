import React, { useState } from 'react';
import {
  Building2,
  Search,
  Plus,
  ArrowRight,
  UserCheck,
  Calendar,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Activity,
  History,
  Gauge,
  X,
  FileText,
  RefreshCw,
  Edit,
  Share2,
  Copy,
  ExternalLink,
  Check,
} from 'lucide-react';
import { superAdminApi, TenantUsageSummary, TenantSubscriptionHistory } from '../../../services/api/superAdminApi';

interface TenantsTabProps {
  tenants: any[];
  plans: any[];
  totalTenants: number;
  page: number;
  limit: number;
  totalPages: number;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  search: string;
  statusFilter: string;
  planFilter: string;
  onPageChange: (newPage: number) => void;
  onLimitChange: (newLimit: number) => void;
  onSortChange: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
  onSearchChange: (search: string) => void;
  onStatusFilterChange: (status: string) => void;
  onPlanFilterChange: (planId: string) => void;
  onCreateTenantClick: () => void;
  onEditTenant: (tenant: any) => void;
  onImpersonate: (tenantId: string) => void;
  onOpenUsers: (tenant: any) => void;
  onOpenExtendTrial: (tenant: any) => void;
  onOpenChangePlan: (tenant: any) => void;
  onSuspendTenant: (tenant: any) => void;
  onReactivateTenant: (tenantId: string, reason: string) => Promise<void>;
  onRefresh: () => void;
}

export const TenantsTab: React.FC<TenantsTabProps> = ({
  tenants,
  plans,
  totalTenants,
  page,
  limit,
  totalPages,
  sortBy,
  sortOrder,
  search,
  statusFilter,
  planFilter,
  onPageChange,
  onLimitChange,
  onSortChange,
  onSearchChange,
  onStatusFilterChange,
  onPlanFilterChange,
  onCreateTenantClick,
  onEditTenant,
  onImpersonate,
  onOpenUsers,
  onOpenExtendTrial,
  onOpenChangePlan,
  onSuspendTenant,
  onReactivateTenant,
  onRefresh,
}) => {
  // Usage Modal State
  const [selectedUsageTenant, setSelectedUsageTenant] = useState<any | null>(null);
  const [usageSummary, setUsageSummary] = useState<TenantUsageSummary | null>(null);
  const [loadingUsage, setLoadingUsage] = useState<boolean>(false);

  // History & Activity Modal State
  const [selectedHistoryTenant, setSelectedHistoryTenant] = useState<any | null>(null);
  const [subscriptionHistory, setSubscriptionHistory] = useState<TenantSubscriptionHistory | null>(null);
  const [activityTimeline, setActivityTimeline] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);

  // Reactivate Confirmation Modal State
  const [reactivatingTenant, setReactivatingTenant] = useState<any | null>(null);
  const [reactivateReason, setReactivateReason] = useState<string>('');
  const [submittingReactivate, setSubmittingReactivate] = useState<boolean>(false);
  const [reactivateError, setReactivateError] = useState<string>('');

  // Share Links Modal State
  const [selectedShareTenant, setSelectedShareTenant] = useState<any | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (key: string, text: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Handle open usage summary modal
  const handleOpenUsage = async (tenant: any) => {
    setSelectedUsageTenant(tenant);
    setLoadingUsage(true);
    try {
      const summary = await superAdminApi.getTenantUsage(tenant.id);
      setUsageSummary(summary);
    } catch {
      // Fallback usage approximation from current tenant counts
      setUsageSummary({
        tenantId: tenant.id,
        tenantName: tenant.name,
        plan: null,
        usage: {
          customers: tenant._count?.customers || 0,
          deliveryStaff: tenant._count?.employees || 0,
          routes: tenant._count?.routes || 0,
        },
        limits: {
          maxCustomers: 500,
          maxDeliveryStaff: 10,
          maxRoutes: 10,
        },
        percentages: {
          customers: Math.min(100, Math.round(((tenant._count?.customers || 0) / 500) * 100)),
          deliveryStaff: Math.min(100, Math.round(((tenant._count?.employees || 0) / 10) * 100)),
          routes: Math.min(100, Math.round(((tenant._count?.routes || 0) / 10) * 100)),
        },
        warnings: [],
      });
    } finally {
      setLoadingUsage(false);
    }
  };

  // Handle open history & activity modal
  const handleOpenHistory = async (tenant: any) => {
    setSelectedHistoryTenant(tenant);
    setLoadingHistory(true);
    try {
      const [subs, act] = await Promise.all([
        superAdminApi.getTenantSubscriptions(tenant.id),
        superAdminApi.getTenantActivity(tenant.id, 25),
      ]);
      setSubscriptionHistory(subs);
      setActivityTimeline(act);
    } catch {
      setSubscriptionHistory({ tenantId: tenant.id, subscriptions: [], events: [] });
      setActivityTimeline([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Handle submit reactivation
  const handleConfirmReactivation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reactivatingTenant) return;
    if (!reactivateReason.trim()) {
      setReactivateError('A reason for reactivation is required for platform compliance.');
      return;
    }
    setSubmittingReactivate(true);
    setReactivateError('');
    try {
      await onReactivateTenant(reactivatingTenant.id, reactivateReason.trim());
      setReactivatingTenant(null);
      setReactivateReason('');
    } catch (err: any) {
      setReactivateError(err.message || 'Failed to reactivate tenant.');
    } finally {
      setSubmittingReactivate(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Directory Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            Dairy Tenants Directory ({totalTenants})
          </h2>
          <p className="text-xs text-slate-400">
            Multi-tenant directory with server-side pagination, quota monitoring, and subscription lifecycle controls.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, slug, phone..."
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 w-48 sm:w-56"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => onStatusFilterChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="all">All Statuses</option>
            <option value="ACTIVE">Active Paid</option>
            <option value="TRIAL">Trial</option>
            <option value="SUSPENDED">Suspended</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={e => onPlanFilterChange(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="all">All Plans</option>
            {plans.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={e => {
              const [sb, so] = e.target.value.split('-');
              onSortChange(sb, so as 'asc' | 'desc');
            }}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
          >
            <option value="createdAt-desc">Newest First</option>
            <option value="createdAt-asc">Oldest First</option>
            <option value="name-asc">Name (A-Z)</option>
            <option value="name-desc">Name (Z-A)</option>
            <option value="status-asc">Status (Asc)</option>
          </select>

          {/* New Dairy Button */}
          <button
            onClick={onCreateTenantClick}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Dairy</span>
          </button>
        </div>
      </div>

      {/* Tenants Grid */}
      {tenants.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Building2 className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">No Dairy Tenants Found</h3>
          <p className="text-xs text-slate-400">
            No tenants matched the search query or status filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tenants.map(t => {
            const plan = plans.find(p => p.id === t.planId) || { name: 'Growth Plan', priceMonthly: 6999 };
            const customerCount = t._count?.customers ?? 0;
            const employeeCount = t._count?.employees ?? 0;
            const routeCount = t._count?.routes ?? 0;

            const isSuspended = t.status === 'SUSPENDED';
            const isTrial = t.status === 'TRIAL';
            const isActive = t.status === 'ACTIVE';

            return (
              <div
                key={t.id}
                className={`rounded-2xl p-5 bg-slate-900/80 border transition-all flex flex-col justify-between shadow-sm space-y-4 ${
                  isSuspended
                    ? 'border-rose-900/40 bg-slate-950/90'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl font-bold border shadow-inner shrink-0"
                        style={{
                          backgroundColor: `${t.primaryColor || '#059669'}20`,
                          borderColor: t.primaryColor || '#059669',
                          color: t.primaryColor || '#059669',
                        }}
                      >
                        {t.logoEmoji || '🥛'}
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {t.name}
                        </h3>
                        <p className="text-xs text-emerald-400 font-mono font-bold">{t.slug}.dairynexa.com</p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                        isActive
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : isTrial
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : isSuspended
                          ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : 'bg-slate-700 text-slate-300 border-slate-600'
                      }`}
                    >
                      {t.status}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Owner:</span>
                      <span className="text-slate-200 font-medium">{t.ownerName}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Contact:</span>
                      <span className="text-slate-300 font-mono text-[11px]">{t.ownerPhone}</span>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Plan:</span>
                      <span className="text-indigo-300 font-bold">{plan.name}</span>
                    </div>
                    {t.trialEndsAt && isTrial && (
                      <div className="flex items-center justify-between text-amber-400">
                        <span>Trial Ends:</span>
                        <span className="font-bold text-[11px]">
                          {new Date(t.trialEndsAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-slate-400">
                      <span>Entities:</span>
                      <span className="text-slate-200 font-semibold">
                        {customerCount} Cust • {employeeCount} Staff • {routeCount} Routes
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onImpersonate(t.id)}
                      className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      title="Open Dairy Admin Console via Secure Impersonation"
                    >
                      <span>Impersonate</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => setSelectedShareTenant(t)}
                      className="px-2.5 py-1.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1 cursor-pointer"
                      title="Share Portal URLs for Customers, Delivery Boys & Admin"
                    >
                      <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Share Links</span>
                    </button>

                    <button
                      onClick={() => onOpenUsers(t)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                      title="Manage Provisioned Staff Accounts"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenUsage(t)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                      title="Inspect Real Plan Quota & Usage"
                    >
                      <Gauge className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleOpenHistory(t)}
                      className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-bold transition-all cursor-pointer"
                      title="Subscription History & Audit Log"
                    >
                      <History className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Secondary Actions */}
                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-400">
                    <button
                      onClick={() => onEditTenant(t)}
                      className="hover:text-slate-200 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <Edit className="w-3 h-3" />
                      <span>Edit</span>
                    </button>

                    {isTrial && (
                      <button
                        onClick={() => onOpenExtendTrial(t)}
                        className="hover:text-amber-300 transition-colors cursor-pointer text-amber-400 font-medium"
                      >
                        + Extend Trial
                      </button>
                    )}

                    <button
                      onClick={() => onOpenChangePlan(t)}
                      className="hover:text-indigo-300 transition-colors cursor-pointer text-indigo-400 font-medium"
                    >
                      Change Plan
                    </button>

                    {isSuspended ? (
                      <button
                        onClick={() => {
                          setReactivatingTenant(t);
                          setReactivateReason('');
                          setReactivateError('');
                        }}
                        className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                      >
                        Reactivate
                      </button>
                    ) : (
                      <button
                        onClick={() => onSuspendTenant(t)}
                        className="hover:text-rose-400 transition-colors cursor-pointer text-rose-500 font-medium"
                      >
                        Suspend
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Server-Side Pagination Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-xs text-slate-400">
          Showing <span className="text-white font-bold">{Math.min(totalTenants, (page - 1) * limit + 1)}</span> to{' '}
          <span className="text-white font-bold">{Math.min(totalTenants, page * limit)}</span> of{' '}
          <span className="text-white font-bold">{totalTenants}</span> dairy businesses
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span>Per page:</span>
            <select
              value={limit}
              onChange={e => onLimitChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
            >
              <option value={6}>6</option>
              <option value={12}>12</option>
              <option value={24}>24</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-1 text-xs font-bold text-white bg-slate-950 rounded-lg border border-slate-800">
              {page} / {Math.max(1, totalPages)}
            </span>

            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* =================================================================== */}
      {/* MODAL 1: TENANT USAGE & PLAN QUOTA FLYOUT                           */}
      {/* =================================================================== */}
      {selectedUsageTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Gauge className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedUsageTenant.name}</h3>
                  <p className="text-xs text-indigo-300 font-mono">Plan Quota & Consumption</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedUsageTenant(null);
                  setUsageSummary(null);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {loadingUsage ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
                <span>Measuring tenant database entities...</span>
              </div>
            ) : usageSummary ? (
              <div className="space-y-4">
                {/* Warnings */}
                {usageSummary.warnings && usageSummary.warnings.length > 0 && (
                  <div className="p-3 rounded-xl bg-amber-950/60 border border-amber-800/80 space-y-1 text-xs">
                    <div className="flex items-center gap-2 text-amber-300 font-bold">
                      <AlertTriangle className="w-4 h-4" />
                      <span>Capacity Limit Alerts:</span>
                    </div>
                    {usageSummary.warnings.map((w, idx) => (
                      <p key={idx} className="text-amber-200/90 pl-6 text-[11px]">
                        • {w}
                      </p>
                    ))}
                  </div>
                )}

                {/* Progress Bars */}
                <div className="space-y-3">
                  {/* Customers */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Subscribed Households</span>
                      <span className="text-white font-mono font-bold">
                        {usageSummary.usage.customers} / {usageSummary.limits.maxCustomers >= 99999 ? 'Unlimited' : usageSummary.limits.maxCustomers}
                        {' '}({usageSummary.percentages.customers}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usageSummary.percentages.customers >= 100
                            ? 'bg-rose-500'
                            : usageSummary.percentages.customers >= 80
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(usageSummary.percentages.customers, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Delivery Staff */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Delivery Staff</span>
                      <span className="text-white font-mono font-bold">
                        {usageSummary.usage.deliveryStaff} / {usageSummary.limits.maxDeliveryStaff}
                        {' '}({usageSummary.percentages.deliveryStaff}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usageSummary.percentages.deliveryStaff >= 100
                            ? 'bg-rose-500'
                            : usageSummary.percentages.deliveryStaff >= 80
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${Math.min(usageSummary.percentages.deliveryStaff, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* Delivery Routes */}
                  <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-300 font-semibold">Delivery Routes</span>
                      <span className="text-white font-mono font-bold">
                        {usageSummary.usage.routes} / {usageSummary.limits.maxRoutes}
                        {' '}({usageSummary.percentages.routes}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          usageSummary.percentages.routes >= 100
                            ? 'bg-rose-500'
                            : usageSummary.percentages.routes >= 80
                            ? 'bg-amber-500'
                            : 'bg-purple-500'
                        }`}
                        style={{ width: `${Math.min(usageSummary.percentages.routes, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      setSelectedUsageTenant(null);
                      setUsageSummary(null);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: TENANT SUBSCRIPTION HISTORY & ACTIVITY TIMELINE            */}
      {/* =================================================================== */}
      {selectedHistoryTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl max-h-[90vh] flex flex-col animate-scale-up">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">{selectedHistoryTenant.name}</h3>
                  <p className="text-xs text-purple-300 font-mono">Subscription History & Activity Timeline</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedHistoryTenant(null);
                  setSubscriptionHistory(null);
                  setActivityTimeline([]);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6 pr-2">
              {loadingHistory ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-xs text-slate-400">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                  <span>Loading tenant subscription lifecycle & audit events...</span>
                </div>
              ) : (
                <>
                  {/* Subscription Records */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      Subscription Orders ({subscriptionHistory?.subscriptions?.length || 0})
                    </h4>
                    {subscriptionHistory?.subscriptions?.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        No billing subscription invoices recorded yet. Currently in trial evaluation.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {subscriptionHistory?.subscriptions?.map((sub: any) => (
                          <div
                            key={sub.id}
                            className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-4 text-xs"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white uppercase">{sub.billingInterval} Plan</span>
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                                  {sub.status}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1">
                                Period: {new Date(sub.currentPeriodStart).toLocaleDateString()} –{' '}
                                {new Date(sub.currentPeriodEnd).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-mono font-bold text-white text-sm">
                                ₹{Number(sub.amountPaid || 0).toLocaleString('en-IN')}
                              </p>
                              <span className="text-[10px] text-slate-500">
                                {sub.autoRenew ? 'Auto-renews' : 'Manual'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Activity Timeline */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Platform Audit Log ({activityTimeline.length} entries)
                    </h4>
                    {activityTimeline.length === 0 ? (
                      <p className="text-xs text-slate-400 p-3 bg-slate-950/60 rounded-xl border border-slate-800">
                        No audit events recorded for this tenant yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {activityTimeline.map((item: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-slate-950/40 border border-slate-800 text-xs space-y-1"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-indigo-300 font-mono text-[11px]">
                                {item.action}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(item.createdAt).toLocaleString()}
                              </span>
                            </div>
                            {item.details && (
                              <p className="text-[11px] text-slate-400 font-mono">
                                {typeof item.details === 'string'
                                  ? item.details
                                  : JSON.stringify(item.details)}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => {
                  setSelectedHistoryTenant(null);
                  setSubscriptionHistory(null);
                  setActivityTimeline([]);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 3: REACTIVATION CONFIRMATION WITH MANDATORY REASON           */}
      {/* =================================================================== */}
      {reactivatingTenant && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleConfirmReactivation}
            className="bg-slate-900 border border-emerald-900/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Reactivate Dairy</h3>
                  <p className="text-xs text-emerald-400 font-semibold">{reactivatingTenant.name}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReactivatingTenant(null)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Reactivating this dairy will immediately restore employee and customer portal access. Per compliance rules, you must record an operational justification in the platform audit log.
            </p>

            {reactivateError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold">
                {reactivateError}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Reason for Reactivation <span className="text-rose-400">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={reactivateReason}
                onChange={e => setReactivateReason(e.target.value)}
                placeholder="e.g. Payment settlement verified via bank transaction #TXN9982, account restored."
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setReactivatingTenant(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingReactivate}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingReactivate ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Reactivating...</span>
                  </>
                ) : (
                  <span>Confirm Reactivation</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 4: SHAREABLE PORTAL URLS FOR TENANT                          */}
      {/* =================================================================== */}
      {selectedShareTenant && (() => {
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173';
        const isLocal = origin.includes('localhost') || origin.includes('127.0.0.1');
        const slug = selectedShareTenant.slug || 'madhu';
        const dairyTitle = selectedShareTenant.name || 'Dairy';

        const customerUrl = `${origin}/login/customer?dairy=${slug}`;
        const customerSubdomain = isLocal ? `http://${slug}.localhost:5173/login/customer` : `https://${slug}.dairynexa.com/login/customer`;

        const deliveryUrl = `${origin}/login/delivery?dairy=${slug}`;
        const deliverySubdomain = isLocal ? `http://${slug}.localhost:5173/login/delivery` : `https://${slug}.dairynexa.com/login/delivery`;

        const adminUrl = `${origin}/login/admin?dairy=${slug}`;
        const adminSubdomain = isLocal ? `http://${slug}.localhost:5173/login/admin` : `https://${slug}.dairynexa.com/login/admin`;

        const waMessage = `Namaste! Welcome to ${dairyTitle}. Manage your daily doorstep milk delivery, weekday quotas, and pay bills easily online:\n${customerUrl}`;

        return (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up text-white">
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-xl shadow-inner">
                    {selectedShareTenant.logoEmoji || '🥛'}
                  </div>
                  <div>
                    <h3 className="text-base font-black text-white flex items-center gap-1.5">
                      Share Portal Links
                    </h3>
                    <p className="text-xs text-emerald-400 font-semibold font-mono">
                      {dairyTitle} • slug: {slug}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedShareTenant(null)}
                  className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Send these direct links to customers, delivery boys, or your dairy manager. The login screen automatically brands itself for <strong>{dairyTitle}</strong>.
              </p>

              {/* Links List */}
              <div className="space-y-3.5">
                {/* 1. Customer Portal */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-blue-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                      🥛 Customer / Household Doorstep Portal
                    </span>
                    <span className="text-[10px] font-mono bg-blue-500/10 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/20 font-bold">
                      For Subscribers
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={customerUrl}
                      className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-xl truncate select-all"
                    />
                    <button
                      onClick={() => handleCopy('customer', customerUrl)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      {copiedKey === 'customer' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-blue-200" />}
                      <span>{copiedKey === 'customer' ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <a
                      href={customerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
                      title="Open link in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Subdomain URL: <span className="text-slate-400">{customerSubdomain}</span>
                  </div>
                </div>

                {/* 2. Delivery Boy Portal */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-teal-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-teal-400 flex items-center gap-1.5">
                      🚚 Delivery Staff / Rider App
                    </span>
                    <span className="text-[10px] font-mono bg-teal-500/10 text-teal-300 px-2 py-0.5 rounded-full border border-teal-500/20 font-bold">
                      For Route Riders
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={deliveryUrl}
                      className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-xl truncate select-all"
                    />
                    <button
                      onClick={() => handleCopy('delivery', deliveryUrl)}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      {copiedKey === 'delivery' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-teal-200" />}
                      <span>{copiedKey === 'delivery' ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <a
                      href={deliveryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
                      title="Open link in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Subdomain URL: <span className="text-slate-400">{deliverySubdomain}</span>
                  </div>
                </div>

                {/* 3. Admin ERP */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-emerald-900/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                      🏢 Dairy Owner / Admin ERP Portal
                    </span>
                    <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/20 font-bold">
                      For Dairy Operators
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={adminUrl}
                      className="flex-1 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[11px] px-3 py-1.5 rounded-xl truncate select-all"
                    />
                    <button
                      onClick={() => handleCopy('admin', adminUrl)}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all shadow-sm"
                    >
                      {copiedKey === 'admin' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5 text-emerald-200" />}
                      <span>{copiedKey === 'admin' ? 'Copied!' : 'Copy'}</span>
                    </button>
                    <a
                      href={adminUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition-all cursor-pointer"
                      title="Open link in new tab"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Subdomain URL: <span className="text-slate-400">{adminSubdomain}</span>
                  </div>
                </div>
              </div>

              {/* Ready-to-Send WhatsApp Message */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">💬 Ready-to-Send WhatsApp Invite</span>
                  <button
                    onClick={() => handleCopy('whatsapp', waMessage)}
                    className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedKey === 'whatsapp' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedKey === 'whatsapp' ? 'Copied Message!' : 'Copy Message'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 bg-slate-900 p-2.5 rounded-xl font-sans whitespace-pre-line border border-slate-800">
                  {waMessage}
                </p>
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedShareTenant(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold cursor-pointer transition-all"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

