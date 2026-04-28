/**
 * Transaction Reversal Types
 *
 * Handles reversal of PRF, PRO, and Lodgement transactions
 * when mistakes are made or corrections are needed.
 */

export type ReversalType = 'standard' | 'manager_approval' | 'admin_override'

export type TransactionType = 'prf' | 'pro' | 'lodgement'

/**
 * PRF Reversal Request Data
 */
export interface PRFReversalRequest {
  reason: string
  authorized_by_id?: number
  force_admin_override?: boolean
  notes?: string
}

/**
 * PRF Reversal Response
 */
export interface PRFReversalResponse {
  message: string
  reversal_type: ReversalType
  reversal_status: string
  goods_return_required: boolean
  prf: any // Will be the full PRF object
}

/**
 * Goods Return Request Data
 */
export interface GoodsReturnRequest {
  notes?: string
}

/**
 * Goods Return Response
 */
export interface GoodsReturnResponse {
  message: string
  reversal_status: string
  goods_return_date: string
  prf: any
}

/**
 * Reversal Status Display Helper
 */
export const getReversalTypeLabel = (type: ReversalType): string => {
  const labels: Record<ReversalType, string> = {
    standard: 'Standard Reversal',
    manager_approval: 'Manager Approval Required',
    admin_override: 'Admin Override',
  }
  return labels[type]
}

/**
 * Reversal Type Badge Color Helper
 */
export const getReversalTypeBadgeColor = (type: ReversalType): string => {
  const colors: Record<ReversalType, string> = {
    standard: 'bg-blue-100 text-blue-800',
    manager_approval: 'bg-yellow-100 text-yellow-800',
    admin_override: 'bg-red-100 text-red-800',
  }
  return colors[type]
}

/**
 * Check if PRF can be reversed based on status
 */
export const canReversePRF = (status: string): boolean => {
  const reversibleStatuses = [
    'approved',
    'payment_pending',
    'payment_confirmed',
    'ready_for_issue',
    'goods_issued',
    'partially_fulfilled',
    'fulfilled',
  ]
  return reversibleStatuses.includes(status)
}

/**
 * Check if PRF requires manager approval for reversal
 */
export const requiresManagerApproval = (status: string): boolean => {
  const managerApprovalStatuses = ['fulfilled', 'partially_fulfilled']
  return managerApprovalStatuses.includes(status)
}

/**
 * Check if goods return is required
 */
export const requiresGoodsReturn = (status: string, goodsIssued: boolean): boolean => {
  return (status === 'fulfilled' || status === 'partially_fulfilled' || goodsIssued)
}
