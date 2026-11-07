import {
  IntegrationsState,
  RazorpayConfig,
  WhatsAppConfig,
  EmailConfig,
  SmsConfig,
  AutomationRule,
  UnifiedNotificationLog,
} from '../../models/integrations';

export const INTEGRATIONS_STORAGE_KEY = 'milkerp_integrations_config_v1';
export const AUTOMATION_RULES_STORAGE_KEY = 'milkerp_automation_rules_v1';
export const UNIFIED_LOGS_STORAGE_KEY = 'milkerp_unified_notification_logs_v1';

export const initialIntegrationsState: IntegrationsState = {
  razorpay: {
    id: 'razorpay',
    name: 'Razorpay Payment Gateway',
    mode: 'test',
    keyId: '',
    keySecret: '',
    webhookSecret: '',
    autoCapture: true,
    currency: 'INR',
    merchantName: 'Harish Dairy Farm',
    themeColor: '#16803D',
    enabled: false,
    status: 'not_configured',
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp Business Messaging',
    provider: 'meta_cloud_api',
    phoneNumberId: '',
    wabaId: '',
    accessToken: '',
    webhookVerifyToken: '',
    fromPhoneNumber: '+91 98765 43210',
    templateDeliveryCompleted: 'dairy_daily_delivery_v2',
    templateInvoiceGenerated: 'dairy_monthly_invoice_bill_v1',
    templatePaymentReminder: 'dairy_payment_reminder_v1',
    templateOrderDispatched: 'dairy_order_dispatch_v1',
    enabled: false,
    status: 'not_configured',
  },
  email: {
    id: 'email',
    name: 'Email Delivery (SMTP / Transactional)',
    provider: 'smtp',
    fromName: 'Harish Dairy Accounts',
    fromEmail: 'billing@harishdairy.in',
    replyToEmail: 'support@harishdairy.in',
    smtpHost: 'smtp.sendgrid.net',
    smtpPort: 587,
    smtpUser: 'apikey',
    smtpPassword: '',
    smtpSecure: true,
    apiKey: '',
    enabled: false,
    status: 'not_configured',
  },
  sms: {
    id: 'sms',
    name: 'SMS Gateway (Indian DLT Compliant)',
    provider: 'msg91',
    apiKey: '',
    senderId: 'HRSHDY',
    principalEntityId: '',
    dltTemplateDelivery: '1107161234567890123',
    dltTemplateInvoice: '1107161234567890124',
    dltTemplatePayment: '1107161234567890125',
    dltTemplateOtp: '1107161234567890126',
    enabled: false,
    status: 'not_configured',
  },
};

export const initialAutomationRules: AutomationRule[] = [
  {
    id: 'rule_delivery_completed',
    eventType: 'delivery_completed',
    title: 'Daily Delivery Completed',
    description: 'Triggered when delivery staff marks daily milk/products as delivered at customer doorstep.',
    enabled: true,
    channels: {
      whatsapp: true,
      email: false,
      sms: true,
    },
  },
  {
    id: 'rule_invoice_generated',
    eventType: 'invoice_generated',
    title: 'Monthly Bill Generated & Finalized',
    description: 'Triggered when month-end milk billing invoices are generated and finalized.',
    enabled: true,
    channels: {
      whatsapp: true,
      email: true,
      sms: false,
    },
  },
  {
    id: 'rule_payment_received',
    eventType: 'payment_received',
    title: 'Payment Confirmation & Receipt',
    description: 'Triggered upon successful online payment gateway or cash/UPI collection recording.',
    enabled: true,
    channels: {
      whatsapp: true,
      email: true,
      sms: true,
    },
  },
  {
    id: 'rule_payment_overdue',
    eventType: 'payment_overdue',
    title: 'Payment Due / Overdue Reminder',
    description: 'Sent on the 3rd and 7th day of the month for unpaid previous month dairy bills.',
    enabled: true,
    channels: {
      whatsapp: true,
      email: true,
      sms: false,
    },
  },
  {
    id: 'rule_low_balance',
    eventType: 'low_balance',
    title: 'Low Prepaid Wallet / Deposit Balance',
    description: 'Alerts customer when wallet balance falls below 3 days of average daily consumption.',
    enabled: false,
    channels: {
      whatsapp: true,
      email: false,
      sms: true,
    },
  },
  {
    id: 'rule_order_update',
    eventType: 'order_update',
    title: 'Dairy Add-on Order Confirmed / Dispatched',
    description: 'Status updates for on-demand paneer, ghee, curd, or sweet orders.',
    enabled: true,
    channels: {
      whatsapp: true,
      email: false,
      sms: true,
    },
  },
];

