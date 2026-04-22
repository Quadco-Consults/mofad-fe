// Auth Types
export interface EntityAccessSummary {
  has_all_warehouse_access: boolean
  has_all_substore_access: boolean
  has_all_lubebay_access: boolean
  warehouse_count: number | 'All'
  substore_count: number | 'All'
  lubebay_count: number | 'All'
}

export interface AccessibleEntity {
  id: number
  name: string
  code: string
}

export interface User {
  id: number
  name?: string
  first_name?: string
  last_name?: string
  full_name?: string
  email: string
  email_verified_at?: string
  phone?: string
  role?: string
  department?: string
  employee_id?: string
  is_active?: boolean
  is_staff?: boolean
  created_at: string
  updated_at: string
  date_joined?: string
  avatar?: string
  signature?: string
  bio?: string

  // Entity access (from UserSerializer)
  entity_access?: EntityAccessSummary

  // Detailed entity access (from UserDetailedSerializer)
  has_all_warehouse_access?: boolean
  has_all_substore_access?: boolean
  has_all_lubebay_access?: boolean
  accessible_warehouses?: AccessibleEntity[]
  accessible_substores?: AccessibleEntity[]
  accessible_lubebays?: AccessibleEntity[]

  // Legacy Laravel fields (deprecated)
  permissions?: Permission[]
  roles?: Role[]
}

export interface Role {
  id: number
  name: string
  guard_name: string
  permissions?: Permission[]
}

export interface Permission {
  id: number
  name: string
  guard_name: string
}

// Core Business Types
export interface Product {
  id: number
  product_name: string
  product_code: string
  cost_price: number
  price: number
  unit: string
  created_at: string
  updated_at: string
}

export interface Customer {
  id: number
  customer_name: string
  customer_code: string
  customer_type_id: number
  customer_type?: CustomerType
  phone: string
  email?: string
  address?: string
  credit_limit: number
  balance: number
  state_id?: number
  state?: State
  created_at: string
  updated_at: string
  // Optional properties for different API response formats
  name?: string
  business_name?: string
  customer_type_name?: string
}

export interface CustomerType {
  id: number
  customer_type_name: string
  created_at: string
  updated_at: string
}

export interface State {
  id: number
  state_name: string
  created_at: string
  updated_at: string
}

export interface Warehouse {
  id: number
  warehouse_name: string
  warehouse_code: string
  location?: string
  state_id?: number
  state?: State
  created_at: string
  updated_at: string
}

export interface Substore {
  id: number
  substore_name: string
  substore_code: string
  customer_id: number
  customer?: Customer
  state_id: number
  state?: State
  account?: Account
  created_at: string
  updated_at: string
}

export interface Lubebay {
  id: number
  lubebay_name: string
  lubebay_code: string
  substore_id: number
  substore?: Substore
  state_id: number
  state?: State
  account?: Account
  created_at: string
  updated_at: string
}

export interface Account {
  id: number
  account_name: string
  account_code: string
  account_type: 'STATION_SUBSTORE' | 'LUBEBAY_SUBSTORE' | 'LUBEBAY'
  balance: number
  entity_id: number
  created_at: string
  updated_at: string
}

// Order Management Types
export interface Prf {
  id: number
  prf_number: string
  customer_id: number
  customer?: Customer
  warehouse_id: number
  warehouse?: Warehouse
  total_amount: number
  order_snapshot: PrfItem[]
  status: PrfStatus
  approval?: Approval
  payment_status: PaymentStatus
  created_by: number
  created_at: string
  updated_at: string
}

