// Export all constants from a single entry point
export * from './routes'
export * from './api-endpoints'

// Common status constants
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

// Payment method constants
export const PAYMENT_METHODS = {
  CASH: 'cash',
  POS: 'pos',
  BANK_TRANSFER: 'bank_transfer',
} as const

// Transaction types
export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  LUBRICANT_SALES: 'lubricant_sales',
  SERVICES: 'services',
} as const
