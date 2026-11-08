import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserSession,
  UserRole,
  Customer,
  Employee,
  Route,
  Vendor,
  MilkPurchase,
  VendorPayment,
  Product,
  ProductOrder,
  PauseRequest,
  Delivery,
  StockTransaction,
  Invoice,
  CustomerPayment,
  CustomerLedgerEntry,
  NotificationLog,
  BusinessSettings,
} from '../models/types';
import {
  initialBusinessSettings,
  initialRoutes,
  initialEmployees,
  initialVendors,
  initialProducts,
  generateSeedCustomers,
  generateSeedDeliveries,
  initialMilkPurchases,
  initialVendorPayments,
  initialPauseRequests,
  initialProductOrders,
  initialStockTransactions,
  generateSeedInvoices,
  initialCustomerPayments,
  generateCustomerLedger,
  initialNotificationLogs,
} from '../data/seedData';
import { generateId } from '../utils/formatters';
import { adminApi } from '../services/api/adminApi';
import { deliveryApi } from '../services/api/deliveryApi';

interface DairyContextType {
  // Session
  currentUser: UserSession;
  login: (role: UserRole, email: string, name: string, id?: string) => void;
  logout: () => void;
  switchRole: (role: UserRole) => void;

  // Data
  settings: BusinessSettings;
  updateSettings: (newSettings: Partial<BusinessSettings>) => void;
  customers: Customer[];
  employees: Employee[];
  routes: Route[];
  vendors: Vendor[];
  milkPurchases: MilkPurchase[];
  vendorPayments: VendorPayment[];
  products: Product[];
  productOrders: ProductOrder[];
  pauseRequests: PauseRequest[];
  deliveries: Delivery[];
  stockTransactions: StockTransaction[];
  invoices: Invoice[];
  customerPayments: CustomerPayment[];
  notificationLogs: NotificationLog[];

  // Inventory stats
  currentStock: {
    cowMilk: number;
    buffaloMilk: number;
  };

  // Actions
  addCustomer: (cust: Omit<Customer, 'id' | 'tenantId'> & { tenantId?: string }) => string;
  updateCustomer: (id: string, cust: Partial<Customer>) => void;
  toggleCustomerStatus: (id: string, status: Customer['status']) => void;
  deleteCustomer: (id: string) => void;
  importCustomers: (custs: Customer[]) => void;

  addEmployee: (emp: Omit<Employee, 'id' | 'tenantId'> & { tenantId?: string }) => void;
  updateEmployee: (id: string, emp: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;

  addRoute: (route: Omit<Route, 'id' | 'tenantId'> & { tenantId?: string }) => void;
  updateRoute: (id: string, route: Partial<Route>) => void;
  deleteRoute: (id: string) => void;

  addVendor: (vendor: Omit<Vendor, 'id' | 'tenantId'> & { tenantId?: string }) => void;
  updateVendor: (id: string, vendor: Partial<Vendor>) => void;
  addVendorPayment: (payment: Omit<VendorPayment, 'id' | 'tenantId'> & { tenantId?: string }) => void;

  addMilkPurchase: (purchase: Omit<MilkPurchase, 'id' | 'tenantId'> & { tenantId?: string }) => void;
  updateMilkPurchase: (id: string, purchase: Partial<MilkPurchase>) => void;

  addStockTransaction: (tx: Omit<StockTransaction, 'id' | 'tenantId'> & { tenantId?: string }) => { success: boolean; message?: string };
  adjustStock: (milkOrProduct: string, qty: number, reason: string, isWastage?: boolean) => { success: boolean; message?: string };

  updateDelivery: (id: string, updates: Partial<Delivery>) => void;
  markDelivered: (id: string, actualQty?: number, notes?: string, collectedAmount?: number, paymentMethod?: 'Cash' | 'UPI') => void;
  markMissed: (id: string, reason: string) => void;
  markPartialDelivery: (id: string, actualQty: number, reason: string) => void;

  addPauseRequest: (req: Omit<PauseRequest, 'id' | 'requestDate' | 'status' | 'tenantId'> & { tenantId?: string }) => void;
  updatePauseStatus: (id: string, status: PauseRequest['status'], adminNotes?: string) => void;

  addProduct: (product: Omit<Product, 'id' | 'tenantId'> & { tenantId?: string }) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  createProductOrder: (order: Omit<ProductOrder, 'id' | 'orderDate' | 'status' | 'tenantId'> & { tenantId?: string }) => string;
  updateOrderStatus: (id: string, status: ProductOrder['status']) => void;

  generateMonthlyInvoices: (month: string, monthLabel: string) => number;
  finalizeInvoice: (id: string) => void;
  voidInvoice: (id: string) => void;
  addCustomerPayment: (payment: Omit<CustomerPayment, 'id' | 'tenantId'> & { tenantId?: string }) => void;

  sendDemoNotification: (invoiceId: string) => void;
  retryNotification: (logId: string) => void;

  getCustomerLedger: (customerId: string) => CustomerLedgerEntry[];
  resetDemoData: () => void;
  isDemoMode: boolean;
  clearAllData: () => void;
  loadDemoData: () => void;
  isLoadingData: boolean;
  refreshData: () => Promise<void>;
}

const DairyContext = createContext<DairyContextType | undefined>(undefined);

const STORAGE_KEY = 'milkerp_public_live_state_v1';

function emitBusinessEvent(eventType: string, detail: Record<string, any>) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('milkerp:businessevent', { detail: { eventType, ...detail } }));
  }
}

