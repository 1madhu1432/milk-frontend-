import { api } from './apiClient';

export interface SuperAdminDashboardStats {
  tenants: {
    total: number;
    active: number;
    trial: number;
    expiredTrial?: number;
    suspended: number;
    cancelled?: number;
  };
  metrics?: {
    totalHouseholds: number;
    totalDeliveryStaff: number;
    totalInvoices: number;
    totalDeliveries: number;
    pendingOnboardingCount: number;
    openTicketsCount: number;
  };
  households: number;
  employees: number;
  invoices: number;
  deliveries: number;
  pendingOnboarding: number;
  openTickets: number;
  mrr: number;
  arr: number;
  trialToPaidConversion?: {
    ratePercent: number | null;
    convertedCount: number;
    totalHistoricalTrials: number;
    isEstimate?: boolean;
    note?: string;
  };
  tenantTrends?: {
    interval: string;
    startDate: string;
    endDate: string;
    countsByDate: { date: string; count: number }[];
  };
  health?: {
    status: 'healthy' | 'degraded' | 'down';
    database: { status: 'connected' | 'disconnected'; latencyMs: number | null; error?: string };
    uptimeSeconds: number;
    memoryUsageMB: number;
    nodeVersion: string;
  };
  recentTenants?: any[];
  recentAuditLogs?: any[];
}

export interface TenantUsageSummary {
  tenantId: string;
  tenantName: string;
  plan: {
    id: string;
    name: string;
    code: string;
    maxCustomers: number;
    maxDeliveryStaff: number;
    maxRoutes: number;
  } | null;
  usage: {
    customers: number;
    deliveryStaff: number;
    routes: number;
  };
  limits: {
    maxCustomers: number;
    maxDeliveryStaff: number;
    maxRoutes: number;
  };
  percentages: {
    customers: number;
    deliveryStaff: number;
    routes: number;
  };
  warnings: string[];
}

export interface TenantSubscriptionHistory {
  tenantId: string;
  subscriptions: any[];
  events: any[];
}

export interface PlanComparisonItem {
  id: string;
  code: string;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  maxCustomers: number;
  maxDeliveryStaff: number;
  maxRoutes: number;
  customDomain: boolean;
  supportLevel: string;
  features: string[];
  isActive: boolean;
  activeSubscriberCount: number;
}

