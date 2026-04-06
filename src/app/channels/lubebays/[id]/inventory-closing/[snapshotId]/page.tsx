'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import {
  ArrowLeft,
  Calendar,
  Loader2,
  CheckCircle,
  Clock,
  Lock,
  AlertCircle,
  FileText,
  Package,
  Download,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

export default function MonthlyInventorySnapshotDetailPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const lubebayId = params.id as string
  const snapshotId = params.snapshotId as string

  // Fetch snapshot details
  const { data: snapshot, isLoading } = useQuery({
    queryKey: ['lubebay-monthly-inventory-snapshot', snapshotId],
    queryFn: () => apiClient.getLubebayMonthlyInventorySnapshot(snapshotId)
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-NG', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(num)
  }

  const getStatusBadge = (status: string) => {
    const badges = {
      draft: { bg: 'bg-gray-100', text: 'text-gray-700', icon: FileText, label: 'Draft' },
      in_progress: { bg: 'bg-blue-100', text: 'text-blue-700', icon: Clock, label: 'In Progress' },
      reconciling: { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: AlertCircle, label: 'Reconciling' },
      balanced: { bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle, label: 'Balanced' },
      closed: { bg: 'bg-indigo-100', text: 'text-indigo-700', icon: Lock, label: 'Closed' }
    }

    const badge = badges[status as keyof typeof badges] || badges.draft
    const Icon = badge.icon

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-4 h-4 mr-1.5" />
        {badge.label}
      </span>
    )
  }

  const getMonthName = (month: number) => {
    return new Date(2020, month - 1).toLocaleDateString('en-US', { month: 'long' })
  }

  const downloadReport = () => {
    if (!snapshot) return

    // Generate CSV content
    const csvRows = []

    // Header - Snapshot Information
    csvRows.push(['Monthly Inventory Closing Report'])
    csvRows.push([])
    csvRows.push(['Lubebay:', snapshot.lubebay_name])
    csvRows.push(['Snapshot Number:', snapshot.snapshot_number])
    csvRows.push(['Period:', `${getMonthName(snapshot.month)} ${snapshot.year}`])
    csvRows.push(['Period Dates:', `${new Date(snapshot.period_start).toLocaleDateString()} - ${new Date(snapshot.period_end).toLocaleDateString()}`])
    csvRows.push(['Status:', snapshot.status_display || snapshot.status])
    csvRows.push(['Initiated By:', snapshot.initiated_by_name || 'N/A'])
    csvRows.push(['Initiated At:', new Date(snapshot.initiated_at).toLocaleString()])
    if (snapshot.status === 'closed') {
      csvRows.push(['Closed By:', snapshot.closed_by_name || 'N/A'])
      csvRows.push(['Closed At:', new Date(snapshot.closed_at).toLocaleString()])
    }
    csvRows.push([])

    // Summary
    csvRows.push(['Summary'])
    csvRows.push(['Total Products:', snapshot.total_products_count])
    csvRows.push(['Total Opening Value:', formatCurrency(snapshot.total_opening_value || 0)])
    csvRows.push(['Total Sales Value:', formatCurrency(snapshot.total_sales_value || 0)])
    csvRows.push(['Total Closing Value:', formatCurrency(snapshot.total_closing_value || 0)])
    csvRows.push(['Is Balanced:', snapshot.is_balanced ? 'Yes' : 'No'])
    csvRows.push([])

    // Inventory Items Table
    csvRows.push([
      'Product Code',
      'Product Name',
      'Category',
      'Unit',
      'Opening Qty',
      'Opening Unit Cost',
      'Opening Value',
      'Receipts Qty',
      'Receipts Value',
      'Sales Qty',
      'Sales Value',
      'Adjustments Qty',
      'Adjustments Value',
      'System Closing Qty',
      'System Closing Unit Cost',
      'System Closing Value',
      'Physical Count Qty',
      'Variance Qty',
      'Variance Value',
      'Final Closing Qty',
      'Final Closing Value',
      'Is Balanced'
    ])

    // Add each item
    snapshot.items?.forEach((item: any) => {
      csvRows.push([
        item.product_code || '',
        item.product_name || '',
        item.product_category || '',
        item.product_unit || '',
        item.opening_quantity || 0,
        item.opening_unit_cost || 0,
        item.opening_total_value || 0,
        item.receipts_quantity || 0,
        item.receipts_value || 0,
        item.sales_quantity || 0,
        item.sales_value || 0,
        item.adjustments_quantity || 0,
        item.adjustments_value || 0,
        item.system_closing_quantity || 0,
        item.system_closing_unit_cost || 0,
        item.system_closing_value || 0,
        item.physical_count_quantity ?? '',
        item.variance_quantity ?? '',
        item.variance_value ?? '',
        item.final_closing_quantity || 0,
        item.final_closing_value || 0,
        item.is_balanced ? 'Yes' : 'No'
      ])
    })

    // Convert to CSV string
    const csvContent = csvRows.map(row =>
      row.map(cell => {
        // Escape cells containing commas, quotes, or newlines
        const cellStr = String(cell)
        if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
          return `"${cellStr.replace(/"/g, '""')}"`
        }
        return cellStr
      }).join(',')
    ).join('\n')

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)

    link.setAttribute('href', url)
    link.setAttribute('download', `monthly_inventory_${snapshot.lubebay_code || 'lubebay'}_${snapshot.year}_${String(snapshot.month).padStart(2, '0')}.csv`)
    link.style.visibility = 'hidden'

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-gray-600">Loading snapshot...</span>
        </div>
      </AppLayout>
    )
  }

  if (!snapshot) {
    return (
      <AppLayout>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Snapshot not found</h3>
          <p className="text-gray-600 mb-6">The monthly inventory snapshot you're looking for doesn't exist.</p>
          <button
            onClick={() => router.push(`/channels/lubebays/${lubebayId}/inventory-closing`)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Snapshots
          </button>
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button
              onClick={() => router.push(`/channels/lubebays/${lubebayId}/inventory-closing`)}
              className="mr-3 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {getMonthName(snapshot.month)} {snapshot.year} Closing
              </h1>
              <p className="text-sm text-gray-600">
                {snapshot.lubebay_name} • {snapshot.snapshot_number}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={downloadReport}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Report
            </button>
            {getStatusBadge(snapshot.status)}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{snapshot.total_products_count}</p>
            </div>
            <Package className="h-10 w-10 text-indigo-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Opening Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(snapshot.total_opening_value || 0)}</p>
            </div>
            <FileText className="h-10 w-10 text-blue-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Sales Value</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{formatCurrency(snapshot.total_sales_value || 0)}</p>
            </div>
            <CheckCircle className="h-10 w-10 text-green-600 opacity-20" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Closing Value</p>
              <p className="text-2xl font-bold text-indigo-600 mt-1">{formatCurrency(snapshot.total_closing_value || 0)}</p>
            </div>
            <Lock className="h-10 w-10 text-indigo-600 opacity-20" />
          </div>
        </div>
      </div>

      {/* Period Information */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Period Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Period</p>
            <p className="text-sm font-medium text-gray-900 mt-1">
              {new Date(snapshot.period_start).toLocaleDateString()} - {new Date(snapshot.period_end).toLocaleDateString()}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Initiated By</p>
            <p className="text-sm font-medium text-gray-900 mt-1">{snapshot.initiated_by_name || 'N/A'}</p>
            <p className="text-xs text-gray-500">{new Date(snapshot.initiated_at).toLocaleString()}</p>
          </div>
          {snapshot.status === 'closed' && (
            <div>
              <p className="text-sm text-gray-600">Closed By</p>
              <p className="text-sm font-medium text-gray-900 mt-1">{snapshot.closed_by_name || 'N/A'}</p>
              <p className="text-xs text-gray-500">{new Date(snapshot.closed_at).toLocaleString()}</p>
            </div>
          )}
        </div>
        {snapshot.notes && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-600">Notes</p>
            <p className="text-sm text-gray-900 mt-1">{snapshot.notes}</p>
          </div>
        )}
      </div>

      {/* Inventory Items Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Inventory Items</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Opening Qty
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Receipts
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sales
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Adjustments
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  System Closing
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Physical Count
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Variance
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Final Value
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {snapshot.items?.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-sm text-gray-500">
                    No inventory items found
                  </td>
                </tr>
              ) : (
                snapshot.items?.map((item: any) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.product_name}</div>
                      <div className="text-xs text-gray-500">{item.product_code}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">{formatNumber(item.opening_quantity)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.opening_total_value)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm text-green-600">{formatNumber(item.receipts_quantity)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm text-red-600">-{formatNumber(item.sales_quantity)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.sales_value)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className={`text-sm ${item.adjustments_quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatNumber(item.adjustments_quantity)}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm font-medium text-gray-900">{formatNumber(item.system_closing_quantity)}</div>
                      <div className="text-xs text-gray-500">{formatCurrency(item.system_closing_value)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm text-gray-900">
                        {item.physical_count_quantity !== null ? formatNumber(item.physical_count_quantity) : '-'}
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      {item.variance_quantity !== null && item.variance_quantity !== 0 ? (
                        <div className={`text-sm font-medium ${item.variance_quantity >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatNumber(item.variance_quantity)}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400">-</div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-right">
                      <div className="text-sm font-semibold text-indigo-600">{formatCurrency(item.final_closing_value)}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      {item.is_balanced ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Balanced
                        </span>
                      ) : item.variance_quantity !== null ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <AlertCircle className="w-3 h-3 mr-1" />
                          Variance
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Balanced Status Banner */}
      {snapshot.is_balanced && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
            <div>
              <h4 className="text-sm font-semibold text-green-900">Zero Variance Achieved</h4>
              <p className="text-sm text-green-700 mt-0.5">
                All inventory items are balanced. Physical counts match system closing quantities.
              </p>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  )
}
