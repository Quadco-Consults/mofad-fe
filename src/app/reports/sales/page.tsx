'use client'

import { useState } from 'react'
import { Download, Filter, Calendar, TrendingUp, TrendingDown, DollarSign, Users, Package, Eye } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface SalesReport {
  id: string
  period: string
  totalSales: number
  numberOfOrders: number
  uniqueCustomers: number
  averageOrderValue: number
  topProducts: Array<{ name: string; quantity: number; revenue: number }>
  topCustomers: Array<{ name: string; orders: number; revenue: number }>
  channelBreakdown: Array<{ channel: string; sales: number; percentage: number }>
  growthRate: number
  currency: string
}

const mockSalesReports: SalesReport[] = [
  {
    id: '1',
    period: '2024-12',
    totalSales: 85000000,
    numberOfOrders: 245,
    uniqueCustomers: 89,
    averageOrderValue: 346939,
    topProducts: [
      { name: 'Mobil Super 3000 5W-40', quantity: 1250, revenue: 12500000 },
      { name: 'Shell Helix Ultra 0W-20', quantity: 980, revenue: 9800000 },
      { name: 'Total Quartz 9000 5W-30', quantity: 850, revenue: 8500000 },
      { name: 'Castrol GTX 20W-50', quantity: 720, revenue: 7200000 },
      { name: 'Mobil Delvac 15W-40', quantity: 600, revenue: 7800000 }
    ],
    topCustomers: [
      { name: 'Conoil Petroleum Ltd', orders: 15, revenue: 18500000 },
      { name: 'MRS Oil Nigeria Plc', orders: 12, revenue: 14200000 },
      { name: 'Oando Marketing Plc', orders: 10, revenue: 12800000 },
      { name: 'Total Nigeria Plc', orders: 8, revenue: 9600000 },
      { name: 'Forte Oil Marketing Ltd', orders: 7, revenue: 8400000 }
    ],
    channelBreakdown: [
      { channel: 'Direct Sales', sales: 45000000, percentage: 52.9 },
      { channel: 'Substores', sales: 28000000, percentage: 32.9 },
      { channel: 'Lubebays', sales: 12000000, percentage: 14.1 }
    ],
    growthRate: 12.5,
    currency: 'NGN'
  },
  {
    id: '2',
    period: '2024-11',
    totalSales: 75500000,
    numberOfOrders: 198,
    uniqueCustomers: 76,
    averageOrderValue: 381313,
    topProducts: [
      { name: 'Shell Helix Ultra 0W-20', quantity: 1100, revenue: 11000000 },
      { name: 'Mobil Super 3000 5W-40', quantity: 980, revenue: 9800000 },
      { name: 'Total Quartz 9000 5W-30', quantity: 750, revenue: 7500000 },
      { name: 'Valvoline MaxLife 10W-40', quantity: 650, revenue: 6500000 },
      { name: 'Castrol GTX 20W-50', quantity: 580, revenue: 5800000 }
    ],
    topCustomers: [
      { name: 'MRS Oil Nigeria Plc', orders: 14, revenue: 16800000 },
      { name: 'Conoil Petroleum Ltd', orders: 11, revenue: 13200000 },
      { name: 'Total Nigeria Plc', orders: 9, revenue: 10800000 },
      { name: 'Oando Marketing Plc', orders: 8, revenue: 9600000 },
      { name: 'AA Rano Stations Ltd', orders: 6, revenue: 7200000 }
    ],
    channelBreakdown: [
      { channel: 'Direct Sales', sales: 40000000, percentage: 53.0 },
      { channel: 'Substores', sales: 24000000, percentage: 31.8 },
      { channel: 'Lubebays', sales: 11500000, percentage: 15.2 }
    ],
    growthRate: 8.3,
    currency: 'NGN'
  },
  {
    id: '3',
    period: '2024-Q4',
    totalSales: 248000000,
    numberOfOrders: 712,
    uniqueCustomers: 156,
    averageOrderValue: 348315,
    topProducts: [
      { name: 'Mobil Super 3000 5W-40', quantity: 3850, revenue: 38500000 },
      { name: 'Shell Helix Ultra 0W-20', quantity: 3250, revenue: 32500000 },
      { name: 'Total Quartz 9000 5W-30', quantity: 2680, revenue: 26800000 },
      { name: 'Castrol GTX 20W-50', quantity: 2150, revenue: 21500000 },
      { name: 'Mobil Delvac 15W-40', quantity: 1980, revenue: 25740000 }
    ],
    topCustomers: [
      { name: 'Conoil Petroleum Ltd', orders: 42, revenue: 50400000 },
      { name: 'MRS Oil Nigeria Plc', orders: 38, revenue: 45600000 },
      { name: 'Oando Marketing Plc', orders: 28, revenue: 33600000 },
      { name: 'Total Nigeria Plc', orders: 24, revenue: 28800000 },
      { name: 'Forte Oil Marketing Ltd', orders: 22, revenue: 26400000 }
    ],
    channelBreakdown: [
      { channel: 'Direct Sales', sales: 132000000, percentage: 53.2 },
      { channel: 'Substores', sales: 78000000, percentage: 31.5 },
      { channel: 'Lubebays', sales: 38000000, percentage: 15.3 }
    ],
    growthRate: 15.7,
    currency: 'NGN'
  }
]

