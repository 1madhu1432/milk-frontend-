import {
  IntegrationsState,
  AutomationRule,
  UnifiedNotificationLog,
  NotificationEventType,
} from '../models/integrations';
import { Customer, Invoice, Delivery, CustomerPayment, ProductOrder } from '../models/types';
import { WhatsAppIntegrationService } from './integrations/whatsappService';
import { EmailIntegrationService } from './integrations/emailService';
import { SmsIntegrationService } from './integrations/smsService';

export interface DispatchEventOptions {
  eventType: NotificationEventType;
  customer: Customer;
  entityId: string;
  data: {
    delivery?: Delivery;
    invoice?: Invoice;
    payment?: CustomerPayment;
    order?: ProductOrder;
    overdueAmount?: number;
    dueDate?: string;
    customMessage?: string;
  };
}

export class NotificationService {
  private static sentKeys = new Set<string>();

  /**
   * Generates a deterministic idempotency key to prevent accidental duplicate dispatches
   */
  static generateIdempotencyKey(
    eventType: NotificationEventType,
    entityId: string,
    channel: string
  ): string {
    return `${eventType}_${entityId}_${channel}`;
  }

  /**
   * Dispatches notifications across all enabled channels according to active automation rules
   */
  static async dispatchBusinessEvent(
    options: DispatchEventOptions,
    integrations: IntegrationsState,
    rules: AutomationRule[],
    existingLogs: UnifiedNotificationLog[]
  ): Promise<UnifiedNotificationLog[]> {
    const { eventType, customer, entityId, data } = options;

    // 1. Check if an automation rule is configured and enabled for this event
    const rule = rules.find(r => r.eventType === eventType);
    if (!rule || !rule.enabled) {
      return [];
    }

    const newLogs: UnifiedNotificationLog[] = [];
    const nowStr = new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    // 2. Dispatch to WhatsApp if enabled in rule and configured
    if (rule.channels.whatsapp && (integrations.whatsapp.enabled || integrations.whatsapp.status === 'connected' || integrations.whatsapp.status === 'configured')) {
      const idempotencyKey = this.generateIdempotencyKey(eventType, entityId, 'whatsapp');
      const alreadySent = existingLogs.some(l => l.idempotencyKey === idempotencyKey && l.status !== 'Failed');

      if (!alreadySent && !this.sentKeys.has(idempotencyKey)) {
        this.sentKeys.add(idempotencyKey);
        const recipient = customer.whatsapp || customer.mobile;
        const summary = this.buildSummaryText(eventType, data, customer);

        try {
          const res = await WhatsAppIntegrationService.sendMessage(
            {
              recipient,
              templateName: this.getWhatsAppTemplate(eventType, integrations.whatsapp),
              textFallback: summary,
            },
            integrations.whatsapp
          );

          newLogs.push({
            id: `LOG-WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: nowStr,
            customerId: customer.id,
            customerName: customer.name,
            recipient,
            channel: 'whatsapp',
            eventType,
            provider: `${integrations.whatsapp.provider === 'meta_cloud_api' ? 'Meta Cloud API' : integrations.whatsapp.provider.toUpperCase()}`,
            status: res.status,
            providerMessageId: res.messageId,
            payloadSummary: summary,
            idempotencyKey,
            retryCount: 0,
            relatedEntityId: entityId,
          });
        } catch (err: any) {
          newLogs.push({
            id: `LOG-WA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: nowStr,
            customerId: customer.id,
            customerName: customer.name,
            recipient,
            channel: 'whatsapp',
            eventType,
            provider: 'WhatsApp API',
            status: 'Failed',
            errorDetails: err.message || 'Dispatch failed',
            payloadSummary: summary,
            idempotencyKey,
            retryCount: 0,
            relatedEntityId: entityId,
          });
        }
      }
    }

    // 3. Dispatch to Email if enabled in rule
    if (rule.channels.email && (integrations.email.enabled || integrations.email.status === 'connected' || integrations.email.status === 'configured')) {
      const idempotencyKey = this.generateIdempotencyKey(eventType, entityId, 'email');
      const alreadySent = existingLogs.some(l => l.idempotencyKey === idempotencyKey && l.status !== 'Failed');

      if (!alreadySent && !this.sentKeys.has(idempotencyKey) && customer.email) {
        this.sentKeys.add(idempotencyKey);
        const summary = this.buildSummaryText(eventType, data, customer);
        const subject = this.getEmailSubject(eventType, data);

        try {
          const res = await EmailIntegrationService.sendEmail(
            {
              to: customer.email,
              toName: customer.name,
              subject,
              html: `<div style="font-family:sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:12px;">
                <h3 style="color:#16803d;margin-top:0;">DairyNexa</h3>
                <p>Hello <strong>${customer.name}</strong>,</p>
                <p>${summary}</p>
                <div style="margin-top:20px;font-size:12px;color:#64748b;">
                  Need help? Contact helpline: +91 98765 43210 or reply to this email.
                </div>
              </div>`,
              invoiceId: data.invoice?.id,
            },
            integrations.email
          );

          newLogs.push({
            id: `LOG-EM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: nowStr,
            customerId: customer.id,
            customerName: customer.name,
            recipient: customer.email,
            channel: 'email',
            eventType,
            provider: `${integrations.email.provider.toUpperCase()} (${integrations.email.fromEmail})`,
            status: res.status,
            providerMessageId: res.messageId,
            payloadSummary: `${subject} — ${summary}`,
            idempotencyKey,
            retryCount: 0,
            relatedEntityId: entityId,
          });
        } catch (err: any) {
          newLogs.push({
            id: `LOG-EM-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: nowStr,
            customerId: customer.id,
            customerName: customer.name,
            recipient: customer.email,
            channel: 'email',
            eventType,
            provider: 'Email Gateway',
            status: 'Failed',
            errorDetails: err.message || 'Email dispatch failed',
            payloadSummary: summary,
            idempotencyKey,
            retryCount: 0,
            relatedEntityId: entityId,
          });
        }
      }
    }

    // 4. Dispatch to SMS if enabled in rule
    if (rule.channels.sms && (integrations.sms.enabled || integrations.sms.status === 'connected' || integrations.sms.status === 'configured')) {
      const idempotencyKey = this.generateIdempotencyKey(eventType, entityId, 'sms');
      const alreadySent = existingLogs.some(l => l.idempotencyKey === idempotencyKey && l.status !== 'Failed');

      if (!alreadySent && !this.sentKeys.has(idempotencyKey) && customer.mobile) {
        this.sentKeys.add(idempotencyKey);
        const summary = this.buildSummaryText(eventType, data, customer);

        try {
          const res = await SmsIntegrationService.sendSms(
            {
              to: customer.mobile,
              templateId: integrations.sms.dltTemplateDelivery || '1107161234567890123',
              variables: {
                var1: customer.name,
                var2: summary,
              },
              textFallback: summary,
              senderId: integrations.sms.senderId,
            },
            integrations.sms
          );

          newLogs.push({
            id: `LOG-SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: nowStr,
            customerId: customer.id,
            customerName: customer.name,
            recipient: customer.mobile,
            channel: 'sms',
            eventType,
            provider: `${integrations.sms.provider.toUpperCase()} (DLT: ${integrations.sms.senderId})`,
            status: res.status,
            providerMessageId: res.messageId,
            payloadSummary: summary,
            idempotencyKey,
            retryCount: 0,
            relatedEntityId: entityId,
          });
        } catch (err: any) {
          newLogs.push({
            id: `LOG-SMS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            timestamp: nowStr,
            customerId: customer.id,
            customerName: customer.name,
            recipient: customer.mobile,
            channel: 'sms',
            eventType,
            provider: 'SMS Gateway',
            status: 'Failed',
            errorDetails: err.message || 'SMS dispatch failed',
            payloadSummary: summary,
            idempotencyKey,
            retryCount: 0,
            relatedEntityId: entityId,
          });
        }
      }
    }

    return newLogs;
  }