export const initialUnifiedLogs: UnifiedNotificationLog[] = [
  {
    id: 'LOG-INT-8901',
    timestamp: '01/11/2026, 06:45 AM',
    customerId: 'CUST-1001',
    customerName: 'Aarav Sharma',
    recipient: '+91 98234 56789',
    channel: 'whatsapp',
    eventType: 'delivery_completed',
    provider: 'Meta Cloud API',
    status: 'Delivered',
    providerMessageId: 'wamid.HBgMOTE5ODIzNDU2Nzg5FQIAERgSQTcyODkyMTc1Q0M4ODkwAA==',
    payloadSummary: 'Delivered 2.0L Cow Milk at doorstep. Temp: 4.2°C.',
    idempotencyKey: 'delivery_completed_DEL-2026-11-01-001_whatsapp',
    retryCount: 0,
    relatedEntityId: 'DEL-2026-11-01-001',
  },
  {
    id: 'LOG-INT-8902',
    timestamp: '01/11/2026, 06:45 AM',
    customerId: 'CUST-1001',
    customerName: 'Aarav Sharma',
    recipient: '+91 98234 56789',
    channel: 'sms',
    eventType: 'delivery_completed',
    provider: 'MSG91 (DLT: HRSHDY)',
    status: 'Delivered',
    providerMessageId: 'msg_91_dlt_778219028',
    payloadSummary: 'Harish Dairy: 2L Cow milk delivered. DLT Template: 1107161234567890123',
    idempotencyKey: 'delivery_completed_DEL-2026-11-01-001_sms',
    retryCount: 0,
    relatedEntityId: 'DEL-2026-11-01-001',
  },
  {
    id: 'LOG-INT-8899',
    timestamp: '01/11/2026, 09:00 AM',
    customerId: 'CUST-1004',
    customerName: 'Priya Patel',
    recipient: 'priya.patel@example.com',
    channel: 'email',
    eventType: 'invoice_generated',
    provider: 'SendGrid SMTP',
    status: 'Delivered',
    providerMessageId: 'smtp_sg_90219808123',
    payloadSummary: 'Tax Invoice DD-202610-004 for Oct 2026 (₹2,340). PDF attached.',
    idempotencyKey: 'invoice_generated_DD-202610-004_email',
    retryCount: 0,
    relatedEntityId: 'DD-202610-004',
  },
  {
    id: 'LOG-INT-8895',
    timestamp: '01/11/2026, 11:30 AM',
    customerId: 'CUST-1002',
    customerName: 'Vikram Joshi',
    recipient: '+91 98765 43211',
    channel: 'whatsapp',
    eventType: 'payment_received',
    provider: 'Meta Cloud API',
    status: 'Delivered',
    providerMessageId: 'wamid.HBgMOTE5ODc2NTQzMjExFQIAERgSRTk5MDI4MTc1Q0M4ODkwAA==',
    payloadSummary: 'Payment received ₹1,800 via UPI (Ref: pay_rzp_990182). Receipt generated.',
    idempotencyKey: 'payment_received_pay_rzp_990182_whatsapp',
    retryCount: 0,
    relatedEntityId: 'pay_rzp_990182',
  },
];

/**
 * Mask secret credentials: show only last 4 chars (e.g. "••••••••k8Z9")
 */
export function maskSecret(secret: string, visibleChars = 4): string {
  if (!secret) return '';
  if (secret.length <= visibleChars) return '••••';
  const maskedLength = Math.max(secret.length - visibleChars, 6);
  return '•'.repeat(maskedLength) + secret.slice(-visibleChars);
}

/**
 * Strips raw API secrets before saving to browser localStorage.
 * Real secrets are stored server-side encrypted via AES-256.
 */
