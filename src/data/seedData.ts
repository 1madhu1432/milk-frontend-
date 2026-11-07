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

export const initialRoutes: Route[] = [
  {
    id: 'ROUTE-1',
    tenantId: 'tenant-harish-dairy',
    name: 'Route 1 - Banjara Hills & Jubilee Hills',
    area: 'Banjara Hills, Jubilee Hills, Film Nagar',
    assignedEmployeeIds: ['EMP-01'],
    assignedCustomerCount: 105,
    totalMilkRequired: 142,
    totalAdditionalProducts: 24,
    completedDeliveries: 98,
    pendingDeliveries: 4,
    missedDeliveries: 3,
    completionPercentage: 93,
  },
  {
    id: 'ROUTE-2',
    tenantId: 'tenant-harish-dairy',
    name: 'Route 2 - Madhapur & Hitec City',
    area: 'Madhapur, Hitec City, Kavuri Hills',
    assignedEmployeeIds: ['EMP-02'],
    assignedCustomerCount: 110,
    totalMilkRequired: 156,
    totalAdditionalProducts: 32,
    completedDeliveries: 104,
    pendingDeliveries: 4,
    missedDeliveries: 2,
    completionPercentage: 94,
  },
  {
    id: 'ROUTE-3',
    tenantId: 'tenant-harish-dairy',
    name: 'Route 3 - Gachibowli & Financial District',
    area: 'Gachibowli, Financial District, Nanakramguda',
    assignedEmployeeIds: ['EMP-03'],
    assignedCustomerCount: 98,
    totalMilkRequired: 135,
    totalAdditionalProducts: 19,
    completedDeliveries: 90,
    pendingDeliveries: 6,
    missedDeliveries: 2,
    completionPercentage: 92,
  },
  {
    id: 'ROUTE-4',
    tenantId: 'tenant-harish-dairy',
    name: 'Route 4 - Kondapur & Hafeezpet',
    area: 'Kondapur, Hafeezpet, Botanical Gardens',
    assignedEmployeeIds: ['EMP-04'],
    assignedCustomerCount: 95,
    totalMilkRequired: 128,
    totalAdditionalProducts: 22,
    completedDeliveries: 88,
    pendingDeliveries: 5,
    missedDeliveries: 2,
    completionPercentage: 93,
  },
  {
    id: 'ROUTE-5',
    tenantId: 'tenant-harish-dairy',
    name: 'Route 5 - Kukatpally & KPHB Colony',
    area: 'Kukatpally, KPHB Phase 1-6, Nizampet X Roads',
    assignedEmployeeIds: ['EMP-05'],
    assignedCustomerCount: 92,
    totalMilkRequired: 124,
    totalAdditionalProducts: 16,
    completedDeliveries: 85,
    pendingDeliveries: 4,
    missedDeliveries: 3,
    completionPercentage: 92,
  },
];

export const initialEmployees: Employee[] = [
  {
    id: 'EMP-01',
    tenantId: 'tenant-harish-dairy',
    name: 'Ramesh Naidu',
    phone: '+91 98480 23145',
    email: 'ramesh.delivery@dailydairy.demo',
    assignedRouteIds: ['ROUTE-1'],
    joiningDate: '2024-03-15',
    status: 'active',
    dailyDeliveriesCompleted: 98,
    missedDeliveries: 3,
    collectionsRecorded: 18450,
  },
  {
    id: 'EMP-02',
    tenantId: 'tenant-harish-dairy',
    name: 'Suresh Kumar Goud',
    phone: '+91 98480 34256',
    email: 'delivery@dailydairy.demo', // Demo employee login
    assignedRouteIds: ['ROUTE-2'],
    joiningDate: '2024-05-10',
    status: 'active',
    dailyDeliveriesCompleted: 104,
    missedDeliveries: 2,
    collectionsRecorded: 22100,
  },
  {
    id: 'EMP-03',
    tenantId: 'tenant-harish-dairy',
    name: 'Venkat Reddy',
    phone: '+91 98480 45367',
    email: 'venkat.delivery@dailydairy.demo',
    assignedRouteIds: ['ROUTE-3'],
    joiningDate: '2024-08-01',
    status: 'active',
    dailyDeliveriesCompleted: 90,
    missedDeliveries: 2,
    collectionsRecorded: 16800,
  },
  {
    id: 'EMP-04',
    tenantId: 'tenant-harish-dairy',
    name: 'Mahesh Babu Varma',
    phone: '+91 98480 56478',
    email: 'mahesh.delivery@dailydairy.demo',
    assignedRouteIds: ['ROUTE-4'],
    joiningDate: '2025-01-12',
    status: 'active',
    dailyDeliveriesCompleted: 88,
    missedDeliveries: 2,
    collectionsRecorded: 14200,
  },
  {
    id: 'EMP-05',
    tenantId: 'tenant-harish-dairy',
    name: 'Praveen Yadav',
    phone: '+91 98480 67589',
    email: 'praveen.delivery@dailydairy.demo',
    assignedRouteIds: ['ROUTE-5'],
    joiningDate: '2025-04-20',
    status: 'active',
    dailyDeliveriesCompleted: 85,
    missedDeliveries: 3,
    collectionsRecorded: 12900,
  },
];

