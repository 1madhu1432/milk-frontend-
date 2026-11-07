import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { superAdminApi } from '../../services/api/superAdminApi';
import { ShieldAlert, ArrowRight } from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const isImpersonating = !!localStorage.getItem('milkerp_impersonated_token');
  const impersonatedTenantName =
    localStorage.getItem('milkerp_impersonated_tenant_name') || 'Dairy Tenant';
  const impersonatedTenantId = localStorage.getItem('milkerp_impersonated_tenant_id') || '';

  const handleExitImpersonation = async () => {
    try {
      await superAdminApi.exitImpersonation(impersonatedTenantId);
    } catch {
      // ignore network errors on exit
    } finally {
      // Restore Super Admin session token
      const backupToken = localStorage.getItem('milkerp_superadmin_backup_token');
      if (backupToken) {
        localStorage.setItem('milkerp_access_token', backupToken);
      }
      localStorage.removeItem('milkerp_impersonated_token');
      localStorage.removeItem('milkerp_impersonated_tenant_name');
      localStorage.removeItem('milkerp_impersonated_tenant_id');
      localStorage.removeItem('milkerp_superadmin_backup_token');
      navigate('/super-admin');
    }
  };

  return (
    <div className="min-h-screen bg-[#F4F7FB] flex flex-col font-sans">
      {/* Super Admin Impersonation Persistent Banner */}
      {isImpersonating && (
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2.5 text-xs font-bold flex items-center justify-between shadow-md sticky top-0 z-50">
          <div className="flex items-center gap-2.5">
            <span className="p-1 rounded-md bg-white/20">
              <ShieldAlert className="w-4 h-4 text-white" />
            </span>
            <span>
              Viewing as <strong className="underline decoration-white/40">{impersonatedTenantName}</strong> — Super Admin Impersonation Session Active (15m Expiry)
            </span>
          </div>

          <button
            onClick={handleExitImpersonation}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/30 hover:bg-black/50 text-white font-extrabold text-xs border border-white/20 transition-all cursor-pointer shadow-xs"
          >
            <span>Exit Impersonation</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <Header onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
      <div className="flex flex-1">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
