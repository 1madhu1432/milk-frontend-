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

// Clean production baselines - No dummy records
export const initialRoutes: Route[] = [];

export const initialEmployees: Employee[] = [];

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
    availableStock: 0,
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
    availableStock: 0,
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
    availableStock: 0,
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
    availableStock: 0,
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
    availableStock: 0,
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
    availableStock: 0,
    minimumStock: 30,
    isRecurringEligible: true,
    status: 'active',
  },
];

export function generateSeedCustomers(): Customer[] {
  return [];
}

export function generateSeedDeliveries(_customers?: Customer[], _routes?: Route[]): Delivery[] {
  return [];
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
