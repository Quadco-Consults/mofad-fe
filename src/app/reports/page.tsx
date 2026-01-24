'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Download,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Package,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Printer,
  FileSpreadsheet,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  PieChart,
  LineChart,
  Plus,
  Settings,
  Eye,
  Edit,
  Trash2,
  Calculator,
  CreditCard,
  Building2,
  UserMinus,
  Fuel,
  ShoppingCart,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Save,
  Loader2
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'

interface StandardReport {
  id: string
  name: string
  description: string
  icon: any
  category: 'financial' | 'inventory' | 'sales' | 'customer'
  lastGenerated?: string
  status: 'ready' | 'generating' | 'error'
}

interface CustomReport {
  id: string
  name: string
  description: string
  type: 'sales_by_lubebay' | 'sales_by_type' | 'direct_sales' | 'custom'
  filters: CustomReportFilter[]
  dateRange: { start: string; end: string }
  createdAt: string
  createdBy: string
  lastRun?: string
}

interface CustomReportFilter {
  field: string
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'between'
  value: any
}

interface ExpenseReportData {
  totalExpenses: number
  expensesByCategory: { category: string; amount: number; percentage: number }[]
  monthlyTrend: { month: string; amount: number }[]
  topExpenses: { description: string; amount: number; date: string }[]
}

interface ProfitLossData {
  revenue: number
  expenses: number
  grossProfit: number
  netProfit: number
  profitMargin: number
  revenueByProduct: { product: string; revenue: number }[]
  monthlyProfitTrend: { month: string; profit: number }[]
}

interface StockReportData {
  totalProducts: number
  lowStockItems: number
  outOfStockItems: number
  totalValue: number
  stockByCategory: { category: string; quantity: number; value: number }[]
  fastMovingItems: { product: string; sold: number }[]
}

interface DebtorsListData {
  totalDebtors: number
  totalOutstanding: number
  overdueAmount: number
  debtors: {
    id: number
    name: string
    totalDebt: number
    overdueAmount: number
    lastPayment: string
    daysPastDue: number
  }[]
}

