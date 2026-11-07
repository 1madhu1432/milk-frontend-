import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Plus,
  CheckCircle2,
  XCircle,
  Archive,
  ArrowUpDown,
  Table,
  LayoutGrid,
  AlertTriangle,
  RefreshCw,
  Building2,
  Calendar,
  ShieldCheck,
  Check,
  X,
} from 'lucide-react';
import { superAdminApi, PlanComparisonItem } from '../../../services/api/superAdminApi';

interface PlansTabProps {
  plans: any[];
  tenants: any[];
  onCreatePlanClick: () => void;
  onEditPlan: (plan: any) => void;
  onArchivePlan: (planId: string) => Promise<void>;
  onChangeTenantSubscription: (tenantId: string, planId: string, interval: 'MONTHLY' | 'ANNUAL') => Promise<void>;
  onRefresh: () => void;
}

export const PlansTab: React.FC<PlansTabProps> = ({
  plans,
  tenants,
  onCreatePlanClick,
  onEditPlan,
  onArchivePlan,
  onChangeTenantSubscription,
  onRefresh,
}) => {
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [comparisonPlans, setComparisonPlans] = useState<PlanComparisonItem[]>([]);
  const [loadingComparison, setLoadingComparison] = useState<boolean>(false);

  // Archival State
  const [archivingPlanId, setArchivingPlanId] = useState<string | null>(null);
  const [archivalError, setArchivalError] = useState<string | null>(null);
  const [submittingArchive, setSubmittingArchive] = useState<boolean>(false);

  // Change Subscription Modal State
  const [showSubscriptionModal, setShowSubscriptionModal] = useState<boolean>(false);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [targetPlanId, setTargetPlanId] = useState<string>('');
  const [billingInterval, setBillingInterval] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [submittingSubscription, setSubmittingSubscription] = useState<boolean>(false);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);

  // Load comparison data when switching to matrix view
  useEffect(() => {
    if (viewMode === 'matrix') {
      loadComparison();
    }
  }, [viewMode]);

  const loadComparison = async () => {
    setLoadingComparison(true);
    try {
      const data = await superAdminApi.getPlanComparison();
      setComparisonPlans(data);
    } catch {
      // Fallback matrix mapping from local plans
      setComparisonPlans(
        plans.map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          tagline: p.tagline || '',
          priceMonthly: Number(p.priceMonthly),
          priceAnnual: Number(p.priceAnnual),
          maxCustomers: p.maxCustomers,
          maxDeliveryStaff: p.maxDeliveryStaff,
          maxRoutes: p.maxRoutes,
          customDomain: !!p.customDomain,
          supportLevel: p.supportLevel || 'Standard',
          features: p.features || [],
          isActive: p.isActive !== false,
          activeSubscriberCount: tenants.filter(t => t.planId === p.id).length,
        }))
      );
    } finally {
      setLoadingComparison(false);
    }
  };

  const handleArchiveConfirm = async () => {
    if (!archivingPlanId) return;
    setSubmittingArchive(true);
    setArchivalError(null);
    try {
      await onArchivePlan(archivingPlanId);
      setArchivingPlanId(null);
    } catch (err: any) {
      setArchivalError(err.message || 'Failed to archive plan due to an active dependency conflict.');
    } finally {
      setSubmittingArchive(false);
    }
  };

  const handleChangeSubscriptionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId || !targetPlanId) return;
    setSubmittingSubscription(true);
    setSubscriptionError(null);
    try {
      await onChangeTenantSubscription(selectedTenantId, targetPlanId, billingInterval);
      setShowSubscriptionModal(false);
      setSelectedTenantId('');
      setTargetPlanId('');
    } catch (err: any) {
      setSubscriptionError(err.message || 'Subscription change rejected due to limit conflicts.');
    } finally {
      setSubmittingSubscription(false);
    }
  };

  const selectedTenantObj = tenants.find(t => t.id === selectedTenantId);
  const targetPlanObj = plans.find(p => p.id === targetPlanId);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-emerald-400" />
            SaaS Subscription Plans & Tier Matrix
          </h2>
          <p className="text-xs text-slate-400">
            Define quota bounds, monthly/annual pricing models, feature allocations, and safe plan archival.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'matrix'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Comparison</span>
            </button>
          </div>

          {/* Change Subscription Action */}
          <button
            onClick={() => {
              setShowSubscriptionModal(true);
              setSubscriptionError(null);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <ArrowUpDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>Upgrade / Downgrade</span>
          </button>

          {/* Create Plan Button */}
          <button
            onClick={onCreatePlanClick}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Plan</span>
          </button>
        </div>
      </div>

      {/* =================================================================== */}
      {/* VIEW 1: PLAN CARDS                                                  */}
      {/* =================================================================== */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map(p => {
            const isArchived = p.isActive === false;
            const subscriberCount = tenants.filter(t => t.planId === p.id).length;

            return (
              <div
                key={p.id}
                className={`rounded-2xl p-6 bg-slate-900/80 border flex flex-col justify-between space-y-6 shadow-md transition-all ${
                  isArchived
                    ? 'border-slate-800 opacity-70 bg-slate-950/60'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white">{p.name}</h3>
                        {isArchived ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            Archived
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{p.tagline}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20 block">
                        ₹{Number(p.priceMonthly).toLocaleString('en-IN')}/mo
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono mt-1 block">
                        ₹{Number(p.priceAnnual).toLocaleString('en-IN')}/yr
                      </span>
                    </div>
                  </div>

                  {/* Quota Specs */}
                  <div className="pt-3 border-t border-slate-800 space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Max Households:</span>
                      <span className="text-white font-bold font-mono">
                        {p.maxCustomers >= 99999 ? 'Unlimited' : p.maxCustomers}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Max Delivery Staff:</span>
                      <span className="text-white font-bold font-mono">{p.maxDeliveryStaff}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Max Routes:</span>
                      <span className="text-white font-bold font-mono">{p.maxRoutes}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Custom Domain:</span>
                      <span className={`font-bold ${p.customDomain ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {p.customDomain ? 'Supported' : 'Not Included'}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Support Tier:</span>
                      <span className="text-indigo-300 font-medium">{p.supportLevel || 'Standard'}</span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="pt-3 border-t border-slate-800 space-y-1.5">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Features:</p>
                    {p.features?.map((f: string) => (
                      <div key={f} className="text-xs text-slate-300 flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">
                    {subscriberCount} Active Dairy{subscriberCount === 1 ? '' : 's'}
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onEditPlan(p)}
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 font-semibold cursor-pointer"
                    >
                      Edit
                    </button>

                    {!isArchived && (
                      <button
                        onClick={() => {
                          setArchivingPlanId(p.id);
                          setArchivalError(null);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-800 text-xs font-semibold transition-all cursor-pointer"
                        title="Archive this plan safely"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* VIEW 2: COMPARISON MATRIX                                           */}
      {/* =================================================================== */}
      {viewMode === 'matrix' && (
        <div className="rounded-2xl bg-slate-900/90 border border-slate-800 overflow-hidden shadow-xl">
          {loadingComparison ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin text-indigo-400" />
              <span>Generating comparative tier matrix...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 bg-slate-950/60">
                    <th className="p-4 font-bold text-slate-400 uppercase tracking-wider w-1/4">Feature / Limit</th>
                    {comparisonPlans.map(cp => (
                      <th key={cp.id} className="p-4 font-bold text-white text-center">
                        <div className="text-sm font-black">{cp.name}</div>
                        <div className="text-indigo-400 font-mono text-xs mt-0.5">
                          ₹{cp.priceMonthly.toLocaleString('en-IN')}/mo
                        </div>
                        <span
                          className={`inline-block mt-1 text-[9px] px-1.5 py-0.2 rounded font-extrabold uppercase ${
                            cp.isActive
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {cp.isActive ? 'Active' : 'Archived'}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-semibold text-slate-300">Annual Price (Savings)</td>
                    {comparisonPlans.map(cp => {
                      const annualCost = cp.priceAnnual;
                      const monthlyAnnualized = cp.priceMonthly * 12;
                      const savings = Math.max(0, monthlyAnnualized - annualCost);
                      return (
                        <td key={cp.id} className="p-3.5 text-center font-mono text-slate-200">
                          ₹{annualCost.toLocaleString('en-IN')}/yr
                          {savings > 0 && (
                            <span className="block text-[10px] text-emerald-400">
                              Save ₹{savings.toLocaleString('en-IN')}/yr
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-semibold text-slate-300">Max Subscribed Households</td>
                    {comparisonPlans.map(cp => (
                      <td key={cp.id} className="p-3.5 text-center font-mono font-bold text-white">
                        {cp.maxCustomers >= 99999 ? 'Unlimited' : cp.maxCustomers.toLocaleString('en-IN')}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-semibold text-slate-300">Max Delivery Staff (Riders)</td>
                    {comparisonPlans.map(cp => (
                      <td key={cp.id} className="p-3.5 text-center font-mono font-bold text-white">
                        {cp.maxDeliveryStaff} Riders
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-semibold text-slate-300">Max Distribution Routes</td>
                    {comparisonPlans.map(cp => (
                      <td key={cp.id} className="p-3.5 text-center font-mono font-bold text-white">
                        {cp.maxRoutes} Routes
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-semibold text-slate-300">Custom Domain & SSL</td>
                    {comparisonPlans.map(cp => (
                      <td key={cp.id} className="p-3.5 text-center">
                        {cp.customDomain ? (
                          <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        ) : (
                          <X className="w-4 h-4 text-slate-600 mx-auto" />
                        )}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30">
                    <td className="p-3.5 font-semibold text-slate-300">Support Level</td>
                    {comparisonPlans.map(cp => (
                      <td key={cp.id} className="p-3.5 text-center text-slate-300 font-medium">
                        {cp.supportLevel || 'Standard'}
                      </td>
                    ))}
                  </tr>

                  <tr className="hover:bg-slate-800/30 bg-slate-950/40">
                    <td className="p-3.5 font-semibold text-slate-300">Active Tenant Subscriptions</td>
                    {comparisonPlans.map(cp => (
                      <td key={cp.id} className="p-3.5 text-center font-bold text-indigo-300">
                        {cp.activeSubscriberCount} Dairy Tenant{cp.activeSubscriberCount === 1 ? '' : 's'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 1: PLAN ARCHIVAL WITH CONFLICT SAFETY                          */}
      {/* =================================================================== */}
      {archivingPlanId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-900/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
                  <Archive className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Archive SaaS Plan</h3>
                  <p className="text-xs text-rose-300 font-semibold">Conflict-Protected Plan Lifecycle</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setArchivingPlanId(null);
                  setArchivalError(null);
                }}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Archiving this plan prevents new dairy subscriptions from adopting this tier.
              Per SaaS platform safety rules, plans cannot be archived if active dairies or subscriptions currently depend on them.
            </p>

            {archivalError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Conflict Prevented:</span>
                </div>
                <p className="text-[11px] text-rose-200">{archivalError}</p>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setArchivingPlanId(null);
                  setArchivalError(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleArchiveConfirm}
                disabled={submittingArchive}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all shadow-md shadow-rose-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingArchive ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Dependencies...</span>
                  </>
                ) : (
                  <span>Confirm Archival</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL 2: UPGRADE / DOWNGRADE SUBSCRIPTION WITH LIMIT CHECK          */}
      {/* =================================================================== */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form
            onSubmit={handleChangeSubscriptionSubmit}
            className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-scale-up"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <ArrowUpDown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">Upgrade or Downgrade Subscription</h3>
                  <p className="text-xs text-indigo-300 font-semibold">Tier Migration & Limit Validation</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowSubscriptionModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {subscriptionError && (
              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-200 text-xs font-semibold leading-relaxed space-y-1">
                <div className="flex items-center gap-1.5 text-rose-300 font-bold">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Validation Warning:</span>
                </div>
                <p className="text-[11px] text-rose-200">{subscriptionError}</p>
              </div>
            )}

            {/* Tenant Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Select Dairy Tenant <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={selectedTenantId}
                onChange={e => setSelectedTenantId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="">Select a dairy...</option>
                {tenants.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.slug}.milkerp.com)
                  </option>
                ))}
              </select>
            </div>

            {/* Target Plan Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Target Plan Tier <span className="text-rose-400">*</span>
              </label>
              <select
                required
                value={targetPlanId}
                onChange={e => setTargetPlanId(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
              >
                <option value="">Select target plan...</option>
                {plans
                  .filter(p => p.isActive !== false)
                  .map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} — ₹{p.priceMonthly.toLocaleString('en-IN')}/mo
                    </option>
                  ))}
              </select>
            </div>

            {/* Billing Interval Toggle */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Billing Cycle
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setBillingInterval('MONTHLY')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                    billingInterval === 'MONTHLY'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-extrabold">Monthly Billing</p>
                  <span className="text-[11px] text-slate-400 font-mono mt-0.5 block">
                    {targetPlanObj ? `₹${targetPlanObj.priceMonthly.toLocaleString('en-IN')}/month` : 'Select plan'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setBillingInterval('ANNUAL')}
                  className={`p-3 rounded-xl border text-xs font-bold transition-all text-left cursor-pointer ${
                    billingInterval === 'ANNUAL'
                      ? 'bg-indigo-600/20 border-indigo-500 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <p className="font-extrabold">Annual Billing</p>
                  <span className="text-[11px] text-emerald-400 font-mono mt-0.5 block">
                    {targetPlanObj ? `₹${targetPlanObj.priceAnnual.toLocaleString('en-IN')}/year` : 'Select plan'}
                  </span>
                </button>
              </div>
            </div>

            {/* Quota Comparison Preview */}
            {selectedTenantObj && targetPlanObj && (
              <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
                <h4 className="font-bold text-white text-[11px] uppercase tracking-wider">
                  Target Capacity Check:
                </h4>
                <div className="grid grid-cols-3 gap-2 text-center pt-1 font-mono">
                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Customers</span>
                    <span
                      className={`font-bold ${
                        (selectedTenantObj._count?.customers || 0) > targetPlanObj.maxCustomers
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {selectedTenantObj._count?.customers || 0} / {targetPlanObj.maxCustomers >= 99999 ? '∞' : targetPlanObj.maxCustomers}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Staff</span>
                    <span
                      className={`font-bold ${
                        (selectedTenantObj._count?.employees || 0) > targetPlanObj.maxDeliveryStaff
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {selectedTenantObj._count?.employees || 0} / {targetPlanObj.maxDeliveryStaff}
                    </span>
                  </div>

                  <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-sans">Routes</span>
                    <span
                      className={`font-bold ${
                        (selectedTenantObj._count?.routes || 0) > targetPlanObj.maxRoutes
                          ? 'text-rose-400'
                          : 'text-white'
                      }`}
                    >
                      {selectedTenantObj._count?.routes || 0} / {targetPlanObj.maxRoutes}
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowSubscriptionModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingSubscription || !selectedTenantId || !targetPlanId}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
              >
                {submittingSubscription ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Migrating Subscription...</span>
                  </>
                ) : (
                  <span>Apply Subscription Change</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