export const initialVendors: Vendor[] = [
  {
    id: 'VEND-01',
    tenantId: 'tenant-harish-dairy',
    name: 'Krishna Valley Dairy Farm',
    contactNumber: '+91 94401 22334',
    address: 'Survey 18, Shamirpet Dairy Cluster, Medchal District, Telangana',
    milkTypesSupplied: ['Cow Milk', 'Buffalo Milk'],
    defaultPurchaseRate: 42,
    paymentTerms: 'Weekly Settlement (Every Monday)',
    openingBalance: 14500,
    totalMilkPurchased: 12850,
    totalPurchaseValue: 539700,
    totalAmountPaid: 512000,
    purchaseReturns: 250,
    outstandingBalance: 42200,
    status: 'active',
    notes: 'Primary bulk supplier. Morning delivery arrives at 04:30 AM daily.',
  },
  {
    id: 'VEND-02',
    tenantId: 'tenant-harish-dairy',
    name: 'Godavari Pastures & Cattle Co',
    contactNumber: '+91 94402 33445',
    address: 'Kandlakoya Village, NH 44 Highway, Medchal, Telangana',
    milkTypesSupplied: ['Cow Milk', 'Buffalo Milk'],
    defaultPurchaseRate: 44,
    paymentTerms: 'Bi-weekly Settlement',
    openingBalance: 8200,
    totalMilkPurchased: 8900,
    totalPurchaseValue: 391600,
    totalAmountPaid: 375000,
    purchaseReturns: 120,
    outstandingBalance: 24800,
    status: 'active',
    notes: 'Secondary supplier. High-fat buffalo milk specialist with 7.8% SNF.',
  },
];

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
    availableStock: 340,
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
    availableStock: 410,
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
    availableStock: 48,
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
    availableStock: 65,
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
    availableStock: 32,
    minimumStock: 15,
    isRecurringEligible: false,
    status: 'active',
  },
  {
    id: 'PROD-06',
    tenantId: 'tenant-harish-dairy',
    name: 'Spiced Masala Buttermilk (250ml)',
    category: 'Beverages',
    description: 'Refreshing digestive Chaas tempered with fresh ginger, curry leaves and cumin.',
    image: '🥤',
    unitOrPackageSize: '250ml Bottle',
    purchaseCost: 12,
    sellingPrice: 22,
    availableStock: 80,
    minimumStock: 40,
    isRecurringEligible: true,
    status: 'active',
  },
  {
    id: 'PROD-07',
    tenantId: 'tenant-harish-dairy',
    name: 'Traditional Cultured White Butter (250g)',
    category: 'Dairy Essentials',
    description: 'Makhan churned daily using slow traditional methods without artificial salt.',
    image: '🧈',
    unitOrPackageSize: '250g Pack',
    purchaseCost: 110,
    sellingPrice: 160,
    availableStock: 18,
    minimumStock: 20,
    isRecurringEligible: true,
    status: 'active',
  },
  {
    id: 'PROD-08',
    tenantId: 'tenant-harish-dairy',
    name: 'Natural Cheddar Cheese Block (200g)',
    category: 'Dairy Essentials',
    description: 'Mild aged natural cheese made from 100% pure cow milk with zero additives.',
    image: '🧀',
    unitOrPackageSize: '200g Block',
    purchaseCost: 140,
    sellingPrice: 210,
    availableStock: 25,
    minimumStock: 15,
    isRecurringEligible: false,
    status: 'active',
  },
  {
    id: 'PROD-09',
    tenantId: 'tenant-harish-dairy',
    name: 'Kesar Badam Flavoured Milk (200ml)',
    category: 'Beverages',
    description: 'Delicious chilled milk infused with Kashmiri saffron strands and real roasted almonds.',
    image: '🥛',
    unitOrPackageSize: '200ml Glass Bottle',
    purchaseCost: 28,
    sellingPrice: 45,
    availableStock: 55,
    minimumStock: 30,
    isRecurringEligible: true,
    status: 'active',
  },
];

