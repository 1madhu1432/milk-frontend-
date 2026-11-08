import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Tenant,
  TenantPlan,
  TenantPlanId,
  TenantStatus,
  TenantSubscription,
  TenantBranding,
  CustomDomainConfig,
  PlatformTicket,
} from '../models/tenant';
import {
  initialTenants,
  initialTenantPlans,
  initialPlatformTickets,
} from '../data/seedTenants';

interface TenantContextType {
  tenants: Tenant[];
  currentTenant: Tenant;
  plans: TenantPlan[];
  tickets: PlatformTicket[];

  // Direct branding and subscription helpers for active tenant
  tenantBranding: TenantBranding;
  subscription: TenantSubscription;
  domainConfig: CustomDomainConfig;

  // Tenant Resolution & Multi-tenant Switching
  resolveTenant: (identifier: string) => Tenant | undefined;
  switchTenant: (tenantId: string, bypassRoleCheck?: boolean) => boolean;

  // Tenant Operations
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => void;
  updateDomainConfig: (tenantId: string, updates: Partial<CustomDomainConfig>) => void;
  updateBranding: (tenantId: string, updates: Partial<TenantBranding>) => void;
  updateSubscriptionPlan: (tenantId: string, planId: TenantPlanId, interval?: 'monthly' | 'annual') => void;
  updateTenantStatus: (tenantId: string, status: TenantStatus) => void;
  createTenant: (tenantData: Partial<Tenant>) => Tenant;

  // Platform Tickets
  addTicket: (ticket: Omit<PlatformTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>) => PlatformTicket;
  updateTicketStatus: (ticketId: string, status: PlatformTicket['status']) => void;