function ReportsPage() {
  const [activeView, setActiveView] = useState<'dashboard' | 'standard' | 'custom' | 'view'>('dashboard')
  const [selectedReport, setSelectedReport] = useState<string | null>(null)
  const [showCustomReportModal, setShowCustomReportModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [dateRange, setDateRange] = useState({ start: '2024-01-01', end: '2024-12-31' })
  const [reportData, setReportData] = useState<any>(null)
  const [generatingReport, setGeneratingReport] = useState(false)

  // Standard reports configuration
  const standardReports: StandardReport[] = [
    {
      id: 'expense-report',
      name: 'Expense Report',
      description: 'Detailed breakdown of all expenses by category and time period',
      icon: Calculator,
      category: 'financial',
      status: 'ready',
      lastGenerated: '2024-01-20T10:30:00Z'
    },
    {
      id: 'profit-loss',
      name: 'Profit & Loss Statement',
      description: 'Complete profit and loss analysis with revenue and expense breakdown',
      icon: TrendingUp,
      category: 'financial',
      status: 'ready',
      lastGenerated: '2024-01-19T15:45:00Z'
    },
    {
      id: 'stock-report',
      name: 'Stock Report',
      description: 'Inventory levels, stock movements, and valuation report',
      icon: Package,
      category: 'inventory',
      status: 'ready',
      lastGenerated: '2024-01-20T08:15:00Z'
    },
    {
      id: 'debtors-list',
      name: 'Debtors List',
      description: 'Outstanding customer debts and payment history',
      icon: UserMinus,
      category: 'customer',
      status: 'ready',
      lastGenerated: '2024-01-18T14:20:00Z'
    },
    {
      id: 'cash-flow',
      name: 'Cash Flow Statement',
      description: 'Cash inflows and outflows analysis',
      icon: DollarSign,
      category: 'financial',
      status: 'ready'
    },
    {
      id: 'sales-summary',
      name: 'Sales Summary',
      description: 'Overall sales performance and trends',
      icon: ShoppingCart,
      category: 'sales',
      status: 'ready'
    }
  ]

  // Custom report templates
  const customReportTemplates = [
    {
      id: 'sales-by-lubebay',
      name: 'Sales by Lube Bay',
      description: 'Sales performance analysis by individual lube bay locations',
      icon: Building2,
      type: 'sales_by_lubebay' as const
    },
    {
      id: 'sales-by-type',
      name: 'Sales by Type',
      description: 'Sales breakdown by product type or category',
      icon: PieChart,
      type: 'sales_by_type' as const
    },
    {
      id: 'direct-sales',
      name: 'Direct Sales Report',
      description: 'Analysis of direct sales vs. wholesale transactions',
      icon: Target,
      type: 'direct_sales' as const
    },
    {
      id: 'custom',
      name: 'Custom Report',
      description: 'Build your own custom report with flexible filters',
      icon: Settings,
      type: 'custom' as const
    }
  ]

  // Sample report data - in real implementation, this would come from API
  const sampleExpenseData: ExpenseReportData = {
    totalExpenses: 15750000,
    expensesByCategory: [
      { category: 'Product Purchases', amount: 8500000, percentage: 54 },
      { category: 'Operations', amount: 3250000, percentage: 21 },
      { category: 'Staff Salaries', amount: 2750000, percentage: 17 },
      { category: 'Utilities', amount: 875000, percentage: 6 },
      { category: 'Maintenance', amount: 375000, percentage: 2 }
    ],
    monthlyTrend: [
      { month: 'Jan 2024', amount: 1200000 },
      { month: 'Feb 2024', amount: 1350000 },
      { month: 'Mar 2024', amount: 1450000 },
      { month: 'Apr 2024', amount: 1320000 },
      { month: 'May 2024', amount: 1480000 },
      { month: 'Jun 2024', amount: 1550000 }
    ],
    topExpenses: [
      { description: 'Lubricant Purchase - Ardova Plc', amount: 2500000, date: '2024-01-15' },
      { description: 'Equipment Maintenance', amount: 450000, date: '2024-01-12' },
      { description: 'Staff Salaries - January', amount: 875000, date: '2024-01-31' },
      { description: 'Utility Bills - December', amount: 125000, date: '2024-01-05' }
    ]
  }

  const sampleProfitLossData: ProfitLossData = {
    revenue: 25000000,
    expenses: 15750000,
    grossProfit: 9250000,
    netProfit: 8850000,
    profitMargin: 35.4,
    revenueByProduct: [
      { product: 'Engine Oil', revenue: 12500000 },
      { product: 'Lubricants', revenue: 7800000 },
      { product: 'Filters', revenue: 2900000 },
      { product: 'Services', revenue: 1800000 }
    ],
    monthlyProfitTrend: [
      { month: 'Jan', profit: 1200000 },
      { month: 'Feb', profit: 1450000 },
      { month: 'Mar', profit: 1680000 },
      { month: 'Apr', profit: 1320000 },
      { month: 'May', profit: 1750000 },
      { month: 'Jun', profit: 1450000 }
    ]
  }

  const sampleStockData: StockReportData = {
    totalProducts: 245,
    lowStockItems: 12,
    outOfStockItems: 3,
    totalValue: 18500000,
    stockByCategory: [
      { category: 'Engine Oil', quantity: 1250, value: 8500000 },
      { category: 'Lubricants', quantity: 890, value: 5200000 },
      { category: 'Filters', quantity: 420, value: 2100000 },
      { category: 'Additives', quantity: 180, value: 1800000 },
      { category: 'Tools', quantity: 95, value: 900000 }
    ],
    fastMovingItems: [
      { product: 'Shell 20W50', sold: 145 },
      { product: 'Mobil Super', sold: 120 },
      { product: 'Castrol GTX', sold: 98 },
      { product: 'Total Quartz', sold: 87 }
    ]
  }

  const sampleDebtorsData: DebtorsListData = {
    totalDebtors: 18,
    totalOutstanding: 8750000,
    overdueAmount: 3200000,
    debtors: [
      {
        id: 1,
        name: 'ANN TI CONSTRUCTION LIMITED',
        totalDebt: 2500000,
        overdueAmount: 1200000,
        lastPayment: '2023-12-15',
        daysPastDue: 45
      },
      {
        id: 2,
        name: 'Yaharia Synergy Service',
        totalDebt: 1800000,
        overdueAmount: 800000,
        lastPayment: '2024-01-05',
        daysPastDue: 20
      },
      {
        id: 3,
        name: 'S.A.MULTI TECH VENTURE',
        totalDebt: 1500000,
        overdueAmount: 500000,
        lastPayment: '2024-01-10',
        daysPastDue: 15
      },
      {
        id: 4,
        name: 'Kemmal Media Print',
        totalDebt: 950000,
        overdueAmount: 450000,
        lastPayment: '2023-11-28',
        daysPastDue: 60
      },
      {
        id: 5,
        name: 'Backer Media Print',
        totalDebt: 750000,
        overdueAmount: 250000,
        lastPayment: '2024-01-12',
        daysPastDue: 12
      }
    ]
  }

  // Utility functions
  const handleGenerateReport = async (reportId: string) => {
    setGeneratingReport(true)
    setSelectedReport(reportId)

    try {
      // Map frontend report IDs to backend endpoints
      const reportEndpoints = {
        'expense-report': 'financial-dashboard', // Expenses are part of financial dashboard
        'profit-loss': 'profit-loss',
        'stock-report': 'inventory-analytics',
        'debtors-list': 'customer-analytics', // Debtors are part of customer analytics
        'cash-flow': 'cash-flow',
        'sales-summary': 'sales-analytics'
      }

      const endpoint = reportEndpoints[reportId as keyof typeof reportEndpoints]
      if (!endpoint) {
        throw new Error(`No endpoint found for report: ${reportId}`)
      }

      // Make API call to Django backend
      const response = await apiClient.get(`/reports/${endpoint}/`, {
        period: 'ytd' // You can make this configurable
      })

      setReportData(response.data)
      setActiveView('view')
    } catch (error) {
      console.error('Error generating report:', error)
      setReportData({
        error: 'Failed to generate report. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
      setActiveView('view')
    } finally {
      setGeneratingReport(false)
    }
  }

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    console.log(`Exporting report in ${format} format...`)
    // Implementation for export functionality
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'text-green-600 bg-green-100'
      case 'generating':
        return 'text-yellow-600 bg-yellow-100'
      case 'error':
        return 'text-red-600 bg-red-100'
      default:
        return 'text-gray-600 bg-gray-100'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'financial':
        return DollarSign
      case 'inventory':
        return Package
      case 'sales':
        return ShoppingCart
      case 'customer':
        return Users
      default:
        return FileText
    }
  }

  // Render functions for different views
  const renderDashboard = () => (
    <div className="space-y-8">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Reports Generated</p>
              <p className="text-2xl font-bold">24</p>
              <p className="text-sm text-blue-200">This month</p>
            </div>
            <FileText className="h-8 w-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Total Revenue</p>
              <p className="text-2xl font-bold">₦25M</p>
              <p className="text-sm text-green-200">YTD</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Outstanding Debts</p>
              <p className="text-2xl font-bold">₦8.8M</p>
              <p className="text-sm text-yellow-200">18 debtors</p>
            </div>
            <AlertCircle className="h-8 w-8 text-yellow-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-6 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Stock Value</p>
              <p className="text-2xl font-bold">₦18.5M</p>
              <p className="text-sm text-purple-200">245 products</p>
            </div>
            <Package className="h-8 w-8 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Standard Reports */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Standard Reports</h2>
          <button
            onClick={() => setActiveView('standard')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {standardReports.slice(0, 6).map((report) => {
            const Icon = report.icon
            const CategoryIcon = getCategoryIcon(report.category)
            return (
              <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Icon className="h-6 w-6 text-orange-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{report.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CategoryIcon className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500 capitalize">{report.category}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                    {report.status === 'ready' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                    {report.status === 'generating' && <Clock className="h-3 w-3 inline mr-1 animate-spin" />}
                    {report.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{report.description}</p>
                {report.lastGenerated && (
                  <p className="text-xs text-gray-500 mb-4">
                    Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                  </p>
                )}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleGenerateReport(report.id)}
                    disabled={generatingReport}
                    className="flex-1 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingReport && selectedReport === report.id ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                        Generating...
                      </>
                    ) : (
                      'Generate'
                    )}
                  </button>
                  <button className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    <Eye className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Custom Reports */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Custom Reports</h2>
          <button
            onClick={() => setActiveView('custom')}
            className="text-orange-600 hover:text-orange-700 font-medium"
          >
            View All
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customReportTemplates.map((template) => {
            const Icon = template.icon
            return (
              <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
                <div className="text-center">
                  <div className="p-3 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <Icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                  <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                  <button
                    onClick={() => {
                      setSelectedReport(template.id)
                      setShowCustomReportModal(true)
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all"
                  >
                    Create Report
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )

  const renderStandardReports = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {standardReports.map((report) => {
          const Icon = report.icon
          const CategoryIcon = getCategoryIcon(report.category)

          return (
            <div key={report.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Icon className="h-8 w-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <CategoryIcon className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-gray-500 capitalize">{report.category}</span>
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                  {report.status === 'ready' && <CheckCircle className="h-3 w-3 inline mr-1" />}
                  {report.status === 'generating' && <Clock className="h-3 w-3 inline mr-1 animate-spin" />}
                  {report.status}
                </span>
              </div>

              <p className="text-sm text-gray-600 mb-4">{report.description}</p>

              {report.lastGenerated && (
                <p className="text-xs text-gray-500 mb-4">
                  Last generated: {new Date(report.lastGenerated).toLocaleDateString()}
                </p>
              )}

              <div className="space-y-2">
                <button
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={generatingReport}
                  className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {generatingReport && selectedReport === report.id ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin inline mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <BarChart3 className="h-4 w-4 inline mr-2" />
                      Generate Report
                    </>
                  )}
                </button>

                <div className="flex gap-2">
                  <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Eye className="h-4 w-4 inline mr-1" />
                    View Last
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Download className="h-4 w-4 inline mr-1" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderCustomReports = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => setActiveView('dashboard')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {customReportTemplates.map((template) => {
          const Icon = template.icon

          return (
            <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow">
              <div className="text-center">
                <div className="p-4 bg-gradient-to-r from-orange-100 to-amber-100 rounded-full w-20 h-20 mx-auto mb-4 flex items-center justify-center">
                  <Icon className="h-10 w-10 text-orange-600" />
                </div>

                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-6">{template.description}</p>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedReport(template.id)
                      setShowCustomReportModal(true)
                    }}
                    className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all"
                  >
                    <Plus className="h-4 w-4 inline mr-2" />
                    Create Report
                  </button>

                  <button className="w-full border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                    <Eye className="h-4 w-4 inline mr-2" />
                    View Templates
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Recent Custom Reports */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Recent Custom Reports</h3>
        </div>
        <div className="p-6">
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No custom reports created yet</p>
            <p className="text-sm text-gray-400 mt-2">Create your first custom report to see it here</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderReportViewer = () => {
    if (!reportData || !selectedReport) return null

    // Handle API errors
    if (reportData.error) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Report Error</h2>
              <p className="text-gray-600">Failed to generate report</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <h3 className="text-lg font-semibold text-red-900">Error Generating Report</h3>
                <p className="text-red-700">{reportData.error}</p>
              </div>
            </div>
            {reportData.details && (
              <p className="text-sm text-red-600 mt-3">Details: {reportData.details}</p>
            )}
            <div className="mt-4">
              <button
                onClick={() => handleGenerateReport(selectedReport)}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )
    }

    const renderExpenseReport = () => (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    reportData.expenses?.total_expenses ||
                    reportData.expense_data?.total_expenses ||
                    reportData.totalExpenses ||
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Top Category</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(reportData.expense_breakdown?.[0] || reportData.expensesByCategory?.[0])?.category || 'N/A'}
                </p>
                <p className="text-sm text-gray-500">
                  {(reportData.expense_breakdown?.[0] || reportData.expensesByCategory?.[0])?.percentage || 0}% of total
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="flex items-center gap-3 mb-2">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Period</p>
                <p className="text-xl font-bold text-gray-900">{reportData.period?.toUpperCase() || 'YTD'}</p>
                <p className="text-sm text-gray-500">
                  {reportData.date_range ?
                    `${new Date(reportData.date_range.start).toLocaleDateString()} - ${new Date(reportData.date_range.end).toLocaleDateString()}` :
                    'Current period'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Expenses by Category */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h3>
          <div className="space-y-4">
            {(reportData.expense_breakdown || reportData.expensesByCategory || []).map((category: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                  <span className="font-medium text-gray-900">{category.category || category.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{formatCurrency(category.amount || category.total || 0)}</p>
                  <p className="text-sm text-gray-500">{category.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Expenses */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Top Expenses</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.topExpenses.map((expense: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{expense.description}</td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-gray-900">{formatCurrency(expense.amount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(expense.date).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )

    const renderProfitLossReport = () => {
      // Handle backend data structure
      const revenue = reportData.revenue || {}
      const expenses = reportData.expenses || {}
      const netResult = reportData.net_result || {}

      return (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-700">Revenue</p>
                  <p className="text-2xl font-bold text-green-900">
                    {formatCurrency(revenue.total_revenue || reportData.revenue || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <TrendingDown className="h-8 w-8 text-red-600" />
                <div>
                  <p className="text-sm font-medium text-red-700">Expenses</p>
                  <p className="text-2xl font-bold text-red-900">
                    {formatCurrency(expenses.total_expenses || reportData.expenses || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-blue-700">Gross Profit</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {formatCurrency(revenue.gross_profit || reportData.grossProfit || 0)}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
              <div className="flex items-center gap-3">
                <DollarSign className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-orange-700">Net Profit</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {formatCurrency(netResult.net_profit || reportData.netProfit || 0)}
                  </p>
                  <p className="text-sm text-orange-600">
                    {(netResult.net_margin || reportData.profitMargin || 0).toFixed(1)}% margin
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Details from Backend */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Revenue:</span>
                  <span className="font-semibold">{formatCurrency(revenue.total_revenue || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cost of Goods Sold:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(revenue.cost_of_goods_sold || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Profit:</span>
                  <span className="font-semibold text-green-600">{formatCurrency(revenue.gross_profit || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Gross Margin:</span>
                  <span className="font-semibold">{(revenue.gross_margin || 0).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Operating Expenses:</span>
                  <span className="font-semibold">{formatCurrency(expenses.operating_expenses || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Administrative:</span>
                  <span className="font-semibold">{formatCurrency(expenses.administrative_expenses || 0)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-semibold">Total Expenses:</span>
                  <span className="font-semibold text-red-600">{formatCurrency(expenses.total_expenses || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Date Range Display */}
          {reportData.date_range && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <strong>Period:</strong> {reportData.period}
                ({new Date(reportData.date_range.start).toLocaleDateString()} - {new Date(reportData.date_range.end).toLocaleDateString()})
              </p>
            </div>
          )}

          {/* Revenue by Product - Keep existing sample data as fallback */}
          {(reportData.revenueByProduct || sampleProfitLossData.revenueByProduct) && (
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Product</h3>
              <div className="space-y-3">
                {(reportData.revenueByProduct || sampleProfitLossData.revenueByProduct).map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-gray-900">{item.product}</span>
                    <span className="font-semibold text-gray-900">{formatCurrency(item.revenue)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )
    }

    const renderStockReport = () => (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Package className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700">Total Products</p>
                <p className="text-2xl font-bold text-blue-900">
                  {reportData.inventory_summary?.total_products || reportData.total_products || reportData.totalProducts || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-900">
                  {reportData.inventory_summary?.low_stock_count || reportData.low_stock_count || reportData.lowStockItems || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <X className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-700">Out of Stock</p>
                <p className="text-2xl font-bold text-red-900">
                  {reportData.inventory_summary?.out_of_stock_count || reportData.out_of_stock_count || reportData.outOfStockItems || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 border border-green-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-green-700">Total Value</p>
                <p className="text-2xl font-bold text-green-900">
                  {formatCurrency(
                    reportData.inventory_summary?.total_inventory_value ||
                    reportData.total_inventory_value ||
                    reportData.totalValue ||
                    0
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stock by Category */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Stock by Category</h3>
          <div className="space-y-4">
            {reportData.stockByCategory.map((category: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500"></div>
                  <span className="font-medium text-gray-900">{category.category}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{category.quantity} units</p>
                  <p className="text-sm text-gray-500">{formatCurrency(category.value)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )

    const renderDebtorsReport = () => (
      <div className="space-y-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-700">Total Debtors</p>
                <p className="text-2xl font-bold text-blue-900">{reportData.totalDebtors}</p>
              </div>
            </div>
          </div>
          <div className="bg-red-50 border border-red-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-red-700">Total Outstanding</p>
                <p className="text-2xl font-bold text-red-900">{formatCurrency(reportData.totalOutstanding)}</p>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-yellow-700">Overdue Amount</p>
                <p className="text-2xl font-bold text-yellow-900">{formatCurrency(reportData.overdueAmount)}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Debtors List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Debtors List</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Customer</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Total Debt</th>
                  <th className="px-6 py-3 text-right text-sm font-medium text-gray-700">Overdue</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">Last Payment</th>
                  <th className="px-6 py-3 text-center text-sm font-medium text-gray-700">Days Past Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {reportData.debtors.map((debtor: any) => (
                  <tr key={debtor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{debtor.name}</td>
                    <td className="px-6 py-4 text-sm text-right text-gray-900">{formatCurrency(debtor.totalDebt)}</td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-red-600">{formatCurrency(debtor.overdueAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(debtor.lastPayment).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        debtor.daysPastDue > 30 ? 'bg-red-100 text-red-800' :
                        debtor.daysPastDue > 15 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {debtor.daysPastDue} days
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveView('dashboard')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Dashboard
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {standardReports.find(r => r.id === selectedReport)?.name}
              </h2>
              <p className="text-gray-600">Generated on {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handleExportReport('pdf')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Export PDF
            </button>
            <button
              onClick={() => handleExportReport('excel')}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export Excel
            </button>
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              <Printer className="h-4 w-4" />
              Print
            </button>
          </div>
        </div>

        {/* Report Content */}
        {selectedReport === 'expense-report' && renderExpenseReport()}
        {selectedReport === 'profit-loss' && renderProfitLossReport()}
        {selectedReport === 'stock-report' && renderStockReport()}
        {selectedReport === 'debtors-list' && renderDebtorsReport()}
      </div>
    )
  }

  // Custom Report Modal Component
  const renderCustomReportModal = () => {
    if (!showCustomReportModal) return null

    const handleCreateCustomReport = () => {
      // Implementation for creating custom reports
      console.log('Creating custom report for:', selectedReport)
      setShowCustomReportModal(false)
    }

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Create Custom Report</h2>
            <button
              onClick={() => setShowCustomReportModal(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Report Type */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Report Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    placeholder="Enter report name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Report Type</label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                    <option>Sales by Lube Bay</option>
                    <option>Sales by Type</option>
                    <option>Direct Sales Report</option>
                    <option>Custom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date Range */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Date Range</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div>
              <h4 className="text-md font-semibold text-gray-900 mb-3">Filters</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                      <option>All Locations</option>
                      <option>Aminu Kano Crescent -LUBEBAY</option>
                      <option>Ashirafu-dun Adenuje -LUBEBAY</option>
                      <option>Aviation Village -LUBEBAY</option>
                      <option>Gwafu -LUBEBAY</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Product Category</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                      <option>All Categories</option>
                      <option>Engine Oil</option>
                      <option>Lubricants</option>
                      <option>Filters</option>
                      <option>Additives</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sales Type</label>
                    <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500">
                      <option>All Sales</option>
                      <option>Direct Sales</option>
                      <option>Wholesale</option>
                      <option>Retail</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
            <button
              onClick={() => setShowCustomReportModal(false)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCustomReport}
              className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-lg hover:from-orange-600 hover:to-amber-600 transition-all flex items-center gap-2"
            >
              <BarChart3 className="w-4 h-4" />
              Generate Report
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        {activeView === 'dashboard' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Business Reports</h1>
              <p className="text-gray-600 mt-1">Generate, view, and manage your business reports</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search reports..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            </div>
          </div>
        )}

        {/* Navigation Tabs for non-dashboard views */}
        {activeView !== 'dashboard' && activeView !== 'view' && (
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveView('dashboard')}
                className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors"
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveView('standard')}
                className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                  activeView === 'standard'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Standard Reports
              </button>
              <button
                onClick={() => setActiveView('custom')}
                className={`py-4 px-1 border-b-2 font-medium transition-colors ${
                  activeView === 'custom'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Custom Reports
              </button>
            </nav>
          </div>
        )}

        {/* Content based on active view */}
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'standard' && renderStandardReports()}
        {activeView === 'custom' && renderCustomReports()}
        {activeView === 'view' && renderReportViewer()}

        {/* Custom Report Modal */}
        {renderCustomReportModal()}
      </div>
    </AppLayout>
  )
}

export default ReportsPage