function loadInitialState() {
  if (typeof window !== 'undefined' && window.localStorage) {
    // Purge all legacy dummy data keys
    localStorage.removeItem('harish_dairy_app_state_v3');
    localStorage.removeItem('harish_dairy_app_state_v2');
    localStorage.removeItem('harish_dairy_state_v2');
    localStorage.removeItem('milkerp_data_mode');
    localStorage.removeItem('milkerp_clean_production_state_v1');

    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed) {
          return {
            isDemoMode: false,
            settings: parsed.settings || initialBusinessSettings,
            routes: parsed.routes || [],
            employees: parsed.employees || [],
            vendors: parsed.vendors || [],
            products: parsed.products && parsed.products.length > 0 ? parsed.products : initialProducts,
            customers: parsed.customers || [],
            deliveries: parsed.deliveries || [],
            milkPurchases: parsed.milkPurchases || [],
            vendorPayments: parsed.vendorPayments || [],
            pauseRequests: parsed.pauseRequests || [],
            productOrders: parsed.productOrders || [],
            stockTransactions: parsed.stockTransactions || [],
            invoices: parsed.invoices || [],
            customerPayments: parsed.customerPayments || [],
            notificationLogs: parsed.notificationLogs || [],
          };
        }
      } catch (e) {
        console.error('Failed to load local storage state:', e);
      }
    }
  }

  // Pure clean baseline without any dummy or mock data
  return {
    isDemoMode: false,
    settings: initialBusinessSettings,
    routes: [],
    employees: [],
    vendors: [],
    products: initialProducts,
    customers: [],
    deliveries: [],
    milkPurchases: [],
    vendorPayments: [],
    pauseRequests: [],
    productOrders: [],
    stockTransactions: [],
    invoices: [],
    customerPayments: [],
    notificationLogs: [],
  };
}