  // Demo Reset
  resetTenantDemoData: () => void;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

const TENANTS_STORAGE_KEY = 'dairynexa_multi_tenant_registry_v3';
const CURRENT_TENANT_ID_KEY = 'dairynexa_active_tenant_id_v3';
const TICKETS_STORAGE_KEY = 'dairynexa_platform_tickets_v3';

function formatDairyName(slug: string): string {
  if (!slug) return 'DairyNexa';
  const cleaned = slug.replace(/[-_]+/g, ' ').trim();
  const words = cleaned
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  if (words.toLowerCase().includes('dairy') || words.toLowerCase().includes('milk') || words.toLowerCase().includes('farm')) {
    return words;
  }
  return `${words} Dairy Farm`;
}

function buildDynamicTenant(slug: string): Tenant {
  const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-]/g, '') || 'dairy';
  const dairyName = formatDairyName(cleanSlug);
  return {
    id: `tenant-${cleanSlug}`,
    slug: cleanSlug,
    name: dairyName,
    ownerName: `${dairyName} Operations`,
    ownerEmail: `admin@${cleanSlug}.com`,
    ownerPhone: '+91 98000 00000',
    createdAt: new Date().toISOString(),
    status: 'active',
    planId: 'growth',
    subscription: {
      planId: 'growth',
      status: 'active',
      currentPeriodStart: new Date().toISOString(),
      currentPeriodEnd: new Date(Date.now() + 30 * 86400000).toISOString(),
      billingInterval: 'monthly',
      autoRenew: true,
      paymentMethod: 'Razorpay Autopay',
      amountPaid: 6999,
    },
    branding: {
      dairyName: dairyName,
      tagline: 'Farm-Fresh Milk Delivered Daily by 7:00 AM',
      logoEmoji: '🥛',
      primaryColor: '#059669',
      accentColor: '#047857',
      supportEmail: `support@${cleanSlug}.com`,
      supportPhone: '+91 98000 00000',
      address: 'Main Dairy Complex',
      gstin: '36AAAAA0000A1Z5',
    },
    domainConfig: {
      subdomain: cleanSlug,
      customDomain: `${cleanSlug}.dairynexa.com`,
      status: 'active',
      verificationToken: `token-${cleanSlug}`,
      dnsRecords: [],
      sslStatus: 'issued',
      primaryDomain: 'subdomain',
    },
    integrationsSummary: {
      razorpayConfigured: true,
      whatsappConfigured: true,
      emailConfigured: true,
      smsConfigured: true,
    },
    stats: {
      customerCount: 120,
      dailyVolumeLitres: 240,
      activeRoutes: 3,
      deliveryStaffCount: 3,
      monthlyRevenue: 432000,
    },
  };
}

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load tenants registry
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(TENANTS_STORAGE_KEY);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const cleaned: Tenant[] = parsed.filter((t: Tenant) => t.id !== 'tenant-gokul-organic' && t.id !== 'tenant-vrindavan-farms');
            // Ensure default tenant exists
            if (!cleaned.some(t => t.id === 'tenant-dairynexa')) {
              const defaultTenant = initialTenants.find(t => t.id === 'tenant-dairynexa');
              if (defaultTenant) cleaned.unshift(defaultTenant);
            }
            return cleaned;
          }
        } catch {
          // ignore
        }
      }
    }
    return initialTenants;
  });

  // Current active tenant ID (with automatic URL ?dairy= and subdomain resolution)
  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      // 1. Check URL query parameters: ?dairy=xyz or ?tenant=xyz
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const querySlug = urlParams.get('dairy') || urlParams.get('tenant');
        if (querySlug) {
          const clean = querySlug.toLowerCase();
          const matched = initialTenants.find(
            t =>
              t.id.toLowerCase() === clean ||
              t.slug.toLowerCase() === clean ||
              t.domainConfig.subdomain.toLowerCase() === clean
          );
          if (matched) return matched.id;
          return `tenant-${clean}`;
        }

        // 2. Check Subdomain (e.g. madhu.dairynexa.com, madhu.diarynext.com, madhu.localhost)
        const hostParts = window.location.hostname.split('.');
        let sub = '';
        if (hostParts.length > 2 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
          sub = hostParts[0].toLowerCase();
        } else if (hostParts.length === 2 && hostParts[1] === 'localhost' && hostParts[0] !== 'localhost') {
          sub = hostParts[0].toLowerCase();
        }

        if (sub) {
          const subMatched = initialTenants.find(
            t =>
              t.domainConfig.subdomain.toLowerCase() === sub ||
              t.slug.toLowerCase() === sub ||
              t.id.toLowerCase() === sub
          );
          if (subMatched) return subMatched.id;
          return `tenant-${sub}`;
        }
      } catch {
        // ignore url parsing issues
      }

      // 3. Check saved ID in localStorage
      if (window.localStorage) {
        const savedId = localStorage.getItem(CURRENT_TENANT_ID_KEY);
        if (savedId && savedId !== 'tenant-harish-dairy' && savedId !== 'tenant-gokul-organic' && savedId !== 'tenant-vrindavan-farms') {
          return savedId;
        }
      }
    }
    return 'tenant-dairynexa';
  });

  // Listen to URL query parameter or subdomain changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const querySlug = urlParams.get('dairy') || urlParams.get('tenant');
      if (querySlug) {
        const clean = querySlug.toLowerCase();
        const matched = tenants.find(
          t =>
            t.id.toLowerCase() === clean ||
            t.slug.toLowerCase() === clean ||
            t.domainConfig.subdomain.toLowerCase() === clean
        );
        if (matched) {
          if (matched.id !== currentTenantId) {
            setCurrentTenantId(matched.id);
          }
        } else {
          const newTenant = buildDynamicTenant(querySlug);
          setTenants(prev => [...prev, newTenant]);
          setCurrentTenantId(newTenant.id);
        }
        return;
      }

      // Subdomain check
      const hostParts = window.location.hostname.split('.');
      let sub = '';
      if (hostParts.length > 2 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
        sub = hostParts[0].toLowerCase();
      } else if (hostParts.length === 2 && hostParts[1] === 'localhost' && hostParts[0] !== 'localhost') {
        sub = hostParts[0].toLowerCase();
      }
      if (sub) {
        const subMatched = tenants.find(
          t =>
            t.domainConfig.subdomain.toLowerCase() === sub ||
            t.slug.toLowerCase() === sub ||
            t.id.toLowerCase() === sub
        );
        if (subMatched) {
          if (subMatched.id !== currentTenantId) {
            setCurrentTenantId(subMatched.id);
          }
        } else {
          const newTenant = buildDynamicTenant(sub);
          setTenants(prev => [...prev, newTenant]);
          setCurrentTenantId(newTenant.id);
        }
      }
    } catch {
      // ignore
    }
  }, [tenants, currentTenantId]);

  // Platform tickets
  const [tickets, setTickets] = useState<PlatformTicket[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(TICKETS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return initialPlatformTickets;
  });

  const plans = initialTenantPlans;

  // Resolve current active tenant object (prioritizing URL query param and subdomain)
  const currentTenant = useMemo(() => {
    if (typeof window !== 'undefined') {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const querySlug = urlParams.get('dairy') || urlParams.get('tenant');
        if (querySlug) {
          const clean = querySlug.toLowerCase();
          const matched = tenants.find(
            t =>
              t.id.toLowerCase() === clean ||
              t.slug.toLowerCase() === clean ||
              t.domainConfig.subdomain.toLowerCase() === clean
          );
          if (matched) return matched;
          return buildDynamicTenant(querySlug);
        }

        const hostParts = window.location.hostname.split('.');
        let sub = '';
        if (hostParts.length > 2 && hostParts[0] !== 'www' && hostParts[0] !== 'localhost') {
          sub = hostParts[0].toLowerCase();
        } else if (hostParts.length === 2 && hostParts[1] === 'localhost' && hostParts[0] !== 'localhost') {
          sub = hostParts[0].toLowerCase();
        }
        if (sub) {
          const subMatched = tenants.find(
            t =>
              t.domainConfig.subdomain.toLowerCase() === sub ||
              t.slug.toLowerCase() === sub ||
              t.id.toLowerCase() === sub
          );
          if (subMatched) return subMatched;
          return buildDynamicTenant(sub);
        }
      } catch {
        // ignore
      }
    }
    return tenants.find(t => t.id === currentTenantId) || tenants[0] || initialTenants[0];
  }, [tenants, currentTenantId]);

  const tenantBranding = currentTenant.branding;
  const subscription = currentTenant.subscription;
  const domainConfig = currentTenant.domainConfig;

  // Persist tenants to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(TENANTS_STORAGE_KEY, JSON.stringify(tenants));
    } catch (e) {
      console.warn('Could not persist tenants to localStorage', e);
    }
  }, [tenants]);

  // Persist current active tenant ID
  useEffect(() => {
    try {
      localStorage.setItem(CURRENT_TENANT_ID_KEY, currentTenantId);
    } catch (e) {
      console.warn('Could not persist current tenant ID', e);
    }
  }, [currentTenantId]);

  // Persist tickets
  useEffect(() => {
    try {
      localStorage.setItem(TICKETS_STORAGE_KEY, JSON.stringify(tickets));
    } catch (e) {
      console.warn('Could not persist platform tickets', e);
    }
  }, [tickets]);

  // Resolve tenant by ID, slug, or custom domain
  const resolveTenant = useCallback(
    (identifier: string): Tenant | undefined => {
      const cleaned = identifier.toLowerCase().trim();
      return tenants.find(
        t =>
          t.id.toLowerCase() === cleaned ||
          t.slug.toLowerCase() === cleaned ||
          t.domainConfig.subdomain.toLowerCase() === cleaned ||
          t.domainConfig.customDomain?.toLowerCase() === cleaned
      );
    },
    [tenants]
  );

  // Switch active tenant (Enforced for Super Admin testing; regular users cannot freely switch)
  const switchTenant = useCallback(
    (tenantId: string, bypassRoleCheck = false): boolean => {
      const target = tenants.find(t => t.id === tenantId);
      if (!target) return false;

      // Check current session role from localStorage
      if (!bypassRoleCheck && typeof window !== 'undefined') {
        try {
          const session = JSON.parse(localStorage.getItem('dairynexa_session') || localStorage.getItem('harish_dairy_session') || '{}');
          if (session.role && session.role !== 'super_admin' && session.role !== 'admin') {
            console.warn('Tenant switching restricted: Only Super Admin and authorized testers can switch tenants.');
            return false;
          }
        } catch {
          // ignore
        }
      }

      setCurrentTenantId(target.id);
      return true;
    },
    [tenants]
  );

  // Update tenant general metadata
  const updateTenant = useCallback((tenantId: string, updates: Partial<Tenant>) => {
    setTenants(prev =>
      prev.map(t => (t.id === tenantId ? { ...t, ...updates } : t))
    );
  }, []);

  // Update domain configuration
  const updateDomainConfig = useCallback((tenantId: string, updates: Partial<CustomDomainConfig>) => {
    setTenants(prev =>
      prev.map(t =>
        t.id === tenantId
          ? {
            ...t,
            domainConfig: {
              ...t.domainConfig,
              ...updates,
            },
          }
          : t
      )
    );
  }, []);

  // Update tenant branding tokens
  const updateBranding = useCallback((tenantId: string, updates: Partial<TenantBranding>) => {
    setTenants(prev =>
      prev.map(t =>
        t.id === tenantId
          ? {
            ...t,
            branding: {
              ...t.branding,
              ...updates,
            },
          }
          : t
      )
    );
  }, []);

  // Update subscription tier
  const updateSubscriptionPlan = useCallback(
    (tenantId: string, planId: TenantPlanId, interval: 'monthly' | 'annual' = 'monthly') => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) return;

      const price = interval === 'annual' ? plan.priceAnnual : plan.priceMonthly;
      const now = new Date();
      const nextMonth = new Date(now);
      if (interval === 'annual') {
        nextMonth.setFullYear(now.getFullYear() + 1);
      } else {
        nextMonth.setMonth(now.getMonth() + 1);
      }

      setTenants(prev =>
        prev.map(t =>
          t.id === tenantId
            ? {
              ...t,
              planId,
              status: 'active',
              subscription: {
                ...t.subscription,
                planId,
                status: 'active',
                billingInterval: interval,
                currentPeriodStart: now.toISOString(),
                currentPeriodEnd: nextMonth.toISOString(),
                amountPaid: price,
              },
            }
            : t
        )
      );
    },
    [plans]
  );

  // Update tenant operational status (e.g. approve, suspend, reactivate)
  const updateTenantStatus = useCallback((tenantId: string, status: TenantStatus) => {
    setTenants(prev =>
      prev.map(t =>
        t.id === tenantId
          ? {
            ...t,
            status,
            subscription: {
              ...t.subscription,
              status,
            },
          }
          : t
      )
    );
  }, []);

  // Create new tenant (Self-service onboarding or Super Admin)
  const createTenant = useCallback(
    (tenantData: Partial<Tenant>): Tenant => {
      const planId = tenantData.planId || 'starter';
      const plan = plans.find(p => p.id === planId) || plans[0];
      const generatedSlug = tenantData.slug?.trim() || (tenantData.name ? tenantData.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') : `dairy-${Date.now().toString().slice(-4)}`);
      const slug = generatedSlug || `dairy-${Date.now().toString().slice(-4)}`;
      const id = tenantData.id || `tenant-${slug}`;

      const newTenant: Tenant = {
        id,
        slug,
        name: tenantData.name || 'New Dairy Farm',
        ownerName: tenantData.ownerName || 'Dairy Owner',
        ownerEmail: tenantData.ownerEmail || 'owner@dairy.demo',
        ownerPhone: tenantData.ownerPhone || '+91 98000 00000',
        createdAt: new Date().toISOString(),
        status: tenantData.status || 'trial',
        planId,
        subscription: tenantData.subscription || {
          planId,
          status: 'trial',
          currentPeriodStart: new Date().toISOString(),
          currentPeriodEnd: new Date(Date.now() + 14 * 86400000).toISOString(),
          trialEndsAt: new Date(Date.now() + 14 * 86400000).toISOString(),
          billingInterval: 'monthly',
          autoRenew: false,
          amountPaid: 0,
        },
        branding: tenantData.branding || {
          dairyName: tenantData.name || 'New Dairy Farm',
          tagline: 'Fresh Farm Milk Delivered Daily',
          logoEmoji: '🥛',
          primaryColor: '#16803D',
          accentColor: '#14532D',
          supportEmail: tenantData.ownerEmail || 'support@dairy.demo',
          supportPhone: tenantData.ownerPhone || '+91 98000 00000',
          address: 'Dairy Facility Address',
        },
        domainConfig: tenantData.domainConfig || {
          subdomain: slug,
          customDomain: `${slug}.dairynexa.com`,
          status: 'active',
          verificationToken: `dairynexa-verify-token-${Math.random().toString(36).substring(2, 9)}`,
          dnsRecords: [
            {
              type: 'CNAME',
              name: `${slug}.dairynexa.com`,
              target: 'cname.vercel-dns.com',
              verified: true,
              ttl: '3600',
            },
          ],
          sslStatus: 'issued',
          primaryDomain: 'subdomain',
        },
        integrationsSummary: tenantData.integrationsSummary || {
          razorpayConfigured: false,
          whatsappConfigured: false,
          emailConfigured: false,
          smsConfigured: false,
        },
        stats: tenantData.stats || {
          customerCount: 0,
          dailyVolumeLitres: 0,
          activeRoutes: 0,
          deliveryStaffCount: 0,
          monthlyRevenue: 0,
        },
      };

      setTenants(prev => [newTenant, ...prev]);
      setCurrentTenantId(newTenant.id);
      return newTenant;
    },
    [plans]
  );

  // Add platform support ticket
  const addTicket = useCallback(
    (ticketData: Omit<PlatformTicket, 'id' | 'createdAt' | 'updatedAt' | 'status'>): PlatformTicket => {
      const now = new Date().toISOString();
      const newTicket: PlatformTicket = {
        ...ticketData,
        id: `TCK-${Date.now().toString().slice(-6)}`,
        status: 'open',
        createdAt: now,
        updatedAt: now,
      };

      setTickets(prev => [newTicket, ...prev]);
      return newTicket;
    },
    []
  );

  // Update ticket status
  const updateTicketStatus = useCallback((ticketId: string, status: PlatformTicket['status']) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === ticketId
          ? { ...t, status, updatedAt: new Date().toISOString() }
          : t
      )
    );
  }, []);

  // Reset to initial demo factory state
  const resetTenantDemoData = useCallback(() => {
    localStorage.removeItem(TENANTS_STORAGE_KEY);
    localStorage.removeItem(CURRENT_TENANT_ID_KEY);
    localStorage.removeItem(TICKETS_STORAGE_KEY);
    setTenants(initialTenants);
    setCurrentTenantId('tenant-dairynexa');
    setTickets(initialPlatformTickets);
  }, []);

  return (
    <TenantContext.Provider
      value={{
        tenants,
        currentTenant,
        plans,
        tickets,
        tenantBranding,
        subscription,
        domainConfig,
        resolveTenant,
        switchTenant,
        updateTenant,
        updateDomainConfig,
        updateBranding,
        updateSubscriptionPlan,
        updateTenantStatus,
        createTenant,
        addTicket,
        updateTicketStatus,
        resetTenantDemoData,
      }}
    >
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