  /**
   * Retries a specific failed notification log with idempotency tracking
   */
  static async retryNotification(
    log: UnifiedNotificationLog,
    integrations: IntegrationsState
  ): Promise<UnifiedNotificationLog> {
    const nowStr = new Date().toLocaleDateString('en-IN') + ', ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    let status: UnifiedNotificationLog['status'] = 'Delivered';
    let providerMsgId = log.providerMessageId || `retry_${Date.now()}`;
    let errorDetails: string | undefined = undefined;

    try {
      if (log.channel === 'whatsapp') {
        const res = await WhatsAppIntegrationService.sendMessage(
          {
            recipient: log.recipient,
            templateName: 'dairy_retry_alert_v1',
            textFallback: log.payloadSummary || 'DairyNexa Notification Retry',
          },
          integrations.whatsapp
        );
        status = res.status;
        providerMsgId = res.messageId;
      } else if (log.channel === 'email') {
        const res = await EmailIntegrationService.sendEmail(
          {
            to: log.recipient,
            subject: 'DairyNexa Notification (Retry)',
            html: `<p>${log.payloadSummary}</p>`,
          },
          integrations.email
        );
        status = res.status;
        providerMsgId = res.messageId;
      } else if (log.channel === 'sms') {
        const res = await SmsIntegrationService.sendSms(
          {
            to: log.recipient,
            templateId: integrations.sms.dltTemplateDelivery,
            variables: { var1: log.customerName, var2: log.payloadSummary || '' },
            textFallback: log.payloadSummary || '',
          },
          integrations.sms
        );
        status = res.status;
        providerMsgId = res.messageId;
      }
    } catch (err: any) {
      status = 'Failed';
      errorDetails = `Retry failed: ${err.message}`;
    }

    return {
      ...log,
      status,
      providerMessageId: providerMsgId,
      errorDetails,
      retryCount: log.retryCount + 1,
      lastRetriedAt: nowStr,
    };
  }