export interface PrfItem {
  product_id: number
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export interface Pro {
  id: number
  pro_number: string
  warehouse_id: number
  warehouse?: Warehouse
  total_amount: number
  order_snapshot: ProItem[]
  status: ProStatus
  approval?: Approval
  created_by: number
  created_at: string
  updated_at: string
}

export interface ProItem {
  product_id: number
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

// Transaction Types
export interface SubstoreTransaction {
  id: number
  sst_number: string
  substore_id: number
  substore?: Substore
  transaction_snapshot: TransactionItem[]
  total_amount: number
  status: TransactionStatus
  approval?: Approval
  transaction_date: string
  created_by: number
  created_at: string
  updated_at: string
}

export interface LubebayServiceTransaction {
  id: number
  lst_number: string
  lubebay_id: number
  lubebay?: Lubebay
  transaction_snapshot: ServiceItem[]
  total_amount: number
  status: TransactionStatus
  approval?: Approval
  transaction_date: string
  created_by: number
  created_at: string
  updated_at: string
}

export interface TransactionItem {
  product_id: number
  product_code: string
  product_name: string
  quantity: number
  unit_price: number
  total: number
}

export interface ServiceItem {
  service_id: number
  service_code: string
  service_name: string
  quantity: number
  unit_price: number
  total: number
}

export interface CustomerTransaction {
  id: number
  customer_id: number
  customer?: Customer
  transaction_type: 'PAYMENT' | 'DEBIT' | 'CREDIT'
  amount: number
  reference: string
  description?: string
  prf_id?: number
  prf?: Prf
  status: TransactionStatus
  approval?: Approval
  created_by: number
  created_at: string
  updated_at: string
}

export interface AccountTransaction {
  id: number
  account_id: number
  account?: Account
  transaction_type: 'LODGEMENT' | 'WITHDRAWAL' | 'TRANSFER'
  amount: number
  reference: string
  description?: string
  status: TransactionStatus
  approval?: Approval
  created_by: number
  created_at: string
  updated_at: string
}

// Approval System
export interface Approval {
  id: number
  approval_number: string
  entity_type: 'PRF' | 'PRO' | 'SST' | 'LST' | 'CUSTOMER_TRANSACTION' | 'ACCOUNT_TRANSACTION'
  entity_id: number
  current_level: number
  required_level: number
  status: ApprovalStatus
  l0_approved_by?: number
  l0_approved_at?: string
  l1_approved_by?: number
  l1_approved_at?: string
  l2_approved_by?: number
  l2_approved_at?: string
  l3_approved_by?: number
  l3_approved_at?: string
  l4_approved_by?: number
  l4_approved_at?: string
  l5_approved_by?: number
  l5_approved_at?: string
  created_at: string
  updated_at: string
}

// Inventory Types
export interface WarehouseInventory {
  id: number
  warehouse_id: number
  warehouse?: Warehouse
  product_id: number
  product?: Product
  quantity: number
  last_updated: string
  created_at: string
  updated_at: string
}

export interface SubstoreInventory {
  id: number
  substore_id: number
  substore?: Substore
  product_id: number
  product?: Product
  quantity: number
  last_updated: string
  created_at: string
  updated_at: string
}

export interface StockTransaction {
  id: number
  warehouse_id: number
  warehouse?: Warehouse
  product_id: number
  product?: Product
  transaction_type: 'RECEIVE' | 'ISSUE' | 'ADJUSTMENT' | 'TRANSFER'
  quantity: number
  balance_after: number
  reference: string
  description?: string
  created_by: number
  created_at: string
  updated_at: string
}

// Expense Management
export interface Expense {
  id: number
  expense_type_id: number
  expense_type?: ExpenseType
  amount: number
  description: string
  date: string
  created_by: number
  created_at: string
  updated_at: string
}

export interface ExpenseType {
  id: number
  expense_type_name: string
  created_at: string
  updated_at: string
}

// Status Enums
export type PrfStatus =
  | 'INITIATED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED_NOT_COLLECTED'
  | 'APPROVED_COLLECTED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'REVERSED'

export type ProStatus =
  | 'INITIATED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'RECEIVED'
  | 'CANCELLED'
  | 'REVERSED'

export type TransactionStatus =
  | 'INITIATED'
  | 'AWAITING_APPROVAL'
  | 'APPROVED'
  | 'CONFIRMED'
  | 'CANCELLED'
  | 'REVERSED'

export type ApprovalStatus =
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'CANCELLED'

export type PaymentStatus =
  | 'UNPAID'
  | 'PARTIALLY_PAID'
  | 'FULLY_PAID'
  | 'OVERPAID'

// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  status: 'success' | 'error'
}

export interface PaginatedResponse<T = any> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number
  to: number
}

// Dashboard Analytics Types
export interface DashboardStats {
  total_sales_ytd: number
  total_orders: number
  pending_approvals: number
  low_stock_items: number
  substore_count: number
  lubebay_count: number
  customer_count: number
}

export interface SalesAnalytics {
  daily_sales: Array<{
    date: string
    sales: number
    orders: number
  }>
  product_performance: Array<{
    product_name: string
    quantity_sold: number
    revenue: number
    profit: number
  }>
  channel_performance: {
    direct_sales: number
    substore_sales: number
    lubebay_sales: number
  }
  state_performance: Array<{
    state_name: string
    sales: number
    profit: number
  }>
}

