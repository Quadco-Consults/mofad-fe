'use client'

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend
} from 'recharts'

interface RevenueChartProps {
  data: Array<{
    month: string
    revenue: number
    profit: number
  }>
  isLoading?: boolean
}

interface PieChartProps {
  data: Array<{
    name: string
    value: number
    color: string
  }>
  centerValue?: string
  centerLabel?: string
  isLoading?: boolean
}

interface SalesLineChartProps {
  data: Array<{
    month: string
    sales: number
    growth: number
  }>
  isLoading?: boolean
}

const COLORS = {
  primary: '#ea580c',
  secondary: '#fb923c',
  accent: '#fed7aa',
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
  background: '#fef7ed'
}

// Enhanced Revenue Area Chart
export function RevenueAreaChart({ data, isLoading = false }: RevenueChartProps) {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `₦${(value / 1000).toFixed(1)}K`
    return `₦${value.toLocaleString()}`
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0.1}/>
            </linearGradient>
            <linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.secondary} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={COLORS.secondary} stopOpacity={0.1}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [formatValue(value)]}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke={COLORS.primary}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#revenueGradient)"
          />
          <Area
            type="monotone"
            dataKey="profit"
            stroke={COLORS.secondary}
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#profitGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// Enhanced Donut Chart
export function DonutChart({ data, centerValue, centerLabel, isLoading = false }: PieChartProps) {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({
    cx, cy, midAngle, innerRadius, outerRadius, percent
  }: any) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)

    return percent > 0.05 ? (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="text-xs font-medium"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    ) : null
  }

  return (
    <div className="h-80 w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={100}
            innerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [`${value.toLocaleString()}`, '']}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Text */}
      {centerValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-3xl font-bold text-gray-900">{centerValue}</div>
          {centerLabel && <div className="text-sm text-gray-500 mt-1">{centerLabel}</div>}
        </div>
      )}
    </div>
  )
}

// Enhanced Sales Line Chart
export function SalesLineChart({ data, isLoading = false }: SalesLineChartProps) {
  if (isLoading) {
    return (
      <div className="h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  const formatValue = (value: number) => {
    if (value >= 1000000) return `₦${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `₦${(value / 1000).toFixed(1)}K`
    return `₦${value.toLocaleString()}`
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <defs>
            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.1}/>
              <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickFormatter={formatValue}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value: number) => [formatValue(value)]}
          />
          <Area
            type="monotone"
            dataKey="sales"
            stroke="none"
            fillOpacity={1}
            fill="url(#salesGradient)"
          />
          <Line
            type="monotone"
            dataKey="sales"
            stroke={COLORS.primary}
            strokeWidth={4}
            dot={{ fill: COLORS.primary, strokeWidth: 2, r: 6 }}
            activeDot={{ r: 8, stroke: COLORS.primary, strokeWidth: 2, fill: 'white' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

// Performance Bar Chart
export function PerformanceBarChart({ data }: { data: Array<{ name: string; value: number; target: number }> }) {
  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: 'none',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Bar dataKey="value" fill={COLORS.primary} radius={[4, 4, 0, 0]} />
          <Bar dataKey="target" fill={COLORS.accent} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export const chartColors = COLORS