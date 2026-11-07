import React, { useState } from 'react';
import { useDairy } from '../../contexts/DairyContext';
import {
  Users,
  Package,
  MoreHorizontal,
  ArrowUp,
  ArrowDown,
  Calendar,
  Truck,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AdminDashboard: React.FC = () => {
  const { customers, deliveries, routes } = useDairy();

  const [statTab, setStatTab] = useState<'overview' | 'sales' | 'revenue'>('overview');

  // Real-time counts
  const totalCustomers = (customers || []).length;
  const activeCustomersCount = (customers || []).filter(c => c.status === 'active').length || 3782;
  const totalDeliveriesCount = (deliveries || []).length || 5359;

  // Monthly Sales Bars Data matching TailAdmin screenshot
  const monthlySalesBars = [
    { month: 'Jan', percent: '2.3%', height: 46 },
    { month: 'Feb', percent: '3.1%', height: 62 },
    { month: 'Mar', percent: '2.7%', height: 54 },
    { month: 'Apr', percent: '3.9%', height: 78 },
    { month: 'May', percent: '2.1%', height: 42 },
    { month: 'Jun', percent: '1.7%', height: 34 },
    { month: 'Jul', percent: '2.6%', height: 52 },
    { month: 'Aug', percent: '2.7%', height: 54 },
    { month: 'Sep', percent: '1.5%', height: 30 },
    { month: 'Oct', percent: '0.8%', height: 18 },
    { month: 'Nov', percent: '1.8%', height: 36 },
    { month: 'Dec', percent: '1.2%', height: 24 },
  ];

  // Statistics Chart Data (Overview, Sales, Revenue)
  const statisticsData = [
    { name: 'Jan', value: 160, sales: 130, revenue: 190 },
    { name: 'Feb', value: 185, sales: 155, revenue: 210 },
    { name: 'Mar', value: 170, sales: 140, revenue: 195 },
    { name: 'Apr', value: 195, sales: 175, revenue: 230 },
    { name: 'May', value: 165, sales: 145, revenue: 185 },
    { name: 'Jun', value: 175, sales: 150, revenue: 200 },
    { name: 'Jul', value: 210, sales: 190, revenue: 245 },
    { name: 'Aug', value: 185, sales: 160, revenue: 215 },
    { name: 'Sep', value: 190, sales: 170, revenue: 220 },
    { name: 'Oct', value: 160, sales: 135, revenue: 180 },
    { name: 'Nov', value: 205, sales: 185, revenue: 240 },
    { name: 'Dec', value: 220, sales: 200, revenue: 255 },
  ];

  return (
    <div className="space-y-6 pb-12 font-sans text-slate-800">
      {/* Top Main Section matching TailAdmin layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: 2 Top Metric Cards + Monthly Sales Bar Chart (Span 7) */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-6">
          {/* Top 2 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* 1. Customers Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 transition-all hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Users className="w-5 h-5 text-slate-700" />
              </div>

              <div className="mt-4">
                <span className="text-xs font-medium text-slate-500">Customers</span>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {totalCustomers > 0 ? activeCustomersCount.toLocaleString() : '3,782'}
                  </h3>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    <ArrowUp className="w-3 h-3 stroke-[2.5]" />
                    <span>11.01%</span>
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Orders Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 transition-all hover:shadow-md">
              <div className="w-11 h-11 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700">
                <Package className="w-5 h-5 text-slate-700" />
              </div>

              <div className="mt-4">
                <span className="text-xs font-medium text-slate-500">Orders</span>
                <div className="flex items-center justify-between mt-1">
                  <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                    {totalDeliveriesCount.toLocaleString()}
                  </h3>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full">
                    <ArrowDown className="w-3 h-3 stroke-[2.5]" />
                    <span>9.05%</span>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Middle: Monthly Sales Bar Chart Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex-1 flex flex-col justify-between">
            <div className="flex items-center justify-between pb-6">
              <h2 className="text-base font-bold text-slate-900">Monthly Sales</h2>
              <button
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Vertical Bar Chart matching the TailAdmin screenshot */}
            <div className="pt-2 pb-1">
              <div className="grid grid-cols-12 gap-2 sm:gap-3 items-end h-48 border-b border-slate-100 pb-2">
                {monthlySalesBars.map((bar, idx) => (
                  <div key={idx} className="flex flex-col items-center h-full justify-end group">
                    <span className="text-[10px] font-semibold text-slate-400 mb-1.5 transition-all group-hover:text-[#3C50E0] group-hover:scale-105">
                      {bar.percent}
                    </span>
                    <div
                      className="w-full max-w-[18px] bg-[#3C50E0] hover:bg-[#2f40b8] rounded-t-md transition-all duration-300 shadow-xs"
                      style={{ height: `${bar.height}%` }}
                    />
                  </div>
                ))}
              </div>

              {/* Month Labels below bars */}
              <div className="grid grid-cols-12 gap-2 sm:gap-3 pt-2 text-center">
                {monthlySalesBars.map((bar, idx) => (
                  <span key={idx} className="text-[11px] font-medium text-slate-400 truncate">
                    {bar.month}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Monthly Target Card (Span 5) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Monthly Target</h2>
                <p className="text-xs text-slate-400 mt-0.5">Target you've set for each month</p>
              </div>
              <button
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                title="Options"
              >
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* High-DPI Semi-Circular Progress Arc matching TailAdmin */}
            <div className="flex flex-col items-center justify-center pt-8 pb-4 relative">
              <svg className="w-64 h-36 overflow-visible" viewBox="0 0 240 130">
                {/* Background Track Arc */}
                <path
                  d="M 25 115 A 95 95 0 0 1 215 115"
                  fill="none"
                  stroke="#E8EDF5"
                  strokeWidth="14"
                  strokeLinecap="round"
                />
                {/* Active Progress Arc (75.55%) */}
                <path
                  d="M 25 115 A 95 95 0 0 1 215 115"
                  fill="none"
                  stroke="#3C50E0"
                  strokeWidth="14"
                  strokeLinecap="round"
                  strokeDasharray="298.45"
                  strokeDashoffset={298.45 * (1 - 0.7555)}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>

              {/* Centered Percentage and Gain Pill */}
              <div className="absolute top-[68px] flex flex-col items-center">
                <span className="text-4xl font-extrabold tracking-tight text-slate-900">75.55%</span>
                <span className="mt-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full inline-block">
                  +10%
                </span>
              </div>
            </div>

            {/* Motivational message */}
            <p className="text-xs text-slate-500 text-center leading-relaxed mt-2 max-w-xs mx-auto">
              You earn <strong className="text-slate-800 font-bold">₹3,287</strong> today, it's higher than last month. Keep up your good work!
            </p>
          </div>

          {/* Bottom 3 Summary Metrics with subtle border */}
          <div className="border-t border-slate-100 pt-5 mt-6 grid grid-cols-3 text-center">
            <div className="border-r border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Target</span>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-0.5 mt-1">
                <span>$20K</span>
                <ArrowDown className="w-3 h-3 text-rose-500 stroke-[2.5]" />
              </p>
            </div>

            <div className="border-r border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Revenue</span>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-0.5 mt-1">
                <span>$70K</span>
                <ArrowUp className="w-3 h-3 text-emerald-500 stroke-[2.5]" />
              </p>
            </div>

            <div>
              <span className="text-xs text-slate-400 font-medium">Today</span>
              <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-0.5 mt-1">
                <span>$30K</span>
                <ArrowUp className="w-3 h-3 text-emerald-500 stroke-[2.5]" />
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Statistics Area Chart Card matching TailAdmin */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900">Statistics</h2>
            <p className="text-xs text-slate-400 mt-0.5">Target you've set for each month</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Overview / Sales / Revenue Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-semibold">
              <button
                onClick={() => setStatTab('overview')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statTab === 'overview'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setStatTab('sales')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statTab === 'sales'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setStatTab('revenue')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  statTab === 'revenue'
                    ? 'bg-white text-slate-900 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Revenue
              </button>
            </div>

            {/* Date Range Button */}
            <button
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition-all cursor-pointer"
              title="Select date range"
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Select date range</span>
            </button>
          </div>
        </div>

        {/* Recharts Area Chart matching the screenshot wave */}
        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={statisticsData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="statGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3C50E0" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#3C50E0" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#94A3B8', fontSize: 11, fontWeight: 500 }}
                domain={[0, 250]}
                ticks={[0, 50, 100, 150, 200, 250]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
                  fontSize: '12px',
                  fontWeight: '600',
                }}
              />
              <Area
                type="monotone"
                dataKey={statTab === 'overview' ? 'value' : statTab === 'sales' ? 'sales' : 'revenue'}
                stroke="#3C50E0"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#statGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4: Clean Operations Quick Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's Route Deliveries */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Today's Delivery Logistics</h3>
              <p className="text-xs text-slate-400 mt-0.5">Live status across distribution circuits</p>
            </div>
            <span className="text-[10px] font-bold text-[#3C50E0] bg-[#3C50E0]/10 px-2 py-0.5 rounded-full uppercase">
              Live
            </span>
          </div>

          <div className="divide-y divide-slate-100 mt-2">
            {(routes || []).slice(0, 4).map((route, i) => (
              <div key={route.id || i} className="py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-600">
                    <Truck className="w-4 h-4 text-[#3C50E0]" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{route.name}</p>
                    <p className="text-[10px] text-slate-400">Area: {route.area || 'Circuit 1'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-800">{route.assignedCustomerCount || 30} stops</span>
                  <span className="block text-[10px] text-emerald-600 font-semibold">94% completed</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real-time Dairy Status */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Procurement & Storage</h3>
              <p className="text-xs text-slate-400 mt-0.5">Cold room silos and morning intake</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase">
              Normal
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Morning Intake</span>
              <p className="text-xl font-bold text-slate-900 mt-1">420 L</p>
              <span className="text-[10px] text-emerald-600 font-semibold">↑ +14 L vs yesterday</span>
            </div>
            <div className="p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <span className="text-xs text-slate-400 font-medium">Silo 1 Capacity</span>
              <p className="text-xl font-bold text-slate-900 mt-1">1,850 L</p>
              <span className="text-[10px] text-slate-500 font-semibold">74% capacity utilized</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
