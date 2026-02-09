'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Power, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
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

const CATEGORY_CHOICES = [
  { value: '', label: 'All Categories' },
  { value: 'oil_change', label: 'Oil Change' },
  { value: 'tire_service', label: 'Tire Service' },
  { value: 'car_wash', label: 'Car Wash' },
  { value: 'battery_service', label: 'Battery Service' },
  { value: 'brake_service', label: 'Brake Service' },
  { value: 'diagnostic', label: 'Diagnostic' },
  { value: 'ac_service', label: 'AC Service' },
  { value: 'commission', label: 'Commission' },
  { value: 'other', label: 'Other' },
]

export default function ServicesTab() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [pricingService, setPricingService] = useState<Service | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const queryClient = useQueryClient()
  const { addToast } = useToast()

  // Fetch services with pagination
  const { data, isLoading } = useQuery({
    queryKey: ['services', categoryFilter, statusFilter, searchTerm, currentPage],
    queryFn: async () => {
      const params: Record<string, string> = {
        page: currentPage.toString(),
        page_size: pageSize.toString(),
      }
      if (categoryFilter) params.category = categoryFilter
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

  const getCategoryLabel = (value: string) => {
    return CATEGORY_CHOICES.find((c) => c.value === value)?.label || value
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
              placeholder="Search services..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10"
            />
          </div>

          {/* Category Filter */}
          <Select value={categoryFilter} onValueChange={handleFilterChange(setCategoryFilter)}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_CHOICES.map((cat) => (
                <SelectItem key={cat.value} value={cat.value}>
                  {cat.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
          Add Service
        </Button>
      </div>

      {/* Services Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Category</TableHead>
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
                  Loading services...
                </TableCell>
              </TableRow>
            ) : services.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No services found
                </TableCell>
              </TableRow>
            ) : (
              services.map((service: Service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="text-gray-600">{service.code}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getCategoryLabel(service.category)}
                    </Badge>
                  </TableCell>
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