// Deterministic 500 customers generation
const firstNames = [
  'Rajesh', 'Suresh', 'Priya', 'Ananya', 'Venkat', 'Srinivas', 'Kavitha', 'Lakshmi', 'Ravi', 'Deepak',
  'Sunita', 'Amit', 'Sneha', 'Manoj', 'Rohit', 'Harish', 'Padma', 'Swathi', 'Vikram', 'Bhavani',
  'Gopal', 'Kiran', 'Archana', 'Naveen', 'Divya', 'Sandeep', 'Meena', 'Prashant', 'Radhika', 'Chaitanya',
  'Vamshi', 'Santosh', 'Geetha', 'Ashok', 'Sangeetha', 'Madhav', 'Pooja', 'Vinay', 'Aparna', 'Raghu'
];

const lastNames = [
  'Reddy', 'Rao', 'Sharma', 'Goud', 'Varma', 'Naidu', 'Chowdary', 'Yadav', 'Patel', 'Kumar',
  'Murthy', 'Raju', 'Iyer', 'Menon', 'Babu', 'Joshi', 'Gupta', 'Prasad', 'Bhat', 'Kulkarni'
];

const areasByRoute: Record<string, string[]> = {
  'ROUTE-1': ['Road No 12 Banjara Hills', 'Road No 36 Jubilee Hills', 'Film Nagar Site 2', 'MLA Colony', 'Journalist Colony'],
  'ROUTE-2': ['Ayyappa Society Madhapur', 'Cyber Towers Area', 'Kavuri Hills Phase 2', 'Silpa Gram Craft Village', 'Madhapur 100ft Rd'],
  'ROUTE-3': ['Telecom Nagar Gachibowli', 'Nanakramguda Financial District', 'Golf View Apartments', 'Jayabheri Silicon County', 'Gowlidoddy Main Rd'],
  'ROUTE-4': ['Raghavendra Colony Kondapur', 'Silpa Park', 'Hafeezpet Station Road', 'Botanical Garden Enclave', 'Raja Rajeshwari Nagar'],
  'ROUTE-5': ['KPHB Phase 1', 'KPHB Phase 3 Temple Rd', 'KPHB Phase 6 Forum Mall Area', 'Nizampet X Roads', 'Kukatpally Housing Board Colony'],
};

export function generateSeedCustomers(): Customer[] {
  const customers: Customer[] = [];
  const routeKeys = ['ROUTE-1', 'ROUTE-2', 'ROUTE-3', 'ROUTE-4', 'ROUTE-5'];

  for (let i = 1; i <= 500; i++) {
    const custId = `CUST-${1000 + i}`;
    const fName = firstNames[(i * 7) % firstNames.length];
    const lName = lastNames[(i * 11) % lastNames.length];
    const fullName = `${fName} ${lName}`;
    const routeIndex = (i - 1) % 5;
    const routeId = routeKeys[routeIndex];
    const empId = `EMP-0${routeIndex + 1}`;
    const areas = areasByRoute[routeId];
    const area = areas[i % areas.length];
    const houseNo = `${Math.floor(1 + (i % 80))}-${Math.floor(10 + (i % 90))}/${i % 12 + 1}`;
    const phoneSuffix = 10000 + i * 17;
    const mobile = `+91 98490 ${phoneSuffix.toString().slice(-5)}`;
    
    // First customer is the demo customer!
    const email = i === 1 ? 'customer@dailydairy.demo' : `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@gmail.com`;
    const milkType = i % 3 === 0 ? 'Buffalo Milk' : 'Cow Milk';
    const dailyQuantity = i % 5 === 0 ? 2.0 : i % 2 === 0 ? 1.5 : 1.0;
    const pricePerLitre = milkType === 'Cow Milk' ? 60 : 75;
    
    // Status distribution
    let status: 'active' | 'paused' | 'inactive' = 'active';
    if (i % 25 === 0) status = 'paused';
    else if (i % 80 === 0) status = 'inactive';

    // Outstanding balance variations
    let outstandingBalance = 0;
    if (i % 4 === 0) outstandingBalance = Math.round(dailyQuantity * pricePerLitre * 15);
    else if (i % 7 === 0) outstandingBalance = Math.round(dailyQuantity * pricePerLitre * 30 + 350);
    else if (i % 11 === 0) outstandingBalance = 450;

    customers.push({
      id: custId,
      tenantId: 'tenant-harish-dairy',
      name: fullName,
      mobile,
      whatsapp: mobile,
      email,
      houseNo,
      street: `Street No ${((i * 3) % 15) + 1}`,
      area,
      landmark: i % 2 === 0 ? 'Near Community Park' : 'Opposite Heritage Supermarket',
      deliveryInstructions: i % 3 === 0 ? 'Leave in the doorstep milk bag' : 'Ring bell once gently before 6:30 AM',
      assignedRouteId: routeId,
      assignedEmployeeId: empId,
      milkType,
      dailyQuantity,
      pricePerLitre,
      subscriptionStartDate: '2025-01-01',
      billingDueDate: 5,
      status,
      outstandingBalance,
      weekdayQuantities: {
        0: dailyQuantity + (i % 4 === 0 ? 0.5 : 0), // extra on Sunday
        1: dailyQuantity,
        2: dailyQuantity,
        3: dailyQuantity,
        4: dailyQuantity,
        5: dailyQuantity,
        6: dailyQuantity,
      },
    });
  }

  return customers;
}

