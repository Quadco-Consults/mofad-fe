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
  Cell
} from 'recharts'
import { formatCurrency } from '@/lib/utils'

interface DashboardChartsProps {
  data?: any
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6']

export function DashboardCharts({ data }: DashboardChartsProps) {
  const salesData = useMemo(() => {
    if (!data?.daily_sales) return []

    return data.daily_sales.slice(-30).map((item: any) => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      sales: item.sales || 0,
      orders: item.orders || 0,
    }))
  }, [data?.daily_sales])

  const productData = useMemo(() => {
    if (!data?.product_performance) return []

    return data.product_performance.slice(0, 5).map((item: any) => ({
      name: item.product_name?.substring(0, 15) + (item.product_name?.length > 15 ? '...' : ''),
      revenue: item.revenue || 0,
      quantity: item.quantity_sold || 0,
    }))
  }, [data?.product_performance])

  const channelData = useMemo(() => {
    if (!data?.channel_performance) return []

    const channels = data.channel_performance
    return [
      { name: 'Direct Sales', value: channels.direct_sales || 0, color: COLORS[0] },
      { name: 'Substore Sales', value: channels.substore_sales || 0, color: COLORS[1] },
      { name: 'Lubebay Sales', value: channels.lubebay_sales || 0, color: COLORS[2] },
    ].filter(item => item.value > 0)
  }, [data?.channel_performance])

  if (!data) {
    return (
      <div className="h-80 flex items-center justify-center">
        <p className="text-gray-500">No data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Sales Trend */}
      <div className="h-80">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend (Last 30 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="date"
              fontSize={12}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              fontSize={12}
              tick={{ fontSize: 12 }}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <Tooltip
              formatter={(value, name) => [
                name === 'sales' ? formatCurrency(Number(value)) : value,
                name === 'sales' ? 'Sales' : 'Orders'
              ]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="sales"
              stroke="#3B82F6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Product Performance */}
      <div className="h-80">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Products by Revenue</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={productData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              type="number"
              fontSize={12}
              tickFormatter={(value) => formatCurrency(value)}
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={12}
              width={100}
            />
            <Tooltip
              formatter={(value, name) => [
                name === 'revenue' ? formatCurrency(Number(value)) : value,
                name === 'revenue' ? 'Revenue' : 'Quantity'
              ]}
            />
            <Bar dataKey="revenue" fill="#10B981" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Channel Performance */}
      {channelData.length > 0 && (
        <div className="h-80">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Channel</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={channelData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {channelData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}