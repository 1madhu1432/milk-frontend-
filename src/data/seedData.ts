import {
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

export const initialBusinessSettings: BusinessSettings = {
  tenantId: 'tenant-harish-dairy',
  dairyName: 'Harish Dairy',
  tagline: 'Farm-Fresh Pure Milk & Artisanal Dairy Delivered Daily',
  address: 'Plot 42, Dairy Circle, Green Valley Road, Gachibowli, Hyderabad - 500032',
  contactNumber: '+91 98490 12345',
  email: 'operations@harishdairy.demo',
  gstNumber: '36AABCA1234F1Z8',
  billingPeriod: 'Calendar Month (1st to Month-end)',
  invoiceGenerationDay: 1, // 1st of every month
  paymentDueDate: 7, // 7th of every month
  deliveryCutoffTime: '20:00', // 8 PM evening before
  pauseCutoffTime: '21:00', // 9 PM evening before
  invoicePrefix: 'HAR-',
  currency: 'INR',
  decimalPrecision: 0,
  defaultCowMilkRate: 60,
  defaultBuffaloMilkRate: 75,
  notificationTemplate:
    'Hello {{customerName}},\nYour milk and dairy product bill for {{billingMonth}} is ready.\nMilk charges: {{milkCharges}}\nProduct charges: {{productCharges}}\nPrevious balance: {{previousBalance}}\nPayments applied: {{paymentsApplied}}\nAmount payable: {{amountDue}}\n\nThank you for choosing Harish Dairy!',
};

// Operational Routes
export const initialRoutes: Route[] = [
  {
    id: 'ROUTE-1',
    tenantId: 'tenant-harish-dairy',
    name: 'Route 1 - Jubilee Hills & Road 36',
    area: 'Jubilee Hills, Road No. 36, Film Nagar',
    assignedEmployeeIds: ['EMP-01'],
    assignedCustomerCount: 2,
    totalMilkRequired: 4.0,
    totalAdditionalProducts: 0,
    completedDeliveries: 0,
    pendingDeliveries: 2,
    missedDeliveries: 0,
    completionPercentage: 0,
  },
  {
    id: 'ROUTE-2',
    tenantId: 'tenant-harish-dairy',
    name: 'Route 2 - Madhapur & Hitec City',
    area: 'Madhapur, Ayyappa Society, Kavuri Hills',
    assignedEmployeeIds: ['EMP-01'],
    assignedCustomerCount: 3,
    totalMilkRequired: 5.5,
    totalAdditionalProducts: 2,
    completedDeliveries: 0,
    pendingDeliveries: 3,
    missedDeliveries: 0,
    completionPercentage: 0,
  },
];

export const initialEmployees: Employee[] = [
  {
    id: 'EMP-01',
    tenantId: 'tenant-harish-dairy',
    name: 'Suresh Kumar Goud',
    phone: '+91 98491 55667',
    email: 'delivery@dailydairy.demo',
    assignedRouteIds: ['ROUTE-1', 'ROUTE-2'],
    joiningDate: '2025-06-01',
    status: 'active',
    dailyDeliveriesCompleted: 42,
    missedDeliveries: 1,
    collectionsRecorded: 15400,
  },
];

export const initialVendors: Vendor[] = [];

export const initialProducts: Product[] = [
  {
    id: 'PROD-01',
    tenantId: 'tenant-harish-dairy',
    name: 'Farm Fresh Cow Milk (1 Litre)',
    category: 'Fresh Milk',
    description: 'Raw, unadulterated pure A2 cow milk chilled immediately after milking.',
    image: '🥛',
    unitOrPackageSize: '1 Litre Glass Bottle / Pouch',
    purchaseCost: 42,
    sellingPrice: 60,
    availableStock: 120,
    minimumStock: 80,
    isRecurringEligible: true,
    status: 'active',
  },
  {
    id: 'PROD-02',
    tenantId: 'tenant-harish-dairy',
    name: 'Rich Buffalo Milk (1 Litre)',
    category: 'Fresh Milk',
    description: 'Creamy 7.5% fat organic buffalo milk perfect for thick curd and tea.',
    image: '🥛',
    unitOrPackageSize: '1 Litre Pouch',
    purchaseCost: 50,
    sellingPrice: 75,
    availableStock: 150,
    minimumStock: 100,
    isRecurringEligible: true,
    status: 'active',
  },
  {
    id: 'PROD-03',
    tenantId: 'tenant-harish-dairy',
    name: 'Artisanal Malai Paneer (200g)',
    category: 'Dairy Essentials',
    description: 'Super soft, melt-in-mouth cottage cheese crafted from whole cow milk.',
    image: '🧈',
    unitOrPackageSize: '200g Vacuum Pack',
    purchaseCost: 75,
    sellingPrice: 110,
    availableStock: 45,
    minimumStock: 25,
    isRecurringEligible: true,
    status: 'active',
  },
  {
    id: 'PROD-04',
    tenantId: 'tenant-harish-dairy',
    name: 'Farmhouse Set Curd / Dahi (500g)',
    category: 'Cultured',
    description: 'Naturally fermented thick curd with active probiotics and no sour taste.',
    image: '🥣',
    unitOrPackageSize: '500g Tub',
    purchaseCost: 32,
    sellingPrice: 50,
    availableStock: 60,
    minimumStock: 30,
    isRecurringEligible: true,
    status: 'active',
  },
  {
    id: 'PROD-05',
    tenantId: 'tenant-harish-dairy',
    name: 'Traditional Desi Ghee (500ml)',
    category: 'Dairy Essentials',
    description: 'Bilona churned aromatic golden ghee with rich granular Danedar texture.',
    image: '🏺',
    unitOrPackageSize: '500ml Glass Jar',
    purchaseCost: 450,
    sellingPrice: 680,
    availableStock: 35,
    minimumStock: 15,
    isRecurringEligible: false,
    status: 'active',
  },
  {
    id: 'PROD-06',
    tenantId: 'tenant-harish-dairy',
    name: 'Flavoured Badam Milk (200ml)',
    category: 'Beverages',
    description: 'Real almond crushed saffron flavoured sterilised milk beverage.',
    image: '🍶',
    unitOrPackageSize: '200ml Glass Bottle',
    purchaseCost: 28,
    sellingPrice: 45,
    availableStock: 50,
    minimumStock: 30,
    isRecurringEligible: true,
    status: 'active',
  },
];

export function generateSeedCustomers(): Customer[] {
  return [
    {
      id: 'CUST-001',
      tenantId: 'tenant-harish-dairy',
      name: 'Dr. Srinivas Rao',
      mobile: '9849011223',
      whatsapp: '9849011223',
      email: 'srinivas.rao@gmail.com',
      houseNo: 'Villa 14',
      street: 'Road No. 12',
      area: 'Banjara Hills',
      landmark: 'Near Cancer Hospital',
      deliveryInstructions: 'Leave bottle inside milk basket at main gate',
      assignedRouteId: 'ROUTE-1',
      assignedEmployeeId: 'EMP-01',
      milkType: 'Cow Milk',
      dailyQuantity: 2.0,
      pricePerLitre: 60,
      subscriptionStartDate: '2026-01-01',
      billingDueDate: 5,
      status: 'active',
      outstandingBalance: 0,
    },
    {
      id: 'CUST-002',
      tenantId: 'tenant-harish-dairy',
      name: 'Mrs. Lakshmi Narayanan',
      mobile: '9849022334',
      whatsapp: '9849022334',
      email: 'lakshmi.n@gmail.com',
      houseNo: 'Flat 402',
      street: 'Block B, My Home Bhooja',
      area: 'Hitec City',
      landmark: 'Opposite Biodiversity Park',
      deliveryInstructions: 'Ring bell twice, leave on milk shelf',
      assignedRouteId: 'ROUTE-2',
      assignedEmployeeId: 'EMP-01',
      milkType: 'Buffalo Milk',
      dailyQuantity: 1.5,
      pricePerLitre: 75,
      subscriptionStartDate: '2026-01-10',
      billingDueDate: 5,
      status: 'active',
      outstandingBalance: 150,
    },
    {
      id: 'CUST-003',
      tenantId: 'tenant-harish-dairy',
      name: 'Vikram & Ananya Sharma',
      mobile: '9849033445',
      whatsapp: '9849033445',
      email: 'vikram.sharma@yahoo.com',
      houseNo: 'House 88',
      street: 'Lane 4, Kakatiya Hills',
      area: 'Madhapur',
      landmark: 'Behind D-Mart',
      deliveryInstructions: 'Hang bag on side hook next to nameplate',
      assignedRouteId: 'ROUTE-2',
      assignedEmployeeId: 'EMP-01',
      milkType: 'Cow Milk',
      dailyQuantity: 2.0,
      pricePerLitre: 60,
      subscriptionStartDate: '2026-02-01',
      billingDueDate: 5,
      status: 'active',
      outstandingBalance: 0,
    },
    {
      id: 'CUST-004',
      tenantId: 'tenant-harish-dairy',
      name: 'K. Sunitha Reddy',
      mobile: '9849044556',
      whatsapp: '9849044556',
      email: 'sunitha.reddy@outlook.com',
      houseNo: 'Flat 101',
      street: 'Tower 7, Rainbow Vistas',
      area: 'Moosapet',
      landmark: 'Near Metro Station',
      deliveryInstructions: 'Ring doorbell, collect cash if weekend',
      assignedRouteId: 'ROUTE-2',
      assignedEmployeeId: 'EMP-01',
      milkType: 'Cow Milk',
      dailyQuantity: 2.0,
      pricePerLitre: 60,
      subscriptionStartDate: '2026-02-15',
      billingDueDate: 5,
      status: 'active',
      outstandingBalance: 0,
    },
  ];
}

export function generateSeedDeliveries(custs?: Customer[], _routes?: Route[]): Delivery[] {
  const customers = custs && custs.length > 0 ? custs : generateSeedCustomers();
  const today = new Date().toISOString().slice(0, 10);

  return customers.map((c, idx) => ({
    id: `DEL-${today}-${String(idx + 1).padStart(3, '0')}`,
    tenantId: c.tenantId,
    date: today,
    customerId: c.id,
    customerName: c.name,
    customerMobile: c.mobile,
    routeId: c.assignedRouteId || 'ROUTE-2',
    routeName: c.assignedRouteId === 'ROUTE-1' ? 'Route 1 - Jubilee Hills' : 'Route 2 - Madhapur & Hitec City',
    employeeId: 'EMP-01',
    employeeName: 'Suresh Kumar Goud',
    milkType: c.milkType,
    plannedMilkQuantity: c.dailyQuantity,
    actualMilkQuantity: c.dailyQuantity,
    pricePerLitre: c.pricePerLitre,
    additionalProducts: idx === 1 ? [
      {
        productId: 'PROD-03',
        productName: 'Artisanal Malai Paneer (200g)',
        unit: 'Pack',
        plannedQty: 1,
        actualQty: 1,
        unitPrice: 110,
      }
    ] : [],
    status: (idx === 0 ? 'Delivered' : 'Scheduled') as Delivery['status'],
    deliveryNotes: c.deliveryInstructions,
    collectedAmount: 0,
  }));
}

export const initialMilkPurchases: MilkPurchase[] = [];

export const initialVendorPayments: VendorPayment[] = [];

export const initialPauseRequests: PauseRequest[] = [];

export const initialProductOrders: ProductOrder[] = [];

export const initialStockTransactions: StockTransaction[] = [];

export function generateSeedInvoices(_customers?: Customer[]): Invoice[] {
  return [];
}

export const initialCustomerPayments: CustomerPayment[] = [];

export function generateCustomerLedger(_customerId: string): CustomerLedgerEntry[] {
  return [];
}

export const initialNotificationLogs: NotificationLog[] = [];
