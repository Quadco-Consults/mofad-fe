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
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Label } from '@/components/ui/Label'
import { Checkbox } from '@/components/ui/Checkbox'
import { useToast } from '@/components/ui/Toast'
import apiClient from '@/lib/apiClient'

interface Service {
  id: number
  name: string
  code: string
  base_price: string
  tax_rate: string
  tax_inclusive: boolean
}

interface PricingDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  service?: Service
  onSuccess: () => void
}

interface PricingFormData {
  base_price: string
  tax_rate: string
  tax_inclusive: boolean
}

export default function PricingDialog({
  open,
  onOpenChange,
  service,
  onSuccess,
}: PricingDialogProps) {
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PricingFormData>()

  const basePrice = watch('base_price')
  const taxRate = watch('tax_rate')
  const taxInclusive = watch('tax_inclusive')

  // Calculate final price
  const calculateFinalPrice = () => {
    if (!basePrice || !taxRate) return 0
    const base = parseFloat(basePrice)
    const rate = parseFloat(taxRate)

    if (taxInclusive) {
      return base
    }

    return base * (1 + rate / 100)
  }

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      reset({
        base_price: service.base_price,
        tax_rate: service.tax_rate,
        tax_inclusive: service.tax_inclusive,
      })
    }
  }, [service, reset])

  const mutation = useMutation({
    mutationFn: async (data: PricingFormData) => {
      if (!service) return

      return await apiClient.post(`/services/${service.id}/update-pricing/`, {
        base_price: parseFloat(data.base_price),
        tax_rate: parseFloat(data.tax_rate),
        tax_inclusive: data.tax_inclusive,
      })
    },
    onSuccess: () => {
      addToast({
        type: 'success',
        title: 'Pricing updated successfully'
      })
      onSuccess()
    },
    onError: (error: Error) => {
      addToast({
        type: 'error',
        title: error.message || 'Failed to update pricing'
      })
    },
  })

  const onSubmit = (data: PricingFormData) => {
    mutation.mutate(data)
  }

  if (!service) return null

  const finalPrice = calculateFinalPrice()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Update Service Pricing</DialogTitle>
          <DialogDescription>
            Update pricing for <strong>{service.name}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              {...register('tax_rate', {
                min: { value: 0, message: 'Tax rate must be positive' },
                max: { value: 100, message: 'Tax rate cannot exceed 100%' },
              })}
              placeholder="7.5"
            />
            {errors.tax_rate && (
              <p className="text-sm text-red-500">{errors.tax_rate.message}</p>
            )}
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

          {/* Price Preview */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Base Price:</span>
              <span className="font-medium">
                ₦{parseFloat(basePrice || '0').toLocaleString('en-NG', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax Rate:</span>
              <span className="font-medium">{taxRate || '0'}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax Inclusive:</span>
              <span className="font-medium">{taxInclusive ? 'Yes' : 'No'}</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <div className="flex justify-between">
                <span className="font-semibold">Final Price:</span>
                <span className="font-bold text-lg">
                  ₦{finalPrice.toLocaleString('en-NG', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
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
              {mutation.isPending ? 'Updating...' : 'Update Pricing'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