  private static buildSummaryText(
    eventType: NotificationEventType,
    data: DispatchEventOptions['data'],
    customer: Customer
  ): string {
    switch (eventType) {
      case 'delivery_completed':
        return `Your daily delivery of ${data.delivery?.actualMilkQuantity || customer.dailyQuantity}L ${data.delivery?.milkType || customer.milkType} has been completed at your doorstep.`;
      case 'invoice_generated':
        return `Your dairy bill ${data.invoice?.invoiceNumber || ''} for ${data.invoice?.monthLabel || 'this month'} is ready. Total payable: ₹${data.invoice?.balanceRemaining?.toLocaleString('en-IN') || 0}. Due on ${data.invoice?.dueDate || '5th'}.`;
      case 'payment_received':
        return `Payment received ₹${data.payment?.amount?.toLocaleString('en-IN') || 0} via ${data.payment?.paymentMethod || 'UPI'}. Ref: ${data.payment?.referenceNo || ''}. Thank you!`;
      case 'payment_overdue':
        return `Friendly reminder: Your dairy bill of ₹${data.overdueAmount?.toLocaleString('en-IN') || 0} is due on ${data.dueDate || '5th'}. Please pay via UPI or customer portal to avoid disruption.`;
      case 'low_balance':
        return `Your wallet balance is low (₹${customer.outstandingBalance < 0 ? Math.abs(customer.outstandingBalance) : 0}). Please top up to ensure uninterrupted milk delivery.`;
      case 'order_update':
        return `Your order ${data.order?.id || ''} for ${data.order?.items?.map(i => `${i.quantity}x ${i.productName}`).join(', ') || 'dairy products'} is confirmed. Total: ₹${data.order?.totalAmount || 0}.`;
      default:
        return 'DairyNexa updates notification.';
    }
  }

  private static getEmailSubject(eventType: NotificationEventType, data: DispatchEventOptions['data']): string {
    switch (eventType) {
      case 'delivery_completed':
        return 'Delivery Completed — DairyNexa';
      case 'invoice_generated':
        return `Monthly Dairy Bill (${data.invoice?.monthLabel || ''}) — Invoice #${data.invoice?.invoiceNumber || ''}`;
      case 'payment_received':
        return `Payment Receipt ₹${data.payment?.amount || 0} — DairyNexa`;
      case 'payment_overdue':
        return 'Payment Due Reminder — DairyNexa';
      case 'order_update':
        return `Order Confirmed: #${data.order?.id || ''} — DairyNexa`;
      default:
        return 'Notification from DairyNexa';
    }
  }

  private static getWhatsAppTemplate(eventType: NotificationEventType, config: IntegrationsState['whatsapp']): string {
    switch (eventType) {
      case 'delivery_completed':
        return config.templateDeliveryCompleted || 'dairy_daily_delivery_v2';
      case 'invoice_generated':
        return config.templateInvoiceGenerated || 'dairy_monthly_invoice_bill_v1';
      case 'payment_received':
      case 'payment_overdue':
        return config.templatePaymentReminder || 'dairy_payment_reminder_v1';
      case 'order_update':
        return config.templateOrderDispatched || 'dairy_order_dispatch_v1';
      default:
        return 'dairy_alert_generic_v1';
    }
  }
}

