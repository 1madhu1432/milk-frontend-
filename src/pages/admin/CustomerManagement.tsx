import React, { useState, useMemo } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { Customer } from '../../models/types';
import { Badge } from '../../components/common/Badge';
import { Modal } from '../../components/common/Modal';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { exportToCSV, parseCSV } from '../../utils/csv';
import {
  Search,
  Plus,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Filter,
  Check,
  User,
  Calendar,
  CreditCard,
  Truck,
  Receipt,
  FileText,
  Share2,
  Copy,
  ExternalLink,
  MessageSquare,
  Users,
} from 'lucide-react';

export const CustomerManagement: React.FC = () => {
  const {
    settings,
    customers,
    routes,
    employees,
    addCustomer,
    updateCustomer,
    toggleCustomerStatus,
    deleteCustomer,
    importCustomers,
    invoices,
    deliveries,
    productOrders,
    customerPayments,
    getCustomerLedger,
  } = useDairy();

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoute, setSelectedRoute] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 20;

  // Sorting
  const [sortField, setSortField] = useState<keyof Customer>('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [viewingCustomer, setViewingCustomer] = useState<Customer | null>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'subscription' | 'deliveries' | 'orders' | 'invoices' | 'ledger'>('overview');

  // Customer Portal Share Link State
  const [copiedCustomerPortal, setCopiedCustomerPortal] = useState(false);
  const customerPortalUrl = typeof window !== 'undefined' ? `${window.location.origin}/login/customer` : '';

  const handleCopyCustomerPortal = () => {
    navigator.clipboard.writeText(customerPortalUrl);
    setCopiedCustomerPortal(true);
    setTimeout(() => setCopiedCustomerPortal(false), 2500);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Customer>>({
    name: '',
    mobile: '',
    whatsapp: '',
    email: '',
    houseNo: '',
    street: '',
    area: '',
    landmark: '',
    deliveryInstructions: '',
    assignedRouteId: 'ROUTE-1',
    assignedEmployeeId: 'EMP-01',
    milkType: 'Cow Milk',
    dailyQuantity: 1.0,
    pricePerLitre: 60,
    subscriptionStartDate: '2026-10-10',
    billingDueDate: 5,
    status: 'active',
    outstandingBalance: 0,
  });

  // Filtered & Sorted list
  const filteredCustomers = useMemo(() => {
    return customers.filter(c => {
      const matchesSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.mobile.includes(searchTerm) ||
        c.area.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRoute = selectedRoute === 'ALL' || c.assignedRouteId === selectedRoute;
      const matchesStatus = selectedStatus === 'ALL' || c.status === selectedStatus;
      return matchesSearch && matchesRoute && matchesStatus;
    });
  }, [customers, searchTerm, selectedRoute, selectedStatus]);

  const sortedCustomers = useMemo(() => {
    return [...filteredCustomers].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      if (typeof aVal === 'string') {
        return sortOrder === 'asc'
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      }
      if (typeof aVal === 'number') {
        return sortOrder === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
      return 0;
    });
  }, [filteredCustomers, sortField, sortOrder]);

  const totalPages = Math.ceil(sortedCustomers.length / pageSize) || 1;
  const paginatedCustomers = sortedCustomers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const handleOpenAdd = () => {
    setFormData({
      name: '',
      mobile: '+91 98490 ',
      whatsapp: '+91 98490 ',
      email: '',
      houseNo: 'Plot ',
      street: 'Street No 1',
      area: 'Banjara Hills',
      landmark: '',
      deliveryInstructions: 'Ring bell gently',
      assignedRouteId: 'ROUTE-1',
      assignedEmployeeId: 'EMP-01',
      milkType: 'Cow Milk',
      dailyQuantity: 1.0,
      pricePerLitre: 60,
      subscriptionStartDate: new Date().toISOString().slice(0, 10),
      billingDueDate: 5,
      status: 'active',
      outstandingBalance: 0,
    });
    setEditingCustomer(null);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (cust: Customer) => {
    setFormData(cust);
    setEditingCustomer(cust);
    setIsAddModalOpen(true);
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.mobile) {
      alert('Please provide name and mobile number.');
      return;
    }

    if (editingCustomer) {
      updateCustomer(editingCustomer.id, formData);
      alert('Customer updated successfully!');
    } else {
      const newId = addCustomer(formData as Omit<Customer, 'id'>);
      alert(`Customer created successfully with ID: ${newId}`);
    }
    setIsAddModalOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(customers, 'Harish_Dairy_Customers_List', [
      { key: 'id', label: 'Customer ID' },
      { key: 'name', label: 'Customer Name' },
      { key: 'mobile', label: 'Mobile' },
      { key: 'area', label: 'Area' },
      { key: 'assignedRouteId', label: 'Route ID' },
      { key: 'milkType', label: 'Milk Type' },
      { key: 'dailyQuantity', label: 'Daily Quantity (L)' },
      { key: 'pricePerLitre', label: 'Rate/Litre' },
      { key: 'outstandingBalance', label: 'Outstanding Balance' },
      { key: 'status', label: 'Status' },
    ]);
  };

  const handleImportCSV = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const text = evt.target?.result as string;
      if (text) {
        const rows = parseCSV(text);
        if (rows.length > 0) {
          const imported: Customer[] = rows.map((r, i) => ({
            id: r['Customer ID'] || `CUST-IMP-${1000 + i}`,
            tenantId: settings.tenantId || 'tenant-harish-dairy',
            name: r['Customer Name'] || 'Imported Customer',
            mobile: r['Mobile'] || '+91 98490 00000',
            whatsapp: r['Mobile'] || '+91 98490 00000',
            email: `${r['Customer Name']?.replace(/\s+/g, '').toLowerCase() || 'user'}@dairy.demo`,
            houseNo: 'House 1',
            street: 'Main Street',
            area: r['Area'] || 'Hyderabad',
            landmark: '',
            deliveryInstructions: '',
            assignedRouteId: r['Route ID'] || 'ROUTE-1',
            assignedEmployeeId: 'EMP-01',
            milkType: (r['Milk Type'] as any) || 'Cow Milk',
            dailyQuantity: parseFloat(r['Daily Quantity (L)'] || '1.0'),
            pricePerLitre: parseFloat(r['Rate/Litre'] || '60'),
            subscriptionStartDate: '2026-10-10',
            billingDueDate: 5,
            status: (r['Status'] as any) || 'active',
            outstandingBalance: parseFloat(r['Outstanding Balance'] || '0'),
          }));
          importCustomers(imported);
          alert(`Successfully imported ${imported.length} customer records.`);
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Customer Directory
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              {customers.length} Registered
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage daily home delivery subscriptions, route assignments, and billing ledgers
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <label className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg cursor-pointer transition-colors border border-slate-200">
            <Upload className="w-3.5 h-3.5 text-slate-600" />
            <span>Import CSV</span>
            <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
          </label>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Customer Web Portal Share Card for Admin */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-sm border border-blue-800/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-200 text-lg shrink-0">
            🥛
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
                Customer Web Portal Link
              </h3>
              <span className="text-[10px] bg-blue-400/20 text-blue-200 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold uppercase">
                Share With Households
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 mt-0.5">
              Give this website link to customers so they can view daily calendars, pause deliveries, and pay bills.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 sm:w-80">
            <input
              type="text"
              readOnly
              value={customerPortalUrl}
              className="w-full text-xs font-mono bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white placeholder-blue-300 focus:outline-none select-all"
            />
          </div>
          <button
            onClick={handleCopyCustomerPortal}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
          >
            {copiedCustomerPortal ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
          <a
            href={`https://wa.me/?text=${encodeURIComponent(
              `Hello! Here is your Dairy Milk Portal link to manage daily deliveries, pause vacation days, and view monthly bills: ${customerPortalUrl}`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition-all shadow-xs shrink-0"
            title="Broadcast portal link on WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </a>
          <a
            href={customerPortalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-2.5 py-2 bg-white/10 hover:bg-white/20 text-blue-100 text-xs font-bold rounded-xl border border-white/20 transition-all shrink-0"
            title="Open Customer Portal in new tab"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, ID, phone, area..."
            value={searchTerm}
            onChange={e => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#16803D] bg-slate-50/50"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Route filter */}
          <select
            value={selectedRoute}
            onChange={e => {
              setSelectedRoute(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Routes (1-5)</option>
            {routes.map(r => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={e => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2 text-xs rounded-lg border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="active">Active</option>
            <option value="paused">Paused</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Customer Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th
                  onClick={() => handleSort('id')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900"
                >
                  Customer ID {sortField === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th
                  onClick={() => handleSort('name')}
                  className="px-4 py-3 cursor-pointer hover:text-slate-900"
                >
                  Customer Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3">Mobile & WhatsApp</th>
                <th className="px-4 py-3">Area / Locality</th>
                <th className="px-4 py-3">Route</th>
                <th className="px-4 py-3 text-center">Daily Milk</th>
                <th className="px-4 py-3 text-right">Est. Monthly</th>
                <th
                  onClick={() => handleSort('outstandingBalance')}
                  className="px-4 py-3 text-right cursor-pointer hover:text-slate-900"
                >
                  Outstanding {sortField === 'outstandingBalance' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedCustomers.map(cust => {
                const route = routes.find(r => r.id === cust.assignedRouteId);
                const estMonthly = cust.dailyQuantity * cust.pricePerLitre * 30;

                return (
                  <tr key={cust.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">
                      {cust.id}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-[#17211B]">{cust.name}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[140px]">
                        {cust.houseNo}, {cust.street}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 font-medium whitespace-nowrap">
                      {cust.mobile}
                    </td>
                    <td className="px-4 py-3 text-slate-600 truncate max-w-[150px]">
                      {cust.area}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium">
                        {route ? route.name.split(' - ')[0] : cust.assignedRouteId}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <span className="font-bold text-[#14532D]">
                        {cust.dailyQuantity} L
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {cust.milkType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-700">
                      {formatCurrency(estMonthly)}
                    </td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      <span
                        className={
                          cust.outstandingBalance > 0
                            ? 'text-amber-700'
                            : 'text-emerald-700'
                        }
                      >
                        {formatCurrency(cust.outstandingBalance)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      <Badge
                        variant={
                          cust.status === 'active'
                            ? 'green'
                            : cust.status === 'paused'
                            ? 'amber'
                            : 'red'
                        }
                      >
                        {cust.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <a
                          href={`https://wa.me/${(cust.whatsapp || cust.mobile).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                            `Hello ${cust.name}! Here is your Daily Milk Portal link to check deliveries, vacations & bills: ${customerPortalUrl}`
                          )}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                          title={`Send portal link to ${cust.name} on WhatsApp`}
                        >
                          <MessageSquare className="w-4 h-4 text-emerald-600" />
                        </a>
                        <button
                          onClick={() => {
                            setViewingCustomer(cust);
                            setProfileTab('overview');
                          }}
                          className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-md"
                          title="View Complete Profile & Ledger"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(cust)}
                          className="p-1 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                          title="Edit Customer"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete customer ${cust.name}?`)) {
                              deleteCustomer(cust.id);
                            }
                          }}
                          className="p-1 text-slate-400 hover:text-rose-700 hover:bg-rose-50 rounded-md"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-[#F7F9F7] text-xs text-slate-600">
          <div>
            Showing {(currentPage - 1) * pageSize + 1} to{' '}
            {Math.min(currentPage * pageSize, sortedCustomers.length)} of{' '}
            {sortedCustomers.length} entries
          </div>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-2 font-semibold">
              Page {currentPage} of {totalPages}
            </span>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1.5 rounded-md border border-slate-200 bg-white hover:bg-slate-100 disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Add / Edit Customer Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCustomer ? `Edit Customer: ${editingCustomer.name}` : 'Register New Customer'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="text"
                required
                value={formData.mobile || ''}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={formData.whatsapp || ''}
                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">House / Flat No.</label>
              <input
                type="text"
                value={formData.houseNo || ''}
                onChange={e => setFormData({ ...formData, houseNo: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Street</label>
              <input
                type="text"
                value={formData.street || ''}
                onChange={e => setFormData({ ...formData, street: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Area / Locality</label>
              <input
                type="text"
                value={formData.area || ''}
                onChange={e => setFormData({ ...formData, area: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Landmark</label>
              <input
                type="text"
                value={formData.landmark || ''}
                onChange={e => setFormData({ ...formData, landmark: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#16803D]"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-3 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Assigned Route</label>
              <select
                value={formData.assignedRouteId}
                onChange={e => setFormData({ ...formData, assignedRouteId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                {routes.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Milk Type</label>
              <select
                value={formData.milkType}
                onChange={e =>
                  setFormData({
                    ...formData,
                    milkType: e.target.value as any,
                    pricePerLitre: e.target.value === 'Cow Milk' ? 60 : 75,
                  })
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="Cow Milk">Cow Milk (₹60/L)</option>
                <option value="Buffalo Milk">Buffalo Milk (₹75/L)</option>
              </select>
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Daily Qty (Litres)</label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                value={formData.dailyQuantity}
                onChange={e => setFormData({ ...formData, dailyQuantity: parseFloat(e.target.value) || 1.0 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-medium text-slate-700 mb-1">Rate / Litre (₹)</label>
              <input
                type="number"
                value={formData.pricePerLitre}
                onChange={e => setFormData({ ...formData, pricePerLitre: parseFloat(e.target.value) || 60 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Billing Due Day</label>
              <input
                type="number"
                value={formData.billingDueDate}
                onChange={e => setFormData({ ...formData, billingDueDate: parseInt(e.target.value) || 5 })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              />
            </div>
            <div>
              <label className="block font-medium text-slate-700 mb-1">Status</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg border border-slate-200"
              >
                <option value="active">Active</option>
                <option value="paused">Paused</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Delivery Instructions</label>
            <input
              type="text"
              placeholder="e.g. Leave milk packet in basket on porch"
              value={formData.deliveryInstructions || ''}
              onChange={e => setFormData({ ...formData, deliveryInstructions: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-slate-200"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-[#16803D] hover:bg-[#14532D] text-white rounded-lg font-semibold shadow-xs"
            >
              {editingCustomer ? 'Update Customer' : 'Save Customer'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Customer Detail Profile Modal with Tabs */}
      {viewingCustomer && (
        <Modal
          isOpen={!!viewingCustomer}
          onClose={() => setViewingCustomer(null)}
          title={`Customer Profile: ${viewingCustomer.name} (${viewingCustomer.id})`}
          maxWidth="4xl"
        >
          <div className="space-y-4">
            {/* Tab navigation */}
            <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold overflow-x-auto pb-1">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'subscription', label: 'Subscription', icon: Calendar },
                { id: 'deliveries', label: 'Delivery History', icon: Truck },
                { id: 'orders', label: 'Product Orders', icon: FileText },
                { id: 'invoices', label: 'Invoices', icon: Receipt },
                { id: 'ledger', label: 'Account Ledger', icon: CreditCard },
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setProfileTab(tab.id as any)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all ${
                      profileTab === tab.id
                        ? 'bg-[#EAF7EE] text-[#14532D] border-b-2 border-[#16803D]'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            {profileTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#F7F9F7] rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                    Contact & Address
                  </h4>
                  <p><strong>Mobile:</strong> {viewingCustomer.mobile}</p>
                  <p><strong>WhatsApp:</strong> {viewingCustomer.whatsapp || 'N/A'}</p>
                  <p><strong>Email:</strong> {viewingCustomer.email || 'N/A'}</p>
                  <p><strong>Address:</strong> {viewingCustomer.houseNo}, {viewingCustomer.street}, {viewingCustomer.area}</p>
                  <p><strong>Landmark:</strong> {viewingCustomer.landmark || 'None'}</p>
                  <p><strong>Instructions:</strong> {viewingCustomer.deliveryInstructions || 'None'}</p>
                </div>

                <div className="p-4 bg-[#F7F9F7] rounded-xl border border-slate-100 space-y-2">
                  <h4 className="font-bold text-slate-800 uppercase text-[11px] tracking-wider">
                    Subscription & Route
                  </h4>
                  <p><strong>Route:</strong> {routes.find(r => r.id === viewingCustomer.assignedRouteId)?.name}</p>
                  <p><strong>Milk Type:</strong> {viewingCustomer.milkType}</p>
                  <p><strong>Daily Quantity:</strong> {viewingCustomer.dailyQuantity} Litres</p>
                  <p><strong>Unit Price:</strong> ₹{viewingCustomer.pricePerLitre} / Litre</p>
                  <p><strong>Outstanding Balance:</strong> <span className="font-bold text-amber-700">{formatCurrency(viewingCustomer.outstandingBalance)}</span></p>
                  <p><strong>Status:</strong> <Badge variant={viewingCustomer.status === 'active' ? 'green' : 'amber'}>{viewingCustomer.status}</Badge></p>
                </div>

                {/* Direct Customer Web Portal Access Box */}
                <div className="md:col-span-2 p-4 bg-gradient-to-r from-blue-50 to-indigo-50/60 rounded-2xl border border-blue-200/80 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                        <Users className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h5 className="font-bold text-blue-950 text-xs">Customer Portal Login Link</h5>
                        <p className="text-[10px] text-blue-700">Household subscriber self-service portal</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
                      Subscriber Access
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={customerPortalUrl}
                      className="w-full text-xs font-mono bg-white border border-blue-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none select-all"
                    />
                    <button
                      onClick={handleCopyCustomerPortal}
                      className="flex items-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-2xs"
                    >
                      {copiedCustomerPortal ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-200" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Link</span>
                        </>
                      )}
                    </button>
                    <a
                      href={`https://wa.me/${(viewingCustomer.whatsapp || viewingCustomer.mobile).replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        `Hello ${viewingCustomer.name}! Here is your Dairy Milk Portal link to manage deliveries, vacations & view bills: ${customerPortalUrl}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shrink-0 shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send to {viewingCustomer.name.split(' ')[0]} via WhatsApp</span>
                    </a>
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'subscription' && (
              <div className="text-xs space-y-3">
                <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
                  <h4 className="font-bold text-emerald-900 mb-1">Active Milk Plan</h4>
                  <p className="text-slate-700">
                    Daily delivery of {viewingCustomer.dailyQuantity}L {viewingCustomer.milkType} at ₹{viewingCustomer.pricePerLitre}/L.
                  </p>
                  <p className="text-slate-500 mt-1">
                    Sunday Extra Milk: +0.5 Litre configured for weekend family breakfast.
                  </p>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <h4 className="font-bold text-slate-800 mb-2">Weekday Quantity Breakdown</h4>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dIdx) => (
                      <div key={day} className="p-2 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="font-bold text-slate-500 text-[10px] uppercase block">{day}</span>
                        <span className="font-bold text-[#14532D] text-sm">
                          {dIdx === 0 ? viewingCustomer.dailyQuantity + 0.5 : viewingCustomer.dailyQuantity}L
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {profileTab === 'deliveries' && (
              <div className="text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Milk Type</th>
                      <th className="p-2 text-center">Planned Qty</th>
                      <th className="p-2 text-center">Actual Qty</th>
                      <th className="p-2 text-center">Status</th>
                      <th className="p-2">Reason / Notes</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {deliveries
                      .filter(d => d.customerId === viewingCustomer.id)
                      .slice(0, 10)
                      .map(d => (
                        <tr key={d.id}>
                          <td className="p-2">{formatDate(d.date)}</td>
                          <td className="p-2">{d.milkType}</td>
                          <td className="p-2 text-center">{d.plannedMilkQuantity}L</td>
                          <td className="p-2 text-center font-bold text-[#14532D]">{d.actualMilkQuantity}L</td>
                          <td className="p-2 text-center">
                            <Badge variant={d.status === 'Delivered' ? 'green' : 'amber'}>
                              {d.status}
                            </Badge>
                          </td>
                          <td className="p-2 text-slate-500">{d.exceptionReason || d.deliveryNotes || 'Standard delivery'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {profileTab === 'orders' && (
              <div className="text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2">Order ID</th>
                      <th className="p-2">Date</th>
                      <th className="p-2">Products</th>
                      <th className="p-2 text-right">Total Amount</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {productOrders
                      .filter(o => o.customerId === viewingCustomer.id)
                      .map(o => (
                        <tr key={o.id}>
                          <td className="p-2 font-bold">{o.id}</td>
                          <td className="p-2">{formatDate(o.orderDate)}</td>
                          <td className="p-2">
                            {o.items.map(it => `${it.productName} (${it.quantity})`).join(', ')}
                          </td>
                          <td className="p-2 text-right font-bold">{formatCurrency(o.totalAmount)}</td>
                          <td className="p-2 text-center">
                            <Badge variant={o.status === 'Delivered' ? 'green' : 'blue'}>
                              {o.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {profileTab === 'invoices' && (
              <div className="text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2">Invoice #</th>
                      <th className="p-2">Month</th>
                      <th className="p-2 text-right">Milk</th>
                      <th className="p-2 text-right">Products</th>
                      <th className="p-2 text-right">Total Payable</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices
                      .filter(i => i.customerId === viewingCustomer.id)
                      .map(inv => (
                        <tr key={inv.id}>
                          <td className="p-2 font-bold">{inv.invoiceNumber}</td>
                          <td className="p-2">{inv.monthLabel}</td>
                          <td className="p-2 text-right">{formatCurrency(inv.milkCharges)}</td>
                          <td className="p-2 text-right">{formatCurrency(inv.productCharges)}</td>
                          <td className="p-2 text-right font-bold">{formatCurrency(inv.totalPayable)}</td>
                          <td className="p-2 text-center">
                            <Badge variant={inv.status === 'Paid' ? 'green' : 'amber'}>
                              {inv.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}

            {profileTab === 'ledger' && (
              <div className="text-xs">
                <table className="w-full text-left">
                  <thead className="bg-[#F7F9F7] text-slate-600 font-semibold border-b">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Description</th>
                      <th className="p-2 text-right text-rose-700">Debit (Charges)</th>
                      <th className="p-2 text-right text-emerald-700">Credit (Payments)</th>
                      <th className="p-2 text-right">Running Balance</th>
                      <th className="p-2">Ref</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {getCustomerLedger(viewingCustomer.id).map(led => (
                      <tr key={led.id}>
                        <td className="p-2">{formatDate(led.date)}</td>
                        <td className="p-2 font-medium">{led.description}</td>
                        <td className="p-2 text-right font-semibold text-rose-700">
                          {led.debit > 0 ? formatCurrency(led.debit) : '-'}
                        </td>
                        <td className="p-2 text-right font-semibold text-emerald-700">
                          {led.credit > 0 ? formatCurrency(led.credit) : '-'}
                        </td>
                        <td className="p-2 text-right font-bold">
                          {formatCurrency(led.runningBalance)}
                        </td>
                        <td className="p-2 text-slate-400 font-mono text-[10px]">{led.reference}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};