export interface PaginatedTenantsResult {
  tenants: any[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const superAdminApi = {
  getDashboard: async (params?: { range?: '7d' | '30d' | '90d' | 'custom'; startDate?: string; endDate?: string }) => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return await api.get<SuperAdminDashboardStats>(`/super-admin/dashboard${query ? `?${query}` : ''}`);
  },

  getAnalytics: async () => {
    return await api.get<any>('/super-admin/analytics');
  },

  listTenants: async (params?: {
    search?: string;
    status?: string;
    planId?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const query = params ? new URLSearchParams(params as any).toString() : '';
    return await api.get<PaginatedTenantsResult | any[]>(`/super-admin/tenants${query ? `?${query}` : ''}`);
  },

  getTenant: async (id: string) => {
    return await api.get<any>(`/super-admin/tenants/${id}`);
  },

  createTenant: async (data: {
    name: string;
    slug: string;
    ownerName: string;
    ownerEmail: string;
    ownerPhone: string;
    planId?: string;
    trialDays?: number;
    address?: string;
    gstin?: string;
    logoEmoji?: string;
    primaryColor?: string;
    accentColor?: string;
    adminPassword?: string;
  }) => {
    return await api.post<any>('/super-admin/tenants', data);
  },

  updateTenant: async (id: string, data: any) => {
    return await api.patch<any>(`/super-admin/tenants/${id}`, data);
  },

  updateTenantStatus: async (id: string, status: string, reason?: string) => {
    return await api.patch<any>(`/super-admin/tenants/${id}/status`, { status, reason });
  },

  reactivateTenant: async (id: string, reason: string) => {
    return await api.patch<any>(`/super-admin/tenants/${id}/reactivate`, { reason });
  },

  getTenantUsage: async (id: string) => {
    return await api.get<TenantUsageSummary>(`/super-admin/tenants/${id}/usage`);
  },

  getTenantSubscriptions: async (id: string) => {
    return await api.get<TenantSubscriptionHistory>(`/super-admin/tenants/${id}/subscriptions`);
  },

  getTenantActivity: async (id: string, limit: number = 20) => {
    return await api.get<any[]>(`/super-admin/tenants/${id}/activity?limit=${limit}`);
  },

  changeSubscription: async (id: string, planId: string, billingInterval: 'MONTHLY' | 'ANNUAL' = 'MONTHLY') => {
    return await api.post<any>(`/super-admin/tenants/${id}/change-subscription`, { planId, billingInterval });
  },

  extendTrial: async (id: string, days: number = 14) => {
    return await api.patch<any>(`/super-admin/tenants/${id}/extend-trial`, { days });
  },

  assignPlan: async (id: string, planId: string) => {
    return await api.patch<any>(`/super-admin/tenants/${id}/plan`, { planId });
  },

  impersonateTenant: async (id: string) => {
    return await api.post<{
      token: string;
      refreshToken: string;
      expiresIn?: string;
      isImpersonated?: boolean;
      impersonatedBy?: string;
      tenant: {
        id: string;
        name: string;
        slug: string;
        logoEmoji: string;
        primaryColor: string;
      };
    }>(`/super-admin/tenants/${id}/impersonate`);
  },

  exitImpersonation: async (tenantId?: string) => {
    return await api.post<{ success: boolean; message: string }>('/super-admin/exit-impersonation', { tenantId });
  },

  listTenantUsers: async (tenantId: string) => {
    return await api.get<any[]>(`/super-admin/tenants/${tenantId}/users`);
  },

  createTenantUser: async (
    tenantId: string,
    data: { name: string; email: string; password?: string; role: string; phone?: string }
  ) => {
    return await api.post<any>(`/super-admin/tenants/${tenantId}/users`, data);
  },

  resetTenantUserPassword: async (tenantId: string, userId: string, password?: string) => {
    return await api.patch<any>(`/super-admin/tenants/${tenantId}/users/${userId}/password`, { password });
  },

  toggleTenantUserStatus: async (tenantId: string, userId: string, isActive: boolean) => {
    return await api.patch<any>(`/super-admin/tenants/${tenantId}/users/${userId}/status`, { isActive });
  },

  listPlans: async () => {
    return await api.get<any[]>('/super-admin/plans');
  },

  getPlanComparison: async () => {
    return await api.get<PlanComparisonItem[]>('/super-admin/plans/comparison');
  },

  createPlan: async (data: {
    code: string;
    name: string;
    tagline: string;
    priceMonthly: number;
    priceAnnual: number;
    maxCustomers: number;
    maxDeliveryStaff: number;
    maxRoutes: number;
    customDomain: boolean;
    supportLevel?: string;
    features: string[];
  }) => {
    return await api.post<any>('/super-admin/plans', data);
  },

  updatePlan: async (id: string, data: any) => {
    return await api.patch<any>(`/super-admin/plans/${id}`, data);
  },

  archivePlan: async (id: string) => {
    return await api.patch<any>(`/super-admin/plans/${id}/archive`);
  },

  listOnboarding: async (status?: string) => {
    const q = status ? `?status=${status}` : '';
    return await api.get<any[]>(`/super-admin/onboarding${q}`);
  },

  approveOnboarding: async (id: string) => {
    return await api.post<any>(`/super-admin/onboarding/${id}/approve`);
  },

  rejectOnboarding: async (id: string, reason?: string) => {
    return await api.post<any>(`/super-admin/onboarding/${id}/reject`, { reason });
  },

  listTickets: async (params?: { status?: string; priority?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return await api.get<any[]>(`/super-admin/tickets${query ? `?${query}` : ''}`);
  },

  getTicket: async (id: string) => {
    return await api.get<any>(`/super-admin/tickets/${id}`);
  },

  replyTicket: async (id: string, message: string) => {
    return await api.post<any>(`/super-admin/tickets/${id}/reply`, { message });
  },

  updateTicketStatus: async (id: string, status: string, priority?: string) => {
    return await api.patch<any>(`/super-admin/tickets/${id}/status`, { status, priority });
  },

  listDomains: async (tenantId?: string) => {
    const q = tenantId ? `?tenantId=${tenantId}` : '';
    return await api.get<any[]>(`/super-admin/domains${q}`);
  },

  createDomain: async (tenantId: string, domain: string) => {
    return await api.post<any>('/super-admin/domains', { tenantId, domain });
  },

  verifyDomain: async (id: string) => {
    return await api.patch<any>(`/super-admin/domains/${id}/verify`);
  },

  listAuditLogs: async (params?: { limit?: number; action?: string; tenantId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return await api.get<any[]>(`/super-admin/audit-logs${query ? `?${query}` : ''}`);
  },

  getSettings: async () => {
    return await api.get<Record<string, string>>('/super-admin/settings');
  },

  updateSettings: async (settings: Record<string, string>) => {
    return await api.put<Record<string, string>>('/super-admin/settings', settings);
  },

  getHealth: async () => {
    return await api.get<any>('/super-admin/health');
  },

  getBillingSummary: async () => {
    return await api.get<{
      mrr: number;
      arr: number;
      totalInvoices: number;
      paidInvoices: number;
      pendingInvoices: number;
      totalCollected: number;
      paymentGatewayConfigured: boolean;
      supportedMethods: string[];
    }>('/super-admin/billing/summary');
  },

  listInvoices: async (params?: { page?: number; limit?: number; status?: string; tenantId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return await api.get<{
      invoices: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/super-admin/billing/invoices${query ? `?${query}` : ''}`);
  },

  listPayments: async (params?: { page?: number; limit?: number; tenantId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return await api.get<{
      payments: any[];
      pagination: { page: number; limit: number; total: number; totalPages: number };
    }>(`/super-admin/billing/payments${query ? `?${query}` : ''}`);
  },

  overrideQuota: async (
    tenantId: string,
    quotas: { maxCustomers?: number; maxDeliveryStaff?: number; maxRoutes?: number },
    reason: string = 'Approved quota change'
  ) => {
    return await api.patch<any>(`/super-admin/tenants/${tenantId}/override-quota`, {
      quotas,
      reason,
    });
  },

  listFeatureFlags: async () => {
    return await api.get<Record<string, { name: string; enabled: boolean; description: string }>>('/super-admin/feature-flags');
  },

  updateFeatureFlag: async (key: string, enabled: boolean) => {
    return await api.patch<any>('/super-admin/feature-flags', {
      key,
      enabled,
    });
  },

  listAnnouncements: async () => {
    return await api.get<any[]>('/super-admin/announcements');
  },

  createAnnouncement: async (data: {
    title: string;
    message?: string;
    content?: string;
    type?: 'INFO' | 'WARNING' | 'ALERT' | 'MAINTENANCE';
    targetType?: 'ALL' | 'TENANT' | 'PLAN';
    targetId?: string;
    expiresAt?: string;
  }) => {
    return await api.post<any>('/super-admin/announcements', data);
  },

  deleteAnnouncement: async (id: string) => {
    return await api.delete<any>(`/super-admin/announcements/${id}`);
  },

  listPlatformStaff: async () => {
    return await api.get<any[]>('/super-admin/staff');
  },

  createPlatformStaff: async (data: { name: string; email: string; password?: string; phone?: string }) => {
    return await api.post<any>('/super-admin/staff', data);
  },

  togglePlatformStaffStatus: async (userId: string, isActive: boolean) => {
    return await api.patch<any>(`/super-admin/staff/${userId}/status`, { isActive });
  },

  exportDataUrl: (type: 'tenants' | 'revenue' | 'subscriptions' | 'audit') => {
    return `/api/v1/super-admin/reports/export?type=${type}`;
  },
};
