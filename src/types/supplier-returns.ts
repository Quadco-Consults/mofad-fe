export type ReturnType =
  | 'damaged'
  | 'leakage'
  | 'expired'
  | 'wrong_product'
  | 'quality_issue'
  | 'short_delivery'
  | 'other'

export type ReturnSource = 'grn' | 'stock'

export type ResolutionType = 'replacement' | 'refund' | 'credit_note'

export type SRNStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'rejected'
  | 'awaiting_pickup'
  | 'picked_up'
  | 'replacement_pending'
  | 'replacement_received'
  | 'refund_requested'
  | 'refunded'
  | 'closed'
  | 'cancelled'

export type PackagingCondition =
  | 'excellent'
  | 'good'
  | 'fair'
  | 'poor'
  | 'damaged'
  | 'leaking'
  | 'destroyed'

export interface DamagePhoto {
  url: string
  uploaded_at: string
}

export interface SRNItem {
  id: number
  product: number
  product_name: string
  product_sku: string
  product_unit: string
  pro_item?: number
  grn_item?: number
  quantity_returned: string
  batch_number?: string
  manufacturing_date?: string
  expiry_date?: string
  unit_cost: string
  total_value: string
  defect_description: string
  damage_photos: DamagePhoto[]
  packaging_condition?: PackagingCondition
  inventory_adjusted: boolean
  inventory_adjustment_date?: string
  stock_transaction?: number
  replaced: boolean
  replacement_quantity: string
  replacement_grn_item?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface SupplierReturnNote {
  id: number
  srn_number: string
  title: string
  pro: number
  pro_number: string
  grn?: number
  grn_number?: string
  warehouse: number
  warehouse_name: string
  supplier: string
  supplier_contact?: string
  supplier_email?: string
  supplier_phone?: string
  return_type: ReturnType
  description: string
  return_source: ReturnSource
  status: SRNStatus
  resolution_type: ResolutionType
  total_quantity: string
  total_return_value: string
  debit_note_number?: string
  debit_note_generated: boolean
  debit_note_date?: string
  refund_amount: string
  refund_date?: string
  refund_reference?: string
  pickup_scheduled_date?: string
  pickup_contact_person?: string
  pickup_phone?: string
  picked_up_date?: string
  picked_up_by?: string
  pickup_vehicle_number?: string
  pickup_notes?: string
  replacement_expected_date?: string
  replacement_received_date?: string
  replacement_grn?: number
  created_by: number
  created_by_name: string
  approved_by?: number
  approved_by_name?: string
  rejected_by?: number
  rejected_by_name?: string
  notes?: string
  rejection_reason?: string
  created_at: string
  updated_at: string
  submitted_at?: string
  approved_at?: string
  rejected_at?: string
  closed_at?: string
  items: SRNItem[]
  items_count: number
  can_approve: boolean
  can_reject: boolean
  can_pickup: boolean
}

export interface SRNCreateData {
  title: string
  pro_id: number
  grn_id?: number
  warehouse_id: number
  return_type: ReturnType
  description: string
  return_source: ReturnSource
  resolution_type: ResolutionType
  pickup_scheduled_date?: string
  replacement_expected_date?: string
  notes?: string
  items: SRNItemCreateData[]
}

export interface SRNItemCreateData {
  product_id: number
  quantity_returned: string | number
  unit_cost: string | number
  defect_description: string
  packaging_condition?: PackagingCondition
  batch_number?: string
  manufacturing_date?: string
  expiry_date?: string
  notes?: string
  pro_item_id?: number
  grn_item_id?: number
}

export interface SRNApproveData {
  notes?: string
}

export interface SRNRejectData {
  reason: string
}

export interface SRNPickupData {
  pickup_date: string
  picked_up_by: string
  vehicle_number?: string
  notes?: string
}

export interface SRNReplacementData {
  grn_id: number
  notes?: string
}

export interface SRNRefundData {
  amount: string | number
  refund_date: string
  reference?: string
}

export interface SRNStats {
  total_returns: number
  total_value: number
  pending_approval: number
  approved: number
  completed: number
  by_return_type: Array<{
    return_type: ReturnType
    count: number
    total_value: number
  }>
  recent_returns: SupplierReturnNote[]
}

// Helper functions
export const getReturnTypeLabel = (type: ReturnType): string => {
  const labels: Record<ReturnType, string> = {
    damaged: 'Damaged Goods',
    leakage: 'Leakage',
    expired: 'Expired Products',
    wrong_product: 'Wrong Product',
    quality_issue: 'Quality Issue',
    short_delivery: 'Short Delivery',
    other: 'Other',
  }
  return labels[type]
}

export const getStatusLabel = (status: SRNStatus): string => {
  const labels: Record<SRNStatus, string> = {
    draft: 'Draft',
    pending_approval: 'Pending Approval',
    approved: 'Approved',
    rejected: 'Rejected',
    awaiting_pickup: 'Awaiting Pickup',
    picked_up: 'Picked Up',
    replacement_pending: 'Replacement Pending',
    replacement_received: 'Replacement Received',
    refund_requested: 'Refund Requested',
    refunded: 'Refunded',
    closed: 'Closed',
    cancelled: 'Cancelled',
  }
  return labels[status]
}

export const getStatusColor = (status: SRNStatus): string => {
  const colors: Record<SRNStatus, string> = {
    draft: 'bg-gray-100 text-gray-800',
    pending_approval: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-blue-100 text-blue-800',
    rejected: 'bg-red-100 text-red-800',
    awaiting_pickup: 'bg-orange-100 text-orange-800',
    picked_up: 'bg-purple-100 text-purple-800',
    replacement_pending: 'bg-indigo-100 text-indigo-800',
    replacement_received: 'bg-green-100 text-green-800',
    refund_requested: 'bg-pink-100 text-pink-800',
    refunded: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
    cancelled: 'bg-red-100 text-red-800',
  }
  return colors[status]
}

export const getResolutionTypeLabel = (type: ResolutionType): string => {
  const labels: Record<ResolutionType, string> = {
    replacement: 'Replacement',
    refund: 'Refund',
    credit_note: 'Credit Note',
  }
  return labels[type]
}
