import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  IntegrationsState,
  IntegrationId,
  IntegrationStatus,
  AutomationRule,
  UnifiedNotificationLog,
  ConnectionTestResult,
  NotificationEventType,
} from '../models/integrations';
import {
  initialIntegrationsState,
  initialAutomationRules,
  initialUnifiedLogs,
  INTEGRATIONS_STORAGE_KEY,
  AUTOMATION_RULES_STORAGE_KEY,
  UNIFIED_LOGS_STORAGE_KEY,
  validateRazorpayConfig,
  validateWhatsAppConfig,
  validateEmailConfig,
  validateSmsConfig,
  sanitizeIntegrationsForStorage,
} from '../services/integrations/configStorage';
import { RazorpayIntegrationService } from '../services/integrations/razorpayService';
import { WhatsAppIntegrationService } from '../services/integrations/whatsappService';
import { EmailIntegrationService } from '../services/integrations/emailService';
import { SmsIntegrationService } from '../services/integrations/smsService';
import { NotificationService, DispatchEventOptions } from '../services/notificationService';
import { useDairy } from './DairyContext';
import { exportToCSV } from '../utils/csv';

interface IntegrationsContextType {
  integrations: IntegrationsState;
  automationRules: AutomationRule[];
  unifiedLogs: UnifiedNotificationLog[];
  isTesting: Record<IntegrationId, boolean>;
  lastValidationErrors: Record<IntegrationId, string[]>;

  // Actions
  updateIntegrationConfig: (
    id: IntegrationId,
    updates: Record<string, any>
  ) => { success: boolean; errors?: string[] };
  testIntegrationConnection: (id: IntegrationId) => Promise<ConnectionTestResult>;
  disconnectIntegration: (id: IntegrationId) => void;
  toggleIntegrationEnabled: (id: IntegrationId, enabled: boolean) => void;
  updateAutomationRule: (ruleId: string, updates: Partial<AutomationRule>) => void;
  retryUnifiedNotification: (logId: string) => Promise<void>;
  triggerBusinessEvent: (
    eventType: NotificationEventType,
    customerId: string,
    entityId: string,
    data?: DispatchEventOptions['data']
  ) => Promise<void>;
  clearUnifiedLogs: () => void;
  exportLogsCSV: () => void;
}

const IntegrationsContext = createContext<IntegrationsContextType | undefined>(undefined);