export function generateSeedDeliveries(customers: Customer[], routes: Route[]): Delivery[] {
  const deliveries: Delivery[] = [];
  const today = '2026-10-10';

  customers.forEach((cust, idx) => {
    const route = routes.find(r => r.id === cust.assignedRouteId) || routes[0];
    const isPaused = cust.status === 'paused';
    const isInactive = cust.status === 'inactive';

    let status: Delivery['status'] = 'Delivered';
    let actualMilkQty = cust.dailyQuantity;
    let exceptionReason: string | undefined = undefined;

    if (isInactive) {
      status = 'Not required';
      actualMilkQty = 0;
    } else if (isPaused) {
      status = 'Cancelled';
      actualMilkQty = 0;
      exceptionReason = 'Customer subscription paused';
    } else if (idx % 35 === 0) {
      status = 'Missed';
      actualMilkQty = 0;
      exceptionReason = idx % 2 === 0 ? 'Door Locked & Gate Closed' : 'Customer requested skip via call';
    } else if (idx % 45 === 0) {
      status = 'Partially delivered';
      actualMilkQty = Math.max(0.5, cust.dailyQuantity - 0.5);
      exceptionReason = 'Customer requested only 0.5L today';
    } else if (idx % 12 === 0 && idx > 450) {
      status = 'Scheduled'; // Few pending at tail end
    }

    const additionalProducts: Delivery['additionalProducts'] = [];
    if (idx % 15 === 0 && status === 'Delivered') {
      additionalProducts.push({
        productId: 'PROD-03',
        productName: 'Artisanal Malai Paneer (200g)',
        unit: '200g',
        plannedQty: 1,
        actualQty: 1,
        unitPrice: 110,
      });
    } else if (idx % 22 === 0 && status === 'Delivered') {
      additionalProducts.push({
        productId: 'PROD-04',
        productName: 'Farmhouse Set Curd / Dahi (500g)',
        unit: '500g',
        plannedQty: 2,
        actualQty: 2,
        unitPrice: 50,
      });
    }

    deliveries.push({
      id: `DEL-20261010-${(1000 + idx).toString().slice(-4)}`,
      tenantId: cust.tenantId || 'tenant-harish-dairy',
      date: today,
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      routeId: cust.assignedRouteId,
      routeName: route.name,
      employeeId: cust.assignedEmployeeId,
      employeeName: cust.assignedEmployeeId === 'EMP-01' ? 'Ramesh Naidu' : cust.assignedEmployeeId === 'EMP-02' ? 'Suresh Kumar Goud' : 'Delivery Staff',
      milkType: cust.milkType,
      plannedMilkQuantity: cust.dailyQuantity,
      actualMilkQuantity: actualMilkQty,
      pricePerLitre: cust.pricePerLitre,
      additionalProducts,
      status,
      exceptionReason,
      deliveryNotes: cust.deliveryInstructions,
      collectedAmount: idx % 28 === 0 && status === 'Delivered' ? 1800 : undefined,
      collectedPaymentMethod: idx % 28 === 0 ? 'Cash' : undefined,
    });
  });

  return deliveries;
}

