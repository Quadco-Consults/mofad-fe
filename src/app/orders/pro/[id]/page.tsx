'use client'

import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useRouter, useParams } from 'next/navigation'
import { AppLayout } from '@/components/layout/AppLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import apiClient from '@/lib/apiClient'
import { formatCurrency, formatDateTime } from '@/lib/utils'
import {
  ArrowLeft,
  Download,
  Printer,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  Truck,
  Package,
  Building,
  User,
  Calendar,
  MapPin,
  Phone,
  Mail,
  Hash,
  DollarSign,
  Edit,
  RefreshCw,
  Send,
  CreditCard,
  ShoppingCart,
  ClipboardList
} from 'lucide-react'

interface PROItem {
  id?: number
  product_id: string | number
  product_name: string
  product_code?: string
  product_price?: string | number
  product_quantity?: string | number
  quantity?: number
  unit_price?: number
  total_price?: number
  received_quantity?: number
  notes?: string
}

interface PRO {
  id: number
  pro_number: string
  title?: string | null
  description?: string | null
  supplier?: string | null
  supplier_id?: number
  supplier_name?: string
  supplier_contact?: string | null
  supplier_address?: string
  supplier_phone?: string | null
  supplier_email?: string | null
  delivery_address?: string | null
  prf?: number | null
  prf_id?: number
  prf_number?: string
  status: 'draft' | 'sent' | 'confirmed' | 'delivered' | 'cancelled'
  delivery_status: 'pending' | 'partial' | 'completed'
  total_amount: string | number
  subtotal?: string | number
  tax_amount?: string | number
  discount_amount?: string | number
  shipping_cost?: number
  discount?: number
  grand_total?: number
  payment_terms?: string | null
  payment_method?: string | null
  delivery_terms?: string
  expected_delivery_date?: string | null
  expected_delivery?: string
  actual_delivery?: string
  delivered_at?: string | null
  created_by?: string | null
  created_by_name?: string | null
  approved_by?: string | null
  approved_by_name?: string | null
  approved_at?: string
  confirmed_at?: string | null
  sent_at?: string | null
  notes?: string | null
  terms_conditions?: string | null
  items: PROItem[]
  items_count?: number
  order_snapshot?: PROItem[]
  warehouse_id?: number
  po_number?: string | null
  transaction_id?: string | null
  approval_status?: string
  created_at: string
  updated_at?: string
}

const getStatusConfig = (status: string) => {
  const configs: Record<string, { color: string; bg: string; icon: React.ReactNode; label: string }> = {
    draft: {
      color: 'text-gray-700',
      bg: 'bg-gray-100 border-gray-300',
      icon: <Clock className="w-4 h-4" />,
      label: 'DRAFT'
    },
    sent: {
      color: 'text-amber-700',
      bg: 'bg-amber-100 border-amber-300',
      icon: <Send className="w-4 h-4" />,
      label: 'SENT TO SUPPLIER'
    },
    confirmed: {
      color: 'text-blue-700',
      bg: 'bg-blue-100 border-blue-300',
      icon: <CheckCircle className="w-4 h-4" />,
      label: 'CONFIRMED'
    },
    delivered: {
      color: 'text-emerald-700',
      bg: 'bg-emerald-100 border-emerald-300',
      icon: <Package className="w-4 h-4" />,
      label: 'DELIVERED'
    },
    cancelled: {
      color: 'text-red-700',
      bg: 'bg-red-100 border-red-300',
      icon: <XCircle className="w-4 h-4" />,
      label: 'CANCELLED'
    }
  }
  return configs[status] || configs.draft
}

const getDeliveryConfig = (status: string) => {
  const configs: Record<string, { color: string; bg: string; label: string }> = {
    pending: { color: 'text-amber-700', bg: 'bg-amber-50', label: 'Pending' },
    partial: { color: 'text-orange-700', bg: 'bg-orange-50', label: 'Partial' },
    completed: { color: 'text-emerald-700', bg: 'bg-emerald-50', label: 'Completed' }
  }
  return configs[status] || configs.pending
}

