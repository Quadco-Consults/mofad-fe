'use client'

import { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  Legend,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
  Treemap,
  FunnelChart,
  Funnel,
  LabelList
} from 'recharts'
import { formatCurrency, formatNumber } from '@/lib/utils'

interface DashboardChartsProps {
  data?: any
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#84CC16', '#F97316']
const GRADIENT_COLORS = [
  { start: '#3B82F6', end: '#1E40AF' },
  { start: '#10B981', end: '#047857' },
  { start: '#F59E0B', end: '#D97706' },
  { start: '#EF4444', end: '#DC2626' },
  { start: '#8B5CF6', end: '#7C3AED' },
]

// Enhanced Custom tooltip component with premium glassmorphism styling
const CustomTooltip = ({ active, payload, label, formatter }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-2xl border border-white/30 rounded-2xl p-5 shadow-2xl transform scale-105 transition-all duration-300">
        {/* Premium background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/60 via-white/40 to-white/60 rounded-2xl"></div>

        <div className="relative">
          {/* Enhanced header with sparkle effect */}
          <div className="flex items-center gap-3 mb-4">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
            <p className="font-bold text-slate-800 text-sm uppercase tracking-wider">{`${label}`}</p>
          </div>

          <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center justify-between gap-6 p-2 bg-white/50 rounded-xl backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shadow-lg"
                    style={{ backgroundColor: entry.color }}
                  ></div>
                  <span className="text-sm font-semibold text-slate-700">{entry.name}:</span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: entry.color }}
                >
                  {formatter ? formatter(entry.value) : entry.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Subtle glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/5 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      </div>
    )
  }
  return null
}

