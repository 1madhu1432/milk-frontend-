export type UserRole = 'super_admin' | 'admin' | 'employee' | 'customer';

export interface UserSession {
  role: UserRole;
  email: string;
  name: string;
  id?: string; // employeeId or customerId
  tenantId?: string; // multi-tenant business id
}

export interface Customer {
  id: string; // e.g. CUST-1001
  tenantId: string;
  userId?: string;
  code?: string;
  name: string;
  mobile: string;
  whatsapp: string;
  email: string;
  houseNo: string;
  street: string;
  area: string;
  landmark: string;
  deliveryInstructions: string;
  assignedRouteId: string;
  assignedEmployeeId: string;
  milkType: 'Cow Milk' | 'Buffalo Milk';
  dailyQuantity: number; // in Litres
  pricePerLitre: number;
  subscriptionStartDate: string;
  billingDueDate: number; // day of month (e.g. 5)
  status: 'active' | 'paused' | 'inactive';
  outstandingBalance: number;
  weekdayQuantities?: { [day: number]: number }; // 0 = Sun, 1 = Mon...
}

export interface Employee {
  id: string; // e.g. EMP-01
  tenantId: string;
  name: string;
  phone: string;
  email: string;
  assignedRouteIds: string[];
  joiningDate: string;
  status: 'active' | 'inactive';
  dailyDeliveriesCompleted: number;
  missedDeliveries: number;
  collectionsRecorded: number;
}

export interface Route {
  id: string; // e.g. ROUTE-1
  tenantId: string;
  name: string;
  area: string;
  assignedEmployeeIds: string[];
  assignedCustomerCount: number;
  totalMilkRequired: number; // litres
  totalAdditionalProducts: number;
  completedDeliveries: number;
  pendingDeliveries: number;
  missedDeliveries: number;
  completionPercentage: number;
}

export interface Vendor {
  id: string; // e.g. VEND-01
  tenantId: string;
  name: string;
  contactNumber: string;
  address: string;
  milkTypesSupplied: string[];
  defaultPurchaseRate: number;
  paymentTerms: string;
  openingBalance: number;
  totalMilkPurchased: number; // Litres
  totalPurchaseValue: number;
  totalAmountPaid: number;
  purchaseReturns: number;
  outstandingBalance: number;
  status: 'active' | 'inactive';
  notes: string;
}

export interface MilkPurchase {
  id: string; // e.g. PUR-2026-001
  tenantId: string;
  date: string;
  vendorId: string;
  vendorName: string;
  supplierInvoiceNo: string;
  milkType: 'Cow Milk' | 'Buffalo Milk';
  quantityPurchased: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  purchaseRatePerLitre: number;
  additionalCharges: number;
  purchaseTotal: number;
  amountPaid: number;
  paymentMethod: string;
  paymentStatus: 'Draft' | 'Received' | 'Partially accepted' | 'Completed' | 'Cancelled';
  notes: string;
}

export interface VendorPayment {
  id: string;
  tenantId: string;
  vendorId: string;
  vendorName: string;
  date: string;
  amount: number;
  paymentMethod: 'Bank Transfer' | 'Cash' | 'UPI' | 'Cheque';
  referenceNo: string;
  notes: string;
}

export interface Product {
  id: string; // PROD-01
  tenantId: string;
  name: string;
  category: 'Fresh Milk' | 'Dairy Essentials' | 'Traditional Sweets' | 'Cultured' | 'Beverages';
  description: string;
  image: string;
  unitOrPackageSize: string; // e.g. '500 ml', '1 kg', '200 g'
  purchaseCost: number;
  sellingPrice: number;
  availableStock: number;
  minimumStock: number;
  isRecurringEligible: boolean;
  status: 'active' | 'inactive';
}

export interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  deliveredQuantity?: number;
}

export interface ProductOrder {
  id: string; // ORD-1001
  tenantId: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  routeId: string;
  orderDate: string;
  requestedDeliveryDate: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'Pending' | 'Confirmed' | 'Scheduled' | 'Partially delivered' | 'Delivered' | 'Cancelled';
  deliveryInstructions: string;
  notes?: string;
}

