'use client'

import { useState } from 'react'
import { Download, Filter, Calendar, DollarSign, TrendingUp, TrendingDown, CreditCard, Building } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface FinancialReport {
  id: string
  period: string
  revenue: number
  expenses: number
  netProfit: number
  grossMargin: number
  receivables: number
  payables: number
  cashFlow: number
  expenseBreakdown: Array<{ category: string; amount: number; percentage: number }>
  revenueBreakdown: Array<{ source: string; amount: number; percentage: number }>
  profitMargin: number
}

const mockFinancialReports: FinancialReport[] = [
  {
    id: '1',
    period: '2024-12',
    revenue: 85000000,
    expenses: 62000000,
    netProfit: 23000000,
    grossMargin: 27.1,
    receivables: 45000000,
    payables: 28000000,
    cashFlow: 15000000,
    expenseBreakdown: [
      { category: 'Cost of Goods Sold', amount: 38000000, percentage: 61.3 },
      { category: 'Staff Salaries', amount: 12000000, percentage: 19.4 },
      { category: 'Operating Expenses', amount: 6500000, percentage: 10.5 },
      { category: 'Transportation', amount: 3200000, percentage: 5.2 },
      { category: 'Marketing', amount: 2300000, percentage: 3.7 }
    ],
    revenueBreakdown: [
      { source: 'Product Sales', amount: 75000000, percentage: 88.2 },
      { source: 'Service Revenue', amount: 8000000, percentage: 9.4 },
      { source: 'Other Income', amount: 2000000, percentage: 2.4 }
    ],
    profitMargin: 27.1
  }
]

function FinancialReportsPage() {
  const [reports] = useState<FinancialReport[]>(mockFinancialReports)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-12')

  const currentReport = reports.find(r => r.period === selectedPeriod) || reports[0]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Financial Reports</h1>
            <p className="text-gray-600">Comprehensive financial performance analysis and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="mofad-btn-primary">
              <Download className="h-4 w-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Period Selector */}
        <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow">
          <Calendar className="h-5 w-5 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Report Period:</span>
          <select
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="2024-12">December 2024</option>
            <option value="2024-11">November 2024</option>
            <option value="2024-Q4">Q4 2024</option>
          </select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-green-600">{formatCurrency(currentReport.revenue)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">{formatCurrency(currentReport.expenses)}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Net Profit</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(currentReport.netProfit)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profit Margin</p>
                <p className="text-2xl font-bold text-purple-600">{formatPercentage(currentReport.profitMargin)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Financial Position */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accounts Receivable</p>
                <p className="text-xl font-bold text-blue-600">{formatCurrency(currentReport.receivables)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Accounts Payable</p>
                <p className="text-xl font-bold text-orange-600">{formatCurrency(currentReport.payables)}</p>
              </div>
              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                <Building className="h-5 w-5 text-orange-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Cash Flow</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(currentReport.cashFlow)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Expense & Revenue Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Expense Breakdown */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Breakdown</h3>
            <div className="space-y-4">
              {currentReport.expenseBreakdown.map((expense, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-red-500 rounded"></div>
                      <div>
                        <p className="font-medium text-gray-900">{expense.category}</p>
                        <p className="text-sm text-gray-500">{formatPercentage(expense.percentage)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(expense.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Revenue Breakdown */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Breakdown</h3>
            <div className="space-y-4">
              {currentReport.revenueBreakdown.map((revenue, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded"></div>
                      <div>
                        <p className="font-medium text-gray-900">{revenue.source}</p>
                        <p className="text-sm text-gray-500">{formatPercentage(revenue.percentage)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(revenue.amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Profit & Loss Statement */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profit & Loss Statement</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">Total Revenue</span>
              <span className="font-bold text-green-600">{formatCurrency(currentReport.revenue)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-900">Cost of Goods Sold</span>
              <span className="font-bold text-red-600">-{formatCurrency(currentReport.expenseBreakdown[0].amount)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-200">
              <span className="font-medium text-gray-900">Gross Profit</span>
              <span className="font-bold text-primary-600">{formatCurrency(currentReport.revenue - currentReport.expenseBreakdown[0].amount)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-900">Operating Expenses</span>
              <span className="font-bold text-red-600">-{formatCurrency(currentReport.expenses - currentReport.expenseBreakdown[0].amount)}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 bg-primary-50 px-4 -mx-4 rounded">
              <span className="font-bold text-gray-900">Net Profit</span>
              <span className="font-bold text-primary-600 text-lg">{formatCurrency(currentReport.netProfit)}</span>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default FinancialReportsPage