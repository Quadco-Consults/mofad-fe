'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine
} from 'recharts'
import {
  Activity,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Eye,
  RefreshCw
} from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface CashFlowData {
  date: string
  cashIn: number
  cashOut: number
  netFlow: number
  runningBalance: number
  forecast?: boolean
}

interface CashFlowMetric {
  title: string
  value: number
  change: number
  trend: 'up' | 'down'
  icon: any
  color: string
  description: string
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
        <p className="font-semibold text-gray-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm flex items-center" style={{ color: entry.color }}>
            <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: entry.color }}></span>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export function CashFlowAnalysis() {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'quarter' | 'year'>('month')
  const [viewType, setViewType] = useState<'actual' | 'forecast' | 'both'>('both')
  const [refreshing, setRefreshing] = useState(false)

  // Generate mock cash flow data
  const cashFlowData = useMemo(() => {
    const periods = timeRange === 'week' ? 7 : timeRange === 'month' ? 30 : timeRange === 'quarter' ? 90 : 365
    const data: CashFlowData[] = []
    let runningBalance = 45000000 // Starting balance

    for (let i = periods - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)

      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const baseInflow = isWeekend ? 2000000 : 8000000
      const baseOutflow = isWeekend ? 1500000 : 6000000

      const cashIn = baseInflow + (Math.random() * 3000000)
      const cashOut = baseOutflow + (Math.random() * 2500000)
      const netFlow = cashIn - cashOut
      runningBalance += netFlow

      data.push({
        date: timeRange === 'week' || timeRange === 'month'
          ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        cashIn,
        cashOut,
        netFlow,
        runningBalance,
        forecast: i < 0 // No forecasting in this mock, but could be added
      })
    }

    return data
  }, [timeRange])

  // Calculate cash flow metrics
  const metrics: CashFlowMetric[] = useMemo(() => {
    const totalCashIn = cashFlowData.reduce((sum, item) => sum + item.cashIn, 0)
    const totalCashOut = cashFlowData.reduce((sum, item) => sum + item.cashOut, 0)
    const netCashFlow = totalCashIn - totalCashOut
    const averageDailyFlow = netCashFlow / cashFlowData.length
    const currentBalance = cashFlowData[cashFlowData.length - 1]?.runningBalance || 0
    const previousBalance = cashFlowData[0]?.runningBalance || 0
    const balanceChange = ((currentBalance - previousBalance) / previousBalance) * 100

    return [
      {
        title: 'Current Cash Balance',
        value: currentBalance,
        change: balanceChange,
        trend: balanceChange >= 0 ? 'up' : 'down',
        icon: DollarSign,
        color: 'green',
        description: 'Total available cash across all accounts'
      },
      {
        title: 'Total Cash Inflow',
        value: totalCashIn,
        change: 12.5,
        trend: 'up',
        icon: ArrowUpRight,
        color: 'blue',
        description: `Cash received during ${timeRange} period`
      },
      {
        title: 'Total Cash Outflow',
        value: totalCashOut,
        change: -5.2,
        trend: 'down',
        icon: ArrowDownRight,
        color: 'red',
        description: `Cash paid out during ${timeRange} period`
      },
      {
        title: 'Net Cash Flow',
        value: netCashFlow,
        change: 18.7,
        trend: netCashFlow >= 0 ? 'up' : 'down',
        icon: Activity,
        color: netCashFlow >= 0 ? 'green' : 'red',
        description: 'Net change in cash position'
      },
      {
        title: 'Average Daily Flow',
        value: averageDailyFlow,
        change: 8.3,
        trend: 'up',
        icon: TrendingUp,
        color: 'purple',
        description: 'Daily average net cash movement'
      },
      {
        title: 'Cash Conversion Cycle',
        value: 45, // Mock days
        change: -12.1,
        trend: 'down',
        icon: Clock,
        color: 'orange',
        description: 'Days to convert inventory to cash'
      }
    ]
  }, [cashFlowData, timeRange])

  const handleRefresh = async () => {
    setRefreshing(true)
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Identify periods with negative cash flow
  const negativeFlowPeriods = cashFlowData.filter(item => item.netFlow < 0).length
  const criticalBalance = Math.min(...cashFlowData.map(item => item.runningBalance))
  const isCritical = criticalBalance < 10000000 // 10M threshold

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            Cash Flow Analysis
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Detailed Report
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Warning Banner for Critical Cash Flow */}
        {(isCritical || negativeFlowPeriods > 5) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-red-900">Cash Flow Alert</h4>
              <p className="text-sm text-red-700 mt-1">
                {isCritical && `Critical: Cash balance dropped to ${formatCurrency(criticalBalance)} during this period. `}
                {negativeFlowPeriods > 5 && `Warning: ${negativeFlowPeriods} periods with negative cash flow detected.`}
              </p>
            </div>
          </div>
        )}

        {/* Control Panel */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex space-x-2">
            {(['week', 'month', 'quarter', 'year'] as const).map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimeRange(range)}
                className="capitalize"
              >
                {range}
              </Button>
            ))}
          </div>
          <div className="flex space-x-2">
            {(['actual', 'forecast', 'both'] as const).map((view) => (
              <Button
                key={view}
                variant={viewType === view ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewType(view)}
                className="capitalize"
              >
                {view === 'both' ? 'Actual + Forecast' : view}
              </Button>
            ))}
          </div>
        </div>

        {/* Cash Flow Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {metrics.map((metric, index) => {
            const IconComponent = metric.icon
            return (
              <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    metric.color === 'green' ? 'bg-green-100 text-green-600' :
                    metric.color === 'blue' ? 'bg-blue-100 text-blue-600' :
                    metric.color === 'red' ? 'bg-red-100 text-red-600' :
                    metric.color === 'purple' ? 'bg-purple-100 text-purple-600' :
                    metric.color === 'orange' ? 'bg-orange-100 text-orange-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div className={`flex items-center text-sm ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-3 w-3 mr-1" />
                    ) : (
                      <TrendingDown className="h-3 w-3 mr-1" />
                    )}
                    {Math.abs(metric.change).toFixed(1)}%
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">{metric.title}</h3>
                <p className="text-xl font-bold text-gray-900 mb-1">
                  {typeof metric.value === 'number' ?
                    (metric.title.includes('Cycle') ? `${metric.value} days` : formatCurrency(metric.value)) :
                    metric.value
                  }
                </p>
                <p className="text-xs text-gray-500">{metric.description}</p>
              </div>
            )
          })}
        </div>

        {/* Cash Flow Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Cash Flow Over Time */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Cash Flow Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="cashIn" name="Cash Inflow" fill="#10B981" radius={[2, 2, 0, 0]} />
                <Bar dataKey="cashOut" name="Cash Outflow" fill="#EF4444" radius={[2, 2, 0, 0]} />
                <Line
                  type="monotone"
                  dataKey="netFlow"
                  name="Net Cash Flow"
                  stroke="#3B82F6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <ReferenceLine y={0} stroke="#6b7280" strokeDasharray="2 2" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          {/* Cash Balance Trend */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Cash Balance Trend</h4>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={cashFlowData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" stroke="#6b7280" />
                <YAxis stroke="#6b7280" tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="runningBalance"
                  name="Cash Balance"
                  stroke="#8B5CF6"
                  strokeWidth={3}
                  dot={{ r: 4 }}
                />
                <ReferenceLine y={10000000} stroke="#ef4444" strokeDasharray="5 5" label="Critical Level" />
                <ReferenceLine y={25000000} stroke="#f59e0b" strokeDasharray="5 5" label="Warning Level" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cash Flow Insights */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Key Insights */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Key Insights
            </h4>
            <div className="space-y-2 text-sm text-blue-800">
              <p>• Strong positive cash flow maintained over {timeRange} period</p>
              <p>• Peak cash generation typically occurs mid-week</p>
              <p>• Payment cycles align well with industry standards</p>
              <p>• Seasonal patterns show Q4 strength in petroleum sector</p>
              {negativeFlowPeriods > 0 && (
                <p className="text-orange-700">• Monitor {negativeFlowPeriods} periods with negative flow</p>
              )}
            </div>
          </div>

          {/* Recommendations */}
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-900 mb-3 flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Recommendations
            </h4>
            <div className="space-y-2 text-sm text-green-800">
              <p>• Optimize collection cycles to reduce receivables</p>
              <p>• Consider short-term investments for excess cash</p>
              <p>• Negotiate better payment terms with major suppliers</p>
              <p>• Implement cash flow forecasting for next quarter</p>
              {isCritical && (
                <p className="text-red-700">• Immediate action needed: Secure additional financing</p>
              )}
            </div>
          </div>
        </div>

        {/* SAGE Integration Status */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">
                Real-time data sync with SAGE • Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Schedule Report
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}