export default function PRODetailPage() {
  const router = useRouter()
  const params = useParams()
  const printRef = useRef<HTMLDivElement>(null)
  const proId = parseInt(params.id as string)

  const { data: pro, isLoading, error, refetch } = useQuery({
    queryKey: ['pro-detail', proId],
    queryFn: async () => {
      return apiClient.getProById(proId)
    },
  })

  const handlePrint = () => {
    window.print()
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-6">
            <div className="flex items-center gap-4">
              <div className="h-10 w-24 bg-gray-200 rounded"></div>
              <div className="h-8 w-64 bg-gray-200 rounded"></div>
            </div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-2 gap-6">
              <div className="h-40 bg-gray-200 rounded-lg"></div>
              <div className="h-40 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </AppLayout>
    )
  }

  if (error || !pro) {
    return (
      <AppLayout>
        <div className="p-6">
          <div className="text-center py-16 bg-gradient-to-br from-red-50 to-orange-50 rounded-2xl border border-red-100">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Purchase Order Not Found</h2>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              The purchase order you're looking for doesn't exist or may have been removed.
            </p>
            <Button onClick={() => router.back()} className="mofad-btn-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </AppLayout>
    )
  }

  const statusConfig = getStatusConfig(pro.status)
  const deliveryConfig = getDeliveryConfig(pro.delivery_status)

  // Normalize items from both PROItem format and legacy order_snapshot format
  const rawItems = pro.items || []
  const items = rawItems.map((item: Record<string, unknown>) => {
    const quantity = Number(item.product_quantity) || Number(item.quantity) || Number(item.qty) || Number(item.ordered_quantity) || 0
    const unitPrice = Number(item.product_price) || Number(item.unit_price) || Number(item.price) || Number(item.cost) || 0
    return {
      id: item.id || item.product_id || Math.random(),
      product_id: item.product_id || item.product || item.id,
      product_name: item.product_name || item.name || item.product || 'Unknown Product',
      product_code: item.product_code || item.code || '',
      quantity,
      unit_price: unitPrice,
      total_price: Number(item.total_price) || Number(item.total) || (quantity * unitPrice),
      received_quantity: Number(item.received_quantity) || Number(item.quantity_delivered) || 0,
      notes: item.notes || item.specifications || '',
    }
  })

  const subtotal = items.reduce((sum: number, item: { total_price: number }) => sum + (item.total_price || 0), 0)
  // Use total_amount from API if available, otherwise calculate from subtotal
  const grandTotal = pro.grand_total || Number(pro.total_amount) || (subtotal + Number(pro.tax_amount || 0) + (pro.shipping_cost || 0) - Number(pro.discount_amount || pro.discount || 0))

  return (
    <AppLayout>
      <div className="space-y-6 print:space-y-4" ref={printRef}>
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 print:hidden">
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => router.back()} className="group">
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">Purchase Order</h1>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-bold border-2 ${statusConfig.bg} ${statusConfig.color}`}>
                  {statusConfig.icon}
                  {statusConfig.label}
                </span>
              </div>
              <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Hash className="w-4 h-4" />
                PRO Number: <span className="font-mono font-semibold text-primary">{pro.pro_number}</span>
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => refetch()}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              Print
            </Button>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button className="mofad-btn-primary" onClick={() => router.push(`/orders/pro/${proId}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit Order
            </Button>
          </div>
        </div>

        {/* Print Header */}
        <div className="hidden print:block">
          <div className="mofad-gradient-bg text-white p-6 rounded-lg mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold">PURCHASE ORDER</h1>
                <p className="text-white/80 mt-1">MOFAD Energy Nigeria Limited</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold">{pro.pro_number}</p>
                <p className="text-white/80">Date: {formatDateTime(pro.created_at).split(' ')[0]}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Info Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 print:grid-cols-2 print:gap-4">
          {/* Supplier Info */}
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 print:hidden"></div>
            <CardHeader className="print:py-2">
              <CardTitle className="flex items-center gap-2 text-blue-700">
                <Building className="w-5 h-5" />
                Supplier Information
              </CardTitle>
            </CardHeader>
            <CardContent className="print:py-2">
              <div className="space-y-3">
                <div>
                  <p className="text-xl font-bold text-gray-900">{pro.supplier_name || 'Not specified'}</p>
                </div>
                {pro.supplier_address && (
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600">{pro.supplier_address}</span>
                  </div>
                )}
                {pro.supplier_phone && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{pro.supplier_phone}</span>
                  </div>
                )}
                {pro.supplier_email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{pro.supplier_email}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <Card className="overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-emerald-500 to-teal-500 print:hidden"></div>
            <CardHeader className="print:py-2">
              <CardTitle className="flex items-center gap-2 text-emerald-700">
                <ClipboardList className="w-5 h-5" />
                Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="print:py-2">
              <div className="space-y-3 text-sm">
                {pro.prf_number && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">PRF Reference:</span>
                    <span className="font-mono font-semibold text-primary">{pro.prf_number}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Created By:</span>
                  <span className="font-medium">{pro.created_by_name || pro.created_by || 'System'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Created Date:</span>
                  <span className="font-medium">{formatDateTime(pro.created_at).split(' ')[0]}</span>
                </div>
                {pro.approved_by_name && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Approved By:</span>
                    <span className="font-medium">{pro.approved_by_name}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Delivery Status:</span>
                  <span className={`px-2 py-1 rounded-md text-xs font-medium ${deliveryConfig.bg} ${deliveryConfig.color}`}>
                    {deliveryConfig.label}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Delivery & Payment */}
          <Card className="overflow-hidden lg:col-span-1 print:col-span-2">
            <div className="h-2 bg-gradient-to-r from-amber-500 to-orange-500 print:hidden"></div>
            <CardHeader className="print:py-2">
              <CardTitle className="flex items-center gap-2 text-amber-700">
                <Truck className="w-5 h-5" />
                Delivery & Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="print:py-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Expected Delivery</p>
                  <p className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {pro.expected_delivery ? formatDateTime(pro.expected_delivery).split(' ')[0] : 'TBD'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Payment Terms</p>
                  <p className="font-semibold flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-gray-400" />
                    {pro.payment_terms || 'Net 30'}
                  </p>
                </div>
                {pro.delivery_terms && (
                  <div className="col-span-2">
                    <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Delivery Terms</p>
                    <p className="font-medium">{pro.delivery_terms}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Order Items Table */}
        <Card className="overflow-hidden">
          <div className="h-2 mofad-gradient-bg print:hidden"></div>
          <CardHeader className="print:py-2">
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              Order Items
              <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary text-sm font-medium rounded-full">
                {items.length} item{items.length !== 1 ? 's' : ''}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-y print:bg-gray-100">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">#</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Product</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Qty Ordered</th>
                    <th className="text-center py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Qty Received</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Unit Price</th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700 text-xs uppercase tracking-wide">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-12 text-center">
                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 font-medium">No items in this order</p>
                      </td>
                    </tr>
                  ) : (
                    items.map((item, index) => (
                      <tr key={item.id} className="hover:bg-gray-50 transition-colors print:hover:bg-white">
                        <td className="py-4 px-4 text-gray-500 font-medium">{index + 1}</td>
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-semibold text-gray-900">{item.product_name}</p>
                            {item.product_code && (
                              <p className="text-xs text-gray-500 font-mono">{item.product_code}</p>
                            )}
                            {item.notes && (
                              <p className="text-xs text-gray-400 mt-1">{item.notes}</p>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="font-semibold text-gray-900">{item.quantity.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className={`font-semibold ${
                            (item.received_quantity || 0) >= item.quantity
                              ? 'text-emerald-600'
                              : (item.received_quantity || 0) > 0
                                ? 'text-amber-600'
                                : 'text-gray-400'
                          }`}>
                            {item.received_quantity?.toLocaleString() || 0}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right font-medium">
                          {formatCurrency(item.unit_price)}
                        </td>
                        <td className="py-4 px-4 text-right font-bold text-gray-900">
                          {formatCurrency(item.total_price)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Order Summary */}
            <div className="border-t bg-gradient-to-r from-gray-50 to-white p-6 print:p-4">
              <div className="flex justify-end">
                <div className="w-80 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="font-semibold">{formatCurrency(subtotal)}</span>
                  </div>
                  {Number(pro.tax_amount) > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Tax:</span>
                      <span className="font-medium">{formatCurrency(Number(pro.tax_amount))}</span>
                    </div>
                  )}
                  {pro.shipping_cost && pro.shipping_cost > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Shipping:</span>
                      <span className="font-medium">{formatCurrency(pro.shipping_cost)}</span>
                    </div>
                  )}
                  {(Number(pro.discount_amount) > 0 || (pro.discount && pro.discount > 0)) && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="font-medium text-emerald-600">-{formatCurrency(Number(pro.discount_amount) || pro.discount || 0)}</span>
                    </div>
                  )}
                  <div className="flex justify-between pt-3 border-t-2 border-primary">
                    <span className="text-lg font-bold text-gray-900">Grand Total:</span>
                    <span className="text-xl font-bold text-primary">{formatCurrency(grandTotal)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {pro.notes && (
          <Card>
            <CardHeader className="print:py-2">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-500" />
                Notes & Remarks
              </CardTitle>
            </CardHeader>
            <CardContent className="print:py-2">
              <p className="text-gray-700 whitespace-pre-wrap">{pro.notes}</p>
            </CardContent>
          </Card>
        )}

        {/* Footer for print */}
        <div className="hidden print:block mt-8 pt-4 border-t text-center text-xs text-gray-500">
          <p>This is a computer-generated document. No signature is required.</p>
          <p className="mt-1">MOFAD Energy Nigeria Limited - {formatDateTime(new Date().toISOString())}</p>
        </div>
      </div>
    </AppLayout>
  )
}
