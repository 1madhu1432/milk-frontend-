import React, { useState, useEffect } from 'react';
import {
  Sliders,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Shield,
  Zap,
  Building2,
  Users,
  Save,
} from 'lucide-react';
import { superAdminApi } from '../../../services/api/superAdminApi';

interface FeatureFlagsTabProps {
  tenants?: any[];
  onRefresh?: () => void;
}

export const FeatureFlagsTab: React.FC<FeatureFlagsTabProps> = ({ tenants = [], onRefresh }) => {
  const [flags, setFlags] = useState<Record<string, { name: string; enabled: boolean; description: string }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);

  // Quota override state
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [quotaCustomers, setQuotaCustomers] = useState<number>(1000);
  const [quotaStaff, setQuotaStaff] = useState<number>(20);
  const [quotaRoutes, setQuotaRoutes] = useState<number>(20);
  const [savingQuota, setSavingQuota] = useState<boolean>(false);
  const [quotaMsg, setQuotaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadFlags();
  }, []);

  const loadFlags = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.listFeatureFlags();
      setFlags(data || {});
    } catch (err) {
      console.error('Failed to load feature flags', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (key: string, currentEnabled: boolean) => {
    setSavingKey(key);
    try {
      await superAdminApi.updateFeatureFlag(key, !currentEnabled);
      setFlags(prev => ({
        ...prev,
        [key]: { ...prev[key], enabled: !currentEnabled },
      }));
    } catch (err) {
      console.error('Failed to toggle feature flag', err);
    } finally {
      setSavingKey(null);
    }
  };

  const handleApplyQuotaOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenantId) {
      setQuotaMsg({ type: 'error', text: 'Please select a tenant.' });
      return;
    }
    setSavingQuota(true);
    setQuotaMsg(null);
    try {
      await superAdminApi.overrideQuota(selectedTenantId, {
        maxCustomers: quotaCustomers,
        maxDeliveryStaff: quotaStaff,
        maxRoutes: quotaRoutes,
      });
      setQuotaMsg({ type: 'success', text: 'Custom quotas applied successfully to tenant.' });
    } catch (err: any) {
      setQuotaMsg({ type: 'error', text: err.message || 'Failed to save quota overrides.' });
    } finally {
      setSavingQuota(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sliders className="w-6 h-6 text-emerald-600" />
            Feature Flags & Platform Controls
          </h2>
          <p className="text-sm text-slate-500">
            Control platform capabilities, beta modules, and custom tenant quotas.
          </p>
        </div>
        <button
          onClick={loadFlags}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Global Flags List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Zap className="w-5 h-5 text-amber-500" />
              Global Platform Capabilities
            </h3>
            <p className="text-xs text-slate-500 mb-6">
              Features toggled here take effect across all active tenant deployments in real-time.
            </p>

            <div className="divide-y divide-slate-100">
              {Object.entries(flags).map(([key, item]) => (
                <div key={key} className="py-4 flex items-center justify-between gap-4">
                  <div className="space-y-1 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-800 text-sm">{item.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                        {key}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{item.description}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-xs font-semibold ${item.enabled ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {item.enabled ? 'ACTIVE' : 'DISABLED'}
                    </span>
                    <button
                      onClick={() => handleToggle(key, item.enabled)}
                      disabled={savingKey === key}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        item.enabled ? 'bg-emerald-600' : 'bg-slate-300'
                      } ${savingKey === key ? 'opacity-50' : ''}`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          item.enabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tenant Quota Overrides */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-emerald-600" />
              Tenant Quota Overrides
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Grant custom resource allowances to specific high-volume enterprise dairies.
            </p>

            <form onSubmit={handleApplyQuotaOverride} className="space-y-4">
              {quotaMsg && (
                <div
                  className={`p-3 rounded-lg text-xs font-medium ${
                    quotaMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}
                >
                  {quotaMsg.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Select Tenant</label>
                <select
                  value={selectedTenantId}
                  onChange={e => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                >
                  <option value="">-- Choose Dairy Tenant --</option>
                  {tenants.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.slug})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Max Customers</label>
                <input
                  type="number"
                  value={quotaCustomers}
                  onChange={e => setQuotaCustomers(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={10}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Max Delivery Staff</label>
                <input
                  type="number"
                  value={quotaStaff}
                  onChange={e => setQuotaStaff(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={1}
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Max Delivery Routes</label>
                <input
                  type="number"
                  value={quotaRoutes}
                  onChange={e => setQuotaRoutes(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  min={1}
                />
              </div>

              <button
                type="submit"
                disabled={savingQuota || !selectedTenantId}
                className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-4 h-4" />
                {savingQuota ? 'Saving Quotas...' : 'Save Tenant Override'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