export function sanitizeIntegrationsForStorage(state: IntegrationsState): IntegrationsState {
  return {
    razorpay: {
      ...state.razorpay,
      keySecret: state.razorpay.keySecret ? '••••••••' : '',
      webhookSecret: state.razorpay.webhookSecret ? '••••••••' : '',
    },
    whatsapp: {
      ...state.whatsapp,
      accessToken: state.whatsapp.accessToken ? '••••••••' : '',
      webhookVerifyToken: state.whatsapp.webhookVerifyToken ? '••••••••' : '',
    },
    email: {
      ...state.email,
      smtpPassword: state.email.smtpPassword ? '••••••••' : '',
      apiKey: state.email.apiKey ? '••••••••' : '',
    },
    sms: {
      ...state.sms,
      apiKey: state.sms.apiKey ? '••••••••' : '',
    },
  };
}

/**
 * Validates Razorpay configuration inputs
 */
export function validateRazorpayConfig(config: RazorpayConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config.keyId?.trim()) {
    errors.push('Razorpay Key ID is required (e.g., rzp_test_... or rzp_live_...)');
  } else if (!config.keyId.startsWith('rzp_test_') && !config.keyId.startsWith('rzp_live_')) {
    errors.push('Razorpay Key ID should typically begin with "rzp_test_" or "rzp_live_"');
  }

  if (!config.keySecret?.trim()) {
    errors.push('Razorpay Key Secret is required');
  } else if (config.keySecret.length < 12) {
    errors.push('Razorpay Key Secret must be at least 12 characters');
  }

  if (!config.webhookSecret?.trim()) {
    errors.push('Razorpay Webhook Secret is required for signature verification');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates WhatsApp configuration inputs
 */
export function validateWhatsAppConfig(config: WhatsAppConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!config.phoneNumberId?.trim()) {
    errors.push('WhatsApp Phone Number ID is required');
  } else if (!/^\d{8,25}$/.test(config.phoneNumberId.trim())) {
    errors.push('WhatsApp Phone Number ID must contain only digits (10-25 digits)');
  }

  if (!config.wabaId?.trim()) {
    errors.push('WhatsApp Business Account ID (WABA ID) is required');
  }

  if (!config.accessToken?.trim()) {
    errors.push('System User Access Token is required');
  } else if (config.accessToken.length < 20) {
    errors.push('WhatsApp Access Token appears invalid or too short');
  }

  if (!config.fromPhoneNumber?.trim()) {
    errors.push('Official Sender Display Phone Number is required');
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates Email configuration inputs
 */
export function validateEmailConfig(config: EmailConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!config.fromEmail?.trim() || !emailRegex.test(config.fromEmail.trim())) {
    errors.push('Valid Sender From Email address is required (e.g. billing@harishdairy.in)');
  }

  if (!config.fromName?.trim()) {
    errors.push('Sender Display Name is required');
  }

  if (config.provider === 'smtp') {
    if (!config.smtpHost?.trim()) {
      errors.push('SMTP Host Server is required (e.g., smtp.sendgrid.net, smtp.gmail.com)');
    }
    if (!config.smtpPort || config.smtpPort <= 0 || config.smtpPort > 65535) {
      errors.push('Valid SMTP Port is required (commonly 587, 465, or 25)');
    }
    if (!config.smtpUser?.trim()) {
      errors.push('SMTP Username is required');
    }
    if (!config.smtpPassword?.trim()) {
      errors.push('SMTP Password or API Key is required');
    }
  } else {
    if (!config.apiKey?.trim()) {
      errors.push(`API Key is required for transactional provider ${config.provider.toUpperCase()}`);
    }
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates SMS configuration inputs
 */
export function validateSmsConfig(config: SmsConfig): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.apiKey?.trim()) {
    errors.push('SMS Gateway API Key / Auth Token is required');
  }

  if (!config.senderId?.trim()) {
    errors.push('6-character DLT Sender ID / Header is required (e.g., HRSHDY)');
  } else if (config.senderId.trim().length !== 6) {
    errors.push('Indian TRAI DLT Sender ID must be exactly 6 alphanumeric characters');
  }

  if (!config.principalEntityId?.trim()) {
    errors.push('TRAI DLT Principal Entity ID (PE ID) is required for Indian compliance');
  } else if (!/^\d{16,21}$/.test(config.principalEntityId.trim())) {
    errors.push('DLT Principal Entity ID must be 16-20 digits');
  }

  return { isValid: errors.length === 0, errors };
}