export const DairyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Session
  const [currentUser, setCurrentUser] = useState<UserSession>(() => {
    const saved = localStorage.getItem('harish_dairy_session');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.email) return parsed;
      } catch (e) {
        // ignore
      }
    }
    return {
      role: 'customer' as UserRole,
      email: '',
      name: 'Guest',
    };
  });

  const [initialData] = useState(loadInitialState);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(initialData.isDemoMode ?? true);

  // Main state tables
  const [settings, setSettings] = useState<BusinessSettings>(initialData.settings);
  const [routes, setRoutes] = useState<Route[]>(initialData.routes);
  const [employees, setEmployees] = useState<Employee[]>(initialData.employees);
  const [vendors, setVendors] = useState<Vendor[]>(initialData.vendors);
  const [products, setProducts] = useState<Product[]>(initialData.products);
  const [customers, setCustomers] = useState<Customer[]>(initialData.customers);
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialData.deliveries);
  const [milkPurchases, setMilkPurchases] = useState<MilkPurchase[]>(initialData.milkPurchases);
  const [vendorPayments, setVendorPayments] = useState<VendorPayment[]>(initialData.vendorPayments);
  const [pauseRequests, setPauseRequests] = useState<PauseRequest[]>(initialData.pauseRequests);
  const [productOrders, setProductOrders] = useState<ProductOrder[]>(initialData.productOrders);
  const [stockTransactions, setStockTransactions] = useState<StockTransaction[]>(initialData.stockTransactions);
  const [invoices, setInvoices] = useState<Invoice[]>(initialData.invoices);
  const [customerPayments, setCustomerPayments] = useState<CustomerPayment[]>(initialData.customerPayments);
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>(initialData.notificationLogs);
  const [isInitialized] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);

  // Live PostgreSQL synchronization via backend APIs
  const fetchLiveData = async () => {
    const token = localStorage.getItem('milkerp_access_token');
    if (!token) return;

    setIsLoadingData(true);
    try {
      const [
        custsRes,
        empsRes,
        routesRes,
        vendorsRes,
        purchasesRes,
        productsRes,
        ordersRes,
        delivsRes,
        invsRes,
        pausesRes,
        paymentsRes,
      ] = await Promise.allSettled([
        adminApi.listCustomers(),
        adminApi.listEmployees(),
        adminApi.listRoutes(),
        adminApi.listVendors(),
        adminApi.listPurchases(),
        adminApi.listProducts(),
        adminApi.listOrders(),
        adminApi.listDeliveries(),
        adminApi.listInvoices(),
        adminApi.listPauses(),
        adminApi.listPayments(),
      ]);

      if (custsRes.status === 'fulfilled' && Array.isArray(custsRes.value)) {
        setCustomers(custsRes.value.map((c: any) => ({
          ...c,
          status: c.status ? c.status.toLowerCase() : 'active',
          assignedRouteId: c.assignedRouteId || c.routeId,
          dailyQuantity: Number(c.dailyQuantity || 1),
          pricePerLitre: Number(c.pricePerLitre || 65),
          outstandingBalance: Number(c.outstandingBalance || 0),
        })));
      }

      if (empsRes.status === 'fulfilled' && Array.isArray(empsRes.value)) {
        setEmployees(empsRes.value.map((e: any) => ({
          ...e,
          monthlySalary: Number(e.monthlySalary || 0),
          isDeliveryBoy: e.isDeliveryBoy !== false,
          status: e.isActive ? 'active' : 'inactive',
        })));
      }

      if (routesRes.status === 'fulfilled' && Array.isArray(routesRes.value)) {
        setRoutes(routesRes.value.map((r: any) => ({
          ...r,
          totalMilkRequired: Number(r.totalRequiredLitres || r.totalMilkRequired || 0),
          assignedCustomerCount: Number(r.assignedCustomerCount || (r.customers?.length || 0)),
        })));
      }

      if (vendorsRes.status === 'fulfilled' && Array.isArray(vendorsRes.value)) {
        setVendors(vendorsRes.value.map((v: any) => ({
          ...v,
          ratePerLitre: Number(v.ratePerLitre || 45),
          dailySuppliedLitres: Number(v.dailySuppliedLitres || 0),
          outstandingBalance: Number(v.outstandingBalance || 0),
        })));
      }

      if (purchasesRes.status === 'fulfilled' && Array.isArray(purchasesRes.value)) {
        setMilkPurchases(purchasesRes.value.map((p: any) => ({
          ...p,
          quantityLitres: Number(p.quantityLitres || p.acceptedLitres || 0),
          ratePerLitre: Number(p.ratePerLitre || 45),
          totalAmount: Number(p.totalAmount || 0),
        })));
      }

      if (productsRes.status === 'fulfilled' && Array.isArray(productsRes.value)) {
        setProducts(productsRes.value.map((pr: any) => ({
          ...pr,
          price: Number(pr.sellingPrice || pr.price || 0),
          purchaseCost: Number(pr.purchaseCost || 0),
          sellingPrice: Number(pr.sellingPrice || pr.price || 0),
          stockQuantity: Number(pr.availableStock || pr.stockQuantity || 0),
          lowStockThreshold: Number(pr.minimumStock || pr.lowStockThreshold || 5),
        })));
      }

      if (ordersRes.status === 'fulfilled' && Array.isArray(ordersRes.value)) {
        setProductOrders(ordersRes.value.map((o: any) => ({
          ...o,
          totalAmount: Number(o.totalAmount || 0),
        })));
      }

      if (delivsRes.status === 'fulfilled' && Array.isArray(delivsRes.value)) {
        setDeliveries(delivsRes.value.map((d: any) => ({
          ...d,
          plannedQuantity: Number(d.plannedQuantity || 1),
          actualQuantity: Number(d.actualQuantity || 0),
          pricePerLitre: Number(d.pricePerLitre || 65),
          collectedAmount: Number(d.collectedAmount || 0),
        })));
      }

      if (invsRes.status === 'fulfilled' && Array.isArray(invsRes.value)) {
        setInvoices(invsRes.value.map((inv: any) => ({
          ...inv,
          subtotal: Number(inv.subtotal || inv.totalPayable || 0),
          totalAmount: Number(inv.totalAmount || inv.totalPayable || 0),
          balanceDue: Number(inv.balanceDue || inv.balanceRemaining || 0),
          paidAmount: Number(inv.paidAmount || 0),
        })));
      }

      if (pausesRes.status === 'fulfilled' && Array.isArray(pausesRes.value)) {
        setPauseRequests(pausesRes.value.map((pa: any) => ({
          ...pa,
          startDate: typeof pa.startDate === 'string' ? pa.startDate.split('T')[0] : pa.startDate,
          endDate: typeof pa.endDate === 'string' ? pa.endDate.split('T')[0] : pa.endDate,
        })));
      }

      if (paymentsRes.status === 'fulfilled' && Array.isArray(paymentsRes.value)) {
        setCustomerPayments(paymentsRes.value.map((pay: any) => ({
          ...pay,
          amount: Number(pay.amount || 0),
        })));
      }
    } catch (e) {
      console.debug('Live data sync note (development mode):', e);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    fetchLiveData();
  }, [currentUser.email, currentUser.role]);

  // Save to localStorage when state changes
  useEffect(() => {
    if (!isInitialized) return;
    const stateToSave = {
      settings,
      routes,
      employees,
      vendors,
      products,
      customers,
      deliveries,
      milkPurchases,
      vendorPayments,
      pauseRequests,
      productOrders,
      stockTransactions,
      invoices,
      customerPayments,
      notificationLogs,
    };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (e) {
      console.warn('LocalStorage limit exceeded, unable to persist full state:', e);
    }
  }, [
    isInitialized,
    settings,
    routes,
    employees,
    vendors,
    products,
    customers,
    deliveries,
    milkPurchases,
    vendorPayments,
    pauseRequests,
    productOrders,
    stockTransactions,
    invoices,
    customerPayments,
    notificationLogs,
  ]);

  // Save session
  useEffect(() => {
    localStorage.setItem('harish_dairy_session', JSON.stringify(currentUser));
  }, [currentUser]);

  // Calculate current milk stock from transactions
  const currentStock = React.useMemo(() => {
    let cow = 0;
    let buffalo = 0;

    stockTransactions.forEach(tx => {
      if (tx.milkTypeOrProduct === 'Cow Milk') {
        cow += tx.quantity;
      } else if (tx.milkTypeOrProduct === 'Buffalo Milk') {
        buffalo += tx.quantity;
      }
    });

    return {
      cowMilk: Math.max(0, cow),
      buffaloMilk: Math.max(0, buffalo),
    };
  }, [stockTransactions]);

  // Auth functions
  const login = (role: UserRole, email: string, name: string, id?: string) => {
    const session: UserSession = { role, email, name, id };
    setCurrentUser(session);
  };

  const logout = () => {
    localStorage.removeItem('harish_dairy_session');
    localStorage.removeItem('milkerp_access_token');
    localStorage.removeItem('milkerp_refresh_token');
    localStorage.removeItem('milkerp_active_tenant_id');
    setCurrentUser({
      role: 'customer',
      email: '',
      name: 'Guest',
    });
  };

  const switchRole = (role: UserRole) => {
    // Role switching requires authentic credentials; clear session so ProtectedRoute guides to appropriate login
    logout();
    if (typeof window !== 'undefined') {
      if (role === 'admin') window.location.href = '/login/admin';
      else if (role === 'employee') window.location.href = '/login/delivery';
      else window.location.href = '/login/customer';
    }
  };

  const updateSettings = (newSettings: Partial<BusinessSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Customer Management
  const addCustomer = (custData: Omit<Customer, 'id' | 'tenantId'> & { tenantId?: string }): string => {
    const newId = `CUST-${1000 + customers.length + 1}`;
    const newCust: Customer = {
      ...custData,
      id: newId,
      tenantId: custData.tenantId || settings.tenantId || 'tenant-harish-dairy',
      outstandingBalance: custData.outstandingBalance || 0,
    };
    setCustomers(prev => [newCust, ...prev]);
    adminApi.createCustomer(newCust).catch(err => {
      console.debug('Backend sync note (running with resilient local store):', err?.message);
    });

    // Update route count
    setRoutes(prev =>
      prev.map(r =>
        r.id === newCust.assignedRouteId
          ? {
            ...r,
            assignedCustomerCount: r.assignedCustomerCount + 1,
            totalMilkRequired: r.totalMilkRequired + newCust.dailyQuantity,
          }
          : r
      )
    );

    return newId;
  };

  const updateCustomer = (id: string, updates: Partial<Customer>) => {
    adminApi.updateCustomer(id, updates).catch(err => {
      console.debug('Backend sync note:', err?.message);
    });
    setCustomers(prev =>
      prev.map(c => {
        if (c.id === id) {
          const oldRoute = c.assignedRouteId;
          const updated = { ...c, ...updates };

          // If route changed, adjust route counters
          if (updates.assignedRouteId && updates.assignedRouteId !== oldRoute) {
            setRoutes(rList =>
              rList.map(r => {
                if (r.id === oldRoute) {
                  return {
                    ...r,
                    assignedCustomerCount: Math.max(0, r.assignedCustomerCount - 1),
                    totalMilkRequired: Math.max(0, r.totalMilkRequired - c.dailyQuantity),
                  };
                }
                if (r.id === updates.assignedRouteId) {
                  return {
                    ...r,
                    assignedCustomerCount: r.assignedCustomerCount + 1,
                    totalMilkRequired: r.totalMilkRequired + updated.dailyQuantity,
                  };
                }
                return r;
              })
            );
          }
          return updated;
        }
        return c;
      })
    );
  };

  const toggleCustomerStatus = (id: string, newStatus: Customer['status']) => {
    updateCustomer(id, { status: newStatus });
  };

  const deleteCustomer = (id: string) => {
    adminApi.deleteCustomer(id).catch(err => {
      console.debug('Backend sync note:', err?.message);
    });
    const cust = customers.find(c => c.id === id);
    if (!cust) return;
    setCustomers(prev => prev.filter(c => c.id !== id));
    setRoutes(prev =>
      prev.map(r =>
        r.id === cust.assignedRouteId
          ? {
            ...r,
            assignedCustomerCount: Math.max(0, r.assignedCustomerCount - 1),
            totalMilkRequired: Math.max(0, r.totalMilkRequired - cust.dailyQuantity),
          }
          : r
      )
    );
  };

  const importCustomers = (newCusts: Customer[]) => {
    setCustomers(prev => [...newCusts, ...prev]);
  };

  // Employee
  const addEmployee = (emp: Omit<Employee, 'id' | 'tenantId'> & { tenantId?: string }) => {
    const newId = `EMP-0${employees.length + 1}`;
    const newEmp = { ...emp, id: newId, tenantId: emp.tenantId || settings.tenantId || 'tenant-harish-dairy' };
    setEmployees(prev => [...prev, newEmp]);
    adminApi.createEmployee(newEmp).catch(err => console.debug('Backend note:', err?.message));
  };

  const updateEmployee = (id: string, emp: Partial<Employee>) => {
    adminApi.updateEmployee(id, emp).catch(err => console.debug('Backend note:', err?.message));
    setEmployees(prev => prev.map(e => (e.id === id ? { ...e, ...emp } : e)));
  };

  const deleteEmployee = (id: string) => {
    adminApi.deleteEmployee(id).catch(err => console.debug('Backend note:', err?.message));
    setEmployees(prev => prev.filter(e => e.id !== id));
  };

  // Routes
  const addRoute = (route: Omit<Route, 'id' | 'tenantId'> & { tenantId?: string }) => {
    const newId = `ROUTE-${routes.length + 1}`;
    const newRoute = { ...route, id: newId, tenantId: route.tenantId || settings.tenantId || 'tenant-harish-dairy' };
    setRoutes(prev => [...prev, newRoute]);
    adminApi.createRoute(newRoute).catch(err => console.debug('Backend note:', err?.message));
  };

  const updateRoute = (id: string, route: Partial<Route>) => {
    adminApi.updateRoute(id, route).catch(err => console.debug('Backend note:', err?.message));
    setRoutes(prev => prev.map(r => (r.id === id ? { ...r, ...route } : r)));
  };

  const deleteRoute = (id: string) => {
    adminApi.deleteRoute(id).catch(err => console.debug('Backend note:', err?.message));
    setRoutes(prev => prev.filter(r => r.id !== id));
  };

  // Vendors
  const addVendor = (vendor: Omit<Vendor, 'id' | 'tenantId'> & { tenantId?: string }) => {
    const newId = `VEND-0${vendors.length + 1}`;
    const newVen = {
      ...vendor,
      id: newId,
      tenantId: vendor.tenantId || settings.tenantId || 'tenant-harish-dairy',
      totalMilkPurchased: 0,
      totalPurchaseValue: 0,
      totalAmountPaid: 0,
      purchaseReturns: 0,
      outstandingBalance: vendor.openingBalance,
    };
    setVendors(prev => [...prev, newVen]);
    adminApi.createVendor(newVen).catch(err => console.debug('Backend note:', err?.message));
  };

  const updateVendor = (id: string, vendor: Partial<Vendor>) => {
    setVendors(prev => prev.map(v => (v.id === id ? { ...v, ...vendor } : v)));
  };

  const addVendorPayment = (payment: Omit<VendorPayment, 'id' | 'tenantId'> & { tenantId?: string }) => {
    const newPayment: VendorPayment = {
      ...payment,
      id: generateId('VP'),
      tenantId: payment.tenantId || settings.tenantId || 'tenant-harish-dairy',
    };
    setVendorPayments(prev => [newPayment, ...prev]);
    adminApi.recordVendorPayment(newPayment).catch(err => console.debug('Backend note:', err?.message));

    // Reduce vendor outstanding balance
    setVendors(prev =>
      prev.map(v =>
        v.id === payment.vendorId
          ? {
            ...v,
            totalAmountPaid: v.totalAmountPaid + payment.amount,
            outstandingBalance: Math.max(0, v.outstandingBalance - payment.amount),
          }
          : v
      )
    );
  };

  // Purchases
  const addMilkPurchase = (purchase: Omit<MilkPurchase, 'id' | 'tenantId'> & { tenantId?: string }) => {
    const newId = `PUR-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(10 + Math.random() * 90)}`;
    const targetTenant = purchase.tenantId || settings.tenantId || 'tenant-harish-dairy';
    const newPurchase: MilkPurchase = { ...purchase, id: newId, tenantId: targetTenant };
    setMilkPurchases(prev => [newPurchase, ...prev]);
    adminApi.createPurchase(newPurchase).catch(err => console.debug('Backend note:', err?.message));

    // If accepted quantity > 0, update stock transaction
    if (newPurchase.acceptedQuantity > 0) {
      const stockTx: StockTransaction = {
        id: generateId('STK'),
        tenantId: purchase.tenantId || settings.tenantId || 'tenant-harish-dairy',
        date: newPurchase.date,
        type: 'Purchase Receipt',
        milkTypeOrProduct: newPurchase.milkType,
        quantity: newPurchase.acceptedQuantity,
        unit: 'Litres',
        sourceOrDestination: `Vendor: ${newPurchase.vendorName} (${newPurchase.supplierInvoiceNo})`,
        relatedId: newId,
        responsibleUser: currentUser.name,
        notes: `Accepted: ${newPurchase.acceptedQuantity}L, Rejected: ${newPurchase.rejectedQuantity}L. Rate: ₹${newPurchase.purchaseRatePerLitre}/L`,
      };
      setStockTransactions(prev => [stockTx, ...prev]);
    }

    // Update vendor balances
    setVendors(prev =>
      prev.map(v => {
        if (v.id === newPurchase.vendorId) {
          const newTotalMilk = v.totalMilkPurchased + newPurchase.acceptedQuantity;
          const newPurchaseVal = v.totalPurchaseValue + newPurchase.purchaseTotal;
          const newTotalPaid = v.totalAmountPaid + newPurchase.amountPaid;
          const newReturns = v.purchaseReturns + newPurchase.rejectedQuantity;
          const newOutstanding = v.outstandingBalance + (newPurchase.purchaseTotal - newPurchase.amountPaid);
          return {
            ...v,
            totalMilkPurchased: newTotalMilk,
            totalPurchaseValue: newPurchaseVal,
            totalAmountPaid: newTotalPaid,
            purchaseReturns: newReturns,
            outstandingBalance: newOutstanding,
          };
        }
        return v;
      })
    );
  };

  const updateMilkPurchase = (id: string, updates: Partial<MilkPurchase>) => {
    setMilkPurchases(prev => prev.map(p => (p.id === id ? { ...p, ...updates } : p)));
  };

  // Inventory
  const addStockTransaction = (tx: Omit<StockTransaction, 'id' | 'tenantId'> & { tenantId?: string }) => {
    // Check if subtraction would cause negative stock
    if (tx.quantity < 0) {
      if (tx.milkTypeOrProduct === 'Cow Milk' && currentStock.cowMilk + tx.quantity < 0) {
        return {
          success: false,
          message: `Insufficient stock! Cannot reduce ${Math.abs(tx.quantity)}L when current Cow Milk stock is only ${currentStock.cowMilk}L.`,
        };
      }
      if (tx.milkTypeOrProduct === 'Buffalo Milk' && currentStock.buffaloMilk + tx.quantity < 0) {
        return {
          success: false,
          message: `Insufficient stock! Cannot reduce ${Math.abs(tx.quantity)}L when current Buffalo Milk stock is only ${currentStock.buffaloMilk}L.`,
        };
      }
    }

    const newTx: StockTransaction = { ...tx, id: generateId('STK'), tenantId: tx.tenantId || settings.tenantId || 'tenant-harish-dairy' };
    setStockTransactions(prev => [newTx, ...prev]);
    return { success: true };
  };

  const adjustStock = (milkOrProduct: string, qty: number, reason: string, isWastage?: boolean) => {
    return addStockTransaction({
      date: new Date().toISOString().slice(0, 10),
      type: isWastage ? 'Wastage' : 'Adjustment',
      milkTypeOrProduct: milkOrProduct,
      quantity: qty,
      unit: milkOrProduct.includes('Milk') ? 'Litres' : 'Units',
      sourceOrDestination: isWastage ? 'Wastage / Spoils' : 'Manual Inventory Adjustment',
      responsibleUser: currentUser.name,
      notes: reason,
    });
  };

  // Deliveries
  const updateDelivery = (id: string, updates: Partial<Delivery>) => {
    setDeliveries(prev => prev.map(d => (d.id === id ? { ...d, ...updates } : d)));
  };

  const markDelivered = (
    id: string,
    actualQty?: number,
    notes?: string,
    collectedAmount?: number,
    paymentMethod?: 'Cash' | 'UPI'
  ) => {
    const del = deliveries.find(d => d.id === id);
    if (!del) return;

    const finalActual = actualQty !== undefined ? actualQty : del.plannedMilkQuantity;
    updateDelivery(id, {
      status: 'Delivered',
      actualMilkQuantity: finalActual,
      deliveryNotes: notes || del.deliveryNotes,
      collectedAmount,
      collectedPaymentMethod: paymentMethod,
    });

    deliveryApi.markDelivered(id, {
      actualQuantity: finalActual,
      collectedAmount,
      collectedPaymentMethod: paymentMethod === 'UPI' ? 'UPI' : 'CASH',
      deliveryNotes: notes || del.deliveryNotes,
    }).catch(err => console.debug('Delivery stop sync note:', err?.message));

    // If money collected, record customer payment
    if (collectedAmount && collectedAmount > 0) {
      addCustomerPayment({
        customerId: del.customerId,
        customerName: del.customerName,
        date: del.date,
        amount: collectedAmount,
        paymentMethod: paymentMethod || 'Cash',
        referenceNo: `DEL-COLL-${id.slice(-4)}`,
        recordedBy: `${currentUser.name} (Delivery)`,
        notes: `Collected during morning delivery`,
      });
    }
  };

  const markMissed = (id: string, reason: string) => {
    updateDelivery(id, {
      status: 'Missed',
      actualMilkQuantity: 0,
      exceptionReason: reason,
    });
    deliveryApi.markMissed(id, reason).catch(err => console.debug('Delivery stop sync note:', err?.message));
  };

  const markPartialDelivery = (id: string, actualQty: number, reason: string) => {
    updateDelivery(id, {
      status: 'Partially delivered',
      actualMilkQuantity: actualQty,
      exceptionReason: reason,
    });
  };

  // Pause
  const addPauseRequest = (req: Omit<PauseRequest, 'id' | 'requestDate' | 'status' | 'tenantId'> & { tenantId?: string }) => {
    const newReq: PauseRequest = {
      ...req,
      id: generateId('PAUSE'),
      tenantId: req.tenantId || settings.tenantId || 'tenant-harish-dairy',
      requestDate: new Date().toISOString().slice(0, 10),
      status: 'Pending',
    };
    setPauseRequests(prev => [newReq, ...prev]);
  };

  const updatePauseStatus = (id: string, status: PauseRequest['status'], adminNotes?: string) => {
    adminApi.updatePauseStatus(id, status, adminNotes).catch(err => console.debug(err));
    setPauseRequests(prev =>
      prev.map(p => {
        if (p.id === id) {
          const updated = { ...p, status, adminNotes: adminNotes || p.adminNotes };
          // If approved, update customer status to paused
          if (status === 'Approved') {
            updateCustomer(p.customerId, { status: 'paused' });
          } else if (status === 'Cancelled' || status === 'Completed' || status === 'Rejected') {
            updateCustomer(p.customerId, { status: 'active' });
          }
          return updated;
        }
        return p;
      })
    );
  };

  // Products & Orders
  const addProduct = (prod: Omit<Product, 'id' | 'tenantId'> & { tenantId?: string }) => {
    const newId = `PROD-0${products.length + 1}`;
    const newProd = { ...prod, id: newId, tenantId: prod.tenantId || settings.tenantId || 'tenant-harish-dairy' };
    setProducts(prev => [...prev, newProd]);
    adminApi.createProduct(newProd).catch(err => console.debug(err));
  };

  const updateProduct = (id: string, prod: Partial<Product>) => {
    adminApi.updateProduct(id, prod).catch(err => console.debug(err));
    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...prod } : p)));
  };

  const deleteProduct = (id: string) => {
    adminApi.deleteProduct(id).catch(err => console.debug(err));
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const createProductOrder = (order: Omit<ProductOrder, 'id' | 'orderDate' | 'status' | 'tenantId'> & { tenantId?: string }): string => {
    const newId = generateId('ORD');
    const newOrder: ProductOrder = {
      ...order,
      id: newId,
      tenantId: order.tenantId || settings.tenantId || 'tenant-harish-dairy',
      orderDate: new Date().toISOString().slice(0, 10),
      status: 'Confirmed',
    };
    setProductOrders(prev => [newOrder, ...prev]);
    adminApi.createOrder(newOrder).catch(err => console.debug(err));

    // Deduct available product stock
    newOrder.items.forEach(item => {
      setProducts(pList =>
        pList.map(p =>
          p.id === item.productId
            ? { ...p, availableStock: Math.max(0, p.availableStock - item.quantity) }
            : p
        )
      );
    });

    return newId;
  };

  const updateOrderStatus = (id: string, status: ProductOrder['status']) => {
    adminApi.updateOrderStatus(id, status).catch(err => console.debug(err));
    setProductOrders(prev => prev.map(o => (o.id === id ? { ...o, status } : o)));
  };

  // Invoices & Billing
  const generateMonthlyInvoices = (month: string, monthLabel: string): number => {
    adminApi.generateMonthlyInvoices(month).catch(err => console.debug(err));
    let generatedCount = 0;
    const newInvoices: Invoice[] = [];

    customers.forEach(cust => {
      // Check if invoice already exists for this customer & month
      const exists = invoices.some(inv => inv.customerId === cust.id && inv.month === month);
      if (exists) return;

      const daysInMonth = 30; // standard 30 day cycle
      const milkCharges = cust.status === 'paused' ? 0 : cust.dailyQuantity * cust.pricePerLitre * daysInMonth;

      // Product charges from delivered orders this month
      const prodOrders = productOrders.filter(
        o => o.customerId === cust.id && o.status === 'Delivered'
      );
      const productCharges = prodOrders.reduce((sum, o) => sum + o.totalAmount, 0);

      const previousBalance = cust.outstandingBalance;
      const totalPayable = milkCharges + productCharges + previousBalance;

      const invId = `INV-${month.replace('-', '')}-${cust.id.slice(-4)}`;
      const invNum = `${settings.invoicePrefix}${month.replace('-', '')}-${cust.id.slice(-4)}`;

      const invoice: Invoice = {
        id: invId,
        invoiceNumber: invNum,
        tenantId: cust.tenantId || settings.tenantId || 'tenant-harish-dairy',
        customerId: cust.id,
        customerName: cust.name,
        customerMobile: cust.mobile,
        customerAddress: `${cust.houseNo}, ${cust.street}, ${cust.area}`,
        routeId: cust.assignedRouteId,
        month,
        monthLabel,
        milkCharges,
        productCharges,
        previousBalance,
        adjustments: 0,
        paymentsApplied: 0,
        totalPayable,
        balanceRemaining: totalPayable,
        status: 'Draft',
        generatedDate: new Date().toISOString().slice(0, 10),
        dueDate: `${month}-07`,
        items: [
          {
            date: `${month}-01 to ${month}-30`,
            description: `${cust.milkType} Delivered (${cust.dailyQuantity} L/day x ${daysInMonth} days)`,
            quantity: cust.dailyQuantity * daysInMonth,
            unit: 'Litres',
            rate: cust.pricePerLitre,
            amount: milkCharges,
            type: 'milk',
          },
          ...(productCharges > 0
            ? [
              {
                date: `${month}-15`,
                description: 'Additional Dairy Products Delivered',
                quantity: 1,
                unit: 'Items',
                rate: productCharges,
                amount: productCharges,
                type: 'product' as const,
              },
            ]
            : []),
        ],
        notes: `Please settle on or before 7th of the month via UPI or Cash to delivery agent.`,
      };

      newInvoices.push(invoice);
      generatedCount++;
    });

    if (newInvoices.length > 0) {
      setInvoices(prev => [...newInvoices, ...prev]);
    }

    return generatedCount;
  };

  const finalizeInvoice = (id: string) => {
    adminApi.finalizeInvoice(id).catch(err => console.debug(err));
    setInvoices(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, status: 'Finalized' } : inv))
    );
  };

  const voidInvoice = (id: string) => {
    adminApi.voidInvoice(id).catch(err => console.debug(err));
    setInvoices(prev =>
      prev.map(inv => (inv.id === id ? { ...inv, status: 'Voided' } : inv))
    );
  };

  const addCustomerPayment = (paymentData: Omit<CustomerPayment, 'id' | 'tenantId'> & { tenantId?: string }) => {
    const newPayment: CustomerPayment = {
      ...paymentData,
      id: generateId('PAY'),
      tenantId: paymentData.tenantId || settings.tenantId || 'tenant-harish-dairy',
    };
    setCustomerPayments(prev => [newPayment, ...prev]);

    adminApi.recordPayment({
      customerId: newPayment.customerId,
      customerName: newPayment.customerName,
      invoiceId: newPayment.invoiceId,
      amount: newPayment.amount,
      method: newPayment.paymentMethod === 'UPI' ? 'UPI' : 'CASH',
      transactionRef: newPayment.referenceNo,
      notes: newPayment.notes,
    }).catch(err => console.debug(err));

    // Update customer outstanding balance
    setCustomers(prev =>
      prev.map(c =>
        c.id === paymentData.customerId
          ? { ...c, outstandingBalance: Math.max(0, c.outstandingBalance - paymentData.amount) }
          : c
      )
    );

    // If linked to an invoice, reduce invoice balance & update status
    if (paymentData.invoiceId) {
      setInvoices(prev =>
        prev.map(inv => {
          if (inv.id === paymentData.invoiceId) {
            const newPaymentsApplied = inv.paymentsApplied + paymentData.amount;
            const newBal = Math.max(0, inv.totalPayable - newPaymentsApplied);
            const newStatus = newBal === 0 ? 'Paid' : newPaymentsApplied > 0 ? 'Partially Paid' : inv.status;
            return {
              ...inv,
              paymentsApplied: newPaymentsApplied,
              balanceRemaining: newBal,
              status: newStatus,
            };
          }
          return inv;
        })
      );
    }
  };

  // WhatsApp Demo Notifications
  const sendDemoNotification = (invoiceId: string) => {
    const inv = invoices.find(i => i.id === invoiceId);
    if (!inv) return;

    const cust = customers.find(c => c.id === inv.customerId);
    const hasPhone = cust && (cust.whatsapp || cust.mobile);

    const message = settings.notificationTemplate
      .replace('{{customerName}}', inv.customerName)
      .replace('{{billingMonth}}', inv.monthLabel)
      .replace('{{milkCharges}}', `₹${inv.milkCharges.toLocaleString('en-IN')}`)
      .replace('{{productCharges}}', `₹${inv.productCharges.toLocaleString('en-IN')}`)
      .replace('{{previousBalance}}', `₹${inv.previousBalance.toLocaleString('en-IN')}`)
      .replace('{{paymentsApplied}}', `₹${inv.paymentsApplied.toLocaleString('en-IN')}`)
      .replace('{{amountDue}}', `₹${inv.balanceRemaining.toLocaleString('en-IN')}`);

    const newLog: NotificationLog = {
      id: generateId('NOTIF'),
      tenantId: inv.tenantId || settings.tenantId || 'tenant-harish-dairy',
      customerId: inv.customerId,
      customerName: inv.customerName,
      mobile: cust ? cust.mobile : '',
      whatsapp: cust ? cust.whatsapp : '',
      invoiceId: inv.id,
      invoiceNumber: inv.invoiceNumber,
      billingMonth: inv.monthLabel,
      amountDue: inv.balanceRemaining,
      messageContent: message,
      sentAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      status: hasPhone ? 'Delivered' : 'Failed',
      isSimulated: true,
      notes: hasPhone ? undefined : 'Customer missing valid WhatsApp number',
    };

    setNotificationLogs(prev => [newLog, ...prev]);
  };

  const retryNotification = (logId: string) => {
    setNotificationLogs(prev =>
      prev.map(l =>
        l.id === logId
          ? {
            ...l,
            status: 'Delivered',
            sentAt: new Date().toLocaleDateString('en-IN') + ' ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            notes: undefined,
          }
          : l
      )
    );
  };

  // Customer Ledger
  const getCustomerLedger = (customerId: string): CustomerLedgerEntry[] => {
    return generateCustomerLedger(customerId);
  };

  // Reset Demo Data
  const clearAllData = () => {
    setIsDemoMode(false);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('milkerp_data_mode', 'clean');
      localStorage.removeItem(STORAGE_KEY);
    }
    setCustomers([]);
    setDeliveries([]);
    setInvoices([]);
    setMilkPurchases([]);
    setVendorPayments([]);
    setPauseRequests([]);
    setProductOrders([]);
    setStockTransactions([]);
    setCustomerPayments([]);
    setNotificationLogs([]);
    setRoutes([]);
    setEmployees([]);
    setVendors([]);
    emitBusinessEvent('data:cleared', { mode: 'clean' });
  };

  const loadDemoData = () => {
    setIsDemoMode(true);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('milkerp_data_mode', 'demo');
    }
    const seedCusts = generateSeedCustomers();
    const seedDels = generateSeedDeliveries(seedCusts, initialRoutes);
    const seedInvs = generateSeedInvoices(seedCusts);

    setSettings(initialBusinessSettings);
    setRoutes(initialRoutes);
    setEmployees(initialEmployees);
    setVendors(initialVendors);
    setProducts(initialProducts);
    setCustomers(seedCusts);
    setDeliveries(seedDels);
    setMilkPurchases(initialMilkPurchases);
    setVendorPayments(initialVendorPayments);
    setPauseRequests(initialPauseRequests);
    setProductOrders(initialProductOrders);
    setStockTransactions(initialStockTransactions);
    setInvoices(seedInvs);
    setCustomerPayments(initialCustomerPayments);
    setNotificationLogs(initialNotificationLogs);
    emitBusinessEvent('data:loaded_demo', { count: seedCusts.length });
  };

  const resetDemoData = () => {
    loadDemoData();
  };

  const _legacyReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    const seedCusts = generateSeedCustomers();
    const seedDels = generateSeedDeliveries(seedCusts, initialRoutes);
    const seedInvs = generateSeedInvoices(seedCusts);

    setSettings(initialBusinessSettings);
    setRoutes(initialRoutes);
    setEmployees(initialEmployees);
    setVendors(initialVendors);
    setProducts(initialProducts);
    setCustomers(seedCusts);
    setDeliveries(seedDels);
    setMilkPurchases(initialMilkPurchases);
    setVendorPayments(initialVendorPayments);
    setPauseRequests(initialPauseRequests);
    setProductOrders(initialProductOrders);
    setStockTransactions(initialStockTransactions);
    setInvoices(seedInvs);
    setCustomerPayments(initialCustomerPayments);
    setNotificationLogs(initialNotificationLogs);
  };

  return (
    <DairyContext.Provider
      value={{
        currentUser,
        login,
        logout,
        switchRole,
        settings,
        updateSettings,
        customers,
        employees,
        routes,
        vendors,
        milkPurchases,
        vendorPayments,
        products,
        productOrders,
        pauseRequests,
        deliveries,
        stockTransactions,
        invoices,
        customerPayments,
        notificationLogs,
        currentStock,
        addCustomer,
        updateCustomer,
        toggleCustomerStatus,
        deleteCustomer,
        importCustomers,
        addEmployee,
        updateEmployee,
        deleteEmployee,
        addRoute,
        updateRoute,
        deleteRoute,
        addVendor,
        updateVendor,
        addVendorPayment,
        addMilkPurchase,
        updateMilkPurchase,
        addStockTransaction,
        adjustStock,
        updateDelivery,
        markDelivered,
        markMissed,
        markPartialDelivery,
        addPauseRequest,
        updatePauseStatus,
        addProduct,
        updateProduct,
        deleteProduct,
        createProductOrder,
        updateOrderStatus,
        generateMonthlyInvoices,
        finalizeInvoice,
        voidInvoice,
        addCustomerPayment,
        sendDemoNotification,
        retryNotification,
        getCustomerLedger,
        resetDemoData,
        isDemoMode,
        clearAllData,
        loadDemoData,
        isLoadingData,
        refreshData: fetchLiveData,
      }}
    >
      {children}
    </DairyContext.Provider>
  );
};

export const useDairy = () => {
  const context = useContext(DairyContext);
  if (!context) {
    throw new Error('useDairy must be used within a DairyProvider');
  }
  return context;
};
