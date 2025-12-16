'use client'

import { useState } from 'react'
import { Download, Filter, Calendar, Users, DollarSign, TrendingUp, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface CustomerReport {
  id: string
  period: string
  totalCustomers: number
  activeCustomers: number
  newCustomers: number
  customerRetention: number
  averageOrderValue: number
  totalRevenue: number
  topCustomers: Array<{ name: string; type: string; orders: number; revenue: number; growth: number }>
  customersByType: Array<{ type: string; count: number; revenue: number; percentage: number }>
  customerGrowth: Array<{ month: string; newCustomers: number; churned: number; net: number }>
  loyaltyMetrics: { averageOrderValue: number; repeatPurchaseRate: number; customerLifetimeValue: number }
}

const mockCustomerReports: CustomerReport[] = [
  {
    id: '1',
    period: '2024-12',
    totalCustomers: 234,
    activeCustomers: 189,
    newCustomers: 15,
    customerRetention: 87.5,
    averageOrderValue: 346939,
    totalRevenue: 85000000,
    topCustomers: [
      { name: 'Conoil Petroleum Ltd', type: 'Major Oil Marketing', orders: 15, revenue: 18500000, growth: 12.5 },
      { name: 'MRS Oil Nigeria Plc', type: 'Major Oil Marketing', orders: 12, revenue: 14200000, growth: 8.3 },
      { name: 'Oando Marketing Plc', type: 'Major Oil Marketing', orders: 10, revenue: 12800000, growth: 15.2 },
      { name: 'Total Nigeria Plc', type: 'Major Oil Marketing', orders: 8, revenue: 9600000, growth: 6.8 },
      { name: 'Lagos State Transport', type: 'Government Agency', orders: 7, revenue: 8400000, growth: 22.1 }
    ],
    customersByType: [
      { type: 'Major Oil Marketing Companies', count: 12, revenue: 45000000, percentage: 52.9 },
      { type: 'Independent Fuel Retailers', count: 89, revenue: 25000000, percentage: 29.4 },
      { type: 'Fleet Operators', count: 45, revenue: 10000000, percentage: 11.8 },
      { type: 'Government Agencies', count: 18, revenue: 5000000, percentage: 5.9 }
    ],
    customerGrowth: [
      { month: 'Oct', newCustomers: 12, churned: 3, net: 9 },
      { month: 'Nov', newCustomers: 18, churned: 5, net: 13 },
      { month: 'Dec', newCustomers: 15, churned: 2, net: 13 }
    ],
    loyaltyMetrics: {
      averageOrderValue: 346939,
      repeatPurchaseRate: 68.5,
      customerLifetimeValue: 2450000
    }
  }
]

function CustomerReportsPage() {
  const [reports] = useState<CustomerReport[]>(mockCustomerReports)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-12')

  const currentReport = reports.find(r => r.period === selectedPeriod) || reports[0]

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG').format(num)
  }

  const formatPercentage = (num: number) => {
    return `${num.toFixed(1)}%`
  }

  const getGrowthColor = (rate: number) => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600'
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customer Reports</h1>
            <p className="text-gray-600">Comprehensive customer analytics and behavior insights</p>
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
                <p className="text-sm text-gray-600">Total Customers</p>
                <p className="text-2xl font-bold text-primary-600">{formatNumber(currentReport.totalCustomers)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(currentReport.activeCustomers)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Retention</p>
                <p className="text-2xl font-bold text-blue-600">{formatPercentage(currentReport.customerRetention)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Star className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer Revenue</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(currentReport.totalRevenue)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Customer Loyalty Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="mofad-card">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Average Order Value</h4>
            <p className="text-2xl font-bold text-primary-600">{formatCurrency(currentReport.loyaltyMetrics.averageOrderValue)}</p>
          </div>
          <div className="mofad-card">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Repeat Purchase Rate</h4>
            <p className="text-2xl font-bold text-green-600">{formatPercentage(currentReport.loyaltyMetrics.repeatPurchaseRate)}</p>
          </div>
          <div className="mofad-card">
            <h4 className="text-sm font-medium text-gray-600 mb-2">Customer Lifetime Value</h4>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(currentReport.loyaltyMetrics.customerLifetimeValue)}</p>
          </div>
        </div>

        {/* Top Customers */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Performing Customers</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customer</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Orders</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Revenue</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Growth</th>
                </tr>
              </thead>
              <tbody>
                {currentReport.topCustomers.map((customer, index) => (
                  <tr key={index} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
                        </div>
                        <div className="font-medium text-gray-900">{customer.name}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{customer.type}</td>
                    <td className="py-3 px-4 font-medium">{customer.orders}</td>
                    <td className="py-3 px-4 font-bold text-primary-600">{formatCurrency(customer.revenue)}</td>
                    <td className="py-3 px-4">
                      <span className={`font-medium ${getGrowthColor(customer.growth)}`}>
                        {customer.growth >= 0 ? '+' : ''}{formatPercentage(customer.growth)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Customer Segmentation */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Customers by Type */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customers by Type</h3>
            <div className="space-y-4">
              {currentReport.customersByType.map((type, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-primary-500 rounded"></div>
                      <div>
                        <p className="font-medium text-gray-900">{type.type}</p>
                        <p className="text-sm text-gray-500">{type.count} customers • {formatPercentage(type.percentage)}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(type.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Growth Trend */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Growth Trend</h3>
            <div className="space-y-4">
              {currentReport.customerGrowth.map((growth, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{growth.month} 2024</p>
                    <p className="text-sm text-gray-500">
                      +{growth.newCustomers} new, -{growth.churned} churned
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold text-lg ${getGrowthColor(growth.net)}`}>
                      {growth.net >= 0 ? '+' : ''}{growth.net}
                    </p>
                    <p className="text-xs text-gray-500">net growth</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Customer Insights */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Insights</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatNumber(currentReport.newCustomers)}</div>
              <div className="text-sm text-green-700">New Customers This Period</div>
              <div className="text-xs text-gray-600 mt-1">25% increase from last month</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600 mb-2">{formatPercentage(80.5)}</div>
              <div className="text-sm text-blue-700">Customer Satisfaction</div>
              <div className="text-xs text-gray-600 mt-1">Based on surveys & feedback</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600 mb-2">4.2</div>
              <div className="text-sm text-purple-700">Average Rating</div>
              <div className="text-xs text-gray-600 mt-1">From customer reviews</div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default CustomerReportsPage