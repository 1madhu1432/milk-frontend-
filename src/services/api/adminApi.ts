import { api } from './apiClient';

export const adminApi = {
  getDashboard: async () => {
    return await api.get('/admin/dashboard');
  },

  // Customers
  listCustomers: async (params?: { search?: string; status?: string; routeId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return await api.get(`/admin/customers${query ? `?${query}` : ''}`);
  },

  createCustomer: async (data: any) => {
    return await api.post('/admin/customers', data);
  },

  updateCustomer: async (id: string, data: any) => {
    return await api.patch(`/admin/customers/${id}`, data);
  },

  deleteCustomer: async (id: string) => {
    return await api.delete(`/admin/customers/${id}`);
  },

  // Employees & Routes
  listEmployees: async () => {
    return await api.get('/admin/employees');
  },

  createEmployee: async (data: any) => {
    return await api.post('/admin/employees', data);
  },

  updateEmployee: async (id: string, data: any) => {
    return await api.patch(`/admin/employees/${id}`, data);
  },

  deleteEmployee: async (id: string) => {
    return await api.delete(`/admin/employees/${id}`);
  },

  listRoutes: async () => {
    return await api.get('/admin/routes');
  },

  createRoute: async (data: any) => {
    return await api.post('/admin/routes', data);
  },

  updateRoute: async (id: string, data: any) => {
    return await api.patch(`/admin/routes/${id}`, data);
  },

  deleteRoute: async (id: string) => {
    return await api.delete(`/admin/routes/${id}`);
  },

  // Vendors & Purchases
  listVendors: async () => {
    return await api.get('/admin/vendors');
  },

  createVendor: async (data: any) => {
    return await api.post('/admin/vendors', data);
  },

  listPurchases: async () => {
    return await api.get('/admin/purchases');
  },

  createPurchase: async (data: any) => {
    return await api.post('/admin/purchases', data);
  },

  listVendorPayments: async (vendorId?: string) => {
    return await api.get(`/admin/vendor-payments${vendorId ? `?vendorId=${vendorId}` : ''}`);
  },

  recordVendorPayment: async (data: any) => {
    return await api.post('/admin/vendor-payments', data);
  },

  // Inventory & Deliveries
  getInventory: async () => {
    return await api.get('/admin/inventory');
  },

  adjustStock: async (data: { itemName: string; quantity: number; type: string; notes?: string }) => {
    return await api.post('/admin/inventory/adjust', data);
  },

  listProducts: async () => {
    return await api.get('/admin/products');
  },

  createProduct: async (data: any) => {
    return await api.post('/admin/products', data);
  },

  updateProduct: async (id: string, data: any) => {
    return await api.patch(`/admin/products/${id}`, data);
  },

  deleteProduct: async (id: string) => {
    return await api.delete(`/admin/products/${id}`);
  },

  // Orders
  listOrders: async () => {
    return await api.get('/admin/orders');
  },

  createOrder: async (data: any) => {
    return await api.post('/admin/orders', data);
  },

  updateOrderStatus: async (id: string, status: string) => {
    return await api.patch(`/admin/orders/${id}/status`, { status });
  },

  listDeliveries: async (date?: string) => {
    return await api.get(`/admin/deliveries${date ? `?date=${date}` : ''}`);
  },

  generateDailyDeliveries: async (date?: string) => {
    return await api.post('/admin/deliveries/generate', { date });
  },

  listPauses: async () => {
    return await api.get('/admin/pauses');
  },

  updatePauseStatus: async (id: string, status: string, adminNotes?: string) => {
    return await api.patch(`/admin/pauses/${id}/status`, { status, adminNotes });
  },

  // Invoices & Payments
  listInvoices: async (month?: string) => {
    return await api.get(`/admin/invoices${month ? `?month=${month}` : ''}`);
  },

  generateMonthlyInvoices: async (month?: string) => {
    return await api.post('/admin/invoices/generate', { month });
  },

  finalizeInvoice: async (id: string) => {
    return await api.patch(`/admin/invoices/${id}/finalize`, {});
  },

  voidInvoice: async (id: string, reason?: string) => {
    return await api.patch(`/admin/invoices/${id}/void`, { reason });
  },

  listPayments: async () => {
    return await api.get('/admin/payments');
  },

  recordPayment: async (data: any) => {
    return await api.post('/admin/payments', data);
  },

  getReports: async (type: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams({ type, ...(startDate && { startDate }), ...(endDate && { endDate }) });
    return await api.get(`/admin/reports?${params.toString()}`);
  },

  testIntegration: async (provider: string, config?: any) => {
    return await api.post(`/integrations/${provider}/test`, config);
  },
};

