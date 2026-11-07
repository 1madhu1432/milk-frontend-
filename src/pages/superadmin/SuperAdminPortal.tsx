import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { superAdminApi, SuperAdminDashboardStats } from '../../services/api/superAdminApi';
import { authApi } from '../../services/api/authApi';
import { DashboardTab } from './components/DashboardTab';
import { TenantsTab } from './components/TenantsTab';
import { PlansTab } from './components/PlansTab';
import { BillingTab } from './components/BillingTab';
import { FeatureFlagsTab } from './components/FeatureFlagsTab';
import { AnnouncementsTab } from './components/AnnouncementsTab';
import { PlatformStaffTab } from './components/PlatformStaffTab';
import { ReportsTab } from './components/ReportsTab';
import {
  Building2,
  CheckCircle2,
  Globe,
  Users,
  CreditCard,
  ArrowRight,
  TrendingUp,
  LifeBuoy,
  LogOut,
  Server,
  Plus,
  Search,
  Filter,
  ShieldAlert,
  ShieldCheck,
  Edit,
  Clock,
  Send,
  Key,
  AlertTriangle,
  UserPlus,
  X,
  RefreshCw,
  Sliders,
  Lock,
  Mail,
  Phone,
  Check,
  FileText,
  UserCheck,
  Calendar,
  Receipt,
  Megaphone,
  Download,
  Menu,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

type TabType =
  | 'dashboard'
  | 'tenants'
  | 'billing'
  | 'plans'
  | 'featureFlags'
  | 'announcements'
  | 'staff'
  | 'reports'
  | 'onboarding'
  | 'tickets'
  | 'audit'
  | 'settings';

export const SuperAdminPortal: React.FC = () => {
  const navigate = useNavigate();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [loginEmail, setLoginEmail] = useState<string>('platform.owner@milkerp.com');
  const [loginPassword, setLoginPassword] = useState<string>('admin123');
  const [loginError, setLoginError] = useState<string>('');
  const [submittingLogin, setSubmittingLogin] = useState<boolean>(false);

  // Active Tab & Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  // Data States
  const [stats, setStats] = useState<SuperAdminDashboardStats | null>(null);
  const [tenants, setTenants] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [onboardingRequests, setOnboardingRequests] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loadingData, setLoadingData] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Filtering, Search & Server-Side Pagination States
  const [tenantSearch, setTenantSearch] = useState<string>('');
  const [tenantStatusFilter, setTenantStatusFilter] = useState<string>('all');
  const [tenantPlanFilter, setTenantPlanFilter] = useState<string>('all');
  const [tenantPage, setTenantPage] = useState<number>(1);
  const [tenantLimit, setTenantLimit] = useState<number>(6);
  const [tenantTotal, setTenantTotal] = useState<number>(0);
  const [tenantTotalPages, setTenantTotalPages] = useState<number>(1);
  const [tenantSortBy, setTenantSortBy] = useState<string>('createdAt');
  const [tenantSortOrder, setTenantSortOrder] = useState<'asc' | 'desc'>('desc');

  // Dashboard Metrics Range Filters
  const [dashboardRange, setDashboardRange] = useState<'7d' | '30d' | '90d' | 'custom'>('30d');
  const [dashboardStartDate, setDashboardStartDate] = useState<string>('');
  const [dashboardEndDate, setDashboardEndDate] = useState<string>('');

  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('all');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('all');

  // Modals & Drawers
  const [showCreateTenantModal, setShowCreateTenantModal] = useState<boolean>(false);
  const [showEditTenantModal, setShowEditTenantModal] = useState<boolean>(false);
  const [selectedTenant, setSelectedTenant] = useState<any | null>(null);
  const [showExtendTrialModal, setShowExtendTrialModal] = useState<boolean>(false);
  const [showChangePlanModal, setShowChangePlanModal] = useState<boolean>(false);
  const [showTenantUsersModal, setShowTenantUsersModal] = useState<boolean>(false);
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);

  // Tenant Creation / Edit Form State
  const [tenantForm, setTenantForm] = useState({
    name: '',
    slug: '',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    planId: '',
    trialDays: 14,
    address: '',
    gstin: '',
    logoEmoji: '🥛',
    primaryColor: '#059669',
    accentColor: '#10b981',
    adminPassword: 'admin123',
  });

  // User Creation Inside Tenant Modal
  const [showAddUserForm, setShowAddUserForm] = useState<boolean>(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'ADMIN',
    password: 'password123',
  });

  // Plan Modal
  const [showPlanModal, setShowPlanModal] = useState<boolean>(false);
  const [editingPlan, setEditingPlan] = useState<any | null>(null);
  const [planForm, setPlanForm] = useState({
    code: '',
    name: '',
    tagline: '',
    priceMonthly: 4999,
    priceAnnual: 49990,
    maxCustomers: 1000,
    maxDeliveryStaff: 10,
    maxRoutes: 10,
    customDomain: true,
    supportLevel: 'Priority Support',
    features: ['Daily Milk Distribution', 'Procurement QC', 'Automated Invoices'],
  });

  // Support Ticket Modal / Thread
  const [selectedTicket, setSelectedTicket] = useState<any | null>(null);
  const [ticketReplyMessage, setTicketReplyMessage] = useState<string>('');
  const [sendingReply, setSendingReply] = useState<boolean>(false);

  // Reject Onboarding Modal
  const [rejectingOnboardingId, setRejectingOnboardingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');

  // Initial Auth Check
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    setAuthLoading(true);
    const token = localStorage.getItem('milkerp_access_token');
    if (!token) {
      setIsAuthenticated(false);
      setAuthLoading(false);
      return;
    }

    try {
      const res: any = await authApi.getProfile();
      if (res && res.role === 'SUPER_ADMIN') {
        setIsAuthenticated(true);
        loadAllData();
      } else {
        setIsAuthenticated(false);
      }
    } catch {
      // If offline or fallback token check: decode token payload
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          if (payload.role === 'SUPER_ADMIN') {
            setIsAuthenticated(true);
            loadAllData();
            setAuthLoading(false);
            return;
          }
        }
      } catch {
        // invalid token
      }
      setIsAuthenticated(false);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingLogin(true);
    setLoginError('');

    try {
      const res = await authApi.login(loginEmail, loginPassword);
      if (res.user.role !== 'SUPER_ADMIN') {
        setLoginError('Access denied: You must hold the SUPER_ADMIN role to enter.');
        authApi.logout();
        setIsAuthenticated(false);
      } else {
        setIsAuthenticated(true);
        notify('success', 'Logged in as Super Admin');
        loadAllData();
      }
    } catch (err: any) {
      setLoginError(err.message || 'Invalid email or password');
    } finally {
      setSubmittingLogin(false);
    }
  };

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      localStorage.removeItem('milkerp_access_token');
      localStorage.removeItem('milkerp_refresh_token');
    }
    setIsAuthenticated(false);
    notify('success', 'Logged out successfully');
  };

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadTenants = async () => {
    try {
      const res: any = await superAdminApi.listTenants({
        page: tenantPage,
        limit: tenantLimit,
        sortBy: tenantSortBy,
        sortOrder: tenantSortOrder,
        search: tenantSearch.trim() || undefined,
        status: tenantStatusFilter !== 'all' ? tenantStatusFilter : undefined,
        planId: tenantPlanFilter !== 'all' ? tenantPlanFilter : undefined,
      });

      if (res && res.tenants) {
        setTenants(res.tenants);
        setTenantTotal(res.pagination.total);
        setTenantTotalPages(res.pagination.totalPages);
      } else if (Array.isArray(res)) {
        setTenants(res);
        setTenantTotal(res.length);
        setTenantTotalPages(Math.ceil(res.length / tenantLimit) || 1);
      }
    } catch (err: any) {
      notify('error', 'Failed to load tenants: ' + err.message);
    }
  };

  // Re-fetch tenants on filter/pagination changes
  useEffect(() => {
    if (isAuthenticated) {
      loadTenants();
    }
  }, [isAuthenticated, tenantPage, tenantLimit, tenantSortBy, tenantSortOrder, tenantSearch, tenantStatusFilter, tenantPlanFilter]);

  const handleDashboardDateRangeChange = async (
    range: '7d' | '30d' | '90d' | 'custom',
    start?: string,
    end?: string
  ) => {
    setDashboardRange(range);
    if (start) setDashboardStartDate(start);
    if (end) setDashboardEndDate(end);

    try {
      setLoadingData(true);
      const dashRes = await superAdminApi.getDashboard({
        range,
        startDate: start,
        endDate: end,
      });
      setStats(dashRes);
    } catch (err: any) {
      notify('error', 'Failed to filter metrics: ' + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleReactivateTenant = async (tenantId: string, reason: string) => {
    try {
      await superAdminApi.reactivateTenant(tenantId, reason);
      notify('success', 'Dairy tenant reactivated successfully and logged to audit trail.');
      loadTenants();
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to reactivate dairy: ' + err.message);
      throw err;
    }
  };

  const handleArchivePlan = async (planId: string) => {
    try {
      await superAdminApi.archivePlan(planId);
      notify('success', 'Plan archived successfully.');
      loadAllData();
    } catch (err: any) {
      notify('error', err.message || 'Failed to archive plan.');
      throw err;
    }
  };

  const handleChangeSubscription = async (tenantId: string, planId: string, interval: 'MONTHLY' | 'ANNUAL') => {
    try {
      await superAdminApi.changeSubscription(tenantId, planId, interval);
      notify('success', 'Tenant subscription updated successfully.');
      loadTenants();
      loadAllData();
    } catch (err: any) {
      notify('error', err.message || 'Subscription change failed.');
      throw err;
    }
  };

  const loadAllData = async () => {
    setLoadingData(true);
    try {
      const [dashRes, tenantsRes, plansRes, onboardingRes, ticketsRes, logsRes, settingsRes] =
        await Promise.allSettled([
          superAdminApi.getDashboard({ range: dashboardRange, startDate: dashboardStartDate || undefined, endDate: dashboardEndDate || undefined }),
          superAdminApi.listTenants({ page: tenantPage, limit: tenantLimit, sortBy: tenantSortBy, sortOrder: tenantSortOrder }),
          superAdminApi.listPlans(),
          superAdminApi.listOnboarding(),
          superAdminApi.listTickets(),
          superAdminApi.listAuditLogs({ limit: 50 }),
          superAdminApi.getSettings(),
        ]);

      if (dashRes.status === 'fulfilled') setStats(dashRes.value as any);
      if (tenantsRes.status === 'fulfilled') {
        const val: any = tenantsRes.value;
        if (val && val.tenants) {
          setTenants(val.tenants);
          setTenantTotal(val.pagination.total);
          setTenantTotalPages(val.pagination.totalPages);
        } else if (Array.isArray(val)) {
          setTenants(val);
          setTenantTotal(val.length);
          setTenantTotalPages(Math.ceil(val.length / tenantLimit) || 1);
        }
      }
      if (plansRes.status === 'fulfilled') setPlans(plansRes.value as any[]);
      if (onboardingRes.status === 'fulfilled') setOnboardingRequests(onboardingRes.value as any[]);
      if (ticketsRes.status === 'fulfilled') setTickets(ticketsRes.value as any[]);
      if (logsRes.status === 'fulfilled') setAuditLogs(logsRes.value as any[]);
      if (settingsRes.status === 'fulfilled') setSettings(settingsRes.value as any);
    } catch (err: any) {
      notify('error', 'Error refreshing dashboard data: ' + err.message);
    } finally {
      setLoadingData(false);
    }
  };

  // Impersonate Tenant
  const handleImpersonate = async (tenantId: string) => {
    try {
      const res = await superAdminApi.impersonateTenant(tenantId);
      if (res && res.token) {
        // Save Super Admin session token for seamless restoration on exit
        const currentSuperAdminToken = localStorage.getItem('milkerp_access_token') || '';
        localStorage.setItem('milkerp_superadmin_backup_token', currentSuperAdminToken);
        localStorage.setItem('milkerp_impersonated_token', res.token);
        localStorage.setItem('milkerp_impersonated_tenant_name', res.tenant.name);
        localStorage.setItem('milkerp_impersonated_tenant_id', res.tenant.id);
        localStorage.setItem('milkerp_active_tenant_id', res.tenant.id);
        // Switch active access token to the impersonated token
        localStorage.setItem('milkerp_access_token', res.token);
        notify('success', `Impersonation session established for ${res.tenant.name} (15m expiry)`);
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      notify('error', 'Failed to impersonate tenant: ' + err.message);
    }
  };

  // Tenant Status Toggle
  const handleUpdateTenantStatus = async (tenantId: string, newStatus: string) => {
    try {
      await superAdminApi.updateTenantStatus(tenantId, newStatus, 'Super Admin Manual Action');
      notify('success', `Tenant status updated to ${newStatus}`);
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to update tenant status: ' + err.message);
    }
  };

  // Extend Trial
  const handleExtendTrial = async (days: number) => {
    if (!selectedTenant) return;
    try {
      await superAdminApi.extendTrial(selectedTenant.id, days);
      notify('success', `Trial extended by ${days} days for ${selectedTenant.name}`);
      setShowExtendTrialModal(false);
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to extend trial: ' + err.message);
    }
  };

  // Assign Plan
  const handleAssignPlan = async (planId: string) => {
    if (!selectedTenant) return;
    try {
      await superAdminApi.assignPlan(selectedTenant.id, planId);
      notify('success', `Assigned new plan to ${selectedTenant.name}`);
      setShowChangePlanModal(false);
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to assign plan: ' + err.message);
    }
  };

  // Create Tenant
  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await superAdminApi.createTenant(tenantForm);
      notify('success', `Dairy tenant ${tenantForm.name} created successfully!`);
      setShowCreateTenantModal(false);
      setTenantForm({
        name: '',
        slug: '',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        planId: plans[0]?.id || '',
        trialDays: 14,
        address: '',
        gstin: '',
        logoEmoji: '🥛',
        primaryColor: '#059669',
        accentColor: '#10b981',
        adminPassword: 'admin123',
      });
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to create tenant: ' + err.message);
    }
  };

  // Edit Tenant
  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      await superAdminApi.updateTenant(selectedTenant.id, tenantForm);
      notify('success', `Tenant ${tenantForm.name} updated successfully!`);
      setShowEditTenantModal(false);
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to update tenant: ' + err.message);
    }
  };

  // Open Edit Modal
  const openEditModal = (t: any) => {
    setSelectedTenant(t);
    setTenantForm({
      name: t.name,
      slug: t.slug,
      ownerName: t.ownerName,
      ownerEmail: t.ownerEmail,
      ownerPhone: t.ownerPhone,
      planId: t.planId || '',
      trialDays: 14,
      address: t.address || '',
      gstin: t.gstin || '',
      logoEmoji: t.logoEmoji || '🥛',
      primaryColor: t.primaryColor || '#059669',
      accentColor: t.accentColor || '#10b981',
      adminPassword: '',
    });
    setShowEditTenantModal(true);
  };

  // Tenant Users
  const openUsersModal = async (t: any) => {
    setSelectedTenant(t);
    setShowTenantUsersModal(true);
    setLoadingUsers(true);
    try {
      const users = await superAdminApi.listTenantUsers(t.id);
      setTenantUsers(users);
    } catch (err: any) {
      notify('error', 'Failed to fetch users: ' + err.message);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    try {
      await superAdminApi.createTenantUser(selectedTenant.id, userForm as any);
      notify('success', `User ${userForm.name} created!`);
      setShowAddUserForm(false);
      setUserForm({ name: '', email: '', phone: '', role: 'ADMIN', password: 'password123' });
      const updated = await superAdminApi.listTenantUsers(selectedTenant.id);
      setTenantUsers(updated);
    } catch (err: any) {
      notify('error', 'Failed to create user: ' + err.message);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!selectedTenant) return;
    try {
      await superAdminApi.toggleTenantUserStatus(selectedTenant.id, userId, !currentStatus);
      notify('success', `User status updated!`);
      const updated = await superAdminApi.listTenantUsers(selectedTenant.id);
      setTenantUsers(updated);
    } catch (err: any) {
      notify('error', 'Failed to toggle user status: ' + err.message);
    }
  };

  const handleResetUserPassword = async (userId: string) => {
    if (!selectedTenant) return;
    const newPass = prompt('Enter new password for this user:', 'admin123');
    if (!newPass) return;
    try {
      await superAdminApi.resetTenantUserPassword(selectedTenant.id, userId, newPass);
      notify('success', 'User password reset successfully');
    } catch (err: any) {
      notify('error', 'Failed to reset password: ' + err.message);
    }
  };

  // Onboarding Approve / Reject
  const handleApproveOnboarding = async (id: string) => {
    try {
      await superAdminApi.approveOnboarding(id);
      notify('success', 'Onboarding request approved! New tenant and admin provisioned.');
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to approve onboarding: ' + err.message);
    }
  };

  const handleRejectOnboarding = async () => {
    if (!rejectingOnboardingId) return;
    try {
      await superAdminApi.rejectOnboarding(rejectingOnboardingId, rejectionReason);
      notify('success', 'Onboarding application rejected');
      setRejectingOnboardingId(null);
      setRejectionReason('');
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to reject onboarding: ' + err.message);
    }
  };

  // Support Tickets
  const openTicketThread = async (t: any) => {
    try {
      const fullTicket = await superAdminApi.getTicket(t.id);
      setSelectedTicket(fullTicket);
    } catch {
      setSelectedTicket(t);
    }
  };

  const handleSendTicketReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket || !ticketReplyMessage.trim()) return;
    setSendingReply(true);
    try {
      await superAdminApi.replyTicket(selectedTicket.id, ticketReplyMessage);
      notify('success', 'Reply sent to dairy owner');
      setTicketReplyMessage('');
      const updatedTicket = await superAdminApi.getTicket(selectedTicket.id);
      setSelectedTicket(updatedTicket);
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to send reply: ' + err.message);
    } finally {
      setSendingReply(false);
    }
  };

  const handleUpdateTicketStatus = async (ticketId: string, newStatus: string) => {
    try {
      await superAdminApi.updateTicketStatus(ticketId, newStatus);
      notify('success', `Ticket status updated to ${newStatus}`);
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
      }
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to update ticket status: ' + err.message);
    }
  };

  // Plan Save
  const handleSavePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingPlan) {
        await superAdminApi.updatePlan(editingPlan.id, planForm);
        notify('success', `Plan ${planForm.name} updated successfully!`);
      } else {
        await superAdminApi.createPlan(planForm);
        notify('success', `New SaaS Plan ${planForm.name} created!`);
      }
      setShowPlanModal(false);
      setEditingPlan(null);
      loadAllData();
    } catch (err: any) {
      notify('error', 'Failed to save plan: ' + err.message);
    }
  };

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await superAdminApi.updateSettings(settings);
      notify('success', 'Platform settings saved successfully!');
    } catch (err: any) {
      notify('error', 'Failed to save settings: ' + err.message);
    }
  };

  // Filtered Lists
  const filteredTenants = tenants.filter(t => {
    if (tenantStatusFilter !== 'all' && t.status !== tenantStatusFilter) return false;
    if (tenantPlanFilter !== 'all' && t.planId !== tenantPlanFilter) return false;
    if (tenantSearch.trim()) {
      const q = tenantSearch.toLowerCase();
      const matchName = t.name?.toLowerCase().includes(q);
      const matchSlug = t.slug?.toLowerCase().includes(q);
      const matchEmail = t.ownerEmail?.toLowerCase().includes(q);
      if (!matchName && !matchSlug && !matchEmail) return false;
    }
    return true;
  });

  const filteredTickets = tickets.filter(t => {
    if (ticketStatusFilter !== 'all' && t.status !== ticketStatusFilter) return false;
    return true;
  });

  const filteredLogs = auditLogs.filter(l => {
    if (auditActionFilter !== 'all' && l.action !== auditActionFilter) return false;
    return true;
  });

  // --------------------------------------------------------------------------
  // Render: Loading Screen
  // --------------------------------------------------------------------------
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white font-sans">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-400 text-sm font-semibold tracking-wide">
          Verifying Super Admin Authorization...
        </p>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Super Admin Authentication Guard / Login Screen
  // --------------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-[#0a0f1d] to-slate-900 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-2xl rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative z-10 animate-fade-in">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 p-8 text-white text-center relative border-b border-indigo-800/40">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-3xl mb-3 shadow-lg">
              👑
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-200 border border-purple-500/30 px-3 py-0.5 rounded-full">
              Platform SaaS Owner Portal
            </span>
            <h1 className="text-2xl font-black tracking-tight text-white mt-2">
              MilkerP Super Admin
            </h1>
            <p className="text-xs text-indigo-200 font-medium mt-1">
              Sign in to manage tenants, plans, platform billing & system health
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="p-8 space-y-5">
            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Super Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={e => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  placeholder="platform.owner@milkerp.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-xs rounded-xl border border-slate-700 bg-slate-950 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submittingLogin}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              {submittingLogin ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Authenticating Session...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Super Admin</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
              >
                ← Back to Portal Switcher
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // Render: Super Admin Console Workspace
  // --------------------------------------------------------------------------
  // Navigation categories and tab metadata
  const navGroups = [
    {
      title: 'Core Platform',
      items: [
        { id: 'dashboard', label: 'Platform Overview', icon: TrendingUp },
        { id: 'tenants', label: 'Dairy Tenants', icon: Building2, badge: tenants.length, badgeColor: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' },
        { id: 'onboarding', label: 'Onboarding Pipeline', icon: UserPlus, badge: onboardingRequests.filter(o => o.status === 'PENDING').length, badgeColor: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
        { id: 'plans', label: 'SaaS Plans', icon: CreditCard, badge: plans.length, badgeColor: 'bg-slate-800 text-slate-300' },
      ],
    },
    {
      title: 'Billing & Support',
      items: [
        { id: 'billing', label: 'Billing & Invoices', icon: Receipt },
        { id: 'tickets', label: 'Support Queue', icon: LifeBuoy, badge: tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length, badgeColor: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
      ],
    },
    {
      title: 'Platform Controls',
      items: [
        { id: 'featureFlags', label: 'Feature Flags', icon: Sliders },
        { id: 'announcements', label: 'Broadcasts', icon: Megaphone },
        { id: 'staff', label: 'Platform Staff', icon: ShieldAlert },
        { id: 'reports', label: 'Reports & Export', icon: FileText },
      ],
    },
    {
      title: 'System & Governance',
      items: [
        { id: 'audit', label: 'Audit Logs', icon: FileText },
        { id: 'settings', label: 'Platform Config', icon: Sliders },
      ],
    },
  ];

  const tabMeta: Record<TabType, { title: string; subtitle: string; icon: any }> = {
    dashboard: { title: 'Platform Overview', subtitle: 'Real-time metrics, system health, and business performance', icon: TrendingUp },
    tenants: { title: 'Dairy Tenants Directory', subtitle: 'Manage dairy instances, subscriptions, limits, and access', icon: Building2 },
    billing: { title: 'Billing & Invoices', subtitle: 'Platform invoices, collections, payment history, and revenue', icon: Receipt },
    plans: { title: 'SaaS Subscription Plans', subtitle: 'Pricing tiers, quotas, feature entitlements, and archiving', icon: CreditCard },
    featureFlags: { title: 'Feature Flags & Overrides', subtitle: 'Tenant capability flags, rollout controls, and toggles', icon: Sliders },
    announcements: { title: 'System Broadcasts', subtitle: 'Announcements, maintenance notices, and banners for tenants', icon: Megaphone },
    staff: { title: 'Platform Staff & RBAC', subtitle: 'Super admin operators, support agents, and security roles', icon: ShieldAlert },
    reports: { title: 'Reports & Data Exports', subtitle: 'Export tenant datasets, operational audit trails, and CSV reports', icon: FileText },
    onboarding: { title: 'Onboarding Pipeline', subtitle: 'Review and approve pending dairy self-registration requests', icon: UserPlus },
    tickets: { title: 'Support Queue', subtitle: 'Tenant inquiries, bug tickets, and SLA escalations', icon: LifeBuoy },
    audit: { title: 'Platform Audit Logs', subtitle: 'Immutable security log of all super admin and tenant actions', icon: FileText },
    settings: { title: 'Platform Configuration', subtitle: 'Global SaaS variables, mail gateways, and system flags', icon: Sliders },
  };

  const ActiveIcon = tabMeta[activeTab]?.icon || TrendingUp;

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex overflow-hidden font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center gap-2 transition-all animate-bounce ${notification.type === 'success'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-700/60'
              : 'bg-rose-950/90 text-rose-200 border-rose-700/60'
            }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Mobile Backdrop for Slide Bar */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Vertical Sidebar / Slide Bar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out lg:static ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          } ${sidebarCollapsed ? 'w-20' : 'w-72'}`}
      >
        {/* Sidebar Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900/90">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-xl shadow-md ring-2 ring-indigo-500/20 shrink-0">
              👑
            </div>
            {!sidebarCollapsed && (
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h1 className="text-sm font-extrabold text-white tracking-tight truncate">MilkerP</h1>
                  <span className="text-[9px] uppercase font-black px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    Admin
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 truncate">SaaS Control Center</p>
              </div>
            )}
          </div>

          <div className="flex items-center">
            {/* Desktop Collapse / Expand Toggle */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
            {/* Mobile Close Button */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Sidebar Vertical Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 no-scrollbar">
          {navGroups.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1">
              {!sidebarCollapsed && (
                <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  {group.title}
                </div>
              )}
              {group.items.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id as TabType);
                      setSidebarOpen(false);
                    }}
                    title={sidebarCollapsed ? tab.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer group ${isActive
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                      } ${sidebarCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    {!sidebarCollapsed && (
                      <>
                        <span className="truncate text-left flex-1">{tab.label}</span>
                        {tab.badge !== undefined && tab.badge > 0 && (
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${isActive
                                ? 'bg-white/20 text-white'
                                : tab.badgeColor || 'bg-slate-800 text-slate-300'
                              }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60 shrink-0 space-y-2">
          {!sidebarCollapsed ? (
            <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-xs font-black text-indigo-300 shrink-0">
                  SA
                </div>
                <div className="min-w-0">
                  <div className="text-[11px] font-bold text-white truncate">Platform Super Admin</div>
                  <div className="text-[9px] text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Live Engine Online
                  </div>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <button
                onClick={handleLogout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-4 sm:px-6 flex items-center justify-between shrink-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Open Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <ActiveIcon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-tight flex items-center gap-2">
                  <span>{tabMeta[activeTab]?.title || 'Platform Overview'}</span>
                </h2>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  {tabMeta[activeTab]?.subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setShowCreateTenantModal(true)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Dairy</span>
            </button>

            <button
              onClick={loadAllData}
              disabled={loadingData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/60 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer"
              title="Sync Platform Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingData ? 'animate-spin text-indigo-400' : ''}`} />
              <span className="hidden md:inline">Sync Data</span>
            </button>

            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-[10px] font-bold text-emerald-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Engine
            </div>
          </div>
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {/* ================================================================= */}
            {/* TAB 1: PLATFORM DASHBOARD                                         */}
            {/* ================================================================= */}
            {activeTab === 'dashboard' && (
              <DashboardTab
                stats={stats}
                tenants={tenants}
                onboardingRequests={onboardingRequests}
                onNavigateTab={tab => setActiveTab(tab as TabType)}
                onImpersonate={handleImpersonate}
                onApproveOnboarding={handleApproveOnboarding}
                onRejectOnboarding={id => {
                  setRejectingOnboardingId(id);
                  setRejectionReason('');
                }}
                onCreateTenantClick={() => setShowCreateTenantModal(true)}
                onDateRangeChange={handleDashboardDateRangeChange}
                currentRange={dashboardRange}
                startDate={dashboardStartDate}
                endDate={dashboardEndDate}
                loading={loadingData}
              />
            )}

            {/* ================================================================= */}
            {/* TAB 2: TENANTS MANAGEMENT                                         */}
            {/* ================================================================= */}
            {activeTab === 'tenants' && (
              <TenantsTab
                tenants={tenants}
                plans={plans}
                totalTenants={tenantTotal || tenants.length}
                page={tenantPage}
                limit={tenantLimit}
                totalPages={tenantTotalPages}
                sortBy={tenantSortBy}
                sortOrder={tenantSortOrder}
                search={tenantSearch}
                statusFilter={tenantStatusFilter}
                planFilter={tenantPlanFilter}
                onPageChange={setTenantPage}
                onLimitChange={newLimit => {
                  setTenantLimit(newLimit);
                  setTenantPage(1);
                }}
                onSortChange={(sb, so) => {
                  setTenantSortBy(sb);
                  setTenantSortOrder(so);
                }}
                onSearchChange={val => {
                  setTenantSearch(val);
                  setTenantPage(1);
                }}
                onStatusFilterChange={val => {
                  setTenantStatusFilter(val);
                  setTenantPage(1);
                }}
                onPlanFilterChange={val => {
                  setTenantPlanFilter(val);
                  setTenantPage(1);
                }}
                onCreateTenantClick={() => setShowCreateTenantModal(true)}
                onEditTenant={openEditModal}
                onImpersonate={handleImpersonate}
                onOpenUsers={openUsersModal}
                onOpenExtendTrial={t => {
                  setSelectedTenant(t);
                  setShowExtendTrialModal(true);
                }}
                onOpenChangePlan={t => {
                  setSelectedTenant(t);
                  setShowChangePlanModal(true);
                }}
                onSuspendTenant={t => handleUpdateTenantStatus(t.id, 'SUSPENDED')}
                onReactivateTenant={handleReactivateTenant}
                onRefresh={loadAllData}
              />
            )}

            {/* ================================================================= */}
            {/* TAB 3: ONBOARDING PIPELINE                                        */}
            {/* ================================================================= */}
            {activeTab === 'onboarding' && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <UserPlus className="w-5 h-5 text-purple-400" />
                    Dairy Business Onboarding Pipeline
                  </h2>
                  <p className="text-xs text-slate-400">
                    Review and approve incoming customer registrations and onboarding requests.
                  </p>
                </div>

                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
                  {onboardingRequests.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">
                      No onboarding requests found.
                    </div>
                  ) : (
                    onboardingRequests.map(req => (
                      <div key={req.id} className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1.5 max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-extrabold text-white">{req.businessName}</span>
                            <span className="text-xs font-mono text-indigo-400">({req.requestedSlug}.milkerp.com)</span>
                            <span
                              className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${req.status === 'PENDING'
                                  ? 'bg-amber-500/20 text-amber-300'
                                  : req.status === 'APPROVED'
                                    ? 'bg-emerald-500/20 text-emerald-300'
                                    : 'bg-rose-500/20 text-rose-300'
                                }`}
                            >
                              {req.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Owner: <strong className="text-white">{req.ownerName}</strong> • {req.ownerEmail} • {req.ownerPhone}
                          </p>
                          {req.message && (
                            <p className="text-xs text-slate-400 italic bg-slate-950/60 p-2 rounded-lg border border-slate-800">
                              "{req.message}"
                            </p>
                          )}
                          <p className="text-[11px] text-slate-500">
                            Requested Plan: <strong className="text-purple-300 uppercase">{req.requestedPlan}</strong> • Applied on {new Date(req.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        {req.status === 'PENDING' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveOnboarding(req.id)}
                              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                            >
                              Approve & Provision
                            </button>
                            <button
                              onClick={() => {
                                setRejectingOnboardingId(req.id);
                                setRejectionReason('');
                              }}
                              className="px-3 py-2 rounded-xl bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold transition-all cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 4: SAAS PLANS                                                 */}
            {/* ================================================================= */}
            {activeTab === 'plans' && (
              <PlansTab
                plans={plans}
                tenants={tenants}
                onCreatePlanClick={() => {
                  setEditingPlan(null);
                  setPlanForm({
                    code: 'pro',
                    name: 'Pro Dairy Tier',
                    tagline: 'Ideal for scaling commercial dairies',
                    priceMonthly: 4999,
                    priceAnnual: 49990,
                    maxCustomers: 1000,
                    maxDeliveryStaff: 10,
                    maxRoutes: 10,
                    customDomain: true,
                    supportLevel: 'Priority Email & Chat',
                    features: ['1,000 Customers', '10 Delivery Routes', 'Procurement QC', 'Payment Gateway'],
                  });
                  setShowPlanModal(true);
                }}
                onEditPlan={p => {
                  setEditingPlan(p);
                  setPlanForm({
                    code: p.code,
                    name: p.name,
                    tagline: p.tagline,
                    priceMonthly: Number(p.priceMonthly),
                    priceAnnual: Number(p.priceAnnual),
                    maxCustomers: p.maxCustomers,
                    maxDeliveryStaff: p.maxDeliveryStaff,
                    maxRoutes: p.maxRoutes,
                    customDomain: p.customDomain,
                    supportLevel: p.supportLevel,
                    features: p.features || [],
                  });
                  setShowPlanModal(true);
                }}
                onArchivePlan={handleArchivePlan}
                onChangeTenantSubscription={handleChangeSubscription}
                onRefresh={loadAllData}
              />
            )}

            {/* ================================================================= */}
            {/* TAB 5: SUPPORT TICKETS                                            */}
            {/* ================================================================= */}
            {activeTab === 'tickets' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <LifeBuoy className="w-5 h-5 text-amber-400" />
                      Support Tickets & DNS Helpdesk
                    </h2>
                    <p className="text-xs text-slate-400">
                      Direct cross-tenant customer assistance and ticket resolution.
                    </p>
                  </div>

                  <select
                    value={ticketStatusFilter}
                    onChange={e => setTicketStatusFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="all">All Ticket Statuses</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Tickets List */}
                  <div className="lg:col-span-1 rounded-2xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800 overflow-hidden">
                    {filteredTickets.length === 0 ? (
                      <div className="p-8 text-center text-slate-400 text-xs">
                        No tickets match criteria.
                      </div>
                    ) : (
                      filteredTickets.map(t => {
                        const isSelected = selectedTicket?.id === t.id;
                        return (
                          <div
                            key={t.id}
                            onClick={() => openTicketThread(t)}
                            className={`p-4 cursor-pointer transition-all ${isSelected ? 'bg-indigo-950/40 border-l-4 border-indigo-500' : 'hover:bg-slate-800/40'
                              }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-xs font-bold text-white truncate">{t.tenantName}</span>
                              <span
                                className={`text-[9px] uppercase font-bold px-1.5 py-0.2 rounded-full ${t.status === 'OPEN'
                                    ? 'bg-blue-500/20 text-blue-300'
                                    : t.status === 'IN_PROGRESS'
                                      ? 'bg-purple-500/20 text-purple-300'
                                      : 'bg-emerald-500/20 text-emerald-300'
                                  }`}
                              >
                                {t.status}
                              </span>
                            </div>
                            <h4 className="text-xs font-semibold text-slate-300 mt-1 line-clamp-1">{t.subject}</h4>
                            <p className="text-[11px] text-slate-500 mt-1">{new Date(t.createdAt).toLocaleDateString()}</p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Ticket Detail & Reply Thread */}
                  <div className="lg:col-span-2 rounded-2xl bg-slate-900/80 border border-slate-800 p-5 flex flex-col justify-between space-y-4 min-h-[420px]">
                    {selectedTicket ? (
                      <div className="space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-800">
                            <div>
                              <h3 className="text-sm font-bold text-white">{selectedTicket.subject}</h3>
                              <p className="text-xs text-slate-400">
                                Tenant: <strong className="text-indigo-300">{selectedTicket.tenantName}</strong> • Category: {selectedTicket.category || 'General'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <select
                                value={selectedTicket.status}
                                onChange={e => handleUpdateTicketStatus(selectedTicket.id, e.target.value)}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white font-semibold"
                              >
                                <option value="OPEN">OPEN</option>
                                <option value="IN_PROGRESS">IN PROGRESS</option>
                                <option value="RESOLVED">RESOLVED</option>
                                <option value="CLOSED">CLOSED</option>
                              </select>
                            </div>
                          </div>

                          {/* Ticket Original Description */}
                          <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                            <p className="font-semibold text-slate-400 mb-1">Inquiry Description:</p>
                            <p>{selectedTicket.description}</p>
                          </div>

                          {/* Thread Messages */}
                          <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                            {selectedTicket.messages?.map((m: any) => (
                              <div
                                key={m.id}
                                className={`p-3 rounded-xl text-xs max-w-lg ${m.senderRole === 'SUPER_ADMIN'
                                    ? 'ml-auto bg-indigo-900/40 border border-indigo-700/50 text-indigo-100'
                                    : 'mr-auto bg-slate-800/80 border border-slate-700 text-slate-200'
                                  }`}
                              >
                                <div className="flex items-center justify-between gap-4 text-[10px] text-slate-400 mb-1">
                                  <strong>{m.senderName}</strong>
                                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <p>{m.message}</p>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Reply Input Form */}
                        <form onSubmit={handleSendTicketReply} className="pt-3 border-t border-slate-800 flex gap-2">
                          <input
                            type="text"
                            placeholder="Type response as Platform Super Admin..."
                            value={ticketReplyMessage}
                            onChange={e => setTicketReplyMessage(e.target.value)}
                            className="flex-1 px-4 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                          />
                          <button
                            type="submit"
                            disabled={sendingReply || !ticketReplyMessage.trim()}
                            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        </form>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center flex-1 text-center p-8 text-slate-500 text-xs">
                        <LifeBuoy className="w-8 h-8 text-slate-600 mb-2" />
                        <span>Select a support ticket from the list to view the conversation.</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 6: AUDIT LOGS                                                 */}
            {/* ================================================================= */}
            {activeTab === 'audit' && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-indigo-400" />
                      Platform Audit Logs & Security History
                    </h2>
                    <p className="text-xs text-slate-400">
                      Immutable record of administrative actions, plan switches, status changes, and logins.
                    </p>
                  </div>

                  <select
                    value={auditActionFilter}
                    onChange={e => setAuditActionFilter(e.target.value)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="all">All Actions</option>
                    <option value="TENANT_CREATED">Tenant Created</option>
                    <option value="TENANT_UPDATED">Tenant Updated</option>
                    <option value="PLAN_ASSIGNED">Plan Assigned</option>
                    <option value="TENANT_IMPERSONATED">Impersonation</option>
                    <option value="ONBOARDING_APPROVED">Onboarding Approved</option>
                  </select>
                </div>

                <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950/60 text-slate-400 font-bold border-b border-slate-800">
                        <tr>
                          <th className="py-3 px-4">Timestamp</th>
                          <th className="py-3 px-4">Action</th>
                          <th className="py-3 px-4">Resource</th>
                          <th className="py-3 px-4">Tenant</th>
                          <th className="py-3 px-4">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {filteredLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-8 text-center text-slate-500">
                              No audit log entries recorded.
                            </td>
                          </tr>
                        ) : (
                          filteredLogs.map(log => (
                            <tr key={log.id} className="hover:bg-slate-800/40">
                              <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                                {new Date(log.createdAt).toLocaleString()}
                              </td>
                              <td className="py-3 px-4 font-bold text-white">
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                                  {log.action}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-300 font-semibold">{log.resource}</td>
                              <td className="py-3 px-4 text-slate-300 font-medium">
                                {log.tenant?.name || log.tenantId || 'Global Platform'}
                              </td>
                              <td className="py-3 px-4 text-slate-400 font-mono text-[11px] max-w-xs truncate">
                                {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details || '—'}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 7: PLATFORM SETTINGS                                          */}
            {/* ================================================================= */}
            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fade-in max-w-3xl">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-indigo-400" />
                    Global Platform Settings
                  </h2>
                  <p className="text-xs text-slate-400">
                    Configure platform branding, trial allowances, and operational toggles.
                  </p>
                </div>

                <form onSubmit={handleSaveSettings} className="rounded-2xl bg-slate-900/80 border border-slate-800 p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Platform Name
                    </label>
                    <input
                      type="text"
                      value={settings['PLATFORM_NAME'] || 'MilkerP Dairy ERP SaaS'}
                      onChange={e => setSettings({ ...settings, PLATFORM_NAME: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Helpdesk Support Email
                    </label>
                    <input
                      type="email"
                      value={settings['SUPPORT_EMAIL'] || 'support@milkerp.com'}
                      onChange={e => setSettings({ ...settings, SUPPORT_EMAIL: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Default Tenant Free Trial Duration (Days)
                    </label>
                    <input
                      type="number"
                      value={settings['DEFAULT_TRIAL_DAYS'] || '14'}
                      onChange={e => setSettings({ ...settings, DEFAULT_TRIAL_DAYS: e.target.value })}
                      className="w-full px-4 py-2.5 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-white">Maintenance Mode</h4>
                      <p className="text-[11px] text-slate-400">
                        Restricts tenant admins and customers from accessing web portals.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings['MAINTENANCE_MODE'] === 'true'}
                      onChange={e => setSettings({ ...settings, MAINTENANCE_MODE: e.target.checked ? 'true' : 'false' })}
                      className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-950/60 border border-slate-800">
                    <div>
                      <h4 className="text-xs font-bold text-white">Allow Public Onboarding Registrations</h4>
                      <p className="text-[11px] text-slate-400">
                        Permit new dairy farm businesses to submit onboarding requests.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings['REGISTRATIONS_OPEN'] !== 'false'}
                      onChange={e => setSettings({ ...settings, REGISTRATIONS_OPEN: e.target.checked ? 'true' : 'false' })}
                      className="w-5 h-5 rounded accent-indigo-600 cursor-pointer"
                    />
                  </div>

                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
                  >
                    Save Settings
                  </button>
                </form>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 8: BILLING & PAYMENTS                                         */}
            {/* ================================================================= */}
            {activeTab === 'billing' && (
              <BillingTab onRefresh={loadAllData} />
            )}

            {/* ================================================================= */}
            {/* TAB 9: FEATURE FLAGS & OVERRIDES                                  */}
            {/* ================================================================= */}
            {activeTab === 'featureFlags' && (
              <FeatureFlagsTab tenants={tenants} onRefresh={loadAllData} />
            )}

            {/* ================================================================= */}
            {/* TAB 10: BROADCAST ANNOUNCEMENTS                                  */}
            {/* ================================================================= */}
            {activeTab === 'announcements' && (
              <AnnouncementsTab tenants={tenants} plans={plans} onRefresh={loadAllData} />
            )}

            {/* ================================================================= */}
            {/* TAB 11: PLATFORM STAFF                                            */}
            {/* ================================================================= */}
            {activeTab === 'staff' && (
              <PlatformStaffTab onRefresh={loadAllData} />
            )}

            {/* ================================================================= */}
            {/* TAB 12: REPORTS & DATA EXPORTS                                    */}
            {/* ================================================================= */}
            {activeTab === 'reports' && (
              <ReportsTab />
            )}
          </div>
        </main>
      </div>

      {/* =================================================================== */}
      {/* MODAL: CREATE TENANT                                                */}
      {/* =================================================================== */}
      {showCreateTenantModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-400" />
                Register New Dairy Tenant
              </h3>
              <button
                onClick={() => setShowCreateTenantModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Dairy Business Name</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.name}
                    onChange={e => setTenantForm({ ...tenantForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                    placeholder="e.g. Nandini Dairy Co"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subdomain Slug</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.slug}
                    onChange={e => setTenantForm({ ...tenantForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    placeholder="e.g. nandini"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerName}
                    onChange={e => setTenantForm({ ...tenantForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                    placeholder="e.g. Anand Kumar"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Owner Mobile</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerPhone}
                    onChange={e => setTenantForm({ ...tenantForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                    placeholder="+91 98000 00000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Owner Login Email</label>
                <input
                  type="email"
                  required
                  value={tenantForm.ownerEmail}
                  onChange={e => setTenantForm({ ...tenantForm, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  placeholder="anand@nandinidairy.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subscription Plan</label>
                  <select
                    value={tenantForm.planId}
                    onChange={e => setTenantForm({ ...tenantForm, planId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  >
                    <option value="">Select Plan</option>
                    {plans.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} (₹{Number(p.priceMonthly).toLocaleString('en-IN')}/mo)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Trial Period (Days)</label>
                  <input
                    type="number"
                    value={tenantForm.trialDays}
                    onChange={e => setTenantForm({ ...tenantForm, trialDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Default Admin Password</label>
                <input
                  type="password"
                  value={tenantForm.adminPassword}
                  onChange={e => setTenantForm({ ...tenantForm, adminPassword: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  placeholder="admin123"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateTenantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Create & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EDIT TENANT                                                  */}
      {/* =================================================================== */}
      {showEditTenantModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-400" />
                Edit Tenant: {selectedTenant.name}
              </h3>
              <button
                onClick={() => setShowEditTenantModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateTenant} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.name}
                    onChange={e => setTenantForm({ ...tenantForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subdomain Slug</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.slug}
                    onChange={e => setTenantForm({ ...tenantForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Owner Name</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerName}
                    onChange={e => setTenantForm({ ...tenantForm, ownerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Owner Mobile</label>
                  <input
                    type="text"
                    required
                    value={tenantForm.ownerPhone}
                    onChange={e => setTenantForm({ ...tenantForm, ownerPhone: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Owner Email</label>
                <input
                  type="email"
                  required
                  value={tenantForm.ownerEmail}
                  onChange={e => setTenantForm({ ...tenantForm, ownerEmail: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                />
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditTenantModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: EXTEND TRIAL                                                 */}
      {/* =================================================================== */}
      {showExtendTrialModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-400" />
              Extend Trial Period
            </h3>
            <p className="text-xs text-slate-400">
              Select how many extra days to grant to <strong className="text-white">{selectedTenant.name}</strong>.
            </p>

            <div className="grid grid-cols-3 gap-2">
              {[7, 14, 30].map(days => (
                <button
                  key={days}
                  onClick={() => handleExtendTrial(days)}
                  className="py-3 rounded-xl bg-slate-800 hover:bg-indigo-600 text-white text-xs font-bold transition-all border border-slate-700 cursor-pointer"
                >
                  +{days} Days
                </button>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowExtendTrialModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CHANGE PLAN                                                  */}
      {/* =================================================================== */}
      {showChangePlanModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-purple-400" />
              Change Subscription Plan
            </h3>
            <p className="text-xs text-slate-400">
              Select tier to assign to <strong className="text-white">{selectedTenant.name}</strong>:
            </p>

            <div className="space-y-2.5">
              {plans.map(p => (
                <div
                  key={p.id}
                  onClick={() => handleAssignPlan(p.id)}
                  className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-indigo-500 hover:bg-indigo-950/20 cursor-pointer transition-all flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-white">{p.name}</h4>
                    <p className="text-[11px] text-slate-400">{p.tagline}</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ₹{Number(p.priceMonthly).toLocaleString('en-IN')}/mo
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-center">
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TENANT USERS                                                 */}
      {/* =================================================================== */}
      {showTenantUsersModal && selectedTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" />
                  Users: {selectedTenant.name}
                </h3>
                <p className="text-xs text-slate-400">Tenant Admins, Delivery Staff, and Customers</p>
              </div>
              <button
                onClick={() => setShowTenantUsersModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Add User Section */}
            {!showAddUserForm ? (
              <button
                onClick={() => setShowAddUserForm(true)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-indigo-400" />
                <span>Add User to Tenant</span>
              </button>
            ) : (
              <form onSubmit={handleCreateUser} className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={userForm.name}
                    onChange={e => setUserForm({ ...userForm, name: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email"
                    value={userForm.email}
                    onChange={e => setUserForm({ ...userForm, email: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Phone"
                    value={userForm.phone}
                    onChange={e => setUserForm({ ...userForm, phone: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                  <select
                    value={userForm.role}
                    onChange={e => setUserForm({ ...userForm, role: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="DELIVERY_BOY">DELIVERY_BOY</option>
                    <option value="CUSTOMER">CUSTOMER</option>
                  </select>
                  <input
                    type="password"
                    placeholder="Password"
                    value={userForm.password}
                    onChange={e => setUserForm({ ...userForm, password: e.target.value })}
                    className="px-3 py-2 text-xs rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserForm(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
                  >
                    Create User
                  </button>
                </div>
              </form>
            )}

            {/* Users Table */}
            <div className="space-y-2">
              {loadingUsers ? (
                <p className="text-center text-xs text-slate-400 py-4">Loading users...</p>
              ) : tenantUsers.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-4">No users found for this tenant.</p>
              ) : (
                tenantUsers.map(u => (
                  <div
                    key={u.id}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{u.name}</span>
                        <span
                          className={`text-[9px] uppercase px-1.5 py-0.2 rounded font-mono font-bold ${u.role === 'ADMIN'
                              ? 'bg-purple-500/20 text-purple-300'
                              : u.role === 'DELIVERY_BOY'
                                ? 'bg-teal-500/20 text-teal-300'
                                : 'bg-blue-500/20 text-blue-300'
                            }`}
                        >
                          {u.role}
                        </span>
                        {!u.isActive && (
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 font-bold">
                            INACTIVE
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{u.email} • {u.phone || 'No Phone'}</p>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleResetUserPassword(u.id)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                        title="Reset Password"
                      >
                        <Key className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => handleToggleUserStatus(u.id, u.isActive)}
                        className={`px-2 py-1 rounded-lg font-semibold text-[10px] ${u.isActive
                            ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30'
                          }`}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CREATE / EDIT PLAN                                           */}
      {/* =================================================================== */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-400" />
              {editingPlan ? 'Edit SaaS Plan' : 'Create New SaaS Plan'}
            </h3>

            <form onSubmit={handleSavePlan} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Plan Code</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingPlan}
                    value={planForm.code}
                    onChange={e => setPlanForm({ ...planForm, code: e.target.value.toLowerCase().trim() })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                    placeholder="e.g. pro"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={planForm.name}
                    onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                    placeholder="e.g. Pro Plan"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tagline</label>
                <input
                  type="text"
                  required
                  value={planForm.tagline}
                  onChange={e => setPlanForm({ ...planForm, tagline: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white"
                  placeholder="e.g. Perfect for scaling commercial dairies"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Monthly Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={planForm.priceMonthly}
                    onChange={e => setPlanForm({ ...planForm, priceMonthly: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Customers</label>
                  <input
                    type="number"
                    required
                    value={planForm.maxCustomers}
                    onChange={e => setPlanForm({ ...planForm, maxCustomers: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Delivery Staff</label>
                  <input
                    type="number"
                    required
                    value={planForm.maxDeliveryStaff}
                    onChange={e => setPlanForm({ ...planForm, maxDeliveryStaff: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Max Routes</label>
                  <input
                    type="number"
                    required
                    value={planForm.maxRoutes}
                    onChange={e => setPlanForm({ ...planForm, maxRoutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-semibold"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="customDomainCheck"
                  checked={planForm.customDomain}
                  onChange={e => setPlanForm({ ...planForm, customDomain: e.target.checked })}
                  className="w-4 h-4 rounded accent-indigo-600"
                />
                <label htmlFor="customDomainCheck" className="text-xs text-slate-300 font-semibold cursor-pointer">
                  Includes Custom Domain Support
                </label>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30"
                >
                  Save Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: REJECT ONBOARDING REASON                                     */}
      {/* =================================================================== */}
      {rejectingOnboardingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              Reject Onboarding Request
            </h3>
            <p className="text-xs text-slate-400">
              Please enter the reason for rejecting this dairy business registration:
            </p>

            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={e => setRejectionReason(e.target.value)}
              className="w-full p-3 text-xs rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:outline-none focus:ring-2 focus:ring-rose-500"
              placeholder="e.g. Invalid phone verification or duplicate entity"
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectingOnboardingId(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRejectOnboarding}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-600/30"
              >
                Reject Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
