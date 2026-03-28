'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import { ArrowLeft, Calendar, CreditCard, Package, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { AppLayout } from '@/components/layout/AppLayout'

export default function LubebayTransactionDetailPage() {
  const params = useParams()
  const router = useRouter()
  const transactionId = params.transactionId as string

  // Fetch transaction details
  const { data: transaction, isLoading, error } = useQuery({
    queryKey: ['lubebay-transaction', transactionId],
    queryFn: async () => {
      const response = await apiClient.get(`/lubebay-service-transactions/${transactionId}/`)
      return response
    },
    enabled: !!transactionId
  })

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2
    }).format(amount)
  }

  // Format date
  const formatDateTime = (dateString: string) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  // Get payment method label
  const getPaymentMethodLabel = (method: string) => {
    const methods: Record<string, string> = {
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'pos': 'POS',
      'mobile': 'Mobile Payment'
    }
    return methods[method] || method
  }

  // Get transaction type label
  const getTransactionTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      'services': 'Service Revenue',
      'lubricant_sales': 'Lubricant Sales'
    }
    return types[type] || type
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'awaiting_confirmation': 'bg-blue-100 text-blue-800',
      'confirmed': 'bg-green-100 text-green-800',
      'rejected': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading transaction details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error || !transaction) {
    return (
      <div className="container mx-auto p-6">
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-red-600">
              <p className="font-semibold">Error loading transaction</p>
              <p className="text-sm mt-2">The transaction could not be found or there was an error loading it.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header with Back Button */}
        <div className="mb-6">
          <Button
            onClick={() => router.back()}
            variant="outline"
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lubebay
          </Button>
          <h1 className="text-3xl font-bold">Transaction Details</h1>
          <p className="text-muted-foreground mt-1">
            View complete details of this transaction
          </p>
        </div>

      {/* Transaction Header Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Transaction Number</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{transaction.transaction_number || 'N/A'}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Lubebay</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xl font-bold">{transaction.lubebay_name || 'N/A'}</p>
            <p className="text-sm text-muted-foreground">{transaction.lubebay_code || ''}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Amount</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-primary">{formatCurrency(transaction.total_amount || 0)}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(transaction.approval_status)}`}>
              {transaction.approval_status?.replace('_', ' ').toUpperCase() || 'N/A'}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Transaction Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Type</p>
                <p className="text-base font-semibold">{getTransactionTypeLabel(transaction.transaction_type)}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Payment Method</p>
                <p className="text-base font-semibold">{getPaymentMethodLabel(transaction.payment_method)}</p>
                {transaction.bank_reference && (
                  <p className="text-sm text-muted-foreground">Ref: {transaction.bank_reference}</p>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Transaction Date</p>
                <p className="text-base font-semibold">{formatDateTime(transaction.created_datetime)}</p>
              </div>
            </div>

            {transaction.created_by_name && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created By</p>
                  <p className="text-base font-semibold">{transaction.created_by_name}</p>
                </div>
              </div>
            )}

            {transaction.confirmed_by_name && (
              <div className="flex items-start gap-3">
                <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Confirmed By</p>
                  <p className="text-base font-semibold">{transaction.confirmed_by_name}</p>
                  <p className="text-sm text-muted-foreground">{formatDateTime(transaction.confirmed_at)}</p>
                </div>
              </div>
            )}

            {transaction.comment && (
              <div className="flex items-start gap-3 col-span-full">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Comment</p>
                  <p className="text-base">{transaction.comment}</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Items/Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {transaction.transaction_type === 'lubricant_sales' ? 'Products Sold' : 'Services Provided'}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {transaction.items?.length || 0} item{transaction.items?.length !== 1 ? 's' : ''} in this transaction
          </p>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-y">
                <tr>
                  <th className="text-left py-3 px-4 font-medium">#</th>
                  <th className="text-left py-3 px-4 font-medium">
                    {transaction.transaction_type === 'lubricant_sales' ? 'Product' : 'Service'}
                  </th>
                  <th className="text-left py-3 px-4 font-medium">Code</th>
                  <th className="text-right py-3 px-4 font-medium">Quantity</th>
                  <th className="text-right py-3 px-4 font-medium">Unit Price</th>
                  <th className="text-right py-3 px-4 font-medium">Total Price</th>
                  {transaction.items?.some((item: any) => item.notes) && (
                    <th className="text-left py-3 px-4 font-medium">Notes</th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {transaction.items && transaction.items.length > 0 ? (
                  transaction.items.map((item: any, index: number) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      <td className="py-3 px-4 text-muted-foreground">{index + 1}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium">{item.item_name || item.service_name || item.product_name || 'N/A'}</div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">
                        {item.service_code || item.product_code || '-'}
                      </td>
                      <td className="py-3 px-4 text-right font-medium">{item.quantity || 0}</td>
                      <td className="py-3 px-4 text-right">{formatCurrency(item.unit_price || 0)}</td>
                      <td className="py-3 px-4 text-right font-bold text-primary">
                        {formatCurrency(item.total_price || 0)}
                      </td>
                      {transaction.items?.some((i: any) => i.notes) && (
                        <td className="py-3 px-4 text-sm text-muted-foreground">
                          {item.notes || '-'}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="text-orange-600 font-semibold">
                        Data Integrity Issue
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        This transaction has a total amount of {formatCurrency(transaction.total_amount || 0)} but no line items.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        This appears to be test/corrupted data. Please contact support to clean up this transaction.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
              {transaction.items && transaction.items.length > 0 && (
                <tfoot className="bg-gray-50 border-t-2">
                  <tr>
                    <td colSpan={5} className="py-4 px-4 text-right font-bold text-lg">
                      Grand Total:
                    </td>
                    <td className="py-4 px-4 text-right font-bold text-2xl text-primary">
                      {formatCurrency(transaction.total_amount || 0)}
                    </td>
                    {transaction.items?.some((item: any) => item.notes) && <td></td>}
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  )
}
