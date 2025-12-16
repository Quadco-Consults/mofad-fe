'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts'
import {
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  BarChart3,
  Activity
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface FinancialChartsProps {
  data?: any
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function FinancialCharts({ data }: FinancialChartsProps) {
  const [activeChart, setActiveChart] = useState<'revenue' | 'cashflow' | 'profitability' | 'expenses'>('revenue')

  // Mock financial data - in real implementation, this would come from SAGE API
  const revenueData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return months.map(month => ({
      month,
      currentYear: Math.floor(Math.random() * 50000000) + 70000000,
      previousYear: Math.floor(Math.random() * 45000000) + 60000000,
      forecast: Math.floor(Math.random() * 55000000) + 75000000,
    }))
  }, [])

  const cashFlowData = useMemo(() => {
    const weeks = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`)
    return weeks.map(week => ({
      week,
      cashIn: Math.floor(Math.random() * 15000000) + 10000000,
      cashOut: Math.floor(Math.random() * 12000000) + 8000000,
      netFlow: 0 // Will be calculated
    })).map(item => ({
      ...item,
      netFlow: item.cashIn - item.cashOut
    }))
  }, [])

  const profitabilityData = useMemo(() => {
    const quarters = ['Q1 2023', 'Q2 2023', 'Q3 2023', 'Q4 2023', 'Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024']
    return quarters.map(quarter => ({
      quarter,
      grossProfit: Math.floor(Math.random() * 30000000) + 40000000,
      operatingProfit: Math.floor(Math.random() * 20000000) + 25000000,
      netProfit: Math.floor(Math.random() * 15000000) + 18000000,
      margin: Math.floor(Math.random() * 10) + 15
    }))
  }, [])

  const expenseBreakdown = useMemo(() => [
    { name: 'Petroleum Products', value: 450000000, color: '#3B82F6' },
    { name: 'Transportation', value: 85000000, color: '#10B981' },
    { name: 'Personnel', value: 65000000, color: '#F59E0B' },
    { name: 'Operations', value: 45000000, color: '#EF4444' },
    { name: 'Marketing', value: 25000000, color: '#8B5CF6' },
    { name: 'Administrative', value: 35000000, color: '#06B6D4' },
    { name: 'Other', value: 15000000, color: '#6B7280' }
  ], [])

  const departmentExpenses = useMemo(() => {
    const departments = ['Sales', 'Operations', 'Marketing', 'Admin', 'IT', 'HR', 'Finance']
    return departments.map(dept => ({
      department: dept,
      budget: Math.floor(Math.random() * 20000000) + 15000000,
      actual: Math.floor(Math.random() * 18000000) + 12000000,
      variance: 0 // Will be calculated
    })).map(item => ({
      ...item,
      variance: ((item.actual - item.budget) / item.budget) * 100
    }))
  }, [])

  const chartTabs = [
    { id: 'revenue', label: 'Revenue Analysis', icon: TrendingUp },
    { id: 'cashflow', label: 'Cash Flow', icon: Activity },
    { id: 'profitability', label: 'Profitability', icon: DollarSign },
    { id: 'expenses', label: 'Expense Analysis', icon: PieChartIcon }
  ]

  const renderChart = () => {
    switch (activeChart) {
      case 'revenue':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="currentYear" name="2024 Actual" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="previousYear" name="2023 Actual" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="forecast"
                name="2024 Forecast"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'cashflow':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={cashFlowData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="week" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="cashIn" name="Cash Inflow" fill="#10B981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="cashOut" name="Cash Outflow" fill="#EF4444" radius={[4, 4, 0, 0]} />
              <Line
                type="monotone"
                dataKey="netFlow"
                name="Net Cash Flow"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )

      case 'profitability':
        return (
          <ResponsiveContainer width="100%" height={400}>
            <LineChart data={profitabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" stroke="#6b7280" />
              <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="grossProfit"
                name="Gross Profit"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="operatingProfit"
                name="Operating Profit"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
              <Line
                type="monotone"
                dataKey="netProfit"
                name="Net Profit"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )

      case 'expenses':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h4 className="text-lg font-semibold mb-4">Expense Breakdown</h4>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={expenseBreakdown}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {expenseBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Budget vs Actual by Department</h4>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={departmentExpenses} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" tickFormatter={(value) => formatCurrency(value)} />
                  <YAxis type="category" dataKey="department" stroke="#6b7280" />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#93C5FD" />
                  <Bar dataKey="actual" name="Actual" fill="#3B82F6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            Financial Analytics
          </div>
          <div className="text-sm text-gray-500">
            Data synced from SAGE • Last update: {new Date().toLocaleTimeString()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {chartTabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveChart(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeChart === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <IconComponent className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Chart Content */}
        <div className="w-full">
          {renderChart()}
        </div>

        {/* Chart Insights */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Key Insights</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-blue-800">
            {activeChart === 'revenue' && (
              <>
                <p>• Revenue up 15.8% YoY</p>
                <p>• Q4 forecast on track</p>
                <p>• Peak season performance strong</p>
              </>
            )}
            {activeChart === 'cashflow' && (
              <>
                <p>• Positive cash flow maintained</p>
                <p>• Peak inflow in Week 8</p>
                <p>• Outflow control improving</p>
              </>
            )}
            {activeChart === 'profitability' && (
              <>
                <p>• Net margin at 18.7%</p>
                <p>• Operating efficiency up 3.2%</p>
                <p>• Cost control initiatives effective</p>
              </>
            )}
            {activeChart === 'expenses' && (
              <>
                <p>• Petroleum costs 62% of total</p>
                <p>• Transportation efficiency gains</p>
                <p>• Administrative costs under budget</p>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}