export const initialMilkPurchases: MilkPurchase[] = [
  {
    id: 'PUR-20261010-01',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-10',
    vendorId: 'VEND-01',
    vendorName: 'Krishna Valley Dairy Farm',
    supplierInvoiceNo: 'KVDF-8812',
    milkType: 'Cow Milk',
    quantityPurchased: 450,
    acceptedQuantity: 440,
    rejectedQuantity: 10,
    purchaseRatePerLitre: 42,
    additionalCharges: 150,
    purchaseTotal: 18630, // 440 * 42 + 150
    amountPaid: 15000,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Completed',
    notes: 'Morning shift batch A. 10L rejected due to temperature deviation.',
  },
  {
    id: 'PUR-20261010-02',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-10',
    vendorId: 'VEND-02',
    vendorName: 'Godavari Pastures & Cattle Co',
    supplierInvoiceNo: 'GP-4019',
    milkType: 'Buffalo Milk',
    quantityPurchased: 320,
    acceptedQuantity: 320,
    rejectedQuantity: 0,
    purchaseRatePerLitre: 50,
    additionalCharges: 0,
    purchaseTotal: 16000,
    amountPaid: 16000,
    paymentMethod: 'UPI',
    paymentStatus: 'Completed',
    notes: 'Evening fresh procurement. 7.9% fat tested and approved.',
  },
  {
    id: 'PUR-20261009-01',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-09',
    vendorId: 'VEND-01',
    vendorName: 'Krishna Valley Dairy Farm',
    supplierInvoiceNo: 'KVDF-8790',
    milkType: 'Cow Milk',
    quantityPurchased: 460,
    acceptedQuantity: 460,
    rejectedQuantity: 0,
    purchaseRatePerLitre: 42,
    additionalCharges: 100,
    purchaseTotal: 19420,
    amountPaid: 19420,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Completed',
    notes: 'Standard morning procurement.',
  },
  {
    id: 'PUR-20261009-02',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-09',
    vendorId: 'VEND-02',
    vendorName: 'Godavari Pastures & Cattle Co',
    supplierInvoiceNo: 'GP-3982',
    milkType: 'Buffalo Milk',
    quantityPurchased: 310,
    acceptedQuantity: 305,
    rejectedQuantity: 5,
    purchaseRatePerLitre: 50,
    additionalCharges: 50,
    purchaseTotal: 15300,
    amountPaid: 15000,
    paymentMethod: 'Bank Transfer',
    paymentStatus: 'Completed',
    notes: 'Fat content 7.6%.',
  },
];

export const initialVendorPayments: VendorPayment[] = [
  {
    id: 'VP-101',
    tenantId: 'tenant-harish-dairy',
    vendorId: 'VEND-01',
    vendorName: 'Krishna Valley Dairy Farm',
    date: '2026-10-05',
    amount: 100000,
    paymentMethod: 'Bank Transfer',
    referenceNo: 'HDFC9823412',
    notes: 'Weekly procurement payout for week 1.',
  },
  {
    id: 'VP-102',
    tenantId: 'tenant-harish-dairy',
    vendorId: 'VEND-02',
    vendorName: 'Godavari Pastures & Cattle Co',
    date: '2026-10-04',
    amount: 75000,
    paymentMethod: 'Bank Transfer',
    referenceNo: 'ICIC8812349',
    notes: 'Fortnightly settlement part payment.',
  },
];

export const initialPauseRequests: PauseRequest[] = [
  {
    id: 'PAUSE-01',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1025',
    customerName: 'Srinivas Rao',
    routeId: 'ROUTE-1',
    startDate: '2026-10-12',
    endDate: '2026-10-16',
    reason: 'Out of station for family wedding',
    requestDate: '2026-10-09',
    status: 'Approved',
    adminNotes: 'Deliveries to resume automatically on Oct 17th.',
  },
  {
    id: 'PAUSE-02',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1048',
    customerName: 'Priya Sharma',
    routeId: 'ROUTE-2',
    startDate: '2026-10-14',
    endDate: '2026-10-18',
    reason: 'Vacation travel to Vizag',
    requestDate: '2026-10-10',
    status: 'Pending',
  },
  {
    id: 'PAUSE-03',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1001', // Demo customer
    customerName: 'Rajesh Reddy',
    routeId: 'ROUTE-1',
    startDate: '2026-10-25',
    endDate: '2026-10-28',
    reason: 'Diwali long weekend out of town',
    requestDate: '2026-10-10',
    status: 'Approved',
    adminNotes: 'Confirmed by admin.',
  },
];