// Custom label for better data presentation
const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  if (percent < 0.05) return null // Hide labels for slices less than 5%

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize="12"
      fontWeight="600"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function DashboardCharts({ data }: DashboardChartsProps) {
  // Mock data with more realistic petroleum industry metrics
  const salesData = useMemo(() => {
    if (data?.daily_sales) {
      return data.daily_sales.slice(-30).map((item: any) => ({
        date: new Date(item.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric'
        }),
        sales: item.sales || 0,
        orders: item.orders || 0,
        profit: item.profit || 0,
      }))
    }

    // Enhanced mock data for petroleum distribution
    const mockData = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      mockData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.floor(Math.random() * 5000000) + 2000000,
        orders: Math.floor(Math.random() * 50) + 20,
        profit: Math.floor(Math.random() * 800000) + 300000,
        volume: Math.floor(Math.random() * 10000) + 5000, // Liters
      })
    }
    return mockData
  }, [data?.daily_sales])

  // Product performance with petroleum products
  const productData = useMemo(() => {
    if (data?.product_performance) {
      return data.product_performance.slice(0, 8).map((item: any) => ({
        name: item.product_name?.substring(0, 15) + (item.product_name?.length > 15 ? '...' : ''),
        revenue: item.revenue || 0,
        quantity: item.quantity_sold || 0,
        profit_margin: item.profit_margin || 0,
      }))
    }

    return [
      { name: 'Premium Motor Spirit', revenue: 45000000, quantity: 85000, profit_margin: 12.5 },
      { name: 'Automotive Gas Oil', revenue: 38000000, quantity: 72000, profit_margin: 15.2 },
      { name: 'Dual Purpose Kerosene', revenue: 28000000, quantity: 45000, profit_margin: 18.7 },
      { name: 'Engine Oil 5W-30', revenue: 15000000, quantity: 12000, profit_margin: 35.4 },
      { name: 'Hydraulic Oil', revenue: 8500000, quantity: 8500, profit_margin: 28.9 },
      { name: 'Gear Oil 90', revenue: 6200000, quantity: 6800, profit_margin: 32.1 },
      { name: 'Brake Fluid DOT4', revenue: 4800000, quantity: 4200, profit_margin: 42.6 },
      { name: 'Coolant Concentrate', revenue: 3200000, quantity: 2800, profit_margin: 38.5 },
    ]
  }, [data?.product_performance])

  // Channel performance data
  const channelData = useMemo(() => {
    if (data?.channel_performance) {
      const channels = data.channel_performance
      return [
        { name: 'Direct Sales', value: channels.direct_sales || 0, color: COLORS[0] },
        { name: 'Substore Network', value: channels.substore_sales || 0, color: COLORS[1] },
        { name: 'Lubebay Services', value: channels.lubebay_sales || 0, color: COLORS[2] },
        { name: 'Online Orders', value: channels.online_sales || 0, color: COLORS[3] },
        { name: 'Bulk Customers', value: channels.bulk_sales || 0, color: COLORS[4] },
      ].filter(item => item.value > 0)
    }

    return [
      { name: 'Direct Sales', value: 45000000, color: COLORS[0] },
      { name: 'Substore Network', value: 32000000, color: COLORS[1] },
      { name: 'Lubebay Services', value: 18000000, color: COLORS[2] },
      { name: 'Online Orders', value: 8500000, color: COLORS[3] },
      { name: 'Bulk Customers', value: 12000000, color: COLORS[4] },
    ]
  }, [data?.channel_performance])

  // Geographic performance data
  const geographicData = useMemo(() => [
    { region: 'Lagos', sales: 85000000, customers: 245, growth: 12.5 },
    { region: 'Abuja', sales: 62000000, customers: 180, growth: 8.7 },
    { region: 'Kano', sales: 48000000, customers: 145, growth: 15.2 },
    { region: 'Port Harcourt', sales: 52000000, customers: 165, growth: 9.8 },
    { region: 'Ibadan', sales: 35000000, customers: 120, growth: 11.3 },
    { region: 'Kaduna', sales: 28000000, customers: 95, growth: 7.6 },
  ], [])

  // Inventory turnover data
  const inventoryData = useMemo(() => [
    { product: 'PMS', current_stock: 250000, reorder_level: 50000, turnover_days: 5 },
    { product: 'AGO', current_stock: 180000, reorder_level: 40000, turnover_days: 7 },
    { product: 'DPK', current_stock: 120000, reorder_level: 25000, turnover_days: 12 },
    { product: 'Engine Oil', current_stock: 15000, reorder_level: 3000, turnover_days: 18 },
    { product: 'Hydraulic Oil', current_stock: 8000, reorder_level: 1500, turnover_days: 25 },
  ], [])

  if (!salesData.length) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse bg-gray-200 h-8 w-48 rounded mx-auto"></div>
          <p className="text-gray-500">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Sales Trend with Volume - Premium Chart Container */}
      <div className="relative group">
        {/* Enhanced Background with Multiple Layers */}
        <div className="absolute -inset-2 bg-gradient-to-br from-blue-50/80 via-white/90 to-cyan-50/80 rounded-[2.5rem] blur-sm"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2.5rem] p-8 shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden">
          {/* Floating Background Elements */}
          <div className="absolute top-6 right-8 w-24 h-24 bg-gradient-to-r from-blue-400/15 to-cyan-400/15 rounded-full blur-2xl"></div>
          <div className="absolute bottom-6 left-6 w-20 h-20 bg-gradient-to-r from-emerald-400/15 to-teal-400/15 rounded-full blur-2xl"></div>

          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative p-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Revenue & Volume Analytics</h3>
                <p className="text-sm text-slate-600 font-semibold">30-day performance insights with trend analysis</p>
              </div>
            </div>

            {/* Premium Badge */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-100/80 to-cyan-100/80 border border-emerald-200/50 rounded-2xl backdrop-blur-sm shadow-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-700">Real-time Data</span>
            </div>
          </div>

          {/* Chart Container with Enhanced Styling */}
          <div className="relative h-80">
            {/* Chart Background Glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-cyan-500/3 to-emerald-500/5 rounded-2xl"></div>
            <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={salesData}>
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              fontSize={12}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              fontSize={12}
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip formatter={(value: number, name: string) =>
              name === 'orders' ? value : formatCurrency(value)
            } />} />
            <Legend />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="sales"
              stroke="#3B82F6"
              fill="url(#salesGradient)"
              strokeWidth={3}
              name="Revenue"
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="profit"
              stroke="#10B981"
              fill="url(#profitGradient)"
              strokeWidth={2}
              name="Profit"
            />
            <Bar
              yAxisId="right"
              dataKey="orders"
              fill="#F59E0B"
              name="Orders"
              radius={[2, 2, 0, 0]}
              opacity={0.8}
            />
          </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Product Performance Matrix - Enhanced Premium Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Products Revenue Chart - Premium Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-green-50/80 via-white/90 to-blue-50/80 rounded-[2rem] blur-sm"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-6 shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-4 right-6 w-20 h-20 bg-gradient-to-r from-green-400/15 to-blue-400/15 rounded-full blur-2xl"></div>

            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative p-2.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl shadow-lg">
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Top Products</h3>
                  <p className="text-xs text-slate-600 font-semibold">Revenue performance leaders</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-green-100/80 to-blue-100/80 border border-green-200/50 rounded-xl backdrop-blur-sm shadow-lg">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-green-700">Live</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/3 via-blue-500/2 to-emerald-500/3 rounded-xl"></div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData} layout="horizontal" margin={{ left: 100 }}>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                type="number"
                fontSize={11}
                tickFormatter={(value) => formatCurrency(value)}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                fontSize={11}
                width={120}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
              <Bar
                dataKey="revenue"
                fill="url(#barGradient)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Profit Margins Chart - Premium Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-purple-50/80 via-white/90 to-pink-50/80 rounded-[2rem] blur-sm"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-6 shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-4 right-6 w-20 h-20 bg-gradient-to-r from-purple-400/15 to-pink-400/15 rounded-full blur-2xl"></div>

            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Profit Margins</h3>
                  <p className="text-xs text-slate-600 font-semibold">Profitability analysis</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-purple-100/80 to-pink-100/80 border border-purple-200/50 rounded-xl backdrop-blur-sm shadow-lg">
                <div className="w-1.5 h-1.5 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-purple-700">Analysis</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/3 via-pink-500/2 to-violet-500/3 rounded-xl"></div>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={productData} margin={{ left: 100 }}>
              <defs>
                <linearGradient id="marginGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EC4899" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
              <XAxis
                type="number"
                fontSize={11}
                tickFormatter={(value) => `${value}%`}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                fontSize={11}
                width={120}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip formatter={(value: number) => `${value}%`} />} />
              <Bar
                dataKey="profit_margin"
                fill="url(#marginGradient)"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Sales Channels and Geographic Distribution - Premium Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales Channels Chart - Premium Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-orange-50/80 via-white/90 to-red-50/80 rounded-[2rem] blur-sm"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-6 shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-4 right-6 w-20 h-20 bg-gradient-to-r from-orange-400/15 to-red-400/15 rounded-full blur-2xl"></div>

            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative p-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-xl shadow-lg">
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Sales Channels</h3>
                  <p className="text-xs text-slate-600 font-semibold">Revenue distribution analysis</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-orange-100/80 to-red-100/80 border border-orange-200/50 rounded-xl backdrop-blur-sm shadow-lg">
                <div className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-orange-700">Distribution</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/3 via-red-500/2 to-rose-500/3 rounded-xl"></div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <defs>
                    {channelData.map((_, index) => (
                      <linearGradient key={index} id={`channelGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor={COLORS[index]} stopOpacity={0.8}/>
                        <stop offset="100%" stopColor={COLORS[index]} stopOpacity={1}/>
                      </linearGradient>
                    ))}
                  </defs>
                  <Pie
                    data={channelData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={CustomLabel}
                    outerRadius={100}
                    dataKey="value"
                  >
                    {channelData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`url(#channelGradient${index})`} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value, entry: any) => (
                      <span style={{ color: entry.color, fontWeight: 600 }}>{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Regional Performance Chart - Premium Card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-br from-teal-50/80 via-white/90 to-cyan-50/80 rounded-[2rem] blur-sm"></div>
          <div className="relative bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-6 shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden">
            {/* Background Elements */}
            <div className="absolute top-4 right-6 w-20 h-20 bg-gradient-to-r from-teal-400/15 to-cyan-400/15 rounded-full blur-2xl"></div>

            {/* Enhanced Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                  <div className="relative p-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-xl shadow-lg">
                    <div className="w-5 h-5 bg-white rounded-lg flex items-center justify-center">
                      <div className="w-2.5 h-2.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></div>
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900">Regional Performance</h3>
                  <p className="text-xs text-slate-600 font-semibold">Geographic sales insights</p>
                </div>
              </div>
              <div className="flex items-center space-x-1 px-3 py-1.5 bg-gradient-to-r from-teal-100/80 to-cyan-100/80 border border-teal-200/50 rounded-xl backdrop-blur-sm shadow-lg">
                <div className="w-1.5 h-1.5 bg-teal-500 rounded-full animate-pulse"></div>
                <span className="text-xs font-bold text-teal-700">Regions</span>
              </div>
            </div>

            {/* Chart Container */}
            <div className="relative h-64">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-500/3 via-cyan-500/2 to-blue-500/3 rounded-xl"></div>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geographicData}>
                  <defs>
                    <linearGradient id="regionGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#0891B2" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis
                    dataKey="region"
                    fontSize={11}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    fontSize={11}
                    tickFormatter={(value) => formatCurrency(value)}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomTooltip formatter={(value: number) => formatCurrency(value)} />} />
                  <Bar
                    dataKey="sales"
                    fill="url(#regionGradient)"
                    radius={[4, 4, 0, 0]}
                  >
                    <LabelList
                      dataKey="growth"
                      position="top"
                      fontSize={10}
                      formatter={(value: number) => `+${value}%`}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Status - Premium Card */}
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-br from-yellow-50/80 via-white/90 to-orange-50/80 rounded-[2rem] blur-sm"></div>
        <div className="relative bg-white/80 backdrop-blur-2xl border border-white/40 rounded-[2rem] p-8 shadow-2xl hover:shadow-4xl transition-all duration-700 overflow-hidden">
          {/* Background Elements */}
          <div className="absolute top-6 right-8 w-24 h-24 bg-gradient-to-r from-yellow-400/15 to-orange-400/15 rounded-full blur-2xl"></div>
          <div className="absolute bottom-6 left-6 w-20 h-20 bg-gradient-to-r from-amber-400/15 to-yellow-400/15 rounded-full blur-2xl"></div>

          {/* Enhanced Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity duration-500"></div>
                <div className="relative p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl shadow-lg">
                  <div className="w-6 h-6 bg-white rounded-lg flex items-center justify-center">
                    <div className="w-3 h-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"></div>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900">Inventory Health Monitor</h3>
                <p className="text-sm text-slate-600 font-semibold">Stock levels and turnover analysis</p>
              </div>
            </div>

            {/* Premium Badge */}
            <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-100/80 to-orange-100/80 border border-yellow-200/50 rounded-2xl backdrop-blur-sm shadow-lg">
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold text-amber-700">Stock Monitor</span>
            </div>
          </div>

          {/* Chart Container */}
          <div className="relative h-64">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-orange-500/3 to-amber-500/5 rounded-2xl"></div>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={inventoryData}>
                <defs>
                  <linearGradient id="stockGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#84CC16" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#65A30D" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis
                  dataKey="product"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="left"
                  fontSize={11}
                  tickFormatter={(value) => formatNumber(value)}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  fontSize={11}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="current_stock"
                  fill="url(#stockGradient)"
                  name="Current Stock"
                  radius={[2, 2, 0, 0]}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="reorder_level"
                  stroke="#EF4444"
                  strokeWidth={3}
                  name="Reorder Level"
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="turnover_days"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  name="Turnover Days"
                  dot={{ r: 3 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}