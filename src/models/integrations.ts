export type IntegrationStatus =
  | 'not_configured'
  | 'configured'
  | 'connected'
  | 'error'
  | 'disabled';

export type IntegrationId = 'razorpay' | 'whatsapp' | 'email' | 'sms';

export type NotificationChannel = 'whatsapp' | 'email' | 'sms';

export type NotificationEventType =
  | 'delivery_completed'
  | 'invoice_generated'
  | 'payment_received'
  | 'payment_overdue'
  | 'low_balance'
  | 'order_update';

export interface ConnectionTestResult {
  success: boolean;
  timestamp: string;
  latencyMs?: number;
  message: string;
  statusCode?: number;
  details?: Record<string, any>;
  providerRef?: string;
  isSimulated?: boolean;
}

export interface RazorpayConfig {
  id: 'razorpay';
  name: 'Razorpay Payment Gateway';
  mode: 'test' | 'live';
  keyId: string;
  keySecret: string; // masked in UI
  webhookSecret: string; // masked in UI
  autoCapture: boolean;
  currency: 'INR';
  merchantName: string;
  themeColor: string;
  enabled: boolean;
  status: IntegrationStatus;
  lastTestedAt?: string;
  lastTestResult?: ConnectionTestResult;
  backendEndpoint?: string;
}

export type WhatsAppProviderType = 'meta_cloud_api' | 'twilio' | 'gupshup';

export interface WhatsAppConfig {
  id: 'whatsapp';
  name: 'WhatsApp Business Messaging';
  provider: WhatsAppProviderType;
  phoneNumberId: string;
  wabaId: string; // WhatsApp Business Account ID
  accessToken: string; // masked in UI
  webhookVerifyToken: string; // masked in UI
  fromPhoneNumber: string;
  templateDeliveryCompleted: string;
  templateInvoiceGenerated: string;
  templatePaymentReminder: string;
  templateOrderDispatched: string;
  enabled: boolean;
  status: IntegrationStatus;
  lastTestedAt?: string;
  lastTestResult?: ConnectionTestResult;
}

export type EmailProviderType = 'smtp' | 'sendgrid' | 'resend' | 'postmark' | 'ses';

export interface EmailConfig {
  id: 'email';
  name: 'Email Delivery (SMTP / Transactional)';
  provider: EmailProviderType;
  fromName: string;
  fromEmail: string;
  replyToEmail: string;
  // SMTP specific
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string; // masked in UI
  smtpSecure: boolean;
  // Transactional API specific
  apiKey: string; // masked in UI
  enabled: boolean;
  status: IntegrationStatus;
  lastTestedAt?: string;
  lastTestResult?: ConnectionTestResult;
}

export type SmsProviderType = 'msg91' | 'fast2sms' | 'twilio_sms';

export interface SmsConfig {
  id: 'sms';
  name: 'SMS Gateway (Indian DLT Compliant)';
  provider: SmsProviderType;
  apiKey: string; // masked in UI
  senderId: string; // 6-character DLT Header e.g. HRSHDY
  principalEntityId: string; // 19-digit TRAI DLT PE ID e.g. 1101567890123456789
  dltTemplateDelivery: string;
  dltTemplateInvoice: string;
  dltTemplatePayment: string;
  dltTemplateOtp: string;
  enabled: boolean;
  status: IntegrationStatus;
  lastTestedAt?: string;
  lastTestResult?: ConnectionTestResult;
}

export interface IntegrationsState {
  razorpay: RazorpayConfig;
  whatsapp: WhatsAppConfig;
  email: EmailConfig;
  sms: SmsConfig;
}

export interface AutomationRule {
  id: string;
  eventType: NotificationEventType;
  title: string;
  description: string;
  enabled: boolean;
  channels: {
    whatsapp: boolean;
    email: boolean;
    sms: boolean;
  };
  delayMinutes?: number;
}

export interface UnifiedNotificationLog {
  id: string;
  timestamp: string;
  customerId: string;
  customerName: string;
  recipient: string; // phone or email
  channel: NotificationChannel;
  eventType: NotificationEventType;
  provider: string; // e.g. 'Meta Cloud API', 'SendGrid', 'MSG91', 'Razorpay'
  status: 'Queued' | 'Sent' | 'Delivered' | 'Failed' | 'Simulated';
  providerMessageId?: string;
  errorDetails?: string;
  payloadSummary?: string;
  idempotencyKey: string;
  retryCount: number;
  lastRetriedAt?: string;
  relatedEntityId?: string; // invoiceId, deliveryId, paymentId, orderId
}

