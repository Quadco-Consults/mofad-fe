'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import {
  ArrowLeft,
  Calendar,
  Plus,
  Loader2,
  CheckCircle,
  Clock,
  Lock,
  AlertCircle,
  FileText,
  Package,
  TrendingUp,
  Filter as FilterIcon
} from 'lucide-react'
import Link from 'next/link'

export default function LubebayMonthlyInventoryPage() {
  const params = useParams()
  const router = useRouter()
  const queryClient = useQueryClient()
  const lubebayId = params.id as string

  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [selectedStatus, setSelectedStatus] = useState<string>('all')
  const [showInitiateModal, setShowInitiateModal] = useState(false)

  // Fetch lubebay details
  const { data: lubebay } = useQuery({
    queryKey: ['lubebay', lubebayId],
    queryFn: () => apiClient.getLubebay(lubebayId)
  })

  // Fetch monthly inventory snapshots
  const { data: snapshots, isLoading } = useQuery({
    queryKey: ['lubebay-monthly-inventory', lubebayId, selectedYear, selectedStatus],
    queryFn: () => apiClient.getLubebayMonthlyInventorySnapshots(lubebayId, {
      year: selectedYear,
      ...(selectedStatus !== 'all' && { status: selectedStatus })
    })
  })

  // Initiate closing mutation
  const initiateMutation = useMutation({
    mutationFn: (data: { year: number; month: number }) => {
      if (!lubebay?.warehouse) {
        throw new Error('Lubebay must have a warehouse to initiate monthly closing')
      }
      return apiClient.initiateLubebayMonthlyClosing({
        lubebay: Number(lubebayId),
        warehouse: lubebay.warehouse,
        ...data
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lubebay-monthly-inventory'] })
      setShowInitiateModal(false)
    }
  })

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
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
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.bg} ${badge.text}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.label}
      </span>
    )
  }

  const getMonthName = (month: number) => {
    return new Date(2020, month - 1).toLocaleDateString('en-US', { month: 'long' })
  }

  const years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - i)

  return (
    <AppLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center mb-2">
          <button
            onClick={() => router.push(`/channels/lubebays/${lubebayId}`)}
            className="mr-3 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Monthly Inventory Closing</h1>
            <p className="text-sm text-gray-600">{lubebay?.name}</p>
          </div>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Year Filter */}
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                {years.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
              <FilterIcon className="h-4 w-4 text-gray-400" />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="in_progress">In Progress</option>
                <option value="reconciling">Reconciling</option>
                <option value="balanced">Balanced</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          {/* Initiate New Closing Button */}
          <button
            onClick={() => setShowInitiateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Initiate Month-End Closing
          </button>
        </div>
      </div>

      {/* Snapshots List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
          <span className="ml-3 text-gray-600">Loading snapshots...</span>
        </div>
      ) : snapshots?.results?.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No monthly closings found</h3>
          <p className="text-gray-600 mb-6">
            Start by initiating your first month-end closing
          </p>
          <button
            onClick={() => setShowInitiateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Initiate Closing
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {snapshots?.results?.map((snapshot: any) => (
            <Link
              key={snapshot.id}
              href={`/channels/lubebays/${lubebayId}/inventory-closing/${snapshot.id}`}
              className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-5"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {getMonthName(snapshot.month)} {snapshot.year}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {snapshot.snapshot_number}
                  </p>
                </div>
                {getStatusBadge(snapshot.status)}
              </div>

              {/* Stats */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Products</span>
                  <span className="font-medium text-gray-900">
                    {snapshot.total_products_count}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Sales Value</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(snapshot.total_sales_value || 0)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Closing Value</span>
                  <span className="font-semibold text-indigo-600">
                    {formatCurrency(snapshot.total_closing_value || 0)}
                  </span>
                </div>

                {snapshot.is_balanced && (
                  <div className="flex items-center gap-1.5 text-xs text-green-600 bg-green-50 rounded px-2 py-1.5">
                    <CheckCircle className="h-3.5 w-3.5" />
                    <span>Balanced - Zero Variance</span>
                  </div>
                )}

                {snapshot.status === 'closed' && (
                  <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-gray-50 rounded px-2 py-1.5">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Closed on {new Date(snapshot.closed_at).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>Period: {new Date(snapshot.period_start).toLocaleDateString()} - {new Date(snapshot.period_end).toLocaleDateString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Initiate Modal */}
      {showInitiateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Initiate Month-End Closing
            </h3>

            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              initiateMutation.mutate({
                year: Number(formData.get('year')),
                month: Number(formData.get('month'))
              })
            }}>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Year
                  </label>
                  <select
                    name="year"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    defaultValue={new Date().getFullYear()}
                  >
                    {years.map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Month
                  </label>
                  <select
                    name="month"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    defaultValue={new Date().getMonth() + 1}
                  >
                    {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                      <option key={month} value={month}>
                        {getMonthName(month)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowInitiateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={initiateMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={initiateMutation.isPending}
                >
                  {initiateMutation.isPending && (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  )}
                  Initiate Closing
                </button>
              </div>
            </form>

            {initiateMutation.isError && (
              <div className="mt-4 p-3 bg-red-50 rounded-lg">
                <p className="text-sm text-red-600">
                  {(initiateMutation.error as any)?.message || 'Failed to initiate closing'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </AppLayout>
  )
}
