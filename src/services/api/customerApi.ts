import { api } from './apiClient';

export const customerApi = {
  getProfile: async () => {
    return await api.get('/customer/profile');
  },

  getCalendar: async (month?: string) => {
    return await api.get(`/customer/calendar${month ? `?month=${month}` : ''}`);
  },

  submitPause: async (data: { startDate: string; endDate: string; reason?: string }) => {
    return await api.post('/customer/pause', data);
  },

  listInvoices: async () => {
    return await api.get('/customer/invoices');
  },

  listPayments: async () => {
    return await api.get('/customer/payments');
  },

  placeOrder: async (items: { productId: string; quantity: number }[]) => {
    return await api.post('/customer/orders', { items });
  },
};