// Form Types
export interface CreatePrfForm {
  customer_id: number
  warehouse_id: number
  items: Array<{
    product_id: number
    quantity: number
    unit_price: number
  }>
}

export interface CreateCustomerForm {
  customer_name: string
  customer_code: string
  customer_type_id: number
  phone: string
  email?: string
  address?: string
  credit_limit: number
  state_id?: number
}

export interface LoginForm {
  email: string
  password: string
  remember?: boolean
}

// Filter Types
export interface DateRange {
  start_date: string
  end_date: string
}

export interface TransactionFilters extends DateRange {
  status?: TransactionStatus
  customer_id?: number
  substore_id?: number
  lubebay_id?: number
  product_id?: number
  state_id?: number
}
// Payment Voucher Types
export type PaymentVoucherStatus = 
  | 'draft'
  | 'finance_review'
  | 'cfo_approval'
  | 'md_approval'
  | 'approved'
  | 'paid'
  | 'rejected'
  | 'cancelled'

export type PaymentMethod = 
  | 'bank_transfer'
  | 'cheque'
  | 'cash'
  | 'mobile_money'

export interface AccountingEntry {
  id?: number
  payment_voucher?: number
  gl_code: string
  gl_code_description?: string | null
  entry_type: 'debit' | 'credit'
  amount: string
  debit_amount?: string
  credit_amount?: string
  display_order: number
  created_at?: string
  updated_at?: string
}

export interface PaymentVoucher {
  id: number
  voucher_number: string
  memo: number
  memo_number?: string
  memo_title?: string
  memo_supplier_name?: string

  // Payee details
  payee_name: string
  payee_bank_name?: string | null
  payee_account_number?: string | null
  payee_account_name?: string | null

  // Payment details
  payment_method: PaymentMethod
  amount: string
  payment_reference?: string | null
  payment_date?: string | null

  // Description
  description: string
  notes?: string | null

  // Status
  status: PaymentVoucherStatus

  // Approval workflow
  created_by?: number
  created_by_name?: string | null

  finance_reviewed_by?: number | null
  finance_reviewed_by_name?: string | null
  finance_reviewed_at?: string | null
  finance_comments?: string | null

  cfo_approved_by?: number | null
  cfo_approved_by_name?: string | null
  cfo_approved_at?: string | null
  cfo_comments?: string | null

  md_approved_by?: number | null
  md_approved_by_name?: string | null
  md_approved_at?: string | null
  md_comments?: string | null

  paid_by?: number | null
  paid_by_name?: string | null
  paid_at?: string | null

  rejected_by?: number | null
  rejected_by_name?: string | null
  rejected_at?: string | null
  rejection_reason?: string | null

  // Accounting entries
  accounting_entries?: AccountingEntry[]

  // Computed properties
  is_approved?: boolean
  is_paid?: boolean
  is_pending?: boolean
  approval_progress?: number

  // Attachments
  attachments?: string[]

  // Timestamps
  created_at: string
  updated_at: string
}

export interface PaymentVoucherListItem {
  id: number
  voucher_number: string
  memo: number
  memo_number?: string
  memo_title?: string
  payee_name: string
  amount: string
  payment_method: PaymentMethod
  status: PaymentVoucherStatus
  is_paid?: boolean
  approval_progress?: number
  created_by_name?: string | null
  created_at: string
  payment_date?: string | null
}

export interface CreatePaymentVoucherForm {
  memo: number
  payee_name: string
  payee_bank_name?: string
  payee_account_number?: string
  payee_account_name?: string
  payment_method: PaymentMethod
  amount: number | string
  description: string
  notes?: string
  accounting_entries?: Omit<AccountingEntry, 'id' | 'payment_voucher' | 'created_at' | 'updated_at'>[]
}

export interface PaymentConfirmationForm {
  payment_reference: string
  payment_date: string
  notes?: string
}

export interface ApprovalActionForm {
  comments?: string
}

export interface RejectionForm {
  reason: string
}

export interface PaymentVoucherStats {
  total: number
  by_status: {
    draft: number
    pending: number
    approved: number
    paid: number
    rejected: number
    cancelled: number
  }
  total_amount: number
  pending_amount: number
}