export const initialProductOrders: ProductOrder[] = [
  {
    id: 'ORD-1001',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1001',
    customerName: 'Rajesh Reddy',
    customerMobile: '+91 98490 10017',
    routeId: 'ROUTE-1',
    orderDate: '2026-10-10',
    requestedDeliveryDate: '2026-10-11',
    items: [
      {
        productId: 'PROD-03',
        productName: 'Artisanal Malai Paneer (200g)',
        unitPrice: 110,
        quantity: 2,
        unit: '200g',
      },
      {
        productId: 'PROD-05',
        productName: 'Traditional Desi Ghee (500ml)',
        unitPrice: 680,
        quantity: 1,
        unit: '500ml',
      },
    ],
    totalAmount: 900,
    status: 'Confirmed',
    deliveryInstructions: 'Deliver along with morning cow milk.',
    notes: 'Charge to monthly ledger bill.',
  },
  {
    id: 'ORD-1002',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1014',
    customerName: 'Kavitha Naidu',
    customerMobile: '+91 98490 10238',
    routeId: 'ROUTE-2',
    orderDate: '2026-10-09',
    requestedDeliveryDate: '2026-10-10',
    items: [
      {
        productId: 'PROD-04',
        productName: 'Farmhouse Set Curd / Dahi (500g)',
        unitPrice: 50,
        quantity: 2,
        unit: '500g',
      },
    ],
    totalAmount: 100,
    status: 'Delivered',
    deliveryInstructions: 'Call upon arrival.',
  },
];

export const initialStockTransactions: StockTransaction[] = [
  {
    id: 'STK-01',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-10',
    type: 'Purchase Receipt',
    milkTypeOrProduct: 'Cow Milk',
    quantity: 440,
    unit: 'Litres',
    sourceOrDestination: 'Vendor: Krishna Valley Dairy Farm',
    responsibleUser: 'Admin (Operations)',
    notes: 'Procured and pasteurized into Tank 1.',
  },
  {
    id: 'STK-02',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-10',
    type: 'Purchase Receipt',
    milkTypeOrProduct: 'Buffalo Milk',
    quantity: 320,
    unit: 'Litres',
    sourceOrDestination: 'Vendor: Godavari Pastures & Cattle Co',
    responsibleUser: 'Admin (Operations)',
    notes: 'Evening procurement into Tank 2.',
  },
  {
    id: 'STK-03',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-10',
    type: 'Route Allocation',
    milkTypeOrProduct: 'Cow Milk',
    quantity: -380,
    unit: 'Litres',
    sourceOrDestination: 'Routes 1 to 5 Morning Distribution',
    responsibleUser: 'Ramesh Naidu (Fleet Manager)',
    notes: 'Dispatched to route delivery crates.',
  },
  {
    id: 'STK-04',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-10',
    type: 'Route Allocation',
    milkTypeOrProduct: 'Buffalo Milk',
    quantity: -305,
    unit: 'Litres',
    sourceOrDestination: 'Routes 1 to 5 Morning Distribution',
    responsibleUser: 'Ramesh Naidu (Fleet Manager)',
    notes: 'Dispatched to route delivery crates.',
  },
  {
    id: 'STK-05',
    tenantId: 'tenant-harish-dairy',
    date: '2026-10-10',
    type: 'Wastage',
    milkTypeOrProduct: 'Cow Milk',
    quantity: -4,
    unit: 'Litres',
    sourceOrDestination: 'Packaging Leakage at Bottling Plant',
    responsibleUser: 'Admin',
    notes: 'Seal defect during pouch packing.',
  },
];

