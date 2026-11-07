import React, { useState, useEffect } from 'react';
import {
  Megaphone,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Info,
  CheckCircle2,
  Clock,
  RefreshCw,
  X,
  Send,
  Building2,
} from 'lucide-react';
import { superAdminApi } from '../../../services/api/superAdminApi';

interface AnnouncementsTabProps {
  tenants?: any[];
  plans?: any[];
  onRefresh?: () => void;
}

export const AnnouncementsTab: React.FC<AnnouncementsTabProps> = ({ tenants = [], plans = [], onRefresh }) => {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState<string>('');
  const [formMessage, setFormMessage] = useState<string>('');
  const [formType, setFormType] = useState<'INFO' | 'WARNING' | 'ALERT' | 'MAINTENANCE'>('INFO');
  const [formTargetType, setFormTargetType] = useState<'ALL' | 'TENANT' | 'PLAN'>('ALL');
  const [formTargetId, setFormTargetId] = useState<string>('');
  const [formExpiresAt, setFormExpiresAt] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadAnnouncements();
  }, []);

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await superAdminApi.listAnnouncements();
      setAnnouncements(data || []);
    } catch (err) {
      console.error('Failed to load announcements', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formMessage) {
      setErrorMsg('Please enter both title and announcement message.');
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await superAdminApi.createAnnouncement({
        title: formTitle,
        content: formMessage,
        message: formMessage,
        type: formType,
        targetType: formTargetType,
        targetId: formTargetType !== 'ALL' ? formTargetId : undefined,
        expiresAt: formExpiresAt || undefined,
      });
      setShowCreateModal(false);
      setFormTitle('');
      setFormMessage('');
      setFormType('INFO');
      setFormTargetType('ALL');
      setFormTargetId('');
      setFormExpiresAt('');
      await loadAnnouncements();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to publish announcement.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this broadcast?')) return;
    setDeletingId(id);
    try {
      await superAdminApi.deleteAnnouncement(id);
      setAnnouncements(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error('Failed to delete announcement', err);
    } finally {
      setDeletingId(null);
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">
            <Clock className="w-3.5 h-3.5" />
            Maintenance
          </span>
        );
      case 'ALERT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Urgent Alert
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3.5 h-3.5" />
            Notice
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3.5 h-3.5" />
            Information
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-emerald-600" />
            Platform Announcements & Broadcasts
          </h2>
          <p className="text-sm text-slate-500">
            Broadcast scheduled maintenance notices, release highlights, or alerts to dairies.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadAnnouncements}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-emerald-600' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Create Broadcast
          </button>
        </div>
      </div>

      {/* Announcements List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="divide-y divide-slate-100">
          {announcements.length === 0 ? (
            <div className="py-16 text-center text-slate-400">
              <Megaphone className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-400" />
              <p className="text-base font-semibold text-slate-600">No broadcasts published yet</p>
              <p className="text-xs text-slate-400 mt-1">Broadcasts sent will appear on tenant admin dashboards.</p>
            </div>
          ) : (
            announcements.map(a => (
              <div key={a.id} className="p-6 hover:bg-slate-50/70 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {getTypeBadge(a.type)}
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      Target: {a.targetType || 'ALL'}
                    </span>
                    <span className="text-xs text-slate-400">
                      Published {new Date(a.publishedAt || a.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-800">{a.title}</h4>
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{a.content || a.message}</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleDelete(a.id)}
                    disabled={deletingId === a.id}
                    className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Delete Announcement"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Announcement Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800">New Platform Broadcast</h3>
                <p className="text-xs text-slate-500">Send an announcement or alert banner to tenant admins.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              {errorMsg && (
                <div className="p-3 bg-rose-50 text-rose-800 rounded-lg text-xs font-medium border border-rose-200">
                  {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Broadcast Title</label>
                <input
                  type="text"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Scheduled Maintenance: Sunday 2 AM IST"
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Notification Type</label>
                  <select
                    value={formType}
                    onChange={e => setFormType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="INFO">Information</option>
                    <option value="WARNING">Notice / Warning</option>
                    <option value="ALERT">Urgent Alert</option>
                    <option value="MAINTENANCE">Scheduled Maintenance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Target Audience</label>
                  <select
                    value={formTargetType}
                    onChange={e => setFormTargetType(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                  >
                    <option value="ALL">All Tenants</option>
                    <option value="TENANT">Specific Dairy Tenant</option>
                    <option value="PLAN">Specific SaaS Plan</option>
                  </select>
                </div>
              </div>

              {formTargetType === 'TENANT' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Target Dairy</label>
                  <select
                    value={formTargetId}
                    onChange={e => setFormTargetId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    required
                  >
                    <option value="">-- Choose Tenant --</option>
                    {tenants.map(t => (
                      <option key={t.id} value={t.id}>{t.name} ({t.slug})</option>
                    ))}
                  </select>
                </div>
              )}

              {formTargetType === 'PLAN' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Select Target Plan</label>
                  <select
                    value={formTargetId}
                    onChange={e => setFormTargetId(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                    required
                  >
                    <option value="">-- Choose Plan --</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>{p.name} ({p.code})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={formMessage}
                  onChange={e => setFormMessage(e.target.value)}
                  placeholder="Enter broadcast details, expected downtime, or update notes..."
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Expires On (Optional)</label>
                <input
                  type="date"
                  value={formExpiresAt}
                  onChange={e => setFormExpiresAt(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-lg transition shadow-sm disabled:opacity-50 flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Publishing...' : 'Publish Broadcast'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

