'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Power, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Pagination } from '@/components/ui/Pagination'
import ServiceFormDialog from './ServiceFormDialog'
import PricingDialog from './PricingDialog'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'

interface Service {
  id: number
  name: string
  code: string
  category: string
  base_price: string
  tax_rate: string
  tax_inclusive: boolean
  is_active: boolean
  description?: string
}

export default function CarWashServicesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [pricingService, setPricingService] = useState<Service | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Fetch car wash services with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['services', 'car_wash', statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params: Record<string, string> = {
        category: 'car_wash',
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
  const totalCount = data?.count || 0
  const totalPages = Math.ceil(totalCount / pageSize)

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
          ? 'Service deactivated successfully'
          : 'Service activated successfully'
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

  const calculatePriceAfterTax = (service: Service) => {
    const basePrice = parseFloat(service.base_price)
    const taxRate = parseFloat(service.tax_rate || '0')

    if (service.tax_inclusive) {
      return basePrice
    }

    return basePrice * (1 + taxRate / 100)
  }

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
    <div className="space-y-4">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search car wash services..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={handleFilterChange(setStatusFilter)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="true">Active</SelectItem>
              <SelectItem value="false">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Car Wash Service
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900">Car Wash Services</h3>
        <p className="text-sm text-blue-700 mt-1">
          Manage car wash services offered at your lubebays. These services include basic washes,
          premium detailing, and specialized cleaning packages.
        </p>
      </div>

      {/* Services Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Base Price</TableHead>
              <TableHead className="text-right">Price After Tax</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Loading car wash services...
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No car wash services found
                </TableCell>
              </TableRow>
            ) : (
              services.map((service: Service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-gray-600">{service.code}</TableCell>
                  <TableCell className="text-right">
                    ₦{parseFloat(service.base_price).toLocaleString('en-NG', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    ₦{calculatePriceAfterTax(service).toLocaleString('en-NG', {
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
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingService(service)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setPricingService(service)}
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
              ))
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
        onSuccess={() => {
          setIsCreateDialogOpen(false)
          queryClient.invalidateQueries({ queryKey: ['services'] })
        }}
      />

      <ServiceFormDialog
        open={!!editingService}
        onOpenChange={(open) => !open && setEditingService(null)}
        service={editingService || undefined}
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