function SalesReportsPage() {
  const [reports] = useState<SalesReport[]>(mockSalesReports)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('2024-12')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedReport, setSelectedReport] = useState<SalesReport | null>(null)

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

  const getGrowthIcon = (rate: number) => {
    return rate >= 0
      ? <TrendingUp className="h-4 w-4 text-green-600" />
      : <TrendingDown className="h-4 w-4 text-red-600" />
  }

  const getGrowthColor = (rate: number) => {
    return rate >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const handleViewDetails = (report: SalesReport) => {
    setSelectedReport(report)
    setShowDetailModal(true)
  }

  const generateReport = () => {
    console.log('Generating sales report for period:', selectedPeriod)
  }

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-gray-600">Comprehensive sales performance analytics and insights</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
            <Button className="mofad-btn-primary" onClick={generateReport}>
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
            <option value="2024-Q3">Q3 2024</option>
            <option value="2024">Year 2024</option>
          </select>
          <Button variant="outline" onClick={() => handleViewDetails(currentReport)}>
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(currentReport.totalSales)}</p>
                <div className="flex items-center mt-1">
                  {getGrowthIcon(currentReport.growthRate)}
                  <span className={`text-sm ml-1 ${getGrowthColor(currentReport.growthRate)}`}>
                    {formatPercentage(currentReport.growthRate)}
                  </span>
                </div>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Number of Orders</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(currentReport.numberOfOrders)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Unique Customers</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(currentReport.uniqueCustomers)}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Average Order Value</p>
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(currentReport.averageOrderValue)}</p>
              </div>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
            <div className="space-y-4">
              {currentReport.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500">{formatNumber(product.quantity)} units</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Customers */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Customers</h3>
            <div className="space-y-4">
              {currentReport.topCustomers.map((customer, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <span className="text-green-600 font-medium text-sm">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{customer.name}</p>
                        <p className="text-sm text-gray-500">{customer.orders} orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(customer.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sales Channel Breakdown */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sales by Channel</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {currentReport.channelBreakdown.map((channel, index) => (
              <div key={index} className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary-600">
                        {formatPercentage(channel.percentage)}
                      </div>
                      <div className="text-xs text-gray-500">{channel.channel}</div>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {formatCurrency(channel.sales)}
                </div>
                <div className="text-sm text-gray-600">{channel.channel}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Historical Comparison */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Historical Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Period</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Total Sales</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Orders</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Customers</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Avg Order</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Growth</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.id} className="border-b border-gray-100">
                    <td className="py-3 px-4 font-medium text-gray-900">{report.period}</td>
                    <td className="py-3 px-4">{formatCurrency(report.totalSales)}</td>
                    <td className="py-3 px-4">{formatNumber(report.numberOfOrders)}</td>
                    <td className="py-3 px-4">{formatNumber(report.uniqueCustomers)}</td>
                    <td className="py-3 px-4">{formatCurrency(report.averageOrderValue)}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        {getGrowthIcon(report.growthRate)}
                        <span className={`ml-1 ${getGrowthColor(report.growthRate)}`}>
                          {formatPercentage(report.growthRate)}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(report)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Report Modal */}
        {showDetailModal && selectedReport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold mb-6">Detailed Sales Report - {selectedReport.period}</h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-primary-50 rounded-lg">
                  <div className="text-2xl font-bold text-primary-600">{formatCurrency(selectedReport.totalSales)}</div>
                  <div className="text-sm text-primary-700">Total Sales</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(selectedReport.numberOfOrders)}</div>
                  <div className="text-sm text-blue-700">Orders</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{formatNumber(selectedReport.uniqueCustomers)}</div>
                  <div className="text-sm text-green-700">Customers</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{formatCurrency(selectedReport.averageOrderValue)}</div>
                  <div className="text-sm text-purple-700">Avg Order</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Product Performance</h4>
                  <div className="space-y-2">
                    {selectedReport.topProducts.map((product, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{product.name}</span>
                        <span className="font-medium">{formatCurrency(product.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Customer Performance</h4>
                  <div className="space-y-2">
                    {selectedReport.topCustomers.map((customer, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span>{customer.name}</span>
                        <span className="font-medium">{formatCurrency(customer.revenue)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-6">
                <Button variant="outline" onClick={() => setShowDetailModal(false)}>Close</Button>
                <Button className="mofad-btn-primary">Export Detail</Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  )
}

export default SalesReportsPage