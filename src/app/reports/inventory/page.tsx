'use client'

import { useState } from 'react'
import { Download, Filter, Calendar, Package, AlertTriangle, TrendingUp, Warehouse } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { AppLayout } from '@/components/layout/AppLayout'

interface InventoryReport {
  id: string
  period: string
  totalValue: number
  totalQuantity: number
  lowStockItems: number
  outOfStockItems: number
  topMovingProducts: Array<{ name: string; moved: number; revenue: number }>
  slowMovingProducts: Array<{ name: string; daysInStock: number; quantity: number }>
  warehouseBreakdown: Array<{ name: string; value: number; percentage: number }>
  turnoverRate: number
}

const mockInventoryReports: InventoryReport[] = [
  {
    id: '1',
    period: '2024-12',
    totalValue: 185000000,
    totalQuantity: 15420,
    lowStockItems: 8,
    outOfStockItems: 3,
    topMovingProducts: [
      { name: 'Mobil Super 3000 5W-40', moved: 1250, revenue: 12500000 },
      { name: 'Shell Helix Ultra 0W-20', moved: 980, revenue: 9800000 },
      { name: 'Total Quartz 9000 5W-30', moved: 850, revenue: 8500000 }
    ],
    slowMovingProducts: [
      { name: 'Valvoline Premium 20W-50', daysInStock: 180, quantity: 45 },
      { name: 'Castrol Magnatec 5W-30', daysInStock: 160, quantity: 32 },
      { name: 'Shell Rotella T4 15W-40', daysInStock: 145, quantity: 28 }
    ],
    warehouseBreakdown: [
      { name: 'Lagos Main Warehouse', value: 95000000, percentage: 51.4 },
      { name: 'Abuja Warehouse', value: 45000000, percentage: 24.3 },
      { name: 'Port Harcourt Warehouse', value: 30000000, percentage: 16.2 },
      { name: 'Kano Warehouse', value: 15000000, percentage: 8.1 }
    ],
    turnoverRate: 6.8
  }
]

function InventoryReportsPage() {
  const [reports] = useState<InventoryReport[]>(mockInventoryReports)
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

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Inventory Reports</h1>
            <p className="text-gray-600">Comprehensive inventory analysis and stock management insights</p>
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
                <p className="text-sm text-gray-600">Total Inventory Value</p>
                <p className="text-2xl font-bold text-primary-600">{formatCurrency(currentReport.totalValue)}</p>
              </div>
              <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-primary-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Quantity</p>
                <p className="text-2xl font-bold text-blue-600">{formatNumber(currentReport.totalQuantity)}</p>
              </div>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Warehouse className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Stock Items</p>
                <p className="text-2xl font-bold text-yellow-600">{currentReport.lowStockItems}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="mofad-card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Turnover Rate</p>
                <p className="text-2xl font-bold text-green-600">{currentReport.turnoverRate}x</p>
              </div>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fast Moving Products */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Fast Moving Products</h3>
            <div className="space-y-4">
              {currentReport.topMovingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{formatNumber(product.moved)} units moved</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency(product.revenue)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Slow Moving Products */}
          <div className="mofad-card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Slow Moving Products</h3>
            <div className="space-y-4">
              {currentReport.slowMovingProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.quantity} units remaining</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-red-600">{product.daysInStock} days</p>
                    <p className="text-xs text-gray-500">in stock</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Warehouse Breakdown */}
        <div className="mofad-card">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Inventory by Warehouse</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {currentReport.warehouseBreakdown.map((warehouse, index) => (
              <div key={index} className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-lg font-bold text-primary-600">
                        {warehouse.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-lg font-bold text-gray-900 mb-1">
                  {formatCurrency(warehouse.value)}
                </div>
                <div className="text-sm text-gray-600">{warehouse.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  )
}

export default InventoryReportsPage