'use client'

import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import apiClient from '@/lib/apiClient'
import {
  Store,
  MapPin,
  Phone,
  Mail,
  TrendingUp,
  Wallet,
  AlertCircle,
  Eye,
  Search,
  Filter as FilterIcon,
  Loader2,
  Plus
} from 'lucide-react'

interface Lubebay {
  id: number
  name: string
  code: string
  address: string | null
  state: { id: number; name: string } | null
  location: { id: number; name: string } | null
  phone: string | null
  email: string | null
  manager: { id: number; name: string } | null
  current_balance: number
  is_active: boolean
  warehouse: { id: number; name: string } | null
  created_at: string
}

export default function LubebaysListPage() {
  const router = useRouter()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Fetch lubebays
  const { data: lubebaysData, isLoading, error } = useQuery({
    queryKey: ['lubebays', searchTerm, statusFilter],
    queryFn: () => apiClient.getLubebays({
      search: searchTerm || undefined,
      is_active: statusFilter === 'all' ? undefined : statusFilter === 'active'
    }),
    refetchOnWindowFocus: false,
  })

  const lubebays: Lubebay[] = Array.isArray(lubebaysData) ? lubebaysData : []

  // Filter lubebays
  const filteredLubebays = lubebays.filter(lubebay => {
    const matchesSearch = !searchTerm ||
      lubebay.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lubebay.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lubebay.address?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === 'all' ||
      (statusFilter === 'active' && lubebay.is_active) ||
      (statusFilter === 'inactive' && !lubebay.is_active)

    return matchesSearch && matchesStatus
  })

  const handleLubebayClick = (lubebayId: number) => {
    router.push(`/lubebays/${lubebayId}`)
  }

  const getStatusBadge = (isActive: boolean) => {
    return isActive ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800 font-medium">
        Active
      </span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-800 font-medium">
        Inactive
      </span>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0
    }).format(amount)
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Lubebays</h1>
            <p className="mt-2 text-sm text-gray-600">
              Manage lubebay service stations and track their operations
            </p>
          </div>
          <button
            onClick={() => router.push('/lubebays/create')}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Lubebay
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Lubebays</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">{lubebays.length}</p>
              </div>
              <div className="p-3 bg-indigo-100 rounded-full">
                <Store className="h-8 w-8 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Locations</p>
                <p className="mt-2 text-3xl font-bold text-green-600">
                  {lubebays.filter(l => l.is_active).length}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="mt-2 text-3xl font-bold text-gray-900">
                  {formatCurrency(lubebays.reduce((sum, l) => sum + Number(l.current_balance), 0))}
                </p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <Wallet className="h-8 w-8 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search lubebays..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>

            <div className="relative">
              <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="pl-10 w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
            <span className="ml-3 text-gray-600">Loading lubebays...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-red-600 mr-3" />
              <p className="text-sm text-red-800">
                Failed to load lubebays. Please try again.
              </p>
            </div>
          </div>
        )}

        {/* Lubebays Grid */}
        {!isLoading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLubebays.map((lubebay) => (
              <div
                key={lubebay.id}
                onClick={() => handleLubebayClick(lubebay.id)}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-lg transition-all cursor-pointer group"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {lubebay.name}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">{lubebay.code}</p>
                  </div>
                  {getStatusBadge(lubebay.is_active)}
                </div>

                {/* Location */}
                {lubebay.address && (
                  <div className="flex items-start mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-gray-600 line-clamp-2">{lubebay.address}</p>
                  </div>
                )}

                {/* State */}
                {lubebay.state && (
                  <div className="flex items-center mb-3">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-sm text-gray-600">{lubebay.state.name}</p>
                  </div>
                )}

                {/* Contact */}
                <div className="space-y-2 mb-4">
                  {lubebay.phone && (
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-600">{lubebay.phone}</p>
                    </div>
                  )}
                  {lubebay.email && (
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-sm text-gray-600">{lubebay.email}</p>
                    </div>
                  )}
                </div>

                {/* Balance */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Balance</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {formatCurrency(Number(lubebay.current_balance))}
                    </span>
                  </div>
                </div>

                {/* View Details */}
                <div className="mt-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleLubebayClick(lubebay.id)
                    }}
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && filteredLubebays.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Store className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No lubebays found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || statusFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Get started by creating a new lubebay'}
            </p>
          </div>
        )}
      </div>
    </AppLayout>
  )
}
