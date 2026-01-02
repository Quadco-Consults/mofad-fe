'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatNumber } from '@/lib/utils'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Receipt,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building,
  Users,
  Calculator,
  BarChart3,
  PieChart,
  FileText,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download,
  Eye,
  Settings,
  Database,
  Target,
  Calendar
} from 'lucide-react'
import { FinancialCharts } from '@/components/finance/FinancialCharts'
import { AccountsReceivable } from '@/components/finance/AccountsReceivable'
import { AccountsPayable } from '@/components/finance/AccountsPayable'
import { CashFlowAnalysis } from '@/components/finance/CashFlowAnalysis'

interface FinancialMetric {
  title: string
  value: string | number
  change: number
  trend: 'up' | 'down'
  icon: any
  color: string
  subtitle?: string
  target?: number
}

interface SAGEStatus {
  connected: boolean
  lastSync: string
  version: string
  database: string
  errors: number
}

const AdvancedMetricCard = ({ title, value, change, trend, icon: Icon, color, subtitle, target }: FinancialMetric) => {
  const colors = {
    blue: {
      bg: 'from-blue-500 to-blue-600',
      light: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      text: 'text-blue-600'
    },
    green: {
      bg: 'from-green-500 to-green-600',
      light: 'bg-green-50',
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      text: 'text-green-600'
    },
    red: {
      bg: 'from-red-500 to-red-600',
      light: 'bg-red-50',
      border: 'border-red-200',
      icon: 'bg-red-100 text-red-600',
      text: 'text-red-600'
    },
    orange: {
      bg: 'from-orange-500 to-orange-600',
      light: 'bg-orange-50',
      border: 'border-orange-200',
      icon: 'bg-orange-100 text-orange-600',
      text: 'text-orange-600'
    },
    purple: {
      bg: 'from-purple-500 to-purple-600',
      light: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'bg-purple-100 text-purple-600',
      text: 'text-purple-600'
    }
  }

  const colorScheme = colors[color as keyof typeof colors] || colors.blue

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden relative ${colorScheme.light} ${colorScheme.border} border-0`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colorScheme.bg} opacity-5 group-hover:opacity-10 transition-opacity`}></div>
      <CardContent className="p-6 relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorScheme.icon} group-hover:scale-110 transition-transform`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="text-right">
            <div className={`flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trend === 'up' ? (
                <ArrowUpRight className="h-4 w-4 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 mr-1" />
              )}
              <span className="text-sm font-semibold">{Math.abs(change)}%</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-600">{title}</h3>
          <p className="text-2xl font-bold text-gray-900">
            {typeof value === 'number' ? formatCurrency(value) : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {target && (
            <div className="flex items-center justify-between text-xs text-gray-500 mt-2">
              <span>Target: {formatCurrency(target)}</span>
              <span className={`font-medium ${typeof value === 'number' && value >= target ? 'text-green-600' : 'text-orange-600'}`}>
                {typeof value === 'number' ? Math.round((value / target) * 100) : 0}%
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

const SAGEStatusCard = ({ status }: { status: SAGEStatus }) => {
  return (
    <Card className="border-0 bg-gradient-to-r from-slate-50 to-gray-50">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${status.connected ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Database className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">SAGE Integration</h3>
              <p className={`text-sm ${status.connected ? 'text-green-600' : 'text-red-600'}`}>
                {status.connected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync Now
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Version</p>
            <p className="font-semibold">{status.version}</p>
          </div>
          <div>
            <p className="text-gray-500">Database</p>
            <p className="font-semibold">{status.database}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Sync</p>
            <p className="font-semibold">{status.lastSync}</p>
          </div>
          <div>
            <p className="text-gray-500">Errors</p>
            <p className={`font-semibold ${status.errors > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {status.errors}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function FinancePage() {
  const [refreshing, setRefreshing] = useState(false)
  const [isLive, setIsLive] = useState(true)

  const { data: financialData, refetch } = useQuery({
    queryKey: ['financial-dashboard'],
    queryFn: () => apiClient.get('/finance/dashboard'),
    refetchInterval: isLive ? 30000 : false, // Refresh every 30 seconds if live
  })

  const handleRefresh = async () => {
    setRefreshing(true)
    await refetch()
    setTimeout(() => setRefreshing(false), 1000)
  }

  // Mock SAGE status - in real implementation, this would come from your SAGE API
  const sageStatus: SAGEStatus = {
    connected: true,
    lastSync: new Date().toLocaleTimeString(),
    version: 'SAGE 50 v2024.1',
    database: 'MOFAD_LIVE',
    errors: 0
  }

  // Mock financial metrics - in real implementation, these would come from SAGE
  const financialMetrics: FinancialMetric[] = [
    {
      title: 'Cash Balance',
      value: 45280000,
      change: 12.5,
      trend: 'up',
      icon: Wallet,
      color: 'green',
      subtitle: 'All bank accounts',
      target: 50000000
    },
    {
      title: 'Accounts Receivable',
      value: 128500000,
      change: -5.2,
      trend: 'down',
      icon: Receipt,
      color: 'blue',
      subtitle: '245 outstanding invoices',
      target: 120000000
    },
    {
      title: 'Accounts Payable',
      value: 67300000,
      change: 8.1,
      trend: 'up',
      icon: CreditCard,
      color: 'orange',
      subtitle: '156 pending payments',
      target: 70000000
    },
    {
      title: 'Net Profit Margin',
      value: '18.7%',
      change: 2.3,
      trend: 'up',
      icon: TrendingUp,
      color: 'purple',
      subtitle: 'This quarter',
      target: 20
    },
    {
      title: 'Revenue (YTD)',
      value: 892400000,
      change: 15.8,
      trend: 'up',
      icon: BarChart3,
      color: 'green',
      subtitle: 'Year to date',
      target: 1000000000
    },
    {
      title: 'Operating Expenses',
      value: 234600000,
      change: -3.4,
      trend: 'down',
      icon: Calculator,
      color: 'red',
      subtitle: 'Monthly average',
      target: 250000000
    }
  ]

  return (
    <AppLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Management</h1>
            <p className="text-gray-600">SAGE-integrated financial dashboard and controls</p>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsLive(!isLive)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isLive
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isLive ? (
                <>
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Live Updates
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4" />
                  Manual Refresh
                </>
              )}
            </button>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Button>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* SAGE Status */}
        <SAGEStatusCard status={sageStatus} />

        {/* Financial Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {financialMetrics.map((metric, index) => (
            <AdvancedMetricCard key={index} {...metric} />
          ))}
        </div>

        {/* Financial Charts */}
        <FinancialCharts data={financialData} />

        {/* Cash Flow Analysis */}
        <CashFlowAnalysis />

        {/* Accounts Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <AccountsReceivable />
          <AccountsPayable />
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2" />
              Quick Financial Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex-col">
                <Receipt className="h-6 w-6 mb-2" />
                Create Invoice
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <CreditCard className="h-6 w-6 mb-2" />
                Record Payment
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <FileText className="h-6 w-6 mb-2" />
                Financial Reports
              </Button>
              <Button variant="outline" className="h-20 flex-col">
                <Calculator className="h-6 w-6 mb-2" />
                Budget Analysis
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}