export const IntegrationsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { customers, currentUser } = useDairy();

  // Load state from localStorage or defaults
  const [integrations, setIntegrations] = useState<IntegrationsState>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(INTEGRATIONS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return initialIntegrationsState;
  });

  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(AUTOMATION_RULES_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return initialAutomationRules;
  });

  const [unifiedLogs, setUnifiedLogs] = useState<UnifiedNotificationLog[]>(() => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const saved = localStorage.getItem(UNIFIED_LOGS_STORAGE_KEY);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          // ignore
        }
      }
    }
    return initialUnifiedLogs;
  });

  const [isTesting, setIsTesting] = useState<Record<IntegrationId, boolean>>({
    razorpay: false,
    whatsapp: false,
    email: false,
    sms: false,
  });

  const [lastValidationErrors, setLastValidationErrors] = useState<Record<IntegrationId, string[]>>({
    razorpay: [],
    whatsapp: [],
    email: [],
    sms: [],
  });

  // Persist state (with secrets sanitized)
  useEffect(() => {
    try {
      const sanitized = sanitizeIntegrationsForStorage(integrations);
      localStorage.setItem(INTEGRATIONS_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (e) {
      console.warn('Could not persist integrations to localStorage', e);
    }
  }, [integrations]);

  useEffect(() => {
    try {
      localStorage.setItem(AUTOMATION_RULES_STORAGE_KEY, JSON.stringify(automationRules));
    } catch (e) {
      console.warn('Could not persist automation rules to localStorage', e);
    }
  }, [automationRules]);

  useEffect(() => {
    try {
      localStorage.setItem(UNIFIED_LOGS_STORAGE_KEY, JSON.stringify(unifiedLogs));
    } catch (e) {
      console.warn('Could not persist unified logs to localStorage', e);
    }
  }, [unifiedLogs]);

  // Update integration configuration with validation
  const updateIntegrationConfig = useCallback(
    (id: IntegrationId, updates: Record<string, any>): { success: boolean; errors?: string[] } => {
      // Security check: restrict to admin role
      if (currentUser.role !== 'admin') {
        alert('Unauthorized: Only administrators can modify gateway integration credentials.');
        return { success: false, errors: ['Unauthorized: Admin access required.'] };
      }

      const current = integrations[id];
      const merged = { ...current, ...updates } as any;

      // Validation
      let validation: { isValid: boolean; errors: string[] } = { isValid: true, errors: [] };
      if (id === 'razorpay') validation = validateRazorpayConfig(merged);
      if (id === 'whatsapp') validation = validateWhatsAppConfig(merged);
      if (id === 'email') validation = validateEmailConfig(merged);
      if (id === 'sms') validation = validateSmsConfig(merged);

      if (!validation.isValid) {
        setLastValidationErrors(prev => ({ ...prev, [id]: validation.errors }));
        return { success: false, errors: validation.errors };
      }

      // Clear previous validation errors
      setLastValidationErrors(prev => ({ ...prev, [id]: [] }));

      // Set status to 'configured' if valid and previously not configured
      const newStatus: IntegrationStatus =
        merged.status === 'not_configured' || merged.status === 'error'
          ? 'configured'
          : merged.status;

      setIntegrations(prev => ({
        ...prev,
        [id]: {
          ...merged,
          status: newStatus,
        },
      }));

      return { success: true };
    },
    [currentUser.role, integrations]
  );

  // Test integration connection
  const testIntegrationConnection = useCallback(
    async (id: IntegrationId): Promise<ConnectionTestResult> => {
      if (currentUser.role !== 'admin') {
        return {
          success: false,
          timestamp: new Date().toISOString(),
          message: 'Unauthorized: Admin role required to test connections.',
        };
      }

      setIsTesting(prev => ({ ...prev, [id]: true }));
      let result: ConnectionTestResult;

      try {
        switch (id) {
          case 'razorpay':
            result = await RazorpayIntegrationService.testConnection(integrations.razorpay);
            break;
          case 'whatsapp':
            result = await WhatsAppIntegrationService.testConnection(integrations.whatsapp);
            break;
          case 'email':
            result = await EmailIntegrationService.testConnection(integrations.email);
            break;
          case 'sms':
            result = await SmsIntegrationService.testConnection(integrations.sms);
            break;
        }

        // Determine accurate status based on test result
        let updatedStatus: IntegrationStatus;
        if (!result.success) {
          updatedStatus = 'error';
        } else if (result.isSimulated) {
          // If in local simulation mode or backend offline, DO NOT claim "Connected"
          updatedStatus = 'configured';
        } else {
          // Real provider connection verified by backend
          updatedStatus = 'connected';
        }

        setIntegrations(prev => ({
          ...prev,
          [id]: {
            ...prev[id],
            status: updatedStatus,
            lastTestedAt: result.timestamp,
            lastTestResult: result,
          },
        }));

        return result;
      } finally {
        setIsTesting(prev => ({ ...prev, [id]: false }));
      }
    },
    [currentUser.role, integrations]
  );

  // Disconnect integration
  const disconnectIntegration = useCallback(
    (id: IntegrationId) => {
      if (currentUser.role !== 'admin') {
        alert('Unauthorized: Only administrators can disconnect integrations.');
        return;
      }

      const initial = initialIntegrationsState[id];
      setIntegrations(prev => ({
        ...prev,
        [id]: {
          ...initial,
          status: 'not_configured',
          enabled: false,
          lastTestedAt: undefined,
          lastTestResult: undefined,
        },
      }));
      setLastValidationErrors(prev => ({ ...prev, [id]: [] }));
    },
    [currentUser.role]
  );

  // Enable/Disable integration
  const toggleIntegrationEnabled = useCallback(
    (id: IntegrationId, enabled: boolean) => {
      if (currentUser.role !== 'admin') return;

      setIntegrations(prev => {
        const item = prev[id];
        let newStatus = item.status;
        if (!enabled) {
          newStatus = 'disabled';
        } else if (item.status === 'disabled') {
          newStatus = item.lastTestResult?.success && !item.lastTestResult.isSimulated
            ? 'connected'
            : 'configured';
        }

        return {
          ...prev,
          [id]: {
            ...item,
            enabled,
            status: newStatus,
          },
        };
      });
    },
    [currentUser.role]
  );

  // Update automation rule
  const updateAutomationRule = useCallback(
    (ruleId: string, updates: Partial<AutomationRule>) => {
      if (currentUser.role !== 'admin') return;
      setAutomationRules(prev =>
        prev.map(r => (r.id === ruleId ? { ...r, ...updates } : r))
      );
    },
    [currentUser.role]
  );

  // Retry notification
  const retryUnifiedNotification = useCallback(
    async (logId: string) => {
      const targetLog = unifiedLogs.find(l => l.id === logId);
      if (!targetLog) return;

      const updated = await NotificationService.retryNotification(targetLog, integrations);
      setUnifiedLogs(prev => prev.map(l => (l.id === logId ? updated : l)));
    },
    [integrations, unifiedLogs]
  );

  // Trigger business event notifications
  const triggerBusinessEvent = useCallback(
    async (
      eventType: NotificationEventType,
      customerId: string,
      entityId: string,
      data: DispatchEventOptions['data'] = {}
    ) => {
      const customer = customers.find(c => c.id === customerId);
      if (!customer) return;

      const newLogs = await NotificationService.dispatchBusinessEvent(
        {
          eventType,
          customer,
          entityId,
          data,
        },
        integrations,
        automationRules,
        unifiedLogs
      );

      if (newLogs.length > 0) {
        setUnifiedLogs(prev => [...newLogs, ...prev]);
      }
    },
    [customers, integrations, automationRules, unifiedLogs]
  );

  // Listen to centralized application business events
  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent;
      const { eventType, customerId, entityId, data } = customEvent.detail || {};
      if (eventType && customerId && entityId) {
        triggerBusinessEvent(eventType, customerId, entityId, data);
      }
    };
    window.addEventListener('milkerp:businessevent', handleEvent);
    return () => window.removeEventListener('milkerp:businessevent', handleEvent);
  }, [triggerBusinessEvent]);

  // Clear logs
  const clearUnifiedLogs = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all notification audit logs?')) {
      setUnifiedLogs([]);
    }
  }, []);

  // Export logs to CSV
  const exportLogsCSV = useCallback(() => {
    exportToCSV(unifiedLogs, 'Unified_Integration_Notification_Audit_Logs', [
      { key: 'id', label: 'Log ID' },
      { key: 'timestamp', label: 'Timestamp' },
      { key: 'customerName', label: 'Customer' },
      { key: 'recipient', label: 'Recipient' },
      { key: 'channel', label: 'Channel' },
      { key: 'eventType', label: 'Trigger Event' },
      { key: 'provider', label: 'Gateway Provider' },
      { key: 'status', label: 'Delivery Status' },
      { key: 'providerMessageId', label: 'Provider Ref ID' },
      { key: 'retryCount', label: 'Retries' },
      { key: 'payloadSummary', label: 'Message Payload' },
      { key: 'errorDetails', label: 'Error Details' },
    ]);
  }, [unifiedLogs]);

  return (
    <IntegrationsContext.Provider
      value={{
        integrations,
        automationRules,
        unifiedLogs,
        isTesting,
        lastValidationErrors,
        updateIntegrationConfig,
        testIntegrationConnection,
        disconnectIntegration,
        toggleIntegrationEnabled,
        updateAutomationRule,
        retryUnifiedNotification,
        triggerBusinessEvent,
        clearUnifiedLogs,
        exportLogsCSV,
      }}
    >
      {children}
    </IntegrationsContext.Provider>
  );
};

export const useIntegrations = () => {
  const context = useContext(IntegrationsContext);
  if (!context) {
    throw new Error('useIntegrations must be used within an IntegrationsProvider');
  }
  return context;
};

