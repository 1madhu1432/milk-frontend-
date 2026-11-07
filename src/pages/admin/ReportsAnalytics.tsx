import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import { formatCurrency, formatNumber, formatDate } from '../../utils/formatters';
import { exportToCSV } from '../../utils/csv';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  DollarSign,
  Truck,
  Milk,
  Receipt,
  Boxes,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

export const ReportsAnalytics: React.FC = () => {
  const {
    customers,
    routes,
    vendors,
    deliveries,
    milkPurchases,
    products,
    invoices,
    customerPayments,
    currentStock,
  } = useDairy();

  const [activeReport, setActiveReport] = useState<'financial' | 'deliveries' | 'procurement' | 'stock'>('financial');

  // Financial aggregates
  const totalInvoiced = invoices.reduce((acc, i) => acc + i.totalPayable, 0);
  const totalCollected = customerPayments.reduce((acc, p) => acc + p.amount, 0);
  const totalCustomerDues = customers.reduce((acc, c) => acc + c.outstandingBalance, 0);
  const totalVendorPurchases = milkPurchases.reduce((acc, p) => acc + p.purchaseTotal, 0);
  const grossProfitRecorded = totalInvoiced - totalVendorPurchases;

  // Monthly revenue trend (Illustrative aggregated from data)
  const revenueTrendData = [
    { month: 'Jun 2026', revenue: 420000, cost: 290000, profit: 130000 },
    { month: 'Jul 2026', revenue: 445000, cost: 305000, profit: 140000 },
    { month: 'Aug 2026', revenue: 460000, cost: 312000, profit: 148000 },
    { month: 'Sep 2026', revenue: 485000, cost: 325000, profit: 160000 },
    { month: 'Oct 2026', revenue: Math.round(totalInvoiced), cost: Math.round(totalVendorPurchases), profit: Math.max(0, grossProfitRecorded) },
  ];

  const handleExportActiveReport = () => {
    if (activeReport === 'financial') {
      exportToCSV(invoices, 'Financial_Monthly_Invoices_Report', [
        { key: 'invoiceNumber', label: 'Invoice Number' },
        { key: 'customerName', label: 'Customer' },
        { key: 'monthLabel', label: 'Month' },
        { key: 'totalPayable', label: 'Total Billed (₹)' },
        { key: 'paymentsApplied', label: 'Paid (₹)' },
        { key: 'balanceRemaining', label: 'Balance Due (₹)' },
        { key: 'status', label: 'Status' },
      ]);
    } else if (activeReport === 'deliveries') {
      exportToCSV(deliveries.slice(0, 500), 'Daily_Deliveries_Report', [
        { key: 'id', label: 'Delivery ID' },
        { key: 'date', label: 'Date' },
        { key: 'customerName', label: 'Customer' },
        { key: 'routeName', label: 'Route' },
        { key: 'plannedMilkQuantity', label: 'Planned Qty' },
        { key: 'actualMilkQuantity', label: 'Actual Qty' },
        { key: 'status', label: 'Status' },
      ]);
    } else if (activeReport === 'procurement') {
      exportToCSV(milkPurchases, 'Milk_Procurement_Report', [
        { key: 'id', label: 'Purchase ID' },
        { key: 'date', label: 'Date' },
        { key: 'vendorName', label: 'Vendor' },
        { key: 'milkType', label: 'Milk Type' },
        { key: 'acceptedQuantity', label: 'Accepted (L)' },
        { key: 'purchaseTotal', label: 'Total Value (₹)' },
      ]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-[#17211B] flex items-center gap-2">
            Business Reports & Operational Analytics
            <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
              Full Audit
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive audit reports across milk procurement, route delivery metrics, and customer financial ledgers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors border border-slate-200"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExportActiveReport}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#16803D] hover:bg-[#14532D] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export Active Report</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex border-b border-slate-200 gap-2 text-xs font-semibold overflow-x-auto pb-1">
        {[
          { id: 'financial', label: 'Revenue & Cost Summary', icon: DollarSign },
          { id: 'deliveries', label: 'Route Delivery Performance', icon: Truck },
          { id: 'procurement', label: 'Vendor Milk Procurement', icon: Milk },
          { id: 'stock', label: 'Silo Storage & Wastage', icon: Boxes },
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as any)}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl transition-all ${
                activeReport === tab.id
                  ? 'bg-[#EAF7EE] text-[#14532D] border border-emerald-200 font-bold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Financial & Profit Analysis */}
      {activeReport === 'financial' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase block">
                Total Billed Revenue
              </span>
              <span className="text-xl font-extrabold text-[#17211B]">
                {formatCurrency(totalInvoiced)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Customer Statements</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase block">
                Raw Milk Cost
              </span>
              <span className="text-xl font-extrabold text-blue-800">
                {formatCurrency(totalVendorPurchases)}
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">Paid to Farm Suppliers</span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase block">
                Operating Gross Margin
              </span>
              <span className="text-xl font-extrabold text-[#14532D]">
                {formatCurrency(Math.max(0, grossProfitRecorded))}
              </span>
              <span className="text-[10px] text-emerald-700 block mt-0.5 font-semibold">
                ~{totalInvoiced > 0 ? Math.round((grossProfitRecorded / totalInvoiced) * 100) : 32}% Margin
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-400 font-bold uppercase block">
                Customer Dues Uncollected
              </span>
              <span className="text-xl font-extrabold text-rose-700">
                {formatCurrency(totalCustomerDues)}
              </span>
              <span className="text-[10px] text-rose-600 block mt-0.5">Household Balances</span>
            </div>
          </div>

          {/* Revenue vs Cost Chart */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#17211B]">
                  Monthly Revenue vs Recorded Procurement Cost (INR)
                </h3>
                <p className="text-xs text-slate-400">
                  Healthy profit spread between farm bulk purchase and home delivery retail
                </p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueTrendData}>
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, '']}
                    contentStyle={{ borderRadius: '8px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                  <Bar dataKey="revenue" fill="#16803D" name="Revenue Billed (₹)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" fill="#2563EB" name="Procurement Cost (₹)" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" fill="#F59E0B" name="Gross Spread (₹)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Route Deliveries */}
      {activeReport === 'deliveries' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-[#F7F9F7]">
            <h3 className="text-sm font-bold text-slate-800">
              5 Route Fleet Performance Breakdown
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-white">
              <tr>
                <th className="p-3">Route Circuit</th>
                <th className="p-3">Area Covered</th>
                <th className="p-3 text-center">Customers</th>
                <th className="p-3 text-center">Milk Required</th>
                <th className="p-3 text-center">Delivered</th>
                <th className="p-3 text-center">Missed</th>
                <th className="p-3 text-center">Success Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {routes.map(r => (
                <tr key={r.id}>
                  <td className="p-3 font-bold text-slate-900">{r.name}</td>
                  <td className="p-3 text-slate-600">{r.area}</td>
                  <td className="p-3 text-center font-semibold">{r.assignedCustomerCount}</td>
                  <td className="p-3 text-center font-bold text-[#14532D]">{r.totalMilkRequired}L</td>
                  <td className="p-3 text-center text-emerald-700 font-bold">{r.completedDeliveries}</td>
                  <td className="p-3 text-center text-rose-600 font-bold">{r.missedDeliveries}</td>
                  <td className="p-3 text-center">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#EAF7EE] text-[#14532D]">
                      {r.completionPercentage}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Vendor Procurement */}
      {activeReport === 'procurement' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 bg-[#F7F9F7]">
            <h3 className="text-sm font-bold text-slate-800">
              Farm Supplier Procurement & Settlement Ledger
            </h3>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="border-b bg-white">
              <tr>
                <th className="p-3">Farm Supplier</th>
                <th className="p-3">Contact</th>
                <th className="p-3 text-right">Total Milk Supplied</th>
                <th className="p-3 text-right">Gross Value (₹)</th>
                <th className="p-3 text-right">Settled Amount (₹)</th>
                <th className="p-3 text-right text-rose-700 font-bold">Outstanding Owed (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {vendors.map(v => (
                <tr key={v.id}>
                  <td className="p-3 font-bold text-slate-900">{v.name}</td>
                  <td className="p-3 text-slate-600">{v.contactNumber}</td>
                  <td className="p-3 text-right font-bold">{formatNumber(v.totalMilkPurchased)} L</td>
                  <td className="p-3 text-right">{formatCurrency(v.totalPurchaseValue)}</td>
                  <td className="p-3 text-right text-emerald-800 font-semibold">{formatCurrency(v.totalAmountPaid)}</td>
                  <td className="p-3 text-right font-extrabold text-rose-700">{formatCurrency(v.outstandingBalance)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 4: Silo Storage & Wastage */}
      {activeReport === 'stock' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs grid grid-cols-2 gap-4 text-center">
            <div className="p-4 bg-blue-50/60 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-900 font-bold uppercase">Cow Milk In Silo</p>
              <p className="text-2xl font-extrabold text-blue-950 mt-1">{currentStock.cowMilk} Litres</p>
            </div>
            <div className="p-4 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <p className="text-xs text-emerald-900 font-bold uppercase">Buffalo Milk In Silo</p>
              <p className="text-2xl font-extrabold text-emerald-950 mt-1">{currentStock.buffaloMilk} Litres</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
