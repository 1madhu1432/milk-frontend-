export type TenantPlanId = 'starter' | 'growth' | 'enterprise';

export type TenantStatus = 'active' | 'trial' | 'suspended' | 'cancelled';

export interface TenantPlan {
  id: TenantPlanId;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceAnnual: number;
  maxCustomers: number;
  maxDeliveryStaff: number;
  maxRoutes: number;
  features: string[];
  supportLevel: string;
  isPopular?: boolean;
}

export interface TenantSubscription {
  planId: TenantPlanId;
  status: TenantStatus;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  trialEndsAt?: string;
  billingInterval: 'monthly' | 'annual';
  autoRenew: boolean;
  paymentMethod?: string;
  lastInvoiceId?: string;
  amountPaid?: number;
}

export interface TenantBranding {
  dairyName: string;
  tagline: string;
  logoEmoji: string;
  logoUrl?: string;
  primaryColor: string;
  accentColor: string;
  supportEmail: string;
  supportPhone: string;
  address: string;
  gstin?: string;
}

export type CustomDomainStatus =
  | 'not_configured'
  | 'pending_dns'
  | 'verifying'
  | 'verified'
  | 'ssl_provisioning'
  | 'active'
  | 'verification_failed'
  | 'ssl_error';

export interface DnsRecordEntry {
  type: 'TXT' | 'CNAME' | 'A';
  name: string;
  target: string;
  verified: boolean;
  ttl?: string;
}

export interface CustomDomainConfig {
  subdomain: string; // e.g. "harish" -> harish.milkerp.com
  customDomain?: string; // e.g. "milk.harishdairy.in"
  status: CustomDomainStatus;
  verificationToken: string;
  dnsRecords: DnsRecordEntry[];
  sslStatus: 'pending' | 'issued' | 'error' | 'not_requested';
  verifiedAt?: string;
  errorMessage?: string;
  primaryDomain: 'subdomain' | 'custom_domain';
}

export interface TenantIntegrationSummary {
  razorpayConfigured: boolean;
  whatsappConfigured: boolean;
  emailConfigured: boolean;
  smsConfigured: boolean;
}

export interface TenantStats {
  customerCount: number;
  dailyVolumeLitres: number;
  activeRoutes: number;
  deliveryStaffCount: number;
  monthlyRevenue: number;
}

export interface Tenant {
  id: string; // e.g. "tenant-harish-dairy"
  slug: string; // e.g. "harish"
  name: string;
  ownerName: string;
  ownerEmail: string;
  ownerPhone: string;
  createdAt: string;
  status: TenantStatus;
  planId: TenantPlanId;
  subscription: TenantSubscription;
  branding: TenantBranding;
  domainConfig: CustomDomainConfig;
  integrationsSummary: TenantIntegrationSummary;
  stats: TenantStats;
}

export interface PlatformTicket {
  id: string;
  tenantId: string;
  tenantName: string;
  subject: string;
  description: string;
  category: 'billing' | 'domain' | 'integration' | 'bug' | 'feature';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