export function generateSeedInvoices(customers: Customer[]): Invoice[] {
  const invoices: Invoice[] = [];

  // Generate for September 2026 (previous month finalized/paid/overdue) and October 2026 (current month draft/live)
  customers.forEach((cust, i) => {
    // September invoice (Finalized / Paid / Overdue)
    const sepMilkCharge = cust.dailyQuantity * cust.pricePerLitre * 30;
    const sepProdCharge = i % 3 === 0 ? 320 : i % 5 === 0 ? 680 : 0;
    const sepTotal = sepMilkCharge + sepProdCharge;
    const isPaid = i % 3 !== 0;
    const payments = isPaid ? sepTotal : i % 2 === 0 ? Math.round(sepTotal / 2) : 0;
    const balance = sepTotal - payments;
    const status = isPaid ? 'Paid' : payments > 0 ? 'Partially Paid' : 'Overdue';

    invoices.push({
      id: `INV-202609-${1000 + i}`,
      invoiceNumber: `HAR-202609-${(1000 + i).toString().slice(-4)}`,
      tenantId: cust.tenantId || 'tenant-harish-dairy',
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerAddress: `${cust.houseNo}, ${cust.street}, ${cust.area}`,
      routeId: cust.assignedRouteId,
      month: '2026-09',
      monthLabel: 'September 2026',
      milkCharges: sepMilkCharge,
      productCharges: sepProdCharge,
      previousBalance: 0,
      adjustments: 0,
      paymentsApplied: payments,
      totalPayable: sepTotal,
      balanceRemaining: balance,
      status,
      generatedDate: '2026-10-01',
      dueDate: '2026-10-07',
      items: [
        {
          date: '2026-09-01 to 2026-09-30',
          description: `${cust.milkType} Daily Delivery (${cust.dailyQuantity} L/day x 30 days)`,
          quantity: cust.dailyQuantity * 30,
          unit: 'Litres',
          rate: cust.pricePerLitre,
          amount: sepMilkCharge,
          type: 'milk',
        },
        ...(sepProdCharge > 0
          ? [
              {
                date: '2026-09-15',
                description: 'Additional Dairy Products (Curd / Paneer / Ghee)',
                quantity: 1,
                unit: 'Pack',
                rate: sepProdCharge,
                amount: sepProdCharge,
                type: 'product' as const,
              },
            ]
          : []),
      ],
      notes: 'Payment due on or before 7th of October 2026.',
    });

    // October 2026 Draft Invoice (MTD - 10 days of October)
    const octMilkCharge = cust.dailyQuantity * cust.pricePerLitre * 10;
    const octProdCharge = i === 0 ? 900 : i % 7 === 0 ? 110 : 0;
    const octPrevBal = balance;
    const octTotal = octMilkCharge + octProdCharge + octPrevBal;

    invoices.push({
      id: `INV-202610-${1000 + i}`,
      invoiceNumber: `HAR-202610-${(1000 + i).toString().slice(-4)}`,
      tenantId: cust.tenantId || 'tenant-harish-dairy',
      customerId: cust.id,
      customerName: cust.name,
      customerMobile: cust.mobile,
      customerAddress: `${cust.houseNo}, ${cust.street}, ${cust.area}`,
      routeId: cust.assignedRouteId,
      month: '2026-10',
      monthLabel: 'October 2026 (Live Month-to-Date)',
      milkCharges: octMilkCharge,
      productCharges: octProdCharge,
      previousBalance: octPrevBal,
      adjustments: 0,
      paymentsApplied: 0,
      totalPayable: octTotal,
      balanceRemaining: octTotal,
      status: 'Draft',
      generatedDate: '2026-10-10',
      dueDate: '2026-11-07',
      items: [
        {
          date: '2026-10-01 to 2026-10-10',
          description: `${cust.milkType} Delivered MTD (${cust.dailyQuantity} L/day x 10 days)`,
          quantity: cust.dailyQuantity * 10,
          unit: 'Litres',
          rate: cust.pricePerLitre,
          amount: octMilkCharge,
          type: 'milk',
        },
        ...(octProdCharge > 0
          ? [
              {
                date: '2026-10-10',
                description: 'Dairy Store Product Orders',
                quantity: 1,
                unit: 'Pack',
                rate: octProdCharge,
                amount: octProdCharge,
                type: 'product' as const,
              },
            ]
          : []),
      ],
      notes: 'Active draft invoice calculating continuously till month-end.',
    });
  });

  return invoices;
}

export const initialCustomerPayments: CustomerPayment[] = [
  {
    id: 'PAY-101',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1001',
    customerName: 'Rajesh Reddy',
    date: '2026-10-03',
    amount: 1800,
    paymentMethod: 'UPI',
    referenceNo: 'UPI/2026/893182',
    invoiceId: 'INV-202609-1000',
    recordedBy: 'Admin (Online Portal)',
    notes: 'Paid via GPay simulated payment.',
  },
  {
    id: 'PAY-102',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1002',
    customerName: 'Suresh Rao',
    date: '2026-10-04',
    amount: 2250,
    paymentMethod: 'Cash',
    referenceNo: 'CASH-REC-491',
    invoiceId: 'INV-202609-1001',
    recordedBy: 'Suresh Kumar Goud (Delivery Staff)',
    notes: 'Handed over cash on morning route.',
  },
  {
    id: 'PAY-103',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1005',
    customerName: 'Venkat Naidu',
    date: '2026-10-05',
    amount: 1800,
    paymentMethod: 'Bank Transfer',
    referenceNo: 'NEFT-SBIN0029',
    invoiceId: 'INV-202609-1004',
    recordedBy: 'Admin',
    notes: 'Bank transfer credit verified.',
  },
];