export interface PauseRequest {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  routeId: string;
  startDate: string;
  endDate: string;
  reason: string;
  requestDate: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Completed';
  adminNotes?: string;
}

export interface DeliveryProductItem {
  productId: string;
  productName: string;
  unit: string;
  plannedQty: number;
  actualQty: number;
  unitPrice: number;
}

export interface Delivery {
  id: string; // DEL-2026-10-10-001
  tenantId: string;
  date: string;
  customerId: string;
  customerName: string;
  customerMobile: string;
  routeId: string;
  routeName: string;
  employeeId: string;
  employeeName: string;
  milkType: 'Cow Milk' | 'Buffalo Milk';
  plannedMilkQuantity: number;
  actualMilkQuantity: number;
  pricePerLitre: number;
  additionalProducts: DeliveryProductItem[];
  status: 'Scheduled' | 'Delivered' | 'Partially delivered' | 'Missed' | 'Not required' | 'Cancelled';
  exceptionReason?: string;
  deliveryNotes?: string;
  collectedAmount?: number;
  collectedPaymentMethod?: 'Cash' | 'UPI';
}

export interface StockTransaction {
  id: string;
  tenantId: string;
  date: string;
  type: 'Purchase Receipt' | 'Route Allocation' | 'Delivered' | 'Wastage' | 'Return' | 'Adjustment' | 'Production Use';
  milkTypeOrProduct: string; // 'Cow Milk', 'Buffalo Milk', 'Paneer 200g', etc.
  quantity: number; // positive for addition, negative for reduction
  unit: string;
  sourceOrDestination: string;
  relatedId?: string;
  responsibleUser: string;
  notes: string;
}

export interface InvoiceItem {
  date: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number;
  amount: number;
  type: 'milk' | 'product' | 'adjustment' | 'credit';
}

export interface Invoice {
  id: string;
  tenantId: string;
  invoiceNumber: string; // e.g. DD-202610-001
  customerId: string;
  customerName: string;
  customerMobile: string;
  customerAddress: string;
  routeId: string;
  month: string; // '2026-10'
  monthLabel: string; // 'October 2026'
  milkCharges: number;
  productCharges: number;
  previousBalance: number;
  adjustments: number;
  paymentsApplied: number;
  totalPayable: number;
  balanceRemaining: number;
  status: 'Draft' | 'Finalized' | 'Partially Paid' | 'Paid' | 'Overdue' | 'Voided';
  generatedDate: string;
  dueDate: string;
  items: InvoiceItem[];
  notes?: string;
}

export interface CustomerPayment {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  date: string;
  amount: number;
  paymentMethod: 'Cash' | 'UPI' | 'Bank Transfer' | 'Simulated Online' | 'Payment Gateway (Online)' | string;
  referenceNo: string;
  invoiceId?: string;
  recordedBy: string;
  notes?: string;
}

export interface CustomerLedgerEntry {
  id: string;
  tenantId: string;
  customerId: string;
  date: string;
  description: string;
  debit: number; // charges increases balance
  credit: number; // payments reduce balance
  runningBalance: number;
  reference: string;
  type: 'milk_delivery' | 'product_delivery' | 'payment_received' | 'adjustment' | 'opening_balance';
}

export interface NotificationLog {
  id: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  mobile: string;
  whatsapp: string;
  invoiceId: string;
  invoiceNumber: string;
  billingMonth: string;
  amountDue: number;
  messageContent: string;
  sentAt: string;
  status: 'Sent' | 'Delivered' | 'Failed' | 'Pending';
  isSimulated: boolean;
  notes?: string;
}

export interface BusinessSettings {
  tenantId: string;
  dairyName: string;
  tagline: string;
  address: string;
  contactNumber: string;
  email: string;
  gstNumber: string;
  billingPeriod: string;
  invoiceGenerationDay: number;
  paymentDueDate: number;
  deliveryCutoffTime: string;
  pauseCutoffTime: string;
  invoicePrefix: string;
  currency: string;
  decimalPrecision: number;
  defaultCowMilkRate: number;
  defaultBuffaloMilkRate: number;
  notificationTemplate: string;
}

export * from './integrations';
export * from './tenant';
