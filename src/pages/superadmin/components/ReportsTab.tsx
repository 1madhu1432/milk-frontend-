import React, { useState } from 'react';
import {
  FileText,
  Download,
  Building2,
  CreditCard,
  TrendingUp,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { superAdminApi } from '../../../services/api/superAdminApi';

export const ReportsTab: React.FC = () => {
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (type: 'tenants' | 'revenue' | 'subscriptions' | 'audit', filename: string) => {
    setDownloading(type);
    try {
      const url = superAdminApi.exportDataUrl(type);
      const token = localStorage.getItem('milkerp_access_token');
      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error('Failed to generate export file');
      const blob = await res.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err: any) {
      alert(err.message || 'Error downloading report CSV');
    } finally {
      setDownloading(null);
    }
  };

  const reports = [
    {
      type: 'tenants' as const,
      title: 'Tenants & Dairy Directory',
      description: 'Export all registered dairy tenants, owner emails, subdomain slugs, subscription statuses, customer counts, and routes.',
      filename: `milkerp-tenants-${new Date().toISOString().slice(0, 10)}.csv`,
      icon: Building2,
      color: 'text-blue-600 bg-blue-50 border-blue-200',
    },
    {
      type: 'revenue' as const,
      title: 'Revenue & Billing Breakdown',
      description: 'Comprehensive financial report including MRR, ARR, invoice breakdown, collections, and billing performance metrics.',
      filename: `milkerp-revenue-metrics-${new Date().toISOString().slice(0, 10)}.csv`,
      icon: TrendingUp,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    },
    {
      type: 'subscriptions' as const,
      title: 'Active SaaS Subscriptions',
      description: 'Detailed active tenant plan enrollments, billing intervals (monthly/annual), renewal cycles, and pricing tiers.',
      filename: `milkerp-subscriptions-${new Date().toISOString().slice(0, 10)}.csv`,
      icon: CreditCard,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200',
    },
    {
      type: 'audit' as const,
      title: 'Platform Security & Audit Logs',
      description: 'Complete trace of all administrative operations, impersonation events, tenant state modifications, and billing actions.',
      filename: `milkerp-audit-logs-${new Date().toISOString().slice(0, 10)}.csv`,
      icon: ShieldAlert,
      color: 'text-amber-600 bg-amber-50 border-amber-200',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
          <FileText className="w-6 h-6 text-emerald-600" />
          Reports & Platform Data Export
        </h2>
        <p className="text-sm text-slate-500">
          Generate and download instant CSV reports for analytics, finance, and security audits.
        </p>
      </div>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map(rep => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.type}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between hover:border-slate-300 transition"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${rep.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-800">{rep.title}</h3>
                    <span className="text-[11px] font-mono text-slate-400">CSV Export Format</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed mb-6">
                  {rep.description}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">Standard RFC-4180 CSV</span>
                <button
                  onClick={() => handleDownload(rep.type, rep.filename)}
                  disabled={downloading === rep.type}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition shadow-sm disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${downloading === rep.type ? 'animate-bounce' : ''}`} />
                  {downloading === rep.type ? 'Generating CSV...' : 'Download CSV'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