export function generateCustomerLedger(customerId: string): CustomerLedgerEntry[] {
  return [
    {
      id: 'LED-01',
      tenantId: 'tenant-harish-dairy',
      customerId,
      date: '2026-09-01',
      description: 'Opening Balance for September 2026',
      debit: 0,
      credit: 0,
      runningBalance: 0,
      reference: 'OB-SEP',
      type: 'opening_balance',
    },
    {
      id: 'LED-02',
      tenantId: 'tenant-harish-dairy',
      customerId,
      date: '2026-09-30',
      description: 'Monthly Milk Deliveries (30 Litres)',
      debit: 1800,
      credit: 0,
      runningBalance: 1800,
      reference: 'HAR-202609-1000',
      type: 'milk_delivery',
    },
    {
      id: 'LED-03',
      tenantId: 'tenant-harish-dairy',
      customerId,
      date: '2026-10-03',
      description: 'UPI Payment Received for September Bill',
      debit: 0,
      credit: 1800,
      runningBalance: 0,
      reference: 'UPI/2026/893182',
      type: 'payment_received',
    },
    {
      id: 'LED-04',
      tenantId: 'tenant-harish-dairy',
      customerId,
      date: '2026-10-10',
      description: 'Milk Deliveries MTD (10 Litres x ₹60)',
      debit: 600,
      credit: 0,
      runningBalance: 600,
      reference: 'DEL-OCT-MTD',
      type: 'milk_delivery',
    },
    {
      id: 'LED-05',
      tenantId: 'tenant-harish-dairy',
      customerId,
      date: '2026-10-10',
      description: 'Product Order: Paneer & Desi Ghee',
      debit: 900,
      credit: 0,
      runningBalance: 1500,
      reference: 'ORD-1001',
      type: 'product_delivery',
    },
  ];
}

export const initialNotificationLogs: NotificationLog[] = [
  {
    id: 'NOTIF-01',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1001',
    customerName: 'Rajesh Reddy',
    mobile: '+91 98490 10017',
    whatsapp: '+91 98490 10017',
    invoiceId: 'INV-202609-1000',
    invoiceNumber: 'HAR-202609-1000',
    billingMonth: 'September 2026',
    amountDue: 1800,
    messageContent:
      'Hello Rajesh Reddy, your milk and dairy product bill for September 2026 is ready.\nMilk charges: ₹1,800\nProduct charges: ₹0\nPrevious balance: ₹0\nPayments applied: ₹1,800\nAmount payable: ₹0\nThank you for choosing Harish Dairy!',
    sentAt: '2026-10-01 09:15 AM',
    status: 'Delivered',
    isSimulated: true,
  },
  {
    id: 'NOTIF-02',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1003',
    customerName: 'Priya Sharma',
    mobile: '+91 98490 10051',
    whatsapp: '+91 98490 10051',
    invoiceId: 'INV-202609-1002',
    invoiceNumber: 'HAR-202609-1002',
    billingMonth: 'September 2026',
    amountDue: 2250,
    messageContent:
      'Hello Priya Sharma, your milk and dairy product bill for September 2026 is ready.\nMilk charges: ₹2,250\nAmount payable: ₹2,250\nDue date: 07-Oct-2026.\nThank you for choosing Harish Dairy!',
    sentAt: '2026-10-01 09:16 AM',
    status: 'Sent',
    isSimulated: true,
  },
  {
    id: 'NOTIF-03',
    tenantId: 'tenant-harish-dairy',
    customerId: 'CUST-1007',
    customerName: 'Srinivas Goud',
    mobile: '+91 98490 10119',
    whatsapp: '',
    invoiceId: 'INV-202609-1006',
    invoiceNumber: 'HAR-202609-1006',
    billingMonth: 'September 2026',
    amountDue: 1800,
    messageContent: 'Simulated WhatsApp message pending.',
    sentAt: '2026-10-01 09:18 AM',
    status: 'Failed',
    isSimulated: true,
    notes: 'Missing WhatsApp number.',
  },
];
