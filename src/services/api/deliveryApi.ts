import { api } from './apiClient';

export const deliveryApi = {
  getDashboard: async () => {
    return await api.get('/delivery/dashboard');
  },

  markDelivered: async (
    deliveryId: string,
    data: {
      actualQuantity?: number;
      collectedAmount?: number;
      collectedPaymentMethod?: 'CASH' | 'UPI';
      deliveryNotes?: string;
    }
  ) => {
    return await api.post(`/delivery/stops/${deliveryId}/deliver`, data);
  },

  markMissed: async (deliveryId: string, reason: string) => {
    return await api.post(`/delivery/stops/${deliveryId}/miss`, { reason });
  },
};

