'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Search, Filter, Plus, Edit, Power, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/Select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/Table'
import { Badge } from '@/components/ui/Badge'
import { Pagination } from '@/components/ui/Pagination'
import ServiceFormDialog from './ServiceFormDialog'
import PricingDialog from './PricingDialog'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'

interface FilterService {
  id: number
  name: string
  code: string
  category: string
  base_price: string
  tax_rate: string
  tax_inclusive: boolean
  is_active: boolean
}

export default function FiltersTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<FilterService | null>(null)
  const [pricingService, setPricingService] = useState<FilterService | null>(null)
  const pageSize = 10

  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Fetch filter services (services with category='filter') with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['services', 'filter', statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params: Record<string, string> = {
        category: 'filter',
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      }
      if (statusFilter) params.is_active = statusFilter
      if (searchTerm) params.search = searchTerm

      const response = await apiClient.get('/services/', params)
      return response
    },
  })

  const services = data?.results || []
  const totalCount = data?.paginator?.count || data?.count || 0
  const totalPages = data?.paginator?.total_pages || Math.ceil(totalCount / pageSize)

  // Toggle service status
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: number; is_active: boolean }) => {
      const endpoint = is_active ? 'deactivate' : 'activate'
      return await apiClient.post(`/services/${id}/${endpoint}/`, {})
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] })
      addToast({
        type: 'success',
        title: variables.is_active
          ? 'Filter service deactivated successfully'
          : 'Filter service activated successfully'
      })
    },
    onError: (error) => {
      addToast({
        type: 'error',
        title: 'Failed to update service status'
      })
      console.error(error)
    },
  })

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: string) => void) => (value: string) => {
    setter(value)
    setCurrentPage(1)
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Statistics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Total Filters</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{totalCount}</div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Active Filters</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {services.filter((s: FilterService) => s.is_active).length}
          </div>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <div className="text-sm font-medium text-gray-600">Avg Price</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            ₦{services.length > 0
              ? (
                  services.reduce((sum: number, s: FilterService) => sum + parseFloat(s.base_price), 0) /
                  services.length
                ).toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
              : '0'}
          </div>
        </div>
      </div>

      {/* Header with Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap flex-1">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search filters..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Status:</span>
            <Select value={statusFilter || ''} onValueChange={handleFilterChange(setStatusFilter)}>
              <SelectTrigger className="w-32">
                <SelectItem value="">All</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectTrigger>
            </Select>
          </div>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)} className="whitespace-nowrap">
          <Plus className="h-4 w-4 mr-2" />
          Add Filter Service
        </Button>
      </div>

      {/* Active Filters Display */}
      {(statusFilter || searchTerm) && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-gray-700">Active filters:</span>
          {searchTerm && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setSearchTerm('')}>
              Search: {searchTerm} ×
            </Badge>
          )}
          {statusFilter && (
            <Badge variant="secondary" className="cursor-pointer" onClick={() => setStatusFilter('')}>
              {statusFilter === 'true' ? 'Active' : 'Inactive'} ×
            </Badge>
          )}
          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setCurrentPage(1)
            }}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filters Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Cost Price</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
              <TableHead className="text-right">Price After Tax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading filter services...
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12">
                  <div className="flex flex-col items-center gap-2">
                    <Filter className="h-12 w-12 text-gray-300" />
                    <p className="text-gray-500 font-medium">No filter services found</p>
                    <p className="text-sm text-gray-400">
                      {searchTerm || statusFilter
                        ? 'Try adjusting your filters'
                        : 'Get started by adding your first filter service'}
                    </p>
                    {!searchTerm && !statusFilter && (
                      <Button onClick={() => setIsCreateDialogOpen(true)} className="mt-2">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Filter Service
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              services.map((service: FilterService) => {
                const basePrice = parseFloat(service.base_price)
                const taxRate = parseFloat(service.tax_rate || '0')
                const priceAfterTax = service.tax_inclusive
                  ? basePrice
                  : basePrice * (1 + taxRate / 100)

                return (
                  <TableRow key={service.id}>
                    <TableCell className="font-medium">{service.name}</TableCell>
                    <TableCell className="text-gray-600">{service.code}</TableCell>
                    <TableCell className="text-right text-gray-600">
                      ₦{basePrice.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right">
                      ₦{basePrice.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ₦{priceAfterTax.toLocaleString('en-NG', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={service.is_active ? 'default' : 'secondary'}>
                        {service.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingService(service)}
                          title="Edit filter service"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPricingService(service)}
                          title="Manage pricing"
                        >
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: service.id,
                              is_active: service.is_active,
                            })
                          }
                          title={service.is_active ? 'Deactivate' : 'Activate'}
                        >
                          <Power
                            className={`h-4 w-4 ${
                              service.is_active ? 'text-red-500' : 'text-green-500'
                            }`}
                          />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalCount > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalCount={totalCount}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Dialogs */}
      <ServiceFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        defaultCategory="filter"
        lockCategory={true}
        dialogTitle="Create New Filter"
        dialogDescription="Add a new filter replacement service to your lubebay catalog"
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['services'] })
        }}
      />

      <ServiceFormDialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
        service={editingService || undefined}
        dialogTitle="Edit Filter"
        onSuccess={() => {
          setEditingService(null)
          queryClient.invalidateQueries({ queryKey: ['services'] })
        }}
      />

      <PricingDialog
        open={!!pricingService}
        onOpenChange={(open) => !open && setPricingService(null)}
        service={pricingService || undefined}
        onSuccess={() => {
          setPricingService(null)
          queryClient.invalidateQueries({ queryKey: ['services'] })
        }}
      />
    </div>
  )
}
