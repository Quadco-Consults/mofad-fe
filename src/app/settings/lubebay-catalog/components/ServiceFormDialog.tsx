'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useMutation } from '@tanstack/react-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/Checkbox'
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

interface ServiceFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service
  onSuccess: () => void
}

interface ServiceFormData {
  name: string
  code: string
  category: string
  base_price: string
  tax_rate: string
  tax_inclusive: boolean
  description: string
}

const CATEGORY_CHOICES = [
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

export default function ServiceFormDialog({
  open,
  onOpenChange,
  service,
  onSuccess,
}: ServiceFormDialogProps) {
  const isEditing = !!service
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ServiceFormData>({
    defaultValues: {
      name: '',
      code: '',
      category: 'oil_change',
      base_price: '0.00',
      tax_rate: '7.5',
      tax_inclusive: false,
      description: '',
    },
  })

  const category = watch('category')
  const taxInclusive = watch('tax_inclusive')

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      reset({
        name: service.name,
        code: service.code,
        category: service.category,
        base_price: service.base_price,
        tax_rate: service.tax_rate,
        tax_inclusive: service.tax_inclusive,
        description: service.description || '',
      })
    } else {
      reset({
        name: '',
        code: '',
        category: 'oil_change',
        base_price: '0.00',
        tax_rate: '7.5',
        tax_inclusive: false,
        description: '',
      })
    }
  }, [service, reset])

  const mutation = useMutation({
    mutationFn: async (data: ServiceFormData) => {
      const payload = {
        ...data,
        is_active: true,
      }

      if (isEditing) {
        return await apiClient.put(`/services/${service.id}/`, payload)
      } else {
        return await apiClient.post('/services/', payload)
      }
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: isEditing
          ? 'Service updated successfully'
          : 'Service created successfully'
      })
      onSuccess()
      reset()
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: error.message || 'Failed to save service'
      })
    },
  })

  const onSubmit = (data: ServiceFormData) => {
    mutation.mutate(data)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Service' : 'Create New Service'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update the service details below'
              : 'Add a new service to your lubebay catalog'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {/* Service Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Service Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                {...register('name', { required: 'Service name is required' })}
                placeholder="e.g., Oil Change Sedan"
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            {/* Service Code */}
            <div className="space-y-2">
              <Label htmlFor="code">
                Service Code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                {...register('code', { required: 'Service code is required' })}
                placeholder="e.g., OIL-CHANGE-SEDAN"
              />
              {errors.code && (
                <p className="text-sm text-red-500">{errors.code.message}</p>
              )}
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">
              Category <span className="text-red-500">*</span>
            </Label>
            <Select value={category} onValueChange={(value) => setValue('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_CHOICES.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Base Price */}
            <div className="space-y-2">
              <Label htmlFor="base_price">
                Base Price (₦) <span className="text-red-500">*</span>
              </Label>
              <Input
                id="base_price"
                type="number"
                step="0.01"
                {...register('base_price', {
                  required: 'Base price is required',
                  min: { value: 0, message: 'Price must be positive' },
                })}
                placeholder="0.00"
              />
              {errors.base_price && (
                <p className="text-sm text-red-500">{errors.base_price.message}</p>
              )}
            </div>

            {/* Tax Rate */}
            <div className="space-y-2">
              <Label htmlFor="tax_rate">Tax Rate (%)</Label>
              <Input
                id="tax_rate"
                type="number"
                step="0.01"
                {...register('tax_rate')}
                placeholder="7.5"
              />
            </div>
          </div>

          {/* Tax Inclusive Checkbox */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="tax_inclusive"
              checked={taxInclusive}
              onCheckedChange={(checked) =>
                setValue('tax_inclusive', checked as boolean)
              }
            />
            <Label
              htmlFor="tax_inclusive"
              className="text-sm font-normal cursor-pointer"
            >
              Price is tax inclusive
            </Label>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              placeholder="Optional service description"
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending
                ? isEditing
                  ? 'Updating...'
                  : 'Creating...'
                : isEditing
                ? 'Update Service'
                : 'Create Service'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
